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

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

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
    <Routes>
      <Route path="/signin" element={isAuthenticated ? <Navigate to="/" replace /> : <SignIn />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <SignUp />} />
      <Route path="/add" element={<AddRecipe />} />
      <Route path="/r/:id/edit" element={<RecipeEditor />} />
      <Route path="/r/:id/view" element={<RecipeView />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RecipeList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

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