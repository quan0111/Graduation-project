import type { UserRoleType } from "../../../constant";

export interface IAuth {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}


export interface AuthUser {
  id: string;
  email: string;
  fullname: string;
  role: UserRoleType;
}
export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phone: string
}


export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}