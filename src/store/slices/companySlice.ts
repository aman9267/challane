import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CompanyDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  gst?: string;
}

interface CompanyState {
  details: CompanyDetails | null;
  company: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  details: null,
  isLoading: false,
  error: null,
  company: undefined
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompanyDetails: (state, action: PayloadAction<CompanyDetails>) => {
      state.details = action.payload;
    },
    updateCompanyDetails: (
      state,
      action: PayloadAction<Partial<CompanyDetails>>
    ) => {
      if (state.details) {
        state.details = { ...state.details, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCompanyDetails, updateCompanyDetails, setLoading, setError } =
  companySlice.actions;
export default companySlice.reducer;
