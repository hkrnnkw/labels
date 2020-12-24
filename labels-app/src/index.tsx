import React from 'react';
import ReactDOM from 'react-dom';
import './style.scss';
import { Provider } from 'react-redux';
import store from './stores/index';
import App from './App';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
    overrides: {
        
    },
    props: {

    },
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