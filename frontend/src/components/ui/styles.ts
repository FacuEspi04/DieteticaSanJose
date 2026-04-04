/*
 * Reusable Tailwind-based style constants for common UI patterns.
 * Import and use these in components instead of repeating long class strings.
 */

/* ─── Buttons ─── */
export const btn = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
export const btnSm = `${btn} px-3 py-1.5 text-sm`;
export const btnMd = `${btn} px-4 py-2 text-sm`;

export const btnDark = `${btnSm} bg-slate-800 text-white hover:bg-slate-700`;
export const btnOutlineDark = `${btnSm} border border-slate-300 text-slate-700 hover:bg-slate-100`;
export const btnSuccess = `${btnSm} bg-emerald-600 text-white hover:bg-emerald-700`;
export const btnDanger = `${btnSm} bg-red-600 text-white hover:bg-red-700`;
export const btnOutlineDanger = `${btnSm} border border-red-300 text-red-600 hover:bg-red-50`;
export const btnOutlinePrimary = `${btnSm} border border-blue-300 text-blue-600 hover:bg-blue-50`;
export const btnSecondary = `${btnSm} bg-slate-200 text-slate-700 hover:bg-slate-300`;
export const btnPrimary = `${btnSm} bg-blue-600 text-white hover:bg-blue-700`;
export const btnWarning = `${btnSm} bg-amber-400 text-slate-900 hover:bg-amber-500`;
export const btnInfo = `${btnSm} bg-sky-500 text-white hover:bg-sky-600`;
export const btnLink = 'p-0 text-slate-600 hover:text-slate-900 cursor-pointer bg-transparent border-none';
export const btnOutlineSecondary = `${btnSm} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;

/* ─── Cards ─── */
export const card = 'bg-white border border-slate-200 rounded-xl shadow-sm';
export const cardHeader = 'flex items-center justify-between px-5 py-3.5 border-b border-slate-200';
export const cardBody = 'p-5';
export const cardFooter = 'flex items-center justify-between px-5 py-3.5 border-t border-slate-200';

/* ─── Form inputs ─── */
export const input = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100 disabled:text-slate-400 transition-colors';
export const select = input;
export const label = 'block text-sm font-medium text-slate-700 mb-1';
export const formText = 'text-xs text-slate-500 mt-1';
export const formGroup = 'mb-4';

/* ─── Input Group ─── */
export const inputGroupWrapper = 'flex';
export const inputGroupText = 'inline-flex items-center px-3 text-sm text-slate-500 bg-slate-50 border border-slate-300 border-r-0 rounded-l-lg';
export const inputGroupInput = `${input} rounded-l-none`;
export const inputGroupBtn = `${btnOutlineSecondary} rounded-l-none border-l-0`;

/* ─── Alerts ─── */
const alertBase = 'px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-4';
export const alertDanger = `${alertBase} bg-red-50 text-red-700 border border-red-200`;
export const alertSuccess = `${alertBase} bg-emerald-50 text-emerald-700 border border-emerald-200`;
export const alertWarning = `${alertBase} bg-amber-50 text-amber-800 border border-amber-200`;
export const alertInfo = `${alertBase} bg-blue-50 text-blue-700 border border-blue-200`;

/* ─── Badges ─── */
const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
export const badgeSuccess = `${badgeBase} bg-emerald-100 text-emerald-800`;
export const badgeDanger = `${badgeBase} bg-red-100 text-red-800`;
export const badgeWarning = `${badgeBase} bg-amber-100 text-amber-800`;
export const badgeInfo = `${badgeBase} bg-sky-100 text-sky-800`;
export const badgePrimary = `${badgeBase} bg-blue-100 text-blue-800`;
export const badgeSecondary = `${badgeBase} bg-slate-100 text-slate-700`;

/* ─── Tables ─── */
export const table = 'w-full text-sm';
export const tableHeaderBrand = 'bg-slate-800 text-white';
export const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider';
export const td = 'px-4 py-3 border-t border-slate-100';
export const trStriped = 'even:bg-slate-50/50';
export const trHover = 'hover:bg-slate-50 transition-colors';
