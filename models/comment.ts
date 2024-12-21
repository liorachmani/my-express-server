import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender_id: {
    type: String,
    required: true,
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
});

export default mongoose.model("Comment", commentSchema);
