import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const COLUMN_ALIASES = {
  name: ['name', 'full name', 'lead name', 'contact name', 'first name', 'last name', 'customer', 'customer name', 'client', 'client name', 'person name', 'candidate', 'prospect', 'lead', 'applicant', 'username', 'user name', 'person', 'individual', 'full_name', 'first_name', 'last_name'],
  email: ['email', 'e-mail', 'email address', 'email id', 'mail', 'e mail', 'email_id', 'emailaddress', 'email_addr', 'recipient', 'recipient email', 'primary email', 'contact email'],
  mobile: ['mobile', 'phone', 'phone number', 'mobile number', 'contact number', 'tel', 'telephone', 'phone_no', 'phone no', 'contact_no', 'cell', 'cell phone', 'whatsapp', 'phone1', 'phone 1', 'mobile1', 'mobile 1', 'primary phone', 'primary mobile', 'contact', 'phone_number'],
  company: ['company', 'company name', 'organization', 'organisation', 'business', 'firm', 'employer', 'company_name', 'org', 'organization name', 'account name', 'agency'],
  city: ['city', 'town', 'location', 'locality', 'place', 'municipality', 'area'],
  state: ['state', 'province', 'region', 'territory', 'county'],
  country: ['country', 'nation', 'country name'],
  lead_owner: ['lead owner', 'owner', 'assigned to', 'lead_owner', 'sales person', 'account manager', 'assignee', 'responsible', 'owner email', 'sales rep'],
  notes: ['notes', 'note', 'remarks', 'comment', 'comments', 'description', 'additional info', 'information', 'crm_note', 'remarks', 'feedback', 'additional notes', 'extra info'],
  source: ['source', 'data source', 'lead source', 'campaign', 'data_source', 'utm_source', 'campaign name', 'ad name', 'ad set', 'origin'],
  date: ['date', 'created at', 'created_at', 'created date', 'created_date', 'timestamp', 'submission date', 'lead date', 'created', 'submitted at', 'entry date', 'record date'],
};

function findColumn(record, aliases) {
  const keys = Object.keys(record);
  for (const alias of aliases) {
    const match = keys.find(k => k.toLowerCase().trim() === alias.toLowerCase().trim());
    if (match) return record[match];
  }
  for (const alias of aliases) {
    const match = keys.find(k => {
      const words = k.toLowerCase().split(/[\s_-]+/);
      return words.some(w => w === alias.toLowerCase());
    });
    if (match) return record[match];
  }
  return null;
}

function extractEmail(str) {
  if (!str) return null;
  const match = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function extractPhone(str) {
  if (!str) return null;
  const digits = str.replace(/[^0-9]/g, '');
  if (digits.length >= 10) return digits;
  return null;
}

function extractCountryCode(mobileStr) {
  if (!mobileStr) return '';
  const match = mobileStr.match(/^(\+?\d{1,3})[-.\s]?/);
  return match ? match[1] : '';
}

function extractMobileWithoutCode(mobileStr) {
  if (!mobileStr) return '';
  const cleaned = mobileStr.replace(/^\+?\d{1,3}[-.\s]?/, '').replace(/[^0-9]/g, '');
  return cleaned.length >= 10 ? cleaned : '';
}

function inferCrmStatus(record) {
  const text = JSON.stringify(record).toLowerCase();
  if (text.includes('sale') || text.includes('deal') || text.includes('closed') || text.includes('converted') || text.includes('purchased')) return 'SALE_DONE';
  if (text.includes('bad') || text.includes('not interested') || text.includes('unsubscribe') || text.includes('reject') || text.includes('spam')) return 'BAD_LEAD';
  if (text.includes('busy') || text.includes('no answer') || text.includes('not reachable') || text.includes('nrna') || text.includes('dnd') || text.includes('did not connect')) return 'DID_NOT_CONNECT';
  return 'GOOD_LEAD_FOLLOW_UP';
}

function scanAllColumns(record) {
  const allEmails = [];
  const allPhones = [];
  const allValues = [];

  for (const val of Object.values(record)) {
    if (val === null || val === undefined) continue;
    const strVal = String(val);
    allValues.push(strVal);

    const emailsInVal = strVal.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailsInVal) allEmails.push(...emailsInVal);

    const digits = strVal.replace(/[^0-9]/g, '');
    const isDate = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(strVal.trim());
    if (digits.length >= 10 && !isDate) allPhones.push({ raw: strVal, digits });
  }

  const uniqueEmails = [...new Set(allEmails)];
  const uniquePhones = allPhones.filter((p, i, a) => a.findIndex(x => x.digits === p.digits) === i);

  return { allEmails: uniqueEmails, allPhones: uniquePhones, allValues };
}

function combineFirstLastName(record) {
  const keys = Object.keys(record);
  let first = '', last = '';
  for (const key of keys) {
    const lk = key.toLowerCase().trim();
    const words = lk.split(/[\s_-]+/);
    if (words.some(w => ['first', 'given'].includes(w)) && !words.some(w => ['last', 'surname', 'family'].includes(w))) {
      first = String(record[key] || '');
    }
    if (words.some(w => ['last', 'surname', 'family'].includes(w)) && !words.some(w => ['first', 'given'].includes(w))) {
      last = String(record[key] || '');
    }
  }
  if (first || last) return `${first} ${last}`.trim();
  return null;
}

