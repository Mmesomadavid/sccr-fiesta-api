import mongoose from "mongoose";

const SoccerFiestaSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true
 },
  lastName: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true 
},
  phoneNumber: { 
    type: String, 
    required: true 
},
  secondaryPhone: { 
    type: String 
},
  country: { 
    type: String, 
    required: true 
},
  state: { 
    type: String, 
    required: true 
},
  age: { 
    type: Number, 
    required: true 
},
  maritalStatus: { 
    type: String, 
    required: true 
},
  bio: { 
    type: String 
},
  createdAt: { 
    type: Date, 
    default: Date.now
},
});

export default mongoose.model("SoccerFiesta", SoccerFiestaSchema);
