<template>
  <section class="py-10 bg-white border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-900">{{ $t("products.bestSeller") }}</h2>
        <a href="#" class="text-emerald-700 text-xs font-bold hover:underline flex items-center gap-1">{{ $t("products.viewAll") }} <ChevronRight class="w-4 h-4" /> </a>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ChevronRight } from "lucide-vue-next";
import ProductCard from "@/components/product/ProductCard.vue";

const products = [
  { id: 1, name: "Dolo-650 Tablet Paracetamol 650mg", category: "Fever", price: "2.40", originalPrice: "3.00", discount: "20%", rating: "4.8" },
  { id: 2, name: "Himalaya Liv.52 Tablets Liver Support", category: "Herbal", price: "5.40", originalPrice: "6.80", discount: "21%", rating: "4.7" },
  { id: 3, name: "Becosules Capsule Vitamin B-Complex", category: "Vitamins", price: "4.10", originalPrice: "5.20", discount: "21%", rating: "4.6" },
  { id: 4, name: "Cetirizine 10mg Tablet Anti-Allergic", category: "Allergy", price: "1.70", originalPrice: "2.20", discount: "23%", rating: "4.6" },
  { id: 5, name: "Accu-Chek Active Test Strips (50s)", category: "Devices", price: "15.90", originalPrice: "18.90", discount: "16%", rating: "4.8" },
  { id: 6, name: "Ensure Vanilla Nutrition Powder", category: "Nutrition", price: "24.90", originalPrice: "29.90", discount: "17%", rating: "4.7" },
];
</script>
