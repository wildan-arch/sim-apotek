<template>
  <section class="print:hidden h-full w-full flex flex-col p-4 sm:p-6 overflow-hidden bg-slate-50 gap-3">
    <!-- HEADER DEFECTA & UTILITY -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 flex-none">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Defecta & Rencana Pemesanan (PBF)</h1>
        <p class="text-xs text-slate-500 mt-1">Kelola rencana kulakan, checklist barang siap order, dan simpan status hold.</p>
      </div>

      <!-- TOOLBAR AKSES CEPAT -->
      <div class="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari nama barang / PBF..."
          class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white w-40 sm:w-48 transition"
        />

        <!-- 🎯 FILTER AMBANG LIMIT STOK DINAMIS -->
        <select v-model="filterLimitStok" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer">
          <option value="kritis">⚠️ Stok Kritis (&le; Limit Min)</option>
          <option value="kosong">🚨 Stok Kosong (0 Pcs)</option>
          <option value="waspada">🟡 Waspada (&le; Min + 50%)</option>
          <option value="semua_katalog">📦 Semua Barang Katalog</option>
        </select>

        <select v-model="filterTipe" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer">
          <option value="semua">Semua Tipe</option>
          <option value="medis">Obat & Medis</option>
          <option value="general">Minimarket / General</option>
        </select>

        <select v-model="filterPBF" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer">
          <option value="semua">Semua PBF</option>
          <option v-for="pbf in daftarPBF" :key="pbf" :value="pbf">{{ pbf }}</option>
        </select>

        <select v-model="filterStatus" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer font-bold">
          <option value="semua">Semua Status</option>
          <option value="checked">Docentang (Siap Order)</option>
          <option value="hold">Di-Hold (Tunda)</option>
        </select>

        <button @click="loadDataDefecta" type="button" class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer transition shadow-xs active:scale-95 flex items-center gap-1">🔄 Refresh</button>

        <button @click="exportExcelDefecta" type="button" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs active:scale-95">
          📊 Export Checklist
        </button>
      </div>
    </div>

    <!-- CARDS RINGKASAN DEFECTA -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-none">
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Total Item Tampil</div>
        <div class="text-lg font-extrabold text-rose-600 mt-0.5">{{ filteredDefectaList.length }} Item</div>
        <div class="text-[10px] text-slate-500 mt-1">Sesuai filter ambang stok</div>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Item Dicentang / Hold</div>
        <div class="text-sm font-bold text-teal-800 mt-1">
          Dicentang: <span class="font-extrabold text-teal-600">{{ rekapDefecta.totalChecked }} Item</span>
        </div>
        <div class="text-xs font-bold text-amber-800 mt-0.5">
          Hold: <span class="font-extrabold text-amber-600">{{ rekapDefecta.totalHold }} Item</span>
        </div>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Defecta Per Tipe</div>
        <div class="text-xs font-bold text-teal-800 mt-1">
          Medis: <span class="font-extrabold text-teal-600">{{ rekapDefecta.totalMedis }} Item</span>
        </div>
        <div class="text-xs font-bold text-indigo-800 mt-0.5">
          General: <span class="font-extrabold text-indigo-600">{{ rekapDefecta.totalGeneral }} Item</span>
        </div>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-400">Est. Modal Item Dicentang</div>
        <div class="text-lg font-extrabold text-teal-700 mt-0.5">Rp {{ formatRupiah(rekapDefecta.estimasiModalChecked) }}</div>
        <div class="text-[10px] text-slate-500 mt-1">Modal barang yang fix dipesan</div>
      </div>
    </div>

    <!-- TABLE CONTAINER -->
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
      <div class="flex justify-between items-center mb-3 flex-none">
        <div class="flex items-center gap-3">
          <h3 class="font-bold text-md text-slate-800">Daftar Rencana Pemesanan (Defecta List)</h3>
          <button @click="toggleSelectAll" class="text-xs text-teal-600 font-bold hover:underline cursor-pointer">
            {{ isAllSelected ? "Batal Centang Semua" : "Centang Semua" }}
          </button>
        </div>
        <span class="text-xs text-slate-500 font-bold">Menampilkan: {{ filteredDefectaList.length }} Barang</span>
      </div>

      <!-- TABEL DEFECTA -->
      <!-- TABEL DEFECTA -->
      <div class="overflow-x-auto overflow-y-auto flex-1 relative border border-slate-100 rounded-lg">
        <table class="w-full text-left border-collapse text-sm">
          <!-- 🎯 HEADER TABEL: UPPERCASE (HURUF BESAR SEMUA) -->
          <thead class="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider shadow-xs">
            <tr>
              <th class="p-3 text-center w-10">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded accent-teal-600 cursor-pointer" />
              </th>
              <th class="p-3">Nama Barang</th>
              <th class="p-3 text-center">Tipe</th>
              <th class="p-3 text-center">Stok Sisa</th>
              <th class="p-3 text-center">Stok Min</th>
              <th class="p-3 text-center w-56">Rencana Order & Satuan</th>
              <th class="p-3 text-right">Harga Beli @</th>
              <th class="p-3 text-right">Est. Subtotal</th>
              <th class="p-3 text-center">PBF Distributor</th>
              <th class="p-3 text-center">Status</th>
            </tr>
          </thead>

          <!-- 🎯 ISI TABEL: CAPITALIZE (HURUF KAPITAL DI SETIAP AWAL KATA) -->
          <tbody class="divide-y divide-slate-100 text-sm bg-white capitalize">
            <tr v-for="(item, index) in filteredDefectaList" :key="item._id" :class="['transition', item.isHold ? 'bg-amber-50/50 opacity-75' : item.isChecked ? 'bg-teal-50/30' : 'hover:bg-slate-50']">
              <td class="p-3 text-center">
                <input type="checkbox" v-model="item.isChecked" :disabled="item.isHold" class="rounded accent-teal-600 cursor-pointer" />
              </td>

              <!-- NAMA BARANG AUTOMATIC CAPITALIZE -->
              <td class="p-3 font-semibold text-slate-800 capitalize">
                {{ item.nama }}
                <!-- SKU TETAP UPPERCASE/NORMAL -->
                <div class="text-[10px] text-slate-400 font-normal uppercase">SKU: {{ item.idObat || "-" }}</div>
              </td>

              <td class="p-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 text-[10px] font-bold rounded-full border capitalize',
                    getTipeNama(item).toLowerCase().includes('general') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200',
                  ]"
                >
                  {{ getTipeNama(item) }}
                </span>
              </td>

              <td class="p-3 text-center font-bold capitalize" :class="item.stok === 0 ? 'text-rose-600 font-black' : 'text-amber-600'">{{ item.stok }} {{ getSatuanKecilNama(item) }}</td>
              <td class="p-3 text-center text-slate-500 font-medium capitalize">{{ item.stokMinimum || 5 }} {{ getSatuanKecilNama(item) }}</td>

              <td class="p-3 text-center">
                <div class="flex items-center justify-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500 transition">
                  <input type="number" v-model.number="item.qtyOrder" min="1" @keydown="handleKeydown($event, index)" class="w-16 px-1.5 py-1 text-center font-extrabold text-teal-800 text-xs bg-transparent outline-none" />
                  <input
                    type="text"
                    v-model="item.satuanSelected"
                    :list="'list-satuan-' + item._id"
                    class="w-20 px-2 py-1 bg-teal-100 text-teal-900 font-bold text-[11px] rounded-md border border-teal-200 outline-none text-center capitalize"
                  />
                  <datalist :id="'list-satuan-' + item._id">
                    <option v-if="getSatuanBesarNama(item)" :value="getSatuanBesarNama(item)"></option>
                    <option :value="getSatuanKecilNama(item)"></option>
                    <option value="Box"></option>
                    <option value="Botol"></option>
                    <option value="Strip"></option>
                    <option value="Pcs"></option>
                  </datalist>
                </div>
              </td>

              <td class="p-3 text-right text-slate-600">
                Rp {{ formatRupiah(getHargaBeliPerSatuan(item)) }}
                <div class="text-[9px] text-slate-400 capitalize">/ {{ item.satuanSelected }}</div>
              </td>

              <td class="p-3 text-right font-extrabold text-slate-900">Rp {{ formatRupiah(hitungSubtotalItem(item)) }}</td>

              <td class="p-3 text-center">
                <input
                  type="text"
                  v-model="item.selectedPbf"
                  :list="'list-pbf-' + item._id"
                  @keydown="handleKeydown($event, index)"
                  placeholder="PBF"
                  class="w-32 px-2 py-1 bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 outline-none text-center focus:bg-white transition capitalize"
                />
                <datalist :id="'list-pbf-' + item._id">
                  <option v-for="pbfGlobal in daftarPBF" :key="pbfGlobal" :value="pbfGlobal"></option>
                </datalist>
              </td>

              <td class="p-3 text-center">
                <button
                  @click="toggleHoldItem(item)"
                  type="button"
                  :class="['px-2.5 py-1 text-[11px] font-bold rounded-xl transition cursor-pointer', item.isHold ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  {{ item.isHold ? "⏸️ Hold" : "▶️ Ready" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import * as XLSX from "xlsx";
