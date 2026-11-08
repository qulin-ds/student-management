// Назначение: RxJS-поиск с debounce, отменой fetch и восстановлением потока после ошибок.
import { EMPTY, Observable, Subject, timer } from 'rxjs'
import { catchError, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators'
import { onUnmounted, ref } from 'vue'

export function useStudentSearch(searchFn) {
  const query = ref({})
  const pending = ref(false)
  const error = ref(null)
  const changes = new Subject()

  const subscription = changes
    .pipe(
      distinctUntilChanged((a, b) => !error.value &&
        a.revision === b.revision && JSON.stringify(a.filters) === JSON.stringify(b.filters)),
      // Новое значение сразу отменяет HTTP; задержка относится к следующему запросу.
      switchMap(({ filters }) => {
        pending.value = true
        error.value = null
        return timer(300).pipe(
          switchMap(() => new Observable((observer) => {
            const controller = new AbortController()
            Promise.resolve().then(() => searchFn(filters, controller.signal))
              .then((result) => {
                observer.next(result)
                observer.complete()
              })
              .catch((cause) => {
                if (cause.name === 'AbortError') observer.complete()
                else observer.error(cause)
              })

            return () => controller.abort()
          })),
          catchError((cause) => {
            error.value = cause
            return EMPTY
          }),
          finalize(() => {
            pending.value = false
          }),
        )
      }),
    )
    .subscribe()

  let revision = 0
  function setQuery(filters, force = false) {
    if (force) revision += 1
    query.value = { ...filters }
    changes.next({ filters: query.value, revision })
  }

  onUnmounted(() => {
    subscription.unsubscribe()
    changes.complete()
  })

  return { query, pending, error, setQuery }
}
