export interface GalleryProject {
  title: string;
  href: string;
  technologies: string[];
  preview?: string;
  description?: string;
}

const airbnbDemo = 'https://airbnb-fancy.vercel.app/';
const boleliDemo = 'https://boleli-m67g.vercel.app/';

// Stack provisional indicado para las seis tarjetas; editable por proyecto.
// Los tres últimos espacios reutilizan temporalmente las URLs de referencia.
export const projectGallery: GalleryProject[] = [
  { title: 'Airbnb Fancy', href: airbnbDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'], preview: '/projects/airbnb-fancy.jpg' },
  { title: 'Boleli', href: boleliDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'], preview: '/projects/boleli.jpg' },
  { title: 'Focus', href: 'https://github.com/Rosellpc/Focus', technologies: ['Rust', 'Tauri', 'React', 'TypeScript', 'SQLite'], preview: '/projects/focus.png', description: 'App para Windows y Android de hábitos, temporizador y reportes, con almacenamiento local y temas White y Beige.' },
  { title: 'Project 04', href: boleliDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'] },
  { title: 'Project 05', href: airbnbDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'] },
  { title: 'Project 06', href: boleliDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'] },
];
