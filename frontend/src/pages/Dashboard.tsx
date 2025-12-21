import { CheckSquare, Users, FolderKanban, Bell, Settings, LogOut, Clock, Circle, CheckCircle2, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { TaskDetail } from "./TaskDetails";
import type { Task } from "@/types/task";
import { statusFriendlyNames, priopirityFriendlyNames } from "@/lib/mappings";
import { useAuth } from "@/context/AuthContext";
import { taskService } from "@/services/tasks";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import axios from "axios"; // Needed for teams fetch

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

  // State for teams (needed for the Create Task modal dropdown)
  const [teams, setTeams] = useState<{id: string, name: string}[]>([]);

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

  // Load Tasks on Mount
  useEffect(() => {
    const fetchTasks = async () => {
      if (!isAuthenticated) return;
      setInitialLoading(true);
      setInitialError(null);
      try {
        const data = await taskService.listMyTasks();
        setTasks(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setInitialError(e.message);
        } else {
          setInitialError('Failed to load tasks');
        }
      } finally {
        setInitialLoading(false);
      }
    };
    fetchTasks();
  }, [isAuthenticated]);

  // Load Teams (for the Create Task dropdown)
  useEffect(() => {
    const fetchTeams = async () => {
      if (!isAuthenticated) return;
      try {
        // Assuming endpoint is /api/v1/teams/my-teams based on previous context
        const res = await axios.get('/api/v1/teams/my-teams'); 
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to load teams for dropdown", err);
      }
    };
    fetchTeams();
  }, [isAuthenticated]);


  // Handlers using the hook logic
  const handleCreateTask = () => handleCreateTaskHook();

  const handleDeleteTask = (taskId: string) => 
    handleDeleteTaskWrapper(taskId, selectedTask, setSelectedTask);

  // We override the local handleStatusChange to use the hook, 
  // but we also need to close the dropdown locally.
  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    handleUpdateTaskStatusWrapper(taskId, newStatus, setSelectedTask);
    setOpenDropdown(null);
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

  const stats = {
    totalTasks: tasks.length,
    todo: todoTasks.length,
    ongoing: ongoingTasks.length,
    completed: completedTasks.length
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

            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-600" />
            </button>

            {/* User Avatar - Click to go to profile */}
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
              <span className="text-sm text-green-500">+12%</span>
            </div>
            <div className="text-2xl mb-1">8</div>
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

        {/* Tasks Management Board */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl">My Tasks</h3>
            <Button onClick={() => setShowCreateTaskModal(true)} className="bg-sky-500 hover:bg-sky-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
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
                            setOpenDropdown(openDropdown === task.id ? null : task.id);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-all ${getStatusColor(task.status)}`}
                        >
                          {getStatusIcon(task.status)}
                          <span>{getStatusLabel(task.status)}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdown === task.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, "TODO");
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
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Completed
                            </button>
                          </div>
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
                            setOpenDropdown(openDropdown === task.id ? null : task.id);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-all ${getStatusColor(task.status)}`}
                        >
                          {getStatusIcon(task.status)}
                          <span>{getStatusLabel(task.status)}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdown === task.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, "TODO");
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
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Completed
                            </button>
                          </div>
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
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-all group cursor-pointer opacity-75"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('.status-dropdown') && !(e.target as HTMLElement).closest('.delete-btn')) {
                        setSelectedTask(task);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="font-medium line-through decoration-slate-400">{task.title}</h5>
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
                            setOpenDropdown(openDropdown === task.id ? null : task.id);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-all ${getStatusColor(task.status)}`}
                        >
                          {getStatusIcon(task.status)}
                          <span>{getStatusLabel(task.status)}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdown === task.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, "TODO");
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
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Completed
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team (optional)</label>
                    <select
                      value={newTask.teamId}
                      onChange={(e) => setNewTask({ ...newTask, teamId: e.target.value })}
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
            <Button variant="outline">View All</Button>
          </div>

          <div className="space-y-4">
            {[
              { name: "Website Redesign", progress: 75, team: 5, status: "On Track" },
              { name: "Mobile App Development", progress: 45, team: 8, status: "In Progress" },
              { name: "Marketing Campaign", progress: 90, team: 4, status: "Almost Done" }
            ].map((project, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-linear-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center text-white shrink-0">
                  <FolderKanban className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1">{project.name}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-sky-400 to-sky-500 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-slate-600">{project.progress}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{project.team}</span>
                  </div>
                  <div className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                    {project.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(newStatus) => {
            handleStatusChange(selectedTask.id, newStatus);
            setSelectedTask({ ...selectedTask, status: newStatus });
          }}
        />
      )}
    </div>
  );
}