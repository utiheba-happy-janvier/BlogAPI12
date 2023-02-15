const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "please  Name field is required "],
  },
  email: {
    type: String,
    required: [true, "Email field is required "],
  },
  comment: {
    type: String,
    required: [true, "Comment field is required "],
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
