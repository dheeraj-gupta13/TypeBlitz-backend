const mongoose = require("mongoose");

const typingSchema = new mongoose.Schema({
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  user: { type: String, required: true },
});

const Typing = mongoose.model("Typing", typingSchema);

module.exports = Typing;
