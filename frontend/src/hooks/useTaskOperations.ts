import { useState } from "react";
import { taskService } from "@/services/tasks";
import type { Task } from "@/types/task";

// Define the shape of your form data
export interface TaskFormState {
  title: string;
  description: string;
  priority: Task["priority"];
  dueDate: string;
  teamId: string;

  /** Optional override. Used by admins to create tasks on behalf of a team leader. */
  creatorId?: number;

  /** Optional override. Used by admins to assign to the team leader by default. */
  assignedToId?: number;
}

export const initialTaskFormState: TaskFormState = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
  teamId: "",
  creatorId: undefined,
  assignedToId: undefined,
};

export function useTaskOperations(
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  currentUserId?: number
) {
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState<TaskFormState>(initialTaskFormState);

  // Helper to extract error message
  const getErrorMessage = (err: unknown): string => {
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const maybe = err as { message?: string; response?: { data?: { message?: string } } };
      return maybe.response?.data?.message ?? maybe.message ?? "Operation failed";
    }
    return "Operation failed";
  };

  const createTask = async () => {
    if (!newTask.title || !newTask.dueDate) return;

    setError(null);
    try {
      // Backend expects LocalDateTime (no timezone), e.g. 2025-12-21T00:00:00
      const dueDateIso = `${newTask.dueDate}T00:00:00`;
      
      const created = await taskService.create({
        title: newTask.title,
        description: newTask.description,
        status: "TODO",
        priority: newTask.priority,
        dueDate: dueDateIso,
        teamId: newTask.teamId || undefined,
        creatorId: newTask.creatorId ?? currentUserId,
        assignedToId: newTask.assignedToId ?? currentUserId,
      });

      // Update local state
      setTasks((prev) => [...prev, created]);

      // Reset form
      setNewTask(initialTaskFormState);
      setShowCreateModal(false);
      return true; // Indicate success
    } catch (e) {
      setError(getErrorMessage(e));
      return false;
    }
  };

  const deleteTask = async (
    taskId: string, 
    selectedTask: Task | null, 
    // Fix: Use the correct React state setter type
    setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
  ) => {
    setError(null);
    try {
      await taskService.remove(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      
      // If the deleted task was selected/open, close it
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const updateTaskStatus = async (
    taskId: string, 
    status: Task["status"],
    // Fix: Use the correct React state setter type here too
    setSelectedTask?: React.Dispatch<React.SetStateAction<Task | null>>
  ) => {
    setError(null);
    try {
      const updated = await taskService.updateStatus(taskId, status);
      
      // Update list
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      
      // Update selected view if provided
      if (setSelectedTask) {
        // This line caused the error because setSelectedTask wasn't typed to accept a function
        setSelectedTask((prev) => (prev?.id === taskId ? updated : prev));
      }
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return {
    // State
    error,
    setError,
    newTask,
    setNewTask,
    showCreateModal,
    setShowCreateModal,
    
    // Actions
    createTask,
    deleteTask,
    updateTaskStatus
  };
}