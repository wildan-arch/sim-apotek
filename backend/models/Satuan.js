const mongoose = require("mongoose");
const satuanSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Satuan", satuanSchema);
