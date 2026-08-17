const mongoose = require("mongoose");
const kategoriSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    klasifikasi: { type: String, required: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Kategori", kategoriSchema);
