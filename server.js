const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
const schema = require("./schema");

const app = express();

// by running localhost:3000 we're trying to make request to localhost:5000, our server is not letting us because of security issues
// Allow cross-origin
app.use(cors());

// in graphql-express we dont create different routes
// we'll create a schema file and put there all queries and mutations
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true, // client which allows us create queries in server
  })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
