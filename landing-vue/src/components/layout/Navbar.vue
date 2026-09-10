<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <!-- Logo -->
      <div class="flex items-center gap-2 shrink-0">
        <div class="bg-emerald-700 text-white p-2 rounded-lg">
          <Plus class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xl font-bold text-emerald-950 leading-none block">Apotek<span class="text-emerald-600">SHABAH</span></span>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="flex-1 max-w-2xl mx-4">
        <div class="flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-emerald-600">
          <select class="bg-slate-100 text-xs px-3 border-r border-slate-300 text-slate-600 focus:outline-none hidden md:block">
            <option>{{ $t("nav.allCategories") }}</option>
            <option>{{ $t("nav.medicines") }}</option>
            <option>{{ $t("nav.vitamins") }}</option>
            <option>{{ $t("nav.healthcare") }}</option>
          </select>
          <input type="text" :placeholder="$t('nav.placeholderInput')" class="w-full px-4 py-2 text-sm focus:outline-none bg-white" />
          <button class="bg-emerald-700 hover:bg-emerald-800 text-white px-6 flex items-center justify-center transition">
            <Search class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Right Mene-->
      <!-- Akun -->
      <div class="flex items-center gap-4 shrink-0">
        <button class="flex items-center gap-2 text-slate-700 hover:text-emerald-700 text-sm font-medium">
          <User class="w-5 h-5" />
          <div class="hidden sm:block text-left text-xs leading-tight">
            <span class="block text-slate-400 text-[10px]">{{ $t("nav.signIn") }}</span>
            <span class="font-bold">{{ $t("nav.account") }}</span>
          </div>
        </button>
        <!-- keranjang -->
        <button class="relative flex items-center justify-center p-2 bg-emerald-50 text-emerald-800 rounded-full hover:bg-emerald-100">
          <ShoppingBag class="w-5 h-5" />
          <span class="absolute -top-1 -right-1 bg-emerald-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </button>
      </div>
    </div>

    <!-- Category Nav Bar -->
    <nav class="bg-white border-t border-slate-100 hidden md:block">
      <div class="max-w-7xl mx-auto px-4 flex items-center gap-8 text-xs font-semibold text-slate-600 py-2.5">
        <!-- Link Navigasi (Terintegrasi i18n) -->
        <a href="#" class="text-emerald-700 font-bold border-b-2 border-emerald-700 pb-1">{{ $t("nav.home") }}</a>
        <a href="#" class="hover:text-emerald-700">{{ $t("nav.medicines") }}</a>
        <a href="#" class="hover:text-emerald-700">{{ $t("nav.healthcare") }}</a>
        <a href="#" class="hover:text-emerald-700">{{ $t("nav.vitamins") }}</a>
        <a href="#" class="hover:text-emerald-700">{{ $t("nav.personalCare") }}</a>
        <a href="#" class="hover:text-emerald-700">{{ $t("nav.babyCare") }}</a>
        <a href="#" class="hover:text-emerald-700">{{ $t("nav.offers") }}</a>
        <a href="#" class="hover:text-emerald-700">{{ $t("nav.blog") }}</a>
        <a href="#" class="hover:text-emerald-700">{{ $t("nav.contactUs") }}</a>

        <!-- Toggle Bahasa di Navbar -->
        <div class="ms-auto flex items-center">
          <div class="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              @click="$i18n.locale = 'id'"
              :class="$i18n.locale === 'id' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'"
              class="px-2.5 py-1 rounded-md transition-all duration-200 flex items-center gap-1 cursor-pointer"
            >
              <span>🇮🇩</span> ID
            </button>
            <button
              type="button"
              @click="$i18n.locale = 'en'"
              :class="$i18n.locale === 'en' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'"
              class="px-2.5 py-1 rounded-md transition-all duration-200 flex items-center gap-1 cursor-pointer"
            >
              <span>🇬🇧</span> EN
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { Plus, Search, User, ShoppingBag } from "lucide-vue-next";
</script>
