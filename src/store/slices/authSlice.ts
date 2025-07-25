import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

// Get initial token from localStorage
const initialToken = localStorage.getItem('userToken');

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  token: initialToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      // Save token to localStorage
      if (action.payload) {
        localStorage.setItem('userToken', action.payload);
      } else {
        localStorage.removeItem('userToken');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
      // Remove token from localStorage
      localStorage.removeItem('userToken');
    },
  },
});

export const { setUser, setToken, setLoading, setError, clearError, logout } = authSlice.actions;
export default authSlice.reducer; 