# FashionFindsBackend GraphQL API

This project provides a GraphQL API backend for the FashionFinds e-commerce website, built with Node.js, Express, and Apollo Server.

## Features

*   Exposes a GraphQL endpoint at `/graphql`.
*   Provides queries to fetch product data (currently using dummy data).
*   Includes product details like ID, name, description, price, and stock.

## Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Running the Application

*   **Development Mode (with hot-reloading):**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:4000/graphql`.

*   **Production Mode:**
    ```bash
    npm start
    ```

## API Endpoint

The GraphQL API is available at `http://localhost:4000/graphql`. You can use tools like the GraphQL Playground (available at the endpoint URL in your browser when running in development) or `curl` to interact with the API.

## Project Structure

```
/
├── .doc/
│   └── product.txt       # API contract for products
├── src/
│   ├── data.js           # Dummy data
│   ├── graphql/
│   │   ├── resolvers.js  # GraphQL resolvers
│   │   └── schema.js     # GraphQL schema definitions
│   └── index.js          # Main application entry point
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
