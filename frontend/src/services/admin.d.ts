import type { AdminUser, UserRole } from "@/types/user";

export const adminService: {
  listUsers(): Promise<AdminUser[]>;
  approveUser(userId: string | number): Promise<AdminUser>;
  disableUser(userId: string | number): Promise<AdminUser>;
  enableUser(userId: string | number): Promise<AdminUser>;
  updateRole(userId: string | number, role: UserRole): Promise<AdminUser>;
  deleteUser(userId: string | number): Promise<void>;
};
