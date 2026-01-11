declare module "@/services/users" {
  export interface PublicUserName {
    id: number;
    displayName: string;
  }

  export interface ResolveUserIdResponse {
    id: number;
  }

  export declare const userService: {
    getPublicNames(ids: Array<number | string>): Promise<PublicUserName[]>;
    resolveUserId(username: string): Promise<ResolveUserIdResponse>;
    resolveUserIdByEmail(email: string): Promise<ResolveUserIdResponse>;
  };
}
