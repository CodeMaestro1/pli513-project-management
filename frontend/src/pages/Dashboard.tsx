import { CheckSquare, Users, FolderKanban, Bell, Settings, LogOut, Clock, Circle, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { TaskDetail } from "./TaskDetails";
import type { Task } from "@/types/task";
import { statusFriendlyNames, priopirityFriendlyNames } from "@/lib/mappings";
import { useAuth } from "@/context/AuthContext";
import { taskService } from "@/services/tasks";
interface DashboardProps {
  onProfileClick: () => void;
  onLogout: () => void;
}

export function Dashboard({ onProfileClick, onLogout }: DashboardProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
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

  useEffect(() => {
  const fetchTasks = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.listMyTasks();
      // Assume API returns an array of Task-like objects #CHECK
      setTasks(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  };
  fetchTasks();
}, [isAuthenticated]);

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
            <Button variant="outline">Add New Task</Button>
          </div>

          {(authLoading || loading) && (
            <div className="text-slate-500">Loading tasks...</div>
          )}
          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}

          {!authLoading && !loading && !error && (
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
                      // Don't open task detail if clicking on the status dropdown
                      if (!(e.target as HTMLElement).closest('.status-dropdown')) {
                        setSelectedTask(task);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="font-medium">{task.title}</h5>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200">
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Team: {task.teamId ?? '-'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{task.dueDate}</span>
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
                      if (!(e.target as HTMLElement).closest('.status-dropdown')) {
                        setSelectedTask(task);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="font-medium">{task.title}</h5>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700 border border-sky-200">
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Team: {task.teamId ?? '-'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{task.dueDate}</span>
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
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-all group cursor-pointer"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('.status-dropdown')) {
                        setSelectedTask(task);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="font-medium">{task.title}</h5>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Team: {task.teamId ?? '-'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{task.dueDate}</span>
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

          <button className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-left group">
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