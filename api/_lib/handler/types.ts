import type { IncomingMessage, ServerResponse } from 'http';
import type { AuthUser } from '../auth/types';

export interface ApiRequest extends IncomingMessage {
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  cookies?: Record<string, string>;
  requestId: string;
  user?: AuthUser;
}

export interface ApiResponse extends ServerResponse {
  status: (statusCode: number) => ApiResponse;
  json: (data: unknown) => void;
}

export interface ApiHandlerContext {
  req: ApiRequest;
  res: ApiResponse;
  requestId: string;
  user: AuthUser | null;
}

export type ControllerHandler<T = unknown> = (
  context: ApiHandlerContext
) => Promise<T> | T;
