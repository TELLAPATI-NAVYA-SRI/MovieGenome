const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    movieData: { type: Object, required: true }  // Store the full movie object!
});

module.exports = mongoose.model('Favorite', favoriteSchema);

