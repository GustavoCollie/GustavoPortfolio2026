/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENIDO DE PARTIDA
 *
 *  La fuente de verdad en producción es la base de datos; esto es lo
 *  que se siembra con `npm run db:seed` y lo que se sirve si la base
 *  no responde. Para cambios del día a día, el panel de /admin.
 *  Los textos provienen del CV "Gustavo Stephano Márquez Medina.docx"
 *  y fueron reescritos en clave de portafolio (impacto > tarea).
 * ─────────────────────────────────────────────────────────────
 */

export const perfil = {
  nombre: "Gustavo Stephano",
  apellidos: "Márquez Medina",
  nombreCorto: "Gustavo Márquez",
  rol: "Business & Software Development",
  titular: "Estrategia de negocio, datos y producto digital.",
  subtitular:
    "Conecto la decisión comercial con el producto que la ejecuta: modelos financieros, KPIs y apps móviles y web construidas con Scrum.",
  ubicacion: "Ica, Perú",
  disponibilidad: "Disponible para proyectos y roles híbridos",
  email: "gustavosmarquezmedina@gmail.com",
  telefono: "+51 995 876 300",
  telefonoRaw: "+51995876300",
  linkedin: "https://www.linkedin.com/in/gustavosmarquez",
  linkedinLabel: "linkedin.com/in/gustavosmarquez",
};


/**
 * ─────────────────────────────────────────────────────────────
 *  IMÁGENES
 *
 *  Criterio: un solo retrato. El resto son fotos de la operación,
 *  porque una foto de un contenedor rumbo a China dice más del
 *  perfil que tres retratos distintos de la misma persona.
 *
 *  Toda imagen lleva `pie`: una foto sin pie es decoración, una
 *  foto con pie es evidencia.
 *
 *  A la del contenedor se le recortaron 92 px inferiores para quitar
 *  la marca de agua del teléfono, que quedaba a la vista al aclarar
 *  el tratamiento.
 * ─────────────────────────────────────────────────────────────
 */
export type Imagen = {
  src: string;
  alt: string;
  pie: string;
  /** Encuadre: qué parte de la foto se conserva al recortar. */
  foco?: string;
};

export const imagenes = {
  /** La única foto personal del sitio. Sólo aparece en /sobre-mi. */
  retrato: {
    src: "/peru-business-fest.jpg",
    alt: "Gustavo Márquez en el Perú Business Fest, Lima",
    pie: "Perú Business Fest · Lima",
    foco: "50% 42%",
  } satisfies Imagen,

  /** Plano de apertura: la operación real. */
  operacion: {
    src: "/embarque-china.jpg",
    alt: "Contenedor refrigerado cargado con producto de exportación con destino a China",
    pie: "Embarque a China · carga de contenedor",
    foco: "50% 50%",
  } satisfies Imagen,
};

/** Frases cortas del hero, se alternan en el reel cinematográfico. */
export const reel = [
  "Planeamiento estratégico",
  "Product & Project Management",
  "Scrum / Agile",
  "Apps Android · iOS · Web",
  "Business Intelligence",
  "Comercio internacional",
];

/** Manifiesto — se revela palabra por palabra con el scroll. */
export const manifiesto = {
  kicker: "Perfil",
  texto:
    "Soy profesional en Negocios Internacionales que aprendió a construir software. Diseño la estrategia, la traduzco a un backlog y la llevo hasta el producto que la gente usa todos los días.",
  cierre:
    "Mi valor diferencial es el perfil híbrido — estrategia, datos y ejecución operativa sin traductores en el medio.",
};

export const metricas = [
  {
    valor: 12,
    sufijo: "%",
    prefijo: "-",
    titulo: "Costos logísticos",
    detalle:
      "Reducción sostenida mediante renegociación de proveedores y control de costeo por contenedor.",
  },
  {
    valor: 6,
    sufijo: "+",
    prefijo: "",
    titulo: "Años de experiencia",
    detalle:
      "Agroexportación, minería y comercio exterior, en roles comerciales, financieros y de producto.",
  },
  {
    valor: 2,
    sufijo: "",
    prefijo: "",
    titulo: "Mercados abiertos",
    detalle:
      "Apertura comercial hacia Asia y Norteamérica con evaluación de mercado y costeo FOB / CIF.",
  },
  {
    valor: 1,
    sufijo: "",
    prefijo: "",
    titulo: "Producto digital liderado",
    detalle:
      "Collie App: de la definición del problema al release en Android, iOS y web como PM.",
  },
];

