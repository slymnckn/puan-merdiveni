const normalizeBasePath = (basePath: string | undefined) => {
  if (!basePath) return ""
  if (basePath === "/") return ""
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath
}

const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

export const getAssetPath = (path: string) => {
  if (!path) return path
  if (/^(https?:)?\/\//.test(path)) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (!BASE_PATH) return normalized
  if (normalized.startsWith(`${BASE_PATH}/`) || normalized === BASE_PATH) {
    return normalized
  }
  return `${BASE_PATH}${normalized}`
}
