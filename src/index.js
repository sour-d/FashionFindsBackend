const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const productSchema = require('./graphql/productSchema');
const resolvers = require('./graphql/resolvers');
const userSchema = require('./graphql/userSchema');
const { gql } = require('apollo-server-express');
const migrate = require('./migrate'); // Import the migration script

async function startServer() {
  const app = express();

  try {
    // Run the migration
    await migrate();
  } catch (error) {
    console.error("Migration failed:", error);
  }

  const server = new ApolloServer({
    typeDefs: [productSchema, userSchema],
    resolvers,
  });

  await server.start(); // Start the Apollo Server

  // Apply Apollo GraphQL middleware and set the path to /graphql
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
