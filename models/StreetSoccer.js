import mongoose from "mongoose";

const StreetSoccerSchema = new mongoose.Schema({
  teamName: { 
    type: String, 
    required: true 
},
  community: { 
    type: String, 
    required: true
},
  captainName: { 
    type: String, 
    required: true
},
  email: { 
    type: String, 
    required: true 
},
  phone: { 
    type: String, 
    required: true 
},
  players: [
    { fullName: { type: String, required: true } }
  ],
  additionalInfo: { type: String },
}, { timestamps: true });

export default mongoose.model("StreetSoccer", StreetSoccerSchema);
