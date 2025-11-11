// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { theme } from './theme';

import { UserProvider } from './context/UserContext';
import { useUser } from './context/useUser';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import RecipeList from './pages/RecipeList';
import AddRecipe from './pages/AddRecipe';
import RecipeEditor from './pages/RecipeEditor';
import RecipeView from './pages/RecipeView';
import AppShell from './layout/AppShell';

// ---------- Protected Route ----------
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // ⛔️ Not logged in → go to SignUp (as requested)
  if (!isAuthenticated) return <Navigate to="/signup" replace />;

  return children;
}

// ---------- Routes ----------
function AppRoutes() {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
 // App.jsx (only the Routes part shown)
<Routes>
  {/* App shell wraps everything */}
  <Route element={<AppShell />}>
    {/* Auth pages: if already logged in, bounce to home */}
    <Route path="/signin" element={isAuthenticated ? <Navigate to="/" replace /> : <SignIn />} />
    <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <SignUp />} />

    {/* Protected recipe routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <RecipeList />
        </ProtectedRoute>
      }
    />
    <Route
      path="/add"
      element={
        <ProtectedRoute>
          <AddRecipe />
        </ProtectedRoute>
      }
    />
    <Route
      path="/r/:id/view"
      element={
        <ProtectedRoute>
          <RecipeView />
        </ProtectedRoute>
      }
    />
    <Route
      path="/r/:id/edit"
      element={
        <ProtectedRoute>
          <RecipeEditor />
        </ProtectedRoute>
      }
    />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route>
</Routes>

  );
}

// ---------- App ----------
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}
