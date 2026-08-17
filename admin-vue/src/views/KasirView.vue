<template>
  <section class="print:hidden">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Point of Sale (Kasir Apotek)</h1>
        <p class="text-xs text-slate-500 mt-1">Transaksi penjualan eceran, kalkulasi pembayaran, dan cetak struk.</p>
      </div>

      <!-- ⏳ MODAL / BUTTON LIHAT PENDING TRANSAKSI -->
      <div v-if="daftarPending.length > 0" class="flex items-center gap-2">
        <button @click="showModalPendingList = true" class="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer animate-pulse">
          <span>⏳</span>
          <span>Pending List ({{ daftarPending.length }})</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- KOLOM KIRI: KATALOG PILIHAN OBAT -->
      <div class="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex gap-2 mb-4">
            <input
              v-model="searchKasir"
              @keyup.enter="scanBarcodeLangsung"
              placeholder="Ketik SKU / Scan Barcode / Nama Obat..."
              class="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-sm capitalize"
              ref="inputKasirRef"
            />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-130 overflow-y-auto pr-1">
            <!-- KOLOM KIRI: KATALOG PILIHAN OBAT -->
            <div
              v-for="o in filteredKasir"
              :key="o._id || o.id"
              @click="tambahKeKeranjang(o)"
              :class="[
                'p-3.5 border rounded-xl cursor-pointer transition flex flex-col justify-between select-none',
                o.stok > 0 ? 'hover:border-teal-500 hover:shadow-md bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed',
              ]"
            >
              <div>
                <div class="flex justify-between items-start gap-1 mb-1">
                  <span class="font-bold text-slate-800 text-sm line-clamp-2 capitalize">{{ o.nama }}</span>
                </div>

                <!-- 🎯 REVISI 1: TAMBAHKAN BADGE TIPE BARANG DI KASIR -->
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span :class="['px-1.5 py-0.5 text-[9px] font-bold rounded border', o.tipeBarang?.butuhDetailMedis !== false ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200']">
                    {{ typeof o.tipeBarang === "object" ? o.tipeBarang?.nama : o.tipeBarang || "Tanpa Tipe" }}
                  </span>
                  <span class="text-[11px] text-slate-400">SKU: {{ o.idObat }}</span>
                </div>

                <div class="text-xs text-teal-700 font-extrabold mt-1">
                  Rp {{ formatRupiah(o.hargaJual) }}
                  <span class="text-[10px] text-slate-400 font-normal">/ {{ o.satuanTerkecil?.nama || "Pcs" }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[11px]">
                <span :class="o.stok <= o.minStok ? 'text-rose-600 font-bold' : 'text-slate-500'">Stok: {{ o.stok }} {{ o.satuanTerkecil?.nama || "Pcs" }}</span>
                <span v-if="o.stok > 0" class="text-teal-600 font-bold hover:underline">+ Tambah</span>
                <span v-else class="text-rose-500 font-semibold">Habis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN: KERANJANG BELANJA & PEMBAYARAN -->
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center border-b pb-3 mb-3">
            <h3 class="font-bold text-md text-slate-800 flex items-center gap-2"><ShoppingCart class="w-4 h-4 text-teal-600" /> Keranjang Belanja</h3>
            <button v-if="keranjang.length > 0" @click="kosongkanKeranjang" class="text-xs text-rose-600 hover:underline font-semibold cursor-pointer">Kosongkan</button>
          </div>

          <!-- 🎯 FITUR 1: INPUT TANGGAL TRANSAKSI -->
          <div class="mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label class="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1"> <span>📅</span> Tanggal Transaksi </label>
            <input type="datetime-local" v-model="tglTransaksiKasir" class="w-full text-xs p-1.5 border border-slate-300 rounded-md bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div v-if="keranjang.length === 0" class="text-slate-400 text-xs text-center py-12 flex flex-col items-center gap-2">
            <ShoppingCart class="w-10 h-10 text-slate-200" />
            <span>Belum ada obat/barang dipilih</span>
          </div>

          <div v-else class="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            <div v-for="(item, idx) in keranjang" :key="idx" class="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center text-xs">
              <div class="flex-1 pr-2">
                <div class="font-bold text-slate-800">{{ item.nama }}</div>
                <div class="mt-0.5">
                  <div class="text-teal-700 font-semibold flex items-center gap-0.5">
                    <span>Rp</span>
                    <span
                      contenteditable="true"
                      :class="[
                        'px-1 border rounded outline-none cursor-pointer transition-all',
                        item.hargaJual < (item.hargaBeli || item.hpp || 0) ? 'bg-red-100 text-red-600 border-red-400 font-bold' : 'hover:bg-teal-50 focus:bg-white border-transparent hover:border-slate-200 focus:border-teal-500',
                      ]"
                      @blur="item.hargaJual = Number($event.target.innerText.replace(/[^0-9]/g, '')) || 0"
                      @keydown.enter.prevent="$event.target.blur()"
                      title="Klik untuk mengubah harga"
                    >
                      {{ formatRupiah(item.hargaJual) }}
                    </span>
                  </div>

                  <span v-if="item.hargaJual < (item.hargaBeli || item.hpp || 0)" class="text-[10px] text-red-500 font-bold block mt-0.5 animate-pulse"> ⚠️ Di bawah modal (Rp {{ formatRupiah(item.hargaBeli || item.hpp || 0) }}) </span>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <button @click="kurangiQty(idx)" class="w-6 h-6 bg-slate-200 hover:bg-slate-300 font-bold rounded flex items-center justify-center cursor-pointer">-</button>
                <span class="w-6 text-center font-bold text-slate-800 text-xs">{{ item.qty }}</span>
                <button @click="tambahQty(idx)" class="w-6 h-6 bg-slate-200 hover:bg-slate-300 font-bold rounded flex items-center justify-center cursor-pointer">+</button>
                <button @click="hapusKeranjang(idx)" class="ml-1 text-rose-500 hover:text-rose-700 font-bold cursor-pointer">✕</button>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 pt-3 mt-4 space-y-3">
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span class="font-semibold text-slate-800">Rp {{ formatRupiah(subtotalKasir) }}</span>
            </div>

            <div class="flex justify-between items-center text-slate-600">
              <span>Diskon (Rp)</span>
              <input type="number" v-model.number="diskonKasir" min="0" class="w-24 p-1 border rounded text-right font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-teal-500" />
            </div>

            <div class="flex justify-between text-sm font-bold text-teal-800 border-t pt-2">
              <span>Total Akhir</span>
              <span class="text-lg">Rp {{ formatRupiah(grandTotalKasir) }}</span>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-500 mb-1">Metode Pembayaran</label>
            <div class="grid grid-cols-3 gap-1.5 text-xs">
              <button
                v-for="m in ['Tunai', 'QRIS', 'Transfer']"
                :key="m"
                type="button"
                @click="metodeBayarKasir = m"
                :class="['py-1.5 font-bold rounded-lg border transition cursor-pointer', metodeBayarKasir === m ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50']"
              >
                {{ m }}
              </button>
            </div>
          </div>

          <div v-if="metodeBayarKasir === 'Tunai'" class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Uang Diterima</label>
              <input type="number" v-model.number="uangDiterima" min="0" class="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Kembalian</label>
              <div :class="['p-2 rounded-lg font-extrabold text-sm border', kembalianKasir < 0 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-teal-50 border-teal-200 text-teal-800']">
                Rp {{ formatRupiah(kembalianKasir < 0 ? 0 : kembalianKasir) }}
              </div>
            </div>
          </div>

          <!-- 🎯 TOMBOL AKSI: PENDING VS BAYAR -->
          <div class="grid grid-cols-3 gap-2">
            <!-- ⏳ FITUR 2: TOMBOL PENDING -->
            <button
              type="button"
              @click="pendingTransaksi"
              :disabled="keranjang.length === 0"
              class="col-span-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition shadow-md cursor-pointer text-xs flex items-center justify-center gap-1"
            >
              ⏳ Pending
            </button>

            <!-- TOMBOL BAYAR SEKARANG -->
            <button
              type="button"
              @click="prosesSelesaiTransaksi"
              :disabled="keranjang.length === 0 || (metodeBayarKasir === 'Tunai' && uangDiterima < grandTotalKasir)"
              class="col-span-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-extrabold py-3 rounded-lg transition shadow-md cursor-pointer flex justify-center items-center gap-2 text-xs"
            >
              💳 Bayar & Cetak
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- MODAL DAFTAR TRANSAKSI PENDING (RECALL) -->
  <Teleport to="body">
    <div v-if="showModalPendingList" class="fixed inset-0 z-99999 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div class="bg-amber-500 text-white px-4 py-3 flex justify-between items-center">
          <h3 class="font-bold text-sm flex items-center gap-2">⏳ Daftar Transaksi Pending</h3>
          <button @click="showModalPendingList = false" class="text-white hover:text-slate-200 font-bold text-lg cursor-pointer">&times;</button>
        </div>

        <div class="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50">
          <div v-if="daftarPending.length === 0" class="text-center text-xs text-slate-400 py-8">Tidak ada transaksi pending saat ini.</div>
          <div v-for="(pending, idx) in daftarPending" :key="pending.id" class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div class="font-bold text-xs text-slate-800">Draf Transaksi #{{ idx + 1 }}</div>
              <div class="text-[10px] text-slate-400">Waktu: {{ pending.waktu }} | Total Item: {{ pending.items.length }}</div>
              <div class="text-xs font-bold text-teal-700 mt-0.5">Rp {{ formatRupiah(pending.total) }}</div>
            </div>

            <div class="flex items-center gap-2">
              <button @click="lanjutkanPending(idx)" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition cursor-pointer">Panggil</button>
              <button @click="mintaKonfirmasiHapus(idx)" class="px-2 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- MODAL PREVIEW STRUK STYLE DESKTOP APP -->
  <Teleport to="body">
    <div v-if="showPreviewStruk" class="fixed inset-0 z-99999 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <h3 class="font-bold text-sm">Preview Struk Penjualan</h3>
          </div>
          <button @click="showPreviewStruk = false" class="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">&times;</button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 flex justify-center bg-slate-300">
          <div id="area-struk" class="bg-white p-4 shadow-md text-black font-mono text-[10px] w-[58mm] min-h-[80mm] border border-slate-200">
            <div class="text-center pb-2 border-b border-dashed border-black">
              <h2 class="font-bold text-xs uppercase tracking-wider">APOTEK SHABAH</h2>
              <p class="text-[9px]">Jl. Raya Apotek No. 123, Malang</p>
              <p class="text-[9px]">Telp/WA: 0812-3456-7890</p>
            </div>

            <div class="py-1.5 text-[9px] border-b border-dashed border-black space-y-0.5">
              <div class="flex justify-between">
                <span>No: {{ transaksiTerakhir?.id }}</span>
              </div>
              <div class="flex justify-between">
                <span>Tgl: {{ new Date().toLocaleDateString("id-ID") }}</span>
                <span>Jam: {{ new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Kasir: Admin</span>
                <span>Bayar: {{ transaksiTerakhir?.metodeBayar }}</span>
              </div>
            </div>

            <div class="py-1.5 border-b border-dashed border-black">
              <div v-for="(item, idx) in transaksiTerakhir?.items" :key="idx" class="mb-1 text-[9px]">
                <div class="font-bold truncate">{{ item.nama || item.namaObat }}</div>
                <div class="flex justify-between pl-1">
                  <span>{{ item.qty || item.jumlah || 1 }}x @{{ (item.harga || item.hargaJual || 0).toLocaleString("id-ID") }}</span>
                  <span>{{ ((item.qty || item.jumlah || 1) * (item.harga || item.hargaJual || 0)).toLocaleString("id-ID") }}</span>
                </div>
              </div>
            </div>

            <div class="py-1.5 text-[9px] space-y-1 border-b border-dashed border-black">
              <div class="flex justify-between font-semibold">
                <span>Subtotal:</span>
                <span>Rp {{ (transaksiTerakhir?.subtotal || 0).toLocaleString("id-ID") }}</span>
              </div>

              <div v-if="transaksiTerakhir?.diskon > 0" class="flex justify-between">
                <span>Diskon:</span>
                <span>-Rp {{ (transaksiTerakhir?.diskon || 0).toLocaleString("id-ID") }}</span>
              </div>

              <div class="flex justify-between font-bold text-[10px] pt-0.5">
                <span>TOTAL:</span>
                <span>Rp {{ (transaksiTerakhir?.total || 0).toLocaleString("id-ID") }}</span>
              </div>

              <div class="flex justify-between pt-0.5 border-t border-dotted border-black">
                <span>Tunai / Bayar:</span>
                <span>Rp {{ (transaksiTerakhir?.bayar || 0).toLocaleString("id-ID") }}</span>
              </div>

              <div class="flex justify-between">
                <span>Kembali:</span>
                <span>Rp {{ (transaksiTerakhir?.kembali || 0).toLocaleString("id-ID") }}</span>
              </div>
            </div>

            <div class="text-center pt-2 text-[8px] space-y-0.5">
              <p class="font-bold">*** TERIMA KASIH ***</p>
              <p>Obat yang sudah dibeli</p>
              <p>tidak dapat ditukar/dikembalikan</p>
              <p class="pt-1 text-[7px] text-gray-500">SIM Apotek v1.0</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-3 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" @click="showPreviewStruk = false" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer">Batal</button>
          <button type="button" @click="eksekusiCetakIframe" class="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer">🖨️ Cetak Sekarang</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- MODAL DIALOG BERHASIL -->
  <Teleport to="body">
    <Transition
      enter-active-class="transform transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showModalCetak" class="fixed inset-0 z-99999 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden text-center p-6 space-y-4">
          <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-1">
            <h3 class="text-lg font-extrabold text-slate-800">Transaksi Berhasil!</h3>
            <p class="text-xs text-slate-500 font-medium">Pembayaran telah diterima. Apakah Anda ingin mencetak struk belanja?</p>
          </div>

          <div class="grid grid-cols-2 gap-2.5 pt-2">
            <button type="button" @click="handleTanpaCetak" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer">Tanpa Struk</button>

            <button
              type="button"
              @click="handleSelesaiBayar"
              class="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Cetak Struk
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- MODAL KONFIRMASI HAPUS PENDING -->
  <Teleport to="body">
    <ConfirmModal :isOpen="isModalConfirmOpen" title="Konfirmasi Hapus" message="Apakah Anda yakin ingin menghapus antrean transaksi pending ini?" @konfirmasi="eksekusiHapusPending" @batal="isModalConfirmOpen = false" />
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { ShoppingCart } from "@lucide/vue";
import { apiPenjualan } from "@/services/api.js";
import { formatRupiah } from "@/utils/formatters.js";
import { cetakStrukWebUSB } from "@/utils/usbPrinter";
import { useToastStore } from "@/stores/toastStore";
import ConfirmModal from "@/components/ConfirmModal.vue";

// FUNGSI KONFIRMASI UNTUK HAPUS PENDINGAN BELANJAAN
const isModalConfirmOpen = ref(false);
const selectedIndexHapus = ref(null);

// Pemicu awal saat tombol 'X' diklik
const mintaKonfirmasiHapus = (idx) => {
  console.log("🔘 Tombol Hapus diklik! Index:", idx);
  selectedIndexHapus.value = idx;
  isModalConfirmOpen.value = true;
};

// Fungsi eksekusi hapus yang dipanggil modal saat user klik 'Ya, Hapus'
const eksekusiHapusPending = () => {
  if (selectedIndexHapus.value !== null) {
    // Panggil logika hapus asli kamu di sini
    hapusPending(selectedIndexHapus.value);

    // Reset state
    selectedIndexHapus.value = null;
    isModalConfirmOpen.value = false;
  }
};

const toastStore = useToastStore();

const props = defineProps({
  daftarObat: { type: Array, default: () => [] },
});

const emit = defineEmits(["transaksiSukses"]);

// STATE INTERNAL KASIR
const searchKasir = ref("");
const keranjang = ref(JSON.parse(localStorage.getItem("kasir_keranjang")) || []);
const diskonKasir = ref(0);
const metodeBayarKasir = ref("Tunai");
const uangDiterima = ref(0);
const inputKasirRef = ref(null);

// 🎯 STATE BARU: TANGGAL TRANSAKSI (Default: Waktu Sekarang ISO Format)
const getTodayFormatted = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const tglTransaksiKasir = ref(getTodayFormatted());

// 🎯 STATE BARU: PENDING TRANSAKSI
const daftarPending = ref(JSON.parse(localStorage.getItem("kasir_pending_list")) || []);
const showModalPendingList = ref(false);

// COMPUTED FILTER OBAT KASIR (A-Z)
const filteredKasir = computed(() => {
  if (!props.daftarObat) return [];
  const k = searchKasir.value.toLowerCase();
  const hasil = props.daftarObat.filter((o) => (o.nama && o.nama.toLowerCase().includes(k)) || (o.idObat && o.idObat.toLowerCase().includes(k)));
  return hasil.sort((a, b) => (a.nama || "").localeCompare(b.nama || "", "id", { sensitivity: "base" }));
});

watch(
  keranjang,
  (valKeranjangBaru) => {
    localStorage.setItem("kasir_keranjang", JSON.stringify(valKeranjangBaru));
  },
  { deep: true },
);

// AKSI KERANJANG
const tambahKeKeranjang = (obat) => {
  if (obat.stok <= 0) return toastStore.trigger(`Stok ${obat.nama} sudah habis! Silahkan lakukan pembelian.`, "error");

  const idKey = obat._id || obat.id;
  const ada = keranjang.value.find((k) => (k._id || k.id) === idKey);
  if (ada) {
    if (ada.qty < obat.stok) ada.qty++;
    else toastStore.trigger("Jumlah pembelian melebihi sisa stok!", "warning");
  } else {
    keranjang.value.push({ ...obat, qty: 1 });
  }
};

const tambahQty = (idx) => {
  const item = keranjang.value[idx];
  if (item.qty < item.stok) item.qty++;
  else toastStore.trigger("Jumlah melebihi stok yang tersedia!", "warning");
};

const kurangiQty = (idx) => {
  const item = keranjang.value[idx];
  if (item.qty > 1) item.qty--;
  else hapusKeranjang(idx);
};

const hapusKeranjang = (idx) => keranjang.value.splice(idx, 1);
const kosongkanKeranjang = () => {
  keranjang.value = [];
  localStorage.removeItem("kasir_keranjang");
};

// KALKULASI KASIR
const subtotalKasir = computed(() => keranjang.value.reduce((total, i) => total + i.qty * i.hargaJual, 0));

const grandTotalKasir = computed(() => {
  const total = subtotalKasir.value - Number(diskonKasir.value || 0);
  return total < 0 ? 0 : total;
});

const kembalianKasir = computed(() => Number(uangDiterima.value || 0) - grandTotalKasir.value);

const scanBarcodeLangsung = () => {
  if (!searchKasir.value) return;
  const match = props.daftarObat.find((o) => o.idObat && o.idObat.toLowerCase() === searchKasir.value.toLowerCase());
  if (match) {
    tambahKeKeranjang(match);
    searchKasir.value = "";
  }
};

// 🎯 LOGIKA PENDING TRANSAKSI (SAVE & RECALL)
const pendingTransaksi = () => {
  if (keranjang.value.length === 0) return;

  const drafBaru = {
    id: Date.now(),
    waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    items: JSON.parse(JSON.stringify(keranjang.value)),
    diskon: diskonKasir.value,
    metodeBayar: metodeBayarKasir.value,
    total: grandTotalKasir.value,
  };

  daftarPending.value.push(drafBaru);
  localStorage.setItem("kasir_pending_list", JSON.stringify(daftarPending.value));

  // Reset keranjang aktif
  resetKasir();
  toastStore.trigger("⏳ Transaksi berhasil di-pending!", "warning");
};

const lanjutkanPending = (idx) => {
  const selected = daftarPending.value[idx];
  keranjang.value = JSON.parse(JSON.stringify(selected.items));
  diskonKasir.value = selected.diskon || 0;
  metodeBayarKasir.value = selected.metodeBayar || "Tunai";

  // Hapus dari list pending
  daftarPending.value.splice(idx, 1);
  localStorage.setItem("kasir_pending_list", JSON.stringify(daftarPending.value));

  showModalPendingList.value = false;
  toastStore.trigger("🔄 Transaksi pending berhasil dipanggil!", "success");
};

const hapusPending = (idx) => {
  daftarPending.value.splice(idx, 1);
  localStorage.setItem("kasir_pending_list", JSON.stringify(daftarPending.value));
  toastStore.trigger("Draf pending dihapus.", "warning");
};

// PROSES SELESAI TRANSAKSI
const showModalCetak = ref(false);
const transaksiTerakhir = ref(null);

const prosesSelesaiTransaksi = async () => {
  if (!keranjang.value || keranjang.value.length === 0) {
    toastStore.trigger("⚠️ Keranjang belanja masih kosong!", "warning");
    return;
  }

  // 1. Validasi Harga di Bawah Modal
  const itemRugi = keranjang.value.find((item) => Number(item.hargaJual) < Number(item.hargaBeli || item.hpp || 0));
  if (itemRugi) {
    toastStore.trigger(`⚠️ Harga "${itemRugi.nama}" di bawah modal! Perbaiki dulu.`, "warning");
    return;
  }

  // 2. Kirim Transaksi ke API (Merapikan Payload Items & Tanggal Transaksi)
  try {
    // 🎯 RAPIKAN ITEM PAYLOAD AGAR INTEGRASI TIPE BARANG DARI BACKEND BERJALAN MULUS
    const itemsPayload = keranjang.value.map((item) => ({
      _id: item._id || item.id,
      idObat: item.idObat,
      nama: item.nama,
      qty: item.qty,
      hargaBeli: item.hargaBeli || item.hpp || 0,
      hargaJual: item.hargaJual,
      subtotal: item.qty * item.hargaJual,
      tipeBarang: typeof item.tipeBarang === "object" ? item.tipeBarang?._id : item.tipeBarang,
      satuan: item.satuanTerkecil?.nama || "Pcs",
    }));

    const payload = {
      items: itemsPayload,
      diskon: Number(diskonKasir.value || 0),
      metodeBayar: metodeBayarKasir.value,
      bayar: metodeBayarKasir.value === "Tunai" ? Number(uangDiterima.value) : grandTotalKasir.value,
      kembali: metodeBayarKasir.value === "Tunai" ? (kembalianKasir.value < 0 ? 0 : kembalianKasir.value) : 0,
      tglTransaksi: tglTransaksiKasir.value,
    };

    const result = await apiPenjualan.transaksiBaru(payload);
    const resData = result?.data || result;

    if (resData) {
      transaksiTerakhir.value = resData;
      emit("transaksiSukses", resData);
      showModalCetak.value = true;
    } else {
      toastStore.trigger(`Gagal Transaksi: ${result?.message || "Terjadi kesalahan"}`, "error");
    }
  } catch (error) {
    console.error("❌ Error saat transaksi:", error);
    toastStore.trigger("Gagal terhubung ke server backend.", "error");
  }
};
const showPreviewStruk = ref(false);

const handleSelesaiBayar = () => {
  transaksiTerakhir.value = {
    id: "TRX-" + Date.now().toString().slice(-6),
    items: JSON.parse(JSON.stringify(keranjang.value || [])),
    subtotal: subtotalKasir.value || 0,
    diskon: diskonKasir.value || 0,
    total: grandTotalKasir.value || 0,
    bayar: Number(uangDiterima.value) || 0,
    kembali: kembalianKasir.value || 0,
    metodeBayar: metodeBayarKasir.value || "Tunai",
  };

  if (typeof showModalCetak !== "undefined") {
    showModalCetak.value = false;
  }
  showPreviewStruk.value = true;
};

const eksekusiCetakIframe = async () => {
  const data = transaksiTerakhir.value;
  if (!data) return toastStore.trigger("⚠️ Data transaksi tidak ditemukan!", "error");

  showPreviewStruk.value = false;
  const res = await cetakStrukWebUSB(data);

  if (res.success) {
    toastStore.trigger("✅ Struk berhasil dicetak!", "success");
    resetKasir();
  } else {
    toastStore.trigger("⚠️ Gagal mencetak atau koneksi USB dibatalkan.", "error");
  }
};

const handleTanpaCetak = () => {
  showModalCetak.value = false;
  resetKasir();
  toastStore.trigger("✅ Transaksi selesai tanpa cetak struk.", "success");
};

const resetKasir = () => {
  keranjang.value = [];
  diskonKasir.value = 0;
  uangDiterima.value = 0;
  searchKasir.value = "";
  tglTransaksiKasir.value = getTodayFormatted(); // Reset tanggal ke realtime
  localStorage.removeItem("kasir_keranjang");
};
</script>
