import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Permissions-Policy": "identity-credentials-get=*",
    },
  },
  preview: {
    headers: {
      "Permissions-Policy": "identity-credentials-get=*",
    },
  },
})