import { apiObat } from "@/services/api.js";
import { formatRupiah } from "@/utils/formatters.js";

const defectaList = ref([]);
const isLoading = ref(false);
const searchQuery = ref("");
const filterLimitStok = ref("kritis"); // 🎯 Default filter limit stok
const filterTipe = ref("semua");
const filterPBF = ref("semua");
const filterStatus = ref("semua");

// Setiap kali ada perubahan pada defectaList, simpan ke localStorage secara otomatis
watch(
  defectaList,
  (newList) => {
    localStorage.setItem("cache_defecta_list", JSON.stringify(newList));
  },
  { deep: true },
);

const getTipeNama = (item) => {
  const tipe = item.tipeBarang;
  if (typeof tipe === "object" && tipe !== null) return tipe.nama || "Obat & Medis";
  if (typeof tipe === "string" && tipe) return tipe;
  return "Obat & Medis";
};

const getSatuanKecilNama = (item) => {
  const satuan = item.satuanTerkecil || item.satuan;
  if (typeof satuan === "object" && satuan !== null) return satuan.nama || "Pcs";
  if (typeof satuan === "string" && satuan) return satuan;
  return "Pcs";
};

const getSatuanBesarNama = (item) => {
  const satuan = item.satuanBesar;
  if (typeof satuan === "object" && satuan !== null) return satuan.nama || "";
  if (typeof satuan === "string" && satuan) return satuan;
  return item.satuanBesarNama || "";
};

