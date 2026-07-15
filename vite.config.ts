import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { contentSplit } from './scripts/vite-plugin-content.mjs';

export default defineConfig({
	// contentSplit 要在 react() 之前：md 的 ?meta / ?body 得先被它接走
	plugins: [contentSplit(), react()],
	base: '/',
	server: {
		port: Number(process.env.PORT) || 4321,
	},
});