export type Experiencia = {
  empresa: string;
  cargo: string;
  periodo: string;
  desde: string;
  hasta: string;
  sector: string;
  /** Part-time, por proyecto, prácticas… Explica solapamientos de fechas. */
  modalidad?: string;
  resumen: string;
  logros: string[];
  stack: string[];
};

export const experiencias: Experiencia[] = [
  {
    empresa: "Collie Valley S.A.C.",
    cargo: "Gerente de Comercio y Finanzas",
    periodo: "Ene. 2025 — Actualidad",
    desde: "2025",
    hasta: "actualidad",
    sector: "Agroexportación",
    resumen:
      "Dirección comercial y financiera de la operación exportadora, y liderazgo de producto en la digitalización de la empresa.",
    logros: [
      "Dirigí el plan comercial y financiero de la exportadora, alineando objetivos de campaña con proyecciones de crecimiento.",
      "Definí el cuadro de mando de gerencia: rentabilidad por contenedor, costo logístico y desempeño comercial en un solo tablero.",
      "Actué como Product Manager de Collie App, solución digital que centraliza información operativa, financiera y comercial en tiempo real.",
      "Implementé Scrum: backlog priorizado, sprints y ceremonias, elevando la previsibilidad de entrega del equipo.",
      "Modelé escenarios financieros para la expansión hacia mercados internacionales.",
      "Coordiné operaciones logísticas bajo Incoterms FOB y CIF.",
    ],
    stack: ["Power BI", "Jira", "MS Project", "Excel avanzado", "Scrum"],
  },
  {
    empresa: "Agroexportadora Valle Encantado S.A.C.",
    cargo: "Cofundador · Especialista en Desarrollo de Negocio",
    periodo: "Jul. 2023 — Nov. 2024",
    desde: "2023",
    hasta: "2024",
    sector: "Agroexportación",
    resumen:
      "Construcción de la operación desde cero: mercado, estructura de costos, procesos internos y flujo de caja.",
    logros: [
      "Definí el modelo de negocio y la estructura de costos con la que salió la primera campaña.",
      "Segmenté la cartera de compradores por margen y riesgo para decidir a qué mercados ir primero.",
      "Sostuve la caja del primer año con control presupuestal, sin financiación externa.",
    ],
    stack: ["Excel avanzado", "Power BI", "Scrum", "Modelamiento financiero"],
  },
  {
    empresa: "Agrícola del Sur E.I.R.L.",
    cargo: "Especialista en Comercio Exterior",
    periodo: "Sep. 2022 — Jul. 2023",
    desde: "2022",
    hasta: "2023",
    sector: "Comercio exterior",
    resumen:
      "Gestión integral de operaciones de exportación e importación con foco en costo aduanero y logístico.",
    logros: [
      "Renegocié las tarifas del canal logístico, que era la partida con más margen de mejora.",
      "Llevé cada embarque de extremo a extremo: documentación, aduana y liberación en destino.",
      "Reduje incidencias aduaneras estandarizando la documentación por tipo de operación.",
    ],
    stack: ["Excel avanzado", "MS Project", "Incoterms", "Aduanas"],
  },
  {
    empresa: "Greenfields Minerals",
    cargo: "Asistente de Exportaciones",
    periodo: "Dic. 2021 — Ago. 2022",
    desde: "2021",
    hasta: "2022",
    sector: "Minería",
    resumen:
      "Régimen DRAWBACK, documentación aduanera y analítica de recuperación tributaria.",
    logros: [
      "Gestioné el régimen DRAWBACK y la analítica de recuperación tributaria.",
      "Coordiné la documentación de exportación en VUCE y los certificados de origen.",
      "Automaticé el seguimiento de tiempos y costos logísticos, que hasta entonces se llevaba a mano.",
    ],
    stack: ["Power BI", "VUCE", "Excel avanzado"],
  },
  {
    empresa: "Greenvic S.A.",
    cargo: "Analista de Producción",
    periodo: "Abr. 2020 — Feb. 2021",
    desde: "2020",
    hasta: "2021",
    sector: "Agroindustria",
    resumen:
      "Control de producción y costos en planta agroexportadora sobre ERP NISIRA.",
    logros: [
      "Controlé producción y costos de planta sobre el ERP NISIRA.",
      "Convertí los datos del ERP en indicadores de rendimiento por lote y por línea.",
      "Detecté desviaciones de costo por proceso comparando lo planificado con lo real.",
    ],
    stack: ["ERP NISIRA", "Power BI", "Excel avanzado"],
  },
];

