import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Chip, Fab, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';


export default function RecipeList(){
const [user] = useAuthState(auth);
const nav = useNavigate();
const q = user ? query(collection(db,'recipes'), where('createdBy','==', user.uid), orderBy('updatedAt','desc')) : null;
const [snap] = useCollection(q);
return (
<Box p={3}>
<Grid container spacing={2}>
{snap?.docs.map(doc=>{
const r = doc.data();
return (
<Grid item key={doc.id} xs={12} sm={6} md={4} lg={3}>
<Card onClick={()=>nav(`/r/${doc.id}`)} sx={{ cursor:'pointer' }}>
<CardMedia sx={{ height:160, bgcolor:'grey.900' }} image={r.coverUrl || '/placeholder-dark.png'} />
<CardContent>
<Typography variant="h6">{r.title || 'Untitled'}</Typography>
<Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
{(r.tags||[]).slice(0,3).map(t=> (
<Chip key={t} size="small" label={t} color="primary" variant="outlined" />
))}
</Stack>
<Typography variant="body2" color="text.secondary" mt={1}>
{(r.status || 'draft')} • {(r.totalVolume_ml || 0)} ml
</Typography>
</CardContent>
</Card>
</Grid>
);
})}
</Grid>


<Fab color="primary" sx={{ position:'fixed', right:24, bottom:24 }} onClick={()=>nav('/r/new')}>
<AddIcon />
</Fab>
</Box>
);
}