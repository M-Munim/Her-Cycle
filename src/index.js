import app from "./app.js";
import { graphqlHTTP } from "express-graphql";
import schema from "./schema/schema.js";
import dotenv from "dotenv";

dotenv.config();

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
