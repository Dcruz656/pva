/**
 * Datos precargados del instrumento de evaluación.
 * Índice 1: La biblioteca como espacio público
 * Índice 2: La biblioteca como sujeto colectivo
 */

export const DIMENSION_PRINCIPAL = "La biblioteca como espacio público"

export const INDICES = [
  { id: 1, nombre: "La biblioteca como espacio público" },
  { id: 2, nombre: "La biblioteca como sujeto colectivo" },
  { id: 3, nombre: "La biblioteca como objeto de debate y representación" },
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
        criterios: ["Rutas de evacuación", "Elementos de emergencia", "Protección contra crimen"],
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
  {
    id: "personal_agente",
    nombre: "Personal bibliotecario como agente",
    descripcion: "Formas de actuar y defender los intereses, derechos y necesidades de la comunidad, más allá del perfil de puesto.",
    indice: 2,
    variables: [
      {
        clave: "SB1",
        nombre: "SB1. Procesos participativos (Co-creación)",
        descripcion: "Capacidad del personal bibliotecario para involucrar activamente a la comunidad en la toma de decisiones, promoviendo procesos colaborativos que influyen en el diseño, gestión y uso de la biblioteca.",
        criterios: [],
      },
      {
        clave: "SB2",
        nombre: "SB2. Creación de públicos",
        descripcion: "Conjunto de acciones orientadas a diversificar y ampliar la base de usuarios, integrando a públicos no tradicionales mediante el rediseño de espacios, servicios y actividades relevantes.",
        criterios: [],
      },
      {
        clave: "SB3",
        nombre: "SB3. Laboratorios sociales",
        descripcion: "Capacidad del personal para convertir la biblioteca en un espacio de experimentación, innovación y creación colectiva donde la comunidad desarrolla soluciones a problemáticas sociales y culturales.",
        criterios: [],
      },
      {
        clave: "SB4",
        nombre: "SB4. Activismo del espacio",
        descripcion: "Uso estratégico del espacio bibliotecario (interno y externo) como herramienta de transformación social, orientado a atraer nuevos públicos y activar dinámicas comunitarias.",
        criterios: [],
      },
      {
        clave: "SB5",
        nombre: "SB5. Colaboración",
        descripcion: "Habilidad del personal bibliotecario para establecer alianzas estratégicas con actores locales, organizaciones y redes profesionales que fortalecen el impacto social y político de la biblioteca.",
        criterios: [],
      },
      {
        clave: "SB6",
        nombre: "SB6. Proyección pública",
        descripcion: "Capacidad del personal para posicionar la biblioteca como un actor relevante en el espacio público mediante estrategias de comunicación, visibilidad y liderazgo cultural.",
        criterios: [],
      },
      {
        clave: "SB7",
        nombre: "SB7. Narrativas de valor",
        descripcion: "Capacidad de construir, comunicar y evidenciar el impacto social de la biblioteca a través de relatos, indicadores y representaciones que reflejan su valor en la comunidad.",
        criterios: [],
      },
      {
        clave: "SB8",
        nombre: "SB8. Implicación/intervención pública",
        descripcion: "Nivel de compromiso del personal bibliotecario en la defensa de derechos, inclusión social y participación en causas comunitarias más allá de sus funciones tradicionales.",
        criterios: [],
      },
    ],
  },
  {
    id: "instituciones_legitiman",
    nombre: "Instituciones que legitiman y norman (ILN)",
    descripcion: "Formas de actuar para legitimar, normar y defender los intereses de la sociedad, las bibliotecas y del personal bibliotecario.",
    indice: 2,
    variables: [
      {
        clave: "SI1",
        nombre: "SI1. Posturas oficiales",
        descripcion: "Conjunto de declaraciones, lineamientos y posicionamientos institucionales que orientan el diseño, gestión y rol social de las bibliotecas y de su personal (Declaraciones manifiestos).",
        criterios: [],
      },
      {
        clave: "SI2",
        nombre: "SI2. Decisiones y acuerdos",
        descripcion: "Resoluciones y convenios formales (acuerdos, convenios, resoluciones) que establecen marcos de acción para bibliotecas, sus servicios, personal bibliotecario y usuarios.",
        criterios: [],
      },
      {
        clave: "SI3",
        nombre: "SI3. Compromisos formales",
        descripcion: "Los compromisos institucionales o gubernamentales que marcan una hoja de ruta con objetivos específicos que deben cumplirse en un tiempo determinado. (agendas, planes de trabajo)",
        criterios: [],
      },
      {
        clave: "SI4",
        nombre: "SI4. Regulación",
        descripcion: "Ecosistema legal y ético: conjunto de leyes, normas y disposiciones técnicas que regulan el funcionamiento, infraestructura, servicios y comportamiento dentro de las bibliotecas.",
        criterios: [],
      },
      {
        clave: "SI5",
        nombre: "SI5. Rendición de cuentas",
        descripcion: "Obligaciones institucionales explícitas. Procesos de transparencia mediante los cuales se reportan resultados, uso de recursos y desempeño institucional.",
        criterios: [],
      },
      {
        clave: "SI6",
        nombre: "SI6. Auditorías",
        descripcion: "Mecanismos de evaluación sistemática que revisan el desempeño, uso de recursos, impacto y cumplimiento normativo de las bibliotecas.",
        criterios: [],
      },
      {
        clave: "SI7",
        nombre: "SI7. Certificaciones",
        descripcion: "Reconocimientos formales que validan el cumplimiento de estándares de calidad en infraestructura, gestión y profesionalización del personal bibliotecario.",
        criterios: [],
      },
      {
        clave: "SI8",
        nombre: "SI8. Estándares",
        descripcion: "Criterios técnicos y operativos que establecen niveles mínimos o deseables de calidad en el diseño, servicios, accesibilidad y experiencia en las bibliotecas.",
        criterios: [],
      },
      {
        clave: "SI9",
        nombre: "SI9. Cooperación",
        descripcion: "Acciones de articulación institucional que fomentan la colaboración entre bibliotecas, organizaciones y comunidad para fortalecer su desarrollo e impacto.",
        criterios: [],
      },
      {
        clave: "SI10",
        nombre: "SI10. Recomendaciones operativas",
        descripcion: "Guías prácticas y directrices que indican cómo se deberían hacer las cosas. Son recomendaciones técnicas para la gestión diaria.",
        criterios: [],
      },
      {
        clave: "SI11",
        nombre: "SI11. Reconocimientos",
        descripcion: "Distinciones, premios o menciones institucionales que valoran las buenas prácticas, innovación, trayectoria y aportes de bibliotecas y personal bibliotecario.",
        criterios: [],
      },
    ],
  },
]

