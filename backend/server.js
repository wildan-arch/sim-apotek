require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const pembelianRoutes = require("./routes/pembelianRoutes");
const penjualanRoutes = require("./routes/penjualanRoutes");
const tipeBarangRoutes = require("./routes/tipeBarangRoutes");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcodeTerminal = require("qrcode-terminal");
const QRCode = require("qrcode");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
  cors({
    origin: "*", // Membuka akses dari HP maupun Laptop
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-role"],
  }),
);
app.use(express.json());

// MEMBUAT FOLDER ASSETS BISA DIAKSES PUBLIK VIA URL
app.use("/assets", express.static(path.join(__dirname, "assets")));

connectDB();

// Routes API
app.use("/api/kategori", require("./routes/kategoriRoutes"));
app.use("/api/satuan", require("./routes/satuanRoutes"));
app.use("/api/obat", require("./routes/obatRoutes"));
app.use("/api/pembelian", pembelianRoutes);
app.use("/api/penjualan", penjualanRoutes);
app.use("/api/tipe-barang", tipeBarangRoutes);
app.use("/api/auth", authRoutes);

// 2. VARIABEL PENAMPUNG STATUS
let waRawQr = ""; // ➕ Penampung string QR asli dari WA
let waQrCodeData = ""; // Penampung gambar Base64/DataURL
let isWaConnected = false;
let waAccountInfo = null;

const waClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// 3. EVENT QR CODE
waClient.on("qr", async (qr) => {
  console.log("📱 SCAN QR CODE INI MENGGUNAKAN WHATSAPP APOTEK:");
  qrcodeTerminal.generate(qr, { small: true }); // 🛠️ DIPERBAIKI: Menggunakan qrcodeTerminal

  try {
    waRawQr = qr;
    // Generate QR Code menjadi Base64 DataURL
    waQrCodeData = await QRCode.toDataURL(qr);
    isWaConnected = false;
    waAccountInfo = null;
    console.log("✅ Gambar QR Code BERHASIL dibuat!");
  } catch (err) {
    console.error("❌ Gagal membuat gambar QR Code:", err);
  }
});

// 4. EVENT READY
waClient.on("ready", () => {
  waRawQr = "";
  waQrCodeData = "";
  isWaConnected = true;
  waAccountInfo = {
    number: waClient.info.wid.user,
    name: waClient.info.pushname || "WhatsApp Apotek",
  };
  console.log(`✅ WhatsApp Terhubung dengan nomor: ${waAccountInfo.number}`);
});

// 5. EVENT DISCONNECTED
waClient.on("disconnected", async (reason) => {
  waRawQr = "";
  waQrCodeData = "";
  isWaConnected = false;
  waAccountInfo = null;
  console.log("❌ WhatsApp Terputus! Alasan", reason);

  // // Hancurkan instance dengan aman tanpa menghapus file saat locked
  await waClient.destroy().catch((err) => console.error("Error destroy:", err.message));
});

waClient.initialize();

// 6. ENDPOINT API STATUS WA (DIPERBAIKI DENGAN AUTO-REGENERATE GAMBAR)
app.get("/api/wa-status", async (req, res) => {
  // Jika belum terhubung, gambar belum ada, tapi teks QR asli ada -> buat ulang gambar
  if (!isWaConnected && !waQrCodeData && waRawQr) {
    try {
      waQrCodeData = await QRCode.toDataURL(waRawQr);
    } catch (err) {
      console.error("Gagal generate ulang QR:", err);
    }
  }

  res.json({
    connected: isWaConnected,
    qrCode: waQrCodeData,
    account: waAccountInfo,
  });
});

// ENDPOINT API UNTUK KIRIM WA OTOMATIS (DIPERBAIKI)
app.post("/api/kirim-wa-otomatis", async (req, res) => {
  console.log("DATA DITERIMA DARI FRONTEND:", req.body);
  try {
    // 1. Terima 'nomor' ATAU 'nomorTujuan' agar kompatibel dengan semua pengirim
    const { nomor, nomorTujuan, pesan } = req.body;
    const targetNumber = nomor || nomorTujuan;

    // 2. Validasi input
    if (!targetNumber) {
      return res.status(400).json({
        success: false,
        message: "Nomor tujuan WhatsApp tidak boleh kosong!",
      });
    }

    if (!pesan) {
      return res.status(400).json({
        success: false,
        message: "Pesan WhatsApp tidak boleh kosong!",
      });
    }

    // 3. Validasi status koneksi WA Client
    if (!isWaConnected) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp Apotek belum terhubung! Silakan scan QR Code terlebih dahulu.",
      });
    }

    // 4. Format nomor ke standar angka saja (0812... -> 62812...)
    let formattedNumber = String(targetNumber).replace(/[^0-9]/g, "");
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "62" + formattedNumber.slice(1);
    }

    // 5. Dapatkan JID valid resmi dari WhatsApp Server
    const numberDetails = await waClient.getNumberId(formattedNumber);

    if (!numberDetails) {
      return res.status(404).json({
        success: false,
        message: `Nomor ${targetNumber} tidak terdaftar di WhatsApp!`,
      });
    }

    // 6. Kirim pesan menggunakan JID resmi terverifikasi
    await waClient.sendMessage(numberDetails._serialized, pesan);

    res.json({
      success: true,
      message: "Pesan WA berhasil terkirim dari Nomor Apotek!",
    });
  } catch (error) {
    console.error("Gagal kirim WA:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan pada server WhatsApp",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://192.168.0.107: ${PORT}`);
});

// Untuk mencegah nodemon crash jika whatsapp-web.js melempar error EBUSY
process.on("uncaughtException", (err) => {
  if (err.code === "EBUSY" || err.message?.includes("EBUSY")) {
    console.warn("⚠️ Mencegah crash EBUSY: File sesi sedang terkunci oleh proses lain.");
  } else {
    console.error(" Uncaught Exception:", err);
  }
});
