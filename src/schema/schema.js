import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList } from "graphql";

// Define the UserType for querying user data
// This type represents the structure of user data returned in queries
const UserType = new GraphQLObjectType({
  name: "User", // Name of the GraphQL type
  fields: {
    id: { type: GraphQLString }, // User's unique ID
    username: { type: GraphQLString }, // User's username
    email: { type: GraphQLString }, // User's email
  },
});

// Root Query for handling all GraphQL queries
const RootQuery = new GraphQLObjectType({
  name: "Query", // Name of the root query
  fields: {
    // Fetch all users from the database
    users: {
      type: new GraphQLList(UserType), // Returns a list of UserType
      resolve: async () => {
        return await User.find(); // Retrieve all users from MongoDB
      },
    },
    // Fetch a single user by their email
    userByEmail: {
      type: UserType, // Returns a single UserType
      args: {
        email: { type: GraphQLString }, // Email is required as an argument
      },
      resolve: async (_, { email }) => {
        return await User.findOne({ email }); // Find a user by email in MongoDB
      },
    },
  },
});

// Root Mutation for handling all GraphQL mutations
const RootMutation = new GraphQLObjectType({
  name: "Mutation", // Name of the root mutation
  fields: {
    // Mutation for user signup
    signup: {
      type: new GraphQLObjectType({
        name: "Signup", // Name of the signup mutation type
        fields: {
          username: { type: GraphQLString }, // Username of the newly registered user
          email: { type: GraphQLString }, // Email of the newly registered user
          message: { type: GraphQLString }, // Success or error message
        },
      }),
      args: {
        username: { type: GraphQLString }, // User's username
        email: { type: GraphQLString }, // User's email
        password: { type: GraphQLString }, // User's password
        confirmPassword: { type: GraphQLString }, // Confirmation of the password
      },
      async resolve(_, args) {
        const { username, email, password, confirmPassword } = args;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("Email is already registered");
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("Password must be at least 6 characters long and include at least one letter, one number, and one special character");
        }

        // Check if passwords match
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance and save it to the database
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        return { username, email, message: "User registered successfully!" };
      },
    },
    // Mutation for user signin
    signin: {
      type: new GraphQLObjectType({
        name: "Signin", // Name of the signin mutation type
        fields: {
          token: { type: GraphQLString }, // JWT token for authenticated sessions
          message: { type: GraphQLString }, // Success or error message
        },
      }),
      args: {
        email: { type: GraphQLString }, // User's email
        password: { type: GraphQLString }, // User's password
      },
      async resolve(_, args) {
        const { email, password } = args;
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User does not exist");
        }
        // Validate the password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        // Generate a JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        return { token, message: "Sign in successful" };
      },
    },
  },
});

// Combine RootQuery and RootMutation into a single schema
const schema = new GraphQLSchema({
  query: RootQuery, // Register the query root
  mutation: RootMutation, // Register the mutation root
});

export default schema;