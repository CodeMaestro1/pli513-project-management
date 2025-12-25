import type { AxiosInstance } from "axios";

export type NormalizedApiError = {
  status: number;
  code: string;
  message: string;
  isAxios: boolean;
  raw: unknown;
};

export declare function normalizeApiError(err: unknown): NormalizedApiError;

export declare const userApi: AxiosInstance;
export declare const taskApi: AxiosInstance;
export declare const teamApi: AxiosInstance;