export const SUBDIMENSIONES_INDICE3 = [
  {
    id: "debates_movimientos",
    nombre: "Debates y movimientos públicos",
    descripcion: "Tipos de acciones que dan cuenta de los debates y movimientos públicos en torno a la biblioteca.",
    indice: 3,
    variables: [
      {
        clave: "OD1",
        nombre: "OD1. Propuestas e iniciativas públicas",
        descripcion: "Acciones impulsadas desde la ciudadanía, colectivos u otros actores sociales que buscan crear, transformar o redefinir las bibliotecas mediante proyectos, programas o reformas.",
        criterios: [],
      },
      {
        clave: "OD2",
        nombre: "OD2. Publicaciones académicas",
        descripcion: "Producción de conocimiento (investigaciones, artículos, informes) que analiza, problematiza y orienta el desarrollo de las bibliotecas en sus dimensiones espacial, organizativa y social.",
        criterios: [],
      },
      {
        clave: "OD3",
        nombre: "OD3. Comunicaciones públicas",
        descripcion: "Circulación de discursos en espacios públicos y mediáticos (congresos, conferencias, debates, páginas web, redes sociodigitales, documentales, videos, etc.) que influyen en la percepción, orientación y debate sobre las bibliotecas.",
        criterios: [],
      },
      {
        clave: "OD4",
        nombre: "OD4. Campañas publicitarias",
        descripcion: "Estrategias comunicativas organizadas que buscan sensibilizar, posicionar o movilizar apoyo en torno a necesidades, problemáticas o valores asociados a las bibliotecas.",
        criterios: [],
      },
      {
        clave: "OD5",
        nombre: "OD5. Cabildeo (lobbying)",
        descripcion: "Acciones de incidencia directa ante actores de poder o toma de decisiones para influir en políticas, recursos y definiciones relacionadas con las bibliotecas.",
        criterios: [],
      },
      {
        clave: "OD6",
        nombre: "OD6. Vigilancia ciudadana",
        descripcion: "Prácticas de monitoreo, seguimiento y exigencia de transparencia sobre decisiones, recursos y resultados vinculados a las bibliotecas.",
        criterios: [],
      },
      {
        clave: "OD7",
        nombre: "OD7. Movilización",
        descripcion: "Acciones colectivas organizadas que buscan influir, defender o transformar las condiciones de las bibliotecas mediante participación activa en el espacio público.",
        criterios: [],
      },
      {
        clave: "OD8",
        nombre: "OD8. Protestas públicas (defensa y abogacía)",
        descripcion: "Expresiones visibles de desacuerdo o defensa que buscan presionar cambios en políticas, condiciones o prácticas relacionadas con las bibliotecas.",
        criterios: [],
      },
    ],
  },
  {
    id: "alianzas_estrategicas",
    nombre: "Alianzas estratégicas con otros entes",
    descripcion: "Tipos de alianzas y estrategias que se realizan y discuten para aumentar el alcance y la visibilidad de las bibliotecas.",
    indice: 3,
    variables: [
      {
        clave: "OA1",
        nombre: "OA1. Relaciones con autoridades locales",
        descripcion: "Acciones de articulación con gobiernos locales y autoridades que buscan integrar a la biblioteca en proyectos urbanos, sociales y de desarrollo comunitario, garantizando sostenibilidad y acceso ciudadano.",
        criterios: [],
      },
      {
        clave: "OA2",
        nombre: "OA2. Participación en presupuestos públicos",
        descripcion: "Participación de las bibliotecas y sus actores en la asignación, planificación y gestión de recursos financieros públicos para infraestructura, programas y fortalecimiento institucional.",
        criterios: [],
      },
      {
        clave: "OA3",
        nombre: "OA3. Vinculación biblioteca-comunidad",
        descripcion: "Alianzas y colaboración directa con la comunidad para proyectos de innovación, voluntariado y ampliación de funciones, fortaleciendo la relación entre biblioteca y usuarios.",
        criterios: [],
      },
      {
        clave: "OA4",
        nombre: "OA4. Alianzas con organizaciones civiles e instituciones educativas",
        descripcion: "Convenios y acuerdos con escuelas, ONGs y redes educativas que fomentan el acceso a bibliotecas, recursos educativos, extensión cultural y programas de alfabetización informacional.",
        criterios: [],
      },
      {
        clave: "OA5",
        nombre: "OA5. Alianzas con empresas",
        descripcion: "Acuerdos estratégicos con empresas privadas para construcción, equipamiento, financiamiento de programas y formación profesional, buscando ampliar recursos y atraer nuevos públicos.",
        criterios: [],
      },
    ],
  },
  {
    id: "representaciones_artisticas",
    nombre: "Representaciones artísticas",
    descripcion: "Tipos de acciones artísticas que promueven una imagen de la biblioteca.",
    indice: 3,
    variables: [
      {
        clave: "OR1",
        nombre: "OR1. Narraciones (visuales, orales y escritas)",
        descripcion: "Representaciones de bibliotecas, bibliotecarios y usuarios en literatura, cine, artes visuales o narrativas orales que construyen modelos espaciales, de gestión y de uso, influyendo en la percepción pública y cultural de las bibliotecas.",
        criterios: [],
      },
      {
        clave: "OR2",
        nombre: "OR2. Performance y artes escénicas",
        descripcion: "Intervenciones escénicas o performativas que cuestionan normas institucionales, presentan modelos alternativos de gestión o transforman el espacio y la experiencia del usuario dentro de la biblioteca.",
        criterios: [],
      },
      {
        clave: "OR3",
        nombre: "OR3. Muralismo/arte urbano",
        descripcion: "Intervenciones artísticas en fachadas, espacios exteriores o interiores de la biblioteca que resignifican el espacio, generan identidad cultural y cuestionan o promueven modelos de gestión y uso.",
        criterios: [],
      },
      {
        clave: "OR4",
        nombre: "OR4. Ferias y exposiciones",
        descripcion: "Instalaciones, exposiciones o eventos culturales que transforman la biblioteca en un espacio de difusión artística, modificando su organización espacial, gestión y modalidades de uso.",
        criterios: [],
      },
      {
        clave: "OR5",
        nombre: "OR5. Presentaciones y festivales",
        descripcion: "Actividades temporales, festivales o eventos culturales que expanden la biblioteca más allá de sus muros, rompiendo usos tradicionales y fomentando participación activa de la comunidad.",
        criterios: [],
      },
    ],
  },
  {
    id: "representaciones_publicas",
    nombre: "Representaciones públicas",
    descripcion: "Tipos de acciones públicas desarrolladas por entidades comerciales y medios de comunicación que difunden una imagen de la biblioteca.",
    indice: 3,
    variables: [
      {
        clave: "OP1",
        nombre: "OP1. Marketing",
        descripcion: "Acciones de promoción que utilizan la imagen, estética y simbolismo de la biblioteca para influir en su diseño, gestión y percepción social, reforzando prestigio, posicionamiento y legitimidad cultural.",
        criterios: [],
      },
      {
        clave: "OP2",
        nombre: "OP2. Reportajes y noticias",
        descripcion: "Cobertura mediática que visibiliza, evalúa o critica la biblioteca, generando presión pública sobre su diseño, gestión y prácticas de uso, e influyendo en debates culturales.",
        criterios: [],
      },
      {
        clave: "OP3",
        nombre: "OP3. Comercialización de productos",
        descripcion: "Iniciativas que incorporan lógicas de consumo y alianzas comerciales dentro de la biblioteca, afectando el diseño del espacio, la gestión orientada al mercado y la forma en que se utiliza.",
        criterios: [],
      },
      {
        clave: "OP4",
        nombre: "OP4. Venta de libros",
        descripcion: "Influencia del mercado editorial en la disposición espacial, promoción y circulación de libros, así como en la formación de hábitos de lectura y prácticas de uso de la biblioteca.",
        criterios: [],
      },
      {
        clave: "OP5",
        nombre: "OP5. Eventos sociales y mediáticos",
        descripcion: "Organización de eventos públicos o mediáticos que transforman temporalmente la biblioteca en escenario cultural, influyendo en su diseño, gestión y formas de uso.",
        criterios: [],
      },
      {
        clave: "OP6",
        nombre: "OP6. Renders y visualización arquitectónica",
        descripcion: "Difusión de imágenes, modelos 3D o renders de bibliotecas ideales que orientan tendencias de diseño, justifican decisiones de gestión y construyen expectativas sobre el uso del espacio.",
        criterios: [],
      },
      {
        clave: "OP7",
        nombre: "OP7. Actividades turísticas",
        descripcion: "Diseño de bibliotecas como atractivos urbanos o culturales, incorporando estrategias de gestión turística y promoviendo su uso como destino de visitantes.",
        criterios: [],
      },
    ],
  },
]

/** Todas las subdimensiones de todos los índices */
export const TODAS_SUBDIMENSIONES = [...SUBDIMENSIONES, ...SUBDIMENSIONES_INDICE2, ...SUBDIMENSIONES_INDICE3]

/** Devuelve el objeto de catálogo de una variable por su clave (busca en todos los índices) */
export function findVarData(clave) {
  for (const sub of TODAS_SUBDIMENSIONES) {
    const v = sub.variables.find((v) => v.clave === clave)
    if (v) return v
  }
  return null
}
