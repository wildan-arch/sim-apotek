<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
    <!-- <TopBar /> -->
    <Navbar />
    <HeroBanner />
    <CategoryGrid />
    <ProductGrid />
    <Footer />
  </div>
</template>

<script setup>
// import TopBar from "@/components/layout/TopBar.vue";
import Navbar from "@/components/layout/Navbar.vue";
import HeroBanner from "@/components/home/HeroBanner.vue";
import CategoryGrid from "@/components/home/CategoryGrid.vue";
import ProductGrid from "@/components/home/ProductGrid.vue";
import Footer from "@/components/layout/Footer.vue";
</script>
