import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { useLogout } from '../context/useLogout';
import {
  AppBar, Toolbar, IconButton, Typography, Avatar,
  Box, Stack, Container, Tooltip, Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';

function initials(name = '') {
  const p = String(name).trim().split(/\s+/);
  return (p[0]?.[0] || 'U').toUpperCase();
}

export default function AppShell() {
  const nav = useNavigate();
  const logout = useLogout();
  const { isAuthenticated, user, userProfile } = useUser();
  const displayName = userProfile?.displayName || user?.email || 'User';

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* ===== AppBar ===== */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          backgroundColor: '#000', // solid black header
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {/* Left side: App icon + name + avatar (if logged in) */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              component={RouterLink}
              to={isAuthenticated ? '/' : '/signup'}
              sx={{ color: 'inherit', textDecoration: 'none' }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  bgcolor: 'success.main',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                }}
              >
                💧
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                My Scent App
              </Typography>
            </Stack>

            {isAuthenticated && (
              <Tooltip title={displayName}>
                <Avatar
                  onClick={() => nav('/profile/edit')}
                  sx={{
                    width: 30,
                    height: 30,
                    ml: 1,
                    bgcolor: 'success.main',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
                    },
                  }}
                  src={userProfile?.photoURL || undefined}
                >
                  {initials(displayName)}
                </Avatar>
              </Tooltip>
            )}
          </Stack>

          {/* Right side: Home / Add buttons */}
          {isAuthenticated && (
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" onClick={() => nav('/')}>
                <HomeIcon />
              </IconButton>
              <IconButton color="inherit" onClick={() => nav('/add')}>
                <AddIcon />
              </IconButton>
              <Tooltip title="Logout">
                <IconButton color="inherit" onClick={logout}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Toolbar>
        <Divider opacity={0.2} />
      </AppBar>

      {/* ===== Main Content ===== */}
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Outlet />
      </Container>

      {/* ===== Footer ===== */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          bgcolor: '#000', // black footer same as header
          color: '#fff',
          mt: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          My Scent App by Tiger Dev
        </Typography>
      </Box>
    </Box>
  );
}
