import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, setToken } from './store/slices/authSlice';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import ChallanList from './components/challan/ChallanList';
import CompanySettings from './components/settings/CompanySettings';
import SupplierList from './components/supplier/SupplierList';
import Layout from './components/layout/Layout';
import { CircularProgress, Box } from '@mui/material';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const storedToken = localStorage.getItem('userToken');
  
  // Allow access if either Redux state has auth info or localStorage has token
  if ((!user || !token) && !storedToken) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for stored token immediately
    const storedToken = localStorage.getItem('userToken');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Get fresh token
          const token = await user.getIdToken(true); // Force refresh token
          
          dispatch(setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }));
          dispatch(setToken(token));
        } else if (!storedToken) {
          // Only clear auth if there's no stored token
          dispatch(setUser(null));
          dispatch(setToken(null));
        }
      } catch (error) {
        console.error('Error during auth state change:', error);
        // Handle token refresh error if needed
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Show loading spinner while checking auth state
  if (isInitializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challans"
            element={
              <ProtectedRoute>
                <ChallanList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <SupplierList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <CompanySettings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
