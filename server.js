import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import helmet from "helmet"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"

dotenv.config()

const app = express()

// ✅ Multer setup (no disk storage, just buffer)
const upload = multer({ storage: multer.memoryStorage() })

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: "mmesoma",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ✅ Middleware setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.soccerfirsteleven.com",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json())

// ✅ Helmet security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com/mmesoma/"],
        connectSrc: [
          "'self'",
          "https://sccr-fiesta-api.vercel.app",
          "https://www.soccerfirsteleven.com",
        ],
      },
    },
  })
)

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

// ✅ Mongoose schemas
const streetSchema = new mongoose.Schema({
  teamName: String,
  community: String,
  captainName: String,
  email: String,
  phone: String,
  players: [String],
  message: String,
  images: [String],
})

const StreetRegistration = mongoose.model("StreetRegistration", streetSchema)

const soccerFiestaSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  secondaryPhone: String,
  country: String,
  state: String,
  age: Number,
  maritalStatus: String,
  bio: String,
  createdAt: { type: Date, default: Date.now },
})

const SoccerFiesta = mongoose.model("SoccerFiesta", soccerFiestaSchema)

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ✅ Helper: upload file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { upload_preset: "soccer-fiesta" },
      (error, result) => {
        if (error) return reject(error)
        resolve(result.secure_url)
      }
    )
    streamifier.createReadStream(fileBuffer).pipe(uploadStream)
  })
}

// ✅ Route: Street Soccer Registration (with image upload)
app.post("/api/street-soccer/register", upload.any(), async (req, res) => {
  try {
    const formData = req.body
    const files = req.files || []

    // Upload all files to Cloudinary
    const imageUrls = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer))
    )

    // Save to MongoDB
    const newRegistration = new StreetRegistration({
      ...formData,
      players: [
        formData.player1,
        formData.player2,
        formData.player3,
        formData.player4,
        formData.player5,
      ].filter(Boolean),
      images: imageUrls,
    })

    await newRegistration.save()

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "sccrfiesta@gmail.com",
      subject: "New Street Soccer Registration ⚽",
      html: `
        <h2>New Street Soccer Registration</h2>
        <p><b>Team Name:</b> ${formData.teamName}</p>
        <p><b>Community:</b> ${formData.community}</p>
        <p><b>Captain:</b> ${formData.captainName}</p>
        <p><b>Email:</b> ${formData.email}</p>
        <p><b>Phone:</b> ${formData.phone}</p>
        <p><b>Players:</b> ${newRegistration.players.join(", ")}</p>
        <p><b>Message:</b> ${formData.message || "N/A"}</p>
        <p><b>Uploaded Images:</b></p>
        ${imageUrls.map((url) => `<img src="${url}" width="100" style="margin:5px;border-radius:8px"/>`).join("")}
      `,
    }

    await transporter.sendMail(mailOptions)
    res.status(201).json({ success: true, message: "✅ Registration successful" })
  } catch (error) {
    console.error("❌ Error uploading or saving:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// ✅ Route: Soccer Fiesta Registration
app.post("/api/soccer-fiesta/register", async (req, res) => {
  try {
    const formData = req.body
    const newRegistration = new SoccerFiesta(formData)
    await newRegistration.save()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "sccrfiesta@gmail.com",
      subject: "New Soccer Fiesta Registration ⚽",
      html: `
        <h2>New Soccer Fiesta Registration</h2>
        <p><b>Name:</b> ${formData.firstName} ${formData.lastName}</p>
        <p><b>Email:</b> ${formData.email}</p>
        <p><b>Phone:</b> ${formData.phoneNumber}</p>
        <p><b>Secondary Phone:</b> ${formData.secondaryPhone || "N/A"}</p>
        <p><b>Country:</b> ${formData.country}</p>
        <p><b>State:</b> ${formData.state}</p>
        <p><b>Age:</b> ${formData.age}</p>
        <p><b>Marital Status:</b> ${formData.maritalStatus}</p>
        <p><b>Bio:</b> ${formData.bio || "N/A"}</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    res.status(201).json({ success: true, message: "✅ Registration successful" })
  } catch (error) {
    console.error("❌ Error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// ✅ Root route
app.get("/", (req, res) => {
  res.send("⚽ SCCR Fiesta API with Cloudinary is running securely 🚀")
})

// ✅ Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
