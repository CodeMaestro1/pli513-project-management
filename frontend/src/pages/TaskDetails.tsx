import { X, Clock, Circle, CheckCircle2, Calendar, User, AlertCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import type { Task, TaskComment, TaskStatus } from "@/types/task";
import { statusFriendlyNames, priopirityFriendlyNames } from "@/lib/mappings";
import { formatLocalDate, formatLocalDateTime } from "@/lib/utils";
import { taskService } from "@/services/tasks";
import { userService } from "@/services/users";


interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onStatusChange: (status: Task["status"]) => void;

  /** Optional team display name for human-friendly rendering. */
  teamName?: string;

  /** Optional team member IDs for assignment UI (leader use-case). */
  teamMemberIds?: number[];

  /** When true, the modal enables editing title/description/status/dueDate. */
  canEdit?: boolean;

  /** Notifies parent when a full task update occurred. */
  onTaskUpdated?: (updated: Task) => void;
}

export function TaskDetail({ task, onClose, onStatusChange, canEdit, onTaskUpdated, teamName, teamMemberIds }: TaskDetailProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [userNamesById, setUserNamesById] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status);
  const [editDueDate, setEditDueDate] = useState(formatLocalDate(task.dueDate));
  const [editPriority, setEditPriority] = useState<Task["priority"]>(task.priority);
  const [editAssignedToId, setEditAssignedToId] = useState<number | undefined>(task.assignedToId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);



  // Updated getStatusColor to use TaskStatus
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case "TODO":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "IN_PROGRESS":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "DONE":
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  // Updated getStatusIcon to use TaskStatus
  const getStatusIcon = (status: TaskStatus): React.JSX.Element => {
    switch (status) {
      case "TODO":
        return <Circle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "DONE":
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  // Updated the getStatusLabel function to use TaskStatus directly
  const getStatusLabel = (status: TaskStatus): string => {
    return statusFriendlyNames[status] || "Unknown Status";
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "LOW":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  // Updated getPriorityLabel to use priopirityFriendlyNames
  const getPriorityLabel = (priority: Task["priority"]): string => {
    return priopirityFriendlyNames[priority] || "Unknown Priority";
  };

  const getDisplayName = (id?: number) => {
    if (id == null) return "Unknown";
    return userNamesById[String(id)] ?? `User #${id}`;
  };

  const idsToResolve = useMemo(() => {
    const ids: number[] = [];
    if (typeof task.creatorId === "number") ids.push(task.creatorId);
    if (typeof task.assignedToId === "number") ids.push(task.assignedToId);

    // If we render an assignee dropdown for a team task, resolve display names
    // for the selectable team member IDs too.
    for (const id of teamMemberIds ?? []) {
      if (typeof id === "number") ids.push(id);
    }

    for (const c of comments) {
      if (typeof c.authorId === "number") ids.push(c.authorId);
    }
    return Array.from(new Set(ids)).filter((x) => Number.isFinite(x));
  }, [task.creatorId, task.assignedToId, comments, teamMemberIds]);

  useEffect(() => {
    // Keep edit fields in sync when the selected task changes.
    setIsEditing(false);
    setSaveError(null);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditDueDate(formatLocalDate(task.dueDate));
    setEditPriority(task.priority);
    setEditAssignedToId(task.assignedToId);
  }, [task]);

  useEffect(() => {
    const fetchNames = async () => {
      const missing = idsToResolve.filter((id) => userNamesById[String(id)] == null);
      if (missing.length === 0) return;
      try {
        const res = await userService.getPublicNames(missing);
        const next = { ...userNamesById };
        if (Array.isArray(res)) {
          for (const row of res) {
            const key = String((row as { id: number }).id);
            const name = (row as { displayName: string }).displayName;
            if (key && name) next[key] = name;
          }
        }
        setUserNamesById(next);
      } catch {
        // Non-fatal: keep fallback labels.
      }
    };
    void fetchNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsToResolve]);

  useEffect(() => {
    const loadComments = async () => {
      setCommentsError(null);
      setCommentsLoading(true);
      try {
        const res = await taskService.listComments(task.id);
        setComments(Array.isArray(res) ? (res as TaskComment[]) : []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load comments";
        setCommentsError(msg);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };
    void loadComments();
  }, [task.id]);

  const handleSave = async () => {
    if (!canEdit) return;
    setSaveError(null);
    setSaving(true);
    try {
      const dueDateIso = editDueDate ? `${editDueDate}T00:00:00` : task.dueDate;

      // Personal tasks (no team) keep their existing assignee.
      // Team tasks (leader editing) may change assignee.
      const effectiveAssignedToId = task.teamId ? editAssignedToId : task.assignedToId;

      const updated = await taskService.update(task.id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        dueDate: dueDateIso,
        priority: editPriority,
        teamId: task.teamId,
        assignedToId: effectiveAssignedToId,
      });
      setIsEditing(false);
      onTaskUpdated?.(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save task";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const canEditAssignee = Boolean(canEdit && task.teamId && Array.isArray(teamMemberIds) && teamMemberIds.length > 0);

  const handlePostComment = async () => {
    const message = newComment.trim();
    if (!message) return;
    setCommentsError(null);
    try {
      const created = await taskService.addComment(task.id, { message });
      setComments((prev) => [created as TaskComment, ...prev]);
      setNewComment("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to post comment";
      setCommentsError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col text-left">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl mb-2 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              ) : (
                <h2 className="text-2xl mb-2">{task.title}</h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${getStatusColor(task.status)}`}
              >
                {getStatusIcon(task.status)}
                <span>{getStatusLabel(task.status)}</span>
              </button>
              {showStatusMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                  <button
                    onClick={() => {
                      if (isEditing) setEditStatus("TODO");
                      onStatusChange("TODO");
                      setShowStatusMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Circle className="w-4 h-4 text-slate-500" />
                    To Do
                  </button>
                  <button
                    onClick={() => {
                      if (isEditing) setEditStatus("IN_PROGRESS");
                      onStatusChange("IN_PROGRESS");
                      setShowStatusMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-sky-500" />
                    In Progress
                  </button>
                  <button
                    onClick={() => {
                      if (isEditing) setEditStatus("DONE");
                      onStatusChange("DONE");
                      setShowStatusMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Priority */}
            {isEditing ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700">Priority</span>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Task["priority"])}
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  disabled={!canEdit || saving}
                >
                  <option value="LOW">{getPriorityLabel("LOW")}</option>
                  <option value="MEDIUM">{getPriorityLabel("MEDIUM")}</option>
                  <option value="HIGH">{getPriorityLabel("HIGH")}</option>
                </select>
              </div>
            ) : (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getPriorityColor(task.priority)}`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Priority: {getPriorityLabel(task.priority)}</span>
              </div>
            )}

            {/* Due Date */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500" />
              {isEditing ? (
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="text-sm text-slate-700 bg-transparent border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              ) : (
                <span className="text-sm text-slate-700">Due: {formatLocalDate(task.dueDate)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg mb-3">Description</h3>
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={5}
                className="w-full text-slate-700 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            ) : (
              <p className="text-slate-600 whitespace-pre-wrap">{task.description}</p>
            )}
          </div>

          {/* Task Metadata */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h3 className="text-lg mb-3">Task Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              {task.creatorId && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Created By</p>
                    <p className="text-sm font-medium">{getDisplayName(task.creatorId)}</p>
                  </div>
                </div>
              )}

              {task.assignedToId && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Assigned To</p>
                    {isEditing && canEditAssignee ? (
                      <select
                        value={String(editAssignedToId ?? "")}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!value) {
                            setEditAssignedToId(undefined);
                            return;
                          }
                          const num = Number(value);
                          setEditAssignedToId(Number.isFinite(num) ? num : undefined);
                        }}
                        className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        disabled={!canEdit || saving}
                      >
                        {(teamMemberIds ?? [])
                          .filter((id): id is number => typeof id === "number" && Number.isFinite(id))
                          .map((id) => (
                            <option key={String(id)} value={String(id)}>
                              {getDisplayName(id)}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <p className="text-sm font-medium">{getDisplayName(task.assignedToId)}</p>
                    )}
                  </div>
                </div>
              )}

              {task.teamId && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Team</p>
                    <p className="text-sm font-medium">{teamName || task.teamId}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Created At</p>
                  <p className="text-sm font-medium">{formatLocalDateTime(task.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm font-medium">{formatLocalDateTime(task.updatedAt) || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-lg">Comments</h3>

            {commentsError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {commentsError}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <Button onClick={() => void handlePostComment()} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>

            {commentsLoading ? (
              <div className="text-sm text-slate-500">Loading comments…</div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-slate-500">No comments yet.</div>
            ) : (
              <div className="space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-slate-800">
                        {getDisplayName(c.authorId)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatLocalDateTime(c.createdAt)}
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{c.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="flex justify-end gap-2">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
            {canEdit ? (
              isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                    onClick={() => void handleSave()}
                    disabled={saving || !editTitle.trim() || !editDueDate}
                  >
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Task
                </Button>
              )
            ) : null}
          </div>

          {saveError && (
            <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {saveError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
