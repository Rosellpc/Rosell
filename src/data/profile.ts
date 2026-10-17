// Dirección única para el destinatario de todos los enlaces de contacto.
const email = 'rossellpc@gmail.com';
const emailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

export const profile = {
  name: 'Rosell',
  brand: 'rosellpc',
  role: 'Desarrollador Full Stack',
  location: 'Cusco, Perú',
  email,
  emailComposeUrl,
  description: 'Rosell, desarrollador full stack. Aplicaciones para negocios y herramientas de uso diario con React, TypeScript y Python. Busco incorporarme a un equipo.',
  // Añadir las URLs personales verificadas; no mostrar enlaces genéricos.
  socials: [
    {
      label: "GitHub",
      url: "https://github.com/Rosellpc"
    },
    {
      label: "Email",
      url: emailComposeUrl
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
