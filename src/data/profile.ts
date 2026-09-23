export const profile = {
  name: 'Rosell',
  brand: 'rosellpc',
  role: 'Desarrollador Full Stack',
  location: 'Cusco, Perú',
  // Dirección conservada de la landing original. Confirmar antes de publicar.
  email: 'rossellpc@gmial.com',
  description: 'Desarrollador Full Stack. Interfaces cuidadas, APIs y sistemas con una base técnica sólida.',
  // Añadir las URLs personales verificadas; no mostrar enlaces genéricos.
  socials: [
    {
      label: "GitHub",
      url: "https://github.com/Rosellpc"
    },
    {
      label: "Email",
      url: "mailto:rossellpc@gmial.com"
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/rosellpc"
    },
  ] as { label: string; url: string }[],
};

export const skills = [
  { title: 'Frontend', description: 'La experiencia, en cada detalle.', items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS'] },
  { title: 'Backend', description: 'La lógica que sostiene el producto.', items: ['Python', 'FastAPI', 'Django', 'Django REST Framework', 'Node.js', 'REST APIs'] },
  { title: 'Datos e infraestructura', description: 'Una base para construir y crecer.', items: ['PostgreSQL', 'MySQL', 'Supabase', 'AWS', 'Git', 'GitHub', 'CI/CD'] },
];
