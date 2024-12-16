import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: String }, // Date of Birth
  cycleDuration: { type: Number }, // Cycle duration in days
  periodDuration: { type: Number }, // Period duration in days
  height: { type: Number }, // Height in cm
  weight: { type: Number }, // Weight in kg
  // lastPeriod: { type: String }, // Last period as a string (e.g., "startDate to endDate")

  lastPeriod: {
    startDate: { type: String },
    endDate: { type: String },
  },
  preferences: { type: [String] }, // Array of preferences
});

const User = mongoose.model('User', userSchema);

export default User;
