<template>
  <div class="bg-emerald-900 text-white text-xs py-2 px-4">
    <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
      <!-- Penawaran & Paket Promo (Kiri) -->
      <div class="flex items-center gap-4">
        <!-- Badge Promo -->
        <span class="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider shrink-0 animate-pulse"> <Tag class="w-3 h-3" /> {{ $t("topbar.promoBadge") }} </span>

        <!-- Teks Promo / Paket Vitamin -->
        <div class="flex items-center gap-2">
          <span class="font-medium text-emerald-100 flex items-center gap-1">
            <Sparkles class="w-3.5 h-3.5 text-yellow-400" />
            {{ $t("topbar.vitaminOffer") }}
          </span>
          <a href="#" class="underline hover:text-yellow-300 font-bold hidden md:inline-block"> {{ $t("topbar.claimOffer") }} → </a>
        </div>
      </div>

      <!-- Info Layanan (Kanan) -->
      <div class="flex items-center gap-6 shrink-0">
        <span class="hidden sm:flex items-center gap-1"> <PhoneCall class="w-3.5 h-3.5" /> {{ $t("topbar.support") }} </span>
        <a href="#" class="flex items-center gap-1 hover:underline text-emerald-200"> <FileText class="w-3.5 h-3.5" /> {{ $t("topbar.prescription") }} </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Tag, Sparkles, PhoneCall, FileText } from "lucide-vue-next";
</script>
