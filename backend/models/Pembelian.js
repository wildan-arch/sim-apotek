const mongoose = require("mongoose");

const pembelianSchema = new mongoose.Schema(
  {
    noFaktur: { type: String, required: true },
    pabrik: { type: String, required: true },
    tglFaktur: { type: Date, required: true },
    tglJatuhTempo: { type: Date }, // Tanggal Jatuh Tempo
    metodeBayar: { type: String, enum: ["Tunai", "Tempo", "Transfer"], default: "Tunai" },
    statusBayar: { type: String, enum: ["Lunas", "Belum Lunas"], default: "Lunas" }, // Status Pelunasan
    items: [
      {
        obat: { type: mongoose.Schema.Types.ObjectId, ref: "Obat" },
        qty: { type: Number, required: true },
        hargaBeli: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    totalBayar: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pembelian", pembelianSchema);
