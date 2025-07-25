import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  AuthError,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase/config";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setError,
  clearError,
} from "../../store/slices/authSlice";
import { RootState } from "../../store/store";
import {
  Button,
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Link,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const getErrorMessage = (error: AuthError) => {
  switch (error.code) {
    case "auth/configuration-not-found":
      return "Authentication configuration error. Please make sure Google sign-in is enabled in Firebase Console and OAuth consent screen is configured.";
    case "auth/popup-blocked":
      return "Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled. Please try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google sign-in. Please add localhost to authorized domains in Firebase Console.";
    case "auth/argument-error":
      return "There was a problem with the sign-in configuration. Please try again.";
    default:
      return `${error.code}: ${error.message}`;
  }
};

const Login: React.FC = () => {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // // Handle successful authentication
  // const handleAuthSuccess = async (user: any) => {
  //   try {
  //     // Get the user token
  //     const token = await user.getIdToken();

  //     // Save user info and token
  //     dispatch(
  //       setUser({
  //         uid: user.uid,
  //         email: user.email,
  //         displayName: user.displayName,
  //       })
  //     );
  //     dispatch(setToken(token));

  //     navigate("/");
  //   } catch (error) {
  //     console.error("Error getting user token:", error);
  //     dispatch(setError("Failed to get user token. Please try again."));
  //   }
  // };

  const handleGoogleLogin = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      // First try popup
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Sign-in successful:", result.user);
        await handleAuthSuccess(result.user);
      } catch (popupError: any) {
        console.log("Popup sign-in failed, trying redirect...", popupError);

        // If popup fails, try redirect
        if (
          popupError.code === "auth/popup-blocked" ||
          popupError.code === "auth/argument-error"
        ) {
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      const authError = error as AuthError;
      console.log("Error code:", authError.code);
      console.log("Error message:", authError.message);
      dispatch(setError(getErrorMessage(authError)));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Stable handleAuthSuccess function
  const handleAuthSuccess = useCallback(
    async (user?: any) => {
      try {
        console.log("Handling successful auth:", user);
        // Do something with user or navigation here
        navigate("/dashboard");
      } catch (error) {
        console.error("Error handling auth:", error);
      }
    },
    [navigate]
  ); // include dependencies if used inside this function

  React.useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Redirect sign-in successful:", result.user);
          await handleAuthSuccess(result.user);
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        const authError = error as AuthError;
        dispatch(setError(getErrorMessage(authError)));
      }
    };

    checkRedirectResult();
  }, [dispatch, handleAuthSuccess]); // navigate already inside handleAuthSuccess

  // ✅ Optional: run once if needed
  React.useEffect(() => {
    handleAuthSuccess();
  }, [handleAuthSuccess]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", mt: 2 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Welcome to Challan App
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Please sign in to continue
          </Typography>
          <Button
            fullWidth
            variant="contained"
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <GoogleIcon />
              )
            }
            onClick={handleGoogleLogin}
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
          {error && error.includes("configuration") && (
            <Typography
              variant="body2"
              color="error"
              align="center"
              sx={{ mt: 2 }}
            >
              Admin: Please configure:
              <br />
              1.{" "}
              <Link
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Enable Google Auth in Firebase
              </Link>
              <br />
              2.{" "}
              <Link
                href="https://console.cloud.google.com/apis/credentials/consent"
                target="_blank"
                rel="noopener noreferrer"
              >
                Set up OAuth Consent Screen
              </Link>
            </Typography>
          )}
        </Paper>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => dispatch(clearError())}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
