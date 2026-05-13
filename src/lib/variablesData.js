/**
 * Datos precargados del instrumento de evaluación.
 * Índice 1: La biblioteca como espacio público
 * Índice 2: La biblioteca como sujeto colectivo
 */

export const DIMENSION_PRINCIPAL = "La biblioteca como espacio público"

export const INDICES = [
  { id: 1, nombre: "La biblioteca como espacio público" },
  { id: 2, nombre: "La biblioteca como sujeto colectivo" },
]

export const SUBDIMENSIONES = [
  {
    id: "acceso",
    nombre: "Acceso y accesibilidad",
    descripcion: "Aspectos que miden si la biblioteca brinda acceso universal y es accesible física, visual y virtualmente",
    variables: [
      {
        clave: "EX1",
        nombre: "EX1. Integración con el entorno",
        descripcion: "Evalúa el grado en que la biblioteca se integra física y urbanamente con su contexto inmediato.",
        criterios: ["Ubicación estratégica", "Elementos monumentales", "Integración urbana"],
      },
      {
        clave: "EX2",
        nombre: "EX2. Conexión física",
        descripcion: "Evalúa la facilidad de conexión peatonal, vehicular y mediante transporte público hacia la biblioteca.",
        criterios: ["Rutas de acceso"],
      },
      {
        clave: "EA1",
        nombre: "EA1. Acceso y accesibilidad física",
        descripcion: "Evalúa las condiciones físicas y espaciales que permiten el ingreso, desplazamiento y uso de las instalaciones.",
        criterios: [
          "Barreras de acceso de diseño exterior",
          "Barreras de acceso de diseño interior",
          "Accesibilidad universal",
          "Legibilidad espacial",
          "Vinculación institucional",
          "Áreas restringidas",
        ],
      },
      {
        clave: "EA2",
        nombre: "EA2. Acceso y accesibilidad virtual",
        descripcion: "Evalúa la disponibilidad y facilidad de acceso a servicios, contenidos y plataformas digitales de la biblioteca.",
        criterios: [
          "Accesibilidad web",
          "Atención digital",
          "Asistentes de voz",
          "Login accesible",
          "Conectividad digital",
          "Equipamiento tecnológico",
          "Biblioteca virtual",
        ],
      },
      {
        clave: "EV1",
        nombre: "EV1. Visibilidad física",
        descripcion: "Evalúa qué tan identificable y perceptible es la biblioteca dentro del entorno urbano y desde el espacio público.",
        criterios: ["Señalética urbana", "Permeabilidad visual"],
      },
      {
        clave: "EV2",
        nombre: "EV2. Visibilidad online",
        descripcion: "Evalúa la presencia, difusión y alcance digital de la biblioteca en plataformas virtuales y medios digitales.",
        criterios: ["Presencia digital", "Plataformas de expresión comunitaria"],
      },
    ],
  },
  {
    id: "seguridad",
    nombre: "Seguridad y comodidad",
    descripcion: "Medidas visibles y operativas que protegen tanto a las personas como a lo material",
    variables: [
      {
        clave: "ES1",
        nombre: "ES1. Seguridad en las instalaciones",
        descripcion: "Evalúa la seguridad del edificio y de la infraestructura.",
        criterios: ["Seguridad vial", "Sistema contra incendios", "Sistema de vigilancia", "Sistema de iluminación"],
      },
      {
        clave: "ES2",
        nombre: "ES2. Seguridad en las colecciones",
        descripcion: "Evalúa las medidas destinadas a la protección, conservación y resguardo de los materiales y recursos bibliográficos.",
        criterios: ["Protección de colecciones"],
      },
      {
        clave: "ES3",
        nombre: "ES3. Seguridad de las personas",
        descripcion: "Evalúa las condiciones que garantizan la integridad física y el bienestar de los usuarios dentro de la biblioteca.",
        criterios: ["Rutas de evacuación", "Elementos de emergencia", "Protección contra crimen", "Protección contra ruidos"],
      },
      {
        clave: "ES4",
        nombre: "ES4. Vigilancia digital",
        descripcion: "Evalúa las medidas de protección de datos, privacidad y seguridad en el uso de plataformas y servicios digitales.",
        criterios: ["Seguridad en internet"],
      },
      {
        clave: "EF1",
        nombre: "EF1. Normas y regulación",
        descripcion: "Evalúa la claridad, accesibilidad y aplicación de normas de uso y convivencia dentro de la biblioteca.",
        criterios: ["Normas visibles", "Horarios"],
      },
      {
        clave: "EF2",
        nombre: "EF2. Mantenimiento (limpieza, cuidado)",
        descripcion: "Evalúa el estado de conservación, limpieza y mantenimiento general de las instalaciones.",
        criterios: ["Limpieza y cuidado"],
      },
      {
        clave: "EF3",
        nombre: "EF3. Propiedad/agente",
        descripcion: "Evalúa el tipo de responsabilidad institucional que tiene el agente del espacio bibliotecario.",
        criterios: ["Responsabilidad institucional"],
      },
      {
        clave: "EC1",
        nombre: "EC1. Iluminación",
        descripcion: "Evalúa la calidad y adecuación de la iluminación natural y artificial en los distintos espacios de la biblioteca.",
        criterios: ["Sistema de iluminación"],
      },
      {
        clave: "EC2",
        nombre: "EC2. Comodidad climática",
        descripcion: "Evalúa las condiciones ambientales internas relacionadas con temperatura, ventilación y confort térmico.",
        criterios: ["Microclimas"],
      },
      {
        clave: "EC3",
        nombre: "EC3. Comodidad de los espacios",
        descripcion: "Evalúa el nivel de confort físico, funcional y acústico de los espacios destinados a la permanencia y uso de los usuarios.",
        criterios: ["Espacios de trabajo", "Confort acústico", "Comodidad del mobiliario"],
      },
      {
        clave: "EE1",
        nombre: "EE1. Instalaciones básicas",
        descripcion: "Evalúa la disponibilidad y calidad de servicios básicos complementarios para la atención y permanencia de usuarios.",
        criterios: ["Baños", "Bebederos", "Lockers", "Basura", "Estacionamiento"],
      },
      {
        clave: "EE2",
        nombre: "EE2. Mobiliario",
        descripcion: "Evalúa la adecuación, ergonomía y funcionalidad del mobiliario disponible para diferentes actividades y usuarios.",
        criterios: ["Mobiliario especializado"],
      },
      {
        clave: "EE3",
        nombre: "EE3. Equipo y tecnología",
        descripcion: "Evalúa la disponibilidad, actualización y funcionalidad del equipamiento tecnológico e infraestructura digital.",
        criterios: ["Infraestructura digital", "Equipamiento tecnológico"],
      },
    ],
  },
  {
    id: "inclusion",
    nombre: "Inclusión y neutralidad",
    descripcion: "Aspectos que miden si la biblioteca representa en su configuración servicios a todas las voces de la comunidad",
    variables: [
      {
        clave: "EI1",
        nombre: "EI1. Espacios inclusivos",
        descripcion: "Evalúa si los espacios físicos y servicios consideran las necesidades de distintos grupos sociales y capacidades diversas.",
        criterios: [
          "Diseño inclusivo",
          "Mobiliario adaptable",
          "Servicios especiales",
          "Salas especiales",
          "Señalética inclusiva",
          "Baños inclusivos",
        ],
      },
      {
        clave: "EI2",
        nombre: "EI2. Acceso universal a la tecnología",
        descripcion: "Evalúa la disponibilidad de herramientas tecnológicas accesibles e inclusivas para distintos tipos de usuarios.",
        criterios: ["Equipos adaptados", "Interfaces inclusivas"],
      },
      {
        clave: "EI3",
        nombre: "EI3. Neutralidad y libertad",
        descripcion: "Evalúa el respeto a la diversidad de pensamiento, la privacidad y la libertad de acceso a la información.",
        criterios: ["Programas inclusivos", "Confidencialidad del usuario", "Libertad de acceso"],
      },
      {
        clave: "EI4",
        nombre: "EI4. Colecciones inclusivas",
        descripcion: "Evalúa la representatividad, diversidad y accesibilidad de las colecciones físicas y digitales de la biblioteca.",
        criterios: ["Memoria colectiva", "Colecciones inclusivas", "Biblioteca digital inclusiva"],
      },
    ],
  },
  {
    id: "encuentro",
    nombre: "Encuentro e interacción",
    descripcion: "Aspectos que facilitan o dificultan la interacción social, la construcción de comunidades y la formación de redes sociales",
    variables: [
      {
        clave: "ED1",
        nombre: "ED1. Espacios de encuentro",
        descripcion: "Evalúa la capacidad de los espacios para favorecer la interacción social, el intercambio y la convivencia comunitaria.",
        criterios: [
          "Zonas de interacción",
          "Diversidad de áreas",
          "Flexibilidad del espacio",
          "Distribución del mobiliario",
          "Plataformas de expresión ciudadana",
        ],
      },
      {
        clave: "ED2",
        nombre: "ED2. Diversidad de usuarios",
        descripcion: "Evalúa el grado de diversidad social, etaria y cultural presente entre los usuarios de la biblioteca.",
        criterios: ["Públicos diversos"],
      },
      {
        clave: "ED3",
        nombre: "ED3. Diversidad de actividades",
        descripcion: "Evalúa la variedad de actividades culturales, educativas y recreativas desarrolladas en la biblioteca.",
        criterios: ["Animación"],
      },
      {
        clave: "ED4",
        nombre: "ED4. Vitalidad/animación pública",
        descripcion: "Evalúa el dinamismo, la actividad social y la capacidad de atracción del espacio bibliotecario hacia la comunidad.",
        criterios: ["Elementos interactivos", "Comunidad lectora", "Animación exterior", "Contenidos atractivos"],
      },
      {
        clave: "EM1",
        nombre: "EM1. Valor del espacio para usuarios",
        descripcion: "Evalúa el significado simbólico, afectivo y cultural que la biblioteca tiene para sus usuarios y la comunidad.",
        criterios: [
          "Identidad y significado cultural",
          "Apropiación simbólica",
          "Carácter emblemático",
          "Apropiación cotidiana",
        ],
      },
      {
        clave: "EN1",
        nombre: "EN1. Áreas/espacios verdes",
        descripcion: "Evalúa la presencia e integración de elementos naturales y áreas verdes en la experiencia espacial de la biblioteca.",
        criterios: ["Provisión de áreas verdes", "Integración interior–exterior"],
      },
      {
        clave: "EE1",
        nombre: "EE1. Imagen",
        descripcion: "Evalúa la calidad estética, percepción visual y atractivo arquitectónico de la biblioteca y su entorno inmediato.",
        criterios: ["Arquitectura atractiva", "Calidad de la imagen", "Zona agradable para llegar caminando"],
      },
    ],
  },
]

