import { useState } from "react";
import { User, Mail, Calendar, MapPin, Briefcase, Edit2, Save, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
//import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileProps {
  onBack?: () => void;
}

interface Task {
  id: string;
  title: string;
  project: string;
  status: "in-progress" | "pending" | "completed";
  dueDate: string;
  priority: "high" | "medium" | "low";
}

export function Profile({ onBack }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data - in real app, this would come from your auth/database
  const [userData, setUserData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    role: "Project Manager",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    avatar: "JD"
  });

  const [editData, setEditData] = useState(userData);

  // Mock tasks data
  const tasks: Task[] = [
    {
      id: "1",
      title: "Review design mockups",
      project: "Website Redesign",
      status: "in-progress",
      dueDate: "Dec 18, 2024",
      priority: "high"
    },
    {
      id: "2",
      title: "Update project timeline",
      project: "Mobile App",
      status: "pending",
      dueDate: "Dec 20, 2024",
      priority: "medium"
    },
    {
      id: "3",
      title: "Client presentation",
      project: "Marketing Campaign",
      status: "in-progress",
      dueDate: "Dec 16, 2024",
      priority: "high"
    },
    {
      id: "4",
      title: "Code review",
      project: "API Integration",
      status: "pending",
      dueDate: "Dec 22, 2024",
      priority: "low"
    },
    {
      id: "5",
      title: "Team meeting notes",
      project: "Website Redesign",
      status: "completed",
      dueDate: "Dec 15, 2024",
      priority: "medium"
    }
  ];

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-sky-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const stats = {
    totalTasks: tasks.length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length
  };

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
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 h-32"></div>
        
        <div className="px-8 pb-8">
          {/* Avatar and Edit Button */}
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                <span className="text-4xl text-sky-500">{userData.avatar}</span>
              </div>
              <div className="mb-2">
                <h1 className="text-3xl">{userData.fullName}</h1>
                <p className="text-slate-600">{userData.role}</p>
              </div>
            </div>
            
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={editData.fullName}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    {userData.fullName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {userData.email}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                {isEditing ? (
                  <Input
                    id="role"
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {userData.role}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {userData.location}
                  </div>
                )}
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
              <div className="flex-shrink-0">
                {getStatusIcon(task.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{task.title}</h3>
                <p className="text-sm text-slate-600">{task.project}</p>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge className={`${getPriorityColor(task.priority)} border`}>
                  {task.priority}
                </Badge>
                <div className="text-sm text-slate-600 min-w-[100px] text-right">
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
