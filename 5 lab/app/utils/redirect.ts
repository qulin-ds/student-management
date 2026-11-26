export function loginDestination(value: unknown) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\x00-\x20]/.test(value)
  ) {
    return '/students'
  }

  try {
    const decoded = decodeURIComponent(value)

    if (
      decoded.startsWith('//') ||
      /[\\\x00-\x20]/.test(decoded) ||
      /^\/(login|register)(?:[/?#]|$)/i.test(decoded)
    ) {
      return '/students'
    }

    const parsed = new URL(value, 'http://nuxt.local')

    if (/^\/(login|register)(?:\/|$)/i.test(parsed.pathname)) {
      return '/students'
    }

    return parsed.origin === 'http://nuxt.local'
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : '/students'
  } catch {
    return '/students'
  }
}