export const SUBDIMENSIONES_INDICE2 = [
  {
    id: "comunidad_agente",
    nombre: "La comunidad como agente",
    descripcion: "Variables que miden el grado en que la comunidad actúa como agente activo en la configuración y sostenibilidad de la biblioteca",
    indice: 2,
    variables: [
      {
        clave: "SC1",
        nombre: "SC1. Participación",
        descripcion: "Grado en que la comunidad interviene activamente en la configuración, toma de decisiones y aprovechamiento de la biblioteca, incidiendo de manera directa en su diseño, funcionamiento y evolución.",
        criterios: [],
      },
      {
        clave: "SC2",
        nombre: "SC2. Acciones de agencia",
        descripcion: "Capacidad de la comunidad para ejercer influencia efectiva y deliberada en la gobernanza y evaluación de la biblioteca, expresando sus intereses, necesidades y propuestas.",
        criterios: [],
      },
      {
        clave: "SC3",
        nombre: "SC3. Donaciones",
        descripcion: "Contribuciones voluntarias de la comunidad que fortalecen los recursos, infraestructura y sostenibilidad de la biblioteca, tanto de manera directa como mediante la gestión de apoyos externos.",
        criterios: [],
      },
      {
        clave: "SC4",
        nombre: "SC4. Proyección pública",
        descripcion: "Capacidad de la comunidad para visibilizar, posicionar y amplificar el valor de la biblioteca en el entorno social, promoviendo su reconocimiento como espacio de transformación comunitaria.",
        criterios: [],
      },
    ],
  },
]

/** Todas las subdimensiones de todos los índices */
export const TODAS_SUBDIMENSIONES = [...SUBDIMENSIONES, ...SUBDIMENSIONES_INDICE2]

/** Devuelve el objeto de catálogo de una variable por su clave (busca en todos los índices) */
export function findVarData(clave) {
  for (const sub of TODAS_SUBDIMENSIONES) {
    const v = sub.variables.find((v) => v.clave === clave)
    if (v) return v
  }
  return null
}
