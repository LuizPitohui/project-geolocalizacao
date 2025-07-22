import { createTheme } from '@mui/material/styles';

// Paleta de cores profissional inspirada nas suas sugestões.
// Usamos tons de cinza escuro para o fundo para ser mais agradável aos olhos que o preto puro.

const theme = createTheme({
  palette: {
    mode: 'dark', // Ativa o modo escuro como base
    primary: {
      main: '#2039b4', // O seu azul como cor principal para botões, links e destaques.
      contrastText: '#ffffff', // Texto branco para contrastar com o azul.
    },
    secondary: {
      main: '#d4b415', // O seu dourado/amarelo como cor secundária para alertas ou ações especiais.
      contrastText: '#000000', // Texto preto para contrastar com o dourado.
    },
    background: {
      default: '#1a1a2e', // Um fundo azul-marinho muito escuro, mais interessante que cinza.
      paper: '#16213e',   // Um tom ligeiramente mais claro para painéis, cards e a navbar.
    },
    text: {
      primary: '#ffffffff', // Um branco suave para o texto principal, menos cansativo que o branco puro.
      secondary: '#ffffffff', // Um cinza-azulado para textos secundários e descrições.
    },
    divider: 'rgba(227, 242, 253, 0.12)', // Cor sutil para as linhas divisórias.
  },
  typography: {
    // --- INÍCIO DAS MUDANÇAS NO TAMANHO DA FONTE ---
    fontSize: 16, // Define a fonte base para 16px (o padrão é 14px)
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h2: {
      fontWeight: 700,
      color: '#e3f2fd',
      fontSize: '2.5rem', // Tamanho para títulos grandes
    },
    h6: {
      fontWeight: 600,
      color: '#e3f2fd',
      fontSize: '1.35rem', // Tamanho para o título da Navbar e painéis
    },
    // Adiciona estilos para o corpo do texto e botões
    body1: {
      fontSize: '1.05rem', // Aumenta o texto principal e dos campos de formulário
    },
    button: {
      fontSize: '0.95rem', // Aumenta a fonte dos botões
    }
    // --- FIM DAS MUDANÇAS NO TAMANHO DA FONTE ---
  },
  components: {
    // Sobrescreve o estilo padrão do Paper (usado no seu dashboard)
    MuiPaper: {
      styleOverrides: {
        root: {
          // Adiciona um contorno sutil para destacar os painéis do fundo.
          border: '1px solid rgba(227, 242, 253, 0.12)',
        },
      },
    },
    // Garante que os botões tenham uma aparência consistente
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Tira o texto em maiúsculas dos botões
          borderRadius: '8px',   // Bordas mais arredondadas
        },
      },
    },
    // Estiliza os menus de seleção
    MuiSelect: {
        styleOverrides: {
            icon: {
                color: '#9fb3c8',
            }
        }
    },
    // Estiliza os campos de texto do Autocomplete
    MuiTextField: {
        styleOverrides: {
            root: {
                '& label.Mui-focused': {
                    color: '#d4b415', // Cor do label quando o campo está focado
                },
                '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                        borderColor: '#d4b415', // Cor da borda quando focado
                    },
                },
            },
        },
    },
  },
});

export default theme;