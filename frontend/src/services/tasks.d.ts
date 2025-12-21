declare module "@/services/tasks" {

    import type { Task, TaskStatus, Priority } from "@/types/task";

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

    export declare const taskService: {
        listMyTasks(): Promise<Task[]>;
        create(payload: CreateTaskPayload): Promise<Task>;
        update(taskId: string, payload: UpdateTaskPayload): Promise<Task>;
        updateStatus(taskId: string, status: TaskStatus): Promise<Task>;
        remove(taskId: string): Promise<unknown>;
    };

}
