const mongoose = require("mongoose");

// 🎯 1. Sub-Schema Histori Perubahan Harga PBF
const historiHargaSchema = new mongoose.Schema(
  {
    tanggal: { type: Date, default: Date.now },
    pabrik: { type: String, default: "-" }, // Nama PBF / Distributor
    noFaktur: { type: String, default: "-" },
    hargaBeli: { type: Number, required: true },
    hargaJual: { type: Number, required: true },
  },
  { _id: true },
);

const obatSchema = new mongoose.Schema(
  {
    // Identitas & Klasifikasi
    idObat: { type: String, required: true, unique: true }, // SKU / Barcode
    nama: { type: String, required: true },
    // 🎯 TAMBAHKAN FIELD TIPE BARANG INI
    tipeBarang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TipeBarang", // Nama model Mongoose TipeBarang kamu
    },
    kategori: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori", required: true },

    // Data Faktur Pembelian PBF Terakhir
  // 🎯 Data PBF / Distributor (Penampung Multi-PBF)
  pabrik: { type: String, default: "" }, // Tetap dipertahankan untuk menyimpan PBF Terakhir
  daftarPBF: [
    {
      nama: { type: String, required: true },
      hargaBeli: { type: Number, default: 0 },
      isUtama: { type: Boolean, default: false }
    }
  ],
    noFaktur: { type: String, default: "" }, // Nomor Faktur PBF
    tglFaktur: { type: Date }, // Tanggal Faktur
    metodeBayar: { type: String, enum: ["Tunai", "Tempo", "Transfer", "Kredit"], default: "Tunai" },

    // Satuan & Konversi
    satuanTerkecil: { type: mongoose.Schema.Types.ObjectId, ref: "Satuan", required: true },
    satuanBesar: { type: mongoose.Schema.Types.ObjectId, ref: "Satuan" },
    nilaiKonversi: { type: Number, default: 1 },

    // Harga & Keuangan
    hargaBeli: { type: Number, required: true, default: 0 },
    marginPersen: { type: Number, default: 0 },
    hargaJual: { type: Number, required: true, default: 0 },
    noBatch: { type: String, default: "-" },
    expiredDate: { type: Date, default: null },
    terakhirOpname: { type: Date, default: null },

    // 🎯 2. Array Riwayat Histori Perubahan Harga PBF
    historiHarga: [historiHargaSchema],

    // Stok & Manajemen
    stok: { type: Number, required: true, default: 0 },
    minStok: { type: Number, default: 5 },
    lokasiRak: { type: String, default: "-" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Obat", obatSchema);
