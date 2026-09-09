# Homepage presentation verification

Verified locally on 2026-09-08 using Node 24.20.0 and Google Chrome through Playwright. This supersedes the earlier V2 homepage measurements.

- `npm run check`: zero errors, warnings, or hints.
- `npm run build`: 13 HTML pages (five main pages, seven preserved case studies, and the 404 page), plus sitemap and local assets generated successfully.
- `npm test`: all 14 tests pass (1.6 minutes in the final run).
- Automated axe checks: zero detected WCAG A/AA violations across all 13 pages and the open menu.
- Responsive checks: no horizontal overflow on any page at 320, 375, 768, 1440, and 1920 pixels.
- Internal page and fragment destinations, required assets, image loading, and page titles checked.
- Keyboard skip link, case-study navigation, active menu areas, history navigation, and reduced-motion behavior checked.
- Menu focus trapping, focus restoration, Escape, close button, outside click, and body scroll restoration checked. Links remain reachable on short mobile and landscape screens, with touch targets of at least 44 pixels.
- Navigation remains usable with JavaScript disabled, including ordinary mouse navigation from the footer to Work and a case study. Native page transitions are restricted to environments where scripting is enabled, avoiding a browser transition overlay that otherwise intercepted clicks in the no-script test.
- Production pages retain the menu and IntersectionObserver reveal controllers. Home adds a small wheel-gesture controller alongside native CSS snapping. No client router or animation library was added. Reveal checks cover scrolling and a live change to reduced-motion preferences; accessibility checks wait for content to finish revealing.
- Homepage curation checked: portrait and short first-person bio on the left, name and Master’s student subtitle on the right, three academic timeline stages, three engineering project previews, two research previews, and a combined contact/footer screen. The Master’s stage alone is marked CURRENT; the next career direction is separate from the degree list and connected with a dashed line.
- Home uses document-level mandatory snapping at desktop widths of at least 1024 pixels and heights of at least 650 pixels. Root scroll padding is reset so slides land exactly at the viewport edge. Mobile uses normal scrolling; reduced motion uses proximity snapping and disables the wheel handler. The handler also yields when a slide exceeds the viewport height so long content remains readable.
- Actual mouse-wheel gestures advance Home through Screens 1 → 2 → 3 → 4 at both 1366×768 and 1920×1080, landing at exact viewport multiples. Reverse scrolling and closing the menu on Screen 4 preserve the expected position. Work, Research, About, Background, and case studies retain ordinary scrolling.
- Visual captures cover Home, Work, Research, About, Background, Mobility Control Tower, and Amazon Reviews at 375, 768, and 1440 pixels, plus menu layouts. Screenshots are in the ignored `.test-artifacts/` directory.
- Requested screenshots captured and visually inspected: all four Home screens at 1366×768 and 1920×1080, plus mobile portrait at 375×812 and a full mobile page. Files use `.test-artifacts/slides-home-{width}x{height}.png`, `slides-screen-{2,3,4}-{width}x{height}.png`, `slides-home-mobile-375x812.png`, and `slides-home-mobile-full.png`.
- Laptop layout assertions confirm all four Home slides equal one viewport in height, with the timeline, three work cards, and contact footer fully visible. About portrait plus introductory copy still fit their first viewport. The name's font size exceeds twice that of the student subtitle.
- All 29 files under `src/` pass strict UTF-8 decoding and a mojibake scan. Punctuation is correct in the rendered acceptance screenshots.
- The supplied 400-by-400 portrait appears in a compact Home variant and on About, served as optimized local WebP variants.
- The local development homepage returned HTTP 200 at `http://127.0.0.1:4321`, with the new personal hero and CareerTimeline present in its response. All routes were also checked against the built site on port 4322.

Automated accessibility checks complement keyboard and visual review; they are not a formal accessibility certification. Repository project metrics were reviewed as source evidence, not independently rerun. No CV download is shown because a CV was not supplied.

No deployment was performed.
