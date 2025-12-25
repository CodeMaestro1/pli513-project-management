declare module "@/services/tasks" {

    import type { Task, TaskStatus, Priority, TaskComment } from "@/types/task";

    export interface CreateTaskPayload {
        title: string;
        description: string;
        status: TaskStatus;
        priority: Priority;
        dueDate: string;
        teamId?: string;
        creatorId?: number;
        assignedToId?: number;
    }

    export type UpdateTaskPayload = Partial<CreateTaskPayload>;

    export interface TaskListFilters {
        assignedToId?: number;
        dueFrom?: string; // YYYY-MM-DD
        dueTo?: string;   // YYYY-MM-DD
    }

    export declare const taskService: {
        listAllTasks(params?: TaskListFilters): Promise<Task[]>;
        listMyTasks(params?: Omit<TaskListFilters, "assignedToId">): Promise<Task[]>;
        listByTeam(teamId: string, params?: Omit<TaskListFilters, "assignedToId">): Promise<Task[]>;
        create(payload: CreateTaskPayload): Promise<Task>;
        update(taskId: string, payload: UpdateTaskPayload): Promise<Task>;
        updateStatus(taskId: string, status: TaskStatus): Promise<Task>;
        remove(taskId: string): Promise<unknown>;

        listComments(taskId: string): Promise<TaskComment[]>;
        addComment(taskId: string, payload: { message: string }): Promise<TaskComment>;
    };

}
