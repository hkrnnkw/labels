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
    },
    props: {

    },
    // paletteには、ひとまずサンプルを設定
    palette: {
        primary: {
            main: '#ff4400',
        },
        secondary: {
            light: '#0066ff',
            main: '#0044ff',
            contrastText: '#ffcc00',
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