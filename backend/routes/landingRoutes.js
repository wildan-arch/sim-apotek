const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. PERBAIKAN IMPORT MODEL (Gunakan 'l' kecil sesuai nama file landingSettings.js)
const LandingSetting = require("../models/landingSetting");
const PromoBanner = require("../models/PromoBanner");

// 2. PEMBUATAN FOLDER UPLOADS OTOMATIS (Mencegah Error ENOENT Multer)
const uploadDir = "uploads/banners/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Storage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `banner-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// ==========================================
// 1. ENDPOINT KELOLA HERO & PROMO SETTING
// ==========================================
// GET: Ambil data Teks Landing Page
router.get("/settings", async (req, res) => {
  try {
    // Cari dokumen pertama
    let settings = await LandingSetting.findOne();

    // Jika belum ada di MongoDB, buatkan baru secara aman
    if (!settings) {
      settings = new LandingSetting({
        heroTagline: "Kesehatan Anda, Prioritas Kami",
        heroTitle: "Perawatan Terpercaya, Kehidupan yang Lebih Baik",
        heroSubtitle: "Obat-obatan asli dan produk kesehatan dikirim aman ke rumah Anda.",
        primaryBtnText: "Beli Obat-obatan",
        secondaryBtnText: "Unggah Resep",
        promoAnnouncement: "Diskon 20% khusus pembelian produk Vitamin bulan ini!",
      });
      await settings.save();
    }

    return res.status(200).json(settings);
  } catch (error) {
    // Log error asli ke terminal backend
    console.error("CRASH ERROR ON GET /settings:", error);
    return res.status(500).json({ message: error.message });
  }
});

// PUT: Update Teks Hero & Announcement dari Admin Vue
router.put("/settings", async (req, res) => {
  try {
    let settings = await LandingSetting.findOne();
    if (!settings) {
      settings = new LandingSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    return res.json({ message: "Pengaturan Landing Page berhasil disimpan", data: settings });
  } catch (error) {
    console.error("Error pada PUT /settings:", error);
    return res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 2. ENDPOINT BANNER PROMO (GAMBAR)
// ==========================================

// GET: Ambil Semua Banner Aktif
router.get("/banners", async (req, res) => {
  try {
    const banners = await PromoBanner.find().sort({ createdAt: -1 });
    return res.json(banners);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// POST: Upload Banner Baru dari Admin Vue
router.post("/banners", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File gambar banner wajib diunggah." });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/banners/${req.file.filename}`;

    const newBanner = new PromoBanner({
      title: req.body.title,
      imageUrl: imageUrl,
    });

    await newBanner.save();
    return res.status(201).json({ message: "Banner promo berhasil diunggah", data: newBanner });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// DELETE: Hapus Banner
router.delete("/banners/:id", async (req, res) => {
  try {
    await PromoBanner.findByIdAndDelete(req.params.id);
    return res.json({ message: "Banner berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
