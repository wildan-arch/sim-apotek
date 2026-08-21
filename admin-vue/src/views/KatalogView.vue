<template>
  <!-- 🎯 Container flex-col dengan tinggi maksimal (screen/100%) -->
  <section class="h-full w-full flex flex-col p-4 sm:p-6 overflow-hidden bg-slate-50 gap-3">
    <!-- HEADER & TOMBOL ACTIONS (STATIONARY) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-none">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Katalog Utama Barang</h1>
        <p class="text-xs text-slate-500 mt-1">Kelola daftar obat & barang eceran, stok satuan terkecil, harga jual, dan kedaluwarsa.</p>
      </div>

      <!-- TOMBOL ACTIONS KATALOG -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          @click="downloadTemplateExcel"
          type="button"
          class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 shadow-sm"
        >
          <span class="text-emerald-600 font-bold">📄</span> Template Excel
        </button>

        <input type="file" ref="fileInputRef" @change="handleImportExcel" accept=".xlsx, .xls" class="hidden" />

        <button @click="fileInputRef.click()" type="button" class="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
          <span class="font-bold">📥</span> Import Excel
        </button>

        <button @click="$emit('bukaModalBarangBaru', '')" class="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
          <Plus class="w-4 h-4" /> Tambah Barang
        </button>

        <button @click="$emit('bukaModalFaktur', '')" class="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
          <Plus class="w-4 h-4" /> Barang PBF
        </button>
      </div>
    </div>

    <!-- SEARCH BAR & FILTER DINAMIS (STATIONARY) -->
    <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 w-full flex-none">
      <!-- INPUT PENCARIAN -->
      <div class="w-full md:w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-teal-500/20">
        <span class="text-slate-400 text-xs">🔍</span>
        <input type="text" v-model="searchKey" placeholder="Cari nama barang atau kode SKU..." class="w-full text-xs outline-none bg-transparent font-medium capitalize text-slate-800" />
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
        <!-- FILTER TIPE BARANG DINAMIS -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500 font-medium">Tipe:</span>
          <select v-model="selectedTipeFilter" class="p-2 border border-slate-200 rounded-lg text-slate-700 bg-white outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-xs">
            <option value="ALL">Semua Tipe</option>
            <option v-for="t in daftarTipeBarang" :key="t._id || t.kode" :value="t._id || t.kode">
              {{ t.nama }}
            </option>
          </select>
        </div>

        <!-- SORTING -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500 font-medium">Urutkan:</span>
          <select v-model="sortOrder" class="p-2 border border-slate-200 rounded-lg text-slate-700 bg-white outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-xs">
            <option value="asc">Nama (A - Z)</option>
            <option value="desc">Nama (Z - A)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TABEL KATALOG BARANG (CONTAINER SCROLLABLE) -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
      <div class="overflow-x-auto overflow-y-auto flex-1 relative">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase shadow-xs">
            <tr>
              <th class="p-3">Kode / Rak</th>
              <th class="p-3">Nama Barang & Tipe</th>
              <th class="p-3">Kategori</th>
              <th class="p-3">Batch & ED</th>
              <th class="p-3">Konversi Satuan</th>
              <th class="p-3">Stok Eceran</th>
              <th class="p-3">Harga Beli (Modal)</th>
              <th class="p-3">Harga Jual</th>
              <th class="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 text-sm bg-white">
            <tr v-for="item in paginatedObat" :key="item._id" class="hover:bg-slate-50/80 transition-colors">
              <!-- KODE / RAK -->
              <td class="p-3">
                <div class="font-mono text-xs text-slate-700 font-bold uppercase">{{ item.idObat }}</div>
                <div class="text-[11px] text-teal-600 font-medium mt-0.5">Rak: {{ item.lokasiRak || "-" }}</div>
              </td>

              <!-- NAMA BARANG & TAG TIPE BARANG (DISATUKAN AGAR LEGA) -->
              <td class="p-3">
                <div class="font-semibold text-slate-800 text-sm">{{ formatCapitalize(item.nama) }}</div>
                <div class="flex flex-wrap items-center gap-1.5 mt-1">
                  <!-- Tag Tipe Barang Dinamis -->
                  <span :class="['px-2 py-0.5 text-[10px] font-bold rounded-md border', item.tipeBarang?.butuhDetailMedis !== false ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200']">
                    {{ typeof item.tipeBarang === "object" ? item.tipeBarang?.nama : item.tipeBarang || "Tanpa Tipe" }}
                  </span>
                  <!-- Tag PBF -->
                  <span class="text-[11px] text-slate-400 font-normal capitalize">
                    {{ item.pabrik || "Tanpa PBF" }}
                  </span>
                </div>
              </td>

              <!-- KATEGORI -->
              <td class="p-3">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                  {{ item.kategori?.nama || "General" }}
                </span>
              </td>

              <!-- BATCH & ED (KONDISIONAL MEDIA NON-MEDIS) -->
              <td class="p-3 text-xs">
                <template v-if="item.tipeBarang?.butuhDetailMedis !== false">
                  <span class="font-mono font-bold text-slate-700 uppercase italic">{{ item.noBatch || "-" }}</span>
                  <div class="mt-0.5">
                    <span v-if="item.expiredDate" :class="isDekatExpired(item.expiredDate) ? 'text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200' : 'text-slate-600'">
                      ED: {{ formatTanggalSingkat(item.expiredDate) }}
                    </span>
                    <span v-else class="text-slate-400">-</span>
                  </div>
                </template>
                <template v-else>
                  <span class="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-500 italic">Non-Medis</span>
                </template>
              </td>

              <!-- KONVERSI SATUAN (Dinamis dengan perulangan) -->
              <td class="p-3 text-xs">
                <div class="space-y-1">
                  <!-- Satuan Dasar -->
                  <!-- Daftar Satuan Besar (Dinamis) -->
                  <div v-if="item.daftarKonversi && item.daftarKonversi.length > 0" class="space-y-0.5 mt-1 border-t pt-1 border-slate-100">
                    <div v-for="(konv, idx) in item.daftarKonversi" :key="idx" class="text-teal-700 font-bold">• 1 {{ konv.satuanBesar?.nama }} = {{ konv.nilaiKonversi }} {{ item.satuanTerkecil?.nama || "Pcs" }}</div>
                  </div>
                </div>

                <div class="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <span>📋 Opname: {{ item.terakhirOpname ? formatTanggalSingkat(item.terakhirOpname) : "Belum pernah" }}</span>
                </div>
              </td>

              <!-- STOK ECERAN TERKECIL -->
              <td class="p-3">
                <span class="font-extrabold text-sm" :class="item.stok <= item.minStok ? 'text-rose-600' : 'text-slate-800'"> {{ item.stok }} {{ item.satuanTerkecil?.nama || "Pcs" }} </span>
                <div v-if="item.stok <= item.minStok" class="text-[10px] text-rose-500 font-semibold">Min: {{ item.minStok }}</div>
              </td>

              <!-- HARGA BELI (MODAL) -->
              <td class="p-3">
                <!-- Modal Eceran -->
                <div class="font-bold text-slate-800 text-xs">
                  Rp {{ formatRupiah(item.hargaBeli) }} <span class="text-[11px] text-slate-500 font-normal">/ {{ item.satuanTerkecil?.nama || "Pcs" }}</span>
                </div>

                <!-- Daftar Modal Satuan Besar -->
                <!-- <div v-if="item.daftarKonversi && item.daftarKonversi.length > 0" class="mt-1 border-t pt-1 border-slate-100 space-y-0.5">
                  <div v-for="(konv, idx) in item.daftarKonversi" :key="idx" class="text-[10px] text-amber-700 font-semibold">Modal {{ konv.satuanBesar?.nama }}: Rp {{ formatRupiah(konv.hargaBeli || 0) }}</div>
                </div> -->
              </td>

              <!-- HARGA JUAL -->
              <td class="p-3">
                <div class="font-extrabold text-teal-700 text-sm">
                  Rp {{ formatRupiah(item.hargaJual) }} <span class="text-[11px] text-slate-500 font-normal">/ {{ item.satuanTerkecil?.nama || "Pcs" }}</span>
                </div>

                <!-- Daftar Harga Jual Satuan Besar -->
                <div v-if="item.daftarKonversi && item.daftarKonversi.length > 0" class="mt-1 border-t pt-1 border-slate-100 space-y-0.5">
                  <div v-for="(konv, idx) in item.daftarKonversi" :key="idx" class="text-[10px] text-teal-600 font-bold">Jual {{ konv.satuanBesar?.nama }}: Rp {{ formatRupiah(konv.hargaJual || 0) }}</div>
                </div>
              </td>

              <!-- AKSI -->
              <td class="p-3 text-center">
                <div class="flex justify-center items-center gap-2">
                  <MyTooltip text="Edit Data">
                    <button @click="$emit('editObat', item)" class="text-sky-600 hover:text-sky-800 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-sky-50 transition" title="Edit Data">
                      <Pencil class="w-4 h-4" />
                    </button>
                  </MyTooltip>
                  <span class="text-slate-300">|</span>
                  <MyTooltip text="Histori Harga">
                    <button @click="$emit('bukaModalHistoriHarga', item)" class="text-amber-600 hover:text-amber-800 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-amber-50 transition" title="Histori Harga">
                      <RotateCcwClock class="w-4 h-4" />
                    </button>
                  </MyTooltip>
                  <span class="text-slate-300">|</span>
                  <MyTooltip text="Hapus Data">
                    <button @click="hapusObat(item._id)" class="text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-rose-50 transition" title="Hapus Data">
                      <Trash class="w-4 h-4" />
                    </button>
                  </MyTooltip>
                </div>
              </td>
            </tr>

            <tr v-if="filteredObat.length === 0">
              <td colspan="9" class="p-8 text-center text-slate-400">Tidak ada data barang yang ditemukan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- FOOTER PAGINATION -->
      <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs flex-none">
        <div class="text-slate-500 font-medium">
          Menampilkan <span class="font-bold text-slate-800">{{ filteredObat.length > 0 ? (currentPageKatalog - 1) * itemsPerPageKatalog + 1 : 0 }}</span> sampai
          <span class="font-bold text-slate-800">{{ Math.min(currentPageKatalog * itemsPerPageKatalog, filteredObat.length) }}</span> dari <span class="font-bold text-slate-800">{{ filteredObat.length }}</span> barang
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="currentPageKatalog--"
            :disabled="currentPageKatalog === 1"
            class="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer transition"
          >
            Prev
          </button>

          <span class="font-bold text-slate-700 px-2"> Halaman {{ currentPageKatalog }} dari {{ totalPagesKatalog }} </span>

          <button
            @click="currentPageKatalog++"
            :disabled="currentPageKatalog >= totalPagesKatalog"
            class="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import * as XLSX from "xlsx";
