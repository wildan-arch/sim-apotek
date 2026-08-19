const mongoose = require("mongoose");

// 🎯 1. Sub-Schema Histori Perubahan Harga PBF
const historiHargaSchema = new mongoose.Schema(
  {
    tanggal: { type: Date, default: Date.now },
    pabrik: { type: String, default: "-" },
    noFaktur: { type: String, default: "-" },
    hargaBeli: { type: Number, required: true },
    hargaJual: { type: Number, required: true },
  },
  { _id: true },
);

// 🎯 2. Sub-Schema Multi-Satuan & Multi-Harga Dinamis (BARU)
const konversiSatuanSchema = new mongoose.Schema(
  {
    satuanBesar: { type: mongoose.Schema.Types.ObjectId, ref: "Satuan", required: true },
    nilaiKonversi: { type: Number, required: true, default: 1 }, // Misal: 1 Box = 10 Tablet
    hargaBeli: { type: Number, default: 0 }, // Opsional: harga beli per satuan besar
    hargaJual: { type: Number, required: true, default: 0 }, // Harga jual khusus satuan ini
  },
  { _id: true }
);

const obatSchema = new mongoose.Schema(
  {
    // Identitas & Klasifikasi
    idObat: { type: String, required: true, unique: true }, // SKU / Barcode
    nama: { type: String, required: true },
    tipeBarang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TipeBarang",
    },
    kategori: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori", required: true },

    // Data PBF / Distributor
    pabrik: { type: String, default: "" },
    daftarPBF: [
      {
        nama: { type: String, required: true },
        hargaBeli: { type: Number, default: 0 },
        isUtama: { type: Boolean, default: false }
      }
    ],
    noFaktur: { type: String, default: "" },
    tglFaktur: { type: Date },
    metodeBayar: { type: String, enum: ["Tunai", "Tempo", "Transfer", "Kredit"], default: "Tunai" },

    // 🎯 Satuan Terkecil sebagai Basis Utama Stok
    satuanTerkecil: { type: mongoose.Schema.Types.ObjectId, ref: "Satuan", required: true },
    
    // 🎯 Ubah satuan besar tunggal menjadi Array Konversi Dinamis (Bisa banyak satuan)
    daftarKonversi: [konversiSatuanSchema],

    // Harga & Keuangan Satuan Dasar (Eceran Terkecil)
    hargaBeli: { type: Number, required: true, default: 0 }, // Harga beli satuan terkecil
    marginPersen: { type: Number, default: 0 },
    hargaJual: { type: Number, required: true, default: 0 },   // Harga jual eceran satuan terkecil
    
    noBatch: { type: String, default: "-" },
    expiredDate: { type: Date, default: null },
    terakhirOpname: { type: Date, default: null },

    // Riwayat Histori Harga PBF
    historiHarga: [historiHargaSchema],

    // Stok & Manajemen (Stok murni dihitung dalam satuan terkecil)
    stok: { type: Number, required: true, default: 0 },
    minStok: { type: Number, default: 5 },
    lokasiRak: { type: String, default: "-" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Obat", obatSchema);