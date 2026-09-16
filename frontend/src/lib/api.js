const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

// The backend validates every write with zod and never trusts the client —
// this turns its structured issue list into one readable sentence instead of
// the generic "Validation failed", so a rule the client-side form missed
// (or a request made outside the form entirely) still surfaces clearly.
// Every user-facing field schema carries its own plain-English zod message
// (e.g. "Name is required."), so the sentence is just those joined; a field
// with no custom message falls back to `field: <zod's message>` so it's at
// least still traceable to something.
function describeValidationError(body) {
  if (!Array.isArray(body?.details) || body.details.length === 0) return null
  return body.details
    .map((issue) => (issue.message?.endsWith('.') ? issue.message : `${issue.path?.join('.')}: ${issue.message}`))
    .join(' ')
}

export async function apiFetch(path, { token, headers, ...options } = {}) {
  // Let the browser set the multipart boundary itself for FormData bodies.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null

  if (!res.ok) {
    const message = describeValidationError(body) ?? body?.error ?? res.statusText
    throw new ApiError(message, res.status, body?.details)
  }

  return body
}
