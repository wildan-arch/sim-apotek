<template>
  <!-- 🎯 FIX 1: Gunakan h-screen (bukan h-full) & flex-col overflow-hidden -->
  <section class="print:hidden h-full w-full flex flex-col p-4 sm:p-6 overflow-hidden bg-slate-50 gap-3">
    <!-- HEADER LAPORAN & FILTER TANGGAL (DIAM / flex-none) -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 flex-none">
      <!-- JUDUL HALAMAN -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Laporan Penjualan</h1>
        <p class="text-xs text-slate-500 mt-1">Rekap omset, HPP modal, laba kotor, dan histori transaksi penjualan.</p>
      </div>

      <!-- TOOLBAR FILTER & AKSI WA -->
      <div class="flex flex-wrap items-center gap-2.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <input
          type="date"
          v-model="filterLaporan.tglAwal"
          class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer"
        />

        <span class="text-slate-400 font-semibold text-[11px] px-0.5">s/d</span>

        <input
          type="date"
          v-model="filterLaporan.tglAkhir"
          class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer"
        />

        <button @click="loadLaporanPenjualan" type="button" class="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition shadow-xs active:scale-95 flex items-center gap-1">
          <span>🔍</span> Filter
        </button>

        <div class="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>

        <button @click="kirimLaporanWA" type="button" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs active:scale-95">
          <span class="text-sm">💬</span> Kirim WA
        </button>
      </div>
    </div>

    <!-- KOTAK REKAP RINGKASAN KEUANGAN (DIAM / flex-none) -->
    <!-- KOTAK REKAP RINGKASAN KEUANGAN (5 KOLOM) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-none">
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Total Transaksi</div>
        <div class="text-lg font-extrabold text-slate-800 mt-0.5">{{ rekapLaporan.totalTransaksi }} Transaksi</div>
        <div class="text-[10px] text-slate-500 mt-1">
          Tunai: <span class="font-bold text-slate-700">{{ rekapLaporan.totalTunai || 0 }}</span> | Non-Tunai: <span class="font-bold text-slate-700">{{ rekapLaporan.totalNonTunai || 0 }}</span>
        </div>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Total Omset Penjualan</div>
        <div class="text-lg font-extrabold text-teal-700 mt-0.5">Rp {{ formatRupiah(rekapLaporan.totalOmset) }}</div>
        <div class="text-[10px] text-slate-500 mt-1">Total kotor belum dipotong HPP</div>
      </div>

      <!-- 🎯 KARTU BARU: OMSET PER TIPE BARANG -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Omset Per Tipe Barang</div>
        <div class="text-xs font-bold text-teal-800 mt-1">
          Medis: <span class="font-extrabold text-teal-600">Rp {{ formatRupiah(rekapLaporan.omsetMedis || 0) }}</span>
        </div>
        <div class="text-xs font-bold text-indigo-800 mt-0.5">
          General: <span class="font-extrabold text-indigo-600">Rp {{ formatRupiah(rekapLaporan.omsetGeneral || 0) }}</span>
        </div>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Total Modal (HPP)</div>
        <div class="text-lg font-extrabold text-amber-600 mt-0.5">Rp {{ formatRupiah(rekapLaporan.totalModalHpp) }}</div>
        <div class="text-[10px] text-slate-500 mt-1">Total pengeluaran modal beli</div>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Estimasi Laba Kotor</div>
        <div class="text-lg font-extrabold text-emerald-600 mt-0.5">Rp {{ formatRupiah(rekapLaporan.totalLabaKotor) }}</div>
        <div class="text-[10px] text-emerald-600 font-semibold mt-1">Omset Penjualan - Total HPP</div>
      </div>
    </div>

    <!-- 🎯 FIX 2: CONTAINER CARD UTAMA DIUBAH MENJADI flex-1 flex flex-col min-h-0 overflow-hidden -->
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
      <!-- SUB HEADER INSIDE BOX (DIAM / flex-none) -->
      <div class="flex justify-between items-center mb-3 flex-none">
        <h3 class="font-bold text-md text-slate-800">Riwayat Transaksi Penjualan</h3>
        <button v-if="historiPenjualan.length > 0" @click="exportExcelPenjualan" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow flex items-center gap-1.5 cursor-pointer">
          📊 Export Excel Penjualan
        </button>
      </div>

      <!-- STATE LOADING -->
      <div v-if="isLaporanLoading" class="py-12 text-center space-y-3 flex-1 flex flex-col justify-center">
        <div class="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-xs text-slate-500 font-medium">Memuat data laporan...</p>
      </div>

      <!-- STATE EMPTY -->
      <div v-else-if="!historiPenjualan || historiPenjualan.length === 0" class="py-12 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200 my-2 flex-1 flex flex-col justify-center">
        <div class="text-3xl mb-2">📋</div>
        <p class="text-sm font-bold text-slate-700">Belum ada data penjualan pada periode ini.</p>
        <p class="text-xs text-slate-400 mt-1">Gunakan filter tanggal di atas untuk melihat transaksi periode lain.</p>
      </div>

      <!-- 🎯 AREA SCROLLING TABEL (flex-1 overflow-y-auto) -->
      <div v-else class="overflow-x-auto overflow-y-auto flex-1 relative border border-slate-100 rounded-lg">
        <table class="w-full text-left border-collapse text-sm">
          <thead class="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase shadow-xs">
            <tr>
              <th class="p-3 w-8 text-center"></th>
              <th class="p-3">No. Struk</th>
              <th class="p-3">Waktu Transaksi</th>
              <th class="p-3">Metode</th>
              <th class="p-3">Total Omset</th>
              <th class="p-3">Laba Kotor</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm bg-white">
            <template v-for="p in paginatedPenjualan" :key="p._id || p.noStruk">
              <!-- BARIS UTAMA -->
              <tr @click="toggleRow(p.noStruk)" class="hover:bg-teal-50/40 transition cursor-pointer select-none" :class="{ 'bg-teal-50/30': expandedRow === p.noStruk }">
                <td class="p-3 text-center text-slate-400">
                  <span class="inline-block transition-transform duration-200 text-[10px]" :class="{ 'rotate-90 text-teal-600 font-bold': expandedRow === p.noStruk }"> ▶ </span>
                </td>
                <td class="p-3 font-mono font-bold text-xs text-teal-800">{{ p.noStruk }}</td>
                <td class="p-3 text-xs text-slate-500">{{ formatTanggal(p.createdAt) }}</td>
                <td class="p-3">
                  <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                    {{ p.metodeBayar }}
                  </span>
                </td>
                <td class="p-3 font-bold text-slate-800">Rp {{ formatRupiah(p.totalBayar) }}</td>
                <td class="p-3 font-extrabold text-emerald-600">Rp {{ formatRupiah(p.totalLabaKotor) }}</td>
              </tr>

              <!-- ACCORDION RINCIAN ITEM -->
              <tr v-if="expandedRow === p.noStruk" class="bg-slate-50/80 border-b border-slate-200">
                <td colspan="6" class="p-4 pl-12">
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-inner space-y-2">
                    <h4 class="font-bold text-xs text-slate-800 border-b pb-2">🛒 Rincian Item Belanja ({{ p.items?.length || 0 }} Jenis Obat)</h4>
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-100 text-slate-600 font-bold">
                        <tr>
                          <th class="p-2">Nama Obat / Barang</th>
                          <th class="p-2 text-center">Jumlah (Qty)</th>
                          <th class="p-2 text-right">Harga Jual @</th>
                          <th class="p-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        <tr v-for="(item, idx) in p.items" :key="idx">
                          <td class="p-2 font-medium text-slate-800 flex items-center gap-1.5">
                            <!-- 🎯 BADGE TIPE BARANG DI ACCORDION -->
                            <span :class="['px-1.5 py-0.5 text-[9px] font-bold rounded border', item.tipeBarang?.butuhDetailMedis !== false ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200']">
                              {{ typeof item.tipeBarang === "object" ? item.tipeBarang?.nama : item.tipeBarang || "Tanpa Tipe" }}
                            </span>
                            <span>{{ item.nama }}</span>
                          </td>
                          <td class="p-2 text-center font-bold">{{ item.qty }} {{ item.satuan?.nama || "Pcs" }}</td>
                          <td class="p-2 text-right text-slate-600">Rp {{ formatRupiah(item.hargaJual || item.harga) }}</td>
                          <td class="p-2 text-right font-bold text-slate-900">Rp {{ formatRupiah(item.qty * (item.hargaJual || item.harga || 0)) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- CONTROLLER PAGINATION (DIAM / flex-none) -->
      <div v-if="!isLaporanLoading && historiPenjualan.length > 0" class="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs flex-none">
        <span class="text-slate-500 font-medium"> Menampilkan {{ paginatedPenjualan.length }} dari {{ historiPenjualan.length }} transaksi (Halaman {{ currentPagePenjualan }} / {{ totalPagesPenjualan }}) </span>
        <div class="flex gap-2">
          <button @click="currentPagePenjualan--" :disabled="currentPagePenjualan === 1" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            ← Prev
          </button>
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-slate-500 font-medium">Ke Halaman:</span>
            <input
              type="number"
              v-model.number="currentPagePenjualan"
              min="1"
              :max="totalPagesPenjualan"
              class="w-12 p-1 border border-slate-300 rounded-md text-center font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span class="text-slate-400">/ {{ totalPagesPenjualan }}</span>
          </div>
          <button
            @click="currentPagePenjualan++"
            :disabled="currentPagePenjualan === totalPagesPenjualan"
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
import { apiPenjualan } from "@/services/api.js";
import { formatRupiah, formatTanggal, formatTanggalSingkat } from "@/utils/formatters.js";

const emit = defineEmits(["bukaModalKirimWa"]);

const todayStr = new Date().toISOString().split("T")[0];
const filterLaporan = ref({ tglAwal: todayStr, tglAkhir: todayStr });
const rekapLaporan = ref({ totalTransaksi: 0, totalOmset: 0, totalModalHpp: 0, totalLabaKotor: 0 });
const historiPenjualan = ref([]);
const isLaporanLoading = ref(false);
const expandedRow = ref(null);

// PAGINATION
const currentPagePenjualan = ref(1);
const itemsPerPagePenjualan = ref(10);

const paginatedPenjualan = computed(() => {
  const start = (currentPagePenjualan.value - 1) * itemsPerPagePenjualan.value;
  return historiPenjualan.value.slice(start, start + itemsPerPagePenjualan.value);
});

const totalPagesPenjualan = computed(() => Math.ceil(historiPenjualan.value.length / itemsPerPagePenjualan.value) || 1);

const toggleRow = (noStruk) => {
  expandedRow.value = expandedRow.value === noStruk ? null : noStruk;
};

const loadLaporanPenjualan = async () => {
  isLaporanLoading.value = true;
  try {
    const data = await apiPenjualan.getLaporan(filterLaporan.value.tglAwal, filterLaporan.value.tglAkhir);
    historiPenjualan.value = data.dataPenjualan || [];

    // 🎯 Hitung Agregasi Tipe Barang & Metode Pembayaran Dinamis
    let omsetMedis = 0;
    let omsetGeneral = 0;
    let totalTunai = 0;
    let totalNonTunai = 0;

    historiPenjualan.value.forEach((trx) => {
      if (trx.metodeBayar === "Tunai") totalTunai++;
      else totalNonTunai++;

      trx.items?.forEach((item) => {
        const itemTotal = item.qty * (item.hargaJual || item.harga || 0);
        const tipeNama = typeof item.tipeBarang === "object" ? item.tipeBarang?.nama : item.tipeBarang;

        if (tipeNama && tipeNama.toLowerCase().includes("general")) {
          omsetGeneral += itemTotal;
        } else {
          omsetMedis += itemTotal;
        }
      });
    });

    rekapLaporan.value = {
      ...(data.ringkasan || {}),
      omsetMedis,
      omsetGeneral,
      totalTunai,
      totalNonTunai,
      totalTransaksi: data.ringkasan?.totalTransaksi || historiPenjualan.value.length,
      totalOmset: data.ringkasan?.totalOmset || 0,
      totalModalHpp: data.ringkasan?.totalModalHpp || 0,
      totalLabaKotor: data.ringkasan?.totalLabaKotor || 0,
    };

    currentPagePenjualan.value = 1;
  } catch (err) {
    console.error("Gagal memuat laporan:", err);
  } finally {
    isLaporanLoading.value = false;
  }
};

const exportExcelPenjualan = () => {
  if (historiPenjualan.value.length === 0) return alert("Data kosong!");
  const data = historiPenjualan.value.map((p) => ({
    "No. Struk": p.noStruk,
    Waktu: formatTanggal(p.createdAt),
    Metode: p.metodeBayar,
    "Omset (Rp)": p.totalBayar,
    "Laba (Rp)": p.totalLabaKotor,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Penjualan");
  XLSX.writeFile(wb, `Laporan_Penjualan_${filterLaporan.value.tglAwal}.xlsx`);
};

const kirimLaporanWA = () => {
  const tglAwal = formatTanggalSingkat(filterLaporan.value.tglAwal);
  const tglAkhir = formatTanggalSingkat(filterLaporan.value.tglAkhir);

  const pesanText = `📊 *LAPORAN PENJUALAN APOTEK*
Periode: ${tglAwal} s/d ${tglAkhir}

- Total Transaksi: ${rekapLaporan.value.totalTransaksi} Transaksi
- Total Omset: Rp ${formatRupiah(rekapLaporan.value.totalOmset)}
- Total Modal (HPP): Rp ${formatRupiah(rekapLaporan.value.totalModalHpp)}
- Estimasi Laba Kotor: Rp ${formatRupiah(rekapLaporan.value.totalLabaKotor)}

_Dikirim otomatis dari SIM Apotek_`;
  console.log("Tombol WA diklik, pesan:", pesanText);

  emit("bukaModalKirimWa", pesanText);
};

onMounted(() => {
  loadLaporanPenjualan();
});
</script>
