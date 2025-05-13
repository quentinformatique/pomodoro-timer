import './index.css'; // import css
import './i18n/config';

import { createRoot } from "react-dom/client";
import App from './App';
import React from 'react';

const root = createRoot(document.getElementById('app') as HTMLElement);
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);