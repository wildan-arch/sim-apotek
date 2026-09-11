<script setup>
import { ref } from "vue";
import { X, QrCode, Building2, Wallet, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from "lucide-vue-next";

// 1. Import gambar QR Code BCA dari folder assets
import qris from "@/assets/qris1.jpg";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  totalAmount: { type: Number, required: true },
});

const emit = defineEmits(["close", "success"]);

const selectedMethod = ref("qris");
const step = ref("select"); // 'select' | 'qr_display' | 'success'
const isProcessing = ref(false);

const paymentMethods = [
  { id: "qris", name: "QRIS (Semua E-Wallet & Mobile Banking)", icon: QrCode, category: "Instant" },
  { id: "bca", name: "QRIS / Transfer BCA", icon: Building2, category: "Bank BCA" },
  { id: "bri", name: "Bank BRI (Virtual Account)", icon: Building2, category: "Bank Transfer" },
  { id: "shopeepay", name: "ShopeePay", icon: Wallet, category: "E-Wallet" },
];

const handleProceed = () => {
  // Jika memilih QRIS umum atau BCA, tampilkan layar QR Code
  if (selectedMethod.value === "qris" || selectedMethod.value === "bca") {
    step.value = "qr_display";
  } else {
    processPayment();
  }
};

const processPayment = async () => {
  isProcessing.value = true;
  setTimeout(() => {
    isProcessing.value = false;
    step.value = "success";
    setTimeout(() => {
      step.value = "select";
      emit("success");
      emit("close");
    }, 1500);
  }, 2000);
};

const handleClose = () => {
  if (!isProcessing.value) {
    step.value = "select";
    emit("close");
  }
};
</script>

<template>
  <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-2">
            <button v-if="step === 'qr_display'" type="button" @click="step = 'select'" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors">
              <ArrowLeft class="w-4 h-4" />
            </button>
            <div>
              <h3 class="text-base font-bold text-slate-900">
                {{ step === "qr_display" ? (selectedMethod === "bca" ? "Scan QR BCA" : "Scan QRIS") : "Pilih Metode Pembayaran" }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Total Tagihan: <span class="font-bold text-emerald-600">${{ totalAmount.toFixed(2) }}</span>
              </p>
            </div>
          </div>
          <button type="button" @click="handleClose" :disabled="isProcessing" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- STATE 1: Pilih Metode -->
        <div v-if="step === 'select'" class="p-5 overflow-y-auto space-y-3 flex-1">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            @click="selectedMethod = method.id"
            :class="[
              'p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all',
              selectedMethod === method.id ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300 bg-white',
            ]"
          >
            <div class="flex items-center gap-3">
              <div :class="['p-2 rounded-lg', selectedMethod === method.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600']">
                <component :is="method.icon" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800">{{ method.name }}</p>
                <span class="text-[10px] text-slate-400">{{ method.category }}</span>
              </div>
            </div>
            <div :class="['w-4 h-4 rounded-full border flex items-center justify-center', selectedMethod === method.id ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300']">
              <div v-if="selectedMethod === method.id" class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>
        </div>

        <!-- STATE 2: Tampilan QR Code (Dinamis Sesuai Pilihan) -->
        <div v-else-if="step === 'qr_display'" class="p-6 text-center my-auto flex flex-col items-center">
          <p class="text-xs text-slate-500 mb-3">
            {{ selectedMethod === "bca" ? "Scan menggunakan BCA Mobile / Sakuku." : "Scan QR di bawah menggunakan e-Wallet atau Mobile Banking." }}
          </p>

          <!-- Container Gambar QR -->
          <div class="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-inner mb-4 inline-block">
            <!-- 2. Kondisi Gambar: Tampilkan Gambar BCA jika memilih BCA, jika tidak pakai QRIS umum -->
            <img v-if="selectedMethod === 'bca'" :src="qris" alt="Kode QR BCA" class="w-48 h-48 object-contain" />
            <img v-else src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SIM_APOTEK_PAYMENT" alt="Kode QRIS Umum" class="w-48 h-48 object-contain" />
          </div>

          <div class="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-semibold">
            <Loader2 class="w-3.5 h-3.5 animate-spin" />
            Menunggu Pembayaran...
          </div>
        </div>

        <!-- STATE 3: Sukses -->
        <div v-else-if="step === 'success'" class="p-8 text-center my-auto">
          <CheckCircle2 class="w-16 h-16 text-emerald-500 mx-auto animate-bounce mb-3" />
          <h4 class="text-lg font-bold text-slate-900">Pembayaran Berhasil!</h4>
          <p class="text-xs text-slate-500 mt-1">Pesanan Anda sedang diproses oleh apotek.</p>
        </div>

        <!-- Footer -->
        <div v-if="step !== 'success'" class="p-5 border-t border-slate-100 bg-slate-50/50">
          <button
            v-if="step === 'select'"
            type="button"
            @click="handleProceed"
            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Tampilkan Kode QR</span>
            <ArrowRight class="w-4 h-4" />
          </button>

          <button
            v-else-if="step === 'qr_display'"
            type="button"
            @click="processPayment"
            :disabled="isProcessing"
            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isProcessing" class="w-4 h-4 animate-spin" />
            <span>{{ isProcessing ? "Verifikasi..." : "Saya Sudah Bayar" }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
