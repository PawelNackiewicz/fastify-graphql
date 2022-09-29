import { PrismaClient, Role, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { CreateUserInput, ReadableUser, UpdateUserInput } from "./types";

export const getReadableUser = ({ password, ...user }: User): ReadableUser => user;

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function createUser(
  createUserDTO: CreateUserInput,
  role: Role,
  prisma: PrismaClient
) {
  const hash = await hashPassword(createUserDTO.password);
  const createdUser = await prisma.user.create({
    data: {
      ...createUserDTO,
      password: hash,
      role,
      status: 'ACTIVE',
    },
  });
  return getReadableUser(createdUser);
}

export async function findById(id: number, prisma: PrismaClient) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function findByLogin(login: string, prisma: PrismaClient) {
  return await prisma.user.findUnique({
    where: {
      login,
    },
  });
}

export async function update(
  id: number,
  updateUserDTO: UpdateUserInput, 
  prisma: PrismaClient
) {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      ...updateUserDTO,
    },
  });
}