import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

export function useLogout() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('✅ User logged out successfully');
      navigate('/signin');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  return logout;
}
