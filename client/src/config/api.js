// Centralized API Base URL configuration
// In production (Vercel), VITE_API_URL points to the deployed Render backend (e.g. https://truth-lens-backend.onrender.com)
// In local development, if VITE_API_URL is empty, it uses relative paths with Vite's localhost proxy
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
