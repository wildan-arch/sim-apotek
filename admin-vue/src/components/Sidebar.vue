<template>
  <!-- SIDEBAR NAVIGASI (Kunci tinggi layar penuh & hidden overflow luar) -->
  <aside :class="['bg-teal-900 text-white flex flex-col justify-between transition-all duration-300 relative h-screen p-3 select-none overflow-hidden', isCollapsed ? 'w-20' : 'w-64']">
    <!-- TOMBOL TOGGLE BUKA/TUTUP -->
    <button
      @click="isCollapsed = !isCollapsed"
      class="absolute -right-2 top-6 z-10 bg-teal-800 hover:bg-teal-600 text-white rounded-full p-1 shadow-md border border-teal-500 cursor-pointer"
      :title="isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'"
    >
      <svg class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': isCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- BAGIAN ATAS: Logo & Profil -->
    <div class="shrink-0">
      <div :class="['flex items-center text-lg font-bold mb-3 transition-all duration-300', isCollapsed ? 'justify-center' : 'gap-3 px-1']">
        <Pill class="w-6 h-6 text-teal-300 shrink-0" />
        <span v-if="!isCollapsed" class="whitespace-nowrap overflow-hidden">Apotek Shabah</span>
      </div>

      <!-- PROFIL USER WIDGET -->
      <div class="px-2.5 py-2 mb-3 bg-teal-800/60 rounded-xl flex items-center gap-2.5 cursor-pointer hover:bg-teal-800 transition" @click="$emit('gantiMenu', 'profile')">
        <div class="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
          {{ userInitial }}
        </div>
        <div v-if="!isCollapsed" class="overflow-hidden">
          <p class="text-xs font-bold text-white truncate">{{ username }}</p>
          <p class="text-[9px] text-teal-300 uppercase font-semibold">{{ role }}</p>
        </div>
      </div>
      <hr class="border-teal-700/60 mb-2" />
    </div>

    <!-- BAGIAN TENGAH: Menu Navigasi -->
    <div class="flex-1 overflow-y-auto scrollbar-none space-y-1.5 pr-1">
      <nav class="space-y-1.5">
        <!-- 1. MENU DASHBOARD -->
        <button
          @click="$emit('gantiMenu', 'dashboard')"
          :title="isCollapsed ? 'Dashboard' : ''"
          :class="[
            'w-full flex items-center rounded-lg font-medium transition cursor-pointer text-xs',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
            menuAktif === 'dashboard' ? 'bg-teal-700 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/70',
          ]"
        >
          <LayoutDashboard class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="whitespace-nowrap">Dashboard</span>
        </button>

        <!-- 2. MENU KATALOG OBAT -->
        <button
          @click="$emit('gantiMenu', 'katalog')"
          :title="isCollapsed ? 'Katalog Obat' : ''"
          :class="[
            'w-full flex items-center rounded-lg font-medium transition cursor-pointer text-xs',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
            menuAktif === 'katalog' ? 'bg-teal-700 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/70',
          ]"
        >
          <Pill class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="whitespace-nowrap">Katalog Obat</span>
        </button>

        <!-- STOK OPNAME HP -->
        <button
          type="button"
          @click="$emit('bukaStokOpname')"
          :title="isCollapsed ? 'Stok Opname HP' : ''"
          :class="['w-full flex items-center rounded-lg font-medium transition cursor-pointer text-teal-100 hover:bg-teal-700/70 text-xs', isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5']"
        >
          <span class="text-base shrink-0">📋</span>
          <span v-if="!isCollapsed" class="whitespace-nowrap">Stok Opname HP</span>
        </button>

        <!-- 3. MENU KASIR (POS) -->
        <button
          @click="$emit('gantiMenu', 'kasir')"
          :title="isCollapsed ? 'Menu Kasir (POS)' : ''"
          :class="[
            'w-full flex items-center rounded-lg font-medium transition cursor-pointer text-xs',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
            menuAktif === 'kasir' ? 'bg-teal-700 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/70',
          ]"
        >
          <ShoppingCart class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="whitespace-nowrap">Menu Kasir (POS)</span>
        </button>

        <!-- DEFECTA / REORDER -->
        <button
          @click="$emit('gantiMenu', 'defecta')"
          :class="['w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition cursor-pointer', menuAktif === 'defecta' ? 'bg-teal-700 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/70']"
          :title="isCollapsed ? 'Defecta / Reorder' : ''"
        >
          <span class="text-base shrink-0">📋</span>
          <span v-if="!isCollapsed" class="truncate">Defecta / Reorder</span>
        </button>

        <!-- 4. MENU ACCORDION LAPORAN & KEUANGAN (KHUSUS OWNER) -->
        <div v-if="role === 'owner'">
          <button
            type="button"
            @click="handleToggleLaporan"
            :title="isCollapsed ? 'Laporan & Keuangan' : ''"
            :class="[
              'w-full flex items-center rounded-lg font-medium transition cursor-pointer text-xs',
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5',
              ['laporan-penjualan', 'laporan-pembelian', 'laporan'].includes(menuAktif) ? 'bg-teal-700 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/70',
            ]"
          >
            <div :class="['flex items-center', isCollapsed ? 'justify-center' : 'gap-3']">
              <FileText class="w-4 h-4 shrink-0" />
              <span v-if="!isCollapsed" class="whitespace-nowrap">Laporan & Keuangan</span>
            </div>
            <ChevronDown v-if="!isCollapsed" class="w-3.5 h-3.5 transition-transform duration-200 shrink-0" :class="{ 'rotate-180': isMenuLaporanOpen }" />
          </button>

          <div v-show="isMenuLaporanOpen && !isCollapsed" class="mt-1 pl-5 space-y-1">
            <button
              type="button"
              @click="$emit('gantiMenu', 'laporan-penjualan')"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-2',
                menuAktif === 'laporan-penjualan' ? 'bg-teal-600 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/50',
              ]"
            >
              <span>📊</span> <span class="whitespace-nowrap">Laporan Penjualan</span>
            </button>

            <button
              type="button"
              @click="$emit('gantiMenu', 'laporan-pembelian')"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-2',
                menuAktif === 'laporan-pembelian' ? 'bg-teal-600 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/50',
              ]"
            >
              <span>📦</span> <span class="whitespace-nowrap">Laporan Pembelian</span>
            </button>
          </div>
        </div>

        <!-- 5. MENU HUTANG USAHA -->
        <button
          @click="$emit('bukaMenuHutang')"
          :title="isCollapsed ? 'Hutang Usaha' : ''"
          :class="[
            'w-full flex items-center rounded-lg font-medium transition cursor-pointer text-xs',
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
            menuAktif === 'hutang' ? 'bg-teal-700 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/70',
          ]"
        >
          <CreditCard class="w-4 h-4 shrink-0" />
          <span v-if="!isCollapsed" class="whitespace-nowrap">Hutang Usaha</span>
        </button>

        <!-- 6. MENU ACCORDION: KELOLA LANDING PAGE (KHUSUS OWNER) -->
        <div v-if="role === 'owner'">
          <button
            type="button"
            @click="handleToggleLanding"
            :title="isCollapsed ? 'Kelola Landing Page' : ''"
            :class="[
              'w-full flex items-center rounded-lg font-medium transition cursor-pointer text-xs',
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5',
              ['landing-hero', 'landing-promo', 'landing-banner'].includes(menuAktif) ? 'bg-teal-700 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/70',
            ]"
          >
            <div :class="['flex items-center', isCollapsed ? 'justify-center' : 'gap-3']">
              <Megaphone class="w-4 h-4 shrink-0" />
              <span v-if="!isCollapsed" class="whitespace-nowrap">Kelola Landing Page</span>
            </div>
            <ChevronDown v-if="!isCollapsed" class="w-3.5 h-3.5 transition-transform duration-200 shrink-0" :class="{ 'rotate-180': isMenuLandingOpen }" />
          </button>

          <!-- Submenu Landing Page -->
          <div v-show="isMenuLandingOpen && !isCollapsed" class="mt-1 pl-5 space-y-1">
            <button
              type="button"
              @click="$emit('gantiMenu', 'landing-hero')"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-2',
                menuAktif === 'landing-hero' ? 'bg-teal-600 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/50',
              ]"
            >
              <Globe class="w-3.5 h-3.5 shrink-0" /> <span class="whitespace-nowrap">Hero & Tagline</span>
            </button>

            <button
              type="button"
              @click="$emit('gantiMenu', 'landing-promo')"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-2',
                menuAktif === 'landing-promo' ? 'bg-teal-600 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/50',
              ]"
            >
              <Image class="w-3.5 h-3.5 shrink-0" /> <span class="whitespace-nowrap">Banner & Promo</span>
            </button>
          </div>
        </div>

        <!-- 7. MENU ACCORDION: PENGATURAN APOTEK (KHUSUS OWNER) -->
        <div v-if="role === 'owner'">
          <button
            type="button"
            @click="isMenuPengaturanOpen = !isMenuPengaturanOpen"
            :title="isCollapsed ? 'Pengaturan Apotek' : ''"
            :class="[
              'w-full flex items-center rounded-lg font-medium transition cursor-pointer text-xs',
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5',
              isMenuPengaturanOpen ? 'bg-teal-700 text-white font-bold' : 'text-teal-100 hover:bg-teal-700/70',
            ]"
          >
            <div :class="['flex items-center', isCollapsed ? 'justify-center' : 'gap-3']">
              <span class="text-sm shrink-0">⚙️</span>
              <span v-if="!isCollapsed" class="whitespace-nowrap">Pengaturan Apotek</span>
            </div>
            <ChevronDown v-if="!isCollapsed" class="w-3.5 h-3.5 transition-transform duration-200 shrink-0" :class="{ 'rotate-180': isMenuPengaturanOpen }" />
          </button>

          <div v-show="isMenuPengaturanOpen && !isCollapsed" class="mt-1 pl-5 space-y-1">
            <button type="button" @click="bukaModal" class="w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-2 text-teal-100 hover:bg-teal-700/50">
              <span>⚙️</span> <span class="whitespace-nowrap">Pengaturan Umum</span>
            </button>

            <button type="button" @click="$emit('bukaUserManagement')" class="w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-2 text-teal-100 hover:bg-teal-700/50">
              <Users class="w-3.5 h-3.5 shrink-0" /> <span class="whitespace-nowrap">Manajemen Pengguna</span>
            </button>

            <button type="button" @click="$emit('bukaResetPassword')" class="w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-2 text-teal-100 hover:bg-teal-700/50">
              <span class="text-xs shrink-0">🔑</span> <span class="whitespace-nowrap">Reset Password Kasir</span>
            </button>
          </div>
        </div>
      </nav>
    </div>

    <!-- BAGIAN BAWAH: Tombol Logout -->
    <div class="shrink-0 pt-2 border-t border-teal-700/50 mt-1">
      <button
        @click="isModalConfirmOpen = true"
        :title="isCollapsed ? 'Logout' : ''"
        :class="['flex items-center bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition cursor-pointer text-xs', isCollapsed ? 'justify-center p-2.5' : 'justify-center gap-2 px-4 py-2 w-full']"
      >
        <LogOut class="w-4 h-4 shrink-0" />
        <span v-if="!isCollapsed" class="whitespace-nowrap">Logout</span>
      </button>
    </div>
  </aside>

  <Teleport to="body">
    <ConfirmModal :isOpen="isModalConfirmOpen" title="Konfirmasi Keluar" message="Apakah Anda yakin ingin keluar?" @konfirmasi="handleConfirmLogout" @batal="isModalConfirmOpen = false" />
  </Teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import { Pill, LayoutDashboard, ShoppingCart, FileText, CreditCard, LogOut, ChevronDown, Users, Megaphone, Globe, Image } from "@lucide/vue";
