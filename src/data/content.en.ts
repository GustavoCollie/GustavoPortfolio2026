/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENIDO EN INGLÉS
 *
 *  Espejo EXACTO de `content.ts`: mismas claves, mismos tipos, mismo
 *  orden. Los nombres de las claves siguen en español a propósito —
 *  son el esquema del sitio, no texto de interfaz. Traducirlos
 *  obligaría a cada componente a saber en qué idioma está para poder
 *  leer un campo, que es justo lo que este archivo evita: los
 *  componentes piden `c.perfil.rol` y da igual el idioma.
 *
 *  Si cambias un dato en `content.ts`, cámbialo también aquí. Los
 *  tipos están importados de allí, así que si añades un campo
 *  obligatorio, TypeScript señalará este archivo hasta que lo tengas.
 *
 *  Las imágenes NO se duplican: son las mismas fotos.
 *
 *  Igual que el español, esto es contenido de PARTIDA: lo que se
 *  siembra y lo que se sirve si la base no responde. El panel edita
 *  los dos idiomas desde la base.
 * ─────────────────────────────────────────────────────────────
 */

import type { Experiencia, Proyecto } from "./content";

export const perfil = {
  nombre: "Gustavo Stephano",
  apellidos: "Márquez Medina",
  nombreCorto: "Gustavo Márquez",
  rol: "Business & Software Development",
  titular: "Business strategy, data and digital product.",
  subtitular:
    "I connect the commercial decision to the product that executes it: financial models, KPIs, and mobile and web apps built with Scrum.",
  ubicacion: "Ica, Peru",
  disponibilidad: "Available for projects and hybrid roles",
  email: "gustavosmarquezmedina@gmail.com",
  telefono: "+51 995 876 300",
  telefonoRaw: "+51995876300",
  linkedin: "https://www.linkedin.com/in/gustavosmarquez",
  linkedinLabel: "linkedin.com/in/gustavosmarquez",
};

export const reel = [
  "Strategic planning",
  "Product & Project Management",
  "Scrum / Agile",
  "Android · iOS · Web apps",
  "Business Intelligence",
  "International trade",
];

export const manifiesto = {
  kicker: "Profile",
  texto:
    "I am an International Business professional who learned to build software. I design the strategy, translate it into a backlog, and carry it through to the product people use every day.",
  cierre:
    "My edge is the hybrid profile — strategy, data and operational execution with no translator in between.",
};

export const metricas = [
  {
    valor: 12,
    sufijo: "%",
    prefijo: "-",
    titulo: "Logistics cost",
    detalle:
      "Sustained reduction through supplier renegotiation and per-container costing control.",
  },
  {
    valor: 6,
    sufijo: "+",
    prefijo: "",
    titulo: "Years of experience",
    detalle:
      "Agri-export, mining and foreign trade, across commercial, financial and product roles.",
  },
  {
    valor: 2,
    sufijo: "",
    prefijo: "",
    titulo: "Markets opened",
    detalle:
      "Commercial expansion into Asia and North America with market assessment and FOB / CIF costing.",
  },
  {
    valor: 1,
    sufijo: "",
    prefijo: "",
    titulo: "Digital product led",
    detalle:
      "Collie App: from problem definition to release on Android, iOS and web as PM.",
  },
];

