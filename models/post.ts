import mongoose from "mongoose";

export interface IPost {
  title: string;
  content: string;
  user_id: string;
  image?: string;
}

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  image: {
    type: String,
    required: false,
  },
});

export default mongoose.model<IPost & mongoose.Document>("Post", postSchema);
