export interface GalleryProject {
  title: string;
  href: string;
  technologies: string[];
  preview?: string;
  description?: string;
  caseStudy?: boolean;
}

const rosellGptDemo = 'https://rosell-gpt-n1hv.vercel.app/';
const boleliDemo = 'https://boleli-m67g.vercel.app/';

// Tecnologías y vistas previas por proyecto.
export const projectGallery: GalleryProject[] = [
  {
    title: 'Rosell GPT',
    href: rosellGptDemo,
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'OpenAI API', 'Shiki'],
    preview: '/projects/rosell-gpt.png',
    description: 'Asistente de IA con conversaciones con contexto, respuestas progresivas, generación de imágenes, transcripción y voz. Markdown y código resaltado en una interfaz adaptable a móvil.',
  },
  { title: 'Boleli', href: boleliDemo, technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'], preview: '/projects/boleli.jpg', description: 'Catálogo de tecnología y estilo de vida con navegación por categorías e interfaz de cristal.' },
  { title: 'Focus', href: '/proyectos/focus/', caseStudy: true, technologies: ['Rust', 'Tauri', 'React', 'TypeScript', 'SQLite'], preview: '/projects/focus.png', description: 'Hábitos y tiempo en Windows y Android. Persistencia local con SQLite y restauración transaccional para conservar los registros.' },
  { title: 'Lifegram', href: 'https://lifegram-swart.vercel.app/', technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase'], preview: '/projects/lifegram.png', description: 'Plataforma social con perfiles, publicaciones, historias y seguimiento. Interfaz Liquid Glass e integración de mensajes privados y notificaciones en tiempo real.' },
  { title: 'StreamFlix', href: 'https://django-rest-sand.vercel.app/', technologies: ['Next.js', 'React', 'TypeScript', 'Django REST', 'PostgreSQL', 'Tailwind CSS'], preview: '/projects/streamflix.png', description: 'Plataforma de streaming con autenticación JWT, perfiles, planes de suscripción y listas personales. Catálogo de películas con avances automáticos y diseño adaptable a móvil y escritorio.' },
  { title: 'Memely News', href: '/proyectos/memely-news/', caseStudy: true, technologies: ['Python', 'FastAPI', 'JavaScript', 'Redis', 'Gemini', 'Vercel'], preview: '/projects/memely-news.png', description: 'Investigación de noticias con IA. Una misma lógica para web y CLI, con límites de uso compartidos mediante Redis.' },
];
