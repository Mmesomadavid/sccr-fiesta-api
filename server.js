// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import helmet from "helmet";

dotenv.config();

const app = express();

// ✅ Middleware setup
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local frontend
      "https://www.soccerfirsteleven.com", // your deployed frontend
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ✅ Helmet security middleware with proper CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: [
          "'self'",
          "https://sccr-fiesta-api.vercel.app", // your API domain
          "https://www.soccerfirsteleven.com", // your frontend domain
        ],
      },
    },
  })
);

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Schema & Model
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
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

// ✅ POST route for Street Soccer registration
app.post("/api/street-soccer/register", async (req, res) => {
  try {
    const formData = req.body;

    // Save to MongoDB
    const newRegistration = new StreetRegistration(formData);
    await newRegistration.save();

    // Send email to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "sccrfiesta@gmail.com",
      subject: "New Street Soccer Registration",
      html: `
        <h2>New Street Soccer Registration</h2>
        <p><b>Team Name:</b> ${formData.teamName}</p>
        <p><b>Community:</b> ${formData.community}</p>
        <p><b>Captain:</b> ${formData.captainName}</p>
        <p><b>Email:</b> ${formData.email}</p>
        <p><b>Phone:</b> ${formData.phone}</p>
        <p><b>Players:</b> ${[formData.player1, formData.player2, formData.player3, formData.player4, formData.player5]
          .filter(Boolean)
          .join(", ")}</p>
        <p><b>Message:</b> ${formData.message || "N/A"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("⚽ SCCR Fiesta API is running securely 🚀");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
