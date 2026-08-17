<template>
  <div v-if="modalFakturAktif" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
    <div class="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
      <!-- HEADER MODAL & TOMBOL LIHAT DRAFT -->
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-bold text-slate-900">Input Faktur Pembelian PBF (Multi-Item)</h3>
          <!-- 🎯 Tombol Pemicu Modal List Draft -->
          <button type="button" @click="showModalListDraft = true" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-amber-300 cursor-pointer">
            <span>📂</span> Draft Pendingan ({{ daftarDraft.length }})
          </button>
        </div>
        <button @click="tutupModal" class="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
      </div>

      <!-- 🎯 BANNER DRAFT TERSIMPAN (QUICK ACCESS ATAS FORM) -->
      <div v-if="daftarDraft.length > 0" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5"> <span>💾</span> Klik Draft untuk Memuat Kembali Data: </span>
          <button @click="showModalListDraft = true" type="button" class="text-xs text-amber-700 underline font-semibold cursor-pointer">Kelola Semua Draft</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <div v-for="draft in daftarDraft" :key="draft.idDraft" class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-300 text-xs shadow-sm hover:border-amber-500 transition">
            <button @click="pilihDraft(draft)" type="button" class="font-bold text-slate-700 hover:text-amber-600 cursor-pointer text-left capitalize">
              {{ draft.header.pabrik || "Tanpa PBF" }} ({{ draft.header.noFaktur }}) - <span class="text-teal-700">Rp {{ formatRupiah(draft.totalBayar) }}</span>
            </button>
            <button @click="bukaModalHapus(draft)" type="button" class="text-rose-400 hover:text-rose-600 font-bold ml-1 cursor-pointer" title="Hapus Draft">✕</button>
          </div>
        </div>
      </div>

      <form @submit.prevent="simpanFaktur" class="space-y-6">
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Nama PBF / Distributor</label>
            <input v-model="fakturHeader.pabrik" placeholder="PT Enseval / Anugrah" required class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500 capitalize" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Nomor Faktur</label>
            <input v-model="fakturHeader.noFaktur" placeholder="FAK-2026-001" required class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Tanggal Faktur</label>
            <input type="date" v-model="fakturHeader.tglFaktur" required class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Metode Pembayaran</label>
            <select v-model="fakturHeader.metodeBayar" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500">
              <option value="Tunai">Tunai (Cash)</option>
              <option value="Tempo">Tempo</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
          <div v-if="fakturHeader.metodeBayar === 'Tempo'">
            <label class="block text-xs font-semibold text-slate-600 mb-1">Tanggal Jatuh Tempo</label>
            <input type="date" v-model="fakturHeader.tglJatuhTempo" required class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-xs font-bold text-teal-800 uppercase tracking-wider">📦 Daftar Barang Dalam Faktur</h4>
            <button type="button" @click="tambahBarisObat" class="bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              + Tambah Baris Barang
            </button>
          </div>

          <div class="overflow-x-auto border rounded-lg border-slate-200">
            <table class="w-full text-left border-collapse min-w-212.5">
              <thead>
                <tr class="bg-slate-100 border-b border-slate-200 text-xs text-slate-600 uppercase">
                  <th class="p-2.5 w-1/3">Cari / Ketik Nama Barang</th>
                  <th class="p-2.5 w-28">Satuan Beli</th>
                  <th class="p-2.5 w-16 text-center">Qty Beli</th>
                  <th class="p-2.5 w-28">Harga Faktur (Rp)</th>
                  <th class="p-2.5 w-20">Diskon (%)</th>
                  <th class="p-2.5 w-28">Diskon (Rp/Pcs)</th>
                  <th class="p-2.5 w-28">Harga Beli Bersih</th>
                  <th class="p-2.5 w-28 text-teal-800 bg-teal-50/50">Harga Jual Baru</th>
                  <th class="p-2.5 w-28">Subtotal (Rp)</th>
                  <th class="p-2.5 text-center w-10">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                <tr v-for="(item, index) in fakturItems" :key="index" :class="['hover:bg-slate-50 relative', item.showDropdown ? 'z-50' : 'z-10']">
                  <td class="p-2 relative">
                    <input
                      type="text"
                      v-model="item.searchQuery"
                      @focus="item.showDropdown = true"
                      placeholder="Ketik nama obat..."
                      required
                      class="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500 capitalize"
                    />

                    <div v-if="item.showDropdown" class="fixed z-9999 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                      <div v-for="o in getObatMatches(item.searchQuery)" :key="o._id" @click="pilihObat(index, o)" class="p-2.5 hover:bg-teal-50 cursor-pointer border-b border-slate-100 flex justify-between items-center text-xs capitalize">
                        <div>
                          <div class="font-bold text-slate-800">{{ o.nama }}</div>
                          <div class="text-[10px] text-slate-400">SKU: {{ o.idObat }}</div>
                        </div>
                        <span class="text-teal-600 font-semibold text-[11px]">Stok: {{ o.stok }} {{ o.satuanTerkecil?.nama || "" }}</span>
                      </div>

                      <div class="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                        <div v-if="getObatMatches(item.searchQuery).length === 0" class="text-xs text-slate-400 mb-2">
                          Obat "<span class="font-bold text-slate-600">{{ item.searchQuery }}</span
                          >" belum ada di katalog.
                        </div>
                        <button
                          type="button"
                          @click="
                            $emit('bukaModalBarangBaru', item.searchQuery, index);
                            item.showDropdown = false;
                          "
                          class="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus class="w-3.5 h-3.5" /> + Tambah Master Obat Baru
                        </button>
                      </div>
                    </div>
                  </td>
                  <td class="p-2">
                    <select v-model="item.satuanBeli" class="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Pilih Satuan</option>
                      <option v-for="s in masterSatuan" :key="s._id" :value="s.nama">
                        {{ s.nama }}
                      </option>
                    </select>
                  </td>
                  <td class="p-2">
                    <input
                      type="number"
                      v-model.number="item.qty"
                      min="1"
                      @input="hitungSubtotal(index)"
                      required
                      class="w-full p-2 border border-slate-300 rounded-lg text-xs text-center outline-none focus:ring-2 focus:ring-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td class="p-2">
                    <input
                      type="number"
                      v-model.number="item.hargaBeli"
                      min="0"
                      @input="hitungSubtotal(index)"
                      placeholder="0"
                      required
                      class="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td class="p-2">
                    <input
                      type="number"
                      v-model.number="item.diskonPersen"
                      min="0"
                      max="100"
                      step="0.1"
                      @input="hitungSubtotal(index)"
                      placeholder="0"
                      class="w-full p-2 border border-slate-300 rounded-lg text-xs text-center outline-none focus:ring-2 focus:ring-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td class="p-2">
                    <input
                      type="number"
                      v-model.number="item.diskonNominal"
                      min="0"
                      @input="hitungSubtotal(index)"
                      placeholder="0"
                      class="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td class="p-2 font-semibold text-xs text-slate-700">Rp {{ formatRupiah(item.hargaBersih || item.hargaBeli) }}</td>
                  <td class="p-2 bg-teal-50/50">
                    <input
                      type="number"
                      v-model.number="item.hargaJual"
                      min="0"
                      placeholder="Rp Jual"
                      required
                      class="w-full p-2 border border-teal-300 bg-white rounded-lg text-xs font-bold text-teal-800 outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </td>
                  <td class="p-2 font-bold text-xs text-teal-800">Rp {{ formatRupiah(item.subtotal) }}</td>
                  <td class="p-2 text-center">
                    <button type="button" @click="hapusBarisObat(index)" :disabled="fakturItems.length === 1" class="text-rose-500 hover:text-rose-700 font-bold disabled:opacity-30 cursor-pointer">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-between items-center bg-teal-50 p-4 rounded-lg border border-teal-100">
          <span class="font-bold text-teal-900 text-sm">Total Faktur Pembelian:</span>
          <span class="text-xl font-bold text-teal-700">Rp {{ formatRupiah(grandTotalFaktur) }}</span>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-slate-100">
          <button type="button" @click="tutupModal" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition cursor-pointer">Batal</button>

          <div class="flex gap-3">
            <button type="button" @click="simpanPendingFaktur" class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition shadow cursor-pointer flex items-center gap-1.5">
              💾 Simpan Pending (Draft)
            </button>
            <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-sm transition shadow cursor-pointer">Simpan Semua Obat ke Stok</button>
          </div>
        </div>
      </form>
    </div>

    <!-- 🎯 MODAL DIALOG POPUP KELOLA DAFTAR DRAFT -->
    <div v-if="showModalListDraft" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 max-h-[80vh] flex flex-col">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h4 class="font-bold text-slate-800 text-base flex items-center gap-2"><span>📂</span> Daftar Faktur Pending ({{ daftarDraft.length }})</h4>
          <button @click="showModalListDraft = false" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <div class="overflow-y-auto flex-1 space-y-3">
          <div v-if="daftarDraft.length === 0" class="text-center py-8 text-slate-400 text-sm">Belum ada draft faktur yang disimpan.</div>

          <div v-for="draft in daftarDraft" :key="draft.idDraft" class="p-4 border border-slate-200 rounded-xl hover:border-amber-400 transition bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div class="font-bold text-slate-800 text-sm">{{ draft.header.pabrik || "Tanpa PBF" }}</div>
              <div class="text-xs text-slate-500">
                No. Faktur: <span class="font-semibold text-slate-700">{{ draft.header.noFaktur }}</span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">Disimpan: {{ formatWaktu(draft.waktuSimpan) }} • {{ draft.items?.length || 0 }} barang</div>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span class="font-bold text-teal-700 text-sm">Rp {{ formatRupiah(draft.totalBayar) }}</span>
              <div class="flex gap-2">
                <button @click="pilihDraft(draft)" type="button" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer">Muat Draft</button>
                <button @click="bukaModalHapus(draft)" type="button" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer">Hapus</button>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t pt-3 mt-4 flex justify-end">
          <button @click="showModalListDraft = false" type="button" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 🎯 KOMPONEN DIALOG KONFIRMASI HAPUS DRAFT -->
  <ConfirmModal
    :isOpen="modalHapusState.isOpen"
    title="Hapus Draft Faktur?"
    :message="`Yakin ingin menghapus draft faktur ${modalHapusState.namaDraft}? Data draft akan hilang permanen.`"
    @batal="modalHapusState.isOpen = false"
    @konfirmasi="eksekusiHapusDraft"
  />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { Plus } from "@lucide/vue";
