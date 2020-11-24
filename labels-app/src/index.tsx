import React from 'react';
import ReactDOM from 'react-dom';
import './style.scss';
import { Provider } from "react-redux";
import store from "./stores/index";
import App from './App';

ReactDOM.render(
    <Provider store={store}>
        <React.StrictMode> {/* Strictモードでの検査は開発モードでのみ動きます。本番ビルドには影響を与えません。 */}
            <App />
        </React.StrictMode>
    </Provider>,
    document.getElementById('root'),
);