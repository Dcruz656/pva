/**
 * Datos precargados del instrumento de evaluación.
 * Dimensión principal: La biblioteca como espacio público
 */

export const DIMENSION_PRINCIPAL = "La biblioteca como espacio público"

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
      },
      {
        clave: "EX2",
        nombre: "EX2. Conexión física",
        descripcion: "Evalúa la facilidad de conexión peatonal, vehicular y mediante transporte público hacia la biblioteca.",
      },
      {
        clave: "EA1",
        nombre: "EA1. Acceso y accesibilidad física",
        descripcion: "Evalúa las condiciones físicas y espaciales que permiten el ingreso, desplazamiento y uso de las instalaciones.",
      },
      {
        clave: "EA2",
        nombre: "EA2. Acceso y accesibilidad virtual",
        descripcion: "Evalúa la disponibilidad y facilidad de acceso a servicios, contenidos y plataformas digitales de la biblioteca.",
      },
      {
        clave: "EV1",
        nombre: "EV1. Visibilidad física",
        descripcion: "Evalúa qué tan identificable y perceptible es la biblioteca dentro del entorno urbano y desde el espacio público.",
      },
      {
        clave: "EV2",
        nombre: "EV2. Visibilidad online",
        descripcion: "Evalúa la presencia, difusión y alcance digital de la biblioteca en plataformas virtuales y medios digitales.",
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
      },
      {
        clave: "ES2",
        nombre: "ES2. Seguridad en las colecciones",
        descripcion: "Evalúa las medidas destinadas a la protección, conservación y resguardo de los materiales y recursos bibliográficos.",
      },
      {
        clave: "ES3",
        nombre: "ES3. Seguridad de las personas",
        descripcion: "Evalúa las condiciones que garantizan la integridad física y el bienestar de los usuarios dentro de la biblioteca.",
      },
      {
        clave: "ES4",
        nombre: "ES4. Vigilancia digital",
        descripcion: "Evalúa las medidas de protección de datos, privacidad y seguridad en el uso de plataformas y servicios digitales.",
      },
      {
        clave: "EF1",
        nombre: "EF1. Normas y regulación",
        descripcion: "Evalúa la claridad, accesibilidad y aplicación de normas de uso y convivencia dentro de la biblioteca.",
      },
      {
        clave: "EF2",
        nombre: "EF2. Mantenimiento (limpieza, cuidado)",
        descripcion: "Evalúa el estado de conservación, limpieza y mantenimiento general de las instalaciones.",
      },
      {
        clave: "EF3",
        nombre: "EF3. Propiedad/agente",
        descripcion: "Evalúa el tipo de responsabilidad institucional que tiene el agente del espacio bibliotecario.",
      },
      {
        clave: "EC1",
        nombre: "EC1. Iluminación",
        descripcion: "Evalúa la calidad y adecuación de la iluminación natural y artificial en los distintos espacios de la biblioteca.",
      },
      {
        clave: "EC2",
        nombre: "EC2. Comodidad climática",
        descripcion: "Evalúa las condiciones ambientales internas relacionadas con temperatura, ventilación y confort térmico.",
      },
      {
        clave: "EC3",
        nombre: "EC3. Comodidad de los espacios",
        descripcion: "Evalúa el nivel de confort físico, funcional y acústico de los espacios destinados a la permanencia y uso de los usuarios.",
      },
      {
        clave: "EE1",
        nombre: "EE1. Instalaciones básicas",
        descripcion: "Evalúa la disponibilidad y calidad de servicios básicos complementarios para la atención y permanencia de usuarios.",
      },
      {
        clave: "EE2",
        nombre: "EE2. Mobiliario",
        descripcion: "Evalúa la adecuación, ergonomía y funcionalidad del mobiliario disponible para diferentes actividades y usuarios.",
      },
      {
        clave: "EE3",
        nombre: "EE3. Equipo y tecnología",
        descripcion: "Evalúa la disponibilidad, actualización y funcionalidad del equipamiento tecnológico e infraestructura digital.",
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
      },
      {
        clave: "EI2",
        nombre: "EI2. Acceso universal a la tecnología",
        descripcion: "Evalúa la disponibilidad de herramientas tecnológicas accesibles e inclusivas para distintos tipos de usuarios.",
      },
      {
        clave: "EI3",
        nombre: "EI3. Neutralidad y libertad",
        descripcion: "Evalúa el respeto a la diversidad de pensamiento, la privacidad y la libertad de acceso a la información.",
      },
      {
        clave: "EI4",
        nombre: "EI4. Colecciones inclusivas",
        descripcion: "Evalúa la representatividad, diversidad y accesibilidad de las colecciones físicas y digitales de la biblioteca.",
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
      },
      {
        clave: "ED2",
        nombre: "ED2. Diversidad de usuarios",
        descripcion: "Evalúa el grado de diversidad social, etaria y cultural presente entre los usuarios de la biblioteca.",
      },
      {
        clave: "ED3",
        nombre: "ED3. Diversidad de actividades",
        descripcion: "Evalúa la variedad de actividades culturales, educativas y recreativas desarrolladas en la biblioteca.",
      },
      {
        clave: "ED4",
        nombre: "ED4. Vitalidad/animación pública",
        descripcion: "Evalúa el dinamismo, la actividad social y la capacidad de atracción del espacio bibliotecario hacia la comunidad.",
      },
      {
        clave: "EM1",
        nombre: "EM1. Valor del espacio para usuarios",
        descripcion: "Evalúa el significado simbólico, afectivo y cultural que la biblioteca tiene para sus usuarios y la comunidad.",
      },
      {
        clave: "EN1",
        nombre: "EN1. Áreas/espacios verdes",
        descripcion: "Evalúa la presencia e integración de elementos naturales y áreas verdes en la experiencia espacial de la biblioteca.",
      },
      {
        clave: "EE1",
        nombre: "EE1. Imagen",
        descripcion: "Evalúa la calidad estética, percepción visual y atractivo arquitectónico de la biblioteca y su entorno inmediato.",
      },
    ],
  },
]