import { useSettingStore } from "@/stores/settingStore";
import ModalSettingApotek from "@/components/modals/ModalSettingApotek.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

const isModalConfirmOpen = ref(false);

const username = ref(sessionStorage.getItem("username") || "Admin");
const role = ref(sessionStorage.getItem("user_role") || "owner");

const userInitial = computed(() => {
  return username.value ? username.value.charAt(0).toUpperCase() : "A";
});

const settingStore = useSettingStore();
const showModalSetting = ref(false);

// Default sidebar dalam kondisi menciut (collapse)
const isCollapsed = ref(true);

// State untuk mengontrol buka/tutup accordion
const isMenuLaporanOpen = ref(false);
const isMenuPengaturanOpen = ref(false);
const isMenuLandingOpen = ref(false); // State baru accordion Landing Page

defineProps({
  menuAktif: {
    type: String,
    default: "dashboard",
  },
});

const emit = defineEmits(["gantiMenu", "bukaMenuLaporan", "bukaMenuHutang", "bukaPengaturanWA", "bukaStokOpname", "open-setting", "bukaUserManagement", "bukaResetPassword", "logout"]);

// Fungsi modal untuk pengaturan apotek
const bukaModal = () => {
  emit("open-setting");
};

// HANDLER TOGGLE LAPORAN
const handleToggleLaporan = () => {
  if (isCollapsed.value) {
    isCollapsed.value = false;
    isMenuLaporanOpen.value = true;
  } else {
    isMenuLaporanOpen.value = !isMenuLaporanOpen.value;
  }
  emit("gantiMenu", "laporan-penjualan");
};

// HANDLER TOGGLE KELOLA LANDING PAGE
const handleToggleLanding = () => {
  if (isCollapsed.value) {
    isCollapsed.value = false;
    isMenuLandingOpen.value = true;
  } else {
    isMenuLandingOpen.value = !isMenuLandingOpen.value;
  }
  emit("gantiMenu", "landing-hero");
};

const handleConfirmLogout = () => {
  isModalConfirmOpen.value = false;
  emit("logout");
};
</script>
