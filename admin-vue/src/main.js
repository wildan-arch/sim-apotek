import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { vDebounceClick } from "./directives/vDebounceClick";

import "./style.css";

const app = createApp(App);

// Pasang Pinia Store secara global
const pinia = createPinia();
app.use(pinia);
app.directive("debounce-click", vDebounceClick);

// Mount aplikasi ke HTML
app.mount("#app");
