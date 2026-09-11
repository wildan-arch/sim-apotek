const mongoose = require("mongoose");

const landingSettingSchema = new mongoose.Schema(
  {
    heroTagline: {
      type: String,
      default: "Kesehatan Anda, Prioritas Kami",
    },
    heroTitle: {
      type: String,
      default: "Perawatan Terpercaya, Kehidupan yang Lebih Baik",
    },
    heroSubtitle: {
      type: String,
      default: "Obat-obatan asli dan produk kesehatan dikirim aman ke rumah Anda.",
    },
    primaryBtnText: {
      type: String,
      default: "Beli Obat-obatan",
    },
    secondaryBtnText: {
      type: String,
      default: "Unggah Resep",
    },
    promoAnnouncement: {
      type: String,
      default: "Diskon 20% khusus pembelian produk Vitamin & Suplemen bulan ini!",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("landingSetting", landingSettingSchema);
