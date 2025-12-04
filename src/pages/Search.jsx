import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContextProvider';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Search() {
  const nav = useNavigate();
  const { isAuthenticated } = useContext(UserContext);
  const [recipeId, setRecipeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!recipeId.trim()) {
      setError('Please enter a recipe ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!isAuthenticated) {
        setError('Please sign in to search recipes');
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, 'recipes', recipeId.trim()));

      if (!snap.exists()) {
        setError('Recipe not found');
        setLoading(false);
        return;
      }

      const recipe = snap.data();
      
      // Check if recipe is private and user is not the owner
      if (recipe.isPublic === false) {
        setError('🔒 This recipe is private. Only the owner can view it.');
        setLoading(false);
        return;
      }

      // Navigate to recipe view
      nav(`/r/${recipeId.trim()}/view`);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Error searching for recipe');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        {/* Logo / Title */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: 'text.primary',
              fontSize: { xs: 'h4.fontSize', sm: 'h3.fontSize' },
            }}
          >
            My Scent App
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
            Find and view public recipes
          </Typography>
        </Box>

        {/* Search Form */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 3,
          }}
        >
          {/* Search Input */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'background.paper',
              borderRadius: '24px',
              border: '1px solid',
              borderColor: 'divider',
              px: 2,
              py: 0.5,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 1px 8px rgba(0, 0, 0, 0.15)',
              },
              '&:focus-within': {
                border: '1px solid',
                borderColor: 'primary.main',
                boxShadow: '0 1px 6px rgba(33, 150, 243, 0.3)',
              },
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary' }} />
            <TextField
              fullWidth
              placeholder="Enter recipe ID to search..."
              value={recipeId}
              onChange={(e) => {
                setRecipeId(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                '& .MuiInput-root': {
                  fontSize: '1rem',
                },
              }}
            />
          </Box>

          {/* Error Message */}
          {error && (
            <Alert 
              severity={error.includes('private') ? 'warning' : 'error'} 
              sx={{ borderRadius: 1 }}
            >
              {error.includes('private') ? (
                <>
                  <strong>🔒 Recipe is Private</strong><br />
                  <span style={{ fontSize: '0.9em' }}>Only the owner can view this recipe. Try searching for a public recipe instead.</span>
                </>
              ) : error.includes('not found') ? (
                <>
                  <strong>❌ Recipe Not Found</strong><br />
                  <span style={{ fontSize: '0.9em' }}>The recipe ID you entered doesn't exist. Please check and try again.</span>
                </>
              ) : (
                error
              )}
            </Alert>
          )}

          {/* Search Button */}
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !recipeId.trim()}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              py: 1,
              borderRadius: '4px',
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search Recipe'}
          </Button>
        </Box>

        {/* Tips Section */}
        <Box
          sx={{
            mt: 4,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            💡 How to use:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            • Paste a recipe ID in the search box<br />
            • Press Enter or click "Search Recipe"<br />
            • You can view your own recipes and public recipes shared by others
          </Typography>
        </Box>

        {/* Navigation Link */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => nav('/')}
            sx={{ textTransform: 'none' }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
