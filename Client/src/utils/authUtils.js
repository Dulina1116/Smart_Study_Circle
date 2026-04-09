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

/** Return true if a valid token + user is stored and not expired */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  const user = getUser()
  return Boolean(token && user && !isTokenExpired(token))
}

/** 
 * Checks if a JWT token is expired.
 * Does not verify signature, just reads the 'exp' claim.
 */
export const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const { exp } = JSON.parse(jsonPayload)
    if (!exp) return false // No exp claim, technically not expired

    const now = Math.floor(Date.now() / 1000)
    return exp < now
  } catch (error) {
    console.error('Error decoding token:', error)
    return true
  }
}
