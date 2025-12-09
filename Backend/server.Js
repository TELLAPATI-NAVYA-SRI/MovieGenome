const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');
const Favorite = require('./models/Favorite')
const nodemailer = require('nodemailer');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- MONGODB CONNECTION ----------------

mongoose.connect("mongodb+srv://itteamtssprinting:eFgIBNSpOECCNZGj@cluster0.k8ksjov.mongodb.net/cineGenomeDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// ---------- SIGN UP ----------
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  

  if (!name || !email || !password )
      return res.status(400).json({ message: "All fields are required." });

  

  const existingUser = await User.findOne({ email });
  if (existingUser)
      return res.status(400).json({ message: "User already exists." });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ message: "User registered successfully!" });
});

// ---------- LOGIN ----------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

  // No JWT (as you prefer)
  res.status(200).json({
      message: "Login successful",
      userId: user._id,
      name: user.name,
      email: user.email
  });
});

// ---------- FORGOT PASSWORD ----------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'rahultallapaneni@gmail.com',
      pass: 'nzgl tffx obxp fhxu'  // NOT your Gmail password
  }
});

// ---------- FORGOT PASSWORD ----------
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
      return res.status(400).json({ message: "Email not found." });

  // 1️⃣ Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetLink = `http://3.142.171.217:3000/reset-password?token=${resetToken}&email=${email}`;

  // 2️⃣ Optionally store this token in DB or cache for validation
  // For now, we'll skip storing

  // 3️⃣ Send email
  const mailOptions = {
      from: 'yourgmail@gmail.com',
      to: email,
      subject: 'CineGenome Password Reset',
      html: `
          <p>You requested to reset your password.</p>
          <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
          <p>If you did not request this, please ignore this email.</p>
      `
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error(error);
          return res.status(500).json({ message: "Error sending email." });
      } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).json({ message: "Reset link sent to your email." });
      }
  });
});

app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user)
      return res.status(400).json({ message: "Email not found." });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: "Password reset successful!" });
});


app.post('/api/add-favorite', async (req, res) => {
  const { userId, movieData } = req.body;

  if (!userId || !movieData || !movieData.id)
      return res.status(400).json({ message: "Missing data." });

  const existing = await Favorite.findOne({ userId, "movieData.id": movieData.id });
  if (existing)
      return res.status(200).json({ message: "Already in favorites." });

  const newFavorite = new Favorite({ userId, movieData });
  await newFavorite.save();

  res.status(201).json({ message: "Added to favorites!" });
});



// ---------- CHECK IF MOVIE IS FAVORITE ----------
app.get('/api/check-favorite', async (req, res) => {
  const { userId, movieId } = req.query;

  if (!userId || !movieId) {
      return res.status(400).json({ isFavorite: false });
  }

  const favorite = await Favorite.findOne({ 
      userId, 
      "movieData.id": parseInt(movieId)   // Parse because id from TMDB is a number
  });

  if (favorite) {
      res.json({ isFavorite: true });
  } else {
      res.json({ isFavorite: false });
  }
});


app.post('/api/remove-favorite', async (req, res) => {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
      return res.status(400).json({ message: "userId and movieId required." });
  }

  const result = await Favorite.deleteOne({ 
      userId, 
      "movieData.id": parseInt(movieId) 
  });

  if (result.deletedCount > 0) {
      res.json({ message: "Movie removed from favorites." });
  } else {
      res.json({ message: "Movie was not in favorites." });
  }
});


app.get('/api/get-favorites', async (req, res) => {
  const { userId } = req.query;

  const favorites = await Favorite.find({ userId });
  const movies = favorites.map(fav => fav.movieData);  // full movie data saved

  res.json({ favorites: movies });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
