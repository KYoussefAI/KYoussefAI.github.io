export const site = {
  name: 'Youssef Khaloufi',
  title: 'Data Engineering & Distributed Systems',
  academicStatus: 'Master’s student in Artificial Intelligence & Data Science',
  heroSubtitle: 'Master’s Student — Artificial Intelligence & Data Science',
  institution: 'Faculty of Science and Technology Tangier',
  description: 'Youssef Khaloufi — Data Engineering & Distributed Systems. Exploring data pipelines, streaming systems, and analytical architecture through hands-on projects. Based in Tangier, Morocco.',
  location: 'Tangier, Morocco',
  email: 'youssefkhaloufi43@gmail.com',
  github: 'https://github.com/KYoussefAI',
  linkedin: 'https://www.linkedin.com/in/khaloufi-youssef/',
  opportunity: { enabled: false, text: 'Open to PFE Data Engineering opportunities — 2027' },
  beyondEngineering: { enabled: false, title: 'Beyond engineering', paragraphs: [] as string[] },
};

export const careerTimeline = [
  { period: '2022–2024', title: 'DEUST MIPC', detail: 'Mathematics / Computer Science / Physics / Chemistry', current: false },
  { period: '2024–2025', title: 'Bachelor’s', detail: 'Statistics & Data Science', current: false },
  { period: '2025–2027', title: 'Master’s', detail: 'Artificial Intelligence & Data Science', current: true },
];

export const education = [
  { degree: "Master’s degree", subject: 'Artificial Intelligence and Data Science', dates: 'Sep 2025 — Jun 2027', note: 'In progress · Expected graduation 2027' },
  { degree: "Bachelor’s degree", subject: 'Statistics and Data Science', dates: 'Sep 2024 — Jun 2025', note: 'Final-year project in Bayesian networks' },
  { degree: 'DEUST', subject: 'MIPC', dates: 'Sep 2022 — Jun 2024', note: 'Mathematical and scientific foundations' },
];

export const skillGroups = [
  { number: '01', title: 'Data foundations', description: 'Collect, preserve, transform, and model.', skills: ['Python', 'SQL', 'Pandas', 'PostgreSQL', 'DuckDB', 'dbt', 'JSON / Parquet', 'Data quality'] },
  { number: '02', title: 'Distributed processing', description: 'Connect events, computation, and storage.', skills: ['Apache Kafka', 'Apache Spark', 'PySpark', 'Structured Streaming', 'Apache Airflow', 'MongoDB', 'Docker'] },
  { number: '03', title: 'Applied AI & analysis', description: 'A statistical foundation for engineering.', skills: ['Spark MLlib', 'PyTorch', 'Machine learning', 'RAG', 'Probabilistic reasoning', 'Metaheuristics', 'R', 'NumPy'] },
];
