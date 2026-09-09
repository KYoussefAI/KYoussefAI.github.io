export interface ProjectSection { title: string; paragraphs?: string[]; bullets?: string[] }
export interface Project {
  slug: string; number: string; title: string; shortTitle: string; category: string;
  kind: 'engineering' | 'academic'; status: string; summary: string; question: string;
  tags: string[]; repo?: string; commit?: string; sourcePaths?: string[];
  stages: { name: string; detail: string }[]; flowLabel: string; flowNote?: string;
  sections: ProjectSection[]; takeaway: string; attribution?: string;
  metric?: { value: string; label: string; note: string };
}

export const projects: Project[] = [
  {
    slug: 'mobility-control-tower', number: '01', title: 'Mobility Control Tower', shortTitle: 'Mobility Control Tower',
    category: 'Layered data architecture', kind: 'engineering', status: 'In progress',
    summary: 'From public transport schedules to tested analytical marts. A hands-on exploration of layered data architecture with Python and dbt.',
    question: 'How does a source dataset become an analytical model you can reason about?',
    tags: ['Python', 'SQL', 'dbt', 'DuckDB', 'GTFS'], repo: 'Mobility_Control_Tower', commit: '0e2490f16057f25dbea710b8a3eda7fa088ca2b6',
    sourcePaths: ['README.md', 'pyproject.toml', 'dbt/models/marts', 'dbt/tests', 'docs/data_quality.md'],
    flowLabel: 'The public data path',
    stages: [{ name: 'GTFS', detail: 'Source schedules' }, { name: 'Raw', detail: 'Preserve' }, { name: 'Bronze', detail: 'Structure' }, { name: 'Silver', detail: 'Clean + validate' }, { name: 'dbt', detail: 'Stage + transform' }, { name: 'Gold', detail: 'Analytical marts' }],
    flowNote: 'Python owns ingestion through Silver and its quality checks. dbt owns staging, intermediate models, and Gold.',
    sections: [
      { title: 'Learning through a real data flow', paragraphs: ['I started Mobility Control Tower to deepen my understanding of Data Engineering through practice. With a foundation in Python and SQL, I wanted to work through the decisions between an original source and a useful analytical model.', 'The project uses GTFS public-transport schedules. It preserves the original data, progressively structures and cleans it, and builds models for schedule-based questions.'] },
      { title: 'An explicit transformation boundary', bullets: ['Python handles ingestion and the Raw, Bronze, and Silver layers.', 'Silver quality checks sit before the analytical transformations.', 'dbt uses the DuckDB adapter to build staging, intermediate models, and Gold marts.', 'The analytical layer includes model tests, unit tests, and reconciliation checks.'] },
      { title: 'What the analytical layer answers', paragraphs: ['The public marts cover daily route trips, stop departures, hourly departures and headways, busiest routes and stops, and network summaries. These describe scheduled service; they do not measure live vehicle performance.'] },
      { title: 'Current scope', paragraphs: ['This is an in-progress local analytical project. Gold marts are local build artifacts. The public implementation has no serving database, API, dashboard, realtime feed, or orchestrator.'] },
    ],
    takeaway: 'The useful part of a layered architecture is understanding what each layer guarantees before the next one depends on it.',
  },
  {
    slug: 'amazon-reviews-streaming-pipeline', number: '02', title: 'Amazon Reviews Streaming Sentiment Pipeline', shortTitle: 'Amazon Reviews Streaming Pipeline',
    category: 'Streaming & Big Data', kind: 'engineering', status: 'Academic project',
    summary: 'A Kafka and Spark system connecting sentiment model comparison, continuous micro-batch inference, and stored prediction analytics.',
    question: 'How do batch model training and a continuously running stream fit together?',
    tags: ['Kafka', 'Spark', 'Airflow', 'MongoDB', 'Flask'], repo: 'amazon-reviews-streaming-pipeline', commit: '6e5f853ab5317785ed582abd833efb44f7bcbf08',
    sourcePaths: ['README.md', 'results/model_comparison_results.csv', 'docs/spark_sentiment_tuning_report.md', 'src/spark/streaming/predict_stream.py', 'airflow/dags/amazon_reviews_batch_pipeline.py'],
    flowLabel: 'Continuous inference path',
    stages: [{ name: 'Reviews', detail: 'Exported test data' }, { name: 'Kafka', detail: 'Producer + topic' }, { name: 'Spark', detail: 'Micro-batch inference' }, { name: 'MongoDB', detail: 'Predictions' }, { name: 'Flask', detail: 'Stored analytics' }],
    flowNote: 'Separate bounded workflow: Airflow runs checks → export → validation → training → model validation. It does not run the continuous services.',
    metric: { value: '0.7023', label: 'Ensemble test Macro F1', note: 'Repository-reported held-out result; the streaming path uses a separate single model.' },
    sections: [
      { title: 'From an academic requirement to a complete workflow', paragraphs: ['This school project connects Kafka and Spark with three-class sentiment classification on Amazon Fine Food Reviews. Review scores define negative, neutral, and positive labels; exported test reviews simulate incoming events.'] },
      { title: 'Compare models before choosing the inference path', paragraphs: ['Spark ML comparisons cover Logistic Regression, Naive Bayes, One-vs-Rest Linear SVC, a light Random Forest, and majority voting. The ensemble leads the recorded validation Macro F1 comparison, but streaming loads the practical saved single model: One-vs-Rest Linear SVC.', 'Simulated Annealing tuning connects the modelling work to concepts from the Metaheuristics module. The SVC path does not provide calibrated probabilities, so confidence is recorded as unavailable.'] },
      { title: 'Separate continuous services from bounded tasks', bullets: ['Kafka decouples event production and consumption; the local setup documents three brokers and a replicated topic.', 'Spark Structured Streaming applies the saved model in micro-batches and writes enriched prediction documents to MongoDB.', 'Flask and JavaScript present analytics from stored predictions.', 'Airflow orchestrates batch preparation and training dependencies. Long-running services start separately.'] },
      { title: 'What the result establishes', paragraphs: ['The recorded ensemble test Macro F1 is 0.7023. This is an offline evaluation result, not a streaming performance or throughput benchmark. Full local integration still follows a manual runbook.'] },
    ],
    takeaway: 'Batch orchestration, event storage, and continuous computation have different lifecycles. The architecture becomes clearer when those responsibilities are explicit.',
  },
  {
    slug: 'job-data-pipeline-france', number: '03', title: 'Job Data Pipeline — France', shortTitle: 'Job Data Pipeline — France',
    category: 'Ingestion & SQL analytics', kind: 'engineering', status: 'Personal project',
    summary: 'My first personal data pipeline: collecting French job listings, preserving raw responses, and building PostgreSQL analytics for a Streamlit dashboard.',
    question: 'What can collected job listings actually tell us about the market?',
    tags: ['Python', 'PostgreSQL', 'Parquet', 'Streamlit'], repo: 'job-data-pipeline-france', commit: 'd0be1bf0d392c22d13acfb6553e12c3db2f75360',
    sourcePaths: ['README.md', 'src/analytics/views.sql', 'src/processing/transformer.py', 'src/storage/load_jobs.py'],
    flowLabel: 'From API response to analytical views',
    stages: [{ name: 'Adzuna', detail: 'Job search API' }, { name: 'JSON', detail: 'Dated raw files' }, { name: 'Parquet', detail: 'Processed records' }, { name: 'PostgreSQL', detail: 'Tables + SQL views' }, { name: 'Streamlit', detail: 'Dashboard' }],
    flowNote: 'A Python entry point coordinates ingestion, processing, and database loading.',
    sections: [
      { title: 'A first end-to-end pipeline', paragraphs: ['I built this personal project to explore data-related job listings in France. It queries Adzuna for Data Engineer, Data Analyst, and Data Scientist roles and turns API responses into a structured analytical dataset.'] },
      { title: 'Preservation, transformation, and safe reruns', bullets: ['Original JSON responses are preserved in date-partitioned folders with ingestion metadata.', 'A reader → extractor → transformer → writer flow standardizes fields and writes Parquet.', 'PostgreSQL separates jobs, companies, and locations. Job inserts use conflict handling to avoid duplicates.', 'SQL views support role counts, geographic distribution, available salary data, and cumulative observations.'] },
      { title: 'Posting time is not observation time', paragraphs: ['The key lesson was distinguishing created_at, the original posting date, from ingestion_timestamp, when the pipeline collected the listing. A partial, ranked API response cannot reconstruct the full historical job market.', 'Using ingestion time makes the cumulative view describe collected observations. Because jobs are deduplicated, this is not a complete daily census of active listings or a measure of market growth.'] },
      { title: 'Analytical boundaries', paragraphs: ['Dashboard results depend on API coverage and collection history. Salary fields are often missing. The project demonstrates the pipeline and its reasoning without presenting this sample as a representative market study.'] },
    ],
    takeaway: 'A technically correct query can still answer the wrong question. Define what a timestamp and a record represent before building a KPI.',
  },
  {
    slug: 'snort-rag', number: '04', title: 'Snort RAG Rule Generator', shortTitle: 'Snort RAG Rule Generator',
    category: 'Applied AI · RAG & cybersecurity', kind: 'academic', status: 'Academic project',
    summary: 'Comparing retrieval strategies and controlled generation for defensive Snort IDS rules, with explicit validation and fallback behavior.',
    question: 'How can generated rules be checked instead of simply trusted?',
    tags: ['Python', 'RAG', 'Ollama', 'Snort 3', 'Docker'], repo: 'snort_rag_rule_generator', commit: 'e7f49c4fd5de22c3c21a7c41d40979ce70573e96',
    sourcePaths: ['README.md', 'src/snort_rag/architectures.py', 'results/snort_runtime_validation.csv', 'results/pcap_test_results.csv'],
    flowLabel: 'Controlled rule generation',
    stages: [{ name: 'Input', detail: 'Description / log' }, { name: 'Retrieval', detail: 'Classify + context' }, { name: 'Generation', detail: 'LLM / fallback' }, { name: 'Validation', detail: 'Parse + repair' }, { name: 'Snort 3', detail: 'Runtime + replay' }],
    sections: [
      { title: 'An academic NLP and RAG exploration', paragraphs: ['The project converts natural-language descriptions or network-log examples into educational defensive IDS rules. It explores baseline generation, classic RAG, reranking, hybrid, multi-hop, graph, and agentic RAG variants.'] },
      { title: 'Generation is only one stage', paragraphs: ['Retrieved examples constrain generation. Strict JSON parsing, rule validation, repair attempts, and deterministic templates control which outputs are accepted. A fallback is recorded as a fallback, rather than counted as successful raw model output.', 'The repository includes local Ollama benchmarks, a Gradio prototype, and a FastAPI interface around the workflow.'] },
      { title: 'Evidence with a defined scope', paragraphs: ['The repository reports 183/183 Snort 3 rule-validation passes and detection of nine attack categories during synthetic lab PCAP replay. It also separates synthetic log evaluation from small controlled real-lab logs.', 'These results describe the committed lab evaluations. They do not establish reliability on enterprise traffic or make this a production security framework.'] },
    ],
    attribution: 'Academic NLP/RAG project supervised by Pr. Ikram Benabdelouahab.',
    takeaway: 'For generated technical artifacts, validation evidence and transparent fallback behavior matter as much as the generation method.',
  },
  {
    slug: 'discrete-ana-tsp', number: '05', title: 'Discrete ANA for the Traveling Salesman Problem', shortTitle: 'Discrete ANA for TSP',
    category: 'Metaheuristics & stochastic search', kind: 'academic', status: 'Experimental project',
    summary: 'Adapting the existing Ant Nesting Algorithm to permutation-based route optimization, with experiments on movement operators and local search.',
    question: 'What changes when a continuous search method must operate on routes?',
    tags: ['Python', 'ANA adaptation', 'TSP', '2-opt'], repo: 'discrete-ant-nesting-tsp', commit: 'c098cfa4d80747407be45acb3d243e3e055e7a0f',
    sourcePaths: ['README.md', 'docs/references.md', 'experiments/ana_tsp_v3.py', 'results/wi29/v3/baseline_parameters_v1/summary.csv'],
    flowLabel: 'The documented foundational experiments',
    stages: [{ name: 'Baseline', detail: 'Positional swaps' }, { name: 'V1', detail: 'Inversion exploration' }, { name: 'V2', detail: 'Edge guidance' }, { name: 'V3', detail: '2-opt local search' }],
    flowNote: 'This case study focuses on the baseline–V3 progression documented in the README and references; the repository also contains later experiments.',
    sections: [
      { title: 'Adaptation, with clear attribution', paragraphs: ['The Ant Nesting Algorithm is an existing continuous optimization method. My work explores its adaptation to permutation-based symmetric TSP instances as part of Metaheuristics & Stochastic Search coursework.', 'The methodological references distinguish the original ANA formulation from project-specific choices in route representation and movement operators.'] },
      { title: 'From positions to route structure', bullets: ['The baseline guides movement with positional swaps and explores with random swaps.', 'V1 uses segment inversion for exploration.', 'V2 introduces missing edges from the global-best route through targeted reversals.', 'V3 adds first-improvement 2-opt local search, evaluating reversals by actual tour improvement.'] },
      { title: 'Read results as experiments', paragraphs: ['Experiments record explicit seeds, tour lengths, gaps to known optima, and run summaries. In the committed wi29 V3 baseline-parameter experiment, the best tour reaches the known optimum, while the mean gap is approximately 3.43% across ten runs.', 'One best run is not evidence of consistent optimality. Seed selection and evaluation budgets matter when comparing variants. This remains an experimental implementation.'] },
    ],
    takeaway: 'A useful search operator should respect the structure of the problem. Positional similarity and a shorter route are different objectives.',
  },
  {
    slug: 'cardioscan-ecg', number: '06', title: 'CardioScan — ECG Classification', shortTitle: 'CardioScan / ECG Classification',
    category: 'Applied AI · Signal classification', kind: 'academic', status: 'Academic team project',
    summary: 'A shared academic project connecting a 1D residual neural network for multi-label ECG classification to a FastAPI and React application.',
    question: 'How does a signal-classification model become a usable application?',
    tags: ['PyTorch', 'PTB-XL', 'FastAPI', 'React'], repo: 'ecg-classification-system', commit: 'be5acbd7cf7c277b6bbe5029c1404ef11942d6cc',
    sourcePaths: ['README.md', 'backend/app/models/ecg_model.py', 'backend/app/services/model_service.py'],
    attribution: 'Created with Bourti Ayoub, under the supervision of Prof. Ezziyyani Mostafa.',
    flowLabel: 'Application inference path',
    stages: [{ name: 'React', detail: 'ECG input' }, { name: 'FastAPI', detail: 'Validated request' }, { name: 'PyTorch', detail: '1D residual model' }, { name: 'Results', detail: 'Five class outputs' }],
    flowNote: 'SQLite stores users and analysis history. The application includes JWT authentication.',
    metric: { value: '0.917', label: 'Reported Macro AUC', note: 'PTB-XL fold 10 evaluation in the project README; not a clinical validation claim.' },
    sections: [
      { title: 'A collaborative applied ML project', paragraphs: ['CardioScan was created with Bourti Ayoub and supervised by Prof. Ezziyyani Mostafa. It explores multi-label classification of 12-lead ECG signals from PTB-XL across NORM, MI, CD, HYP, and STTC.'] },
      { title: 'Model and dataset', paragraphs: ['The documented dataset contains 21,799 ten-second recordings. Signals at 100 Hz give 1,000 time steps per lead. The training workflow normalizes each recording and arranges input as 12 channels by 1,000 steps.', 'The PyTorch model uses three residual 1D blocks with 64, 128, and 256 channels, adaptive average pooling, and a five-output classifier. Training uses Focal Loss and weighted sampling to address imbalance.'] },
      { title: 'From inference to an interface', paragraphs: ['FastAPI exposes inference, authentication, history, and statistics. A React/Vite interface presents the model outputs; SQLite persists users and analyses. The trained checkpoint is required for meaningful inference. The repository describes random-weight demo behavior when it is absent.'] },
      { title: 'Evaluation context', paragraphs: ['The README reports Macro AUC 0.917 on fold 10, containing 2,198 recordings. It also reports selecting class decision thresholds on the test set, which limits interpretation of threshold-dependent scores as an untouched holdout evaluation. This is an academic application, not a clinically validated diagnostic system.'] },
    ],
    takeaway: 'Model evaluation, input handling, checkpoint availability, and the application interface all affect how an ML result should be interpreted.',
  },
  {
    slug: 'bayesian-networks-pfe', number: '07', title: 'Bayesian Networks — Bachelor’s Final-Year Project', shortTitle: 'Bayesian Networks',
    category: 'Probability & graph theory', kind: 'academic', status: 'Bachelor’s final-year project',
    summary: 'An academic foundation in graph theory, conditional probability, and probabilistic reasoning through Bayesian networks.',
    question: 'How can graph structure express conditional dependence and support inference?',
    tags: ['Python', 'R', 'NetworkX', 'Probability'],
    flowLabel: 'The report’s conceptual progression',
    stages: [{ name: 'Graphs', detail: 'Structure + traversal' }, { name: 'Probability', detail: 'Conditioning + Bayes' }, { name: 'Networks', detail: 'Dependence + inference' }],
    sections: [
      { title: 'The academic starting point', paragraphs: ['My Bachelor’s final-year project at the Faculty of Science and Technology Tangier studied Bayesian networks through graph theory and probability. It forms part of the statistical foundation behind my later work in data systems and applied machine learning.'] },
      { title: 'From graph algorithms to probabilistic models', bullets: ['Graph theory fundamentals, including BFS, DFS, and Dijkstra’s algorithm.', 'Probability, conditional probability, and Bayes’ theorem.', 'Bayesian networks, conditional independence, and d-separation.', 'Exact and approximate inference, plus structure learning with K2 and Hill Climbing.'] },
      { title: 'Tools and scope', paragraphs: ['The work uses Python, R, NetworkX, NumPy, and Pandas. It is a Bachelor’s Final-Year Project / Academic Research Project, not a peer-reviewed publication.'] },
    ],
    takeaway: 'Before engineering a data system, understand the structure of the data and the assumptions behind the questions asked of it.',
  },
];

export const projectUrl = (project: Project) => `/projects/${project.slug}/`;
export const repositoryUrl = (project: Project) => project.repo ? `https://github.com/KYoussefAI/${project.repo}` : undefined;

const researchSlugs = ['bayesian-networks-pfe', 'discrete-ana-tsp'];
export const projectArea = (project: Project): 'work' | 'research' => researchSlugs.includes(project.slug) ? 'research' : 'work';
export const engineeringProjects = projects.filter(project => project.kind === 'engineering');
export const appliedProjects = projects.filter(project => project.kind === 'academic' && projectArea(project) === 'work');
export const researchProjects = researchSlugs.map(slug => projects.find(project => project.slug === slug)!);
export const workProjects = [...engineeringProjects, ...appliedProjects];
