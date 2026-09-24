export interface GalleryProject {
  title: string;
  href: string;
  technologies: string[];
  preview?: string;
}

const airbnbDemo = 'https://airbnb-fancy.vercel.app/';
const boleliDemo = 'https://boleli-m67g.vercel.app/';

// Stack provisional indicado para las seis tarjetas; editable por proyecto.
// Los cuatro últimos espacios reutilizan temporalmente las URLs de referencia.
export const projectGallery: GalleryProject[] = [
  { title: 'Airbnb Fancy', href: airbnbDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'], preview: '/projects/airbnb-fancy.jpg' },
  { title: 'Boleli', href: boleliDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'], preview: '/projects/boleli.jpg' },
  { title: 'Project 03', href: airbnbDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'] },
  { title: 'Project 04', href: boleliDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'] },
  { title: 'Project 05', href: airbnbDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'] },
  { title: 'Project 06', href: boleliDemo, technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'CSS', 'ESLint'] },
];
