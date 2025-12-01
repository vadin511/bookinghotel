export interface UserPayload {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  iat: number;
  exp: number;
}
