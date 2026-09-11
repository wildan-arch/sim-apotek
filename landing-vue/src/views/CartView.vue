<script setup>
import { ref, computed } from "vue";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, CheckCircle2 } from "lucide-vue-next";
import PaymentModal from "@/components/modals/PaymentModal.vue";

defineEmits(["change-page"]);

// State Modal Pembayaran
const isPaymentModalOpen = ref(false);

// Dummy Data Keranjang Belanja
const cartItems = ref([
  {
    id: 1,
    name: "Dolo-650 Tablet Paracetamol 650mg",
    category: "Fever",
    price: 2.4,
    quantity: 2,
  },
  {
    id: 2,
    name: "Becosules Capsule Vitamin B-Complex",
    category: "Vitamins",
    price: 4.1,
    quantity: 1,
  },
  {
    id: 3,
    name: "Ensure Vanilla Nutrition Powder",
    category: "Nutrition",
    price: 24.9,
    quantity: 1,
  },
]);

// === STATE & LOGIKA ONGKIR SEDERHANA ===

const distanceKm = ref(1.0); // Default jarak 2 km
const BASE_FEE = 1.0;
const PER_KM_FEE = 0.5;
const shippingFee = computed(() => {
  if (cartItems.value.length === 0) return 0;

  // Jika jarak dekat (<= 1.5 km) -> Gratis Ongkir
  if (distanceKm.value <= 1.5) {
    return 0;
  }

  // Jika jarak > 1.5 km -> Hitung Biaya Dasar + (Jarak Berlebih * Tarif per Km)
  const extraDistance = distanceKm.value - 1.5;
  return BASE_FEE + extraDistance * PER_KM_FEE;
});

// Fungsi Ubah Kuantitas
const updateQuantity = (id, amount) => {
  const item = cartItems.value.find((i) => i.id === id);
  if (item) {
    const newQty = item.quantity + amount;
    if (newQty > 0) {
      item.quantity = newQty;
    }
  }
};

// Fungsi Hapus Item
const removeItem = (id) => {
  cartItems.value = cartItems.value.filter((i) => i.id !== id);
};

// Subtotal & Grand Total
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const grandTotal = computed(() => subtotal.value + shippingFee.value);

const handlePaymentSuccess = () => {
  cartItems.value = [];
};

// Validasi: Jarak harus terisi (tidak null/undefined/kosong) dan bernilai lebih besar dari 0
const isDistanceValid = computed(() => {
  return distanceKm.value !== null && distanceKm.value !== undefined && distanceKm.value !== "" && distanceKm.value > 0;
});
</script>

<template>
  <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header Navigasi -->
    <div class="mb-6 flex items-center justify-between">
      <button type="button" @click="$emit('change-page', 'product')" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
        <ArrowLeft class="w-4 h-4" />
        Lanjut Belanja
      </button>
    </div>

    <h1 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
      <ShoppingBag class="w-6 h-6 text-emerald-600" />
      {{ $t("nav.cart") || "Keranjang Belanja" }}
    </h1>

    <div v-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Kolom Kiri: Daftar Produk (2 Kolom di Desktop) -->
      <div class="lg:col-span-2 space-y-4">
        <div v-for="item in cartItems" :key="item.id" class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center">
              <ShoppingBag class="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <span class="text-[10px] font-bold tracking-wider text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                {{ item.category }}
              </span>
              <h3 class="text-sm font-bold text-slate-800 mt-1">
                {{ item.name }}
              </h3>
              <p class="text-sm font-extrabold text-slate-900 mt-1">${{ item.price.toFixed(2) }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <button type="button" @click="updateQuantity(item.id, -1)" class="p-1.5 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors">
                <Minus class="w-3.5 h-3.5" />
              </button>
              <span class="px-3 text-xs font-bold text-slate-800">{{ item.quantity }}</span>
              <button type="button" @click="updateQuantity(item.id, 1)" class="p-1.5 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors">
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>

            <p class="text-sm font-bold text-slate-900 w-16 text-right">${{ (item.price * item.quantity).toFixed(2) }}</p>

            <button type="button" @click="removeItem(item.id)" class="p-2 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Card Pengiriman & Ringkasan Tagihan (1 Kolom di Desktop) -->
      <div class="lg:col-span-1 space-y-6">
        <!-- CARD INFO PENGIRIMAN LOKAL -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin class="w-4 h-4 text-emerald-600" />
            Pengiriman Kurir Apotek
          </h2>

          <div class="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3 animate-pulse">
            <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div class="text-xs">
              <p class="font-bold text-emerald-900">Promo Gratis Ongkir!</p>
              <p class="text-emerald-700 mt-0.5">Khusus pengiriman jarak di atas <span class="font-bold">1.5 km</span> tidak dikenakan biaya ongkos kirim.</p>
            </div>
          </div>

          <!-- Input Jarak dari Apotek -->
          <div class="pt-2">
            <label class="block text-xs font-semibold text-slate-600 mb-1"> Estimasi Jarak dari Apotek (km) </label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="distanceKm"
                type="number"
                step="0.1"
                min="0.1"
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Masukkan jarak..."
                required
              />
              <span class="text-xs font-bold text-slate-500 whitespace-nowrap">km</span>
            </div>
            <!-- Pesan Peringatan jika kosong -->
            <p v-if="!isDistanceValid" class="text-[11px] font-medium text-red-500 mt-1">* Silakan masukkan estimasi jarak pengiriman.</p>
          </div>
        </div>

        <!-- CARD RINGKASAN TAGIHAN -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm sticky top-6">
          <h2 class="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Ringkasan Pesanan</h2>

          <div class="space-y-3 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Subtotal Produk</span>
              <span class="font-bold text-slate-800">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Ongkos Kirim ({{ distanceKm }} km)</span>
              <span v-if="shippingFee === 0" class="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"> GRATIS </span>
              <span v-else class="font-bold text-emerald-700"> +${{ shippingFee.toFixed(2) }} </span>
            </div>
          </div>

          <div class="my-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span class="text-sm font-bold text-slate-900">Total Pembayaran</span>
            <span class="text-lg font-black text-emerald-600">${{ grandTotal.toFixed(2) }}</span>
          </div>

          <button
            type="button"
            @click="isPaymentModalOpen = true"
            :disabled="cartItems.length === 0 || !isDistanceValid"
            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Lanjut ke Pembayaran</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- State Keranjang Kosong -->
    <div v-else class="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-slate-800">Keranjang Belanja Anda Kosong</h3>
      <p class="text-xs text-slate-500 mt-1">Anda belum menambahkan produk apa pun ke dalam keranjang.</p>
      <button type="button" @click="$emit('change-page', 'product')" class="mt-6 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all cursor-pointer">Mulai Belanja Sekarang</button>
    </div>

    <!-- Modal Pembayaran -->
    <PaymentModal :is-open="isPaymentModalOpen" :total-amount="grandTotal" @close="isPaymentModalOpen = false" @success="handlePaymentSuccess" />
  </div>
</template>
