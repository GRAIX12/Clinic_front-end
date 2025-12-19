export function toDateInputValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  // yyyy-mm-dd
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toDateTimeLocalValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  // yyyy-mm-ddThh:mm
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDateInputValue(v: string): string {
  // interpret as local date at 00:00
  const d = new Date(v + 'T00:00:00');
  return d.toISOString();
}

export function fromDateTimeLocalValue(v: string): string {
  // v is local time; convert to ISO
  const d = new Date(v);
  return d.toISOString();
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}
