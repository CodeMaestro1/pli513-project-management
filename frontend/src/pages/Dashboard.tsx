import { CheckSquare, Users, FolderKanban, Bell, LogOut, Clock, Circle, CheckCircle2, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Task } from "@/types/task";
import { statusFriendlyNames, priopirityFriendlyNames } from "@/lib/mappings";
import { useAuth } from "@/context/AuthContext";
import { taskService } from "@/services/tasks";
import { teamService } from "@/services/teams";
import { userService } from "@/services/users";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import type { TeamApiResponse } from "@/services/teams";

const LazyTaskDetail = React.lazy(() => import("./TaskDetails").then((m) => ({ default: m.TaskDetail })));

interface DashboardProps {
  onProfileClick: () => void;
  onLogout: () => void;
}

// Helper for formatting dates if not already available globally
const formatDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
};

export function Dashboard({ onProfileClick, onLogout }: DashboardProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Local state for initial load loading/error
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [initialError, setInitialError] = useState<string | null>(null);

  // State for tasks is managed here but updated via the hook
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [taskDropdownRect, setTaskDropdownRect] = useState<DOMRect | null>(null);

  const closeTaskDropdown = () => {
    setOpenDropdown(null);
    setTaskDropdownRect(null);
  };

  const getTaskDropdownPosition = (rect: DOMRect) => {
    const menuWidth = 160; // tailwind w-40
    const estimatedMenuHeight = 120;
    const padding = 8;

    let left = rect.right - menuWidth;
    left = Math.min(Math.max(padding, left), window.innerWidth - menuWidth - padding);

    let top = rect.bottom + 8;
    if (top + estimatedMenuHeight > window.innerHeight - padding) {
      top = rect.top - 8 - estimatedMenuHeight;
    }
    top = Math.max(padding, top);

    return { left, top, width: menuWidth };
  };

  useEffect(() => {
    if (!openDropdown) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest(".status-dropdown") && !target.closest(".status-dropdown-portal")) {
        closeTaskDropdown();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closeTaskDropdown();
    };

    const onScrollOrResize = () => closeTaskDropdown();

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [openDropdown]);

  const [taskDueFrom, setTaskDueFrom] = useState<string>("");
  const [taskDueTo, setTaskDueTo] = useState<string>("");

  // Teams assigned to the current user
  const [teams, setTeams] = useState<TeamApiResponse[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamApiResponse | null>(null);
  const [userNamesById, setUserNamesById] = useState<Record<string, string>>({});
  const [teamTasksById, setTeamTasksById] = useState<Record<string, Task[]>>({});

  const currentUserId = user ? Number(user.id) : undefined;

  // Initialize the operations hook
  const {
    error: opError,
    newTask,
    setNewTask,
    showCreateModal: showCreateTaskModal,
    setShowCreateModal: setShowCreateTaskModal,
    createTask: handleCreateTaskHook,
    deleteTask: handleDeleteTaskWrapper,
    updateTaskStatus: handleUpdateTaskStatusWrapper
  } = useTaskOperations(setTasks, currentUserId);

  //Further evaluation for this addition is needed
  // Some browsers localize the empty-date hint (e.g., Greek letters). Defaulting the date avoids that.
  useEffect(() => {
    if (!showCreateTaskModal) return;
    setNewTask((prev) => {
      if (prev.dueDate) return prev;
      const ymd = new Date().toISOString().slice(0, 10);
      return { ...prev, dueDate: ymd };
    });
  }, [showCreateTaskModal, setNewTask]);

  const selectedCreateTeam = useMemo(() => {
    if (!newTask.teamId) return null;
    return teams.find((t) => String(t.id) === String(newTask.teamId)) ?? null;
  }, [newTask.teamId, teams]);

  const isCreateTeamLeader = Boolean(
    selectedCreateTeam && currentUserId != null && Number(selectedCreateTeam.teamLeaderId) === Number(currentUserId)
  );

  useEffect(() => {
    // When creating a team task as leader, resolve names for the team members so the assignee dropdown is correct.
    if (!isAuthenticated) return;
    if (!selectedCreateTeam) return;
    if (!isCreateTeamLeader) return;
    const memberIds = Array.isArray(selectedCreateTeam.memberIds) ? selectedCreateTeam.memberIds : [];
    const ids = memberIds.filter((id): id is number => typeof id === "number" && Number.isFinite(id));
    const missing = ids.filter((id) => userNamesById[String(id)] == null);
    if (missing.length === 0) return;

    const fetchNames = async () => {
      try {
        const res = await userService.getPublicNames(missing);
        if (!Array.isArray(res)) return;
        setUserNamesById((prev) => {
          const next = { ...prev };
          for (const row of res) {
            const key = String((row as { id: number }).id);
            const name = (row as { displayName: string }).displayName;
            if (key && name) next[key] = name;
          }
          return next;
        });
      } catch {
        // Non-fatal: fallback labels will be used.
      }
    };

    void fetchNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedCreateTeam, isCreateTeamLeader]);

  const loadTasks = async () => {
    if (!isAuthenticated) return;
    setInitialLoading(true);
    setInitialError(null);
    try {
      const params: Record<string, string> = {};
      if (taskDueFrom) params.dueFrom = taskDueFrom;
      if (taskDueTo) params.dueTo = taskDueTo;

      const data = await taskService.listMyTasks(Object.keys(params).length ? params : undefined);
      setTasks(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const normalized = (e as { normalized?: { code?: string; message?: string } } | null)?.normalized;
      const message =
        typeof normalized?.message === "string"
          ? normalized.message
          : e instanceof Error
            ? e.message
            : "Failed to load tasks";
      setInitialError(message);
    } finally {
      setInitialLoading(false);
    }
  };

  // Load Tasks (and re-load on filter changes)
  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, taskDueFrom, taskDueTo]);

  // Load Teams (for the Create Task dropdown)
  useEffect(() => {
    const fetchTeams = async () => {
      if (!isAuthenticated) return;
      // React StrictMode runs effects twice in dev; avoid refetching if we already have teams.
      if (teams.length > 0) return;
      try {
        const res = await teamService.listMyTeams();
        setTeams(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to load teams for dropdown", err);
        setTeams([]);
      }
    };
    fetchTeams();
  }, [isAuthenticated, teams.length]);

  // Load tasks per team for computing progress / recent projects
  useEffect(() => {
    const fetchTeamTasks = async () => {
      if (!isAuthenticated) return;
      if (teams.length === 0) {
        setTeamTasksById({});
        return;
      }

      // If we already have cached entries for all teams, don't refetch.
      const allTeamIds = teams.map((t) => String(t.id));
      const hasAll = allTeamIds.every((id) => teamTasksById[id] != null);
      if (hasAll) return;

      try {
        const entries: Array<[string, Task[]]> = await Promise.all(
          teams.map(async (t): Promise<[string, Task[]]> => {
            try {
              const data = await taskService.listByTeam(t.id);
              return [String(t.id), Array.isArray(data) ? (data as Task[]) : []];
            } catch {
              return [String(t.id), []];
            }
          })
        );
        const next: Record<string, Task[]> = {};
        for (const [teamId, list] of entries) next[teamId] = list;
        setTeamTasksById(next);
      } catch (e) {
        console.error("Failed to load team tasks", e);
        setTeamTasksById({});
      }
    };
    void fetchTeamTasks();
  }, [isAuthenticated, teams, teamTasksById]);

  // When opening the team details modal, resolve member/leader IDs to safe display names.
  useEffect(() => {
    const fetchNames = async () => {
      if (!isAuthenticated) return;
      if (!selectedTeam) return;

      const ids = [
        selectedTeam.teamLeaderId,
        ...(Array.isArray(selectedTeam.memberIds) ? selectedTeam.memberIds : []),
      ].filter((x): x is number => typeof x === "number" && Number.isFinite(x));

      const unique = Array.from(new Set(ids));
      const missing = unique.filter((id) => userNamesById[String(id)] == null);
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
      } catch (e) {
        console.error("Failed to resolve public user names", e);
      }
    };
    void fetchNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, isAuthenticated]);

  const getDisplayName = (id?: number) => {
    if (id == null) return "Unknown";
    if (currentUserId != null && Number(id) === Number(currentUserId)) return "You";
    return userNamesById[String(id)] ?? `User #${id}`;
  };

  const recentProjects = useMemo(() => {
    const items = teams.map((team) => {
      const tasksForTeam = teamTasksById[String(team.id)] ?? [];
      const total = tasksForTeam.length;
      const done = tasksForTeam.filter((t) => t.status === "DONE").length;
      const incomplete = tasksForTeam.some((t) => t.status !== "DONE");
      const progress = total > 0 ? Math.round((done / total) * 100) : null;

      const latestUpdatedAt = tasksForTeam
        .map((t) => t.updatedAt)
        .filter((d): d is string => typeof d === "string" && d.length > 0)
        .map((d) => new Date(d).getTime())
        .filter((n) => Number.isFinite(n))
        .reduce((max, n) => Math.max(max, n), 0);

      return {
        id: team.id,
        name: team.name,
        memberCount: Array.isArray(team.memberIds) ? team.memberIds.length : 0,
        progress,
        incomplete,
        latestUpdatedAt,
      };
    });

    const incompletes = items.filter((x) => x.incomplete);
    const source = incompletes.length > 0 ? incompletes : items;
    return source
      .sort((a, b) => (b.latestUpdatedAt || 0) - (a.latestUpdatedAt || 0))
      .slice(0, 3);
  }, [teams, teamTasksById]);

  const activeProjectsCount = useMemo(() => {
    return recentProjects.length;
  }, [recentProjects]);

  // Handlers using the hook logic
  const handleCreateTask = async () => {
    const ok = await Promise.resolve(handleCreateTaskHook());
    // If a due-date filter is active, refresh from server so the filtered view stays correct.
    if (ok && (taskDueFrom || taskDueTo)) {
      void loadTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await Promise.resolve(handleDeleteTaskWrapper(taskId, selectedTask, setSelectedTask));
    if (taskDueFrom || taskDueTo) {
      void loadTasks();
    }
  };

  // We override the local handleStatusChange to use the hook, 
  // but we also need to close the dropdown locally.
  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    handleUpdateTaskStatusWrapper(taskId, newStatus, setSelectedTask);
    setOpenDropdown(null);
    if (taskDueFrom || taskDueTo) {
      void loadTasks();
    }
  };

  const canEditTask = (t: Task): boolean => {
    if (currentUserId == null) return false;

    // Personal task (no team): allow the creator to edit.
    if (!t.teamId) {
      return Number(t.creatorId) === Number(currentUserId);
    }

    // Team task: allow team leader to edit.
    const team = teams.find((x) => String(x.id) === String(t.teamId));
    return Boolean(team && Number(team.teamLeaderId) === Number(currentUserId));
  };


  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "TODO":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "IN_PROGRESS":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "DONE":
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "TODO":
        return <Circle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "DONE":
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: Task["status"]) => {
    return statusFriendlyNames[status] || "Unknown Status";
  };

  const getPriorityLabel = (priority: Task["priority"]) => {
    return priopirityFriendlyNames[priority] || "Unknown Priority";
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "text-red-500 bg-red-50 border-red-100";
      case "MEDIUM":
        return "text-amber-500 bg-amber-50 border-amber-100";
      case "LOW":
        return "text-green-500 bg-green-50 border-green-100";
      default:
        return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  const userInitials = useMemo(() => {
    const first = (user?.firstName ?? '').trim();
    const last = (user?.lastName ?? '').trim();
    const initials = `${first.charAt(0) || ''}${last.charAt(0) || ''}`.toUpperCase();
    return initials || 'U';
  }, [user]);

  const todoTasks = tasks.filter(t => t.status === "TODO");
  const ongoingTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter(t => t.status === "DONE");
  const hasDueDateFilter = Boolean(taskDueFrom || taskDueTo);

  // Add activeProjectsCount to stats
  const stats = {
    totalTasks: tasks.length,
    todo: todoTasks.length,
    ongoing: ongoingTasks.length,
    completed: completedTasks.length,
    activeProjects: activeProjectsCount,
  };

  // Combine errors
  const displayError = opError || initialError;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white rounded-md rotate-45"></div>
            </div>
            <div>
              <h1 className="text-xl">
                <span className="font-semibold">Project</span>
                <span className="font-light"> Management</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={onProfileClick}
              className="flex items-center gap-3 hover:bg-slate-100 rounded-lg p-2 transition-colors group"
            >
              <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center text-white shadow-md">
                {userInitials}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium group-hover:text-sky-500 transition-colors">{user ? `${user.firstName} ${user.lastName}` : 'User'}</div>
                <div className="text-xs text-slate-500">View Profile</div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-slate-600 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Welcome back{user ? `, ${user.firstName}` : ''}! 👋</h2>
          <p className="text-slate-600">Here's what's happening with your projects today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-sky-500" />
              </div>
            </div>
            <div className="text-2xl mb-1">{stats.activeProjects}</div>
            <div className="text-sm text-slate-600">Active Projects</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Circle className="w-6 h-6 text-slate-500" />
              </div>
            </div>
            <div className="text-2xl mb-1">{stats.todo}</div>
            <div className="text-sm text-slate-600">To Do</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-sky-500" />
              </div>
            </div>
            <div className="text-2xl mb-1 text-sky-500">{stats.ongoing}</div>
            <div className="text-sm text-slate-600">Ongoing</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="text-2xl mb-1 text-green-500">{stats.completed}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
        </div>

        {/* Teams Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl">My Teams</h3>
          </div>

          {teams.length === 0 ? (
            <div className="text-slate-500">You are not assigned to any teams.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-linear-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center text-white shrink-0">
                    <Users className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-slate-700 truncate">{team.name}</h4>
                    {team.description ? (
                      <p className="text-sm text-slate-500 line-clamp-2">{team.description}</p>
                    ) : null}
                  </div>

                  <Button
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setSelectedTeam(team)}
                  >
                    Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks Management Board */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="text-2xl">My Tasks</h3>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex items-end gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Due from</span>
                  <input
                    type="date"
                    value={taskDueFrom}
                    onChange={(e) => setTaskDueFrom(e.target.value)}
                    lang="en-GB"
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Due to</span>
                  <input
                    type="date"
                    value={taskDueTo}
                    onChange={(e) => setTaskDueTo(e.target.value)}
                    lang="en-GB"
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTaskDueFrom("");
                    setTaskDueTo("");
                  }}
                  disabled={!taskDueFrom && !taskDueTo}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                  title="Clear due date filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Button onClick={() => setShowCreateTaskModal(true)} className="bg-sky-500 hover:bg-sky-600 text-white gap-2">
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            </div>
          </div>

          {(authLoading || initialLoading) && (
            <div className="text-slate-500">Loading tasks...</div>
          )}
          {displayError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4">
              {displayError}
            </div>
          )}

          {!authLoading && !initialLoading && !displayError && (
            tasks.length === 0 ? (
              <div className="p-10 border border-slate-200 rounded-xl bg-slate-50 text-center">
                <div className="mx-auto w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckSquare className="w-6 h-6 text-sky-500" />
                </div>
                <div className="text-lg font-medium text-slate-800 mb-1">
                  {hasDueDateFilter ? "No tasks match these due dates" : "You don't have any tasks yet"}
                </div>
                <div className="text-sm text-slate-600 mb-6">
                  {hasDueDateFilter
                    ? "Try clearing the due date filters to see all tasks."
                    : "Create your first task to get started."}
                </div>
                <div className="flex items-center justify-center gap-2">
                  {hasDueDateFilter ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTaskDueFrom("");
                        setTaskDueTo("");
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => setShowCreateTaskModal(true)}
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    Create Task
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* To Do Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Circle className="w-5 h-5 text-slate-500" />
                      <h4 className="font-medium">To Do</h4>
                      <span className="ml-auto bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm">
                        {todoTasks.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {todoTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md transition-all group cursor-pointer"
                          onClick={(e) => {
                            if (!(e.target as HTMLElement).closest('.status-dropdown') && !(e.target as HTMLElement).closest('.delete-btn')) {
                              setSelectedTask(task);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h5 className="font-medium">{task.title}</h5>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                                {getPriorityLabel(task.priority)}
                              </span>
                              <button
                                className="delete-btn p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-red-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{formatDate(task.dueDate)}</span>
                            <div className="relative status-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  if (openDropdown === task.id) {
                                    closeTaskDropdown();
                                  } else {
                                    setTaskDropdownRect(rect);
                                    setOpenDropdown(task.id);
                                  }
                                }}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-all ${getStatusColor(task.status)}`}
                              >
                                {getStatusIcon(task.status)}
                                <span>{getStatusLabel(task.status)}</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {openDropdown === task.id && (
                                taskDropdownRect
                                  ? createPortal(
                                    (() => {
                                      const pos = getTaskDropdownPosition(taskDropdownRect);
                                      return (
                                        <div
                                          className="status-dropdown-portal fixed bg-white rounded-lg shadow-2xl border border-slate-200 py-1 z-1000"
                                          style={{ left: pos.left, top: pos.top, width: pos.width }}
                                        >
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "TODO");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <Circle className="w-4 h-4 text-slate-500" />
                                            To Do
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "IN_PROGRESS");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <Clock className="w-4 h-4 text-sky-500" />
                                            Ongoing
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "DONE");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Completed
                                          </button>
                                        </div>
                                      );
                                    })(),
                                    document.body
                                  )
                                  : null
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ongoing Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-sky-500" />
                      <h4 className="font-medium">Ongoing</h4>
                      <span className="ml-auto bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-sm">
                        {ongoingTasks.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {ongoingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 bg-sky-50 border border-sky-200 rounded-lg hover:shadow-md transition-all group cursor-pointer"
                          onClick={(e) => {
                            if (!(e.target as HTMLElement).closest('.status-dropdown') && !(e.target as HTMLElement).closest('.delete-btn')) {
                              setSelectedTask(task);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h5 className="font-medium">{task.title}</h5>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                                {getPriorityLabel(task.priority)}
                              </span>
                              <button
                                className="delete-btn p-1 hover:bg-sky-200 rounded text-slate-400 hover:text-red-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{formatDate(task.dueDate)}</span>
                            <div className="relative status-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  if (openDropdown === task.id) {
                                    closeTaskDropdown();
                                  } else {
                                    setTaskDropdownRect(rect);
                                    setOpenDropdown(task.id);
                                  }
                                }}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-all ${getStatusColor(task.status)}`}
                              >
                                {getStatusIcon(task.status)}
                                <span>{getStatusLabel(task.status)}</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {openDropdown === task.id && (
                                taskDropdownRect
                                  ? createPortal(
                                    (() => {
                                      const pos = getTaskDropdownPosition(taskDropdownRect);
                                      return (
                                        <div
                                          className="status-dropdown-portal fixed bg-white rounded-lg shadow-2xl border border-slate-200 py-1 z-1000"
                                          style={{ left: pos.left, top: pos.top, width: pos.width }}
                                        >
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "TODO");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <Circle className="w-4 h-4 text-slate-500" />
                                            To Do
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "IN_PROGRESS");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <Clock className="w-4 h-4 text-sky-500" />
                                            Ongoing
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "DONE");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Completed
                                          </button>
                                        </div>
                                      );
                                    })(),
                                    document.body
                                  )
                                  : null
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Completed Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium">Completed</h4>
                      <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                        {completedTasks.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {completedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-all group cursor-pointer"
                          onClick={(e) => {
                            if (!(e.target as HTMLElement).closest('.status-dropdown') && !(e.target as HTMLElement).closest('.delete-btn')) {
                              setSelectedTask(task);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h5 className="font-medium">{task.title}</h5>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                                {getPriorityLabel(task.priority)}
                              </span>
                              <button
                                className="delete-btn p-1 hover:bg-green-200 rounded text-slate-400 hover:text-red-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{formatDate(task.dueDate)}</span>
                            <div className="relative status-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  if (openDropdown === task.id) {
                                    closeTaskDropdown();
                                  } else {
                                    setTaskDropdownRect(rect);
                                    setOpenDropdown(task.id);
                                  }
                                }}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-all ${getStatusColor(task.status)}`}
                              >
                                {getStatusIcon(task.status)}
                                <span>{getStatusLabel(task.status)}</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {openDropdown === task.id && (
                                taskDropdownRect
                                  ? createPortal(
                                    (() => {
                                      const pos = getTaskDropdownPosition(taskDropdownRect);
                                      return (
                                        <div
                                          className="status-dropdown-portal fixed bg-white rounded-lg shadow-2xl border border-slate-200 py-1 z-1000"
                                          style={{ left: pos.left, top: pos.top, width: pos.width }}
                                        >
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "TODO");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <Circle className="w-4 h-4 text-slate-500" />
                                            To Do
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "IN_PROGRESS");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <Clock className="w-4 h-4 text-sky-500" />
                                            Ongoing
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(task.id, "DONE");
                                              closeTaskDropdown();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                          >
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Completed
                                          </button>
                                        </div>
                                      );
                                    })(),
                                    document.body
                                  )
                                  : null
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Create Task Modal */}
        {showCreateTaskModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl">Create New Task</h3>
                <button
                  onClick={() => setShowCreateTaskModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="e.g., Update documentation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      lang="en-GB"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team (optional)</label>
                    <select
                      value={newTask.teamId}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          teamId: e.target.value,
                          creatorId: undefined,
                          assignedToId: undefined,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                    >
                      <option value="">No team (Private)</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCreateTeam && isCreateTeamLeader && Array.isArray(selectedCreateTeam.memberIds) && selectedCreateTeam.memberIds.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Assign to (optional)</label>
                      <select
                        value={String(newTask.assignedToId ?? "")}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!value) {
                            setNewTask({ ...newTask, assignedToId: undefined });
                            return;
                          }
                          const id = Number(value);
                          setNewTask({ ...newTask, assignedToId: Number.isFinite(id) ? id : undefined });
                        }}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                      >
                        <option value="">Me (default)</option>
                        {selectedCreateTeam.memberIds
                          .filter((id): id is number => typeof id === "number" && Number.isFinite(id))
                          .filter((id) => currentUserId == null || Number(id) !== Number(currentUserId))
                          .map((id) => (
                            <option key={String(id)} value={String(id)}>
                              {getDisplayName(id)}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                    disabled={!newTask.title || !newTask.dueDate}
                    onClick={() => {
                      void handleCreateTask();
                    }}
                  >
                    Create Task
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={() => setShowCreateTaskModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Projects */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl">Recent Projects</h3>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-slate-500">No teams found.</div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-linear-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center text-white shrink-0">
                    <FolderKanban className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1 truncate">{project.name}</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-xs">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-sky-400 to-sky-500 rounded-full transition-all"
                            style={{ width: `${project.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-slate-600">
                        {project.progress == null ? "-%" : `${project.progress}%`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{project.memberCount}</span>
                    </div>
                    <div className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                      {project.progress == null ? "No Tasks" : project.progress === 100 ? "Completed" : "In Progress"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-left group">
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-sky-500 transition-colors">
              <FolderKanban className="w-6 h-6 text-sky-500 group-hover:text-white transition-colors" />
            </div>
            <h4 className="mb-2">Create New Project</h4>
            <p className="text-sm text-slate-600">Start a new project and invite your team</p>
          </button>

          <button onClick={() => setShowCreateTaskModal(true)} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-left group">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
              <CheckSquare className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors" />
            </div>
            <h4 className="mb-2">Add Task</h4>
            <p className="text-sm text-slate-600">Create a new task for your projects</p>
          </button>

          <button className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-left group">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
              <Users className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors" />
            </div>
            <h4 className="mb-2">Invite Team Members</h4>
            <p className="text-sm text-slate-600">Add new members to your workspace</p>
          </button>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Suspense fallback={null}>
          <LazyTaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={(newStatus) => {
              handleStatusChange(selectedTask.id, newStatus);
              setSelectedTask({ ...selectedTask, status: newStatus });
            }}
            teamName={
              selectedTask.teamId
                ? teams.find((t) => String(t.id) === String(selectedTask.teamId))?.name
                : undefined
            }
            teamMemberIds={
              selectedTask.teamId
                ? (teams.find((t) => String(t.id) === String(selectedTask.teamId))?.memberIds ?? [])
                : []
            }
            canEdit={canEditTask(selectedTask)}
            onTaskUpdated={(updated) => {
              setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
              setSelectedTask(updated);
            }}
          />
        </Suspense>
      )}

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl">Team Details</h3>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close team details"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Name</div>
                <div className="text-lg font-medium text-slate-800">{selectedTeam.name}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Leader</div>
                <div className="text-slate-800">
                  {getDisplayName(selectedTeam.teamLeaderId)}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Description</div>
                <div className="text-slate-800 whitespace-pre-wrap">
                  {selectedTeam.description?.trim() ? selectedTeam.description : "(No description)"}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-2">Members</div>
                {Array.isArray(selectedTeam.memberIds) && selectedTeam.memberIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTeam.memberIds.map((memberId) => (
                      <div
                        key={String(memberId)}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                      >
                        <div className="text-slate-800">
                          {getDisplayName(memberId)}
                        </div>
                        {Number(memberId) === Number(selectedTeam.teamLeaderId) ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                            Leader
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500">No members found.</div>
                )}
              </div>

              {Number(selectedTeam.teamLeaderId) === Number(currentUserId) ? (
                <LeaderTeamMemberEditor
                  team={selectedTeam}
                  onTeamUpdated={(updated) => {
                    // keep both selectedTeam and teams list in sync
                    setSelectedTeam(updated);
                    setTeams((prev) => prev.map((t) => (String(t.id) === String(updated.id) ? updated : t)));
                  }}
                  getDisplayName={getDisplayName}
                />
              ) : null}

              <div className="pt-2">
                <Button className="w-full" variant="outline" onClick={() => setSelectedTeam(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderTeamMemberEditor({
  team,
  onTeamUpdated,
  getDisplayName,
}: {
  team: TeamApiResponse;
  onTeamUpdated: (team: TeamApiResponse) => void;
  getDisplayName: (id?: number) => string;
}) {
  const [identifierInput, setIdentifierInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMember = async () => {
    const identifier = identifierInput.trim();
    if (!identifier) {
      setError("Enter a username or email.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const resolved = identifier.includes("@")
        ? await userService.resolveUserIdByEmail(identifier)
        : await userService.resolveUserId(identifier);
      const userId = resolved?.id;
      if (!userId || !Number.isFinite(Number(userId))) {
        throw new Error("Could not resolve user to id");
      }

      const updated = await teamService.updateMembers(team.id, { action: "add", userId: Number(userId) });
      onTeamUpdated(updated);
      setIdentifierInput("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (userId: number) => {
    setError(null);
    setSaving(true);
    try {
      const updated = await teamService.updateMembers(team.id, { action: "remove", userId });
      onTeamUpdated(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to remove member");
    } finally {
      setSaving(false);
    }
  };

  const members = Array.isArray(team.memberIds) ? team.memberIds : [];

  return (
    <div className="pt-2 border-t border-slate-200">
      <div className="text-sm text-slate-500 mb-2">Leader Actions</div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={identifierInput}
            onChange={(e) => setIdentifierInput(e.target.value)}
            placeholder="Add member by username or email"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
          <Button onClick={() => void addMember()} disabled={saving || !identifierInput.trim()}>
            Add
          </Button>
        </div>

        {error ? (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        ) : null}

        <div className="space-y-2">
          {members
            .filter((id) => Number(id) !== Number(team.teamLeaderId))
            .map((id) => (
              <div
                key={String(id)}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
              >
                <div className="text-slate-800">{getDisplayName(id)}</div>
                <Button
                  variant="outline"
                  onClick={() => void removeMember(Number(id))}
                  disabled={saving}
                >
                  Remove
                </Button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}