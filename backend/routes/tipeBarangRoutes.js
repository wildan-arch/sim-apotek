const express = require("express");
const router = express.Router();
const TipeBarang = require("../models/TipeBarang");
const Obat = require("../models/Obat"); // 👈 1. IMPORT MODEL OBAT UNTUK PROTEKSI RELASI

// GET: Ambil semua tipe barang (dengan auto-seed jika database kosong)
router.get("/", async (req, res) => {
  try {
    let data = await TipeBarang.find().sort({ nama: 1 });

    if (!data || data.length === 0) {
      const defaultTipe = [
        { nama: "Obat & Medis", kode: "OBAT", butuhDetailMedis: true },
        { nama: "Minimarket / General", kode: "FMCG", butuhDetailMedis: false },
      ];
      data = await TipeBarang.insertMany(defaultTipe);
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error GET /api/tipe-barang:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST: Tambah tipe barang baru dari modal UI
router.post("/", async (req, res) => {
  try {
    const { nama, butuhDetailMedis } = req.body;
    if (!nama) {
      return res.status(400).json({ message: "Nama tipe barang wajib diisi" });
    }

    const kode = nama.toUpperCase().replace(/\s+/g, "_");
    const tipeBaru = new TipeBarang({ nama, kode, butuhDetailMedis });
    await tipeBaru.save();

    res.status(201).json(tipeBaru);
  } catch (err) {
    console.error("❌ Error POST /api/tipe-barang:", err);
    res.status(400).json({ message: err.message });
  }
});

// 👈 2. PENAMBAHAN ENDPOINT PUT (UNTUK EDIT TYPO NAMA TIPE BARANG)
router.put("/:id", async (req, res) => {
  try {
    const { nama, butuhDetailMedis } = req.body;
    if (!nama) {
      return res.status(400).json({ message: "Nama tipe barang tidak boleh kosong" });
    }

    const kode = nama.toUpperCase().replace(/\s+/g, "_");
    const updated = await TipeBarang.findByIdAndUpdate(req.params.id, { nama, kode, butuhDetailMedis }, { new: true });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error PUT /api/tipe-barang:", err);
    res.status(400).json({ message: err.message });
  }
});

// 👈 3. PERBAIKAN ENDPOINT DELETE (DENGAN PROTEKSI DATA TERPAKAI)
router.delete("/:id", async (req, res) => {
  try {
    const tipeId = req.params.id;

    // Cek apakah ada barang/obat yang terikat dengan tipe ini
    const terpakai = await Obat.countDocuments({ tipeBarang: tipeId });

    if (terpakai > 0) {
      return res.status(400).json({
        message: `Tipe barang tidak dapat dihapus karena sedang digunakan oleh ${terpakai} obat/barang!`,
      });
    }

    await TipeBarang.findByIdAndDelete(tipeId);
    res.json({ message: "Tipe barang berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error DELETE /api/tipe-barang:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
