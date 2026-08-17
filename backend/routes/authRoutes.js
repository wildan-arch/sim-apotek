const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 1. ENDPOINT REGISTER / BUAT AKUN BARU (Biasanya dipakai Owner lewat Modal)
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Cek apakah username sudah terdaftar
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username sudah digunakan!" });
    }

    // Enkripsi password sebelum disimpan ke MongoDB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || "kasir", // Default jadi kasir jika tidak dipilih
    });

    await newUser.save();
    res.status(201).json({ message: "Akun berhasil dibuat!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ENDPOINT LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Username tidak ditemukan!" });
    }

    // Cek kecocokan password yang di-input dengan hash password di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah!" });
    }

    // Jika sukses, kirim respons sukses beserta username dan rolenya
    res.json({
      message: "Login berhasil",
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint Reset Password oleh Owner
router.put("/reset-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    // Cari user berdasarkan username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Username tidak ditemukan!" });
    }

    // Enkripsi password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password di database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: `Password untuk akun ${username} berhasil direset!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
