const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name of user is required"],
   //  minLength: 6,
   //  maxLength: 255,
  },
  email: {
    type: String,
    required: [true, "Email of user is required"],
    //  maxLength: ,
    //  minLength: 6,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password field is required"],
    //  minLength: 6,
    //  maxLength: 255,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
