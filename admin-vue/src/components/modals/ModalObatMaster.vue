<template>
  <!-- OVERLAY MODAL UTAMA -->
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto transition-all">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 border border-slate-100/80 transform transition-all">
      <!-- HEADER MODAL -->
      <div class="bg-linear-to-r from-teal-800 to-teal-900 px-6 py-4 text-white flex justify-between items-center shadow-sm">
        <div class="flex items-center gap-2.5">
          <div class="p-2 bg-teal-700/50 rounded-xl border border-teal-600/30">
            <svg class="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-base tracking-wide">
              {{ isEditMode ? "Edit Data Barang" : "Tambah Barang Baru" }}
            </h3>
            <p class="text-[11px] text-teal-200/80">Lengkapi informasi spesifikasi barang, tipe & harga</p>
          </div>
        </div>
        <button @click="tutupModal" class="w-8 h-8 flex items-center justify-center rounded-xl bg-teal-700/40 hover:bg-teal-700 text-teal-200 hover:text-white font-bold text-lg transition cursor-pointer">✕</button>
      </div>

      <!-- FORM UTAMA -->
      <form @submit.prevent="simpanBarangMaster" class="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <!-- 🎯 SECTION BARU: TIPE BARANG (DINAMIS & REAKTIF) -->
        <!-- SECTION: TIPE BARANG (DENGAN TOMBOL + DINAMIS) -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700"> Tipe Barang <span class="text-rose-500">*</span> </label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <select
                v-model="barangForm.tipeBarang"
                required
                @change="onTipeBarangChange"
                class="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition appearance-none cursor-pointer capitalize"
              >
                <option value="" disabled selected>-- Pilih Tipe Barang --</option>
                <option v-for="tipe in tipeBarangSorted" :key="tipe._id || tipe.kode" :value="tipe._id || tipe.kode">
                  {{ formatCapitalize(tipe.nama || tipe.label || tipe.kode) }}
                </option>
              </select>
              <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- 🎯 TOMBOL + UNTUK TAMBAH TIPE BARANG -->
            <button
              type="button"
              @click="modalTambahTipeBarang = true"
              class="px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-lg rounded-xl border border-teal-200 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
              title="Tambah Tipe Barang Baru"
            >
              +
            </button>
          </div>
        </div>

        <!-- SECTION 1: KODE & NAMA BARANG -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div class="sm:col-span-4 space-y-1.5">
            <label class="block text-xs font-bold text-slate-700"> Kode / ID Barang <span class="text-rose-500">*</span> </label>
            <input
              type="text"
              v-model="barangForm.idObat"
              required
              placeholder="BRG-001"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-sm font-mono uppercase text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>
          <div class="sm:col-span-8 space-y-1.5">
            <label class="block text-xs font-bold text-slate-700"> Nama Barang / Obat <span class="text-rose-500">*</span> </label>
            <input
              type="text"
              v-model="barangForm.nama"
              required
              placeholder="Contoh: Paracetamol 500mg / Susu UHT 250ml"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition capitalize"
            />
          </div>
        </div>

        <!-- SECTION 2: KATEGORI & RAK -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700"> Kategori <span class="text-rose-500">*</span> </label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <select
                  v-model="barangForm.kategori"
                  required
                  class="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition appearance-none cursor-pointer capitalize"
                >
                  <option value="" disabled selected>-- Pilih Kategori --</option>
                  <option v-for="kat in masterKategori" :key="kat._id" :value="kat._id">
                    {{ formatCapitalize(kat.nama) }}
                  </option>
                </select>
                <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                @click="modalTambahKategori = true"
                class="px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-lg rounded-xl border border-teal-200 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                title="Tambah Kategori Baru"
              >
                +
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">Lokasi Rak / Penyimpanan</label>
            <input
              type="text"
              v-model="barangForm.lokasiRak"
              placeholder="Contoh: Rak A-1"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition capitalize"
            />
          </div>
        </div>

        <!-- 🎯 SECTION 3: NO BATCH & EXPIRED DATE (HANYA UNTUK TIPE MEDIS/OBAT) -->
        <div v-if="isButuhDetailMedis" class="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-amber-900">No. Batch</label>
            <input
              type="text"
              v-model="barangForm.noBatch"
              placeholder="Contoh: B123456"
              class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-amber-900">Tanggal Expired (ED)</label>
            <input
              type="date"
              v-model="barangForm.expiredDate"
              class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>
        </div>

        <!-- SECTION 4: SATUAN & KONVERSI KEMASAN -->
        <div class="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500"> 📦 Satuan & Konversi Kemasan </span>
            <span class="text-[11px] text-slate-400 font-medium">Atur tingkat kemasan barang</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <!-- 1. SATUAN ECERAN (Span 5) -->
            <div class="md:col-span-5 space-y-1.5">
              <label class="block text-xs font-bold text-slate-700"> Satuan Eceran <span class="text-rose-500">*</span> </label>
              <div class="flex gap-1.5">
                <div class="relative flex-1">
                  <select
                    v-model="barangForm.satuanTerkecil"
                    required
                    class="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition appearance-none cursor-pointer capitalize"
                  >
                    <option value="" disabled selected>-- Pilih Satuan --</option>
                    <option v-for="s in satuanSorted" :key="s._id || s.id" :value="s._id || s.id">
                      {{ formatCapitalize(s.nama) }}
                    </option>
                  </select>
                  <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <button
                  type="button"
                  @click="
                    targetSatuanType = 'eceran';
                    satuanBaruNama = '';
                    modalTambahSatuan = true;
                  "
                  class="px-3 bg-white hover:bg-teal-50 text-teal-700 font-bold text-base rounded-xl border border-slate-300 hover:border-teal-500 shadow-sm transition active:scale-95 flex items-center justify-center cursor-pointer"
                  title="Tambah Satuan Eceran Baru"
                >
                  +
                </button>
              </div>
            </div>

            <!-- 2. SATUAN BESAR (Span 5) -->
            <div class="md:col-span-5 space-y-1.5">
              <label class="block text-xs font-bold text-slate-700"> Satuan Besar <span class="text-slate-400 font-normal">(Opsional)</span> </label>
              <div class="flex gap-1.5">
                <div class="relative flex-1">
                  <select
                    v-model="barangForm.satuanBesar"
                    class="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition appearance-none cursor-pointer capitalize"
                  >
                    <option value="">Tidak Ada (Khusus Eceran)</option>
                    <option v-for="s in satuanSorted" :key="s._id || s.id" :value="s._id || s.id">
                      {{ formatCapitalize(s.nama) }}
                    </option>
                  </select>
                  <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <button
                  type="button"
                  @click="
                    targetSatuanType = 'besar';
                    satuanBaruNama = '';
                    modalTambahSatuan = true;
                  "
                  class="px-3 bg-white hover:bg-teal-50 text-teal-700 font-bold text-base rounded-xl border border-slate-300 hover:border-teal-500 shadow-sm transition active:scale-95 flex items-center justify-center cursor-pointer"
                  title="Tambah Satuan Besar Baru"
                >
                  +
                </button>
              </div>
            </div>

            <!-- 3. ISI KONVERSI (Span 2) -->
            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 truncate" title="Isi Konversi">Isi Konversi</label>
              <input
                type="number"
                min="1"
                v-model.number="barangForm.nilaiKonversi"
                placeholder="1"
                class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-center text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>
          </div>
        </div>

        <!-- SECTION 5: MODAL, HPP, MARGIN & HARGA JUAL -->
        <div class="bg-teal-50/60 p-4 rounded-xl border border-teal-100 space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Modal Satuan Besar (Rp)</label>
              <input
                type="number"
                v-model.number="barangForm.hargaBeliSatuanBesar"
                @input="hitungDariMargin"
                placeholder="0"
                class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700"> HPP Modal Eceran (Rp) <span class="text-rose-500">*</span> </label>
              <input
                type="number"
                v-model.number="barangForm.hargaBeli"
                @input="hitungDariMargin"
                required
                placeholder="0"
                class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-800 transition"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Margin Keuntungan (%)</label>
              <input
                type="number"
                v-model.number="barangForm.marginPersen"
                @input="hitungDariMargin"
                step="0.1"
                placeholder="20"
                class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-teal-700 transition"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-teal-900"> Harga Jual Eceran (Rp) <span class="text-rose-500">*</span> </label>
            <div class="relative">
              <input
                type="number"
                v-model.number="barangForm.hargaJual"
                @input="hitungDariHargaJual"
                required
                placeholder="0"
                class="w-full px-4 py-3 bg-white border-2 border-teal-500/80 rounded-xl text-lg font-extrabold text-teal-800 outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 transition shadow-sm"
              />
            </div>
          </div>
        </div>

        <!-- SECTION 6: STOK & STOK MINIMUM -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700"> Stok Awal Eceran <span class="text-rose-500">*</span> </label>
            <input
              type="number"
              v-model.number="barangForm.stok"
              required
              min="0"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700"> Batas Minimum Stok <span class="text-rose-500">*</span> </label>
            <input
              type="number"
              v-model.number="barangForm.minStok"
              required
              min="1"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>
        </div>

        <!-- FOOTER / BUTTON ACTION -->
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" @click="tutupModal" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95">Batal</button>
          <button
            type="submit"
            class="px-6 py-2.5 bg-linear-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-bold text-xs transition shadow-md shadow-teal-600/20 active:scale-95 cursor-pointer"
          >
            {{ isEditMode ? "Simpan Perubahan" : "Tambah Barang" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- POPUP TAMBAH KATEGORI DINAMIS -->
  <div v-if="modalTambahKategori" class="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-60 p-4">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <h4 class="text-sm font-bold text-slate-900">Tambah Master Kategori</h4>
        <button @click="modalTambahKategori = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
      </div>
      <form @submit.prevent="simpanKategoriDinamis" class="space-y-4 text-xs">
        <div class="space-y-1.5">
          <label class="block font-bold text-slate-700">Nama Kategori</label>
          <input
            v-model="kategoriBaruNama"
            placeholder="Misal: Susu Bayi, Alkes, Snack"
            required
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-xs font-medium capitalize"
          />
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t">
          <button type="button" @click="modalTambahKategori = false" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition">Batal</button>
          <button type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 transition">Simpan</button>
        </div>
      </form>
    </div>
  </div>

  <!-- POPUP TAMBAH SATUAN DINAMIS -->
  <div v-if="modalTambahSatuan" class="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-60 p-4">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <h4 class="text-sm font-bold text-slate-900">Tambah Master Satuan</h4>
        <button @click="modalTambahSatuan = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
      </div>
      <form @submit.prevent="simpanSatuanDinamis" class="space-y-4 text-xs">
        <div class="space-y-1.5">
          <label class="block font-bold text-slate-700">Nama Satuan</label>
          <input
            v-model="satuanBaruNama"
            placeholder="Misal: Kaleng, Sachet, Renteng, Karton"
            required
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-xs font-medium capitalize"
          />
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t">
          <button type="button" @click="modalTambahSatuan = false" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition">Batal</button>
          <button type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 transition">Simpan</button>
        </div>
      </form>
    </div>
  </div>
  <!-- POPUP TAMBAH TIPE BARANG DINAMIS -->
  <div v-if="modalTambahTipeBarang" class="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-60 p-4">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <h4 class="text-sm font-bold text-slate-900">Tambah Tipe Barang</h4>
        <button @click="modalTambahTipeBarang = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
      </div>
      <form @submit.prevent="simpanTipeBarangDinamis" class="space-y-4 text-xs">
        <div class="space-y-1.5">
          <label class="block font-bold text-slate-700">Nama Tipe Barang</label>
          <input
            v-model="tipeBaruNama"
            placeholder="Misal: Kosmetik, Herbal, Baby Care"
            required
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-xs font-medium capitalize"
          />
        </div>

        <!-- OPSI MEMBUTUHKAN NO BATCH / EXP DATE -->
        <div class="flex items-center gap-2 pt-1">
          <input type="checkbox" id="butuhMedisCheck" v-model="tipeBaruButuhMedis" class="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer" />
          <label for="butuhMedisCheck" class="text-xs font-medium text-slate-700 cursor-pointer select-none"> Butuh Detail Medis (No. Batch & Expired Date) </label>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t">
          <button type="button" @click="modalTambahTipeBarang = false" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition">Batal</button>
          <button type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 transition">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import MyTooltip from "@/components/MyTooltip.vue";
import { useMasterStore } from "@/stores/useMasterStore.js";
import { apiObat, apiKategori, apiSatuan } from "@/services/api.js";
import { useToastStore } from "@/stores/toastStore";

const toastStore = useToastStore();
const props = defineProps({
  isOpen: Boolean,
  editData: Object,
});

const emit = defineEmits(["update:isOpen", "suksesSimpan"]);

// MENGAMBIL STORE MASTER DATA (Daftar Kategori, Satuan, dan Tipe Barang)
const { masterKategori, masterSatuan, masterTipeBarang, loadAllData } = useMasterStore();

const isEditMode = ref(false);
const editId = ref(null);
const modalTambahKategori = ref(false);
const modalTambahSatuan = ref(false);
const kategoriBaruNama = ref("");
const satuanBaruNama = ref("");
const targetSatuanType = ref("eceran");

// FORMAT CAPITALIZE HELPER (Menggunakan Utils atau Local Fallback)
const formatCapitalize = (str) => {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (x) => x.toUpperCase());
};

const barangForm = ref({
  tipeBarang: "",
  idObat: "",
  nama: "",
  kategori: "",
  satuanTerkecil: "",
  satuanBesar: "",
  nilaiKonversi: 1,
  hargaBeliSatuanBesar: 0,
  hargaBeli: 0,
  marginPersen: 20,
  hargaJual: 0,
  stok: 0,
  minStok: 5,
  lokasiRak: "",
  noBatch: "",
  expiredDate: "",
});

// DEFAULT FALLBACK JIKA MASTER TIPE BELUM LOADED
const defaultTipeList = [
  { _id: "OBAT", kode: "OBAT", nama: "Obat & Medis", butuhDetailMedis: true },
  { _id: "FMCG", kode: "FMCG", nama: "Minimarket / General", butuhDetailMedis: false },
];

// 🎯 COMPUTED: TIPE BARANG SORTED & DINAMIS
const tipeBarangSorted = computed(() => {
  const source = masterTipeBarang && masterTipeBarang.value && masterTipeBarang.value.length > 0 ? masterTipeBarang.value : defaultTipeList;

  return [...source].sort((a, b) => {
    const nameA = a.nama || a.label || a.kode || "";
    const nameB = b.nama || b.label || b.kode || "";
    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
  });
});

// 🎯 COMPUTED: CEK APABILAH TIPE TERPILIH MEMBUTUHKAN DETAIL MEDIS
const isButuhDetailMedis = computed(() => {
  if (!barangForm.value.tipeBarang) return true; // Default tampilkan
  const currentTipe = tipeBarangSorted.value.find((t) => (t._id || t.kode) === barangForm.value.tipeBarang);
  return currentTipe ? currentTipe.butuhDetailMedis !== false : true;
});

// HANDLER KETIKA TIPE BARANG BERUBAH
const onTipeBarangChange = () => {
  if (!isButuhDetailMedis.value) {
    // Kosongkan data medis jika memilih tipe Non-Medis/FMCG
    barangForm.value.noBatch = "";
    barangForm.value.expiredDate = "";
  }
};
// Fungsi Helper Ekstraksi ID yang Aman
const extractId = (field) => {
  if (!field) return "";
  if (typeof field === "object") {
    return field._id || field.kode || "";
  }
  return String(field);
};

// Watcher Gabungan (Memantau isOpen & editData sekaligus)
watch(
  [() => props.isOpen, () => props.editData],
  ([newIsOpen, newEditData]) => {
    if (newIsOpen) {
      const firstTipeId = tipeBarangSorted.value[0]?._id || tipeBarangSorted.value[0]?.kode || "";

      if (newEditData) {
        // MODE EDIT DATA
        isEditMode.value = true;
        editId.value = newEditData._id;

        const konversi = newEditData.nilaiKonversi || 1;
        const hppEceran = newEditData.hargaBeli || 0;

        // Ekstrak ID Tipe Barang
        const idTipeExtracted = extractId(newEditData.tipeBarang);

        // 🎯 Cari ID Tipe "Obat & Medis" jika data lama di DB masih kosong
        const tipeObatDefault = tipeBarangSorted.value.find((t) => t.nama.toLowerCase().includes("obat"))?._id || "";

        barangForm.value = {
          // ✅ JIKA idTipeExtracted ADA PAKAI ITU. JIKA KOSONG, PAKAI TIPE OBAT (BUKAN FIRST TIPE / BABY CARE)
          tipeBarang: idTipeExtracted || tipeObatDefault || "",
          idObat: newEditData.idObat || "",
          nama: newEditData.nama || "",
          kategori: extractId(newEditData.kategori) || masterKategori.value[0]?._id || "",
          satuanTerkecil: extractId(newEditData.satuanTerkecil) || masterSatuan.value[0]?._id || "",
          satuanBesar: extractId(newEditData.satuanBesar) || "",
          nilaiKonversi: konversi,
          hargaBeliSatuanBesar: hppEceran * konversi,
          hargaBeli: hppEceran,
          marginPersen: newEditData.marginPersen || 20,
          hargaJual: newEditData.hargaJual || 0,
          stok: newEditData.stok || 0,
          minStok: newEditData.minStok || 5,
          lokasiRak: newEditData.lokasiRak || "",
          noBatch: newEditData.noBatch || "",
          expiredDate: newEditData.expiredDate ? new Date(newEditData.expiredDate).toISOString().split("T")[0] : "",
        };
      } else {
        // MODE TAMBAH BARANG BARU
        isEditMode.value = false;
        editId.value = null;

        barangForm.value = {
          tipeBarang: firstTipeId,
          idObat: `BRG-${Date.now().toString().slice(-4)}`,
          nama: "",
          kategori: masterKategori.value[0]?._id || "",
          satuanTerkecil: masterSatuan.value[0]?._id || "",
          satuanBesar: "",
          nilaiKonversi: 1,
          hargaBeliSatuanBesar: 0,
          hargaBeli: 0,
          marginPersen: 20,
          hargaJual: 0,
          stok: 0,
          minStok: 5,
          lokasiRak: "",
          noBatch: "",
          expiredDate: "",
        };
      }
    }
  },
  { immediate: true, deep: true },
);

// LOGIKA TIPE BARANG BARU
const modalTambahTipeBarang = ref(false);
const tipeBaruNama = ref("");
const tipeBaruButuhMedis = ref(false);

const simpanTipeBarangDinamis = async () => {
  const inputNama = tipeBaruNama.value.trim();

  if (!inputNama) {
    toastStore.trigger("Nama tipe barang tidak boleh kosong!", "warning");
    return;
  }

  try {
    const payload = {
      nama: inputNama,
      butuhDetailMedis: tipeBaruButuhMedis.value,
    };

    // 1. Eksekusi API Simpan
    const res = await apiTipeBarang.create(payload);

    // 2. Antisipasi jika response dibungkus { data: ... } atau langsung object
    const tipeBaru = res?.data || res;

    // Jika server merespon dengan error status (seperti 400/500)
    if (res?.message && !tipeBaru._id && !tipeBaru.kode) {
      throw new Error(res.message);
    }

    // 3. Refresh Master Store
    await loadAllData();

    // 4. Set nilai otomatis di dropdown form
    if (tipeBaru) {
      barangForm.value.tipeBarang = tipeBaru._id || tipeBaru.kode;
    }

    // 5. Reset State Form Popup
    tipeBaruNama.value = "";
    tipeBaruButuhMedis.value = false;
    modalTambahTipeBarang.value = false;

    toastStore.trigger(`Tipe "${formatCapitalize(inputNama)}" berhasil ditambahkan!`, "success");
  } catch (err) {
    console.error("Error simpan tipe barang:", err);
    toastStore.trigger(`❌ Gagal menambah tipe barang: ${err.message || "Terjadi kesalahan"}`, "error");
  }
};
const hitungDariMargin = () => {
  const hargaBox = Number(barangForm.value.hargaBeliSatuanBesar || 0);
  const konversi = Number(barangForm.value.nilaiKonversi || 1);
  const margin = Number(barangForm.value.marginPersen || 0);

  const hppEceran = konversi > 0 && hargaBox > 0 ? hargaBox / konversi : Number(barangForm.value.hargaBeli || 0);
  barangForm.value.hargaBeli = Math.round(hppEceran);

  if (hppEceran > 0) {
    barangForm.value.hargaJual = Math.round(hppEceran + hppEceran * (margin / 100));
  }
};

const hitungDariHargaJual = () => {
  const hppEceran = Number(barangForm.value.hargaBeli || 0);
  const hargaJual = Number(barangForm.value.hargaJual || 0);

  if (hppEceran > 0 && hargaJual >= hppEceran) {
    const marginHitung = ((hargaJual - hppEceran) / hppEceran) * 100;
    barangForm.value.marginPersen = Number(marginHitung.toFixed(1));
  } else {
    barangForm.value.marginPersen = 0;
  }
};

const simpanBarangMaster = async () => {
  const payload = {
    ...barangForm.value,
    satuanBesar: barangForm.value.satuanBesar || null,
    satuanTerkecil: barangForm.value.satuanTerkecil || null,
    kategori: barangForm.value.kategori || null,
    tipeBarang: barangForm.value.tipeBarang || null,
  };

  try {
    if (isEditMode.value) {
      await apiObat.update(editId.value, payload);
      toastStore.trigger(" Data barang berhasil diperbarui!", "success");
    } else {
      await apiObat.create(payload);
      toastStore.trigger(" Barang baru berhasil ditambahkan!", "success");
    }
    tutupModal();
    loadAllData();
    emit("suksesSimpan");
  } catch (error) {
    console.error("Error simpan barang:", error);
    toastStore.trigger(`❌ Gagal menyimpan: ${error.message || "Terjadi kesalahan"}`, "error");
  }
};

const simpanKategoriDinamis = async () => {
  try {
    const katBaru = await apiKategori.create(kategoriBaruNama.value);
    await loadAllData();
    barangForm.value.kategori = katBaru._id;
    kategoriBaruNama.value = "";
    modalTambahKategori.value = false;
  } catch (err) {
    console.error("Error simpan kategori:", err);
  }
};

const simpanSatuanDinamis = async () => {
  const inputNama = satuanBaruNama.value.trim();

  if (!inputNama) {
    toastStore.trigger("Nama satuan tidak boleh kosong!", "warning");
    return;
  }

  const sudahAda = masterSatuan.value.some((s) => s.nama.trim().toLowerCase() === inputNama.toLowerCase());

  if (sudahAda) {
    toastStore.trigger(`⚠️ Satuan "${inputNama}" sudah ada di daftar!`, "warning");
    return;
  }

  try {
    const satBaru = await apiSatuan.create(satuanBaruNama.value);
    await loadAllData();
    if (targetSatuanType.value === "besar") {
      barangForm.value.satuanBesar = satBaru._id || satBaru.id;
    } else {
      barangForm.value.satuanTerkecil = satBaru._id || satBaru.id;
    }
    satuanBaruNama.value = "";
    modalTambahSatuan.value = false;
  } catch (err) {
    console.error("Error simpan satuan:", err);
  }
};

const satuanSorted = computed(() => {
  if (!masterSatuan.value || !Array.isArray(masterSatuan.value)) return [];
  return [...masterSatuan.value].sort((a, b) => (a.nama || "").localeCompare(b.nama || "", undefined, { sensitivity: "base" }));
});

const tutupModal = () => {
  emit("update:isOpen", false);
};
</script>
