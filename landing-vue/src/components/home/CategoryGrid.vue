<template>
  <section class="py-10 max-w-7xl mx-auto px-4">
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
      <div v-for="(cat, index) in categories" :key="cat.nameKey" class="bg-white p-3 rounded-xl border border-slate-200 text-center hover:border-emerald-600 transition cursor-pointer">
        <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
          <component :is="cat.icon" class="w-5 h-5" />
        </div>
        <span class="text-[11px] font-bold text-slate-700 block">{{ $t(cat.nameKey) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Pill, HeartPulse, Sparkles, Baby, Activity, Stethoscope } from "lucide-vue-next";

const categories = [
  { nameKey: "categories.medicines", icon: Pill },
  { nameKey: "categories.vitamins", icon: HeartPulse },
  { nameKey: "categories.personalCare", icon: Sparkles },
  { nameKey: "categories.babyCare", icon: Baby },
  { nameKey: "categories.diabetesCare", icon: Activity },
  { nameKey: "categories.healthDevices", icon: Stethoscope },
];
</script>
