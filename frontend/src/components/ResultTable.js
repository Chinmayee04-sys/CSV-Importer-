'use client';

const CRM_COLUMNS = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

export default function ResultTable({ records, totalRecords }) {
  if (!records || records.length === 0) {
    return <div className="empty-state">No records imported</div>;
  }

  return (
    <div className="table-wrapper">
      {totalRecords > records.length && (
        <p style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 14 }}>
          Showing first {records.length} of {totalRecords} imported records
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>#</th>
            {CRM_COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((row, i) => (
            <tr key={i}>
              <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
              {CRM_COLUMNS.map((col) => (
                <td key={col}>{row[col] || ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
