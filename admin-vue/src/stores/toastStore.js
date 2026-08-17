import { defineStore } from "pinia";

export const useToastStore = defineStore("toast", {
  state: () => ({
    show: false,
    message: "",
    type: "success", // 'success' atau 'error'
  }),
  actions: {
    trigger(message, type = "success") {
      this.message = message;
      this.type = type;
      this.show = true;

      setTimeout(() => {
        this.show = false;
      }, 3000);
    },
  },
});
