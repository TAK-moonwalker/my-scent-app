import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/firebase';
import { collection, query, where, orderBy, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Box, Grid, Fab, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import EmptyState from './components/EmptyState';
import RecipeCard from './components/RecipeCard';
import ConfirmDialog from './components/ConfirmDialog';
import { useState, useCallback } from 'react';

export default function RecipeList() {
  const [user, loadingAuth] = useAuthState(auth);
  const nav = useNavigate();

  // Query only when user is available
  const q = user
    ? query(
        collection(db, 'recipes'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
    : null;

  const [snap, loadingCol, errorCol] = useCollection(q);

  // Delete dialog state
  const [toDelete, setToDelete] = useState(null); // { id, title } or null
  const [deleting, setDeleting] = useState(false);

  const handleCreate = () => nav('/add');
  const handleOpen = (id) => nav(`/r/${id}/view`);
  const handleEdit = (id) => nav(`/r/${id}/edit`);

  // If you use ingredients as a subcollection, this helper also removes it.
  const deleteRecipeFully = useCallback(async (recipeId) => {
    // OPTIONAL: delete subcollection "ingredients" if you use that schema.
    const ingCol = collection(db, 'recipes', recipeId, 'ingredients');
    const ingSnap = await getDocs(ingCol);
    const deletions = [];
    ingSnap.forEach((d) => deletions.push(deleteDoc(doc(db, 'recipes', recipeId, 'ingredients', d.id))));
    await Promise.all(deletions);

    // Delete the recipe doc
    await deleteDoc(doc(db, 'recipes', recipeId));
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      await deleteRecipeFully(toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loadingAuth || loadingCol) {
    return (
      <Box p={3} display="grid" alignItems="center" justifyContent="center" minHeight="60dvh">
        <CircularProgress />
      </Box>
    );
  }

  if (errorCol) {
    return (
      <Box p={3}>
        Error loading recipes: {String(errorCol.message || errorCol)}
      </Box>
    );
  }

  const docs = snap?.docs ?? [];

  return (
    <Box p={3}>
      {docs.length === 0 ? (
        <EmptyState
          title="No recipes yet"
          description="Create your first perfume recipe. Add ingredients as parts, set total volume, and we’ll calculate % and ml automatically."
          actionLabel="Create recipe"
          onAction={handleCreate}
          icon={<AddIcon fontSize="large" />}
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {docs.map((d) => {
              const r = d.data();
              return (
                <Grid item key={d.id} xs={12} sm={6} md={4} lg={3}>
                  <RecipeCard
                    id={d.id}
                    title={r.title || 'Untitled'}
                    coverUrl={r.coverUrl}
                    createdAt={r.createdAt?.toDate?.() || null}
                    onOpen={() => handleOpen(d.id)}
                    onEdit={() => handleEdit(d.id)}
                    onDelete={() => setToDelete({ id: d.id, title: r.title || 'Untitled' })}
                  />
                </Grid>
              );
            })}
          </Grid>

          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
             onClick={() => nav('/add')}
          >
            <AddIcon />
          </Fab>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete recipe?"
        content={
          toDelete
            ? `This will permanently delete “${toDelete.title}”.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        confirmColor="error"
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        disabled={deleting}
      />
    </Box>
  );
}
