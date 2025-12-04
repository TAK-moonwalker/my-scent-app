import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';


export default function SignIn(){
const [email, setEmail] = useState('');
const [pw, setPw] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [resetDialogOpen, setResetDialogOpen] = useState(false);
const [resetEmail, setResetEmail] = useState('');
const [resetError, setResetError] = useState('');
const [resetSuccess, setResetSuccess] = useState('');
const [resetting, setResetting] = useState(false);
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

const handlePasswordReset = async () => {
  if (!resetEmail.trim()) {
    setResetError('Please enter your email address');
    return;
  }

  setResetting(true);
  setResetError('');
  setResetSuccess('');

  try {
    await sendPasswordResetEmail(auth, resetEmail);
    setResetSuccess('Password reset email sent! Check your inbox.');
    setResetEmail('');
    setTimeout(() => {
      setResetDialogOpen(false);
    }, 2000);
  } catch (err) {
    setResetError(err.message);
  } finally {
    setResetting(false);
  }
};

return (
<Box minHeight="100dvh" display="grid" alignItems="center" justifyContent="center" p={2} sx={{ boxSizing: 'border-box' }}>
<Card sx={{ width: { xs: '100%', sm: 420 }, maxWidth: '100%' }}>
<CardContent>
<Typography variant="h6" mb={2}>Log in</Typography>
<TextField fullWidth label="Email" value={email} onChange={e=>setEmail(e.target.value)} sx={{ mb:2 }} />
<TextField fullWidth type="password" label="Password" value={pw} onChange={e=>setPw(e.target.value)} sx={{ mb:2 }} />

<Box sx={{ mb: 2, textAlign: 'right' }}>
  <Link
    component="button"
    variant="body2"
    onClick={() => setResetDialogOpen(true)}
    sx={{ cursor: 'pointer', textDecoration: 'none', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
  >
    Forgot Password?
  </Link>
</Box>

{error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
<Box mt={2} display="flex" gap={1}>
<Button fullWidth variant="contained" onClick={handleSignIn} disabled={loading}>Log in</Button>
<Button fullWidth variant="outlined" onClick={()=>navigate('/signup')}>Sign up</Button>
</Box>
</CardContent>
</Card>

{/* Password Reset Dialog */}
<Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Reset Password</DialogTitle>
  <DialogContent sx={{ pt: 2 }}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Enter your email address and we'll send you a link to reset your password.
    </Typography>
    <TextField
      fullWidth
      label="Email"
      type="email"
      value={resetEmail}
      onChange={(e) => setResetEmail(e.target.value)}
      disabled={resetting}
      sx={{ mb: 2 }}
    />
    {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}
    {resetSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resetSuccess}</Alert>}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setResetDialogOpen(false)} disabled={resetting}>
      Cancel
    </Button>
    <Button onClick={handlePasswordReset} variant="contained" disabled={resetting || !resetEmail.trim()}>
      {resetting ? <CircularProgress size={24} /> : 'Send Reset Link'}
    </Button>
  </DialogActions>
</Dialog>
</Box>
);
}