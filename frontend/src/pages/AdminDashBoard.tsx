import {
  Users,
  Shield,
  UserCheck,
  Clock,
  CheckCircle2,
  Bell,
  LogOut,
  Search,
  MoreVertical,
  Crown,
  Ban,
  Check,
  X,
  Mail,
  Calendar,
  Filter,
  Download,
  FolderKanban,
  ListTodo,
  CheckSquare,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { TaskDetail } from "./TaskDetails";
import type { AdminUser, UserRole } from "@/types/user";
import type { Team } from "@/types/team";
import type { Task } from "@/types/task";
import { taskService } from "@/services/tasks";
import { teamService } from "@/services/teams";
import { adminService } from "@/services/admin";
import { useAuth } from "@/context/AuthContext";
import { useTaskOperations } from "@/hooks/useTaskOperations";

type TeamApiResponse = {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  teamLeaderId?: number;
  memberIds?: number[];
};

type DashboardRole = "admin" | "leader" | "member";
type DashboardStatus = "active" | "disabled";

type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: DashboardRole;
  status: DashboardStatus;
  joinedDate: string;
  raw: AdminUser;
};

interface AdminDashboardProps {
  onProfileClick: () => void;
  onLogout: () => void;
  onViewTasks?: () => void; // <-- make optional so parent missing it won't break build
}

