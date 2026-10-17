export interface GalleryProject {
  title: string;
  href: string;
  technologies: string[];
  preview?: string;
  description?: string;
  caseStudy?: boolean;
}

const airbnbDemo = 'https://airbnb-fancy.vercel.app/';
const boleliDemo = 'https://boleli-m67g.vercel.app/';

// Tecnologías y vistas previas por proyecto.
export const projectGallery: GalleryProject[] = [
  {
    title: 'Airbnb Fancy',
    href: airbnbDemo,
    technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'],
    preview: '/projects/airbnb-fancy.jpg',
    description: 'Plataforma de alojamientos para explorar propiedades, buscar por destino y tipo, consultar detalles y guardar favoritos. Incluye autenticación simulada y diseño responsive.',
  }, 
  { title: 'Boleli', href: boleliDemo, technologies: ['Nextjs', 'TypeScript', 'Vite', 'React Router', 'TailwindCSS'], preview: '/projects/boleli.jpg', description: 'Plataforma de E-commerce de Tecnología & Estilo de Vida Aplicación web de comercio electrónico desarrollada con Next.js y TypeScript. Destaca por una interfaz minimalista inspirada en Glassmorphism, navegación por categorías, catálogo interactivo' },
  { title: 'Focus', href: '/proyectos/focus/', caseStudy: true, technologies: ['Rust', 'Tauri', 'React', 'TypeScript', 'SQLite'], preview: '/projects/focus.png', description: 'Hábitos y tiempo en Windows y Android. Persistencia local con SQLite y restauración transaccional para conservar los registros.' },
  { title: 'Lifegram', href: 'https://lifegram-swart.vercel.app/', technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase'], preview: '/projects/lifegram.png', description: 'Plataforma social con perfiles, publicaciones, historias y seguimiento. Interfaz Liquid Glass e integración de mensajes privados y notificaciones en tiempo real.' },
  { title: 'StreamFlix', href: 'https://django-rest-sand.vercel.app/', technologies: ['Next.js', 'React', 'TypeScript', 'Django REST', 'PostgreSQL', 'Tailwind CSS'], preview: '/projects/streamflix.png', description: 'Plataforma de streaming con autenticación JWT, perfiles, planes de suscripción y listas personales. Catálogo de películas con avances automáticos y diseño adaptable a móvil y escritorio.' },
  { title: 'Memely News', href: '/proyectos/memely-news/', caseStudy: true, technologies: ['Python', 'FastAPI', 'JavaScript', 'Redis', 'Gemini', 'Vercel'], preview: '/projects/memely-news.png', description: 'Investigación de noticias con IA. Una misma lógica para web y CLI, con límites de uso compartidos mediante Redis.' },
];
