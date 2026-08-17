require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Import Models
const Satuan = require("./models/Satuan");
const Kategori = require("./models/Kategori");
const Obat = require("./models/Obat");

const seedData = async () => {
  try {
    await connectDB();

    // Hapus data lama agar tidak duplikat saat dijalankan ulang
    await Satuan.deleteMany();
    await Kategori.deleteMany();
    await Obat.deleteMany();

    console.log("🔄 Memulai seeding data...");

    // 1. Buat Data Satuan
    const strip = await Satuan.create({ nama: "Strip" });
    const botol = await Satuan.create({ nama: "Botol" });
    const box = await Satuan.create({ nama: "Box" });

    // 2. Buat Data Kategori / Golongan
    const bebas = await Kategori.create({ nama: "Obat Bebas", klasifikasi: "bebas" });
    const keras = await Kategori.create({ nama: "Obat Keras", klasifikasi: "keras" });
    const terbatas = await Kategori.create({ nama: "Obat Bebas Terbatas", klasifikasi: "bebas-terbatas" });

    // 3. Buat Data Obat (Menghubungkan ObjectId Kategori & Satuan)
    await Obat.insertMany([
      {
        idObat: "OBT001",
        nama: "Paracetamol 500mg",
        deskripsi: "Meredakan demam dan nyeri ringan hingga sedang.",
        gambar: "/assets/product-images/foto-obat/paracetamol_gen_ifi.JPG",
        stok: 15,
        kategori: bebas._id,
        satuan: strip._id,
      },
      {
        idObat: "OBT002",
        nama: "Amoxicillin 500mg",
        deskripsi: "Antibiotik untuk mengobati infeksi bakteri.",
        gambar: "/assets/product-images/foto-obat/amox_500mg_hexpharm.JPG",
        stok: 2,
        kategori: keras._id,
        satuan: strip._id,
      },
      {
        idObat: "OBT003",
        nama: "Laserin Dewasa 30ml",
        deskripsi: "Meredakan batuk disertai flu.",
        gambar: "/assets/product-images/foto-obat/laserin_dewasa_30ml.JPG",
        stok: 0,
        kategori: terbatas._id,
        satuan: botol._id,
      },
    ]);

    console.log("🎉 Data Satuan, Kategori, dan Obat berhasil di-seed ke MongoDB Atlas!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error Seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
