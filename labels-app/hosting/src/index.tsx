import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './stores/index';
// eslint-disable-next-line
import './index.css';
import App from './App';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
    overrides: {
        MuiTypography: {
            root: {
                fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,
            },
        },
        MuiLink: {
            root: {
                textDecoration: 'none',
                fontWeight: 700,
            },
            underlineHover: {
                '&:hover': {
                    textDecoration: 'none',
                },
            },
        },
        MuiButton: {
            label: {
                textTransform: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
            },
        },
    },
    props: {

    },
    palette: {
        primary: {
            main: '#e0ffff',        // light blue
        },
        secondary: {
            light: '#c7eff4',
            main: '#a0d3d9',        // grayish blue
            dark: '#5c7f83',
        },
        background: {
            default: '#2d2e2e',     // bluish black
            paper: '#6c47ff',       // violet
        },
        text: {
            primary: '#ffffff',     // white
            secondary: '#cacdcd',   // bluish gray
            disabled: '#aaaeae',    // gray
        },
        contrastThreshold: 3,
        tonalOffset: 0.2,
    },
    spacing: 4,
});

ReactDOM.render(
    <Provider store={store}>
        <React.StrictMode> {/* Strictモードでの検査は開発モードでのみ動きます。本番ビルドには影響を与えません。 */}
            <MuiThemeProvider theme={theme}>
                <App />
            </MuiThemeProvider>
        </React.StrictMode>
    </Provider>,
    document.getElementById('root'),
);