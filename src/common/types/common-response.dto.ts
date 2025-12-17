
export interface CommonResponse<T = unknown> {
  message: string;
  statusCode: number;
  data?: T;
}