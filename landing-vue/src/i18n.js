import { createI18n } from "vue-i18n";

const messages = {
  // === BAHASA INDONESIA ===
  id: {
    // topbar: {
    //  masih belum tersedia untuk topbar
    // },
    nav: {
      // bagian search bar / pencarian
      // kategori
      allCategories: "Semua Kategori",
      placeholderInput: "Cari obat, produk kesehatan...",
      // Nama Link Navigasi
      home: "Beranda",
      medicines: "Obat-obatan",
      healthcare: "Perawatan Kesehatan",
      vitamins: "Vitamin & Suplemen",
      personalCare: "Perawatan Pribadi",
      babyCare: "Perawatan Bayi",
      offers: "Promo",
      blog: "Blog",
      contactUs: "Hubungi Kami",
      cart: "Keranjang",
      // bagian akun
      signIn: "Masuk",
      account: "Akun Saya",
    },
    hero: {
      tagline: "Kesehatan Anda, Prioritas Kami",
      title: "Perawatan Terpercaya, Kehidupan yang Lebih Baik",
      subtitle: "Obat-obatan asli dan produk kesehatan dikirim aman ke rumah Anda.",
      // services
      original: "100% Obat Asli",
      fastDelivery: "Pengiriman Cepat",
      securePayments: "Pembayaran Aman",
      support: "Dukungan 24/7",
      shopBtn: "Beli Obat-obatan",
      uploadBtn: "Unggah Resep",
      // bagian kanan promo
      specialOffer: "Promo Khusus",
    },
    products: {
      bestSeller: "Produk Terlaris",
      addToCart: "Tambah ke Keranjang",
      viewAll: "Lihat Semua Produk",
      // file categoriesGrid
    },
    categories: {
      medicines: "Obat-obatan",
      vitamins: "Vitamin & Suplemen",
      personalCare: "Perawatan Pribadi",
      babyCare: "Perawatan Bayi",
      diabetesCare: "Perawatan Diabetes",
      healthDevices: "Alat Kesehatan",
      // BAGIAN KATEGORI HALAMAN PRODUCTS(PRODUCTVIEW.VUE)
      placeholderInput: "Cari obat, produk kesehatan...",
      all: "Semua",
      fever: "Demam & Nyeri",
      herbal: "Herbal",
      allergy: "Alergi",
      nutrition: "Nutrisi",
    },
  },

  // === BAHASA INGGRIS ===
  en: {
    // topbar: {
    //   freeShipping: "Free delivery on orders over $25",
    //   genuine: "100% Genuine Medicines",
    // },
    nav: {
      // bagian search bar / pencarian
      // kategori
      allCategories: "All Categories",
      placeholderInput: "Search medicines, health products...",
      // Nama Link Navigasi
      home: "Home",
      medicines: "Medicines",
      healthcare: "Healthcare",
      vitamins: "Vitamins & Supplements",
      personalCare: "Personal Care",
      babyCare: "Baby Care",
      offers: "Offers",
      blog: "Blog",
      contactUs: "Contact Us",
      cart: "Cart",
      // bagian akun
      signIn: "Sign In",
      account: "My Account",
    },
    hero: {
      tagline: "Your Health, Our Priority",
      title: "Trusted Care, Better Living",
      subtitle: "Genuine medicines and healthcare products delivered safely to your door.",
      // services
      original: "100% Original",
      fastDelivery: "Fast Delivery",
      securePayments: "Secure Payments",
      support: "24/7 Support",
      shopBtn: "Shop Medicines",
      uploadBtn: "Upload Prescription",
      // bagian kanan promo
      specialOffer: "Special Offer",
    },
    // file categoriesGrid.vue
    categories: {
      medicines: " Medicines",
      vitamins: "Vitamins & Supplements",
      personalCare: "Personal Care",
      babyCare: "Baby Care",
      diabetesCare: "Diabetes Care",
      healthDevices: "Health Devices",
      // BAGIAN KATEGORI HALAMAN PRODUCTS(PRODUCTVIEW.VUE)
      placeholderInput: "Search medicines, health products...",
      all: "All",
      fever: "Fever",
      herbal: "Herbal",
      allergy: "Allergy",
      nutrition: "Nutrition",
    },

    products: {
      bestSeller: "Best Selling Products",
      addToCart: "Add to Cart",
      viewAll: "View All Products",
    },
  },
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("user_lang") || "id",
  fallbackLocale: "en",
  messages,
});

export default i18n;
