import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            'react-router-dom': 'node_modules/react-router-dom',
        },
    },
    ssr: {
        noExternal: ["react-router-dom", "react-router"],
    },
    optimizeDeps: {
        include: ["react-router-dom"],
    },
    root: process.cwd(), // Set project root correctly
    server: {
        middlewareMode: true,
    },
    build: {
        ssr: true,
        outDir: "dist-ssr",
    },
    appType: 'custom',
});