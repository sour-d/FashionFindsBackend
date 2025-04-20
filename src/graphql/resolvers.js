const { products } = require('../data');

// Resolvers define how to fetch the types defined in the schema
const resolvers = {
  Query: {
    products: () => products,
    product: (parent, args) => products.find(product => product.id === args.id),
  },
};

module.exports = resolvers;
