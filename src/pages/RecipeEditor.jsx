import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContextProvider';

import { db, storage } from '../firebase/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  Box, Grid, Card, CardContent, TextField, Button, Typography,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  CircularProgress, Alert, FormControlLabel, Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';

function uuid() {
  return (crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
}

export default function RecipeEditor() {
  const { id } = useParams();            // /r/:id
  const nav = useNavigate();
  const { user, loading: loadingUser } = useContext(UserContext);

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [title, setTitle]             = useState('');
  const [totalVolume, setTotalVolume] = useState(500);
  const [status, setStatus]           = useState('draft');
  const [tags, setTags]               = useState('');
  const [note, setNote]               = useState('');
  const [coverUrl, setCoverUrl]       = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [isPublic, setIsPublic]       = useState(false);

  // -------- load the recipe --------
  useEffect(() => {
    (async () => {
      try {
        setError('');
        if (!id) throw new Error('Missing recipe id.');
        const snap = await getDoc(doc(db, 'recipes', id));
        if (!snap.exists()) {
          setError('Recipe not found.');
          setLoading(false);
          return;
        }
        const r = snap.data();
        setTitle(r.title || '');
        setTotalVolume(r.totalVolume_ml || 500);
        setStatus(r.status || 'draft');
        setTags((r.tags || []).join(','));
        setNote(r.note || '');
        setCoverUrl(r.coverUrl || '');
        setIsPublic(r.isPublic || false);
        setIngredients(r.ingredients || []);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // -------- derived rows for % and ml --------
  const totalPercentage = useMemo(
    () => ingredients.reduce((s, i) => s + (Number(i.percentage) || 0), 0),
    [ingredients]
  );

  const rows = useMemo(() => (
    ingredients.map((i) => {
      const ml  = (totalVolume * (Number(i.percentage) || 0)) / 100;
      return { ...i, percentage: Number(i.percentage) || 0, amount_ml: ml };
    })
  ), [ingredients, totalVolume]);

  // -------- actions --------
  const addRow = () =>
    setIngredients((prev) => [...prev, { id: uuid(), materialName: '', percentage: 0 }]);

  const removeRow = (rowId) =>
    setIngredients((prev) => prev.filter((x) => x.id !== rowId));

  const onUpload = async (file) => {
    try {
      if (!user) throw new Error('Please sign in.');
      const r = ref(storage, `recipes/${user.uid}/${id}/${file.name}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      setCoverUrl(url);
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  const save = async () => {
    try {
      if (!user) throw new Error('Please sign in.');
      await setDoc(
        doc(db, 'recipes', id),
        {
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
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      nav(-1); // back to list
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  const duplicate = async () => {
    try {
      if (!user) throw new Error('Please sign in.');

      const newRecipeId = uuid();
      const payload = {
        title: (title.trim() || 'Untitled') + ' (Copy)',
        totalVolume_ml: Number(totalVolume) || 0,
        status: 'draft',
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        note: note.trim() || '',
        coverUrl: coverUrl || '',
        isPublic: false, // New duplicate is private by default
        ingredients: ingredients.map((x) => ({
          id: uuid(),
          materialName: x.materialName || '',
          percentage: Number(x.percentage) || 0,
        })),
        createdBy: user.uid,
        createdByName: user.displayName || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'recipes', newRecipeId), payload);
      nav(`/r/${newRecipeId}/edit`, { replace: true });
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  if (loadingUser || loading) {
    return (
      <Box p={3} minHeight="60dvh" display="grid" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => nav('/')}>Back</Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Edit recipe</Typography>
                <IconButton size="small" onClick={duplicate} title="Duplicate recipe">
                  <FileCopyIcon />
                </IconButton>
              </Box>

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

              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell width={40}>#</TableCell>
                    <TableCell width={300}>Material</TableCell>
                    <TableCell width={120}>% (Percentage)</TableCell>
                    <TableCell width={120}>Amount (ml)</TableCell>
                    <TableCell width={64}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, idx) => (
                    <TableRow key={r.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={r.materialName}
                          onChange={(e) =>
                            setIngredients((prev) => {
                              const c = [...prev];
                              c[idx] = { ...c[idx], materialName: e.target.value };
                              return c;
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          value={r.percentage}
                          onChange={(e) =>
                            setIngredients((prev) => {
                              const c = [...prev];
                              c[idx] = { ...c[idx], percentage: Number(e.target.value) || 0 };
                              return c;
                            })
                          }
                          inputProps={{
                            step: '0.1',
                            min: '0',
                            max: '100',
                            style: { MozAppearance: 'textfield', padding: '6px' }
                          }}
                          sx={{
                            '& input[type=number]': {
                              MozAppearance: 'textfield',
                            },
                            '& input[type=number]::-webkit-outer-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                            '& input[type=number]::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>{r.amount_ml.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => removeRow(r.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                <Button onClick={addRow}>Add ingredient</Button>
                <Button color="primary" onClick={save}>Save</Button>
                <Button variant="outlined" onClick={() => nav(-1)}>Cancel</Button>
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
              <Typography mt={1}>Total %: <b>{totalPercentage.toFixed(2)}</b></Typography>
              <Typography>Target: <b>100%</b></Typography>
              <Typography>Rows: <b>{ingredients.length}</b></Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
