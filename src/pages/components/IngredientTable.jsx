import { Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function IngredientTable({ rows, setIngredients }) {
  const removeRow = (id) => setIngredients((prev) => prev.filter((x) => x.id !== id));

  return (
    <Box sx={{ overflowX: 'auto', mt: 2 }}>
    <Table size="small" sx={{ minWidth: { xs: 500, sm: 'auto' } }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: { xs: 32, sm: 40 } }}>#</TableCell>
          <TableCell sx={{ width: { xs: 120, sm: 300 }, minWidth: 100 }}>Material</TableCell>
          <TableCell sx={{ width: { xs: 80, sm: 120 }, minWidth: 70 }}>% (Percentage)</TableCell>
          <TableCell sx={{ width: { xs: 90, sm: 120 }, minWidth: 80 }}>Amount (ml)</TableCell>
          <TableCell sx={{ width: { xs: 48, sm: 64 }, minWidth: 48 }}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r, idx) => (
          <TableRow key={r.id}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>
              <TextField
                fullWidth
                size="small"
                value={r.materialName}
                onChange={(e) =>
                  setIngredients((prev) => {
                    const c = [...prev];
                    c[idx] = { ...c[idx], materialName: e.target.value };
                    return c;
                  })
                }
              />
            </TableCell>
            <TableCell>
              <TextField
                type="number"
                fullWidth
                size="small"
                value={r.percentage}
                onChange={(e) =>
                  setIngredients((prev) => {
                    const c = [...prev];
                    c[idx] = { ...c[idx], percentage: Number(e.target.value) || 0 };
                    return c;
                  })
                }
                inputProps={{
                  step: '0.1',
                  min: '0',
                  max: '100',
                  style: { MozAppearance: 'textfield', padding: '6px' }
                }}
                sx={{
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                }}
              />
            </TableCell>
            <TableCell>{r.amount_ml.toFixed(2)}</TableCell>
            <TableCell align="right">
              <IconButton onClick={() => removeRow(r.id)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </Box>
  );
}