export const experiencias: Experiencia[] = [
  {
    empresa: "Collie Valley S.A.C.",
    cargo: "Head of Commerce and Finance",
    periodo: "Jan 2025 — Present",
    desde: "2025",
    hasta: "present",
    sector: "Agri-export",
    resumen:
      "Commercial and financial leadership of the export operation, plus product leadership of the company's digitalisation.",
    logros: [
      "Directed the exporter's commercial and financial plan, aligning campaign targets with growth projections.",
      "Defined the management scorecard: per-container profitability, logistics cost and commercial performance on one board.",
      "Acted as Product Manager for Collie App, a digital solution centralising operational, financial and commercial data in real time.",
      "Implemented Scrum: prioritised backlog, sprints and ceremonies, raising the team's delivery predictability.",
      "Modelled financial scenarios for international market expansion.",
      "Coordinated logistics operations under FOB and CIF Incoterms.",
    ],
    stack: ["Power BI", "Jira", "MS Project", "Advanced Excel", "Scrum"],
  },
  {
    empresa: "Agroexportadora Valle Encantado S.A.C.",
    cargo: "Co-founder · Business Development Specialist",
    periodo: "Jul 2023 — Nov 2024",
    desde: "2023",
    hasta: "2024",
    sector: "Agri-export",
    resumen:
      "Built the operation from zero: market, cost structure, internal processes and cash flow.",
    logros: [
      "Defined the business model and the cost structure the first campaign shipped on.",
      "Segmented the buyer portfolio by margin and risk to decide which markets to enter first.",
      "Sustained the first year's cash position through budget control, with no external funding.",
    ],
    stack: ["Advanced Excel", "Power BI", "Scrum", "Financial modelling"],
  },
  {
    empresa: "Agrícola del Sur E.I.R.L.",
    cargo: "Foreign Trade Specialist",
    periodo: "Sep 2022 — Jul 2023",
    desde: "2022",
    hasta: "2023",
    sector: "Foreign trade",
    resumen:
      "End-to-end management of import and export operations, focused on customs and logistics cost.",
    logros: [
      "Renegotiated logistics channel rates, the line item with the most room to improve.",
      "Ran each shipment end to end: documentation, customs and release at destination.",
      "Cut customs incidents by standardising documentation per operation type.",
    ],
    stack: ["Advanced Excel", "MS Project", "Incoterms", "Customs"],
  },
  {
    empresa: "Greenfields Minerals",
    cargo: "Export Assistant",
    periodo: "Dec 2021 — Aug 2022",
    desde: "2021",
    hasta: "2022",
    sector: "Mining",
    resumen:
      "DRAWBACK regime, customs documentation and tax recovery analytics.",
    logros: [
      "Managed the DRAWBACK regime and tax recovery analytics.",
      "Coordinated export documentation through VUCE and certificates of origin.",
      "Automated logistics time and cost tracking, until then kept by hand.",
    ],
    stack: ["Power BI", "VUCE", "Advanced Excel"],
  },
  {
    empresa: "Greenvic S.A.",
    cargo: "Production Analyst",
    periodo: "Apr 2020 — Feb 2021",
    desde: "2020",
    hasta: "2021",
    sector: "Agribusiness",
    resumen:
      "Production and cost control in an agri-export plant running on NISIRA ERP.",
    logros: [
      "Controlled plant production and costs on the NISIRA ERP.",
      "Turned ERP data into performance indicators by batch and by line.",
      "Spotted cost deviations per process by comparing planned against actual.",
    ],
    stack: ["NISIRA ERP", "Power BI", "Advanced Excel"],
  },
];

