require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const pembelianRoutes = require("./routes/pembelianRoutes");
const penjualanRoutes = require("./routes/penjualanRoutes");
const tipeBarangRoutes = require("./routes/tipeBarangRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
  cors({
    origin: "*", // Membuka akses dari HP maupun Laptop
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-role"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
