export interface AuthUser {
  id: string; // Supabase auth.users UUID
  email?: string;
  role?: string;
  appMetadata?: Record<string, unknown>;
  userMetadata?: Record<string, unknown>;
}

export interface AuthenticatedRequest {
  user: AuthUser;
  token: string;
}
