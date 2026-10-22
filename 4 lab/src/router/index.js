// Назначение: URL → страница; вход — location/params.isu, выход — компонент в App.vue.
// TODO: Добавить beforeEach с stores/auth.js после реализации восстановления сессии.
// requiresAuth и roles ниже — только описание будущих правил, сейчас проверки НЕ работают.
// TODO: Неавторизованного направлять /login с returnTo (разрешать только локальный путь).
// TODO: Дождаться единственного refresh, получить GET /api/auth/me {username,role}; USER/ADMIN читают,
// ADMIN создаёт/редактирует. Сервер всё равно проверяет /api/user/** и /api/admin/**.
// TODO: При 403 показать понятный отказ; не выдавать его за 404 и не зацикливать редиректы.
// Проверка: прямые URL, кнопки назад/вперёд, неизвестный путь, USER на /students/new после реализации.
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import StudentsPage from '../pages/StudentsPage.vue'
import StudentPage from '../pages/StudentPage.vue'
import StudentCreatePage from '../pages/StudentCreatePage.vue'
import StudentEditPage from '../pages/StudentEditPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/students' },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
    { path: '/students', component: StudentsPage, meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] } },
    { path: '/students/new', component: StudentCreatePage, meta: { requiresAuth: true, roles: ['ADMIN'] } },
    { path: '/students/:isu', component: StudentPage, props: true, meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] } },
    { path: '/students/:isu/edit', component: StudentEditPage, props: true, meta: { requiresAuth: true, roles: ['ADMIN'] } },
    { path: '/:pathMatch(.*)*', component: NotFoundPage },
  ],
})