const getHargaBeliPerSatuan = (item) => {
  const isSatuanBesar = item.satuanSelected === getSatuanBesarNama(item) && getSatuanBesarNama(item) !== "";
  if (isSatuanBesar) {
    const konversi = Number(item.nilaiKonversi || 1);
    return Number(item.hargaBeliSatuanBesar || (item.hargaBeli || 0) * konversi);
  }
  return Number(item.hargaBeli || 0);
};

const hitungSubtotalItem = (item) => {
  return Number(item.qtyOrder || 0) * getHargaBeliPerSatuan(item);
};

const toggleHoldItem = (item) => {
  item.isHold = !item.isHold;
  if (item.isHold) item.isChecked = false;
};

const toggleSelectAll = () => {
  const nextState = !isAllSelected.value;
  filteredDefectaList.value.forEach((item) => {
    if (!item.isHold) item.isChecked = nextState;
  });
};

const isAllSelected = computed(() => {
  const available = filteredDefectaList.value.filter((i) => !i.isHold);
  return available.length > 0 && available.every((i) => i.isChecked);
});

// 🎯 1. LOAD DATA DENGAN PRIORITAS CACHE LOCALSTORAGE (ANTI HILANG SAAT REFRESH)
const loadDataDefecta = async () => {
  isLoading.value = true;
  try {
    const cachedData = localStorage.getItem("cache_defecta_list");
    if (cachedData) {
      defectaList.value = JSON.parse(cachedData);
      isLoading.value = false;
      return;
    }

    const data = await apiObat.getAll();
    const rawList = data || [];

    defectaList.value = rawList.map((item) => {
      const satBesar = getSatuanBesarNama(item);
      const satKecil = getSatuanKecilNama(item);

      return {
        ...item,
        qtyOrder: 1,
        satuanSelected: satBesar || satKecil,
        selectedPbf: item.pabrik || item.pbf || "PBF Umum",
        isChecked: true,
        isHold: false,
      };
    });
  } catch (err) {
    console.error("Gagal memuat data defecta:", err);
  } finally {
    isLoading.value = false;
  }
};

// 🎯 2. REFRESH MURNI (MENGHAPUS CACHE & TARIK DATA TERBARU DARI API)
const refreshDataMurni = async () => {
  localStorage.removeItem("cache_defecta_list");
  await loadDataDefecta();
};

const daftarPBF = computed(() => {
  const pbfSet = new Set();
  defectaList.value.forEach((item) => {
    const nama = item.selectedPbf || item.pabrik || item.pbf;
    if (nama && nama.trim() !== "") pbfSet.add(nama.trim());
  });
  return Array.from(pbfSet);
});

