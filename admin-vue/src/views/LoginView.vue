<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-100">
      <!-- Header Logo / Judul -->
      <div class="text-center mb-8">
        <div class="inline-flex p-3 bg-teal-50 text-teal-600 rounded-2xl mb-3 text-2xl font-black">💊</div>
        <h1 class="text-2xl font-black text-slate-800">Apotek App</h1>
        <p class="text-xs text-slate-400 mt-1">Silakan masuk untuk melanjutkan</p>
      </div>

      <!-- Form Login -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Username</label>
          <input
            type="text"
            v-model="form.username"
            placeholder="Masukkan username..."
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
          <input
            type="password"
            v-model="form.password"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            required
          />
        </div>

        <button type="submit" class="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition cursor-pointer mt-2">Masuk ke Sistem</button>
      </form>

      <!-- Informasi Kontak Owner jika belum punya akun -->
      <div class="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-6">
        Belum punya akun kasir/staff?
        <a href="https://wa.me/628xxxxxxxxxx?text=Halo%20Owner,%20saya%20butuh%20akun%20untuk%20login%20sebagai%20kasir%20apotek." target="_blank" class="text-teal-600 font-bold hover:underline block mt-1"> Hubungi Owner via WhatsApp </a>
      </div>
    </div>
  </div>
  <ToastNotif />
</template>
<script setup>
import { ref } from "vue";
import ToastNotif from "@/components/ToastNotif.vue";
import { useToastStore } from "@/stores/toastStore";

const toastStore = useToastStore();
const emit = defineEmits(["login-success"]);

const form = ref({
  username: "",
  password: "",
});

const handleLogin = async () => {
  try {
    const response = await fetch("https://sim-apotek-production.up.railway.app/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.value.username,
        password: form.value.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal masuk ke sistem!");
    }

    // SIMPAN STATUS LOGIN KE BROWSER
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("username", data.username);
    sessionStorage.setItem("role", data.role);

    toastStore.trigger("Login Berhasil! Selamat datang, " + data.username, "success");

    // Kirim sinyal ke App.vue bahwa login sukses
    emit("login-success", data);
  } catch (err) {
    toastStore.trigger(err.message);
    console.error("Gagal login:", err);
  }
};
</script>
