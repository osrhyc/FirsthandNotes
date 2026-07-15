import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	base: '/',
	server: {
		port: Number(process.env.PORT) || 4321,
	},
});
