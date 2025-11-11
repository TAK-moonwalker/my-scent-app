import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function formatDate(d) {
  if (!d) return '';
  try {
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  } catch {
    return '';
  }
}

export default function RecipeCard({
  title,
  coverUrl,
  createdAt,
  onOpen,
  onEdit,
  onDelete
}) {
  return (
    <Card sx={{ cursor: 'pointer', overflow: 'hidden' }} onClick={onOpen}>
      <CardMedia
        sx={{ height: 160, bgcolor: 'grey.900' }}
        image={coverUrl || '/placeholder-dark.png'}
        title={title}
      />
      <CardContent>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between">
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {createdAt ? `Created ${formatDate(createdAt)}` : ''}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions
        onClick={(e) => e.stopPropagation()} // so clicks on actions don't trigger open
        sx={{ justifyContent: 'flex-end' }}
      >
        <Tooltip title="Edit">
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
