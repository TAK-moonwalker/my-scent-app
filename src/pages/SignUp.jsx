import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase';
import { db } from '../firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Box, Card, CardContent, TextField, Button, Typography, Avatar, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function SignUp(){
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pw);
      const user = userCredential.user;

      let photoURL = '';
      if (profileImage) {
        try {
          const fileName = `${user.uid}_${Date.now()}.${profileImage.name.split('.').pop()}`;
          const storageRef = ref(storage, `profilePictures/${user.uid}/${fileName}`);
          
          console.log('Uploading image to:', storageRef.fullPath);
          const snapshot = await uploadBytes(storageRef, profileImage);
          console.log('Upload successful:', snapshot);
          
          photoURL = await getDownloadURL(storageRef);
          console.log('Photo URL:', photoURL);
        } catch (uploadErr) {
          console.error('Storage upload error:', uploadErr);
          setError(`Image upload failed: ${uploadErr.message}`);
          setLoading(false);
          return;
        }
      }

      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });

      // Save user data to Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: email,
          displayName: displayName,
          photoURL: photoURL,
          createdAt: serverTimestamp(),
          recipeNumber: 0
        });
        console.log('User document created in Firestore');
      } catch (firestoreErr) {
        console.error('Firestore error:', firestoreErr);
        setError(`Failed to save user profile: ${firestoreErr.message}`);
        setLoading(false);
        return;
      }

      console.log('Profile updated successfully');
      navigate('/');
    } catch (err) {
      console.error('SignUp error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100dvh" display="grid" alignItems="center" justifyContent="center" p={2}>
      <Card sx={{ width: 420, maxWidth: '100%' }}>
        <CardContent>
          <Typography variant="h6" mb={3}>Create Account</Typography>

          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              src={previewUrl}
              sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload Photo
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </Button>
            {profileImage && <Typography variant="caption">{profileImage.name}</Typography>}
          </Box>

          <TextField
            fullWidth
            label="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            sx={{ mb: 2 }}
          />

          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

          <Button
            fullWidth
            variant="contained"
            onClick={handleSignUp}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="body2" color="textSecondary">Or</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/signin')}
          >
            Log In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}