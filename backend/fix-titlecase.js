require("dotenv").config();
const mongoose = require("mongoose");

// Fungsi merubah teks menjadi Title Case / Capitalize
const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function updateSemuaObat() {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI tidak ditemukan di file .env!");
    }

    console.log("⏳ Menghubungkan ke MongoDB Atlas...");
    await mongoose.connect(mongoURI);
    console.log("⚡ Terhubung!");

    const db = mongoose.connection.db;
    const obatsCollection = db.collection("obats");

    const listObat = await obatsCollection.find({}).toArray();
    console.log(`📦 Ditemukan ${listObat.length} data obat. Memulai konversi...`);

    for (let o of listObat) {
      if (o.nama) {
        const namaBaru = toTitleCase(o.nama);
        await obatsCollection.updateOne({ _id: o._id }, { $set: { nama: namaBaru } });
        console.log(`✅ [UPDATED]: "${o.nama}" ➔ "${namaBaru}"`);
      }
    }

    console.log("\n🎉 SEMUA DATA OBAT BERHASIL DIPERBARUI KE FORMAT TITLE CASE!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

updateSemuaObat();
