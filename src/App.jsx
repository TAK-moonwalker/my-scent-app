import { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/RecipeList'; // Your main app page

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}