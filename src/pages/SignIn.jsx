import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Box, Card, CardContent, TextField, Button, Typography } from '@mui/material';


export default function SignIn(){
const [email, setEmail] = useState('');
const [pw, setPw] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const navigate = useNavigate();

const handleSignIn = async () => {
  setError('');
  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, pw);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

return (
<Box minHeight="100dvh" display="grid" alignItems="center" justifyContent="center" p={2}>
<Card sx={{ width: 420, maxWidth: '100%' }}>
<CardContent>
<Typography variant="h6" mb={2}>Log in</Typography>
<TextField fullWidth label="Email" value={email} onChange={e=>setEmail(e.target.value)} sx={{ mb:2 }} />
<TextField fullWidth type="password" label="Password" value={pw} onChange={e=>setPw(e.target.value)} sx={{ mb:2 }} />
{error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
<Box mt={2} display="flex" gap={1}>
<Button fullWidth variant="contained" onClick={handleSignIn} disabled={loading}>Log in</Button>
<Button fullWidth variant="outlined" onClick={()=>navigate('/signup')}>Sign up</Button>
</Box>
</CardContent>
</Card>
</Box>
);
}