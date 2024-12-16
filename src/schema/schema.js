// Import required modules and models
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} from "graphql";

// Define the UserType schema with necessary fields
const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString }, // User's ID
    username: { type: GraphQLString }, // User's username
    email: { type: GraphQLString }, // User's email
    dob: { type: GraphQLString }, // User's Date of Birth
    cycleDuration: { type: GraphQLInt }, // Cycle duration (in days)
    periodDuration: { type: GraphQLInt }, // Period duration (in days)
    // -----------------------------------------
    height: { type: GraphQLInt }, // User's height in cm
    weight: { type: GraphQLInt }, // User's weight in kg
    lastPeriod: { type: GraphQLString }, // Start and end date of last period
    preferences: { type: new GraphQLList(GraphQLString) }, // User's preferences
    // -----------------------------------------
  },
});

// Root Mutation for performing operations like creating and updating data
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
          message: { type: GraphQLString }, // Success message
        },
      }),
      args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        confirmPassword: { type: GraphQLString },
      },
      async resolve(_, { username, email, password, confirmPassword }) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("Email is already registered");
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error(
            "Password must be at least 6 characters long and include at least one letter, one number, and one special character"
          );
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        return { username, email, message: "User registered successfully!" };
      },
    },

    // Signin mutation to authenticate user and generate a token
    signin: {
      type: new GraphQLObjectType({
        name: "Signin",
        fields: {
          token: { type: GraphQLString }, // JWT token for authentication
          message: { type: GraphQLString }, // Success message
        },
      }),
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(_, { email, password }) {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User does not exist");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return { token, message: "Sign in successful" };
      },
    },

    // Mutation to create or update the user's Date of Birth (DOB)
    createUserDOB: {
      type: UserType,
      args: {
        dob: { type: GraphQLNonNull(GraphQLString) },
        token: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { dob, token }) {
        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          throw new Error("Authentication failed, invalid token.");
        }
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found.");
        }
        user.dob = dob;
        await user.save();
        return user;
      },
    },

    // Mutation to update user's cycle and period lengths
    userCycleAndPeriodLength: {
      type: UserType,
      args: {
        cycleDuration: { type: GraphQLNonNull(GraphQLInt) },
        periodDuration: { type: GraphQLNonNull(GraphQLInt) },
        token: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { cycleDuration, periodDuration, token }) {
        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          throw new Error("Authentication failed, invalid token.");
        }
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found.");
        }
        user.cycleDuration = cycleDuration;
        user.periodDuration = periodDuration;
        await user.save();
        return user;
      },
    },





    // Mutation to add user's height
    addHeight: {
      type: UserType,
      args: {
        height: { type: GraphQLNonNull(GraphQLInt) },
        token: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { height, token }) {
        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          throw new Error("Authentication failed, invalid token.");
        }
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found.");
        }
        user.height = height;
        await user.save();
        return user;
      },
    },

    // Mutation to add user's weight
    addWeight: {
      type: UserType,
      args: {
        weight: { type: GraphQLNonNull(GraphQLInt) },
        token: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { weight, token }) {
        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          throw new Error("Authentication failed, invalid token.");
        }
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found.");
        }
        user.weight = weight;
        await user.save();
        return user;
      },
    },

    // Mutation to mark the start and end date of the last period
    // markLastPeriod: {
    //   type: UserType,
    //   args: {
    //     startDate: { type: GraphQLNonNull(GraphQLString) },
    //     endDate: { type: GraphQLNonNull(GraphQLString) },
    //     token: { type: GraphQLNonNull(GraphQLString) },
    //   },
    //   async resolve(_, { startDate, endDate, token }) {
    //     let userId;
    //     try {
    //       const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //       userId = decoded.userId;
    //     } catch (err) {
    //       throw new Error("Authentication failed, invalid token.");
    //     }
    //     const user = await User.findById(userId);
    //     if (!user) {
    //       throw new Error("User not found.");
    //     }
    //     user.lastPeriod = `${startDate} to ${endDate}`;
    //     await user.save();
    //     return user;
    //   },
    // },

    markLastPeriod: {
      type: new GraphQLObjectType({
        name: "MarkLastPeriodResponse",
        fields: {
          id: { type: GraphQLString },
          username: { type: GraphQLString },
          email: { type: GraphQLString },
          dob: { type: GraphQLString },
          cycleDuration: { type: GraphQLInt },
          periodDuration: { type: GraphQLInt },
          height: { type: GraphQLInt },
          weight: { type: GraphQLInt },
          startDate: { type: GraphQLString },
          endDate: { type: GraphQLString },
        },
      }),
      args: {
        startDate: { type: GraphQLNonNull(GraphQLString) },
        endDate: { type: GraphQLNonNull(GraphQLString) },
        token: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { startDate, endDate, token }) {
        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          throw new Error("Authentication failed, invalid token.");
        }
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found.");
        }

        // Update the lastPeriod field
        user.lastPeriod = { startDate, endDate }; // Update to save as an object
        await user.save();
        // Return user details including updated period information
        // Return all user details
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          dob: user.dob,
          cycleDuration: user.cycleDuration,
          periodDuration: user.periodDuration,
          height: user.height,
          weight: user.weight,
          startDate,
          endDate,
        };
      },
    },

    choosePreferences: {
      type: new GraphQLObjectType({
        name: "ChoosePreferencesResponse",
        fields: {
          id: { type: GraphQLString },
          username: { type: GraphQLString },
          email: { type: GraphQLString },
          dob: { type: GraphQLString },
          cycleDuration: { type: GraphQLInt },
          periodDuration: { type: GraphQLInt },
          height: { type: GraphQLInt },
          weight: { type: GraphQLInt },
          preferences: { type: new GraphQLList(GraphQLString) }, // List of preferences
        },
      }),
      args: {
        preferences: { type: GraphQLNonNull(new GraphQLList(GraphQLString)) },
        token: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { preferences, token }) {
        if (preferences.length < 3) {
          throw new Error("You must select at least 3 preferences.");
        }

        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          throw new Error("Authentication failed, invalid token.");
        }

        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found.");
        }

        // Update the user's preferences
        user.preferences = preferences;
        await user.save();

        // Return all user details including preferences
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          dob: user.dob,
          cycleDuration: user.cycleDuration,
          periodDuration: user.periodDuration,
          height: user.height,
          weight: user.weight,
          preferences: user.preferences,
        };
      },
    },

  },
});