export const proyectos: Proyecto[] = [
  {
    slug: "collie-app",
    nombre: "Collie App",
    tagline: "An agri-exporter's command centre, in your pocket.",
    categoria: "Digital product · Enterprise",
    plataformas: ["Android", "iOS", "Web"],
    anio: "2025 — 2026",
    rol: "Product Manager · Product and development",
    problema:
      "The operation lived across spreadsheets, email and WhatsApp. Nobody held the same version of the truth: per-container costs, field progress and commercial status were reconciled by hand, days late.",
    solucion:
      "A mobile and web application that centralises operational, financial and commercial information in a single data model, with field capture and real-time decision dashboards for management.",
    impacto: [
      "One source of truth across operations, finance and commerce.",
      "Real-time decisions instead of weekly reports rebuilt by hand.",
      "Per-container cost traceability wired directly to commercial margin.",
      "Adopted by field, logistics and management teams.",
    ],
    stack: [
      "Product Management",
      "Scrum",
      "Jira",
      "Figma",
      "Prototyping",
      "Data modelling",
      "Power BI",
    ],
    proceso: [
      "Discovery with field, logistics, finance and management users.",
      "Process mapping and definition of a shared data model.",
      "Backlog prioritised by business value, not by technical convenience.",
      "Two-week sprints with a demo and feedback from real users.",
      "Progressive release with adoption support.",
    ],
    destacado: true,
  },
  {
    slug: "collie-web",
    nombre: "Collie Web",
    tagline: "The international commercial face of the operation.",
    categoria: "Web platform · B2B",
    plataformas: ["Web"],
    anio: "2025",
    rol: "Product Owner & Strategy",
    problema:
      "Acquiring international buyers depended on trade fairs and personal contacts. No digital asset sustained the commercial conversation beyond the meeting.",
    solucion:
      "A corporate web platform aimed at international buyers: product spec sheets, campaign calendar, plant capacity and a direct quotation channel.",
    impacto: [
      "Digital support for market entry into Asia and North America.",
      "Shorter commercial cycle: the spec sheet stops being a PDF over email.",
      "Brand positioning with buyers and certification bodies.",
    ],
    stack: [
      "Web development",
      "Content architecture",
      "SEO",
      "Web analytics",
      "Figma",
    ],
    proceso: [
      "Research into the international buyer and their real objections.",
      "Content architecture oriented to the purchase decision.",
      "Iterative design and development.",
      "Behaviour measurement and message adjustment.",
    ],
    destacado: true,
  },
  {
    slug: "control-embarques",
    nombre: "Shipment Control & Costing",
    tagline: "From container to margin, with no manual middlemen.",
    categoria: "Business Intelligence",
    plataformas: ["Web", "Power BI"],
    anio: "2024 — 2026",
    rol: "Business analyst & KPI design",
    problema:
      "The real cost of a shipment was known weeks after departure. Every pricing decision was made with expired information.",
    solucion:
      "A per-container costing model and a dashboard suite integrating logistics, customs and production costs against sale price by market and product.",
    impacto: [
      "Logistics costs reduced by more than 12%.",
      "Margin visible by container, market and product.",
      "Projection scenarios for expansion decisions.",
    ],
    stack: [
      "Power BI",
      "DAX",
      "Advanced Excel",
      "NISIRA ERP",
      "Cost modelling",
    ],
    proceso: [
      "Survey of the real cost structure.",
      "KPI dictionary agreed with management.",
      "Data modelling and load automation.",
      "Dashboards by role: management, commercial and logistics.",
    ],
    destacado: true,
  },
  {
    slug: "operacion-agil",
    nombre: "Agile Operations",
    tagline: "Scrum applied to teams that don't build software.",
    categoria: "Transformation · Method",
    plataformas: ["Process"],
    anio: "2022 — 2026",
    rol: "Scrum facilitator & Project Manager",
    problema:
      "Commercial and logistics teams working on urgency, with no backlog, no cadence and no way to know whether the month was going well before it ended.",
    solucion:
      "An adapted agile framework: prioritised business backlog, sprints, short dailies, a visible Jira board and milestone planning in MS Project.",
    impacto: [
      "Predictable delivery cadence in non-technical areas.",
      "Explicit, debated priorities instead of ones inherited from noise.",
      "Progress visibility for management without requesting reports.",
    ],
    stack: ["Scrum", "Kanban", "Jira", "MS Project", "OKR / KPI"],
    proceso: [
      "Diagnosis of the current workflow.",
      "Backlog definition and definition of done.",
      "Minimum viable ceremonies, adjusted by retrospective.",
      "Process metrics and continuous improvement.",
    ],
    destacado: false,
  },
];

