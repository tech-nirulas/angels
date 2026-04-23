import { Pagination } from "./meta.interface";

export interface Root<T> {
  status: boolean;
  message: string;
  data: T;
}
export interface RootPaginate<T> {
  status: boolean;
  message: string;
  data: T;
  meta: Pagination;
}

export interface ErrorResponse {
  data: {
    status: boolean;
    message: string;
    error: string;
  };
}
