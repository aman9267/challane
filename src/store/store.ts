import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import companyReducer from './slices/companySlice';
import challanReducer from './slices/challanSlice';
import supplierReducer from './slices/supplierSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
    challan: challanReducer,
    supplier: supplierReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 