export type Proyecto = {
  slug: string;
  nombre: string;
  tagline: string;
  categoria: string;
  plataformas: string[];
  anio: string;
  rol: string;
  problema: string;
  solucion: string;
  impacto: string[];
  stack: string[];
  proceso: string[];
  destacado: boolean;
};

export const proyectos: Proyecto[] = [
  {
    slug: "collie-app",
    nombre: "Collie App",
    tagline: "El centro de mando de una agroexportadora, en el bolsillo.",
    categoria: "Producto digital · Enterprise",
    plataformas: ["Android", "iOS", "Web"],
    anio: "2025 — 2026",
    rol: "Product Manager · Producto y desarrollo",
    problema:
      "La operación vivía repartida entre hojas de cálculo, correos y WhatsApp. Nadie tenía la misma versión de la verdad: costos por contenedor, avance de campo y estado comercial se reconciliaban a mano, con días de retraso.",
    solucion:
      "Una aplicación móvil y web que centraliza la información operativa, financiera y comercial en un solo modelo de datos, con captura desde campo y tableros de decisión en tiempo real para gerencia.",
    impacto: [
      "Información unificada: una sola fuente de verdad operativa, financiera y comercial.",
      "Decisiones en tiempo real en lugar de reportes semanales reconstruidos a mano.",
      "Trazabilidad del costo por contenedor conectada directamente al margen comercial.",
      "Adopción por parte de equipos de campo, logística y gerencia.",
    ],
    stack: [
      "Product Management",
      "Scrum",
      "Jira",
      "Figma",
      "Prototipado",
      "Modelado de datos",
      "Power BI",
    ],
    proceso: [
      "Discovery con usuarios de campo, logística, finanzas y gerencia.",
      "Mapa de procesos y definición del modelo de datos común.",
      "Backlog priorizado por valor de negocio, no por facilidad técnica.",
      "Sprints de 2 semanas con demo y feedback del usuario real.",
      "Release progresivo y acompañamiento de adopción.",
    ],
    destacado: true,
  },
  {
    slug: "collie-web",
    nombre: "Collie Web",
    tagline: "La cara comercial internacional de la operación.",
    categoria: "Plataforma web · B2B",
    plataformas: ["Web"],
    anio: "2025",
    rol: "Product Owner & Estrategia",
    problema:
      "La captación de compradores internacionales dependía de ferias y contactos personales. No existía un activo digital que sostuviera la conversación comercial fuera de la reunión.",
    solucion:
      "Plataforma web corporativa orientada a compradores internacionales: ficha técnica de producto, calendario de campaña, capacidades de planta y canal directo de cotización.",
    impacto: [
      "Soporte digital a la apertura de mercados en Asia y Norteamérica.",
      "Ciclo comercial más corto: la ficha técnica deja de ser un PDF por correo.",
      "Posicionamiento de marca frente a compradores y certificadoras.",
    ],
    stack: [
      "Desarrollo web",
      "Arquitectura de contenido",
      "SEO",
      "Analítica web",
      "Figma",
    ],
    proceso: [
      "Investigación del comprador internacional y sus objeciones reales.",
      "Arquitectura de contenido orientada a decisión de compra.",
      "Diseño y desarrollo iterativo.",
      "Medición de comportamiento y ajuste del mensaje.",
    ],
    destacado: true,
  },
  {
    slug: "control-embarques",
    nombre: "Control de Embarques & Costeo",
    tagline: "Del contenedor al margen, sin intermediarios manuales.",
    categoria: "Business Intelligence",
    plataformas: ["Web", "Power BI"],
    anio: "2024 — 2026",
    rol: "Analista de negocio & diseño de indicadores",
    problema:
      "El costo real de un embarque se conocía semanas después de zarpar. Cualquier decisión de precio se tomaba con información vencida.",
    solucion:
      "Modelo de costeo por contenedor y suite de dashboards que integra costos logísticos, aduaneros y de producción contra el precio de venta por mercado y producto.",
    impacto: [
      "Reducción de más del 12% en costos logísticos.",
      "Margen visible por contenedor, mercado y producto.",
      "Escenarios de proyección para decisiones de expansión.",
    ],
    stack: ["Power BI", "DAX", "Excel avanzado", "ERP NISIRA", "Modelado de costos"],
    proceso: [
      "Levantamiento de la estructura real de costos.",
      "Definición del diccionario de KPIs con gerencia.",
      "Modelado de datos y automatización de la carga.",
      "Tableros por rol: gerencia, comercial y logística.",
    ],
    destacado: true,
  },
  {
    slug: "operacion-agil",
    nombre: "Operación Ágil",
    tagline: "Scrum aplicado a equipos que no son de software.",
    categoria: "Transformación · Metodología",
    plataformas: ["Proceso"],
    anio: "2022 — 2026",
    rol: "Facilitador Scrum & Project Manager",
    problema:
      "Equipos comerciales y logísticos trabajando por urgencias, sin backlog, sin cadencia y sin forma de saber si el mes iba bien antes de que terminara.",
    solucion:
      "Implantación de un marco ágil adaptado: backlog de negocio priorizado, sprints, dailies cortas, tablero visible en Jira y planificación de hitos en MS Project.",
    impacto: [
      "Cadencia de entrega predecible en áreas no técnicas.",
      "Prioridades explícitas y discutidas, no heredadas del ruido.",
      "Visibilidad de avance para gerencia sin pedir reportes.",
    ],
    stack: ["Scrum", "Kanban", "Jira", "MS Project", "OKR / KPI"],
    proceso: [
      "Diagnóstico del flujo de trabajo actual.",
      "Definición de backlog y criterios de terminado.",
      "Ceremonias mínimas viables y ajuste por retro.",
      "Métricas de proceso y mejora continua.",
    ],
    destacado: false,
  },
];

