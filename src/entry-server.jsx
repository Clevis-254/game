import { renderToString } from 'react-dom/server';

import App from './App.jsx';

export const render = (data) => {
    return renderToString(<App data={data} />);
};