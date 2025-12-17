export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string;

  status: TaskStatus; // Ensure status uses the TaskStatus type consistently
  priority: Priority;

  dueDate: string; // Use ISO string format for dates
  createdAt: string; // Use ISO string format for timestamps
  updatedAt: string; // Use ISO string format for timestamps

  teamId?: string;      // ID of the team this task belongs to
  creatorId?: number;   // ID of the user who created the task
  assignedToId?: number; // ID of the user assigned to the task
}