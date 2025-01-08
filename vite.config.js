import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ ssrBuild }) => {
    if (ssrBuild) {
        // SSR build
        return {
            plugins: [react()],
            resolve: {
                alias: {
                    '@': path.resolve(__dirname, './src'),
                    'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
                },
            },
            ssr: {
                noExternal: ["react-router-dom", "react-router"],
            },
            optimizeDeps: {
                include: ["react-router-dom"],
            },
            build: {
                ssr: 'src/entry-server.js',
                outDir: 'dist/server',
            },
            root: process.cwd(),
            appType: 'custom',
        };
    }

    // CSR build
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
            },
        },
        optimizeDeps: {
            include: ["react-router-dom"],
        },
        build: {
            outDir: "dist/client",
            manifest: true,
            rollupOptions: {
                input: 'src/entry-client.jsx',
            },
        },
        root: process.cwd(),
        server: {
            middlewareMode: true,
        },
        appType: 'custom',
    };
});