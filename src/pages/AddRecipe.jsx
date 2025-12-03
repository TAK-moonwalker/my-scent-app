import { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContextProvider';

import { db, storage } from '../firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  Box, Grid, Card, CardContent, TextField, Button, Typography,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert,
  FormControlLabel, Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IngredientTable from './components/IngredientTable';

function uuid() {
  // crypto.randomUUID works in modern browsers; fallback for older envs
  return (crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
}

export default function AddRecipe() {
  const { user, loading } = useContext(UserContext);
  const nav = useNavigate();

  const [title, setTitle] = useState('');
  const [totalVolume, setTotalVolume] = useState(500);
  const [status, setStatus] = useState('draft');
  const [tags, setTags] = useState('');
  const [note, setNote] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [error, setError] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [ingredients, setIngredients] = useState([
    { id: uuid(), materialName: 'Ethanol', percentage: 45 },
    { id: uuid(), materialName: 'Calone (10%)', percentage: 12 },
  ]);

  const totalPercentage = useMemo(
    () => ingredients.reduce((s, i) => s + (Number(i.percentage) || 0), 0),
    [ingredients]
  );

  const rows = useMemo(() => {
    return ingredients.map((i) => {
      const ml = (totalVolume * (Number(i.percentage) || 0)) / 100;
      return { ...i, percentage: Number(i.percentage) || 0, amount_ml: ml };
    });
  }, [ingredients, totalVolume]);

  const onUpload = async (file) => {
    try {
      setError('');
      if (!user) throw new Error('You must be signed in to upload.');
      const rid = 'new'; // temporary folder until the recipe is saved
      const r = ref(storage, `recipes/${user.uid}/${rid}/${file.name}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      setCoverUrl(url);
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  const addRow = () =>
    setIngredients((prev) => [...prev, { id: uuid(), materialName: '', parts: 0 }]);

  const save = async () => {
    try {
      setError('');
      if (!user) throw new Error('You must be signed in.');

      const recipeId = uuid(); // create id here; we store entire recipe in one doc
      const payload = {
        title: title.trim() || 'Untitled',
        totalVolume_ml: Number(totalVolume) || 0,
        status,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        note: note.trim() || '',
        coverUrl: coverUrl || '',
        isPublic,
        ingredients: ingredients.map((x) => ({
          id: x.id,
          materialName: x.materialName || '',
          percentage: Number(x.percentage) || 0,
        })),
        createdBy: user.uid,
        createdByName: user.displayName || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'recipes', recipeId), payload, { merge: true });

      // If you prefer to move the uploaded cover from 'new' temp path, you could reupload after you know recipeId.
      // For simplicity we keep the original URL.

      nav(`/r/${recipeId}`, { replace: true });
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  if (loading) {
    return <Box p={3}><Typography>Loading…</Typography></Box>;
  }
  if (!user) {
    return <Box p={3}><Alert severity="warning">Please sign in to create a recipe.</Alert></Box>;
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" mb={2}>Create recipe</Typography>

              {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total volume (ml)"
                    value={totalVolume}
                    onChange={(e) => setTotalVolume(Number(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="draft | final"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                      />
                    }
                    label="Make recipe public"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tags (comma)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="marine,fresh"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes (Markdown supported)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write notes in Markdown format. **bold**, *italic*, `code`, # Heading, etc."
                    helperText="You can use Markdown syntax for formatting"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button component="label" fullWidth>
                    {coverUrl ? 'Change cover' : 'Upload cover'}
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && onUpload(e.target.files[0])}
                    />
                  </Button>
                </Grid>
                {coverUrl ? (
                  <Grid item xs={12}>
                    <img
                      alt="cover"
                      src={coverUrl}
                      style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12 }}
                    />
                  </Grid>
                ) : null}
              </Grid>

         <IngredientTable rows={rows} setIngredients={setIngredients} />

              <Box mt={2} display="flex" gap={1}>
                <Button onClick={addRow}>Add ingredient</Button>
                <Button color="primary" onClick={save}>Create</Button>
                <Button variant="outlined" onClick={() => nav('/')}>Cancel</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Totals
              </Typography>
              <Typography mt={1}>
                Total %: <b>{totalPercentage.toFixed(2)}</b>
              </Typography>
              <Typography>
                Target: <b>100%</b>
              </Typography>
              <Typography>
                Rows: <b>{ingredients.length}</b>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
