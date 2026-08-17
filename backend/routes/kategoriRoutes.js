const express = require("express");
const router = express.Router();
const Kategori = require("../models/Kategori");

// GET: Ambil semua kategori
router.get("/", async (req, res) => {
  try {
    const data = await Kategori.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Tambah kategori baru
// POST TAMBAH KATEGORI BARU
router.post("/", async (req, res) => {
  try {
    const { nama, klasifikasi } = req.body;

    if (!nama) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const kategoriBaru = new Kategori({
      nama: nama,
      klasifikasi: klasifikasi || "bebas", // Beri nilai default jika klasifikasi kosong
    });

    await kategoriBaru.save();
    res.status(201).json(kategoriBaru);
  } catch (error) {
    console.error("Error POST /api/kategori:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
