import { Router } from 'express';
import multer from 'multer';
import { parseCsv } from '../services/csvParser.js';
import { extractRecords } from '../services/aiService.js';
import { validateCrmStatus, validateDataSource, validateDate } from '../utils/validation.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/parse-csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const records = parseCsv(req.file.buffer);
    res.json({ records, total: records.length });
  } catch (error) {
    res.status(400).json({ error: 'Failed to parse CSV', message: error.message });
  }
});

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const records = parseCsv(req.file.buffer);

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    const extracted = await extractRecords(records);
    const withEmailOrPhone = extracted.filter(r => r.email || r.mobile_without_country_code);
    const totalSkipped = records.length - withEmailOrPhone.length;

    const validated = withEmailOrPhone.map(r => ({
      created_at: validateDate(r.created_at) || '',
      name: r.name || r.Name || '',
      email: r.email || r.Email || '',
      country_code: r.country_code || '',
      mobile_without_country_code: r.mobile_without_country_code || r.mobile || r.Mobile || '',
      company: r.company || r.Company || '',
      city: r.city || r.City || '',
      state: r.state || r.State || '',
      country: r.country || r.Country || '',
      lead_owner: r.lead_owner || '',
      crm_status: validateCrmStatus(r.crm_status) || '',
      crm_note: r.crm_note || '',
      data_source: validateDataSource(r.data_source),
      possession_time: r.possession_time || '',
      description: r.description || '',
    }));

    const totalImported = validated.length;

    const DISPLAY_LIMIT = 50;
    res.json({
      imported: validated.slice(0, DISPLAY_LIMIT),
      totalImported,
      totalSkipped,
      totalRecords: records.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'AI extraction failed', message: error.message });
  }
});

export default router;
