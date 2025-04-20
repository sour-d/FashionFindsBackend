const { gql } = require('apollo-server-express');

// GraphQL schema definition
const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
  }

  type Query {
    products: [Product]
    product(id: ID!): Product
  }
`;

module.exports = typeDefs;
