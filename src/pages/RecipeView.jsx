import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContextProvider';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Stack,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function RecipeView() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useContext(UserContext);

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customVolume, setCustomVolume] = useState(null);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setError('');
        const snap = await getDoc(doc(db, 'recipes', id));
        if (!snap.exists()) {
          setError('Recipe not found.');
          setLoading(false);
          return;
        }
        setRecipe({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [id]);

  if (loading) {
    return (
      <Box
        p={3}
        display="grid"
        alignItems="center"
        justifyContent="center"
        minHeight="60dvh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => nav('/')}>
          Back to list
        </Button>
      </Box>
    );
  }

  if (!recipe) return null;

  const createdAt = recipe.createdAt?.toDate?.()
    ? recipe.createdAt.toDate().toLocaleString()
    : '—';

  const ingredients = recipe.ingredients || [];
  const totalParts = ingredients.reduce((s, i) => s + (Number(i.parts) || 0), 0);

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* === Left Column === */}
        <Grid item xs={12} md={8}>
          <Card>
            {recipe.coverUrl && (
              <Box
                sx={{
                  height: 240,
                  overflow: 'hidden',
                  bgcolor: 'grey.900',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <img
                  src={recipe.coverUrl}
                  alt={recipe.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {recipe.title}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                {recipe.tags &&
                  recipe.tags.map((t) => (
                    <Chip
                      key={t}
                      size="small"
                      label={t}
                      color="success"
                      variant="outlined"
                    />
                  ))}
              </Stack>

              <Typography color="text.secondary" variant="body2" gutterBottom>
                Created: {createdAt}
              </Typography>

              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Calculate Recipe Amount
                </Typography>
                <TextField
                  type="number"
                  label="Total Volume (ml)"
                  value={customVolume ?? recipe.totalVolume_ml}
                  onChange={(e) => setCustomVolume(Number(e.target.value) || null)}
                  fullWidth
                  inputProps={{ step: '0.1', min: '0' }}
                  helperText={`Original recipe: ${recipe.totalVolume_ml} ml`}
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                <b>Status:</b> {recipe.status}
              </Typography>

              {recipe.note && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Notes
                  </Typography>
                  <Box sx={{ 
                    '& h1': { variant: 'h5', mt: 2, mb: 1 },
                    '& h2': { variant: 'h6', mt: 1.5, mb: 0.5 },
                    '& p': { mb: 1 },
                    '& ul, & ol': { pl: 2, mb: 1 },
                    '& code': { bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontFamily: 'monospace' },
                    '& pre': { bgcolor: 'action.hover', p: 1, borderRadius: 1, overflow: 'auto' },
                    '& blockquote': { borderLeft: '4px solid', borderColor: 'primary.main', pl: 2, ml: 0, fontStyle: 'italic' }
                  }}>
                    <ReactMarkdown>{recipe.note}</ReactMarkdown>
                  </Box>
                </Box>
              )}

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Ingredients
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: { xs: 500, sm: 'auto' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: { xs: 32, sm: 'auto' } }}>#</TableCell>
                    <TableCell sx={{ width: { xs: 150, sm: 'auto' }, minWidth: 120 }}>Material</TableCell>
                    <TableCell align="right" sx={{ width: { xs: 70, sm: 'auto' } }}>%</TableCell>
                    <TableCell align="right" sx={{ width: { xs: 100, sm: 'auto' } }}>Amount (ml)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ingredients.map((i, idx) => {
                    const pct = totalParts
                      ? (i.parts / totalParts) * 100
                      : 0;
                    const displayVolume = customVolume ?? recipe.totalVolume_ml;
                    const ml = (displayVolume * pct) / 100 || 0;
                    return (
                      <TableRow key={i.id || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{i.materialName}</TableCell>
                        <TableCell align="right">{pct.toFixed(2)}</TableCell>
                        <TableCell align="right">{ml.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </Box>
            </CardContent>
          </Card>

          <Box mt={2} display="flex" gap={1}>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => nav('/')}
            >
              Back
            </Button>
            {user && user.uid === recipe.createdBy && (
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                color="primary"
                onClick={() => nav(`/r/${id}/edit`)}
              >
                Edit
              </Button>
            )}
          </Box>
        </Grid>

        {/* === Right Column (optional info) === */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Summary
              </Typography>
              <Typography mt={1}>
                Total Volume: <b>{customVolume ?? recipe.totalVolume_ml} ml</b>
              </Typography>
              <Typography>
                Ingredients: <b>{ingredients.length}</b>
              </Typography>
              <Typography>
                Owner: <b>{recipe.createdByName}</b>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
