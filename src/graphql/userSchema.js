const { gql } = require('apollo-server-express');

const userSchema = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Query {
    users: [User]
    user(id: String!): User
    validateUser(username: String!, password: String!): String
    me: User
  }

  type Mutation {
    createUser(username: String!, password: String!, email: String!): User
  }
`;

module.exports = userSchema;
