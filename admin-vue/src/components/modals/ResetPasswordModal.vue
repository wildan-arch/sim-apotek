<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-100">
      <!-- Header Modal -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-lg font-black text-slate-800">Reset Password Kasir</h2>
          <p class="text-xs text-slate-400">Masukkan username dan password baru</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
      </div>

      <!-- Form Reset -->
      <form @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Username Target</label>
          <input
            type="text"
            v-model="form.username"
            placeholder="cth: kasir_budi"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Password Baru</label>
          <input
            type="password"
            v-model="form.newPassword"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            required
          />
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="$emit('close')" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition">Batal</button>
          <button type="submit" class="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition">Simpan Password Baru</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const form = ref({
  username: "",
  newPassword: "",
});

const handleReset = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.value),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Gagal mereset password!");

    alert("Berhasil! Password akun telah diperbarui.");
    form.value.username = "";
    form.value.newPassword = "";

    emit("close");
  } catch (err) {
    alert(err.message);
  }
};
</script>
