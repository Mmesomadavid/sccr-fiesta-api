import { Router } from "express"
import StreetSoccer from "../models/StreetSoccer.js"
import sendAdminEmail from "../utils/sendAdminEmail.js"

const router = Router()

router.post("/street-soccer", async (req, res) => {
  try {
    // Parse form data with files
    const { teamName, community, captainName, email, phone, additionalInfo, players } = req.body

    // Process players array - in production, you'd upload images to cloud storage
    const processedPlayers = players.map(player => ({
      fullName: player.fullName,
      imageUrl: player.imageUrl || null, // Image URLs would be set after upload
    }))

    const soccer = new StreetSoccer({
      teamName,
      community,
      captainName,
      email,
      phone,
      players: processedPlayers,
      additionalInfo,
    })

    await soccer.save()

    const playersList = processedPlayers
      .map((p, i) => `<p><strong>Player ${i + 1}:</strong> ${p.fullName}</p>`)
      .join("")

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
    `

    await sendAdminEmail("New Street Soccer Registration ⚽", content)

    res.status(201).json({ message: "✅ Street Soccer registration successful!" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "❌ Failed to register for Street Soccer" })
  }
})

export default router
