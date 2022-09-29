import { User } from "@prisma/client";

export type ReadableUser = Omit<User, 'password'>

export type CreateUserInput = Omit<User, 'createdAt, updatedAt, id, role, status'>

export type UpdateUserInput = CreateUserInput & Omit<User, 'role, status'>