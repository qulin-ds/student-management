export default defineNuxtPlugin((app) => {
  const { user } = useAuth()
  const { api, invalidate } = useStudents()
  const base = useRuntimeConfig().public.apiBase

  app.hook('app:mounted', () => {
    watch(() => user.value?.username, (username, _previous, onCleanup) => {
      if (!username) return

      const connection = new AbortController()
      let version: string | undefined
      let polling: ReturnType<typeof setInterval> | undefined
      let pollInFlight = false
      const stream = typeof EventSource === 'undefined'
        ? undefined
        : new EventSource(`${base}/user/students/events`)

      function applyVersion(next: string) {
        if (connection.signal.aborted || version === next) return
        version = next
        void invalidate().catch((cause: unknown) => {
          console.warn('Не удалось обновить данные студентов:', cause)
        })
      }

      async function poll() {
        if (pollInFlight) return
        pollInFlight = true
        try {
          const { version } = await api<{ version: string }>('/user/students/version', {
            signal: connection.signal,
            timeout: 8_000,
          })
          applyVersion(version)
        } catch {
          // A later poll or SSE reconnection can recover the missed update.
        } finally {
          pollInFlight = false
        }
      }

      function startPolling() {
        if (polling !== undefined) return
        void poll()
        polling = setInterval(poll, 5_000)
      }

      function stopPolling() {
        clearInterval(polling)
        polling = undefined
      }

      function checkVisible() {
        if (document.visibilityState === 'visible') void poll()
      }

      stream?.addEventListener('students-version', (event: MessageEvent<string>) => {
        stopPolling()
        applyVersion(event.data)
      })
      stream?.addEventListener('error', startPolling)
      if (!stream) startPolling()
      document.addEventListener('visibilitychange', checkVisible)

      onCleanup(() => {
        connection.abort()
        stream?.close()
        stopPolling()
        document.removeEventListener('visibilitychange', checkVisible)
      })
    }, { immediate: true })
  })
})
