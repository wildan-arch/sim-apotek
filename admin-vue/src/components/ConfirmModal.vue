<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-99999 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 text-center transform transition-all scale-100">
        <!-- Icon Peringatan -->
        <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-sm">⚠️</div>

        <!-- Judul & Pesan -->
        <h3 class="text-base font-bold text-slate-800">{{ title }}</h3>
        <p class="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
          {{ message }}
        </p>

        <!-- Tombol Actions -->
        <div class="flex gap-3">
          <button type="button" @click="$emit('batal')" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
            {{ textBatal }}
          </button>
          <button type="button" @click="$emit('konfirmasi')" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-200 cursor-pointer">
            {{ textKonfirmasi }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: "Hapus Data Ini?" },
  message: { type: String, default: "Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen." },
  textBatal: { type: String, default: "Batal" },
  textKonfirmasi: { type: String, default: "Ya, Hapus" },
});

defineEmits(["batal", "konfirmasi"]);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
