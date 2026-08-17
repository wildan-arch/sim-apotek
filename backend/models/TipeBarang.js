const mongoose = require("mongoose");

const tipeBarangSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    kode: {
      type: String,
      required: true,
      uppercase: true,
    },
    butuhDetailMedis: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TipeBarang", tipeBarangSchema);
