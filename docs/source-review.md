# Public source review

Reviewed on **2026-09-05**, using the public GitHub pages, raw READMEs, recursive repository trees, and selected implementation/result files. Public repositories were accessible. Personal context, education, languages, and the Bayesian PFE description come from the supplied portfolio brief.

The portfolio does not claim to have independently reproduced the projects' training or experiment results. Metrics are labelled as repository-reported and scoped to the relevant run.

| Project | Public repository | Reviewed revision |
| --- | --- | --- |
| Mobility Control Tower | [Mobility_Control_Tower](https://github.com/KYoussefAI/Mobility_Control_Tower) | `0e2490f16057f25dbea710b8a3eda7fa088ca2b6` |
| Amazon Reviews | [amazon-reviews-streaming-pipeline](https://github.com/KYoussefAI/amazon-reviews-streaming-pipeline) | `6e5f853ab5317785ed582abd833efb44f7bcbf08` |
| Job Data Pipeline — France | [job-data-pipeline-france](https://github.com/KYoussefAI/job-data-pipeline-france) | `d0be1bf0d392c22d13acfb6553e12c3db2f75360` |
| Snort RAG | [snort_rag_rule_generator](https://github.com/KYoussefAI/snort_rag_rule_generator) | `e7f49c4fd5de22c3c21a7c41d40979ce70573e96` |
| Discrete ANA | [discrete-ant-nesting-tsp](https://github.com/KYoussefAI/discrete-ant-nesting-tsp) | `c098cfa4d80747407be45acb3d243e3e055e7a0f` |
| CardioScan | [ecg-classification-system](https://github.com/KYoussefAI/ecg-classification-system) | `be5acbd7cf7c277b6bbe5029c1404ef11942d6cc` |

## Content decisions

- **Mobility:** README, `pyproject.toml`, dbt model/test tree, Silver quality documentation, and the hourly headway mart. Python owns ingestion through Silver; dbt with DuckDB owns analytical transformations. Schedule-based marts are supported. No serving database, API, dashboard, realtime feed, or orchestrator is claimed. Status remains in progress.
- **Amazon:** Full README, comparison CSV, tuning report, streaming implementation, and Airflow DAG. The comparison artifact reports ensemble test Macro F1 0.702274. This is distinct from the saved One-vs-Rest SVC used in streaming. Airflow handles bounded batch tasks, including training; continuous services are separate. Kafka replication is a documented local setup and learning topic, not a tested uptime claim. Stream events replay exported data. The dashboard reads stored predictions. Screenshots were identified in the public tree and README; portfolio visuals use explanatory diagrams rather than inventing a live dashboard.
- **Job pipeline:** Full README and SQL views. The timestamp lesson is framed around observations collected through a partial API. Job deduplication means a cumulative observation view is not a complete daily active-listing snapshot. Market-size, salary, and growth conclusions are intentionally omitted. The empty similarly named repository was not used.
- **Snort RAG:** Full README and public module/result tree. Retrieval variants, strict parsing, deterministic fallback, Snort 3 validation, and lab replay are described with academic limits. Passing validation includes accepted/fallback output and is not raw LLM success. This is not presented as a production security system.
- **ANA:** Full README, references, V3 implementation, and `results/wi29/v3/baseline_parameters_v1/summary.csv`. ANA is credited as an existing method, with this work presented as a permutation adaptation. The case study explains the documented baseline–V3 progression and explicitly acknowledges later public experiments. The reported V3 best optimum and mean gap of about 3.43% refer to that named ten-run experiment only. The original ANA paper's complete bibliographic metadata was unverified in the repository, so no author/year/DOI was invented.
- **ECG:** Full README, PyTorch model, and model service. Joint authorship with Bourti Ayoub and supervision by Prof. Ezziyyani Mostafa are visible on both homepage and case study. The 1D residual model, PTB-XL, FastAPI/React/SQLite architecture, and reported Macro AUC 0.917 are supported. The case study retains the limitations of test-set threshold tuning and random-weight behavior without a checkpoint. No clinical validation claim is made.
- **Bayesian networks:** Supplied academic description only. No public repo, report download, publication status, or empirical result is invented.

## Intentional omissions

No CV PDF, real portrait, or Bayesian report exists in the initial workspace. The site therefore has a monogram portrait, no CV download, and no report link. No employment, internships, certifications, grades, phone, home address, birth date, or future private implementation details are published. The opportunity banner is disabled by default. The code is ready for static hosting, but nothing has been deployed.
