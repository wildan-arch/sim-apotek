import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import "./style.css";

const app = createApp(App);
    
// Pasang Pinia Store secara global
const pinia = createPinia();
app.use(pinia);

// Mount aplikasi ke HTML
app.mount("#app");