import { useMasterStore } from "@/stores/useMasterStore.js";
import { apiPembelian } from "@/services/api.js";
import { formatRupiah } from "@/utils/formatters.js";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { useToastStore } from "@/stores/toastStore";

const toastStore = useToastStore();
const props = defineProps({
  modalFakturAktif: Boolean,
});

const emit = defineEmits(["update:modalFakturAktif", "bukaModalBarangBaru", "suksesSimpan"]);

const { daftarObat, masterSatuan } = useMasterStore();
const todayStr = new Date().toISOString().split("T")[0];

const STORAGE_KEY_HEADER = "TEMP_FAKTUR_HEADER";
const STORAGE_KEY_ITEMS = "TEMP_FAKTUR_ITEMS";
const STORAGE_KEY_DRAFT_LIST = "DAFTAR_DRAFT_FAKTUR_PBF";

const showModalListDraft = ref(false);
const daftarDraft = ref([]);

// 🎯 STATE REAKTIF UNTUK CONTROL MODAL HAPUS DRAFT (MENCEGAH ERROR UNDEFINED)
const modalHapusState = reactive({
  isOpen: false,
  targetId: null,
  namaDraft: "",
});

const fakturHeader = ref({
  idDraft: null,
  pabrik: "",
  noFaktur: `FAK-${Date.now().toString().slice(-6)}`,
  tglFaktur: todayStr,
  tglJatuhTempo: todayStr,
  metodeBayar: "Tunai",
});

