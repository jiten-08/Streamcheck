import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { UserProfile } from "@/features/auth/types"
import { tokenStorage } from "@/services/auth/tokenStorage"

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticated: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    signedOut: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { authenticated, signedOut } = authSlice.actions
export const authReducer = authSlice.reducer

