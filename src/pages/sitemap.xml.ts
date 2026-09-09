import type { APIRoute } from 'astro';
import { projects, projectUrl } from '../data/projects';
import { navigation } from '../data/navigation';
export const GET: APIRoute = ({ site }) => new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...navigation.map(item => item.href), ...projects.map(projectUrl)].map(path => `<url><loc>${new URL(path, site)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
