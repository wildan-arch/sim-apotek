<template>
  <!-- 🎯 SECTION UTAMA: Terkunci seukuran layar (h-screen) & overflow-hidden -->
  <section class="print:hidden h-full w-full flex flex-col p-4 sm:p-6 overflow-hidden bg-slate-50 gap-3">
    <!-- 1. HEADER LAPORAN & FILTER TANGGAL -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 flex-none">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Laporan Pembelian (Faktur PBF)</h1>
        <p class="text-xs text-slate-500 mt-1">Riwayat faktur masuk, distributor PBF, dan status pembayaran tempo/lunas.</p>
      </div>

      <!-- TOOLBAR FILTER TANGGAL & EXPORT EXCEL -->
      <div class="flex flex-wrap items-center gap-2.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <input
          type="date"
          v-model="filterPembelian.tglAwal"
          class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer"
        />
        <span class="text-slate-400 font-semibold text-[11px] px-0.5">s/d</span>
        <input
          type="date"
          v-model="filterPembelian.tglAkhir"
          class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer"
        />

        <button @click="loadRiwayatPembelian" type="button" class="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition shadow-xs active:scale-95 flex items-center gap-1">
          <span>🔍</span> Filter
        </button>

        <div class="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>

        <button @click="exportExcelPembelian" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer">
          📊 Export Excel
        </button>
      </div>
    </div>

    <!-- 2. CARDS RINGKASAN PEMBELIAN (5 KOLOM) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-none">
      <!-- Total Faktur -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Total Faktur Masuk</div>
        <div class="text-lg font-extrabold text-slate-800 mt-0.5">{{ rekapPembelian.totalFaktur }} Faktur</div>
        <div class="text-[10px] text-slate-400 mt-1">Dari seluruh distributor</div>
      </div>

      <!-- Total Belanja PBF -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Total Belanja PBF</div>
        <div class="text-lg font-extrabold text-teal-700 mt-0.5">Rp {{ formatRupiah(rekapPembelian.totalBelanja) }}</div>
        <div class="text-[10px] text-slate-400 mt-1">Nilai akumulasi pembelian</div>
      </div>

      <!-- 🎯 KARTU BARU: PENGADAAN PER TIPE BARANG -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Pengadaan Per Tipe</div>
        <div class="text-xs font-bold text-teal-800 mt-1">
          Medis: <span class="font-extrabold text-teal-600">Rp {{ formatRupiah(rekapPembelian.totalMedis) }}</span>
        </div>
        <div class="text-xs font-bold text-indigo-800 mt-0.5">
          General: <span class="font-extrabold text-indigo-600">Rp {{ formatRupiah(rekapPembelian.totalGeneral) }}</span>
        </div>
      </div>

      <!-- Total Faktur Lunas -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Faktur Lunas</div>
        <div class="text-lg font-extrabold text-emerald-600 mt-0.5">Rp {{ formatRupiah(rekapPembelian.totalLunas) }}</div>
        <div class="text-[10px] text-emerald-600 font-medium mt-1">{{ rekapPembelian.jumlahLunas }} Faktur Terbayar</div>
      </div>

      <!-- Total Utang / Tempo -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Sisa Tagihan Tempo</div>
        <div class="text-lg font-extrabold text-rose-600 mt-0.5">Rp {{ formatRupiah(rekapPembelian.totalTempo) }}</div>
        <div class="text-[10px] text-rose-600 font-medium mt-1">{{ rekapPembelian.jumlahTempo }} Belum Lunas</div>
      </div>
    </div>

    <!-- 3. KONTEN TABEL (MEMENUHI SISA LAYAR / flex-1) -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden p-4">
      <div class="flex justify-between items-center mb-3 flex-none">
        <h3 class="font-bold text-md text-slate-800">Riwayat Transaksi PBF</h3>
        <span class="text-xs text-slate-500 font-bold">Menampilkan: {{ riwayatPembelian.length }} Faktur</span>
      </div>

      <!-- STATE LOADING -->
      <div v-if="isLoading" class="py-12 text-center space-y-3 flex-1 flex flex-col justify-center">
        <div class="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-xs text-slate-500 font-medium">Memuat data faktur PBF...</p>
      </div>

      <!-- AREA SCROLLING TABEL -->
      <div v-else class="overflow-x-auto overflow-y-auto flex-1 relative border border-slate-100 rounded-lg">
        <table class="w-full text-left border-collapse text-sm">
          <thead class="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase shadow-xs">
            <tr>
              <th class="p-3 w-8 text-center"></th>
              <th class="p-3">Tanggal</th>
              <th class="p-3">No. Faktur</th>
              <th class="p-3">PBF / Distributor</th>
              <th class="p-3">Metode Bayar</th>
              <th class="p-3">Total Belanja</th>
              <th class="p-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <template v-for="faktur in paginatedPembelian" :key="faktur._id || faktur.noFaktur">
              <tr @click="toggleRow(faktur.noFaktur || faktur._id)" class="hover:bg-teal-50/40 transition cursor-pointer select-none" :class="{ 'bg-teal-50/30': expandedRow === (faktur.noFaktur || faktur._id) }">
                <td class="p-3 text-center text-slate-400">
                  <span class="inline-block transition-transform duration-200 text-[10px]" :class="{ 'rotate-90 text-teal-600 font-bold': expandedRow === (faktur.noFaktur || faktur._id) }"> ▶ </span>
                </td>
                <td class="p-3 text-slate-600">{{ formatTanggalSingkat(faktur.tglFaktur || faktur.createdAt) }}</td>
                <td class="p-3 font-mono font-bold text-slate-700">{{ faktur.noFaktur || "-" }}</td>
                <td class="p-3 font-semibold text-slate-800">{{ faktur.pabrik || faktur.pbf || "-" }}</td>
                <td class="p-3">
                  <span :class="faktur.metodeBayar === 'Tempo' ? 'text-amber-600' : 'text-teal-600'" class="font-bold text-xs">
                    {{ faktur.metodeBayar }}
                  </span>
                </td>
                <td class="p-3 font-extrabold text-slate-800">Rp {{ formatRupiah(faktur.totalBayar) }}</td>
                <td class="p-3">
                  <span :class="faktur.statusBayar === 'Lunas' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'" class="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase">
                    {{ faktur.statusBayar }}
                  </span>
                </td>
              </tr>

              <!-- ACCORDION RINCIAN ITEM BARANG & BADGE TIPE -->
              <tr v-if="expandedRow === (faktur.noFaktur || faktur._id)" class="bg-slate-50/80 border-b border-slate-200">
                <td colspan="7" class="p-4 pl-12">
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-inner space-y-2">
                    <h4 class="font-bold text-xs text-slate-800 border-b pb-2">📦 Item Faktur Pembelian ({{ faktur.items?.length || 0 }} Barang)</h4>
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-100 text-slate-600 font-bold">
                        <tr>
                          <th class="p-2">Nama Barang / Obat</th>
                          <th class="p-2 text-center">Jumlah (Qty)</th>
                          <th class="p-2 text-right">Harga Beli PBF @</th>
                          <th class="p-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        <tr v-for="(item, idx) in faktur.items" :key="idx">
                          <td class="p-2 font-medium text-slate-800 flex items-center gap-1.5">
                            <!-- BADGE TIPE BARANG ACCORDION -->
                            <span
                              :class="[
                                'px-1.5 py-0.5 text-[9px] font-bold rounded border',
                                getTipeNama(item).toLowerCase().includes('general') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200',
                              ]"
                            >
                              {{ getTipeNama(item) }}
                            </span>
                            <span>{{ item.obat?.nama || item.nama || "-" }}</span>
                          </td>
                          <td class="p-2 text-center font-bold">{{ item.qty }} {{ item.satuan || "Pcs" }}</td>
                          <td class="p-2 text-right text-slate-600">Rp {{ formatRupiah(item.hargaBeli || item.harga) }}</td>
                          <td class="p-2 text-right font-bold text-slate-900">Rp {{ formatRupiah(item.qty * (item.hargaBeli || item.harga || 0)) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="riwayatPembelian.length === 0 && !isLoading">
              <td colspan="7" class="p-6 text-center text-slate-400">Belum ada riwayat pembelian PBF pada periode ini.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4. CONTROLLER PAGINATION -->
      <div v-if="riwayatPembelian.length > 0" class="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs flex-none">
        <span class="text-slate-500 font-medium"> Menampilkan {{ paginatedPembelian.length }} dari {{ riwayatPembelian.length }} faktur (Halaman {{ currentPagePembelian }} / {{ totalPagesPembelian }}) </span>
        <div class="flex gap-2">
          <button @click="currentPagePembelian--" :disabled="currentPagePembelian === 1" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            ← Prev
          </button>
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-slate-500 font-medium">Ke Halaman:</span>
            <input
              type="number"
              v-model.number="currentPagePembelian"
              min="1"
              :max="totalPagesPembelian"
              class="w-12 p-1 border border-slate-300 rounded-md text-center font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span class="text-slate-400">/ {{ totalPagesPembelian }}</span>
          </div>
          <button
            @click="currentPagePembelian++"
            :disabled="currentPagePembelian === totalPagesPembelian"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import { apiPembelian } from "@/services/api.js";
import { formatRupiah, formatTanggalSingkat } from "@/utils/formatters.js";

const todayStr = new Date().toISOString().split("T")[0];
const filterPembelian = ref({ tglAwal: todayStr, tglAkhir: todayStr });
const riwayatPembelian = ref([]);
const isLoading = ref(false);
const expandedRow = ref(null);

// PAGINATION
const currentPagePembelian = ref(1);
const itemsPerPagePembelian = ref(10);

const paginatedPembelian = computed(() => {
  const start = (currentPagePembelian.value - 1) * itemsPerPagePembelian.value;
  return riwayatPembelian.value.slice(start, start + itemsPerPagePembelian.value);
});

const totalPagesPembelian = computed(() => Math.ceil(riwayatPembelian.value.length / itemsPerPagePembelian.value) || 1);

// HELPER TIPE BARANG DARI OBJ/STRING
const getTipeNama = (item) => {
  const tipe = item.tipeBarang || item.obat?.tipeBarang;
  if (typeof tipe === "object" && tipe !== null) return tipe.nama || "Obat & Medis";
  if (typeof tipe === "string" && tipe) return tipe;
  return "Obat & Medis";
};

// 🎯 COMPUTED REKAP CARD PBF (TERMASUK TIPE BARANG)
const rekapPembelian = computed(() => {
  let totalBelanja = 0;
  let totalLunas = 0;
  let totalTempo = 0;
  let jumlahLunas = 0;
  let jumlahTempo = 0;
  let totalMedis = 0;
  let totalGeneral = 0;

  riwayatPembelian.value.forEach((f) => {
    const nominal = Number(f.totalBayar || 0);
    totalBelanja += nominal;

    if (f.statusBayar === "Lunas") {
      totalLunas += nominal;
      jumlahLunas++;
    } else {
      totalTempo += nominal;
      jumlahTempo++;
    }

    f.items?.forEach((item) => {
      const subtotal = Number(item.qty || 0) * Number(item.hargaBeli || item.harga || 0);
      const namaTipe = getTipeNama(item).toLowerCase();
      if (namaTipe.includes("general") || namaTipe.includes("minimarket")) {
        totalGeneral += subtotal;
      } else {
        totalMedis += subtotal;
      }
    });
  });

  return {
    totalFaktur: riwayatPembelian.value.length,
    totalBelanja,
    totalLunas,
    totalTempo,
    jumlahLunas,
    jumlahTempo,
    totalMedis,
    totalGeneral,
  };
});

const toggleRow = (id) => {
  expandedRow.value = expandedRow.value === id ? null : id;
};

const loadRiwayatPembelian = async () => {
  isLoading.value = true;
  try {
    const data = await apiPembelian.getLaporan(filterPembelian.value.tglAwal, filterPembelian.value.tglAkhir);
    riwayatPembelian.value = data?.dataPembelian || data?.data || data || [];
    currentPagePembelian.value = 1;
  } catch (err) {
    console.error("Gagal memuat pembelian:", err);
  } finally {
    isLoading.value = false;
  }
};

const exportExcelPembelian = () => {
  if (riwayatPembelian.value.length === 0) return alert("Data kosong!");
  const data = riwayatPembelian.value.map((f) => ({
    Tanggal: formatTanggalSingkat(f.tglFaktur || f.createdAt),
    "No. Faktur": f.noFaktur,
    Distributor: f.pabrik || f.pbf,
    Metode: f.metodeBayar,
    "Total (Rp)": f.totalBayar,
    Status: f.statusBayar,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pembelian");
  XLSX.writeFile(wb, `Laporan_Pembelian_PBF_${filterPembelian.value.tglAwal}.xlsx`);
};

onMounted(() => {
  loadRiwayatPembelian();
});
</script>
