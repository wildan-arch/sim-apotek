<script setup>
import { ref, onMounted } from "vue";
import { Megaphone, Upload, Trash2, Loader2, Save } from "lucide-vue-next";

// State Data
const promoAnnouncement = ref("");
const bannerList = ref([]);

const isSavingText = ref(false);
const isUploading = ref(false);
const newBannerTitle = ref("");
const selectedFile = ref(null);

// === 1. FETCH DATA DARI BACKEND ===
const fetchData = async () => {
  try {
    // Ambil Pengumuman Promo Teks
    const resSetting = await fetch("http://localhost:5000/api/landing/settings");
    if (resSetting.ok) {
      const dataSetting = await resSetting.json();
      promoAnnouncement.value = dataSetting.promoAnnouncement || "";
    }

    // Ambil Daftar Banner Gambar
    const resBanner = await fetch("http://localhost:5000/api/landing/banners");
    if (resBanner.ok) {
      bannerList.value = await resBanner.json();
    }
  } catch (err) {
    console.error("Gagal memuat data promo:", err);
  }
};

// === 2. SIMPAN TEKS ANNOUNCEMENT ===
const handleSaveAnnouncement = async () => {
  isSavingText.value = true;
  try {
    const res = await fetch("http://localhost:5000/api/landing/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoAnnouncement: promoAnnouncement.value }),
    });

    if (res.ok) {
      alert("Teks pengumuman promo berhasil disimpan!");
    } else {
      alert("Gagal menyimpan teks pengumuman.");
    }
  } catch (err) {
    alert("Terjadi kesalahan koneksi.");
  } finally {
    isSavingText.value = false;
  }
};

// === 3. UPLOAD BANNER GAMBAR ===
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const handleAddBanner = async () => {
  if (!selectedFile.value || !newBannerTitle.value) {
    alert("Isi judul banner dan pilih gambar terlebih dahulu!");
    return;
  }

  isUploading.value = true;
  const formData = new FormData();
  formData.append("title", newBannerTitle.value);
  formData.append("image", selectedFile.value);

  try {
    const res = await fetch("http://localhost:5000/api/landing/banners", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Banner promo berhasil diunggah!");
      newBannerTitle.value = "";
      selectedFile.value = null;
      fetchData(); // Refresh daftar banner
    } else {
      alert("Gagal mengunggah banner.");
    }
  } catch (error) {
    alert("Gagal mengirim file ke server.");
  } finally {
    isUploading.value = false;
  }
};

// === 4. HAPUS BANNER ===
const handleDeleteBanner = async (id) => {
  if (!confirm("Apakah Anda yakin ingin menghapus banner ini?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/landing/banners/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchData(); // Refresh daftar banner
    }
  } catch (err) {
    alert("Gagal menghapus banner.");
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="border-b border-teal-100 pb-4">
      <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Megaphone class="w-5 h-5 text-teal-600" />
        Kelola Banner & Iklan Promo
      </h1>
      <p class="text-xs text-slate-500 mt-1">Atur teks pengumuman running promo dan upload gambar banner iklan untuk tampilan depan.</p>
    </div>

    <!-- CARD 1: Teks Running Announcement -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Pengumuman Promo (Top Announcement)</h2>
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1"> Teks Running Info / Promo </label>
        <div class="flex gap-3">
          <input
            v-model="promoAnnouncement"
            type="text"
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            placeholder="Contoh: Diskon 20% bulan ini!"
          />
          <button
            type="button"
            @click="handleSaveAnnouncement"
            :disabled="isSavingText"
            class="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isSavingText" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CARD 2: Upload Banner Gambar Baru -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Tambah Gambar Banner Baru</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Judul / Deskripsi Banner</label>
          <input
            v-model="newBannerTitle"
            type="text"
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            placeholder="Contoh: Promo Diskon Akhir Bulan"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">File Gambar (PNG/JPG)</label>
          <input
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-teal-700 file:text-white file:text-xs file:font-semibold cursor-pointer"
          />
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          @click="handleAddBanner"
          :disabled="isUploading"
          class="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Loader2 v-if="isUploading" class="w-4 h-4 animate-spin" />
          <Upload v-else class="w-4 h-4" />
          <span>{{ isUploading ? "Mengunggah..." : "Upload Banner" }}</span>
        </button>
      </div>
    </div>

    <!-- CARD 3: Daftar Banner Aktif -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Daftar Banner Aktif (Tampil di Landing Page)</h2>

      <div v-if="bannerList.length > 0" class="space-y-3">
        <div v-for="banner in bannerList" :key="banner._id || banner.id" class="p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
          <div class="flex items-center gap-3">
            <img :src="banner.imageUrl" :alt="banner.title" class="w-24 h-12 object-cover rounded-lg border border-slate-200" />
            <div>
              <p class="text-xs font-bold text-slate-800">{{ banner.title }}</p>
              <span class="text-[10px] text-emerald-600 font-semibold">Status: Aktif</span>
            </div>
          </div>

          <button type="button" @click="handleDeleteBanner(banner._id || banner.id)" class="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" title="Hapus Banner">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-else class="text-center py-8 text-slate-400 text-xs">Belum ada banner promo yang diunggah.</div>
    </div>
  </div>
</template>
