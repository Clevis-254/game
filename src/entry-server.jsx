import { renderToString } from 'react-dom/server';
import { StaticRouter } from "react-router-dom";

import App from './App.jsx';

// Render the React to a string
export function render(url){
    return renderToString(
        <StaticRouter location={url}>
            <App />
        </StaticRouter>
    );
}