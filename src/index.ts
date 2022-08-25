import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from './server';
import { typeDefs, resolvers } from '../graphql/graphql'
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { PrismaClient } from "@prisma/client";
import { ReadableUser } from './auth/types';
import { getUser } from './auth/auth';
import type { FastifyCookieOptions } from '@fastify/cookie'
import cookie from '@fastify/cookie'

const prisma = new PrismaClient()
export interface Context {
  prisma: PrismaClient,
  user: ReadableUser | null,
  request: FastifyRequest,
  reply: FastifyReply
}

function fastifyAppClosePlugin(app: FastifyInstance): ApolloServerPlugin {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
}

async function startApolloServer() {
  const app = Fastify();
  app.register(cookie, {
    secret: "my-secret", // for cookies signature
    parseOptions: {}     // options for parsing cookies
  } as FastifyCookieOptions)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      fastifyAppClosePlugin(app),
      ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    context: async({request, reply}): Promise<Context> => {
      const token = request.headers.cookie?.replace('token=', '') || '';
      const user = await getUser(token, prisma)
      return {prisma, user, request, reply}
  },
  });

  try {
    await server.start();
    app.register(server.createHandler());
    await app.listen({port: 4000});
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  } catch(e) {
    console.error(e)
  }
}

startApolloServer()