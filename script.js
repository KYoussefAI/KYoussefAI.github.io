// The site deliberately avoids scroll-dependent decoration and animation.
// The work should be the visual focus, and navigation should remain usable
// without JavaScript.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
