// import app from "./app.js";
// import { graphqlHTTP } from "express-graphql";
// import schema from "./schema/schema.js";
// import dotenv from "dotenv";

// dotenv.config();


// // Set up a route for the root path
// app.get('/', (req, res) => {
//   res.status(200).send('<h1>Welcome to My Node.js API!</h1><p>This API serves user data. Use the /api/users endpoint to interact with the user resources.</p>');
// });
// // GraphQL endpoint
// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema,
//     graphiql: true,
//   })
// );

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });




import app from "./app.js";
import { graphqlHTTP } from "express-graphql";
import schema from "./schema/schema.js";
import dotenv from "dotenv";

dotenv.config();

app.get('/', (req, res) => {
  res.status(200).send('<h1>Welcome to My Node.js API!</h1><p>This API serves user data. Use the /api/users endpoint to interact with the user resources.</p>');
});

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true, // Enables GraphiQL for testing GraphQL queries
  })
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
