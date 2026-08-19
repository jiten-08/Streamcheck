const ACCESS_TOKEN_KEY = "streamcheck.accessToken"
const REFRESH_TOKEN_KEY = "streamcheck.refreshToken"

type TokenStore = Pick<Storage, "getItem" | "setItem" | "removeItem">

function clearStore(store: TokenStore) {
  store.removeItem(ACCESS_TOKEN_KEY)
  store.removeItem(REFRESH_TOKEN_KEY)
}

function activeStore(): TokenStore {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) ? sessionStorage : localStorage
}

export const tokenStorage = {
  getAccessToken: () =>
    sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () =>
    sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string, remember = true) => {
    clearStore(localStorage)
    clearStore(sessionStorage)
    const store = remember ? localStorage : sessionStorage
    store.setItem(ACCESS_TOKEN_KEY, accessToken)
    store.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  setRefreshedTokens: (accessToken: string, refreshToken?: string) => {
    const store = activeStore()
    store.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) store.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clear: () => {
    clearStore(localStorage)
    clearStore(sessionStorage)
  },
  clearAccessTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  },
}