import { Plus, Pencil, RotateCcwClock, Trash } from "@lucide/vue";
import MyTooltip from "@/components/MyTooltip.vue";
import { apiObat } from "@/services/api.js";
import { formatRupiah, formatTanggalSingkat, formatCapitalize, isDekatExpired } from "@/utils/formatters.js";

const props = defineProps({
  daftarObat: { type: Array, default: () => [] },
  daftarTipeBarang: { type: Array, default: () => [] },
});

const emit = defineEmits(["bukaModalBarangBaru", "bukaModalFaktur", "editObat", "bukaModalHistoriHarga", "refreshData"]);

const fileInputRef = ref(null);
const searchKey = ref("");
const selectedTipeFilter = ref("ALL");
const sortOrder = ref("asc");
const currentPageKatalog = ref(1);
const itemsPerPageKatalog = ref(10);

// COMPUTED FILTER & SORTING KATALOG
const filteredObat = computed(() => {
  const k = searchKey.value.toLowerCase();

  let hasil = props.daftarObat.filter((o) => {
    const cocokNama = (o.nama && o.nama.toLowerCase().includes(k)) || (o.idObat && o.idObat.toLowerCase().includes(k));

    // Check Filter Tipe Barang dengan casting String aman
    let cocokTipe = true;
    if (selectedTipeFilter.value !== "ALL") {
      const idTipeObat = o.tipeBarang?._id || o.tipeBarang?.kode || o.tipeBarang;
      cocokTipe = String(idTipeObat) === String(selectedTipeFilter.value);
    }

    return cocokNama && cocokTipe;
  });

  return hasil.sort((a, b) => {
    const namaA = (a.nama || "").toLowerCase();
    const namaB = (b.nama || "").toLowerCase();
    return sortOrder.value === "asc" ? namaA.localeCompare(namaB) : namaB.localeCompare(namaA);
  });
});

