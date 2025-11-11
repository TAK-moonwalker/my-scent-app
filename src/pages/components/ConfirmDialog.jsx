import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

export default function ConfirmDialog({
  open,
  title,
  content,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  onClose,
  onConfirm,
  disabled
}) {
  return (
    <Dialog open={open} onClose={disabled ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      {content && (
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} disabled={disabled}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} disabled={disabled} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
