import { Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function IngredientTable({ rows, setIngredients }) {
  const removeRow = (id) => setIngredients((prev) => prev.filter((x) => x.id !== id));

  return (
    <>
    <Table size="small" sx={{ mt: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell width={40}>#</TableCell>
          <TableCell width={300}>Material</TableCell>
          <TableCell width={126}>Parts</TableCell>
          <TableCell width={100}>%</TableCell>
          <TableCell width={120}>Amount (ml)</TableCell>
          <TableCell width={64}></TableCell>
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
                value={r.parts}
                onChange={(e) =>
                  setIngredients((prev) => {
                    const c = [...prev];
                    c[idx] = { ...c[idx], parts: Number(e.target.value) || 0 };
                    return c;
                  })
                }
                inputProps={{
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
            <TableCell>{r.percentage.toFixed(2)}</TableCell>
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
    </>
  );
}
