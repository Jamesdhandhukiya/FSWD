import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// POST route for sending email
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, msg: "All fields are required" });
  }

  try {
    // Configure transporter (use your Gmail or other SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL, // your email
        pass: process.env.MY_PASSWORD // app password (not Gmail password)
      }
    });

    // Mail options
    const mailOptions = {
      from: email,
      to: process.env.MY_EMAIL, // send to yourself
      subject: `New Contact from ${name}`,
      text: `You have a new message:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, msg: "Message sent successfully!" });

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, msg: "Failed to send message" });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
