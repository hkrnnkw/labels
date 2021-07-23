import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './stores/index';
import App from './App';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
    overrides: {
        MuiLink: {
            root: {
                textDecoration: 'none',
                fontWeight: 700,
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
            main: '#a0d3d9',        // grayish blue
        },
        background: {
            default: '#2d2e2e',     // bluish black
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