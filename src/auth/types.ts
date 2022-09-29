import { User } from "@prisma/client";

export type LoginInput = Pick<User, 'password' | 'login'>
export interface CreateUserTokenDto {
  token: string;
  expireAt: string;
  userId: number;
}
