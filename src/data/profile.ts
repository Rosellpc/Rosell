// Dirección única para el destinatario de todos los enlaces de contacto.
const email = 'rossellpc@gmail.com';
const emailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

export const profile = {
  name: 'Rosell',
  brand: 'rosell',
  role: 'Desarrollador Full Stack && AI Engineer',
  location: 'Cusco, Perú',
  email,
  emailComposeUrl,
  description: 'Rosell, desarrollador Full Stack con enfoque en IA aplicada.',
  intro: 'AI Engineer. Mi formación incluye conocimientos de LLMs, configuración de sus APIs, RAG, MCP, Skills y Orquestación, sobre una base de desarrollo frontend, backend, datos e infraestructura.',
  approach: 'Empiezo por entender el proceso del negocio y la información que necesita cada usuario. Construyo la interfaz, las APIs y la persistencia de datos, cuidando los permisos y la claridad de la experiencia.',
  education: 'AI Software Engineer. Mi formación incluye conocimientos de LLMs, configuración de sus APIs, RAG, MCP, Skills y Orquestación, sobre una base de desarrollo frontend  backend y datos.',
  appliedWork: 'En RestaurantOS, un MVP experimental para restaurantes, conecté la carta y los pedidos con la operación del equipo. Integré un asistente RAG que consulta documentos y muestra sus fuentes, y un servidor MCP que permite a ChatGPT consultar el sistema con permisos de acceso.',
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
  { title: 'IA aplicada', description: 'Modelos conectados al contexto y a las herramientas del producto.', items: ['LLMs', 'OpenAI API', 'RAG', 'MCP', 'Recuperación de documentos'] },
  { title: 'Frontend', description: 'La experiencia, en cada detalle.', items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS'] },
  { title: 'Backend', description: 'La lógica que sostiene el producto.', items: ['Python', 'FastAPI', 'Django', 'Django REST Framework', 'Node.js', 'REST APIs'] },
  { title: 'Datos e infraestructura', description: 'Una base para construir y crecer.', items: ['PostgreSQL', 'MySQL', 'Supabase', 'AWS', 'Git', 'GitHub', 'CI/CD'] },
];
