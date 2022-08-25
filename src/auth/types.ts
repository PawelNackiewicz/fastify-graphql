import { User } from "@prisma/client";

export interface CreateUserTokenDto {
  token: string;
  expireAt: string;
  userId: number;
}

export type ReadableUser = Omit<User, 'password'>