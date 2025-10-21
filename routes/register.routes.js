import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import SoccerFiesta from "../models/SoccerFiesta.js";
import StreetSoccer from "../models/StreetSoccer.js";

dotenv.config();
const router = express.Router();

// Create mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📩 Helper function to send emails
const sendAdminEmail = async (subject, content) => {
  await transporter.sendMail({
    from: `"Event Registration Bot" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject,
    html: content,
  });
};

// 🏆 Soccer Fiesta Registration
router.post("/soccer-fiesta", async (req, res) => {
  try {
    const fiesta = new SoccerFiesta(req.body);
    await fiesta.save();

    const { firstName, lastName, email, phone, secondaryPhone, country, state, age, maritalStatus, bio } = req.body;

    // Format email content
    const content = `
      <h3>New Soccer Fiesta Registration 🏆</h3>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Secondary Phone:</strong> ${secondaryPhone || "N/A"}</p>
      <p><strong>Country:</strong> ${country}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>Age:</strong> ${age}</p>
      <p><strong>Marital Status:</strong> ${maritalStatus || "N/A"}</p>
      <p><strong>Bio:</strong> ${bio || "N/A"}</p>
      <hr>
      <p><em>This registration was automatically forwarded by your event site backend.</em></p>
    `;

    await sendAdminEmail("New Soccer Fiesta Registration 🏆", content);

    res.status(201).json({ message: "✅ Soccer Fiesta registration successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to register for Soccer Fiesta" });
  }
});

// ⚽ Street Soccer Registration
router.post("/street-soccer", async (req, res) => {
  try {
    const soccer = new StreetSoccer(req.body);
    await soccer.save();

    const { teamName, community, captainName, email, phone, players, additionalInfo } = req.body;

    const playersList = players.map((p, i) => `<p><strong>Player ${i + 1}:</strong> ${p.fullName}</p>`).join("");

    const content = `
      <h3>New Street Soccer Registration ⚽</h3>
      <p><strong>Team Name:</strong> ${teamName}</p>
      <p><strong>Community:</strong> ${community}</p>
      <p><strong>Captain Name:</strong> ${captainName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <h4>Players:</h4>
      ${playersList}
      <p><strong>Additional Info:</strong> ${additionalInfo || "N/A"}</p>
      <hr>
      <p><em>This registration was automatically forwarded by your event site backend.</em></p>
    `;

    await sendAdminEmail("New Street Soccer Registration ⚽", content);

    res.status(201).json({ message: "✅ Street Soccer registration successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to register for Street Soccer" });
  }
});

export default router;
