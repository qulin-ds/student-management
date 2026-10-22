// Назначение: собрать Vue-приложение; вход — #app из index.html, выход — смонтированный App.vue.
// TODO: После реализации auth store определить порядок восстановления сессии до проверки маршрутов.
// Не выполнять запросы студентов здесь: их запускает StudentsPage через stores/students.js.
// API: восстановление через POST /api/auth/refresh и GET /api/auth/me; роли USER/ADMIN.
// Проверка: npm run dev, переходы без перезагрузки; приложение запускается без backend.
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'

createApp(App).use(createPinia()).use(router).mount('#app')