export const metodologia = {
  kicker: "Cómo trabajo",
  titulo: "De la hipótesis de negocio al release.",
  intro:
    "No separo la estrategia del producto. El mismo marco que uso para priorizar un backlog es el que uso para priorizar una inversión comercial: valor, riesgo y evidencia.",
  fases: [
    {
      n: "01",
      nombre: "Discovery",
      claim: "Entender el negocio antes que la solución.",
      detalle:
        "Entrevistas con usuarios reales, mapa de procesos, estructura de costos y definición del problema en términos medibles. Si no puedo escribir el KPI, todavía no entendí el problema.",
      entregables: ["Mapa de procesos", "Definición de problema", "KPIs objetivo"],
    },
    {
      n: "02",
      nombre: "Estrategia",
      claim: "Modelar el impacto antes de gastar un sprint.",
      detalle:
        "Modelamiento financiero, escenarios y business case. Priorización del backlog por valor de negocio y riesgo, no por comodidad técnica.",
      entregables: ["Business case", "Backlog priorizado", "Roadmap"],
    },
    {
      n: "03",
      nombre: "Delivery",
      claim: "Sprints con demo real, no con avance declarado.",
      detalle:
        "Scrum con sprints de dos semanas, ceremonias mínimas viables, tablero visible en Jira y planificación de hitos en MS Project. Cada sprint termina con algo que el usuario puede tocar.",
      entregables: ["Sprints", "Demos", "Tablero Jira"],
    },
    {
      n: "04",
      nombre: "Medición",
      claim: "El dashboard es parte del entregable.",
      detalle:
        "Instrumentación de KPIs en Power BI desde el día uno. Lo que no se mide no se defiende en un comité de gerencia.",
      entregables: ["Dashboards", "Reporte de impacto", "Retro"],
    },
  ],
};

/**
 * Los tres dominios cuentan una secuencia, no una lista suelta:
 * decidir → construir → medir → volver a decidir.
 */
