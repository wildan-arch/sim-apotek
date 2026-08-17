<template>
  <section class="print:hidden space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Hutang Usaha ke PBF</h1>
        <p class="text-xs text-slate-500 mt-1">Daftar faktur pembelian dengan metode Tempo, jatuh tempo, dan status pelunasan.</p>
      </div>
      <button @click="loadLaporanHutang" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow cursor-pointer flex items-center gap-2"><RefreshCw class="w-4 h-4" /> Refresh</button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-xs font-semibold text-slate-400">Total Hutang Belum Lunas</div>
        <div class="text-2xl font-extrabold text-rose-600 mt-1">Rp {{ formatRupiah(rekapHutang?.totalHutangBelumLunas) }}</div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-xs font-semibold text-slate-400">Jumlah Faktur Belum Lunas</div>
        <div class="text-2xl font-extrabold text-amber-600 mt-1">{{ rekapHutang?.totalFakturBelumLunas || 0 }} Faktur</div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 class="font-bold text-md text-slate-800 mb-4">Daftar Faktur Pembelian (Metode Tempo)</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
              <th class="p-3">No. Faktur</th>
              <th class="p-3">Tanggal Faktur</th>
              <th class="p-3">Jatuh Tempo</th>
              <th class="p-3">Total Hutang</th>
              <th class="p-3">Status</th>
              <th class="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="h in historiHutang" :key="h._id" class="hover:bg-slate-50">
              <td class="p-3 font-mono font-bold text-xs text-slate-700">{{ h.noFaktur || "-" }}</td>
              <td class="p-3 text-xs text-slate-500">{{ formatTanggalSingkat(h.tglFaktur || h.tanggalFaktur) }}</td>
              <td class="p-3 text-xs text-slate-500">
                {{ formatTanggalSingkat(h.tglJatuhTempo) }}
                <span v-if="new Date(h.tglJatuhTempo) < new Date() && h.statusBayar !== 'Lunas'" class="ml-2 text-rose-500 font-bold text-[10px]">(Lewat)</span>
              </td>
              <td class="p-3 font-bold text-slate-800">Rp {{ formatRupiah(h.totalBayar || h.totalHutang) }}</td>
              <td class="p-3">
                <span :class="['px-2.5 py-1 text-xs font-semibold rounded-full', (h.statusBayar || h.status) === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700']">
                  {{ h.statusBayar || h.status || "Belum Lunas" }}
                </span>
              </td>
              <td class="p-3 text-center">
                <button v-if="(h.statusBayar || h.status) !== 'Lunas'" @click="lunasiHutang(h._id)" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow cursor-pointer">Tandai Lunas</button>
                <span v-else class="text-slate-400 text-xs">Lunas</span>
              </td>
            </tr>
            <tr v-if="historiHutang.length === 0">
              <td colspan="6" class="p-6 text-center text-slate-400">Belum ada faktur dengan metode Tempo.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RefreshCw } from "@lucide/vue";
import { apiPembelian } from "@/services/api.js";
import { formatRupiah, formatTanggalSingkat } from "@/utils/formatters.js";

const rekapHutang = ref({
  totalHutangBelumLunas: 0,
  totalFakturBelumLunas: 0,
});
const historiHutang = ref([]);

const loadLaporanHutang = async () => {
  try {
    const data = await apiPembelian.getHutang();
    rekapHutang.value = data.ringkasan || { totalHutangBelumLunas: 0, totalFakturBelumLunas: 0 };
    historiHutang.value = data.dataHutang || [];
  } catch (err) {
    console.error("Gagal memuat laporan hutang:", err);
  }
};

const lunasiHutang = async (id) => {
  if (confirm("Tandai faktur ini sebagai LUNAS?")) {
    try {
      await apiPembelian.lunasiHutang(id);
      alert("Faktur berhasil dilunasi!");
      loadLaporanHutang();
    } catch (err) {
      console.error("Gagal memperbarui status lunas:", err);
    }
  }
};

onMounted(() => {
  loadLaporanHutang();
});
</script>
