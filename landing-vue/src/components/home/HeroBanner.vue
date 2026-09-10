<template>
  <section class="bg-slate-100 py-10">
    <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
      <!-- Left Content -->
      <div class="space-y-5">
        <div class="inline-flex items-center gap-1.5 bg-emerald-900 text-white text-[11px] font-semibold px-3 py-1 rounded-full"><HeartPulse class="w-3.5 h-3.5 text-emerald-400" />{{ $t("hero.tagline") }}</div>
        <h1 class="text-4xl md:text-5xl font-black text-emerald-950 leading-tight">{{ $t("hero.title") }}</h1>
        <p class="text-slate-600 text-sm max-w-md">{{ $t("hero.subtitle") }}</p>
        <div class="grid grid-cols-4 gap-2 pt-4 font-semibold text-slate-600">
          <div class="flex flex-col items-center text-center gap-1">
            <ShieldPlus class="w-8 h-8 text-emerald-600" />
            <span>{{ $t("hero.original") }}</span>
          </div>
          <div class="flex flex-col items-center text-center gap-1">
            <Truck class="w-8 h-8 text-emerald-600" />
            <span>{{ $t("hero.fastDelivery") }}</span>
          </div>
          <div class="flex flex-col items-center text-center gap-1">
            <LockKeyhole class="w-8 h-8 text-emerald-600" />
            <span>{{ $t("hero.securePayments") }}</span>
          </div>
          <div class="flex flex-col items-center text-center gap-1">
            <Headset class="w-8 h-8 text-emerald-600" />
            <span>{{ $t("hero.support") }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button class="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-md transition flex items-center gap-2 cursor-pointer">{{ $t("hero.shopBtn") }} <ArrowRight class="w-4 h-4" /></button>
          <button class="bg-white hover:bg-emerald-800 hover:text-slate-50 text-emerald-800 border border-slate-300 font-bold text-xs px-6 py-3 rounded-md transition flex items-center gap-2 cursor-pointer">
            {{ $t("hero.uploadBtn") }} <Upload class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Right Promo Cards -->
      <div class="flex justify-center sm:mt-2">
        <div class="bg-emerald-800 text-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
          <div class="absolute top-4 right-4 bg-white text-emerald-900 font-black text-center rounded-full p-3 w-20 h-20 flex flex-col justify-center shadow animate-bounce">
            <span class="text-[9px] uppercase">Up To</span>
            <span class="text-lg leading-none">20%</span>
            <span class="text-[8px]">OFF</span>
          </div>

          <div class="absolute -left-10 -top-3 -rotate-10 bg-amber-400 text-slate-900 font-extrabold text-[10px] tracking-wider uppercase p-1 w-30 text-center shadow-md border border-amber-300 animate-pulse">
            {{ $t("hero.specialOffer") }}
          </div>
          <h2 class="text-2xl font-bold mt-1 mb-2">OMEGA-3 & VITAMINS</h2>
          <p class="text-xs text-emerald-100 mb-6 max-w-xs">Boost your daily immunity and heart health with premium supplements.</p>

          <div class="bg-emerald-900/50 p-6 rounded-xl flex items-center justify-center border border-emerald-700/50">
            <Pill class="w-20 h-20 text-emerald-300" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { HeartPulse, ArrowRight, Upload, Pill, ShieldPlus, Truck, LockKeyhole, Headset } from "lucide-vue-next";
</script>
