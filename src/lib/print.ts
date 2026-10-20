/**
 * Print one element as a receipt. The element is copied into a top-level
 * container, so a dialog's transform or `overflow: hidden` can't clip it the
 * way printing it in place would.
 */
export function printElement(el: HTMLElement | null) {
  if (!el) return;
  document.getElementById("print-root")?.remove();
  const root = document.createElement("div");
  root.id = "print-root";
  root.appendChild(el.cloneNode(true));
  document.body.appendChild(root);
  document.documentElement.classList.add("printing");

  const cleanup = () => {
    root.remove();
    document.documentElement.classList.remove("printing");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  // Some browsers return from print() before firing afterprint; never leave the copy behind.
  setTimeout(cleanup, 1000);
}
