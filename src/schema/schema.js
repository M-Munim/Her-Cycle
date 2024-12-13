import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLNonNull } from "graphql";

// Define the UserType with DOB as a string
const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    dob: { type: GraphQLString }, // DOB as string
  },
});

// Root Query for fetching data
const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    // Fetch all users
    getAllUsers: {
      type: new GraphQLList(UserType),
      resolve: async () => {
        return await User.find(); // Get all users from the database
      },
    },
    // Get a user's details using their token (Including DOB)
    getUserDOB: {
      type: UserType,
      args: {
        token: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { token }) {
        // Verify the token
        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          throw new Error("Authentication failed, invalid token.");
        }

        // Find the user by ID and return their details
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found.");
        }
        return user; // Returns the user including the dob
      },
    },
  },
});

// Root Mutation for performing operations
const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Signup mutation to create a new user
    signup: {
      type: new GraphQLObjectType({
        name: "Signup",
        fields: {
          username: { type: GraphQLString },
          email: { type: GraphQLString },
          message: { type: GraphQLString },
        },
      }),
      args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        confirmPassword: { type: GraphQLString },
      },
      async resolve(_, { username, email, password, confirmPassword }) {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("Email is already registered");
        }

        // Validate password
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("Password must be at least 6 characters long and include at least one letter, one number, and one special character");
        }

        // Check if passwords match
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        return { username, email, message: "User registered successfully!" };
      },
    },

    // Signin mutation to authenticate and generate a token
    signin: {
      type: new GraphQLObjectType({
        name: "Signin",
        fields: {
          token: { type: GraphQLString },
          message: { type: GraphQLString },
        },
      }),
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(_, { email, password }) {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User does not exist");
        }

        // Check if the password is correct
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Create a JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        return { token, message: "Sign in successful" };
      },
    },

    // Mutation to create or update the user's DOB
    createUserDOB: {
      type: UserType,
      args: {
        dob: { type: GraphQLNonNull(GraphQLString) }, // DOB as a string
        token: { type: GraphQLNonNull(GraphQLString) }, // Token for authentication
      },
      async resolve(_, { dob, token }) {
        // Verify JWT token
        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          throw new Error("Authentication failed, invalid token.");
        }

        // Find the user and update their DOB
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found.");
        }

        user.dob = dob; // Update DOB
        await user.save(); // Save the changes
        return user; // Return the updated user
      },
    },
  },
});

// Combine the RootQuery and RootMutation into a complete schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;