const fakturItems = ref([
  {
    obatId: "",
    searchQuery: "",
    satuanBeli: "",
    showDropdown: false,
    qty: 1,
    hargaBeli: 0,
    diskonPersen: 0,
    diskonNominal: 0,
    hargaBersih: 0,
    hargaJual: 0,
    subtotal: 0,
  },
]);

// 🎯 MUAT DRAFT & TEMP STORAGE SAAT PERTAMA LOAD
onMounted(() => {
  muatDaftarDraft();

  const savedHeader = localStorage.getItem(STORAGE_KEY_HEADER);
  const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);

  if (savedHeader) {
    try {
      fakturHeader.value = JSON.parse(savedHeader);
    } catch (e) {}
  }
  if (savedItems) {
    try {
      fakturItems.value = JSON.parse(savedItems);
    } catch (e) {}
  }
});

const muatDaftarDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT_LIST);
    daftarDraft.value = raw ? JSON.parse(raw) : [];
  } catch (e) {
    daftarDraft.value = [];
  }
};

// 🎯 AUTO-SAVE REALTIME SETIAP KETIKAN (REFRESH PROOF)
watch(
  fakturHeader,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY_HEADER, JSON.stringify(newVal));
  },
  { deep: true },
);

watch(
  fakturItems,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(newVal));
  },
  { deep: true },
);