function extractRecordsFallback(records) {
  return records.map(record => {
    let name = findColumn(record, COLUMN_ALIASES.name) || '';

    const combined = combineFirstLastName(record);
    if (!name && combined) name = combined;

    let email = findColumn(record, COLUMN_ALIASES.email) || '';
    let mobileRaw = findColumn(record, COLUMN_ALIASES.mobile) || '';

    const company = findColumn(record, COLUMN_ALIASES.company) || '';
    const city = findColumn(record, COLUMN_ALIASES.city) || '';
    const state = findColumn(record, COLUMN_ALIASES.state) || '';
    const country = findColumn(record, COLUMN_ALIASES.country) || '';
    const leadOwner = findColumn(record, COLUMN_ALIASES.lead_owner) || '';
    const notes = findColumn(record, COLUMN_ALIASES.notes) || '';
    const source = findColumn(record, COLUMN_ALIASES.source) || '';
    let dateRaw = findColumn(record, COLUMN_ALIASES.date) || '';

    const scanned = scanAllColumns(record);

    if (!email) email = scanned.allEmails[0] || '';
    if (!mobileRaw && scanned.allPhones.length > 0) mobileRaw = scanned.allPhones[0].raw;

    const mobileWithoutCode = extractMobileWithoutCode(mobileRaw);
    const countryCode = extractCountryCode(mobileRaw);

    const crmStatus = inferCrmStatus(record);
    let combinedNotes = notes || '';

    const extraEmails = scanned.allEmails.filter(e => e !== email);
    if (extraEmails.length > 0) {
      combinedNotes += (combinedNotes ? ' | ' : '') + 'Other emails: ' + extraEmails.join(', ');
    }

    const extraPhones = scanned.allPhones.filter(p => p.raw !== mobileRaw);
    if (extraPhones.length > 0) {
      combinedNotes += (combinedNotes ? ' | ' : '') + 'Other phones: ' + extraPhones.map(p => p.raw).join(', ');
    }

    let created_at = dateRaw || '';
    if (created_at) {
      const d = new Date(created_at);
      if (!isNaN(d.getTime())) {
        created_at = d.toISOString().replace('T', ' ').substring(0, 19);
      }
    }

    return {
      created_at,
      name: name || '',
      email: email || '',
      country_code: countryCode,
      mobile_without_country_code: mobileWithoutCode,
      company,
      city,
      state,
      country,
      lead_owner: leadOwner,
      crm_status: crmStatus,
      crm_note: combinedNotes,
      data_source: source || '',
      possession_time: '',
      description: notes || '',
    };
  });
}

const SYSTEM_PROMPT = `You are a data extraction assistant. Your task is to map CSV data to CRM fields.

The CRM fields are:
- created_at: Lead creation date (must be valid JS Date format)
- name: Lead name
- email: Primary email
- country_code: Country code (e.g. +91)
- mobile_without_country_code: Mobile number without country code
- company: Company name
- city: City
- state: State
- country: Country
- lead_owner: Lead owner email or name
- crm_status: Lead status (must be one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE)
- crm_note: Notes, remarks, extra emails/phones, any info that doesn't fit elsewhere
- data_source: Source (must be one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots - or leave blank)
- possession_time: Property possession time
- description: Additional description

RULES:
1. crm_status must only be one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE
2. data_source must only be one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots (or blank)
3. created_at must be a valid date string parseable by JavaScript's new Date()
4. If multiple emails exist, use the first as email, append others to crm_note
5. If multiple phone numbers exist, use the first as mobile, append others to crm_note
6. If a record has NEITHER email nor mobile number, skip it (exclude from output)
7. Use crm_note for: remarks, follow-up notes, extra phone numbers, extra emails, any info not fitting other fields
8. Intelligently map column names - don't assume exact matches. "Full Name" -> name, "Phone" -> mobile, "Email Address" -> email, etc.
9. Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

function buildPrompt(records) {
  return `${SYSTEM_PROMPT}

Extract CRM fields from these records. Return a JSON object with a key "records" containing an array of objects.

Skip any record without both email and mobile number.

Input records:
${JSON.stringify(records, null, 2)}`;
}

export async function extractRecords(records) {
  if (process.env.AI_PROVIDER === 'gemini') {
    return extractWithGemini(records);
  }
  return extractRecordsFallback(records);
}

async function extractWithGemini(records) {
  const BATCH_SIZE = 20;
  const allResults = [];

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    generationConfig: { temperature: 0.1 },
  });

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    let retries = 3;

    while (retries > 0) {
      try {
        const result = await model.generateContent(buildPrompt(batch));
        const response = await result.response;
        const text = response.text();

        const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const batchResults = parsed.records || parsed.data || parsed;

        if (Array.isArray(batchResults)) {
          allResults.push(...batchResults);
        } else {
          allResults.push(batchResults);
        }
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error(`AI batch failed, falling back to rule-based mapping:`, error.message);
          allResults.push(...extractRecordsFallback(batch));
          break;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  return allResults;
}
