const { gql } = require('apollo-server-express');

// GraphQL schema definition for products
const productSchema = gql`
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

module.exports = productSchema;
