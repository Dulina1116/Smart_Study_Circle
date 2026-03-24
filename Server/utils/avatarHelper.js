const formatAvatarUrl = (url) => {
  if (!url) return ''
  const value = String(url).trim()
  if (!value) return ''

  // If it's already a full URL, return it
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  // Preserve data URIs
  if (value.startsWith('data:')) {
    return value
  }

  // If it's a relative path starting with /, return as is
  if (value.startsWith('/')) {
    return value
  }

  // Handle legacy values like "uploads/file.jpg" or "profile-*.jpg".
  if (value.startsWith('uploads/')) {
    return `/${value}`
  }
  if (value.startsWith('profile-')) {
    return `/uploads/${value}`
  }

  return ''
}

const normalizeAvatar = (avatar, profilePicture) => {
  const rawAvatar = avatar ? String(avatar) : ''
  // Avoid returning very large base64 payloads in list/chat APIs.
  if (rawAvatar.startsWith('data:')) {
    return formatAvatarUrl(profilePicture)
  }
  return formatAvatarUrl(rawAvatar || profilePicture || '')
}

export { formatAvatarUrl, normalizeAvatar }
