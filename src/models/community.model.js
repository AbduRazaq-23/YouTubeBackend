import mongoose, { Schema } from "mongoose";

const communitySchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Community = mongoose.model("Community", communitySchema);
