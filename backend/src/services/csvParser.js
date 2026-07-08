import { parse } from 'csv-parse/sync';

export function parseCsv(buffer) {
  const content = buffer.toString('utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  });
  return records;
}
