# V2 — information architecture and navigation

This iteration preserves the existing Astro stack, static output, project data, source evidence, charcoal/sage palette, fonts, and architecture-inspired hero.

## Page responsibilities

| Area | Responsibility |
| --- | --- |
| Home | Hero, two-sentence introduction, three engineering projects, two brief research previews, contact CTA |
| Work | Three primary engineering projects followed by two secondary applied AI projects |
| Research | Bayesian Networks PFE and ANA/TSP; contextual links to Snort RAG and CardioScan |
| About | Real portrait, personal direction, learning philosophy, languages |
| Background | Education and technical skills |
| Project routes | Existing technical evidence with parent-area and adjacent-project navigation |

At 1440px, the first V2 visual capture measured 3302px tall for Home, compared with 5177px in V1 (approximately 36% shorter). Readability increased while full education, skills, languages, personal story, and applied academic cards moved to their dedicated pages.

Project grouping is centralised in `src/data/projects.ts`. `src/data/navigation.ts` resolves each route's active top-level area. Research projects navigate within Research; other case studies navigate within Work. Existing case-study URLs are preserved, and the sitemap includes every main page and project route.

## Menu

`SiteMenu.astro` uses a native `<dialog>` opened with `showModal()`. The browser makes background content inert; a small controller explicitly cycles Tab/Shift+Tab within the menu, returns focus to the trigger, handles Escape, and restores the previous document scroll position. The fixed-body scroll lock supports touch devices, while the dialog itself remains scrollable. The close control stays visible during menu scrolling. Empty dialog margins support outside-click dismissal.

The approximately 1.6 KB minified controller is the site's only JavaScript. Menu links are real anchors and retain normal navigation and external-link behavior. Close and entry animations respect reduced motion. The footer provides all main routes when JavaScript is unavailable, and the header links directly to it. No-JavaScript navigation uses immediate scrolling and disables view transitions.

## Page transitions

The installed Astro version supports both native cross-document transitions and its client router. The native CSS option fits this static site: same-origin page changes receive a short fade, while normal document navigation, page titles, focus behavior, and script execution remain intact. Unsupported browsers use normal navigation, and reduced-motion users get no page animation.

This avoids adding a router lifecycle solely for animation. The choice follows [Astro's distinction between native transitions and ClientRouter](https://docs.astro.build/en/guides/view-transitions/#differences-between-browser-native-view-transitions-and-astros-clientrouter-) and [MDN's cross-document view-transition documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition). Modal behavior is based on the [native dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

## Content and visuals

No project metrics, implementation claims, or source revisions were changed in this structural iteration. The reviewed V1 sources remain the basis of the case studies. ECG collaboration and supervision, ANA attribution, the academic status of Bayesian Networks, and Mobility's current public boundary remain explicit.

The supplied local portrait is used only on About. Its 400×400 source produces 280px and 400px WebP variants. A future Beyond Engineering section is disabled until actual personal content is supplied. There is no CV download or opportunity banner enabled, and no deployment was performed.
