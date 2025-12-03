import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AdminUser {
  id: string
  uid: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface AuthState {
  admin: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  admin: null,
  isAuthenticated: false,
  isLoading: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<AdminUser | null>) => {
      state.admin = action.payload
      state.isAuthenticated = !!action.payload
      state.isLoading = false
    },
    logout: (state) => {
      state.admin = null
      state.isAuthenticated = false
      state.isLoading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setAdmin, logout, setLoading } = authSlice.actions
export default authSlice.reducer
