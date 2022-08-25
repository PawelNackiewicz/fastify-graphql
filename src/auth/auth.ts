import { PrismaClient, Role, User } from "@prisma/client";
import { AuthenticationError } from "apollo-server";
import * as crypto from "crypto";
import { Context } from "../index";
import { CreateUserTokenDto, ReadableUser } from "./types";

const getReadableUser = ({ password, ...user }: User): ReadableUser => user;

export async function signUser(user: User, prisma: PrismaClient): Promise<string> {
  const token = await generateToken();
  const expireAt = new Date(new Date().getTime() + 60 * 60 * 24 * 1000).toString()

  await create({
    token,
    expireAt,
    userId: user.id,
  }, prisma);
  return token;
}

async function generateToken(): Promise<string> {
  return crypto.randomBytes(48).toString("hex");
}

async function create(createUserTokenDto: CreateUserTokenDto, prisma: PrismaClient) {
  return await prisma.token.create({ data: createUserTokenDto });
}

export async function getUser(token: string, prisma: PrismaClient) {
  const foundToken = await prisma.token.findUnique({
    where: {
      token,
    },
  });
  if (foundToken) {
    if(!tokenActinve(foundToken.expireAt)) return null
    const user = await prisma.user.findUnique({where: { id: foundToken.userId}})
    if(!user) return null
    return getReadableUser(user)
  }
  return null
}

function tokenActinve(expireAt: string) {
  return new Date(expireAt) > new Date(Date.now());
}

export const authenticated = (next: Function) => (root: unknown, args: unknown, context: Context, info: unknown) => {
  if (!context.user) {
    throw new AuthenticationError('must authenticate')
  }
  return next(root, args, context, info)
}

export const authorized = (role: Role, next: Function) => (root: unknown, args: unknown, context: Context, info: unknown) => {
  if (context.user?.role !== role) {
    throw new AuthenticationError(`you must have ${role} role`)
  }
  return next(root, args, context, info)
}