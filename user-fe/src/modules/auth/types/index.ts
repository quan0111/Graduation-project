import type {  ICartShort } from "@/modules/cart/types";
import type { UserRoleType } from "../../../constant";

export interface IAuth {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface IMe {
  id: number;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  cart: ICartShort;
}
export interface AuthUser {
  id: string;
  email: string;
  fullname: string;
  avatarUrl?: string;
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