export function AdminDashboard({ onProfileClick, onLogout, onViewTasks }: AdminDashboardProps) {
  const { user } = useAuth();

  const currentUserId = useMemo(() => {
    const raw = user?.id;
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }, [user?.id]);

  const formatDate = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const maybe = err as { message?: string; response?: { data?: { message?: string } } };
      return maybe.response?.data?.message ?? maybe.message ?? "Operation failed";
    }
    return "Operation failed";
  };

  const [activeTab, setActiveTab] = useState<"overview" | "mytasks" | "users" | "pending" | "teams">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamMembersDraft, setTeamMembersDraft] = useState<string[]>([]);
  const [savingTeamMembers, setSavingTeamMembers] = useState(false);

  const [newTeam, setNewTeam] = useState({ name: "", description: "", leaderId: "", memberIds: [] as string[] });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [teamResponses, setTeamResponses] = useState<TeamApiResponse[]>([]);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Initialize the hook
  const {
    error: hookTasksError,
    newTask,
    setNewTask,
    showCreateModal: showCreateTaskModal,
    setShowCreateModal: setShowCreateTaskModal,
    createTask: handleCreateTaskHook,
    deleteTask: handleDeleteTaskWrapper,
    updateTaskStatus: handleUpdateTaskStatusWrapper
  } = useTaskOperations(setAllTasks, currentUserId);

  // Sync hook error with component error if needed, or use directly
  // Here we'll just prioritize the hook error if present
  const displayTasksError = hookTasksError || tasksError;

  const handleDeleteTask = (taskId: string) =>
    handleDeleteTaskWrapper(taskId, selectedTask, setSelectedTask);

  const handleUpdateTaskStatus = (taskId: string, status: Task["status"]) =>
    handleUpdateTaskStatusWrapper(taskId, status, setSelectedTask);

  const handleCreateTask = () => handleCreateTaskHook();

  const pendingAdminUsers = useMemo(
    () => adminUsers.filter((u) => u.status === "PENDING"),
    [adminUsers]
  );

  const toDashboardRole = (role?: UserRole): DashboardRole => {
    switch (role) {
      case "ADMIN":
        return "admin";
      case "LEADER":
        return "leader";
      default:
        return "member";
    }
  };

  const toDashboardStatus = (status?: AdminUser["status"]): DashboardStatus => {
    switch (status) {
      case "DISABLED":
        return "disabled";
      default:
        return "active";
    }
  };

  const dashboardUsers = useMemo<DashboardUser[]>(() => {
    return adminUsers.map((u) => {
      const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
      const name = fullName || u.username || u.email;
      return {
        id: String(u.id),
        name,
        email: u.email,
        role: toDashboardRole(u.role),
        status: toDashboardStatus(u.status),
        joinedDate: formatDate(u.createdAt),
        raw: u,
      };
    });
  }, [adminUsers]);

  const teams = useMemo<Team[]>(() => {
    return teamResponses.map((t) => {
      const leaderUser = dashboardUsers.find((u) => String(u.raw?.id) === String(t.teamLeaderId));
      const memberIds = (t.memberIds ?? []).map((id) => String(id));
      const tasksCount = allTasks.filter((task) => String(task.teamId ?? "") === String(t.id)).length;

      return {
        id: t.id,
        name: t.name,
        description: t.description,
        leader: leaderUser?.name ?? "",
        memberIds,
        createdDate: formatDate(t.createdAt),
        tasksCount,
      };
    });
  }, [teamResponses, dashboardUsers, allTasks]);

  const selectedTeamResponse = useMemo(() => {
    if (!selectedTeamId) return undefined;
    return teamResponses.find((t) => String(t.id) === String(selectedTeamId));
  }, [teamResponses, selectedTeamId]);

  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return undefined;
    return teams.find((t) => String(t.id) === String(selectedTeamId));
  }, [teams, selectedTeamId]);

  const selectedTeamTasks = useMemo(() => {
    if (!selectedTeamId) return [];
    return allTasks.filter((t) => String(t.teamId ?? "") === String(selectedTeamId));
  }, [allTasks, selectedTeamId]);

  // Close menus/modals on outside click + ESC
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If the click is not inside an action-menu container, close it
      if (!target.closest("[data-action-menu]")) {
        setOpenActionMenu(null);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenActionMenu(null);
      setSelectedTask(null);
      setShowCreateTeamModal(false);
      setShowCreateTaskModal(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [setShowCreateTaskModal]); // <--- Added dependency here

  useEffect(() => {
    const load = async () => {
      setTasksLoading(true);
      setTasksError(null);
      try {
        const [tasksRes, teamsRes] = await Promise.all([
          taskService.listMyTasks(),
          teamService.listAllTeams().catch(() => []),
        ]);
        setAllTasks(Array.isArray(tasksRes) ? tasksRes : []);
        setTeamResponses(Array.isArray(teamsRes) ? (teamsRes as TeamApiResponse[]) : []);
      } catch (e) {
        setTasksError(getErrorMessage(e));
        setAllTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const res = await adminService.listUsers();
        setAdminUsers(Array.isArray(res) ? res : []);
      } catch (e) {
        setUsersError(getErrorMessage(e));
        setAdminUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    void loadUsers();
  }, []);

  // listMyTasks already returns tasks assigned to the current user.
  const myTasks = useMemo(() => allTasks, [allTasks]);

  const refreshUsers = async () => {
    const res = await adminService.listUsers();
    setAdminUsers(Array.isArray(res) ? res : []);
  };

  const handleChangeUserRole = async (userId: string, role: UserRole) => {
    setUsersError(null);
    try {
      const updated = await adminService.updateRole(userId, role);
      setAdminUsers((prev) => prev.map((u) => (String(u.id) === String(userId) ? updated : u)));
    } catch (e) {
      setUsersError(getErrorMessage(e));
    } finally {
      setOpenActionMenu(null);
    }
  };

  const handleDisableUser = async (userId: string) => {
    setUsersError(null);
    try {
      const updated = await adminService.disableUser(userId);
      setAdminUsers((prev) => prev.map((u) => (String(u.id) === String(userId) ? updated : u)));
    } catch (e) {
      setUsersError(getErrorMessage(e));
    } finally {
      setOpenActionMenu(null);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setUsersError(null);
    try {
      const updated = await adminService.approveUser(userId);
      setAdminUsers((prev) => prev.map((u) => (String(u.id) === String(userId) ? updated : u)));
    } catch (e) {
      setUsersError(getErrorMessage(e));
    }
  };

  const handleRejectUser = async (userId: string) => {
    setUsersError(null);
    try {
      await adminService.deleteUser(userId);
      await refreshUsers();
    } catch (e) {
      setUsersError(getErrorMessage(e));
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.leaderId) {
      setUsersError("Team name and leader are required.");
      return;
    }

    setUsersError(null);
    setCreatingTeam(true);
    try {
      const teamLeaderId = Number(newTeam.leaderId);
      if (!Number.isFinite(teamLeaderId)) {
        setUsersError("Invalid leader selected.");
        return;
      }

      let createdTeam = (await teamService.create({
        name: newTeam.name,
        description: newTeam.description,
        teamLeaderId,
      })) as unknown as TeamApiResponse;

      const additionalMemberIds = Array.from(
        new Set(newTeam.memberIds.filter((id) => id && id !== newTeam.leaderId))
      );

      for (const memberId of additionalMemberIds) {
        const userId = Number(memberId);
        if (!Number.isFinite(userId)) continue;
        createdTeam = (await teamService.updateMembers(createdTeam.id, { action: "add", userId })) as unknown as TeamApiResponse;
      }

      setTeamResponses((prev) => [...prev, createdTeam]);
      setNewTeam({ name: "", description: "", leaderId: "", memberIds: [] });
      setShowCreateTeamModal(false);
    } catch (e) {
      setUsersError(getErrorMessage(e));
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleCreateTeamWrapper = () => {
    if (newTeam.name && newTeam.leaderId) {
      void handleCreateTeam();
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    setUsersError(null);
    try {
      await teamService.remove(teamId);
      setTeamResponses((prev) => prev.filter((t) => String(t.id) !== String(teamId)));
      setAllTasks((prev) => prev.map((t) => (t.teamId === teamId ? { ...t, teamId: "" } : t)));
    } catch (e) {
      setUsersError(getErrorMessage(e));
    }
  };

  const openTeamDetails = (teamId: string) => {
    setUsersError(null);
    setSelectedTeamId(teamId);
    const existing = teams.find((t) => String(t.id) === String(teamId));
    setTeamMembersDraft(existing?.memberIds ?? []);
    setShowTeamDetailsModal(true);
  };

  const closeTeamDetails = () => {
    setShowTeamDetailsModal(false);
    setSelectedTeamId(null);
    setTeamMembersDraft([]);
    setSavingTeamMembers(false);
  };

  const handleSaveTeamMembers = async () => {
    if (!selectedTeamResponse) return;
    const teamId = selectedTeamResponse.id;
    const leaderId = selectedTeamResponse.teamLeaderId;
    if (!teamId || !Number.isFinite(leaderId)) {
      setUsersError("Unable to edit team members.");
      return;
    }

    setUsersError(null);
    setSavingTeamMembers(true);
    try {
      const currentMembers = new Set((selectedTeamResponse.memberIds ?? []).map((id) => String(id)));
      const desiredMembers = new Set(teamMembersDraft.map(String));
      desiredMembers.add(String(leaderId)); // always keep leader as member

      const toAdd = Array.from(desiredMembers).filter((id) => !currentMembers.has(id));
      const toRemove = Array.from(currentMembers).filter((id) => !desiredMembers.has(id) && id !== String(leaderId));

      let latest = selectedTeamResponse as TeamApiResponse;
      for (const id of toAdd) {
        const userId = Number(id);
        if (!Number.isFinite(userId)) continue;
        latest = (await teamService.updateMembers(teamId, { action: "add", userId })) as unknown as TeamApiResponse;
      }
      for (const id of toRemove) {
        const userId = Number(id);
        if (!Number.isFinite(userId)) continue;
        latest = (await teamService.updateMembers(teamId, { action: "remove", userId })) as unknown as TeamApiResponse;
      }

      setTeamResponses((prev) => prev.map((t) => (String(t.id) === String(teamId) ? latest : t)));
      closeTeamDetails();
    } catch (e) {
      setUsersError(getErrorMessage(e));
    } finally {
      setSavingTeamMembers(false);
    }
  };

  const getRoleBadgeColor = (role: DashboardUser["role"]) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "leader":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "member":
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getRoleIcon = (role: DashboardUser["role"]) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "leader":
        return <Crown className="w-4 h-4" />;
      case "member":
        return <Users className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "text-red-500";
      case "MEDIUM":
        return "text-amber-500";
      case "LOW":
        return "text-green-500";
    }
  };

  const filteredUsers = dashboardUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: dashboardUsers.length,
    activeUsers: dashboardUsers.filter(u => u.status === "active").length,
    leaders: dashboardUsers.filter(u => u.role === "leader").length,
    pendingApprovals: pendingAdminUsers.length,
    totalTeams: teams.length,
    totalTasks: allTasks.length,
    myTasksCount: myTasks.length,
    myTasksPending: myTasks.filter(t => t.status !== "DONE").length
  };

  const todoTasks = myTasks.filter(task => task.status === "TODO");
  const ongoingTasks = myTasks.filter(task => task.status === "IN_PROGRESS");
  const completedTasks = myTasks.filter(task => task.status === "DONE");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">
                <span className="font-semibold">Admin</span>
                <span className="font-light"> Dashboard</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              {pendingAdminUsers.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>

            {/* User Avatar */}
            <button
              onClick={onProfileClick}
              className="flex items-center gap-3 hover:bg-slate-100 rounded-lg p-2 transition-colors group"
            >
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
                {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}` || "A"}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium group-hover:text-purple-500 transition-colors">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || ""}
                </div>
                <div className="text-xs text-slate-500">{user?.role ?? "Administrator"}</div>
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
          <h2 className="text-3xl mb-2">Welcome back, {user?.firstName || user?.username || ""}!</h2>
          <p className="text-slate-600">Manage your team, review approvals, and track progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setActiveTab("mytasks")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-sky-500" />
              </div>
            </div>
            <div className="text-2xl mb-1">{stats.myTasksPending}</div>
            <div className="text-sm text-slate-600">My Active Tasks</div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setActiveTab("users")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="text-2xl mb-1 text-green-500">{stats.activeUsers}</div>
            <div className="text-sm text-slate-600">Active Users</div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setActiveTab("teams")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="text-2xl mb-1 text-purple-500">{stats.totalTeams}</div>
            <div className="text-sm text-slate-600">Teams</div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setActiveTab("pending")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              {stats.pendingApprovals > 0 && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">New</span>
              )}
            </div>
            <div className="text-2xl mb-1 text-amber-500">{stats.pendingApprovals}</div>
            <div className="text-sm text-slate-600">Pending Approvals</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex flex-wrap gap-1 p-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 rounded-lg transition-all whitespace-nowrap ${activeTab === "overview" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("mytasks")}
                className={`px-6 py-3 rounded-lg transition-all whitespace-nowrap ${activeTab === "mytasks" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                My Tasks ({stats.myTasksCount})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-3 rounded-lg transition-all whitespace-nowrap ${activeTab === "users" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                All Users ({dashboardUsers.length})
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`px-6 py-3 rounded-lg transition-all whitespace-nowrap ${activeTab === "teams" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                Teams ({teams.length})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-3 rounded-lg transition-all relative whitespace-nowrap ${activeTab === "pending" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                Pending ({pendingAdminUsers.length})
                {pendingAdminUsers.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />}
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab("pending")}
                      className="p-6 bg-linear-to-br from-amber-50 to-amber-100 rounded-xl hover:shadow-lg transition-all text-left group border border-amber-200"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-amber-500" />
                      </div>
                      <h4 className="mb-2">Review Approvals</h4>
                      <p className="text-sm text-slate-600">{pendingAdminUsers.length} pending user requests</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("users")}
                      className="p-6 bg-linear-to-br from-sky-50 to-sky-100 rounded-xl hover:shadow-lg transition-all text-left group border border-sky-200"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-sky-500" />
                      </div>
                      <h4 className="mb-2">Manage Users</h4>
                      <p className="text-sm text-slate-600">View and edit user permissions</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("teams")}
                      className="p-6 bg-linear-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all text-left group border border-green-200"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                        <FolderKanban className="w-6 h-6 text-green-500" />
                      </div>
                      <h4 className="mb-2">Manage Teams</h4>
                      <p className="text-sm text-slate-600">Create and organize teams</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("mytasks")}
                      className="p-6 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all text-left group border border-purple-200"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                        <CheckSquare className="w-6 h-6 text-purple-500" />
                      </div>
                      <h4 className="mb-2">My Tasks</h4>
                      <p className="text-sm text-slate-600">View and manage your personal tasks</p>
                    </button>

                    <button
                      onClick={() => (onViewTasks ? onViewTasks() : setShowCreateTaskModal(true))}
                      className="p-6 bg-linear-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition-all text-left group border border-slate-200"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                        <Download className="w-6 h-6 text-slate-500" />
                      </div>
                      <h4 className="mb-2">View / Export</h4>
                      <p className="text-sm text-slate-600">Open task view (or create a task if not wired)</p>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user approved</p>
                        <p className="text-xs text-slate-500">Sarah Johnson approved Mike Chen's account</p>
                      </div>
                      <span className="text-xs text-slate-400">2 hours ago</span>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User promoted</p>
                        <p className="text-xs text-slate-500">Emily Davis promoted to Team Leader</p>
                      </div>
                      <span className="text-xs text-slate-400">5 hours ago</span>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New approval request</p>
                        <p className="text-xs text-slate-500">David Wilson requested to join</p>
                      </div>
                      <span className="text-xs text-slate-400">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Tasks Tab */}
            {activeTab === "mytasks" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-2xl">My Tasks</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowCreateTaskModal(true)} className="bg-purple-500 hover:bg-purple-600 text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Create Task
                    </Button>
                  </div>
                </div>

                {displayTasksError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {displayTasksError}
                  </div>
                )}

                {tasksLoading && <div className="text-slate-500">Loading tasks…</div>}

                <div className="grid md:grid-cols-3 gap-6">
                  {/* To Do Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        To Do
                      </h4>
                      <span className="text-sm text-slate-500">{todoTasks.length}</span>
                    </div>
                    {todoTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h5 className="font-medium mb-2">{task.title}</h5>
                          <button
                            className="p-1 hover:bg-slate-100 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400">{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ongoing Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        Ongoing
                      </h4>
                      <span className="text-sm text-slate-500">{ongoingTasks.length}</span>
                    </div>
                    {ongoingTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h5 className="font-medium mb-2">{task.title}</h5>
                          <button
                            className="p-1 hover:bg-slate-100 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400">{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Completed Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Completed
                      </h4>
                      <span className="text-sm text-slate-500">{completedTasks.length}</span>
                    </div>
                    {completedTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all cursor-pointer opacity-75"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h5 className="font-medium mb-2">{task.title}</h5>
                          <button
                            className="p-1 hover:bg-slate-100 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400">{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Task Modal */}
                {showCreateTaskModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., Audit roles & permissions"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Priority</label>
                            <select
                              value={newTask.priority}
                              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Team (optional)</label>
                            <select
                              value={newTask.teamId}
                              onChange={(e) => setNewTask({ ...newTask, teamId: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            >
                              <option value="">No team</option>
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
                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
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
              </div>
            )}

            {/* All Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {usersError && (
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {usersError}
                  </div>
                )}

                {/* Search and Filter */}
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-75 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="leader">Leader</option>
                      <option value="member">Member</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {usersLoading ? (
                  <div className="text-sm text-slate-600">Loading users…</div>
                ) : null}

                {/* Users List */}
                <div className="space-y-3">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${user.status === "disabled"
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-md"
                        }`}
                    >
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0 ${user.role === "admin"
                        ? "bg-linear-to-br from-purple-500 to-purple-600"
                        : user.role === "leader"
                          ? "bg-linear-to-br from-sky-400 to-sky-500"
                          : "bg-linear-to-br from-slate-400 to-slate-500"
                        }`}>
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{user.name}</h4>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                          {user.status === "disabled" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
                              <Ban className="w-3 h-3" />
                              Disabled
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {user.joinedDate}
                          </span>
                        </div>
                      </div>

                      {/* Actions Menu */}
                      {user.role !== "admin" && (
                        <div className="relative" data-action-menu>
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === user.id ? null : user.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-600" />
                          </button>
                          {openActionMenu === user.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                              {user.role === "member" && (
                                <button
                                  onClick={() => void handleChangeUserRole(user.id, "LEADER")}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                >
                                  <Crown className="w-4 h-4 text-purple-500" />
                                  Promote to Leader
                                </button>
                              )}
                              {user.role === "leader" && (
                                <button
                                  onClick={() => void handleChangeUserRole(user.id, "MEMBER")}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                >
                                  <Users className="w-4 h-4 text-slate-500" />
                                  Demote to Member
                                </button>
                              )}
                              {user.status !== "disabled" && (
                                <button
                                  onClick={() => void handleDisableUser(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2 text-red-600"
                                >
                                  <Ban className="w-4 h-4" />
                                  Disable Account
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === "teams" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl mb-1">Teams Management</h3>
                    <p className="text-sm text-slate-600">Create and manage project teams</p>
                  </div>
                  <Button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Team
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {teams.map(team => (
                    <div key={team.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg mb-1">{team.name}</h4>
                          <p className="text-sm text-slate-600 mb-3">{team.description}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Crown className="w-4 h-4 text-sky-500" />
                            <span>Led by {team.leader}</span>
                          </div>
                        </div>
                        <div className="relative" data-action-menu>
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === team.id ? null : team.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-600" />
                          </button>
                          {openActionMenu === team.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  openTeamDetails(team.id);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Team
                              </button>
                              <button
                                onClick={() => {
                                  void handleDeleteTeam(team.id);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Team
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{team.memberIds.length} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ListTodo className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{team.tasksCount} tasks</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-3">
                        {team.memberIds.slice(0, 5).map((memberId) => {
                          const member = dashboardUsers.find(u => u.id === memberId);
                          if (!member) return null;
                          return (
                            <div
                              key={memberId}
                              className="w-8 h-8 rounded-lg bg-linear-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white text-xs"
                              title={member.name}
                            >
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </div>
                          );
                        })}
                        {team.memberIds.length > 5 && (
                          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 text-xs">
                            +{team.memberIds.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Team Modal */}
                {showCreateTeamModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl">Create New Team</h3>
                        <button
                          onClick={() => setShowCreateTeamModal(false)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Team Name</label>
                          <input
                            type="text"
                            value={newTeam.name}
                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                            placeholder="e.g., Design Team"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            value={newTeam.description}
                            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                            placeholder="Brief description of the team's purpose"
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Team Leader</label>
                          <select
                            value={newTeam.leaderId}
                            onChange={(e) => setNewTeam({ ...newTeam, leaderId: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Select a leader...</option>
                            {dashboardUsers.filter(u => u.status === "active" && u.role !== "admin").map(user => (
                              <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Team Members</label>
                          <div className="border border-slate-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                            {dashboardUsers.filter(u => u.status === "active" && u.id !== newTeam.leaderId && u.role !== "admin").map(user => (
                              <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newTeam.memberIds.includes(user.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewTeam({ ...newTeam, memberIds: [...newTeam.memberIds, user.id] });
                                    } else {
                                      setNewTeam({ ...newTeam, memberIds: newTeam.memberIds.filter(id => id !== user.id) });
                                    }
                                  }}
                                  className="rounded border-slate-300"
                                />
                                <span className="text-sm">{user.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleCreateTeamWrapper}
                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                            disabled={!newTeam.name || !newTeam.leaderId || creatingTeam}
                          >
                            {creatingTeam ? "Creating..." : "Create Team"}
                          </Button>
                          <Button
                            onClick={() => setShowCreateTeamModal(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Details / Edit Members Modal */}
                {showTeamDetailsModal && selectedTeam && selectedTeamResponse && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl">Team Details</h3>
                          <p className="text-sm text-slate-600">View and edit team members</p>
                        </div>
                        <button
                          onClick={closeTeamDetails}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="text-xs text-slate-500 mb-1">Name</div>
                            <div className="font-medium">{selectedTeam.name}</div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="text-xs text-slate-500 mb-1">Leader</div>
                            <div className="font-medium">{selectedTeam.leader || "—"}</div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:col-span-2">
                            <div className="text-xs text-slate-500 mb-1">Description</div>
                            <div className="text-sm text-slate-700">{selectedTeam.description || "—"}</div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Members</h4>
                              <span className="text-xs text-slate-500">{teamMembersDraft.length} selected</span>
                            </div>

                            <div className="border border-slate-300 rounded-lg p-4 max-h-80 overflow-y-auto">
                              {dashboardUsers
                                .filter((u) => u.status === "active" && u.role !== "admin")
                                .map((u) => {
                                  const leaderId = String(selectedTeamResponse.teamLeaderId);
                                  const isLeader = String(u.id) === leaderId;
                                  const checked = teamMembersDraft.includes(String(u.id)) || isLeader;

                                  return (
                                    <label
                                      key={u.id}
                                      className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isLeader ? "opacity-80" : "hover:bg-slate-50"}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={isLeader}
                                        onChange={(e) => {
                                          const id = String(u.id);
                                          if (e.target.checked) {
                                            setTeamMembersDraft((prev) => (prev.includes(id) ? prev : [...prev, id]));
                                          } else {
                                            setTeamMembersDraft((prev) => prev.filter((x) => x !== id));
                                          }
                                        }}
                                        className="rounded border-slate-300"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{u.name}</div>
                                        <div className="text-xs text-slate-500 truncate">{u.email}</div>
                                      </div>
                                      {isLeader ? (
                                        <span className="text-xs px-2 py-0.5 rounded-full border bg-sky-100 text-sky-700 border-sky-200">
                                          Leader
                                        </span>
                                      ) : null}
                                    </label>
                                  );
                                })}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Team Tasks</h4>
                              <span className="text-xs text-slate-500">{selectedTeamTasks.length} tasks</span>
                            </div>

                            <div className="border border-slate-300 rounded-lg p-4 max-h-80 overflow-y-auto">
                              {selectedTeamTasks.length === 0 ? (
                                <div className="text-sm text-slate-600">No tasks assigned to this team.</div>
                              ) : (
                                <div className="space-y-2">
                                  {selectedTeamTasks.map((t) => (
                                    <div key={t.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="font-medium text-sm truncate">{t.title}</div>
                                        <div className={`text-xs ${getPriorityColor(t.priority)}`}>{t.priority}</div>
                                      </div>
                                      <div className="text-xs text-slate-500">Status: {t.status}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => void handleSaveTeamMembers()}
                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                            disabled={savingTeamMembers}
                          >
                            {savingTeamMembers ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            onClick={closeTeamDetails}
                            variant="outline"
                            className="flex-1"
                            disabled={savingTeamMembers}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pending Tab unchanged */}
            {activeTab === "pending" && (
              <div className="space-y-6">
                {usersError && (
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {usersError}
                  </div>
                )}

                {usersLoading ? (
                  <div className="text-sm text-slate-600">Loading pending approvals…</div>
                ) : null}

                {pendingAdminUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl mb-2">All caught up!</h3>
                    <p className="text-slate-600">No pending approval requests at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAdminUsers.map(pending => (
                      <div
                        key={pending.id}
                        className="p-6 bg-white border border-amber-200 rounded-xl hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center text-white shrink-0">
                            {([pending.firstName, pending.lastName].filter(Boolean).join(" ") || pending.username || pending.email)
                              .split(" ")
                              .map(n => n[0])
                              .join("")}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium mb-1">
                                  {[pending.firstName, pending.lastName].filter(Boolean).join(" ") || pending.username}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {pending.email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Requested {formatDate(pending.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs border border-amber-200">
                                Pending
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => void handleApproveUser(String(pending.id))}
                                className="bg-green-500 hover:bg-green-600 text-white gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => void handleRejectUser(String(pending.id))}
                                variant="outline"
                                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(status) => void handleUpdateTaskStatus(selectedTask.id, status)}
        />
      )}
    </div>
  );
}