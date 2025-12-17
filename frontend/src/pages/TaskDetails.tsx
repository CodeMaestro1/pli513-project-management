import { X, Clock, Circle, CheckCircle2, Calendar, User, AlertCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Task, TaskStatus } from "@/types/task";
import { statusFriendlyNames, priopirityFriendlyNames } from "@/lib/mappings";


interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onStatusChange: (status: Task["status"]) => void;
}

export function TaskDetail({ task, onClose, onStatusChange }: TaskDetailProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);



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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl mb-2">{task.title}</h2>
              <p className="text-sm text-slate-500">Task ID: {task.id}</p>
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
                      onStatusChange("TODO"); // Updated to use TaskStatus value
                      setShowStatusMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Circle className="w-4 h-4 text-slate-500" />
                    To Do
                  </button>
                  <button
                    onClick={() => {
                      onStatusChange("IN_PROGRESS"); // Updated to use TaskStatus value
                      setShowStatusMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-sky-500" />
                    In Progress
                  </button>
                  <button
                    onClick={() => {
                      onStatusChange("DONE"); // Updated to use TaskStatus value
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
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getPriorityColor(task.priority)}`}>
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Priority: {getPriorityLabel(task.priority)}</span>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">Due: {task.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg mb-3">Description</h3>
            <p className="text-slate-600 whitespace-pre-wrap">
              {task.description}
            </p>
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
                    <p className="text-sm font-medium">User {task.creatorId}</p>
                  </div>
                </div>
              )}

              {task.assignedToId && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Assigned To</p>
                    <p className="text-sm font-medium">User {task.assignedToId}</p>
                  </div>
                </div>
              )}

              {task.teamId && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Team</p>
                    <p className="text-sm font-medium">{task.teamId}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Created At</p>
                  <p className="text-sm font-medium">{task.createdAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm font-medium">{task.updatedAt}</p>
                </div>
              </div>
            </div>
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
            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              Edit Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
