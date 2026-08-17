<!-- Modal untuk status pengirim WA dan konfirmasi kirim laporan WA. -->
<template>
  <!-- MODAL 1: INTEGRASI STATUS WHATSAPP APOTEK -->
  <div v-if="isModalWaOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
      <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <h3 class="font-bold text-slate-800 text-sm">📱 Status Pengirim WA Apotek</h3>
        <button @click="tutupModalWa" class="text-slate-400 hover:text-slate-600 font-bold transition cursor-pointer">✕</button>
      </div>

      <div v-if="waStatus?.connected" class="py-4 space-y-4">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">✓</div>
        <div>
          <h4 class="font-bold text-slate-800 text-base">WhatsApp Terhubung!</h4>
          <p class="text-xs text-slate-500">Sistem siap mengirim laporan otomatis ke Owner.</p>
        </div>
        <div class="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-2 text-left">
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-medium">Pengirim:</span>
            <span class="font-bold text-slate-700 truncate max-w-45">{{ waStatus?.account?.name || "WA Apotek" }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-medium">Nomor HP:</span>
            <span class="font-mono font-bold text-teal-700"> +{{ waStatus?.account?.number || "-" }} </span>
          </div>
        </div>
      </div>

      <div v-else-if="waStatus?.qrCode" class="space-y-3 py-2">
        <p class="text-xs text-slate-600 font-semibold">Pindai QR Code menggunakan WhatsApp HP Apotek:</p>
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl inline-block shadow-sm">
          <img :src="waStatus.qrCode" alt="Scan WA QR Code" class="w-52 h-52 mx-auto rounded-lg" />
        </div>
        <p class="text-[11px] text-slate-400">Buka WA HP Apotek ➔ Perangkat Tertaut ➔ Tautkan Perangkat.</p>
      </div>

      <div v-else class="py-8 space-y-3">
        <div class="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-xs text-slate-500 font-medium">Memuat QR Code WhatsApp...</p>
      </div>
    </div>
  </div>

  <!-- MODAL 2: KONFIRMASI KIRIM WA LAPORAN -->
  <div v-if="isModalKirimWaOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl text-left space-y-4">
      <div class="flex justify-between items-center pb-2 border-b border-slate-100">
        <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2"><span>📲</span> Konfirmasi Kirim Laporan WA</h3>
        <button @click="tutupModalKirimWa" class="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Nomor WA Owner / Penerima:</label>
        <input v-model="noWaOwner" type="text" placeholder="Contoh: 08123456789" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Preview Pesan yang Akan Terkirim:</label>
        <textarea :value="previewPesanWa" rows="8" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none resize-none" readonly></textarea>
      </div>

      <div class="mb-4">
        <div v-if="!waStatus?.connected" class="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 shadow-xs">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-sm font-medium"> WhatsApp Apotek <strong>belum terhubung</strong>. </span>
          </div>

          <button @click="bukaSambungkanWA" type="button" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shrink-0 ml-2 cursor-pointer shadow-xs">Sambungkan</button>
        </div>

        <div v-else class="flex items-center gap-3 p-3.5 bg-teal-50 border border-teal-200/80 rounded-xl text-teal-900 shadow-xs">
          <svg class="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium"> Status WA Apotek <strong>Terhubung</strong>. Sistem siap mengirimkan laporan. </span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button @click="tutupModalKirimWa" type="button" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition cursor-pointer">Batal</button>

        <button type="button" @click="eksekusiKirimWaLaporan" class="w-full px-4 py-2 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition">
          <span v-if="isSendingWa" class="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
          <span>{{ isSendingWa ? "Mengirim..." : "🚀 Kirim Sekarang" }}</span>
        </button>
      </div>
    </div>
  </div>
  <ToastNotif />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { apiWA } from "@/services/api.js";
import ToastNotif from "@/components/ToastNotif.vue";
import { useToastStore } from "@/stores/toastStore.js";

const toast = useToastStore();

// Props kontrol buka/tutup modal
const props = defineProps({
  isModalWaOpen: {
    type: Boolean,
    default: false,
  },
  isModalKirimWaOpen: {
    type: Boolean,
    default: false,
  },
  pesanText: {
    type: String,
    default: "",
  },
  nomorTujuan: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:isModalWaOpen", "update:isModalKirimWaOpen"]);

// ALL STATE DIKELOLA DI DALAM FILE INI
const waStatus = ref({ connected: false, qrCode: null, account: null });
const noWaOwner = ref(localStorage.getItem("noWaOwner") || "");
const previewPesanWa = ref("");
const isSendingWa = ref(false);

let timerInterval = null;

// FUNGSI CEK STATUS CONNECTION BACKEND
const cekStatusWA = async () => {
  try {
    const data = await apiWA.getStatus();
    waStatus.value = {
      connected: data?.connected || false,
      qrCode: data?.qrCode || null,
      account: data?.account || null,
    };
  } catch (err) {
    console.error("Gagal terhubung ke server WA:", err);
    waStatus.value = { connected: false, qrCode: null, account: null };
  }
};

// SYNC PREVIEW PESAN DARI PROPS
watch(
  () => props.pesanText,
  (val) => {
    if (val) previewPesanWa.value = val;
  },
  { immediate: true },
);

// AUTO CHECK REFRESH STATUS WA JIKA MODAL STATUS DIBUKA
watch(
  () => props.isModalWaOpen,
  (isOpen) => {
    if (isOpen) {
      cekStatusWA();
      timerInterval = setInterval(cekStatusWA, 3000);
    } else {
      if (timerInterval) clearInterval(timerInterval);
    }
  },
);

// FUNGSI EKSEKUSI KIRIM WA MENGGUNAKAN WA.ME (AMAN TANPA BOT CLOUD)
const eksekusiKirimWaLaporan = () => {
  // 1. Validasi apakah nomor sudah diisi
  if (!noWaOwner.value) {
    return toast.trigger("⚠️ Masukkan nomor WhatsApp Owner terlebih dahulu!", "warning");
  }

  // 2. Validasi apakah pesan preview sudah ada isinya
  if (!previewPesanWa.value) {
    return toast.trigger("⚠️ Pesan laporan masih kosong!", "warning");
  }

  try {
    // 3. Format nomor ke standar internasional (0812... -> 62812...)
    let formattedNumber = String(noWaOwner.value).replace(/[^0-9]/g, "");
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "62" + formattedNumber.slice(1);
    }

    // 4. Encode teks pesan agar spasi & enter aman dibaca URL
    const encodedPesan = encodeURIComponent(previewPesanWa.value);

    // 5. Buat URL wa.me dinamis
    const url = `https://wa.me/${formattedNumber}?text=${encodedPesan}`;

    // 6. Simpan nomor ke localStorage untuk kemudahan berikutnya
    localStorage.setItem("noWaOwner", noWaOwner.value);

    // 7. Buka WhatsApp di tab baru
    window.open(url, "_blank");

    toast.trigger("✅ Membuka WhatsApp untuk mengirim laporan...", "success");
    tutupModalKirimWa();
  } catch (err) {
    console.error("Gagal membuka WhatsApp:", err);
    toast.trigger("⚠️ Gagal memproses tautan WhatsApp.", "error");
  }
};

// HANDLER NAVIGASI / TOMBOL
const bukaSambungkanWA = () => {
  emit("update:isModalWaOpen", true);
};

const tutupModalWa = () => {
  emit("update:isModalWaOpen", false);
};

const tutupModalKirimWa = () => {
  emit("update:isModalKirimWaOpen", false);
};

onMounted(() => {
  cekStatusWA();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
