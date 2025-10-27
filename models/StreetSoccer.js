import mongoose from "mongoose"

const StreetSoccerSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
    },
    community: {
      type: String,
      required: true,
    },
    captainName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    players: [
      {
        fullName: { type: String, required: true },
        imageUrl: { type: String }, // Store image URL for each player
      },
    ],
    additionalInfo: { type: String },
  },
  { timestamps: true },
)

export default mongoose.model("StreetSoccer", StreetSoccerSchema)