export const metodologia = {
  kicker: "How I work",
  titulo: "From business hypothesis to release.",
  intro:
    "I don't separate strategy from product. The same framework I use to prioritise a backlog is the one I use to prioritise a commercial investment: value, risk and evidence.",
  fases: [
    {
      n: "01",
      nombre: "Discovery",
      claim: "Understand the business before the solution.",
      detalle:
        "Interviews with real users, process mapping, cost structure and problem definition in measurable terms. If I can't write the KPI, I haven't understood the problem yet.",
      entregables: ["Process map", "Problem definition", "Target KPIs"],
    },
    {
      n: "02",
      nombre: "Strategy",
      claim: "Model the impact before spending a sprint.",
      detalle:
        "Financial modelling, scenarios and business case. Backlog prioritised by business value and risk, not by technical convenience.",
      entregables: ["Business case", "Prioritised backlog", "Roadmap"],
    },
    {
      n: "03",
      nombre: "Delivery",
      claim: "Sprints with a real demo, not with reported progress.",
      detalle:
        "Scrum with two-week sprints, minimum viable ceremonies, a visible Jira board and milestone planning in MS Project. Every sprint ends with something the user can touch.",
      entregables: ["Sprints", "Demos", "Jira board"],
    },
    {
      n: "04",
      nombre: "Measurement",
      claim: "The dashboard is part of the deliverable.",
      detalle:
        "KPI instrumentation in Power BI from day one. What isn't measured can't be defended in a management committee.",
      entregables: ["Dashboards", "Impact report", "Retrospective"],
    },
  ],
};

export const competencias = [
  {
    grupo: "Business & Strategy",
    icono: "negocio" as const,
    claim: "Decide with numbers, not with instinct.",
    detalle:
      "Before committing capacity: what it's worth, what it risks, and what evidence holds it up.",
    items: [
      "Strategic planning",
      "Financial modelling",
      "Business case & scenarios",
      "KPI management",
      "Foreign trade & Incoterms",
      "Supplier negotiation",
    ],
  },
  {
    grupo: "Product & Projects",
    icono: "producto" as const,
    claim: "Turn the decision into a backlog.",
    detalle:
      "Whatever the committee approved has to fit in a sprint and ship with a demo, not with reported progress.",
    items: [
      "Product Management",
      "Scrum & Agile",
      "Kanban",
      "Backlog & prioritisation",
      "Jira",
      "MS Project",
    ],
  },
  {
    grupo: "Data & Technology",
    icono: "datos" as const,
    claim: "Measure what was delivered.",
    detalle:
      "The dashboard closes the loop: without it there is no way to defend the next investment.",
    items: [
      "Power BI & DAX",
      "Advanced Excel",
      "NISIRA ERP",
      "Android / iOS apps",
      "Web development",
      "Data analysis",
    ],
  },
];

export const educacion = [
  {
    titulo: "Customs Representative",
    institucion: "IAT — SUNAT",
    anio: "2023",
    tipo: "Certification",
  },
  {
    titulo: "BSc in International Business",
    institucion: "Universidad Nacional San Luis Gonzaga de Ica",
    anio: "2020",
    tipo: "Degree",
  },
];

export const idiomas = [
  { idioma: "Spanish", nivel: "Native · C2", pct: 100 },
  { idioma: "English", nivel: "B2 (CEFR) · professional working", pct: 78 },
];

export const navegacion = [
  { href: "/en/work", label: "Work" },
  { href: "/en/about", label: "About" },
  { href: "/en/contact", label: "Contact" },
];

