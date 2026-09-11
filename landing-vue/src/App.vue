<script setup>
import { ref } from "vue";
import HomeView from "@/views/HomeView.vue";
import ProductView from "@/views/ProductView.vue";
import CartView from "@/views/CartView.vue";
import ScrollToTop from "@/components/common/ScrollToTop.vue";

const currentPage = ref("home");
</script>

<template>
  <main>
    <HomeView v-if="currentPage === 'home'" @change-page="currentPage = $event" />
    <ProductView v-else-if="currentPage === 'product'" @change-page="currentPage = $event" />
    <CartView v-else-if="currentPage === 'cart'" @change-page="currentPage = $event" />
  </main>

  <!-- Tombol Go To Top Melayang -->
  <!-- Komponen Go To Top -->
  <ScrollToTop />
</template>
