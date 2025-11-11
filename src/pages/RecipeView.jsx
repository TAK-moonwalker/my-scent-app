import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContextProvider';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
  Stack
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

              <Typography variant="body1" sx={{ mb: 2 }}>
                <b>Total Volume:</b> {recipe.totalVolume_ml} ml
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                <b>Status:</b> {recipe.status}
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Ingredients
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Material</TableCell>
                    <TableCell>Parts</TableCell>
                    <TableCell>%</TableCell>
                    <TableCell>Amount (ml)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ingredients.map((i, idx) => {
                    const pct = totalParts
                      ? (i.parts / totalParts) * 100
                      : 0;
                    const ml =
                      (recipe.totalVolume_ml * pct) / 100 || 0;
                    return (
                      <TableRow key={i.id || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{i.materialName}</TableCell>
                        <TableCell>{i.parts}</TableCell>
                        <TableCell>{pct.toFixed(2)}</TableCell>
                        <TableCell>{ml.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                Total parts: <b>{totalParts}</b>
              </Typography>
              <Typography>
                Ingredients: <b>{ingredients.length}</b>
              </Typography>
              <Typography>
                Owner: <b>{recipe.createdBy}</b>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