// PAGINATION COMPUTED
const paginatedObat = computed(() => {
  const start = (currentPageKatalog.value - 1) * itemsPerPageKatalog.value;
  return filteredObat.value.slice(start, start + itemsPerPageKatalog.value);
});

const totalPagesKatalog = computed(() => Math.ceil(filteredObat.value.length / itemsPerPageKatalog.value) || 1);

watch([searchKey, sortOrder, selectedTipeFilter], () => {
  currentPageKatalog.value = 1;
});

// EXCEL IMPORT & TEMPLATE DOWNLOAD
const downloadTemplateExcel = () => {
  const templateData = [
    {
      "KODE BARANG (SKU)": "OBT-001",
      "NAMA BARANG": "Allopurinol 100mg",
      KATEGORI: "Obat Keras",
      "SATUAN TERKECIL": "Tablet",
      "HPP MODAL ECERAN": 202,
      "HARGA JUAL ECERAN": 242,
      "SATUAN BESAR 1": "Strip",
      "NILAI KONVERSI 1": 10,
      "HARGA JUAL SATUAN BESAR 1": 4000,
      "STOK AWAL": 500,
      "MINIMUM STOK": 5,
      "EXPIRED DATE (YYYY-MM-DD)": "2029-06-18",
    },
  ];
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import");
  XLSX.writeFile(workbook, "Template_Import_Katalog_Barang.xlsx");
};