watch(
  () => props.modalFakturAktif,
  (newVal) => {
    if (newVal) {
      muatDaftarDraft();
      if (!fakturHeader.value.noFaktur) {
        fakturHeader.value.noFaktur = `FAK-${Date.now().toString().slice(-6)}`;
      }
    }
  },
);

const tambahBarisObat = () => {
  fakturItems.value.push({
    obatId: "",
    searchQuery: "",
    satuanBeli: "",
    showDropdown: false,
    qty: 1,
    hargaBeli: 0,
    diskonPersen: 0,
    diskonNominal: 0,
    hargaBersih: 0,
    hargaJual: 0,
    subtotal: 0,
  });
};

const hapusBarisObat = (index) => {
  if (fakturItems.value.length > 1) fakturItems.value.splice(index, 1);
};

const pilihObat = (index, obatObj) => {
  const item = fakturItems.value[index];
  item.obatId = obatObj._id;
  item.searchQuery = obatObj.nama;
  item.hargaBeli = obatObj.hargaBeliSatuanBesar || obatObj.hargaBeli || 0;
  item.hargaJual = obatObj.hargaJual || 0;
  item.satuanBeli = obatObj.satuanBesar?.nama || obatObj.satuanTerkecil?.nama || "";
  item.showDropdown = false;
  hitungSubtotal(index);
};

const hitungSubtotal = (index) => {
  const item = fakturItems.value[index];
  const hrgKotor = Number(item.hargaBeli || 0);
  const discP = Number(item.diskonPersen || 0);
  const discN = Number(item.diskonNominal || 0);
  const qty = Number(item.qty || 0);

  const potPersen = hrgKotor * (discP / 100);
  let hrgNetto = Math.max(0, hrgKotor - potPersen - discN);

  item.hargaBersih = Math.round(hrgNetto);
  item.subtotal = Math.round(hrgNetto * qty);

  if (!item.hargaJual || item.hargaJual === 0) {
    item.hargaJual = Math.round(hrgNetto + hrgNetto * 0.2);
  }
};

const grandTotalFaktur = computed(() => fakturItems.value.reduce((total, item) => total + Number(item.subtotal || 0), 0));

const getObatMatches = (query) => {
  if (!query) return daftarObat.value.slice(0, 5);
  const q = query.toLowerCase();
  return daftarObat.value.filter((o) => (o.nama && o.nama.toLowerCase().includes(q)) || (o.idObat && o.idObat.toLowerCase().includes(q)));
};

const formatWaktu = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
};

// 🎯 FUNGSI UTAMA MEMANGGIL DRAFT PENDING
const pilihDraft = (draft) => {
  // 1. Pindahkan data draft ke form aktif
  fakturHeader.value = JSON.parse(JSON.stringify(draft.header));
  fakturItems.value = JSON.parse(JSON.stringify(draft.items));
  showModalListDraft.value = false;

  // 🎯 2. Hapus draft ini dari LocalStorage karena sudah dimuat ke form utama
  let draftLama = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFT_LIST) || "[]");
  draftLama = draftLama.filter((d) => d.idDraft !== draft.idDraft);
  localStorage.setItem(STORAGE_KEY_DRAFT_LIST, JSON.stringify(draftLama));

  // 3. Refresh list draft & beri notifikasi
  muatDaftarDraft();
  toastStore.trigger("📂 Draft dimuat ke form!", "info");
};

// 🎯 FUNGSI PEMICU DIALOG HAPUS DRAFT (MEMBUKA CONFIRM MODAL)
const bukaModalHapus = (draft) => {
  modalHapusState.targetId = draft.idDraft;
  modalHapusState.namaDraft = draft.header?.pabrik || draft.header?.noFaktur || "Draft Ini";
  modalHapusState.isOpen = true;
};

// 🎯 EKSEKUSI HAPUS REAL DARI LOCALSTORAGE
const eksekusiHapusDraft = () => {
  let draftLama = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFT_LIST) || "[]");
  draftLama = draftLama.filter((d) => d.idDraft !== modalHapusState.targetId);
  localStorage.setItem(STORAGE_KEY_DRAFT_LIST, JSON.stringify(draftLama));

  muatDaftarDraft();
  modalHapusState.isOpen = false;
  toastStore.trigger("🗑️ Draft faktur berhasil dihapus!", "info");
};

