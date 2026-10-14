export interface GalleryProject {
  title: string;
  href: string;
  technologies: string[];
  preview?: string;
  description?: string;
}

const airbnbDemo = 'https://airbnb-fancy.vercel.app/';
const boleliDemo = 'https://boleli-m67g.vercel.app/';

// Tecnologías y vistas previas por proyecto.
// El quinto espacio conserva temporalmente una URL de referencia.
export const projectGallery: GalleryProject[] = [
  { title: 'Airbnb Fancy', href: airbnbDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'], preview: '/projects/airbnb-fancy.jpg' },
  { title: 'Boleli', href: boleliDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'], preview: '/projects/boleli.jpg' },
  { title: 'Focus', href: 'https://github.com/Rosellpc/Focus', technologies: ['Rust', 'Tauri', 'React', 'TypeScript', 'SQLite'], preview: '/projects/focus.png', description: 'App para Windows y Android de hábitos, temporizador y reportes, con almacenamiento local y temas White y Beige.' },
  { title: 'Lifegram', href: 'https://lifegram-swart.vercel.app/', technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase'], preview: '/projects/lifegram.png', description: 'Plataforma social con perfiles, publicaciones, historias y seguimiento. Interfaz Liquid Glass e integración de mensajes privados y notificaciones en tiempo real.' },
  { title: 'Project 05', href: airbnbDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'] },
  { title: 'Memely News', href: 'https://memely-news.vercel.app/', technologies: ['Python', 'FastAPI', 'JavaScript', 'Redis', 'Gemini', 'Vercel'], preview: '/projects/memely-news.png', description: 'Plataforma de investigación de noticias con análisis de IA, fuentes consultables y una API protegida con límites de uso.' },
];
