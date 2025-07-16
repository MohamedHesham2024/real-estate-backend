const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  index: Number,
  file_link: String,
  file_type: String,
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  media: [mediaSchema],
  categories: [String],
});

module.exports = mongoose.model("Project", projectSchema);
