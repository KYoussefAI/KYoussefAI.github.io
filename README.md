# Youssef Khaloufi — Portfolio

A static professional portfolio focused on **Data Engineering & Distributed Systems**, with seven project case studies and supporting academic work. Built for the root GitHub Pages site `https://kyoussefai.github.io`. Nothing has been deployed, and no automatic deployment workflow is enabled.

## Start locally

With Node.js 22.12+ installed (Node 24 LTS recommended):

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4321**. The development server binds only to your local machine.

For the current Windows workspace, a checksum-verified portable Node 24 runtime is available in the ignored `.tools/` directory. The helper finds it without changing your system PATH:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-local.ps1
```

The runtime is not part of the repository. On a fresh checkout, install Node and use the standard npm commands.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development with live reload |
| `npm run check` | Astro and TypeScript diagnostics |
| `npm run build` | Generate the static `dist/` directory |
| `npm run preview` | Serve the built site locally |
| `npm test` | Browser checks against the built site |
| `node scripts/generate-social-card.mjs` | Regenerate the committed social share PNG |

Browser checks use installed Google Chrome by default. To use another Playwright browser, install it and set `PLAYWRIGHT_CHANNEL` (for example, `chromium` after `npx playwright install chromium`, or `msedge`). Build before testing. Tests start a separate preview on port 4322, leaving the development server on 4321 available. Tests cover all 13 HTML pages, internal links and fragment targets, required assets, WCAG A/AA automated checks, five viewport widths (320–1920px), menu focus trapping, scroll restoration, Escape/outside/close controls, browser history, active areas, reduced motion, and navigation with JavaScript disabled. Additional menu checks cover short mobile and landscape viewports. Screenshots are saved under `.test-artifacts/`.

Windows helper equivalents: `powershell -NoProfile -ExecutionPolicy Bypass -File .\start-local.ps1 -Task check`, replacing `check` with `build`, `preview`, or `test` as needed.

## Pages

- `/` — curated landing page: hero, two-sentence introduction, three featured engineering projects, two research previews, and contact CTA.
- `/work/` — Mobility flagship, Amazon and Job Pipeline editorial features, plus Snort RAG and CardioScan applied projects.
- `/research/` — Bayesian Networks PFE and Discrete ANA/TSP, with contextual links to applied work.
- `/about/` — portrait, personal direction and learning philosophy, languages.
- `/background/` — education and project-supported technical skills.
- `/projects/mobility-control-tower/`
- `/projects/amazon-reviews-streaming-pipeline/`
- `/projects/job-data-pipeline-france/`
- `/projects/snort-rag/`
- `/projects/discrete-ana-tsp/`
- `/projects/cardioscan-ecg/`
- `/projects/bayesian-networks-pfe/`
- `/404.html` — custom missing-page fallback.

## Content and structure

```text
src/
  components/       menu, page introduction, project/research cards, SEO, diagrams, portrait
  data/site.ts      identity, contact, education, skills, opportunity setting
  data/projects.ts  typed metadata, source references, and all case-study text
  data/navigation.ts top-level routes, numbering, and active-area resolution
  layouts/          shared site shell and project-detail layout
  pages/            five main pages, generated project routes, 404, sitemap
  styles/           original design tokens plus page/menu composition and motion rules
public/
  images/           portrait location and social share image
  favicon.svg       local monogram favicon
  robots.txt        crawler instructions
  .nojekyll         GitHub Pages static-asset compatibility
docs/               source review and content boundaries
scripts/            editable social share image generator
tests/              browser and accessibility verification
```

Project metadata is defined once and reused for homepage cards, detail pages, links, and the sitemap. The build uses local content; it does not call GitHub at build time or in the browser.

## Design

The V1 charcoal, off-white, sage accent, local typography, and architecture hero are preserved. V2 changes the information architecture: Home is a curated introduction; Work and Research provide discovery; About and Background hold personal and educational context. Work uses a strong full-width Mobility feature and alternating text/diagram compositions for the other engineering projects. Research has two distinct studies with conceptual illustrations. Secondary labels and body copy are larger.

The layered hero and research illustrations are conceptual; project pipeline diagrams are ordered HTML lists based on repository evidence. A native modal dialog provides the full-screen index with approximately 1.6 KB of minified JavaScript. It includes a focus trap, scroll locking/restoration, Escape, outside-click and close-button dismissal, and active-area markers. Footer navigation remains available without JavaScript. The no-JavaScript fallback uses immediate anchor navigation. The menu has restrained staggered entry and a short fade on close, both disabled for reduced motion.

Page fades use CSS browser-native cross-document view transitions as progressive enhancement. Navigation stays standard multi-page navigation, and unsupported browsers simply change pages normally. No client router or animation library is added. See [V2 implementation notes](docs/v2-structure.md) for the decision and primary documentation references.

## Update the portrait

The supplied portrait is now used on About, at:

```text
public/images/youssef-khaloufi.jpg
```

The same basename with `.jpeg`, `.png`, or `.webp` is also supported. Keep only one matching image. The current 400×400 image produces 280px and 400px WebP variants without upscaling. Restart the dev server or rebuild after replacing it. The component reads the source dimensions and reserves a square frame. Adjust `.about-page-grid .portrait img` in `structure.css` if the crop needs changing.

Without a photo, a deliberate monogram fills the same frame. No external person image or LinkedIn CDN URL is used.

## Maintain factual accuracy

See [the source review](docs/source-review.md) for repository snapshots, inspected material, and important limits. Before changing project claims:

1. Inspect the current public README and the relevant implementation or result artifact.
2. Update the project entry in `src/data/projects.ts`, including its source revision and references.
3. Preserve attribution, academic context, evaluation scope, and distinctions between implemented and future work.
4. Run check, build, and browser tests.

The Bayesian project uses the supplied personal academic summary. It has no fabricated repository or PDF link. A CV, employment history, certifications, and grades are intentionally absent. The opportunity banner is disabled; enable it later using `site.opportunity.enabled` in `src/data/site.ts`. A future personal section is configured with `site.beyondEngineering`; it remains hidden unless enabled and supplied with actual paragraphs.

## Dependencies

Versions are pinned in `package.json` and `package-lock.json`. Astro 7.3.1 was the registry's current stable version at implementation. TypeScript 6.0.3 is the latest stable major supported by `@astrojs/check` 0.9.10; TypeScript 7 is outside that checker's peer range. No framework hydration, Tailwind runtime, database, backend, external analytics, or paid services are required.

## GitHub Pages readiness

The configuration uses the root site URL, static output, and trailing-slash project paths. A later deployment should publish the **contents of `dist/`**, including `.nojekyll`, using a Pages artifact workflow. Do not publish the source directory or portable runtime as the site. Deployment is intentionally deferred; there is no workflow that could publish on a push.
