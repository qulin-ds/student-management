<script setup>
// Назначение: координатор списка; вход — события поиска/фильтров/пагинации, выход — store actions и DOM.
// TODO: storeToRefs(useStudentsStore()); onMounted начальный load, не вызывать запросы в шаблоне.
// TODO: SearchInput v-model и StudentFilters props/emits → useStudentSearch; изменение условий page=0.
// TODO: StudentPagination → PageResponse; sort=field,asc|desc; pending/error → индикаторы.
// POST /api/user/students/search: USER/ADMIN, точные ISU/name/group/dormitory/room/is_foreign.
// Нет q/фильтров date/note: не выдавать локальную фильтрацию одной страницы за глобальную.
// TODO: remove(ISU) → подтверждение → students.remove → DELETE /api/admin/students/{isu}, только ADMIN.
// TODO: onUnmounted отмена через composable; пустой результат показывать после успешной загрузки.
// Проверка: пусто, фильтры+sort+page, отмена/успех удаления, 401/403/offline, уход во время запроса.
import { RouterLink } from 'vue-router'
import StudentsTable from '../components/StudentsTable.vue'
import SearchInput from '../components/SearchInput.vue'
import StudentFilters from '../components/StudentFilters.vue'
import StudentPagination from '../components/StudentPagination.vue'
import LoadingIndicator from '../components/LoadingIndicator.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
</script>

<template>
  <section><h2>Студенты — заготовка</h2><RouterLink to="/students/new">Открыть заготовку создания</RouterLink>
    <SearchInput /><StudentFilters /><LoadingIndicator :active="false" /><ErrorMessage :error="null" />
    <StudentsTable /><StudentPagination />
    <!-- TODO: Заменить пример ссылками реальных строк; 100000 не является загруженной записью. -->
    <RouterLink to="/students/100000">Заготовка карточки (пример URL)</RouterLink></section>
</template>
