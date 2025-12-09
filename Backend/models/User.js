// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    likedMovies: [{ type: Number }]   // To store liked movie IDs later
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
