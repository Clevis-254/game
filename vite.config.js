import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    root: process.cwd(),
    server: {
        middlewareMode: true,
    },
    appType: 'custom',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});