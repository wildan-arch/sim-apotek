const express = require("express");
const router = express.Router();
const Satuan = require("../models/Satuan");

// GET: Ambil semua satuan
router.get("/", async (req, res) => {
  try {
    const data = await Satuan.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Tambah satuan baru
router.post("/", async (req, res) => {
  try {
    const { nama } = req.body; // atau req.body langsung jika berupa string

    const namaSatuan = typeof req.body === "string" ? req.body : nama;

    if (!namaSatuan || !namaSatuan.trim()) {
      return res.status(400).json({ message: "Nama satuan tidak boleh kosong" });
    }

    const namaClean = namaSatuan.trim();

    // 🎯 VALIDASI BACKEND: Cek di database menggunakan Regex Case-Insensitive
    const adaSatuan = await Satuan.findOne({
      nama: { $regex: new RegExp(`^${namaClean}$`, "i") },
    });

    if (adaSatuan) {
      return res.status(400).json({
        message: `Satuan "${namaClean}" sudah terdaftar di database!`,
      });
    }

    const satuanBaru = new Satuan({ nama: namaClean });
    await satuanBaru.save();

    res.status(201).json(satuanBaru);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
