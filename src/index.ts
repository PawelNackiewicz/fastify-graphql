import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from './server';
import { typeDefs, resolvers } from '../graphql/graphql'
import { ApolloServerPlugin } from 'apollo-server-plugin-base';

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