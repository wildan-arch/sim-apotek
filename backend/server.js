const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const pembelianRoutes = require("./routes/pembelianRoutes");
const penjualanRoutes = require("./routes/penjualanRoutes");
const tipeBarangRoutes = require("./routes/tipeBarangRoutes");
const authRoutes = require("./routes/authRoutes");
// Ubah L kecil/besar sesuai persis dengan nama file di folder routes/
const landingRoutes = require("./routes/LandingRoutes");

const app = express();

// 1. PINDAHKAN CORS & JSON PARSER KE ATAS (Sebelum Route)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Folder Statis Upload
app.use("/uploads", express.static("uploads"));

// 3. DAFTARKAN ROUTE API DI BAWAH CORS
app.use("/api/landing", landingRoutes);
app.use("/api/pembelian", pembelianRoutes);
app.use("/api/penjualan", penjualanRoutes);
app.use("/api/tipe-barang", tipeBarangRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
