<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-100">
      <!-- Header Modal -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-lg font-black text-slate-800">Manajemen Pengguna</h2>
          <p class="text-xs text-slate-400">Tambah akun baru untuk kasir atau staff</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
      </div>

      <!-- Form Tambah User -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Username Baru</label>
          <input
            type="text"
            v-model="form.username"
            placeholder="cth: kasir_budi"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            required
          />
        </div>

        <div class="relative">
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Password Sementara</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="form.password"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            required
          />
          <!-- Tombol Lihat / Sembunyikan Password -->
          <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-32px text-slate-400 hover:text-slate-600 text-xs font-bold focus:outline-none">
            {{ showPassword ? "Sembunyikan" : "Lihat" }}
          </button>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Role / Hak Akses</label>
          <select v-model="form.role" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition">
            <option value="kasir">Kasir</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="$emit('close')" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer">Batal</button>
          <button type="submit" class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition cursor-pointer">Simpan Akun</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToastStore } from "@/stores/toastStore";

const toast = useToastStore();

defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close", "user-created"]);

const form = ref({
  username: "",
  password: "",
  role: "kasir",
});

const showPassword = ref(false);

const passwordForm = ref({
  newPassword: "",
});

const handleRegister = async () => {
  try {
    const API_URL = "https://sim-apotek-production.up.railway.app";
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.value),
    });

    const data = await response.json();
    console.log("Respon error dari server:", data);
    if (!response.ok) throw new Error(data.message || "Gagal membuat akun!");

    toast.trigger("Berhasil! Akun kasir baru telah ditambahkan.", "success");
    form.value.username = "";
    form.value.password = "";

    emit("user-created");
    emit("close");
  } catch (err) {
    toast.trigger(err.message, "error");
  }
};
</script>
