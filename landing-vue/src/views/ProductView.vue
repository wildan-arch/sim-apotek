<script setup>
import { ref, computed } from "vue";
import { ArrowLeft, Search, Filter } from "lucide-vue-next";
import ProductCard from "@/components/product/ProductCard.vue";

defineEmits(["change-page"]);

const searchQuery = ref("");
const selectedCategory = ref("All");

// Struktur Array Object Kategori yang Benar
const categories = [
  { value: "All", nameKey: "categories.all" },
  { value: "Fever", nameKey: "categories.fever" },
  { value: "Herbal", nameKey: "categories.herbal" },
  { value: "Vitamins", nameKey: "categories.vitamins" },
  { value: "Allergy", nameKey: "categories.allergy" },
  { value: "Devices", nameKey: "categories.healthDevices" },
  { value: "Nutrition", nameKey: "categories.nutrition" },
];

const products = ref([
  { id: 1, name: "Dolo-650 Tablet Paracetamol 650mg", category: "Fever", price: "2.40", originalPrice: "3.00", discount: "20%", rating: "4.8" },
  { id: 2, name: "Himalaya Liv.52 Tablets Liver Support", category: "Herbal", price: "5.40", originalPrice: "6.80", discount: "21%", rating: "4.7" },
  { id: 3, name: "Becosules Capsule Vitamin B-Complex", category: "Vitamins", price: "4.10", originalPrice: "5.20", discount: "21%", rating: "4.6" },
  { id: 4, name: "Cetirizine 10mg Tablet Anti-Allergic", category: "Allergy", price: "1.70", originalPrice: "2.20", discount: "23%", rating: "4.6" },
  { id: 5, name: "Accu-Chek Active Test Strips (50s)", category: "Devices", price: "15.90", originalPrice: "18.90", discount: "16%", rating: "4.8" },
  { id: 6, name: "Ensure Vanilla Nutrition Powder", category: "Nutrition", price: "24.90", originalPrice: "29.90", discount: "17%", rating: "4.7" },
]);

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesCategory = selectedCategory.value === "All" || product.category === selectedCategory.value;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});
</script>

<template>
  <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Tombol Kembali -->
    <div class="mb-6">
      <button type="button" @click="$emit('change-page', 'home')" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
        <ArrowLeft class="w-4 h-4" />
        Kembali ke Beranda
      </button>
    </div>

    <!-- Header Filter & Search -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Semua Produk</h1>
          <p class="text-xs text-slate-500 mt-1">Menampilkan {{ filteredProducts.length }} produk kesehatan terbaik.</p>
        </div>

        <div class="relative w-full md:w-80">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('categories.placeholderInput')"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <span class="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1"> <Filter class="w-3.5 h-3.5" /> Filter: </span>

        <!-- Perbaikan pada loop v-for -->
        <button
          v-for="cat in categories"
          :key="cat.value"
          type="button"
          @click="selectedCategory = cat.value"
          :class="['px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all', selectedCategory === cat.value ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
        >
          {{ $t(cat.nameKey) }}
        </button>
      </div>
    </div>

    <!-- Grid Produk (Lebar Wajar: 2 kolom di HP, 3 di Tablet, 4 di Desktop) -->
    <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
    </div>

    <div v-else class="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <p class="text-sm text-slate-500">Produk tidak ditemukan.</p>
    </div>
  </div>
</template>
