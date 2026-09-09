import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client';

const motion = matchMedia('(prefers-reduced-motion: reduce)');
let controller: AbortController | undefined;
let dialog: HTMLDialogElement;
let trigger: HTMLButtonElement;
let position = 0;
let locked = false;
let closing = false;
let changedRoute = false;
let navigationVersion = 0;

function unlock() {
  if (!locked) return;
  locked = false;
  document.documentElement.classList.remove('menu-open');
  document.body.style.top = '';
  window.scrollTo({ top: position, behavior: 'instant' });
}

function finishClose(restoreFocus = true) {
  unlock();
  dialog?.close();
  dialog?.classList.remove('is-closing', 'is-navigating');
  trigger?.setAttribute('aria-expanded', 'false');
  closing = false;
  if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
}

async function closeMenu() {
  if (!dialog?.open || closing) return;
  const closingDialog = dialog;
  closing = true;
  dialog.classList.add('is-closing');
  if (!motion.matches) await Promise.allSettled(dialog.getAnimations({ subtree: true }).map(animation => animation.finished));
  if (closingDialog.isConnected) finishClose();
}

function initializeMenu() {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;
  dialog = document.querySelector<HTMLDialogElement>('#site-menu')!;
  trigger = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
  const close = dialog.querySelector<HTMLButtonElement>('.menu-close')!;
  if (!dialog.showModal) return;
  locked = closing = false;
  trigger.hidden = false;
  trigger.addEventListener('click', () => {
    if (dialog.open) return;
    position = scrollY;
    locked = true;
    document.body.style.top = `-${position}px`;
    document.documentElement.classList.add('menu-open');
    dialog.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    close.focus({ preventScroll: true });
  }, { signal });
  close.addEventListener('click', closeMenu, { signal });
  dialog.addEventListener('cancel', event => { event.preventDefault(); void closeMenu(); }, { signal });
  dialog.addEventListener('click', event => { if (event.target === dialog) void closeMenu(); }, { signal });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll<HTMLElement>('a[href],button')];
    if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
    else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
  }, { signal });
  dialog.addEventListener('close', () => { unlock(); trigger.setAttribute('aria-expanded', 'false'); }, { signal });
  // Let Astro handle internal links; preserve modified clicks, external tabs and mailto.
  dialog.querySelectorAll<HTMLAnchorElement>('a').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || link.target === '_blank') void closeMenu();
    else if (url.pathname === location.pathname && url.search === location.search) {
      event.preventDefault();
      void closeMenu();
    }
  }, { signal }));
}

document.addEventListener('astro:before-preparation', raw => {
  const event = raw as TransitionBeforePreparationEvent;
  navigationVersion++;
  changedRoute = event.from.pathname !== event.to.pathname;
  document.documentElement.classList.add('route-restoring');
  const loader = event.loader;
  if (dialog?.open) {
    dialog.classList.add('is-navigating');
    // Restore real document scroll before Astro saves history. Keep the modal in
    // the old snapshot so it fades directly into the destination, without a gap.
    unlock();
    event.loader = async () => {
      await Promise.all([loader(), new Promise(resolve => setTimeout(resolve, motion.matches ? 0 : 200))]);
    };
  }
});

document.addEventListener('astro:before-swap', raw => {
  const event = raw as TransitionBeforeSwapEvent;
  const version = navigationVersion;
  const swap = event.swap;
  event.swap = () => {
    // Native snapshots already contain the menu. The fallback has now finished
    // its exit animation as well, so both paths can close at the actual swap.
    finishClose(false);
    controller?.abort();
    swap();
  };
  event.newDocument.documentElement.classList.add('route-restoring');
  // Astro restores history/anchors during the swap; temporarily suppress CSS
  // smooth scrolling and Home snapping, then restore both after the transition.
  void event.viewTransition.finished.finally(() => {
    if (version === navigationVersion) document.documentElement.classList.remove('route-restoring');
  });
});

document.addEventListener('astro:page-load', () => {
  initializeMenu();
  if (changedRoute) {
    const target = document.querySelector<HTMLElement>(location.hash ? `[id="${CSS.escape(decodeURIComponent(location.hash.slice(1)))}"]` : 'main h1');
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    changedRoute = false;
  }
});
window.addEventListener('pagehide', () => finishClose(false));
window.addEventListener('pageshow', event => { if (event.persisted) { finishClose(false); initializeMenu(); } });
initializeMenu();
