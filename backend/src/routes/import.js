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

    const rawRecords = parseCsv(req.file.buffer);

    if (rawRecords.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    const first = rawRecords[0];
    const firstKeys = Object.keys(first);
    const firstVals = Object.values(first).map(v => String(v));
    const firstJoined = firstVals.join(' ');
    const emailInRaw = firstJoined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const digitsInRaw = firstJoined.replace(/[^0-9]/g, '');
    const phoneInRaw = digitsInRaw.length >= 10 ? digitsInRaw : '';

    const extracted = await extractRecords(rawRecords);
    const extractedFirst = extracted[0];

    const debug = {
      rawColumns: firstKeys,
      rawValues: firstVals,
      rawHasEmail: !!emailInRaw,
      rawHasPhone: !!phoneInRaw,
      rawEmail: emailInRaw ? emailInRaw[0] : null,
      rawPhone: phoneInRaw || null,
      mappedEmail: extractedFirst ? extractedFirst.email : null,
      mappedPhone: extractedFirst ? extractedFirst.mobile_without_country_code : null,
      mappedName: extractedFirst ? extractedFirst.name : null,
      extractedCount: extracted.length,
    };

    const validated = extracted.map(r => ({
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
    const totalSkipped = 0;

    const DISPLAY_LIMIT = 50;
    res.json({
      imported: validated.slice(0, DISPLAY_LIMIT),
      totalImported,
      totalSkipped,
      totalRecords: rawRecords.length,
      debug,
    });
  } catch (error) {
    res.status(500).json({ error: 'AI extraction failed', message: error.message });
  }
});

export default router;
