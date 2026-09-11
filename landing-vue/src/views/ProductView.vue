<script setup>
import { ref, computed } from "vue";
import { ArrowLeft, Search, Filter } from "lucide-vue-next";
import ProductCard from "@/components/product/ProductCard.vue";
import Navbar from "@/components/layout/Navbar.vue";
import Footer from "@/components/layout/Footer.vue";

defineEmits(["change-page"]);

// State Pencarian dan Filter Kategori
const searchQuery = ref("");
const selectedCategory = ref("All");

// Daftar Kategori Filter
const categories = ["All", "Fever", "Herbal", "Vitamins", "Allergy", "Devices", "Nutrition"];

// Data Master Produk
const products = ref([
  { id: 1, name: "Dolo-650 Tablet Paracetamol 650mg", category: "Fever", price: "2.40", originalPrice: "3.00", discount: "20%", rating: "4.8" },
  { id: 2, name: "Himalaya Liv.52 Tablets Liver Support", category: "Herbal", price: "5.40", originalPrice: "6.80", discount: "21%", rating: "4.7" },
  { id: 3, name: "Becosules Capsule Vitamin B-Complex", category: "Vitamins", price: "4.10", originalPrice: "5.20", discount: "21%", rating: "4.6" },
  { id: 4, name: "Cetirizine 10mg Tablet Anti-Allergic", category: "Allergy", price: "1.70", originalPrice: "2.20", discount: "23%", rating: "4.6" },
  { id: 5, name: "Accu-Chek Active Test Strips (50s)", category: "Devices", price: "15.90", originalPrice: "18.90", discount: "16%", rating: "4.8" },
  { id: 6, name: "Ensure Vanilla Nutrition Powder", category: "Nutrition", price: "24.90", originalPrice: "29.90", discount: "17%", rating: "4.7" },
  { id: 7, name: "Panadol Extra Paracetamol 500mg", category: "Fever", price: "3.10", originalPrice: "3.80", discount: "18%", rating: "4.9" },
  { id: 8, name: "Multivitamin Vitamin C 1000mg Effervescent", category: "Vitamins", price: "6.50", originalPrice: "8.00", discount: "19%", rating: "4.8" },
]);

// Computed Property untuk Filtering
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesCategory = selectedCategory.value === "All" || product.category === selectedCategory.value;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
    <!-- Navbar Global -->
    <Navbar @change-page="$emit('change-page', $event)" />

    <main class="flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb & Header Navigasi Kembali -->
      <div class="mb-6 flex items-center justify-between">
        <button type="button" @click="$emit('change-page', 'home')" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer">
          <ArrowLeft class="w-4 h-4" />
          {{ $t("common.backToHome") || "Kembali ke Beranda" }}
        </button>
      </div>

      <!-- Title & Search Area -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">
              {{ $t("products.allProducts") || "Semua Produk" }}
            </h1>
            <p class="text-xs text-slate-500 mt-1">Menampilkan {{ filteredProducts.length }} produk kesehatan terbaik untuk Anda.</p>
          </div>

          <!-- Input Search Bar -->
          <div class="relative w-full md:w-80">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari obat atau produk..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <!-- Filter Chips Kategori -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span class="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1"> <Filter class="w-3.5 h-3.5" /> Filter: </span>
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            @click="selectedCategory = cat"
            :class="['px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap', selectedCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80']"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Product Grid Listing -->
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
      </div>

      <!-- Empty State jika Produk Tidak Ditemukan -->
      <div v-else class="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Search class="w-6 h-6" />
        </div>
        <h3 class="text-base font-bold text-slate-800">Produk Tidak Ditemukan</h3>
        <p class="text-xs text-slate-500 mt-1">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
        <button
          type="button"
          @click="
            selectedCategory = 'All';
            searchQuery = '';
          "
          class="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all cursor-pointer"
        >
          Reset Filter
        </button>
      </div>
    </main>

    <!-- Footer Global -->
    <Footer />
  </div>
</template>
