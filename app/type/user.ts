export interface UserPayload {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string | null;
  iat: number;
  exp: number;
}
