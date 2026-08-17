const mongoose = require("mongoose");

const penjualanSchema = new mongoose.Schema(
  {
    noStruk: { type: String, required: true, unique: true },
    items: [
      {
        obat: { type: mongoose.Schema.Types.ObjectId, ref: "Obat" },
        nama: { type: String, required: true },
        qty: { type: Number, required: true },
        hargaBeli: { type: Number, required: true }, // HPP per item
        hargaJual: { type: Number, required: true }, // Harga Jual per item
        subtotal: { type: Number, required: true },
        labaKotorItem: { type: Number, required: true }, // (hargaJual - hargaBeli) * qty
      },
    ],
    subtotal: { type: Number, required: true },
    diskon: { type: Number, default: 0 },
    totalBayar: { type: Number, required: true },
    totalHpp: { type: Number, required: true }, // Total HPP modal
    totalLabaKotor: { type: Number, required: true }, // (Total Bayar - Total HPP)
    metodeBayar: { type: String, enum: ["Tunai", "QRIS", "Transfer"], default: "Tunai" },
    bayar: { type: Number, required: true },
    kembali: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Penjualan", penjualanSchema);
