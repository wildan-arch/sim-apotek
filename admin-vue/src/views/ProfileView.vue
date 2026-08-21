<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header Halaman -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-black text-slate-800">Profil Pengguna</h1>
        <p class="text-xs text-slate-400 mt-1">Kelola informasi akun dan keamanan login kamu di sini.</p>
      </div>
      <div class="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-black text-lg">
        {{ userInitial }}
      </div>
    </div>

    <!-- Informasi Utama & Ganti Password -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Kartu Info Akun -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-1 space-y-4">
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Detail Akun</h2>

        <div class="space-y-3 text-xs">
          <div>
            <span class="text-slate-400 block mb-1">Username</span>
            <span class="font-bold text-slate-800 bg-slate-50 px-3 py-2.5 rounded-xl block border border-slate-100 truncate">
              {{ userInfo.username }}
            </span>
          </div>

          <div>
            <span class="text-slate-400 block mb-1">Hak Akses (Role)</span>
            <span class="font-bold uppercase px-3 py-1.5 rounded-xl inline-block" :class="userInfo.role === 'owner' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'">
              {{ userInfo.role }}
            </span>
          </div>
        </div>
      </div>

      <!-- Form Ganti Password Mandiri -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Ganti Password Sendiri</h2>

        <form @submit.prevent="handleUpdatePassword" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 font-bold mb-1">Password Lama</label>
            <input
              type="password"
              v-model="passwordForm.oldPassword"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              required
            />
          </div>

          <div>
            <label class="block text-slate-600 font-bold mb-1">Password Baru</label>
            <input
              type="password"
              v-model="passwordForm.newPassword"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              required
            />
          </div>

          <button type="submit" class="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-lg shadow-teal-700/20 transition cursor-pointer">Simpan Perubahan Password</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Ambil data user dari localStorage saat login
const userInfo = ref({
  username: sessionStorage.getItem("username") || "Admin",
  role: sessionStorage.getItem("user_role") || "owner",
});

const userInitial = computed(() => {
  return userInfo.value.username ? userInfo.value.username.charAt(0).toUpperCase() : "A";
});

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
});

const handleUpdatePassword = async () => {
  try {
    // Logika pengiriman update password ke backend bisa disesuaikan di sini
    alert("Fitur ganti password mandiri berhasil diproses!");
    passwordForm.value.oldPassword = "";
    passwordForm.value.newPassword = "";
  } catch (err) {
    alert("Gagal memperbarui password.");
  }
};
</script>
