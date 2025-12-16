import type { User } from "@/context/AuthProvider";

export type LoginResponse = {
	token: string;
	user?: User;
};

export type RegisterPayload = {
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
};

export declare const authService: {
	login(username: string, password: string): Promise<LoginResponse>;
	register(payload: RegisterPayload): Promise<unknown>;
	me(): Promise<unknown>;
};
declare module '*';