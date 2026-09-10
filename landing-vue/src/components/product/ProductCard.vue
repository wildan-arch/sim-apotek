<template>
  <div class="border border-slate-200 rounded-lg p-3 flex flex-col justify-between hover:shadow-md transition bg-white">
    <div>
      <div class="bg-slate-50 h-32 rounded-md flex items-center justify-center mb-2 relative">
        <span class="absolute top-1 left-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded"> {{ product.discount }} OFF </span>
        <Pill class="w-10 h-10 text-slate-300" />
      </div>
      <span class="text-[9px] font-semibold text-slate-400 uppercase block">{{ product.category }}</span>
      <h3 class="text-xs font-bold text-slate-800 line-clamp-2 h-8 my-1">{{ product.name }}</h3>

      <div class="flex items-center gap-1 mb-1">
        <Star class="w-3 h-3 text-amber-400 fill-amber-400" />
        <span class="text-[10px] font-bold text-slate-600">{{ product.rating }}</span>
      </div>

      <div class="flex items-baseline gap-1 my-2">
        <span class="text-xs font-bold text-slate-900">${{ product.price }}</span>
        <span class="text-[10px] text-slate-400 line-through">${{ product.originalPrice }}</span>
      </div>
    </div>

    <button class="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer">
      <ShoppingCart class="w-3.5 h-3.5" />{{ $t("products.addToCart") }}
    </button>
  </div>
</template>

<script setup>
import { Pill, Star, ShoppingCart } from "lucide-vue-next";

defineProps({
  product: {
    type: Object,
    required: true,
  },
});
</script>
