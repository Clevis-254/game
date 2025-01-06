import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom')
        }
    },
    ssr: {
        noExternal: ["react-router-dom", "react-router"],
    },
    optimizeDeps: {
        include: ["react-router-dom"],
    },
    root: process.cwd(),
    server: {
        middlewareMode: true,
        historyApiFallback: true,
    },
    build: {
        ssr: true,
        outDir: "dist-ssr",
    },
    appType: 'custom'
});