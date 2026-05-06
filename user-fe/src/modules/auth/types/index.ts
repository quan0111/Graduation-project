import type {  ICartShort } from "@/modules/cart/types";

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
  id: number;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
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
  token_type?: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type?: string;
}
