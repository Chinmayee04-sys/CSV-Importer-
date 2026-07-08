const ALLOWED_CRM_STATUSES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
];

const ALLOWED_DATA_SOURCES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
];

export function validateCrmStatus(status) {
  if (!status) return null;
  const upper = status.toUpperCase().replace(/\s+/g, '_');
  if (ALLOWED_CRM_STATUSES.includes(upper)) return upper;
  return null;
}

export function validateDataSource(source) {
  if (!source) return '';
  const lower = source.toLowerCase().replace(/\s+/g, '_');
  if (ALLOWED_DATA_SOURCES.includes(lower)) return lower;
  return '';
}

export function validateDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString().replace('T', ' ').substring(0, 19);
  return null;
}

export function sanitizeCsvField(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}
