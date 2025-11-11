import { Box, Paper, Typography, Button, Stack } from '@mui/material';

export default function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <Box minHeight="60dvh" display="grid" alignItems="center" justifyContent="center">
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 560,
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
          <Typography variant="h5">{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
          <Button variant="contained" color="primary" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
