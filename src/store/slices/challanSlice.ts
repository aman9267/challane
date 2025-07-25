import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Challan {
  id: string;
  userId: string;
  challanNumber: number;
  date: string;
  products: Product[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
}

export interface ChallanState {
  challans: Challan[];
  currentChallan: Challan | null;
  lastChallanNumber: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChallanState = {
  challans: [],
  currentChallan: null,
  lastChallanNumber: 0,
  isLoading: false,
  error: null,
};

const challanSlice = createSlice({
  name: 'challan',
  initialState,
  reducers: {
    setChallans: (state, action: PayloadAction<Challan[]>) => {
      state.challans = action.payload;
      state.lastChallanNumber = action.payload.reduce(
        (max, challan) => Math.max(max, challan.challanNumber),
        0
      );
    },
    addChallan: (state, action: PayloadAction<Challan>) => {
      state.challans.push(action.payload);
      state.lastChallanNumber = Math.max(state.lastChallanNumber, action.payload.challanNumber);
    },
    updateChallan: (state, action: PayloadAction<Challan>) => {
      const index = state.challans.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.challans[index] = action.payload;
      }
    },
    deleteChallan: (state, action: PayloadAction<string>) => {
      state.challans = state.challans.filter(c => c.id !== action.payload);
    },
    setCurrentChallan: (state, action: PayloadAction<Challan | null>) => {
      state.currentChallan = action.payload;
    },
    setLastChallanNumber: (state, action: PayloadAction<number>) => {
      state.lastChallanNumber = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChallans,
  addChallan,
  updateChallan,
  deleteChallan,
  setCurrentChallan,
  setLastChallanNumber,
  setLoading,
  setError,
} = challanSlice.actions;

export default challanSlice.reducer; 