const mongoose = require("mongoose");

const logHargaSchema = new mongoose.Schema(
  {
    obatId: { type: mongoose.Schema.Types.ObjectId, ref: "Obat", required: true },
    namaObat: { type: String, required: true },
    noFaktur: { type: String, default: "-" },
    pbf: { type: String, default: "-" },
    hargaBeliLama: { type: Number, default: 0 },
    hargaBeliBaru: { type: Number, default: 0 },
    hargaJualLama: { type: Number, default: 0 },
    hargaJualBaru: { type: Number, default: 0 },
    tanggal: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LogHarga", logHargaSchema);
