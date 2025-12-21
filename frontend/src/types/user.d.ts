export interface userData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  location: string;
  joinDate: string;
  avatar: string;
}

export type UserRole = 'ADMIN' | 'LEADER' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'DISABLED';

// Matches backend `RegisterResponse` for `/api/v1/admin/users`.
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  requestedDate: string;
  message?: string;
}
