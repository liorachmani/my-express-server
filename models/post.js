const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sender_id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Post", postSchema);
