// Shared formatting helpers used across the app.

// "IN_COMMITTEE" -> "In Committee", "PASSED_CHAMBER" -> "Passed Chamber".
export const formatStatus = (s) =>
  s ? String(s).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';

// Friendly result label for feed cards / activity rows. Avoids surfacing
// the bare word "Failed" alone (looks like an app error). Prefers the
// human result string when present, falls back to the status.
export const formatResult = (result, status) => {
  const r = (result || '').trim();
  if (r) {
    if (/motion\s+rejected/i.test(r)) return 'Motion Rejected';
    if (/passed/i.test(r)) return 'Passed';
    if (/^failed$/i.test(r)) return 'Bill Failed';
    return r;
  }
  const s = (status || '').toString().toLowerCase();
  if (s === 'failed') return 'Bill Failed';
  if (s === 'passed') return 'Passed';
  return formatStatus(status);
};
