import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Box, Grid, Card, CardContent, TextField, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { generateRecipePdf } from '../utils/generateReceipePdf';

export default function RecipeEditor(){
const { id } = useParams();
const nav = useNavigate();
const [title, setTitle] = useState('');
const [totalVolume, setTotalVolume] = useState(500);
const [coverUrl, setCoverUrl] = useState('');
const [status, setStatus] = useState('draft');
const [tags, setTags] = useState('');
const [ingredients, setIngredients] = useState([]);

useEffect(()=>{
if (id && id !== 'new'){
(async()=>{
const snap = await getDoc(doc(db,'recipes',id));
if (snap.exists()){
const r = snap.data();
setTitle(r.title || '');
setTotalVolume(r.totalVolume_ml || 500);
setCoverUrl(r.coverUrl || '');
setStatus(r.status || 'draft');
setTags((r.tags || []).join(','));
setIngredients(r.ingredients || []);
} else { nav('/'); }
})();
} else if (id === 'new'){
setIngredients([
{ id: crypto.randomUUID(), materialName: 'Ethanol', parts: 45 },
{ id: crypto.randomUUID(), materialName: 'Calone (10%)', parts: 12 }
]);
}
},[id, nav]);

const totalParts = useMemo(()=> ingredients.reduce((s,i)=> s + (Number(i.parts)||0), 0), [ingredients]);
const rows = useMemo(()=> ingredients.map(i=>{
const pct = totalParts ? (i.parts / totalParts) * 100 : 0;
const ml = (totalVolume * pct) / 100;
return { ...i, percentage: pct, amount_ml: ml };
}), [ingredients, totalParts, totalVolume]);

const save = async ()=>{
const rid = id === 'new' ? crypto.randomUUID() : id;
await setDoc(doc(db,'recipes', rid), {
title,
totalVolume_ml: totalVolume,
coverUrl,
status,
tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
ingredients,
createdBy: auth.currentUser?.uid,
updatedAt: serverTimestamp(),
createdAt: id === 'new' ? serverTimestamp() : undefined
}, { merge: true });
if (id === 'new') nav(`/r/${rid}`, { replace: true });
};

const onUpload = async (file)=>{
const r = ref(storage, `recipes/${auth.currentUser?.uid}/${id || 'temp'}/${file.name}`);
await uploadBytes(r, file);
const url = await getDownloadURL(r);
setCoverUrl(url);
};

const exportPdf = async ()=>{
await generateRecipePdf({
title,
totalVolume_ml: totalVolume,
status,
tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
coverUrl,
rows: rows.map(r=>({ materialName:r.materialName, parts:Number(r.parts)||0, percentage:Number(r.percentage)||0, amount_ml:Number(r.amount_ml)||0 })),
footer: { userEmail: auth.currentUser?.email || '', updatedAtText: new Date().toLocaleString() }
});
};

return (
<Box p={3}>
<Grid container spacing={3}>
<Grid item xs={12} md={8}>
<Card>
<CardContent>
<TextField fullWidth label="Title" value={title} onChange={e=>setTitle(e.target.value)} sx={{ mb:2 }} />
<Grid container spacing={2}>
<Grid item xs={6}>
<TextField fullWidth type="number" label="Total volume (ml)" value={totalVolume} onChange={e=>setTotalVolume(Number(e.target.value)||0)} />
</Grid>
<Grid item xs={6}>
<Button component="label" fullWidth>{coverUrl ? 'Change cover' : 'Upload cover'}
<input hidden type="file" accept="image/*" onChange={e=> e.target.files && onUpload(e.target.files[0]) } />
</Button>
</Grid>
</Grid>
<Grid container spacing={2} sx={{ mt:1 }}>
<Grid item xs={6}>
<TextField fullWidth label="Status" value={status} onChange={e=>setStatus(e.target.value)} />
</Grid>
<Grid item xs={6}>
<TextField fullWidth label="Tags (comma)" value={tags} onChange={e=>setTags(e.target.value)} />
</Grid>
</Grid>
{coverUrl ? (<img alt="cover" src={coverUrl} style={{ width:'100%', height:220, objectFit:'cover', borderRadius:12, marginTop:12 }} />) : null}

<Table size="small" sx={{ mt:2 }}>
<TableHead>
<TableRow>
<TableCell>#</TableCell>
<TableCell>Material</TableCell>
<TableCell width={120}>Parts</TableCell>
<TableCell width={120}>%</TableCell>
<TableCell width={160}>Amount (ml)</TableCell>
<TableCell width={64}></TableCell>
</TableRow>
</TableHead>
<TableBody>
{rows.map((r, idx)=> (
<TableRow key={r.id}>
<TableCell>{idx+1}</TableCell>
<TableCell>
<TextField fullWidth value={r.materialName} onChange={e=>setIngredients(prev=>{ const c=[...prev]; c[idx]={...c[idx], materialName:e.target.value}; return c; })} />
</TableCell>
<TableCell>
<TextField type="number" fullWidth value={r.parts} onChange={e=>setIngredients(prev=>{ const c=[...prev]; c[idx]={...c[idx], parts:Number(e.target.value)||0}; return c; })} />
</TableCell>
<TableCell>{r.percentage.toFixed(2)}</TableCell>
<TableCell>{r.amount_ml.toFixed(2)}</TableCell>
<TableCell align="right">
<IconButton onClick={()=>setIngredients(prev=> prev.filter(x=>x.id!==r.id))}><DeleteIcon /></IconButton>
</TableCell>
</TableRow>
))}
</TableBody>
</Table>

<Box mt={2} display="flex" gap={1}>
<Button onClick={()=>setIngredients(prev=>[...prev,{ id: crypto.randomUUID(), materialName:'', parts:0 }])}>Add ingredient</Button>
<Button color="primary" onClick={save}>Save</Button>
<Button variant="outlined" onClick={exportPdf}>Printable PDF</Button>
</Box>
</CardContent>
</Card>
</Grid>

<Grid item xs={12} md={4}>
<Card>
<CardContent>
<Typography variant="subtitle2" color="text.secondary">Totals</Typography>
<Typography mt={1}>Total parts: <b>{totalParts}</b></Typography>
<Typography>Sum %: <b>{totalParts ? 100 : 0}</b></Typography>
<Typography>Rows: <b>{ingredients.length}</b></Typography>
</CardContent>
</Card>
</Grid>
</Grid>
</Box>
);
}