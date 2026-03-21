/**
 * Auth utility helpers — centralise localStorage reads/writes so
 * Verify.jsx, LoginPage.jsx and dashboards all use the same keys.
 */

/** Persist a JWT token and the user object returned by the API */
export const saveAuth = (token, user) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

/** Remove auth data (call on logout) */
export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/** Return the parsed user object, or null if not logged in */
export const getUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Return true if a valid token + user is stored */
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token') && getUser())
}
