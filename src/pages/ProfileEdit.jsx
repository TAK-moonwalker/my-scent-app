import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { storage, db } from '../firebase/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function initials(name = '') {
  const p = String(name).trim().split(/\s+/);
  return (p[0]?.[0] || 'U').toUpperCase();
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, userProfile } = useUser();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(userProfile?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!user) throw new Error('Not authenticated');

      // Update profile photo if provided
      let photoURL = userProfile?.photoURL || '';
      if (profileImage) {
        const fileName = `${user.uid}_${Date.now()}.${profileImage.name.split('.').pop()}`;
        const storageRef = ref(storage, `profilePictures/${user.uid}/${fileName}`);
        await uploadBytes(storageRef, profileImage);
        photoURL = await getDownloadURL(storageRef);
      }

      // Update display name and photo in Firebase Auth
      await updateProfile(user, {
        displayName: displayName.trim() || user.displayName,
        photoURL: photoURL,
      });

      // Update email if changed
      if (email !== user.email) {
        await updateEmail(user, email.trim());
      }

      // Update password if provided
      if (password) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await updatePassword(user, password);
      }

      // Update Firestore users collection
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          displayName: displayName.trim() || user.displayName,
          photoURL: photoURL,
          email: email.trim(),
        });
        console.log('User document updated in Firestore');
      } catch (firestoreErr) {
        console.error('Firestore update error:', firestoreErr);
        throw new Error(`Failed to update profile in Firestore: ${firestoreErr.message}`);
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        variant="text"
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h5" mb={3}>
            Edit Profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Profile Photo Section */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={previewUrl}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
              }}
            >
              {initials(displayName)}
            </Avatar>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 1 }}
            >
              Change Photo
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </Button>

            {profileImage && (
              <Typography variant="caption" color="textSecondary">
                {profileImage.name}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Display Name */}
          <TextField
            fullWidth
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Email */}
          <TextField
            fullWidth
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Changing email will log you out for security verification"
          />

          <Divider sx={{ my: 3 }} />

          {/* Password Section */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Change Password (Optional)
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Leave empty to keep current password"
          />

          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="Confirm new password"
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
