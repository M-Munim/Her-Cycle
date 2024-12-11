// import app from "../app.js";
// import { graphqlHTTP } from "express-graphql";
import schema from "../schema/schema.js";
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


// {
//   "version": 2,
//   "builds": [
//     {
//       "src": "src/index.js",
//       "use": "@vercel/node",
//       "config": {
//         "maxDuration": 30
//       }
//     }
//   ],
//   "routes": [
//     {
//       "src": "/graphql",
//       "dest": "src/index.js"
//     }
//   ]
// }



import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { graphqlHTTP } from "express-graphql";
// import schema from "../schema/schema.js" ; // Adjust the path to your schema

dotenv.config();

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Root route
app.get("/", (req, res) => {
  res.status(200).send('<h1>Welcome to My Node.js API!</h1><p>This API serves user data. Use the /graphql endpoint to interact with the user resources.</p>');
});

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

// // Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export the app for serverless function handling
export default app;
