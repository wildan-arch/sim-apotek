<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ArrowUp } from "lucide-vue-next";

const showButton = ref(false);

// Cek posisi scroll layar
const handleScroll = () => {
  showButton.value = window.scrollY > 300;
};

// Scroll halus ke paling atas
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <button
      v-show="showButton"
      type="button"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 z-50 p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      aria-label="Kembali ke atas"
    >
      <ArrowUp class="w-5 h-5" />
    </button>
  </Transition>
</template>
