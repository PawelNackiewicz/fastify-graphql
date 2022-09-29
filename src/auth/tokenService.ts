import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import { CreateUserTokenDto } from "./types";

export async function generateToken(): Promise<string> {
  return crypto.randomBytes(48).toString("hex");
}

export async function create(
  createUserTokenDto: CreateUserTokenDto,
  prisma: PrismaClient
) {
  return await prisma.token.create({ data: createUserTokenDto });
}

export function tokenActinve(expireAt: string) {
  return new Date(expireAt) > new Date(Date.now());
}