// 🎯 LOGIKA FILTER STOK DINAMIS (KRITIS, KOSONG, WASPADA, SEMUA KATALOG)
const filteredDefectaList = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  return defectaList.value.filter((item) => {
    const stok = Number(item.stok || 0);
    const minStok = Number(item.stokMinimum || 5);

    // 1. FILTER AMBANG LIMIT STOK DINAMIS
    let matchLimitStok = true;
    if (filterLimitStok.value === "kritis") {
      matchLimitStok = stok <= minStok;
    } else if (filterLimitStok.value === "kosong") {
      matchLimitStok = stok === 0;
    } else if (filterLimitStok.value === "waspada") {
      matchLimitStok = stok <= minStok * 1.5;
    } else if (filterLimitStok.value === "semua_katalog") {
      matchLimitStok = true;
    }

    // 2. FILTER SEARCHING
    const namaPBF = item.selectedPbf || item.pabrik || item.pbf || "PBF Umum";
    const namaBarang = (item.nama || "").toLowerCase();
    const sku = (item.idObat || "").toLowerCase();

    const matchSearch = !query || namaBarang.includes(query) || sku.includes(query) || namaPBF.toLowerCase().includes(query);

    // 3. FILTER TIPE BARANG
    const tipeNama = getTipeNama(item).toLowerCase();
    let matchTipe = true;
    if (filterTipe.value === "general") {
      matchTipe = tipeNama.includes("general") || tipeNama.includes("minimarket");
    } else if (filterTipe.value === "medis") {
      matchTipe = !tipeNama.includes("general") && !tipeNama.includes("minimarket");
    }

    // 4. FILTER PBF
    let matchPBF = true;
    if (filterPBF.value !== "semua") {
      matchPBF = namaPBF.toLowerCase() === filterPBF.value.toLowerCase();
    }

    // 5. FILTER STATUS
    let matchStatus = true;
    if (filterStatus.value === "checked") matchStatus = item.isChecked && !item.isHold;
    if (filterStatus.value === "hold") matchStatus = item.isHold;

    return matchLimitStok && matchSearch && matchTipe && matchPBF && matchStatus;
  });
});

const rekapDefecta = computed(() => {
  let totalChecked = 0;
  let totalHold = 0;
  let totalMedis = 0;
  let totalGeneral = 0;
  let estimasiModalChecked = 0;

  filteredDefectaList.value.forEach((item) => {
    if (item.isHold) totalHold++;
    if (item.isChecked && !item.isHold) {
      totalChecked++;
      estimasiModalChecked += hitungSubtotalItem(item);
    }

    const tipeNama = getTipeNama(item).toLowerCase();
    if (tipeNama.includes("general") || tipeNama.includes("minimarket")) {
      totalGeneral++;
    } else {
      totalMedis++;
    }
  });

  return { totalChecked, totalHold, totalMedis, totalGeneral, estimasiModalChecked };
});

const exportExcelDefecta = () => {
  const dataExport = filteredDefectaList.value.filter((i) => i.isChecked && !i.isHold);

  if (dataExport.length === 0) return alert("Tidak ada barang yang dicentang untuk di-export!");

  const data = dataExport.map((item) => ({
    "Nama Barang": item.nama,
    Tipe: getTipeNama(item),
    "Sisa Stok": `${item.stok} ${getSatuanKecilNama(item)}`,
    "Stok Min": `${item.stokMinimum || 5} ${getSatuanKecilNama(item)}`,
    "Rencana Order": item.qtyOrder || 0,
    "Satuan Order": item.satuanSelected,
    "Harga Beli / Satuan (Rp)": getHargaBeliPerSatuan(item),
    "Est. Subtotal (Rp)": hitungSubtotalItem(item),
    Distributor: item.selectedPbf || "PBF Umum",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SP_Checklist");
  XLSX.writeFile(wb, `Checklist_SP_Defecta_${new Date().toISOString().split("T")[0]}.xlsx`);
};

// Fungsi navigasi antar inputan menggunakan Enter / Panah
const handleKeydown = (event, index, fieldType) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Mencegah form submit default

    // Contoh sederhana: Jika tekan Enter di Qty, pindah ke input Satuan di baris yang sama,
    // atau ke Qty baris berikutnya.
    const rows = document.querySelectorAll("tbody tr");
    const nextRow = rows[index + 1];

    if (nextRow) {
      // Cari input pertama di baris berikutnya dan fokuskan
      const nextInput = nextRow.querySelectorAll("input[type='number'], input[type='text']")[0];
      if (nextInput) nextInput.focus();
    }
  }
};

onMounted(() => {
  loadDataDefecta();
});
</script>