export const competencias = [
  {
    grupo: "Negocio & Estrategia",
    icono: "negocio" as const,
    claim: "Decidir con números, no con intuición.",
    detalle:
      "Antes de comprometer capacidad: cuánto vale, cuánto arriesga y con qué evidencia se sostiene.",
    items: [
      "Planeamiento estratégico",
      "Modelamiento financiero",
      "Business case & escenarios",
      "Gestión de KPIs",
      "Comercio exterior e Incoterms",
      "Negociación con proveedores",
    ],
  },
  {
    grupo: "Producto & Proyectos",
    icono: "producto" as const,
    claim: "Convertir la decisión en backlog.",
    detalle:
      "Lo que se aprobó en el comité tiene que caber en un sprint y salir con demo, no con avance declarado.",
    items: [
      "Product Management",
      "Scrum & Agile",
      "Kanban",
      "Backlog & priorización",
      "Jira",
      "MS Project",
    ],
  },
  {
    grupo: "Datos & Tecnología",
    icono: "datos" as const,
    claim: "Medir lo que se entregó.",
    detalle:
      "El tablero cierra el círculo: sin él no hay forma de defender la siguiente inversión.",
    items: [
      "Power BI & DAX",
      "Excel avanzado",
      "ERP NISIRA",
      "Apps Android / iOS",
      "Desarrollo web",
      "Análisis de datos",
    ],
  },
];

export const educacion = [
  {
    titulo: "Representante Aduanero",
    institucion: "IAT — SUNAT",
    anio: "2023",
    tipo: "Certificación",
  },
  {
    titulo: "Bachiller en Negocios Internacionales",
    institucion: "Universidad Nacional San Luis Gonzaga de Ica",
    anio: "2020",
    tipo: "Grado académico",
  },
];

export const idiomas = [
  { idioma: "Español", nivel: "Nativo · C2", pct: 100 },
  { idioma: "Inglés", nivel: "B2 (MCER) · profesional de trabajo", pct: 78 },
];

/**
 * Tres destinos, no seis. El sitio es un portafolio de proyectos:
 * el trabajo es la sección principal, el perfil la sostiene y el
 * contacto la cierra. Una navegación de seis entradas obligaba a
 * elegir antes de haber visto nada.
 */
export const navegacion = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

/**
 * ─────────────────────────────────────────────────────────────
 *  CASO EN PROFUNDIDAD — Collie App
 *
 *  Un portafolio con cuatro tarjetas demuestra que hiciste cosas.
 *  Un caso que cuenta las decisiones difíciles y lo que salió mal
 *  demuestra cómo piensas, que es lo que realmente se contrata.
 * ─────────────────────────────────────────────────────────────
 */
