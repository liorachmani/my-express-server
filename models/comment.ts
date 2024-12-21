import mongoose from "mongoose";

export interface IComment {
  message: string;
  sender_id: string;
  post_id: string;
}

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

export default mongoose.model<IComment & mongoose.Document>(
  "Comment",
  commentSchema
);
