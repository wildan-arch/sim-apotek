<script setup>
import { ref, onMounted } from "vue";
import { Save, Type, Sparkles, Loader2 } from "lucide-vue-next";

const isSaving = ref(false);

// State Form Hero Section
const heroForm = ref({
  tagline: "",
  title: "",
  subtitle: "",
  primaryBtnText: "",
  secondaryBtnText: "",
});

// Fetch data saat halaman dimuat
const fetchSettings = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/landing/settings");
    const data = await res.json();
    heroForm.value = data;
  } catch (err) {
    console.error("Gagal memuat setting:", err);
  }
};

// Simpan data ke MongoDB
const handleSaveHero = async () => {
  isSaving.value = true;
  try {
    const res = await fetch("http://localhost:5000/api/landing/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(heroForm.value),
    });
    if (res.ok) alert("Berhasil memperbarui data ke MongoDB!");
  } catch (err) {
    alert("Gagal koneksi ke server.");
  } finally {
    isSaving.value = false;
  }
};

onMounted(fetchSettings);
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="border-b border-teal-100 pb-4">
      <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Type class="w-5 h-5 text-teal-600" />
        Kelola Hero & Tagline Landing Page
      </h1>
      <p class="text-xs text-slate-500 mt-1">Ubah judul utama, deskripsi singkat, dan tombol navigasi di bagian paling atas website.</p>
    </div>

    <!-- Form Section -->
    <form @submit.prevent="handleSaveHero" class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
      <!-- Tagline / Badge Atas -->
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1"> Tagline Utama / Badge Top </label>
        <input
          v-model="heroForm.tagline"
          type="text"
          class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="Contoh: Kesehatan Anda, Prioritas Kami"
          required
        />
      </div>

      <!-- Judul Utama (Title) -->
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1"> Judul Besar (Hero Title) </label>
        <input
          v-model="heroForm.title"
          type="text"
          class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="Masukkan judul utama website..."
          required
        />
      </div>

      <!-- Subtitle / Deskripsi -->
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1"> Sub-Judul / Deskripsi Singkat </label>
        <textarea
          v-model="heroForm.subtitle"
          rows="3"
          class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="Penjelasan ringkas layanan apotek..."
          required
        ></textarea>
      </div>

      <!-- Grid Tombol CTA -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1"> Teks Tombol Utama (Primary CTA) </label>
          <input v-model="heroForm.primaryBtnText" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20" required />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1"> Teks Tombol Kedua (Secondary CTA) </label>
          <input v-model="heroForm.secondaryBtnText" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20" required />
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-4 flex justify-end">
        <button type="submit" :disabled="isSaving" class="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          <span>{{ isSaving ? "Memproses..." : "Simpan Perubahan Hero" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
