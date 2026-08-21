<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-9999 bg-slate-900/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white w-full mt-10 sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <!-- HEADER MODAL -->
        <div class="bg-teal-800 text-white p-4 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-xl">📋</span>
            <div>
              <h3 class="font-bold text-sm">Stok Opname (Mode HP)</h3>
              <p class="text-[10px] text-teal-200">Input beberapa obat lalu simpan sekaligus</p>
            </div>
          </div>
          <button @click="tutupModal" class="text-white hover:text-slate-200 font-bold text-xl px-2">&times;</button>
        </div>

        <!-- BODY CONTENT -->
        <div class="p-4 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          <!-- FORM SEARCH OBAT -->
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Cari Nama Obat / SKU</label>
              <input type="text" v-model="searchKey" placeholder="Ketik nama obat..." class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
            </div>

            <!-- HASIL DROPDOWN PENCARIAN -->
            <div v-if="searchKey && !selectedObat" class="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y bg-white">
              <div v-for="o in filteredObat" :key="o._id" @click="pilihObat(o)" class="p-2.5 hover:bg-teal-50 cursor-pointer flex justify-between items-center text-xs">
                <div>
                  <div class="font-bold text-slate-800">{{ o.nama }}</div>
                  <div class="text-[10px] text-slate-400">SKU: {{ o.idObat }} | Rak: {{ o.lokasiRak || "-" }}</div>
                </div>
                <span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold text-[11px]">Stok: {{ o.stok }}</span>
              </div>
            </div>

            <!-- FORM ENTRY OBAT YANG DIPILIH -->
            <div v-if="selectedObat" class="bg-teal-50/70 p-3 rounded-xl border border-teal-200 space-y-2.5">
              <div class="flex justify-between items-start border-b border-teal-200/60 pb-2">
                <div>
                  <h4 class="font-extrabold text-slate-900 text-sm capitalize">{{ selectedObat.nama }}</h4>
                  <p class="text-[10px] text-slate-500">
                    Stok Sistem Saat Ini: <b class="text-slate-700">{{ selectedObat.stok }} {{ selectedObat.satuanTerkecil?.nama || "Pcs" }}</b>
                  </p>
                </div>
                <button @click="selectedObat = null" class="text-[10px] text-rose-600 underline font-bold cursor-pointer">Batal</button>
              </div>

              <!-- INPUT STOK FISIK, BATCH, ED -->
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label class="block text-[10px] font-bold text-slate-700 mb-0.5">Stok Fisik *</label>
                  <input type="number" v-model.number="formInput.stokFisik" min="0" class="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white text-center" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-700 mb-0.5">No. Batch *</label>
                  <input type="text" v-model="formInput.noBatch" class="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-white uppercase" placeholder="Batch" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-700 mb-0.5">ED *</label>
                  <input type="date" v-model="formInput.expiredDate" class="w-full p-2 border border-slate-300 rounded-lg text-[10px] font-semibold text-slate-900 bg-white" />
                </div>
              </div>

              <button @click="tambahKeDaftarOpname" class="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-1 cursor-pointer">
                ➕ Masukkan ke Daftar Opname
              </button>
            </div>
          </div>

          <!-- TABEL / LIST DAFTAR OPNAME SEMENTARA -->
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div class="flex justify-between items-center border-b pb-2 mb-2">
              <h4 class="font-bold text-xs text-slate-800 flex items-center gap-1"><span>🛒</span> Daftar Opname Sementara ({{ daftarOpname.length }})</h4>
              <button v-if="daftarOpname.length > 0" @click="daftarOpname = []" class="text-[10px] text-rose-600 underline font-semibold cursor-pointer">Kosongkan</button>
            </div>

            <div v-if="daftarOpname.length === 0" class="text-center text-xs text-slate-400 py-6">Belum ada item ditambahkan ke daftar opname.</div>

            <!-- ITEM LIST -->
            <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div v-for="(item, idx) in daftarOpname" :key="idx" class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <div class="flex-1 pr-2">
                  <div class="font-bold text-slate-800 line-clamp-1">{{ item.nama }}</div>
                  <div class="text-[10px] text-slate-500 flex gap-2 mt-0.5">
                    <span
                      >Fisik: <b class="text-teal-700">{{ item.stokFisik }}</b> (Sistem: {{ item.stokSistem }})</span
                    >
                    <span :class="item.stokFisik - item.stokSistem >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'"> {{ item.stokFisik - item.stokSistem > 0 ? "+" : "" }}{{ item.stokFisik - item.stokSistem }} </span>
                  </div>
                  <div class="text-[9px] text-slate-400 mt-0.5">Batch: {{ item.noBatch }} | ED: {{ item.expiredDate }}</div>
                </div>

                <button @click="hapusItemOpname(idx)" class="text-rose-500 hover:text-rose-700 font-bold text-sm px-1.5 cursor-pointer">✕</button>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER MODAL (TOMBOL AKSI UTAMA) -->
        <div class="p-3 bg-white border-t border-slate-200 flex gap-2">
          <button @click="tutupModal" class="w-1/3 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Batal</button>
          <button
            @click="simpanSemuaOpname"
            :disabled="daftarOpname.length === 0 || loading"
            class="w-2/3 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex justify-center items-center gap-1"
          >
            {{ loading ? "Saving..." : `💾 Simpan Semua (${daftarOpname.length} Obat)` }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { apiObat } from "@/services/api.js";
import { useToastStore } from "@/stores/toastStore";

const props = defineProps({
  isOpen: Boolean,
  daftarObat: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "suksesUpdate"]);
const toastStore = useToastStore();

const searchKey = ref("");
const selectedObat = ref(null);
const loading = ref(false);

const formInput = ref({
  stokFisik: 0,
  noBatch: "",
  expiredDate: "",
});

// 🎯 1. AMBIL DRAF DARI LOCALSTORAGE SAAT REFRESH
const daftarOpname = ref(JSON.parse(localStorage.getItem("opname_draft_list")) || []);

// 🎯 2. SIMPAN OTOMATIS KE LOCALSTORAGE SETIAP DAFTAR OPNAME BERUBAH
watch(
  daftarOpname,
  (valBaru) => {
    localStorage.setItem("opname_draft_list", JSON.stringify(valBaru));
  },
  { deep: true },
);

const filteredObat = computed(() => {
  if (!searchKey.value) return [];
  const k = searchKey.value.toLowerCase();
  return props.daftarObat.filter((o) => (o.nama && o.nama.toLowerCase().includes(k)) || (o.idObat && o.idObat.toLowerCase().includes(k))).slice(0, 5);
});

const pilihObat = (obat) => {
  selectedObat.value = obat;
  formInput.value = {
    stokFisik: obat.stok || 0,
    noBatch: obat.noBatch || "",
    expiredDate: obat.expiredDate ? new Date(obat.expiredDate).toISOString().split("T")[0] : "",
  };
  searchKey.value = "";
};

// Tambahkan Obat ke Tabel Keranjang Opname
const tambahKeDaftarOpname = () => {
  if (!selectedObat.value) return;

  if (!formInput.value.noBatch || !formInput.value.expiredDate) {
    return toastStore.trigger("⚠️ Nomor Batch dan ED wajib diisi!", "warning");
  }

  const existingIdx = daftarOpname.value.findIndex((i) => i._id === selectedObat.value._id);

  const itemData = {
    _id: selectedObat.value._id,
    nama: selectedObat.value.nama,
    stokSistem: selectedObat.value.stok,
    stokFisik: Number(formInput.value.stokFisik),
    noBatch: formInput.value.noBatch || "",
    expiredDate: formInput.value.expiredDate,
  };

  if (existingIdx !== -1) {
    daftarOpname.value[existingIdx] = itemData;
  } else {
    daftarOpname.value.push(itemData);
  }

  selectedObat.value = null;
  toastStore.trigger("✅ Masuk ke daftar opname sementara", "success");
};

const hapusItemOpname = (idx) => {
  daftarOpname.value.splice(idx, 1);
};

// 🎯 3. FUNGSI KOSONGKAN DRAF SEMENTARA & LOCALSTORAGE
const kosongkanDaftar = () => {
  daftarOpname.value = [];
  localStorage.removeItem("opname_draft_list");
};

// Simpan Semua Item Opname ke Database MongoDB
// Simpan Semua Item Opname ke Database MongoDB
const simpanSemuaOpname = async () => {
  if (daftarOpname.value.length === 0) return;

  loading.value = true;
  try {
    // 🎯 Menggunakan fungsi apiObat dari api.js
    const res = await apiObat.stokOpnameBulk(daftarOpname.value);

    if (res && res.success) {
      toastStore.trigger(`🎉 ${res.message}`, "success");
      kosongkanDaftar();
      emit("suksesUpdate");
      tutupModal();
    } else {
      toastStore.trigger(`⚠️ ${res?.message || "Gagal mengupdate stok"}`, "error");
    }
  } catch (err) {
    console.error(err);
    toastStore.trigger("Gagal terhubung ke backend server.", "error");
  } finally {
    loading.value = false;
  }
};

const tutupModal = () => {
  selectedObat.value = null;
  searchKey.value = "";
  emit("close");
};
</script>
