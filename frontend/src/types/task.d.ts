export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: number;
  message: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;

  status: TaskStatus; // Ensure status uses the TaskStatus type consistently
  priority: Priority;

  dueDate: string; // Backend LocalDateTime-like string
  createdAt: string; // Backend Instant-like string
  updatedAt?: string; // Not always present historically; prefer showing via formatter when provided

  teamId?: string;      // ID of the team this task belongs to
  creatorId?: number;   // ID of the user who created the task
  assignedToId?: number; // ID of the user assigned to the task
}