// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Define Schema & Model
const streetSchema = new mongoose.Schema({
  teamName: String,
  community: String,
  captainName: String,
  email: String,
  phone: String,
  player1: String,
  player2: String,
  player3: String,
  player4: String,
  player5: String,
  message: String,
});

const StreetRegistration = mongoose.model("StreetRegistration", streetSchema);

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password (not regular password)
  },
});

// ✅ POST route for Street Soccer registration
app.post("/api/street-soccer/register", async (req, res) => {
  try {
    const formData = req.body;

    // Save to MongoDB
    const newRegistration = new StreetRegistration(formData);
    await newRegistration.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "sccrfiesta@gmail.com",
      subject: "New Street Soccer Registration",
      html: `
        <h3>New Street Soccer Registration</h3>
        <p><b>Team Name:</b> ${formData.teamName}</p>
        <p><b>Community:</b> ${formData.community}</p>
        <p><b>Captain:</b> ${formData.captainName}</p>
        <p><b>Email:</b> ${formData.email}</p>
        <p><b>Phone:</b> ${formData.phone}</p>
        <p><b>Players:</b> ${formData.player1}, ${formData.player2}, ${formData.player3}, ${formData.player4 || ""}, ${formData.player5 || ""}</p>
        <p><b>Message:</b> ${formData.message || "N/A"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
