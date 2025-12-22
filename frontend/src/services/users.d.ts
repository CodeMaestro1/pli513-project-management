declare module "@/services/users" {
  export interface PublicUserName {
    id: number;
    displayName: string;
  }

  export declare const userService: {
    getPublicNames(ids: Array<number | string>): Promise<PublicUserName[]>;
  };
}
