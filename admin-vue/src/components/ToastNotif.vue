<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="toastStore.show"
      class="fixed bottom-5 right-5 z-999999999 flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-2xl text-sm font-medium border border-white/10"
      :class="toastStore.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'"
    >
      <span>{{ toastStore.type === "success" ? "✅" : "⚠️" }}</span>
      <span>{{ toastStore.message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { useToastStore } from "@/stores/toastStore";
const toastStore = useToastStore();
</script>
