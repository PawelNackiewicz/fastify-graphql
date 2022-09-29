import { Context } from "../src";
import { authenticated, signUser } from "../src/auth/authService";
const { gql } = require("apollo-server");
import * as bcrypt from "bcrypt";
import { createUser } from "../src/user/userService";
import { CreateUserInput } from "../src/user/types";

export const typeDefs = gql`
  scalar Date
  type User {
    id: ID!
    login: String!
    firstName: String!
    lastName: String!
    password: String!
    status: String!
    role: String!
  }

  type Service {
    id: ID!
    title: String!
    duration: String
    price: String
    priority: String
    Visit: [Visit]
  }

  type Visit {
    id: ID!
    customer: Customer
    service: Service
    scheduledBy: User
    executor: User
    data: String
    status: String
    notes: String
  }

  type Customer {
    id: ID!
    createdAt: String
    updatedAt: String
    firstName: String
    lastName: String
    gender: String
    birthday: String
    email: String
    phone: String
    points: Int
    source: String
    photoUrl: String
    instagram: String
    facebook: String
    notes: String
    marketingPermission: Boolean
    healthContraindications: String
    visits: [Visit]
  }

  type Query {
    me: User!
  }

  type Mutation {
    login(input: SigninInput): AuthUser
    createUser(input: CreateUserInput): User
  }

  input SigninInput {
    login: String!
    password: String!
  }

  input CreateUserInput {
    login: String!
    firstName: String!
    lastName: String!
    password: String!
  }

  type AuthUser {
    id: ID!
    login: String!
    firstName: String!
    lastName: String!
    status: String!
    role: String!
  }
`;

interface loginInputs {
  login: string,
  password: string
}

export const resolvers = {
  Query: {
    me: authenticated(async (root: unknown, args: unknown, context: Context, info: unknown) => {
      console.log(context);
      return context.user
    }),
  },
  Mutation: {
    async login(root: unknown, { input }: {input: loginInputs}, { prisma, reply }: Context) {
      const foundUser = await prisma.user.findUnique({
        where: { login: input.login },
      });

      const correctCredentials =
        foundUser && (await bcrypt.compare(input.password, foundUser.password));

      if (correctCredentials) {
        const token = await signUser(foundUser, prisma);
        reply.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
        return foundUser;
      }
      reply.cookie("token", '');
      throw new Error("Invalid credentials");
    },
    async createUser(root: unknown, { input }: {input: CreateUserInput}, { prisma }: Context) {
      try {
        return await createUser(input, 'USER', prisma)
      } catch(e) {
        console.error(e);
      }
    },
  },
};
