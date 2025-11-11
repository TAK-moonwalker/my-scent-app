import { createTheme } from '@mui/material/styles';


export const theme = createTheme({
palette: {
mode: 'dark',
primary: { main: '#22c55e' },
secondary: { main: '#10b981' },
background: { default: '#0b0f14', paper: '#12181f' },
text: { primary: '#e5efe6', secondary: '#9bb39f' },
},
shape: { borderRadius: 14 },
});