import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./index.css";

export type NotifyType = "success" | "error" | "info" | "warning" | "question";


const SEGPrincipalNotificator = (message: string, type: NotifyType = "info", title?: string) => {
  if (typeof window === "undefined") return; // seguro para SSR

  const Toast = Swal.mixin({
    toast: true,
    position: "bottom",
    showConfirmButton: false,
    timer: 3000,
    background: "transparent",
    customClass: {
      popup: "seg-toast-popup",
    },
    didOpen: (popup) => {
      popup.addEventListener("mouseenter", () => Swal.stopTimer && (Swal.stopTimer as any)());
      popup.addEventListener("mouseleave", () => Swal.resumeTimer && (Swal.resumeTimer as any)());
    },
  });

  const html = `
    <div class="seg-toast-root">
      <div class="seg-toast-left">
        <div class="seg-toast-icon-wrap">${getIconSVG(type)}</div>
      </div>
      <div class="seg-toast-right">
        <div class="seg-toast-header">${escapeHtml(title ?? capitalizeType(type))}</div>
        <div class="seg-toast-message">${escapeHtml(message)}</div>
      </div>
    </div>
  `;

  Toast.fire({
    html
  });
}

/* ---------- Helpers ---------- */
function capitalizeType(t: NotifyType) {
  return t[0].toUpperCase() + t.slice(1);
}
function escapeHtml(unsafe: string) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function getIconSVG(type: NotifyType): string {
  switch (type) {
    case "success":
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.15)"/><path d="M20 6L9 17L4 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "error":
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.12)"/><path d="M15 9L9 15M9 9l6 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "warning":
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.12)"/><path d="M12 7v5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15h.01" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "info":
    default:
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.12)"/><path d="M12 8h.01" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.75 11h1.5v4h-1.5z" fill="#fff"/></svg>`;
  }
}

export default SEGPrincipalNotificator;