export const casoCollieApp = {
  slug: "collie-app",
  titulo: "Collie App",
  subtitulo: "Cómo se digitaliza una agroexportadora sin parar la campaña",
  periodo: "2025 — 2026",
  rol: "Product Manager · Producto y desarrollo",
  duracion: "12 meses",

  contexto: [
    "Collie Valley exportaba con una operación que funcionaba, pero cuya información vivía repartida: el avance de campo en un cuaderno, los costos en hojas de cálculo, el estado comercial en correos y el resto en la memoria de las personas. Nadie mentía; simplemente cada área tenía su propia versión de la verdad.",
    "El síntoma llegaba siempre igual. En el comité de gerencia alguien preguntaba cuánto habíamos ganado con un contenedor y la respuesta honesta era «en dos semanas te digo», porque había que reconciliar a mano el costo logístico, el aduanero y el de planta contra la factura comercial. Para entonces el precio de la siguiente venta ya estaba puesto.",
    "El primer intento fue construir dashboards en Power BI. Resolvió la mitad: ya se podía ver el dato, pero seguía entrando a mano y con días de retraso. La otra mitad del problema no era de visualización sino de captura, y eso exigía software.",
  ],

  restricciones: [
    {
      titulo: "Conectividad de campo",
      detalle:
        "Buena parte de la captura ocurre en fundo, donde la señal es intermitente. Cualquier diseño que asumiera conexión permanente iba a fracasar el primer día.",
    },
    {
      titulo: "Usuarios no técnicos",
      detalle:
        "Los usuarios de campo no son usuarios de software. Si una tarea tomaba más tiempo que anotarla en el cuaderno, el cuaderno ganaba.",
    },
    {
      titulo: "La campaña no se detiene",
      detalle:
        "No había ventana para migrar. La operación tenía que seguir funcionando en paralelo mientras se implantaba el sistema.",
    },
    {
      titulo: "Equipo pequeño",
      detalle:
        "Sin lujo de especialistas: el mismo grupo hacía discovery, construcción y acompañamiento de adopción.",
    },
  ],

  decisiones: [
    {
      titulo: "Empezar por el costeo, no por lo más visible",
      alternativa:
        "Arrancar por el módulo de campo, que era el más pedido y el más vistoso en una demo.",
      eleccion:
        "Arrancamos por el modelo de costos por contenedor, que no se ve en pantalla pero es de donde cuelga todo lo demás.",
      porque:
        "El costeo era el único módulo cuyo dato usaban las tres áreas. Construirlo primero obligó a acordar un modelo de datos común antes de escribir interfaces, y evitó tener que rehacerlas después.",
    },
    {
      titulo: "Captura offline primero",
      alternativa:
        "Una app conectada, más simple de construir y de mantener.",
      eleccion:
        "Captura local con sincronización posterior, asumiendo la complejidad de resolver conflictos.",
      porque:
        "Una app que falla donde se usa no es una app: es un formulario que la gente rodea. El costo técnico se pagó una vez; el costo de la desconfianza del usuario no se recupera.",
    },
    {
      titulo: "Menos campos de los que pedía el negocio",
      alternativa:
        "Recoger todo lo que cada área quería, que era mucho.",
      eleccion:
        "Recortar al mínimo que sostuviera los KPIs acordados, y añadir sólo con evidencia de uso.",
      porque:
        "Cada campo extra es tiempo del usuario en campo. La regla fue: si un campo no alimenta un indicador que alguien mira, no entra.",
    },
    {
      titulo: "El dashboard como parte del entregable, no como fase final",
      alternativa:
        "Construir la app, y medir después.",
      eleccion:
        "Instrumentar los KPIs en Power BI desde el primer sprint, aunque los datos fueran pocos.",
      porque:
        "Sin medición desde el día uno no hay forma de defender la inversión en el comité del mes siguiente, y un proyecto que no se puede defender se cancela.",
    },
  ],

  fases: [
    {
      n: "01",
      nombre: "Discovery",
      detalle:
        "Entrevistas con campo, logística, finanzas y gerencia. Mapa de procesos y estructura real de costos. La pregunta que ordenó todo: ¿qué decisión tomas hoy con información vieja?",
    },
    {
      n: "02",
      nombre: "Modelo de datos",
      detalle:
        "Un solo diccionario de entidades para las tres áreas. Fue la discusión más larga del proyecto y la que más tiempo ahorró después.",
    },
    {
      n: "03",
      nombre: "Construcción por sprints",
      detalle:
        "Sprints de dos semanas con demo frente a usuarios reales. Backlog priorizado por valor de negocio, no por facilidad técnica.",
    },
    {
      n: "04",
      nombre: "Release y adopción",
      detalle:
        "Salida progresiva por área en vez de un corte único. Acompañamiento en campo durante las primeras semanas.",
    },
  ],

  resultados: [
    "Una sola fuente de verdad operativa, financiera y comercial.",
    "El costo por contenedor pasó de reconstruirse a mano a estar disponible en el tablero.",
    "Decisiones de precio con información de la campaña en curso, no de la anterior.",
    "Adopción sostenida en campo, logística y gerencia.",
  ],

  /** Sólo cifras verificables. Antes había tres marcadas «—» a la espera
   *  de rellenarse: un número vacío en un caso de estudio resta más
   *  credibilidad de la que suma el hueco donde debería estar. */
  cifras: [
    { valor: "3", etiqueta: "Plataformas: Android, iOS y web" },
    { valor: "12", etiqueta: "Meses de proyecto" },
    { valor: "4", etiqueta: "Áreas integradas en un modelo de datos" },
  ],

  aprendizajes: [
    {
      titulo: "El módulo más pedido no es el más importante",
      detalle:
        "Todos pedían la app de campo. Empezar por el costeo fue impopular durante seis semanas y correcto durante el resto del proyecto.",
    },
    {
      titulo: "La adopción se diseña, no se anuncia",
      detalle:
        "El primer piloto lo lanzamos con un correo y una guía. Casi nadie lo usó. El segundo lo lanzamos acompañando a la gente en campo dos días. Ahí arrancó.",
    },
    {
      titulo: "Un modelo de datos acordado vale más que tres pantallas bonitas",
      detalle:
        "Cada semana que discutimos qué significaba exactamente «costo de contenedor» nos ahorró un mes de reconciliaciones después.",
    },
    {
      titulo: "Medir desde el sprint 1, aunque el dato sea pobre",
      detalle:
        "Tener el tablero vacío desde el principio obligó a definir qué íbamos a considerar éxito antes de poder acomodar la definición al resultado.",
    },
  ],
};
