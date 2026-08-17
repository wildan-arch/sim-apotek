<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Dashboard Ringkasan Apotek</h1>
      <p class="text-xs text-slate-500 mt-1">Selamat datang kembali! Berikut statistik singkat operasional hari ini.</p>
    </div>

    <!-- CARDS RINGKASAN -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-xs font-semibold text-slate-400">Total Item Obat</div>
        <div class="text-2xl font-extrabold text-slate-800 mt-1">{{ totalItemObat }} Item</div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-xs font-semibold text-slate-400">Stok Menipis ( Alert )</div>
        <div class="text-2xl font-extrabold text-rose-600 mt-1">{{ totalStokMenipis }} Item</div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-xs font-semibold text-slate-400">Total Faktur Pending</div>
        <div class="text-2xl font-extrabold text-amber-600 mt-1">{{ totalDraftFaktur }} Draft</div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-xs font-semibold text-slate-400">Hutang PBF Belum Lunas</div>
        <div class="text-2xl font-extrabold text-teal-700 mt-1">{{ props.rekapHutang?.totalFakturBelumLunas || 0 }} Faktur</div>
      </div>
    </div>
    <!-- CARD ANALISIS -->
    <AnalisisProdukCard />

    <!-- SECTION CARDS PERINGATAN ED DAN OBAT MENIPIS -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <!-- KOLOM KIRI: PERINGATAN OBAT ED -->
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 class="text-base font-bold text-slate-800 mb-3">Peringatan Obat Mendekati Kadaluarsa (ED)</h2>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left text-slate-600">
            <thead class="text-slate-700 uppercase bg-slate-50">
              <tr>
                <th class="px-3 py-2">Nama Obat</th>
                <th class="px-3 py-2">Stok</th>
                <th class="px-3 py-2">Tanggal ED</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in props.obatAkanED" :key="item._id || item.id" class="border-none">
                <td class="px-3 py-2 font-medium text-slate-900">{{ item.nama }}</td>
                <td class="px-3 py-2">{{ item.stok }}</td>
                <td class="px-3 py-2 text-rose-600 font-semibold">{{ formatTanggalSingkat(item.expiredDate) }}</td>
              </tr>
              <tr v-if="!props.obatAkanED || props.obatAkanED.length === 0">
                <td colspan="3" class="px-3 py-4 text-center text-slate-400 italic">Tidak ada obat mendekati ED</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- KOLOM KANAN: STOK OBAT MENIPIS -->
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 class="text-base font-bold text-slate-800 mb-3">Peringatan Obat Perlu Restock</h2>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left text-slate-600">
            <thead class="text-slate-700 uppercase bg-slate-50">
              <tr>
                <th class="px-3 py-2">Nama Obat</th>
                <th class="px-3 py-2">Sisa Stok</th>
                <th class="px-3 py-2">Min. Stok</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in stokMenipisList" :key="item._id || item.id" class="border-none">
                <td class="px-3 py-2 font-medium text-slate-900 uppercase">{{ item.nama }}</td>
                <td class="px-3 py-2 text-rose-600 font-bold">{{ item.stok }}</td>
                <td class="px-3 py-2">{{ item.minStok || 5 }}</td>
              </tr>
              <tr v-if="stokMenipisList.length === 0">
                <td colspan="3" class="px-3 py-4 text-center text-slate-400 italic">Stok semua obat aman</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { formatRupiah, formatTanggalSingkat } from "@/utils/formatters.js";
import AnalisisProdukCard from "@/components/AnalisisProdukCard.vue";

// Menerima Props dari App.vue
const props = defineProps({
  daftarObat: {
    type: Array,
    default: () => [],
  },
  obatAkanED: {
    type: Array,
    default: () => [],
  },
  rekapHutang: {
    type: Object,
    default: () => ({ totalHutangBelumLunas: 0, totalFakturBelumLunas: 0 }),
  },
});

// State internal untuk membaca Draft Faktur dari LocalStorage
const daftarDraftFaktur = ref([]);

const loadDraftFaktur = () => {
  try {
    const draft = JSON.parse(localStorage.getItem("DAFTAR_DRAFT_FAKTUR_PBF") || "[]");
    daftarDraftFaktur.value = draft;
  } catch (err) {
    daftarDraftFaktur.value = [];
  }
};

// Computed Statistik berdasarkan Props
const totalItemObat = computed(() => (props.daftarObat ? props.daftarObat.length : 0));

const stokMenipisList = computed(() => {
  if (!props.daftarObat) return [];
  return props.daftarObat.filter((o) => Number(o.stok || 0) <= Number(o.minStok || 5));
});

const totalStokMenipis = computed(() => stokMenipisList.value.length);
const totalDraftFaktur = computed(() => daftarDraftFaktur.value.length);

onMounted(() => {
  loadDraftFaktur();
});
</script>