export const casoCollieApp = {
  slug: "collie-app",
  titulo: "Collie App",
  subtitulo: "Digitalising an agri-exporter without stopping the campaign",
  periodo: "2025 — 2026",
  rol: "Product Manager · Product and development",
  duracion: "12 months",

  contexto: [
    "Collie Valley was exporting with an operation that worked, but whose information lived scattered: field progress in a notebook, costs in spreadsheets, commercial status in email and the rest in people's heads. Nobody was lying; each area simply held its own version of the truth.",
    "The symptom always arrived the same way. In the management committee someone would ask how much we had made on a container, and the honest answer was «I'll tell you in two weeks», because the logistics, customs and plant costs had to be reconciled by hand against the commercial invoice. By then the price of the next sale was already set.",
    "The first attempt was to build Power BI dashboards. It solved half of it: the data was now visible, but it still went in by hand and days late. The other half of the problem wasn't visualisation but capture, and that required software.",
  ],

  restricciones: [
    {
      titulo: "Field connectivity",
      detalle:
        "Much of the capture happens on the farm, where signal is intermittent. Any design that assumed a permanent connection was going to fail on day one.",
    },
    {
      titulo: "Non-technical users",
      detalle:
        "Field users are not software users. If a task took longer than writing it in the notebook, the notebook won.",
    },
    {
      titulo: "The campaign doesn't stop",
      detalle:
        "There was no window to migrate. The operation had to keep running in parallel while the system was rolled out.",
    },
    {
      titulo: "Small team",
      detalle:
        "No luxury of specialists: the same group did discovery, construction and adoption support.",
    },
  ],

  decisiones: [
    {
      titulo: "Start with costing, not with what was most visible",
      alternativa:
        "Start with the field module, the most requested and the most impressive in a demo.",
      eleccion:
        "We started with the per-container cost model, which isn't visible on screen but is what everything else hangs from.",
      porque:
        "Costing was the only module whose data all three areas used. Building it first forced us to agree on a shared data model before writing any interface, and avoided having to rebuild them later.",
    },
    {
      titulo: "Offline capture first",
      alternativa: "A connected app, simpler to build and to maintain.",
      eleccion:
        "Local capture with later synchronisation, accepting the complexity of resolving conflicts.",
      porque:
        "An app that fails where it is used is not an app: it's a form people work around. The technical cost was paid once; the cost of losing the user's trust is not recoverable.",
    },
    {
      titulo: "Fewer fields than the business asked for",
      alternativa: "Collect everything each area wanted, which was a lot.",
      eleccion:
        "Cut back to the minimum that supported the agreed KPIs, and add only with evidence of use.",
      porque:
        "Every extra field is time from the user in the field. The rule was: if a field doesn't feed an indicator somebody looks at, it doesn't go in.",
    },
    {
      titulo: "The dashboard as part of the deliverable, not as a final phase",
      alternativa: "Build the app, and measure afterwards.",
      eleccion:
        "Instrument the KPIs in Power BI from the first sprint, even with little data.",
      porque:
        "Without measurement from day one there is no way to defend the investment in next month's committee, and a project that can't be defended gets cancelled.",
    },
  ],

  fases: [
    {
      n: "01",
      nombre: "Discovery",
      detalle:
        "Interviews with field, logistics, finance and management. Process map and real cost structure. The question that ordered everything: what decision do you make today with old information?",
    },
    {
      n: "02",
      nombre: "Data model",
      detalle:
        "A single entity dictionary for all three areas. It was the longest discussion of the project and the one that saved the most time later.",
    },
    {
      n: "03",
      nombre: "Sprint delivery",
      detalle:
        "Two-week sprints with a demo in front of real users. Backlog prioritised by business value, not by technical convenience.",
    },
    {
      n: "04",
      nombre: "Release and adoption",
      detalle:
        "Progressive rollout by area instead of a single cutover. On-site support during the first weeks.",
    },
  ],

  resultados: [
    "One source of truth across operations, finance and commerce.",
    "Per-container cost went from being rebuilt by hand to being available on the dashboard.",
    "Pricing decisions with data from the current campaign, not the previous one.",
    "Sustained adoption across field, logistics and management.",
  ],

  cifras: [
    { valor: "3", etiqueta: "Platforms: Android, iOS and web" },
    { valor: "12", etiqueta: "Months of project" },
    { valor: "4", etiqueta: "Areas on one data model" },
  ],

  aprendizajes: [
    {
      titulo: "The most requested module is not the most important one",
      detalle:
        "Everyone asked for the field app. Starting with costing was unpopular for six weeks and right for the rest of the project.",
    },
    {
      titulo: "Adoption is designed, not announced",
      detalle:
        "We launched the first pilot with an email and a guide. Almost nobody used it. We launched the second one by spending two days with people in the field. That's when it started.",
    },
    {
      titulo: "An agreed data model is worth more than three pretty screens",
      detalle:
        "Every week we spent arguing about what exactly «container cost» meant saved us a month of reconciliations later.",
    },
    {
      titulo: "Measure from sprint 1, even if the data is poor",
      detalle:
        "Having the dashboard empty from the start forced us to define what we would call success before we could bend the definition to fit the result.",
    },
  ],
};