const bersihkanDraftLokal = () => {
  localStorage.removeItem(STORAGE_KEY_HEADER);
  localStorage.removeItem(STORAGE_KEY_ITEMS);
  fakturHeader.value = {
    idDraft: null,
    pabrik: "",
    noFaktur: `FAK-${Date.now().toString().slice(-6)}`,
    tglFaktur: todayStr,
    tglJatuhTempo: todayStr,
    metodeBayar: "Tunai",
  };
  fakturItems.value = [
    {
      obatId: "",
      searchQuery: "",
      satuanBeli: "",
      showDropdown: false,
      qty: 1,
      hargaBeli: 0,
      diskonPersen: 0,
      diskonNominal: 0,
      hargaBersih: 0,
      hargaJual: 0,
      subtotal: 0,
    },
  ];
};

const simpanPendingFaktur = () => {
  if (!fakturHeader.value.pabrik || fakturItems.value.length === 0) {
    return toastStore.trigger("Isi minimal Nama PBF dan 1 barang!", "warning");
  }

  const idDraftFinal = fakturHeader.value.idDraft || `DRAFT-${Date.now().toString().slice(-6)}`;
  fakturHeader.value.idDraft = idDraftFinal;

  const draftBaru = {
    idDraft: idDraftFinal,
    waktuSimpan: new Date().toISOString(),
    header: { ...fakturHeader.value },
    items: JSON.parse(JSON.stringify(fakturItems.value)),
    totalBayar: grandTotalFaktur.value,
  };

  let draftLama = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFT_LIST) || "[]");
  draftLama = draftLama.filter((d) => d.idDraft !== idDraftFinal);
  draftLama.unshift(draftBaru);

  localStorage.setItem(STORAGE_KEY_DRAFT_LIST, JSON.stringify(draftLama));
  toastStore.trigger("💾 Faktur disimpan ke Draft!", "success");
  muatDaftarDraft();
  bersihkanDraftLokal();
  tutupModal();
};

const simpanFaktur = async () => {
  if (fakturItems.value.some((item) => !item.obatId)) {
    return toastStore.trigger("⚠️ Ada barang belum dipilih!", "warning");
  }

  const formattedItems = fakturItems.value.map((item) => ({
    obat: item.obatId,
    obatId: item.obatId, // 🎯 Tambahkan obatId agar backend yang pakai key 'obat' maupun 'obatId' tetap bisa baca
    qty: Number(item.qty || 1),
    // 🎯 Pastikan mengambil hargaBersih (atau hargaBeli jika hargaBersih kosong)
    hargaBeli: Number(item.hargaBersih || item.hargaBeli || 0),
    hargaBeliBaru: Number(item.hargaBersih || item.hargaBeli || 0),
    hargaJual: Number(item.hargaJual || 0),
    hargaJualBaru: Number(item.hargaJual || 0),
    diskonPersen: Number(item.diskonPersen || 0),
    diskonNominal: Number(item.diskonNominal || 0),
    hargaBersih: Number(item.hargaBersih || item.hargaBeli || 0),
    subtotal: Number(item.subtotal || 0),
    satuanBeli: item.satuanBeli,
  }));

  // 🎯 DEBUG 1: Cek di console browser apa yang dikirim
  console.log("📦 PAYLOAD DIKIRIM KE BACKEND:", {
    header: {
      ...fakturHeader.value,
      pbf: fakturHeader.value.pabrik, // 🎯 Sertakan 'pbf' agar nama distributor tercatat di histori
    },
    items: formattedItems,
    totalBayar: grandTotalFaktur.value,
  });

  try {
    await apiPembelian.simpanFaktur({
      header: {
        ...fakturHeader.value,
        pbf: fakturHeader.value.pabrik, // 🎯 Sertakan 'pbf'
      },
      items: formattedItems,
      totalBayar: grandTotalFaktur.value,
    });

    toastStore.trigger("✅ Faktur PBF berhasil disimpan!", "success");
    bersihkanDraftLokal();
    tutupModal();
    emit("suksesSimpan");
  } catch (error) {
    console.error("Error simpan faktur:", error);
    toastStore.trigger(`❌ Gagal menyimpan faktur: ${error.message || "Terjadi kesalahan"}`, "error");
  }
};

const tutupModal = () => {
  emit("update:modalFakturAktif", false);
};
</script>
