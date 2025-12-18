import { useState, useEffect } from "react";
import { User, Mail, Calendar, MapPin, Briefcase, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Task } from "@/types/task";
import { useAuth } from "@/context/AuthContext"; // Assuming you have an AuthContext
import { taskService } from "@/services/tasks"; // Assuming you have a task service
import type { userData } from "@/types/user";

interface ProfileProps {
  onBack?: () => void;
}

export function Profile({ onBack }: ProfileProps) {
  const { user } = useAuth(); // Get the authenticated user from context
  const [userData, setUserData] = useState<userData | null >(null); // User data fetched dynamically
  const [tasks, setTasks] = useState<Task[]>([]); // Tasks fetched dynamically
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data and tasks dynamically
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data (assuming `user` contains the user ID or email)
        const fetchedUserData = {
          firstName: user?.firstName || "Error",
          lastName: user?.lastName || "Error",
          email: user?.email || "error@example.com",
          role: user?.role || "Error",
          location: "Chania, Crete", // Placeholder location
          joinDate: user?.createdAt
            ? new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(user.createdAt))
            : "Unknown", // Format createdAt or fallback to "Unknown"
          avatar: `${user?.firstName?.[0] || "E"}${user?.lastName?.[0] || "E"}`, // Initials
        };

        // Fetch tasks
        const fetchedTasks = await taskService.listMyTasks();

        setUserData(fetchedUserData);
        setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      } catch {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-sky-500" />;
      case "TODO":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const stats = {
    totalTasks: tasks.length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "DONE").length,
    pending: tasks.filter((t) => t.status === "TODO").length,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="text-red-500">No user data available.</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header with Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-sky-500 transition-colors"
        >
          <X className="w-5 h-5" />
          Back to Dashboard
        </button>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-linear-to-r from-sky-400 to-sky-500 h-32"></div>

        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                <span className="text-4xl text-sky-500">{userData.avatar}</span>
              </div>
              <div className="mb-2">
                <h1 className="text-3xl">{`${userData.firstName} ${userData.lastName}`}</h1>
                <p className="text-slate-600">{userData.role}</p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  {userData.firstName}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  {userData.lastName}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {userData.email}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2 text-slate-700">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {userData.role}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {userData.location}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {userData.joinDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-2xl mb-1">{stats.totalTasks}</div>
          <div className="text-sm text-slate-600">Total Tasks</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-2xl text-sky-500 mb-1">{stats.inProgress}</div>
          <div className="text-sm text-slate-600">In Progress</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-2xl text-green-500 mb-1">{stats.completed}</div>
          <div className="text-sm text-slate-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-2xl text-amber-500 mb-1">{stats.pending}</div>
          <div className="text-sm text-slate-600">Pending</div>
        </div>
      </div>

      {/* Ongoing Tasks */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl mb-6">My Tasks</h2>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all"
            >
              <div className="shrink-0">{getStatusIcon(task.status)}</div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{task.title}</h3>
                <p className="text-sm text-slate-600">{task.title}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge className={`${getPriorityColor(task.priority)} border`}>
                  {task.priority}
                </Badge>
                <div className="text-sm text-slate-600 min-w-25 text-right">
                  {task.dueDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
