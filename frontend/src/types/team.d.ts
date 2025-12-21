export interface Team {
  id: string;
  name: string;
  description: string;
  leader: string;
  memberIds: string[];
  createdDate: string;
  tasksCount: number;
}