// Root Query for fetching user data
const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    // Fetch all users
    getAllUsers: {
      type: new GraphQLList(new GraphQLObjectType({
        name: "UserResponse",
        fields: {
          id: { type: GraphQLString },
          username: { type: GraphQLString },
          email: { type: GraphQLString },
          dob: { type: GraphQLString },
          cycleDuration: { type: GraphQLInt },
          periodDuration: { type: GraphQLInt },
          height: { type: GraphQLInt },
          weight: { type: GraphQLInt },
          startDate: { type: GraphQLString },
          endDate: { type: GraphQLString },
          preferences: { type: new GraphQLList(GraphQLString) },
        },
      })),
      async resolve() {
        const users = await User.find();
        return users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          dob: user.dob,
          cycleDuration: user.cycleDuration,
          periodDuration: user.periodDuration,
          height: user.height,
          weight: user.weight,
          startDate: user.lastPeriod?.startDate,
          endDate: user.lastPeriod?.endDate,
          preferences: user.preferences,
        }));
      },
    },

    // Fetch a specific user by ID or token
    getSpecificUser: {
      type: new GraphQLObjectType({
        name: "SpecificUserResponse",
        fields: {
          id: { type: GraphQLString },
          username: { type: GraphQLString },
          email: { type: GraphQLString },
          dob: { type: GraphQLString },
          cycleDuration: { type: GraphQLInt },
          periodDuration: { type: GraphQLInt },
          height: { type: GraphQLInt },
          weight: { type: GraphQLInt },
          startDate: { type: GraphQLString },
          endDate: { type: GraphQLString },
          preferences: { type: new GraphQLList(GraphQLString) },
        },
      }),
      args: {
        id: { type: GraphQLString },
        token: { type: GraphQLString },
      },
      async resolve(_, { id, token }) {
        let user;
        if (id) {
          user = await User.findById(id);
        } else if (token) {
          let userId;
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
          } catch (err) {
            throw new Error("Authentication failed, invalid token.");
          }
          user = await User.findById(userId);
        }

        if (!user) {
          throw new Error("User not found.");
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          dob: user.dob,
          cycleDuration: user.cycleDuration,
          periodDuration: user.periodDuration,
          height: user.height,
          weight: user.weight,
          startDate: user.lastPeriod?.startDate,
          endDate: user.lastPeriod?.endDate,
          preferences: user.preferences,
        };
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