const handleImportExcel = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const excelJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (excelJson.length === 0) return alert("⚠️ File Excel yang diunggah kosong!");

      const formattedItems = excelJson.map((row) => {
        const daftarKonversi = [];

        // Cek jika ada data konversi satuan besar di baris Excel
        if (row["SATUAN BESAR 1"] && row["NILAI KONVERSI 1"]) {
          daftarKonversi.push({
            satuanBesar: String(row["SATUAN BESAR 1"]).trim(),
            nilaiKonversi: Number(row["NILAI KONVERSI 1"] || 1),
            hargaJual: Number(row["HARGA JUAL SATUAN BESAR 1"] || 0),
          });
        }

        return {
          idObat: row["KODE BARANG (SKU)"] ? formatCapitalize(row["KODE BARANG (SKU)"]).trim() : `OBT-${Date.now()}`,
          nama: row["NAMA BARANG"] ? formatCapitalize(row["NAMA BARANG"]).trim() : "",
          kategori: row["KATEGORI"] ? String(row["KATEGORI"]).trim() : "Obat Bebas",
          satuanTerkecil: row["SATUAN TERKECIL"] ? String(row["SATUAN TERKECIL"]).trim() : "Pcs",
          hargaBeli: Number(row["HPP MODAL ECERAN"] || 0),
          hargaJual: Number(row["HARGA JUAL ECERAN"] || 0),
          stok: Number(row["STOK AWAL"] || 0),
          minStok: Number(row["MINIMUM STOK"] || 5),
          expiredDate: row["EXPIRED DATE (YYYY-MM-DD)"] || null,
          daftarKonversi: daftarKonversi, // 🎯 Masukkan array konversi ke payload
        };
      });

      const dataValid = formattedItems.filter((item) => item.nama !== "");
      if (dataValid.length === 0) return alert("⚠️ Format header kolom Excel tidak sesuai!");

      const result = await apiObat.importExcel(dataValid);
      alert(`✅ ${result.message}`);
      emit("refreshData");
    } catch (err) {
      console.error("Error membaca Excel:", err);
      alert(`Gagal memproses file Excel: ${err.message}`);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsArrayBuffer(file);
};

const hapusObat = async (id) => {
  if (confirm("Hapus barang ini dari katalog?")) {
    await apiObat.delete(id);
    emit("refreshData");
  }
};
</script>
