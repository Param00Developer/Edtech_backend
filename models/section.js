import mongoose, { mongo } from "mongoose";

const sectionSchema = mongoose.Schema({
  sectionName: {
    type: String,
  },
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubSection",
    },
  ],
});

export default mongoose.model("Section", sectionSchema);
