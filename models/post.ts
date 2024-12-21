import mongoose from "mongoose";

export interface IPost {
  title: string;
  content: string;
  sender_id: string;
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
  sender_id: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IPost & mongoose.Document>("Post", postSchema);
