import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  gst?: string; // Optional GST number
}

export interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SupplierState = {
  suppliers: [],
  isLoading: false,
  error: null,
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    setSuppliers: (state, action: PayloadAction<Supplier[]>) => {
      state.suppliers = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addSupplier: (state, action: PayloadAction<Supplier>) => {
      state.suppliers.push(action.payload);
    },
    updateSupplier: (state, action: PayloadAction<Supplier>) => {
      const index = state.suppliers.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.suppliers[index] = action.payload;
      }
    },
    deleteSupplier: (state, action: PayloadAction<string>) => {
      state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  setLoading,
  setError,
} = supplierSlice.actions;

export default supplierSlice.reducer; 