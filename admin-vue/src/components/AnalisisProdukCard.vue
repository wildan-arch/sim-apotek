<template>
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
    <!-- HEADER CARD & DROPDOWN FILTER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
      <div>
        <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
          <span>{{ filterPergerakan === "fast" ? "🔥" : "🐢" }}</span>
          <span>Pergerakan Stok Obat</span>
        </h3>
        <p class="text-[11px] text-slate-400 mt-0.5">Analisis obat terlaris vs lambat laku</p>
      </div>
      <!-- CONTAINER DROPDOWN FILTER -->
      <div class="flex items-center gap-2">
        <!-- FILTER PERIODE WAKTU -->
        <select v-model="periodeWaktu" @change="loadAnalisisPergerakan" class="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
          <option value="bulan_ini">📅 Bulan Ini</option>
          <option value="7_hari">🗓️ 7 Hari Terakhir</option>
          <option value="30_hari">🗓️ 30 Hari Terakhir</option>
          <option value="semua">🌐 Semua Waktu</option>
        </select>

        <!-- FILTER FAST / SLOW MOVING -->
        <select v-model="filterPergerakan" class="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
          <option value="fast">🔥 Top 10 Fast-Moving</option>
          <option value="slow">🐢 Top 10 Slow-Moving</option>
        </select>
      </div>
    </div>

    <!-- STATE LOADING -->
    <div v-if="loading" class="py-8 text-center text-xs text-slate-400 space-y-2">
      <div class="animate-spin w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
      <p>Menganalisis data penjualan...</p>
    </div>

    <!-- STATE KOSONG -->
    <div v-else-if="daftarTampil.length === 0" class="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">Belum ada data transaksi untuk kategori ini.</div>

    <!-- LIST BARANG (TOP 10) -->
    <div v-else class="divide-y divide-slate-100">
      <div v-for="(item, index) in daftarTampil" :key="item._id || index" class="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition">
        <!-- Info Kiri: Ranking & Nama Obat -->
        <div class="flex items-center gap-3">
          <span
            :class="[
              'w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px]',
              filterPergerakan === 'fast' ? (index === 0 ? 'bg-amber-400 text-white shadow-sm' : index < 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600') : 'bg-rose-100 text-rose-700',
            ]"
          >
            {{ index + 1 }}
          </span>
          <div>
            <div class="text-xs font-bold text-slate-800 capitalize">{{ item.nama }}</div>
            <div class="text-[10px] text-slate-400">
              Sisa Stok: <span class="font-semibold text-slate-600">{{ item.stok || 0 }} {{ item.satuan || "Pcs" }}</span>
            </div>
          </div>
        </div>

        <!-- Info Kanan: Terjual & Omset -->
        <div class="text-right">
          <span
            :class="[
              'px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase',
              filterPergerakan === 'fast' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60',
            ]"
          >
            {{ item.totalTerjual }} {{ item.satuan || "Pcs" }} Terjual
          </span>
          <div class="text-[10px] text-slate-500 font-medium mt-0.5">Rp {{ formatRupiah(item.totalOmset || 0) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { formatRupiah } from "@/utils/formatters.js";
import { apiPenjualan } from "@/services/api.js";

const loading = ref(false);
const filterPergerakan = ref("fast"); // 'fast' | 'slow'
const periodeWaktu = ref("bulan_ini"); // Default filter: Bulan Ini

const dataFastMoving = ref([]);
const dataSlowMoving = ref([]);

// Computed switcher data berdasarkan dropdown
const daftarTampil = computed(() => {
  return filterPergerakan.value === "fast" ? dataFastMoving.value : dataSlowMoving.value;
});

const loadAnalisisPergerakan = async () => {
  loading.value = true;
  try {
    // Panggil API analitik backend
    const res = await apiPenjualan.getAnalisisPergerakan(periodeWaktu.value);
    dataFastMoving.value = res?.fastMoving || [];
    dataSlowMoving.value = res?.slowMoving || [];
  } catch (err) {
    console.error("Gagal mengambil data pergerakan barang:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAnalisisPergerakan();
});
</script>
