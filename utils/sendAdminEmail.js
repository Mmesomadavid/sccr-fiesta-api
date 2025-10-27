import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// Create mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Helper function to send emails to admin
const sendAdminEmail = async (subject, content) => {
  try {
    await transporter.sendMail({
      from: `"Event Registration Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      html: content,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export default sendAdminEmail
