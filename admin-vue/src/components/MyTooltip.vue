<script setup>
// Mendefinisikan 'props' agar teks tooltip bisa diubah-ubah dari luar
defineProps({
  text: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <!-- 1. Tambahkan hover:z-50 agar baris/komponen ini naik ke atas elemen lain saat di-hover -->
  <div class="group relative inline-block hover:z-99999">
    <!-- <slot /> digunakan agar komponen ini bisa membungkus tombol atau teks apa saja -->
    <slot />

    <!-- Elemen Konten Tooltip -->
    <!-- 2. Ubah z-10 menjadi z-50 dan tambahkan pointer-events-none agar tidak mengganggu klik mouse -->
    <div class="invisible group-hover:visible absolute bottom-full right-0 mb-2 w-max bg-gray-900 text-white text-xs rounded py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50 pointer-events-none">
      {{ text }}

      <!-- Panah kecil di bawah tooltip (opsional) -->
      <div class="absolute top-full right-3 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
</template>
