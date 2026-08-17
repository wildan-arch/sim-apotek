<template>
  <div v-if="modalHistoriHargaAktif" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100">
      <div class="bg-amber-600 px-6 py-4 text-white flex justify-between items-center">
        <div>
          <h3 class="font-bold text-lg">Histori Perubahan Harga PBF</h3>
          <p class="text-xs text-amber-100 mt-0.5" v-if="obatAktifHistori">{{ obatAktifHistori.nama }} (SKU: {{ obatAktifHistori.idObat }})</p>
        </div>
        <button @click="$emit('update:modalHistoriHargaAktif', false)" class="text-amber-200 hover:text-white font-bold text-xl cursor-pointer">✕</button>
      </div>

      <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <div v-if="loadingHistori" class="text-center py-8 text-slate-400 text-sm">Memuat data histori harga...</div>

        <div v-else-if="!historiHargaList || historiHargaList.length === 0" class="text-center py-8 text-slate-400 text-sm">Belum ada catatan histori perubahan harga dari PBF untuk obat ini.</div>

        <div v-else class="overflow-x-auto overflow-y-auto max-h-64 : border border-slate-200 rounded-xl">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase shadow-sm">
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                <th class="p-3">Tanggal / Faktur</th>
                <th class="p-3">PBF Distributor</th>
                <th class="p-3">Harga Beli / HPP</th>
                <th class="p-3">Harga Jual</th>
                <th class="p-3 text-center">Selisih HPP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="log in historiHargaList" :key="log._id" class="hover:bg-slate-50">
                <td class="p-3">
                  <div class="font-bold text-slate-800">{{ formatTanggal(log.tanggal || log.createdAt) }}</div>
                  <div class="font-mono text-slate-400 text-[10px]">No: {{ log.noFaktur || "-" }}</div>
                </td>
                <td class="p-3 font-semibold text-slate-700">
                  {{ log.pbf || "-" }}
                </td>
                <td class="p-3">
                  <div class="font-bold text-slate-800">Rp {{ formatRupiah(log.hargaBeliBaru) }}</div>
                  <div class="text-[10px] text-slate-400 line-through">Lama: Rp {{ formatRupiah(log.hargaBeliLama) }}</div>
                </td>
                <td class="p-3">
                  <div class="font-bold text-teal-700">Rp {{ formatRupiah(log.hargaJualBaru) }}</div>
                  <div class="text-[10px] text-slate-400 line-through">Lama: Rp {{ formatRupiah(log.hargaJualLama) }}</div>
                </td>
                <td class="p-3 text-center">
                  <span :class="['px-2 py-1 rounded-full font-bold text-[10px]', log.hargaBeliBaru > log.hargaBeliLama ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700']">
                    {{ log.hargaBeliBaru > log.hargaBeliLama ? "▲ Naik" : "▼ Turun" }}
                    Rp {{ formatRupiah(Math.abs(log.hargaBeliBaru - log.hargaBeliLama)) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button @click="$emit('update:modalHistoriHargaAktif', false)" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { apiPembelian } from "@/services/api.js";
import { formatRupiah, formatTanggal } from "@/utils/formatters.js";

// 1. Props HANYA menerima kontrol modal & data obat aktif
const props = defineProps({
  modalHistoriHargaAktif: Boolean,
  obatAktifHistori: Object,
});

defineEmits(["update:modalHistoriHargaAktif"]);

// 2. Deklarasikan state internal di dalam komponen ini sendiri
const historiHargaList = ref([]);
const loadingHistori = ref(false);

// 3. Otomatis ambil data dari backend saat obatAktifHistori berubah
watch(
  () => props.obatAktifHistori,
  async (newObat) => {
    if (newObat && (newObat._id || newObat.id)) {
      loadingHistori.value = true;
      try {
        const idObat = newObat._id || newObat.id;
        const res = await apiPembelian.getLogHarga(idObat);
        // Pastikan hasilnya selalu berupa Array
        historiHargaList.value = Array.isArray(res) ? res : res?.data || [];
      } catch (err) {
        console.error("Gagal mengambil histori harga:", err);
        historiHargaList.value = [];
      } finally {
        loadingHistori.value = false;
      }
    } else {
      historiHargaList.value = [];
    }
  },
  { immediate: true },
);
</script>
