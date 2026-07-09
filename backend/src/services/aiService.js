import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const COLUMN_ALIASES = {
  name: [
    'name', 'full name', 'full_name', 'fullname', 'lead name', 'contact name',
    'first name', 'first_name', 'firstname', 'given name', 'given_name',
    'last name', 'last_name', 'lastname', 'surname', 'family name', 'family_name',
    'customer name', 'customer', 'customer_name', 'client name', 'client',
    'person name', 'person', 'individual',
    'candidate', 'prospect', 'lead', 'applicant', 'username', 'user name',
    'contact person', 'contact_person', 'contact name', 'contact_name',
    'full name of lead', 'lead name', 'lead_name',
    'landlord', 'tenant', 'buyer', 'seller', 'agent name', 'agent_name',
    'first', 'last',
  ],
  firstName: [
    'first name', 'first_name', 'firstname', 'first',
    'given name', 'given_name',
    'fname', 'f name', 'f_name',
  ],
  lastName: [
    'last name', 'last_name', 'lastname', 'last',
    'surname', 'family name', 'family_name',
    'lname', 'l name', 'l_name',
  ],
  email: [
    'email', 'e-mail', 'email address', 'email address', 'email id',
    'mail', 'e mail', 'email_id', 'emailaddress', 'email_addr',
    'recipient', 'recipient email', 'recipient email address',
    'primary email', 'primary_email', 'alternate email',
    'email address (primary)', 'email 1', 'email1',
    'contact email', 'contact_email', 'business email',
    'personal email', 'work email', 'company email',
    'email address 1', 'mailing email',
    'reply-to', 'reply to',
  ],
  mobile: [
    'mobile', 'phone', 'phone number', 'phone_number',
    'mobile number', 'mobile_number', 'mobileno',
    'contact number', 'contact_number', 'contactno',
    'tel', 'telephone', 'telephone number',
    'phone_no', 'phone no', 'contact_no', 'contact no',
    'cell', 'cell phone', 'cell number', 'cellphone', 'cell_no',
    'whatsapp', 'whatsapp number',
    'phone1', 'phone 1', 'mobile1', 'mobile 1',
    'primary phone', 'primary phone number', 'primary mobile',
    'contact', 'phone (primary)', 'mobile (primary)',
    'home phone', 'home phone number', 'work phone', 'work phone number',
    'business phone', 'business phone number',
    'secondary phone', 'secondary phone number',
    'alt phone', 'alternate phone', 'alternate phone number',
    'phone no.', 'mobile no.', 'mobile no',
    'landline', 'land line', 'landline number',
    'phone number (primary)', 'mobile phone', 'mobile phone number',
    'telephone 1', 'telephone1', 'phone number 1',
    'customer phone', 'customer phone number',
    'contact telephone', 'mailing phone',
  ],
  company: [
    'company', 'company name', 'company_name', 'companyname',
    'organization', 'organisation', 'organization name', 'organization_name',
    'business', 'firm', 'employer', 'employer name',
    'company/building', 'org', 'organisation name',
    'account name', 'account_name', 'account',
    'agency', 'agency name',
    'property management', 'brokerage', 'brokerage name',
    'work for', 'works at', 'company / building',
    'corporate name', 'legal name', 'trading name',
    'business name', 'business_name', 'biz name',
    'customer company', 'client company',
  ],
  city: [
    'city', 'town', 'location', 'locality', 'place', 'municipality',
    'area', 'city / town', 'city/town',
    'mailing city', 'mailing_city',
    'property city', 'property_city',
    'home city', 'work city',
    'city name', 'city_name',
    'suburb', 'district',
    'customer city', 'client city',
    'city / state', 'city, state',
  ],
  state: [
    'state', 'province', 'region', 'territory', 'county',
    'state/province', 'state / province', 'state-province',
    'mailing state', 'mailing_state', 'mailing state/province',
    'property state', 'property_state',
    'home state', 'work state',
    'state code', 'state_code',
    'prefecture', 'department',
    'admin area', 'administrative area', 'admin area 1',
    'customer state', 'client state',
  ],
  country: [
    'country', 'nation', 'country name', 'country_name',
    'mailing country', 'mailing_country',
    'property country', 'property_country',
    'home country', 'work country',
    'country code', 'country_code',
    'customer country', 'client country',
    'nationality',
  ],
  address: [
    'address', 'full address', 'full_address', 'street address', 'street_address',
    'street', 'mailing street', 'mailing_street',
    'property address', 'property_address',
    'home address', 'work address',
    'billing address', 'shipping address',
    'address line 1', 'address_line_1', 'address1', 'address 1',
    'address line 2', 'address_line_2', 'address2', 'address 2',
    'unit', 'apt', 'apartment', 'suite',
    'po box', 'pobox', 'p.o. box', 'post office box',
    'customer address', 'client address',
    'residential address', 'postal address',
    'location address', 'physical address',
  ],
  lead_owner: [
    'lead owner', 'lead_owner', 'owner', 'lead owner (agent)',
    'assigned to', 'assigned_to', 'assignee',
    'sales person', 'salesperson', 'sales rep', 'sales representative',
    'account manager', 'account_manager', 'account executive',
    'responsible', 'responsible person',
    'owner email', 'owner_email',
    'agent', 'agent name', 'agent_name',
    'broker', 'broker name',
    'staff', 'staff name',
    'handler', 'handled by',
    'point of contact', 'poc',
    'listing agent', 'buyers agent',
    'assigned agent', 'servicing agent',
  ],
  notes: [
    'notes', 'note', 'remarks', 'remark',
    'comment', 'comments', 'additional comments',
    'description', 'additional info', 'information', 'info',
    'crm_note', 'crm note',
    'feedback', 'additional notes', 'extra info',
    'private notes', 'private notes (internal)',
    'public remarks', 'private remarks',
    'agent notes', 'agent notes (internal)',
    'internal notes', 'internal note',
    'follow up notes', 'follow-up notes', 'follow_up_notes',
    'special instructions', 'special_instructions',
    'additional details', 'extra details',
    'summary', 'detail', 'details',
    'lead notes', 'lead notes (internal)',
    'customer notes', 'client notes',
    'property notes', 'listing notes',
  ],
  source: [
    'source', 'data source', 'data_source', 'lead source', 'lead_source',
    'campaign', 'campaign name', 'campaign_name',
    'campaign source', 'campaign_source',
    'utm_source', 'utm source', 'utm campaign', 'utm_campaign',
    'ad name', 'ad_name', 'ad set', 'ad_set', 'ad set name', 'ad_set_name',
    'origin', 'channel', 'marketing channel',
    'traffic source', 'traffic_source',
    'referral', 'referrer', 'referral source',
    'acquisition channel', 'acquisition_source',
    'marketing campaign', 'marketing_campaign',
    'campaign id', 'campaign_id',
    'form name', 'form_name', 'form',
    'ad campaign', 'ad_campaign',
    'source type', 'source_type',
    'lead source (campaign)', 'lead source (ad)',
    'listing type', 'inquiry type',
    'promotion', 'promo code', 'coupon',
  ],
  date: [
    'date', 'created at', 'created_at', 'created date', 'created_date',
    'timestamp', 'submission date', 'submission_date',
    'lead date', 'lead_date', 'created', 'submitted at', 'submitted_at',
    'entry date', 'entry_date', 'record date', 'record_date',
    'create date', 'create_date',
    'date created', 'date_created',
    'date added', 'date_added',
    'submitted', 'submission timestamp',
    'date entered', 'date_entered',
    'list date', 'list_date', 'listing date', 'listing_date',
    'sold date', 'sold_date',
    'close date', 'close_date', 'closing date',
    'contract date', 'contract_date',
    'follow up date', 'follow_up_date', 'next follow up', 'next_follow_up',
    'last contacted', 'last_contacted', 'last contact date',
    'updated at', 'updated_at', 'last updated', 'last_updated',
    'modify date', 'modify_date',
    'start date', 'start_date', 'end date', 'end_date',
    'date range', 'date_range',
    'ad schedule', 'generation date',
    'creation date', 'registration date', 'register date',
    'date of birth', 'dob', 'birth date', 'birthday',
    'appointment date', 'appointment_date',
    'visit date', 'visit_date', 'viewing date',
    'inquiry date', 'inquiry_date',
    'response date', 'response_date',
    'transaction date', 'transaction_date',
    'effective date', 'effective_date',
  ],
  zip: [
    'zip', 'zip code', 'zip_code', 'zipcode',
    'postal code', 'postal_code', 'postcode',
    'post code', 'post_code', 'pincode', 'pin code', 'pin_code',
    'mailing zip', 'mailing_zip', 'mailing postal code',
    'property zip', 'property_zip',
    'postal', 'post code',
  ],
};

const FIRST_NAME_KEYWORDS = ['first', 'given', 'fname', 'f_name', 'f name'];
const LAST_NAME_KEYWORDS = ['last', 'surname', 'family', 'lname', 'l_name', 'l name'];

function findColumn(record, aliases) {
  const keys = Object.keys(record);
  const lowerKeys = keys.map(k => k.toLowerCase().trim());

  for (let i = 0; i < aliases.length; i++) {
    const alias = aliases[i].toLowerCase().trim();
    if (lowerKeys.includes(alias)) return record[keys[lowerKeys.indexOf(alias)]];
  }

  for (let i = 0; i < aliases.length; i++) {
    const alias = aliases[i].toLowerCase().trim();
    const aliasWords = alias.split(/[\s_-]+/).filter(Boolean);
    for (let j = 0; j < keys.length; j++) {
      const keyWords = lowerKeys[j].split(/[\s_-]+/).filter(Boolean);
      if (aliasWords.every(w => keyWords.includes(w))) {
        return record[keys[j]];
      }
    }
  }

  for (let i = 0; i < aliases.length; i++) {
    const alias = aliases[i].toLowerCase().trim();
    const aliasWords = alias.split(/[\s_-]+/).filter(Boolean);
    for (let j = 0; j < keys.length; j++) {
      const keyWords = lowerKeys[j].split(/[\s_-]+/).filter(Boolean);
      if (aliasWords.some(w => keyWords.includes(w))) {
        return record[keys[j]];
      }
    }
  }

  return null;
}

function findFirstLastName(record) {
  const keys = Object.keys(record);
  const lowerKeys = keys.map(k => k.toLowerCase().trim());

  let firstNameCol = null;
  let lastNameCol = null;

  const allNameAliases = [
    ...COLUMN_ALIASES.firstName,
    ...COLUMN_ALIASES.name,
    ...COLUMN_ALIASES.lastName,
  ];

  for (let i = 0; i < keys.length; i++) {
    const lk = lowerKeys[i];
    const words = lk.split(/[\s_-]+/).filter(Boolean);
    const hasFirst = words.some(w => FIRST_NAME_KEYWORDS.includes(w));
    const hasLast = words.some(w => LAST_NAME_KEYWORDS.includes(w));
    const isNotBoth = !(hasFirst && hasLast);
    if (hasFirst && isNotBoth) firstNameCol = keys[i];
    if (hasLast && isNotBoth) lastNameCol = keys[i];
  }

  if (!firstNameCol && !lastNameCol) return null;

  const first = firstNameCol ? (record[firstNameCol] || '').trim() : '';
  const last = lastNameCol ? (record[lastNameCol] || '').trim() : '';

  if (!first && !last) return null;
  return `${first} ${last}`.trim();
}

function parseAddress(record) {
  const addressRaw = findColumn(record, COLUMN_ALIASES.address) || '';
  if (!addressRaw) return { city: '', state: '', country: '', zip: '' };

  const parts = addressRaw.split(',').map(s => s.trim()).filter(Boolean);
  let city = '', state = '', country = '', zip = '';

  const zipMatch = addressRaw.match(/\b(\d{5,6})(?:-\d{4})?\b/);
  if (zipMatch) zip = zipMatch[1];

  if (parts.length >= 3) {
    country = parts[parts.length - 1];
    state = parts[parts.length - 2];
    city = parts[parts.length - 3];
  } else if (parts.length === 2) {
    const last = parts[1];
    if (last.length <= 3 || last === last.toUpperCase()) {
      state = last;
      city = parts[0];
    } else {
      city = parts[0];
      country = last;
    }
  } else if (parts.length === 1) {
    city = parts[0];
  }

  const stateZipMatch = state.match(/^(.+?)\s+(\d{5,6})$/);
  if (stateZipMatch) {
    state = stateZipMatch[1];
    if (!zip) zip = stateZipMatch[2];
  }

  const existingCity = findColumn(record, COLUMN_ALIASES.city);
  const existingState = findColumn(record, COLUMN_ALIASES.state);
  const existingCountry = findColumn(record, COLUMN_ALIASES.country);
  const existingZip = findColumn(record, COLUMN_ALIASES.zip);

  return {
    city: existingCity || city,
    state: existingState || state,
    country: existingCountry || country,
    zip: existingZip || zip,
  };
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
  if (text.includes('sale') || text.includes('deal') || text.includes('closed') ||
      text.includes('converted') || text.includes('purchased') || text.includes('bought') ||
      text.includes('won') || text.includes('qualified') || text.includes('ready to buy') ||
      text.includes('hot') || text.includes('negotiating') || text.includes('offer')) return 'SALE_DONE';
  if (text.includes('bad') || text.includes('not interested') || text.includes('interested') === false ||
      text.includes('unsubscribe') || text.includes('reject') || text.includes('spam') ||
      text.includes('disqualified') || text.includes('lost') || text.includes('do not call') ||
      text.includes('dnc') || text.includes('junk') || text.includes('no budget') ||
      text.includes('not now') || text.includes('stop') || text.includes('blocked')) return 'BAD_LEAD';
  if (text.includes('busy') || text.includes('no answer') || text.includes('not reachable') ||
      text.includes('nrna') || text.includes('dnd') || text.includes('did not connect') ||
      text.includes('no response') || text.includes('ringing') || text.includes('switch off') ||
      text.includes('switched off') || text.includes('unavailable') || text.includes('not available') ||
      text.includes('call back') || text.includes('callback') || text.includes('try later')) return 'DID_NOT_CONNECT';
  if (text.includes('new') || text.includes('fresh') || text.includes('enquiry') ||
      text.includes('inquiry') || text.includes('interested') || text.includes('follow up') ||
      text.includes('follow-up') || text.includes('pending') || text.includes('contacted') ||
      text.includes('prospect') || text.includes('open') || text.includes('active') ||
      text.includes('working') || text.includes('cold') || text.includes('warm')) return 'GOOD_LEAD_FOLLOW_UP';
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
    const isZip = digits.length === 5 || digits.length === 6;
    if (digits.length >= 10 && !isDate && !isZip) allPhones.push({ raw: strVal, digits });
  }

  const uniqueEmails = [...new Set(allEmails)];
  const uniquePhones = allPhones.filter((p, i, a) => a.findIndex(x => x.digits === p.digits) === i);

  return { allEmails: uniqueEmails, allPhones: uniquePhones, allValues };
}

function inferNameFromValues(allValues) {
  for (const val of allValues) {
    if (!val || typeof val !== 'string') continue;
    const trimmed = val.trim();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 60) continue;
    if (extractEmail(trimmed)) continue;
    const digits = trimmed.replace(/[^0-9]/g, '');
    if (digits.length >= 8) continue;
    if (/^\d/.test(trimmed)) continue;
    if (/^https?:\/\//i.test(trimmed)) continue;

    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 5) {
      const allAlpha = words.every(w => /^[A-Za-z]/.test(w));
      if (allAlpha && trimmed.length < 50) return trimmed;
    }
  }
  return '';
}

function parseAnyDate(str) {
  if (!str) return '';
  const trimmed = str.trim();
  if (!trimmed) return '';

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().replace('T', ' ').substring(0, 19);
  }

  const formats = [
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/, // DD/MM/YYYY or MM/DD/YYYY
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/, // YYYY-MM-DD
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{2})$/, // DD/MM/YY or MM/DD/YY
  ];

  for (const pattern of formats) {
    const match = trimmed.match(pattern);
    if (match) {
      const d2 = new Date(`${match[3]}-${match[2]}-${match[1]}`);
      if (!isNaN(d2.getTime())) {
        return d2.toISOString().replace('T', ' ').substring(0, 19);
      }
    }
  }

  return '';
}

function extractRecordsFallback(records) {
  return records.map(record => {
    let name = findColumn(record, COLUMN_ALIASES.name) || '';

    const firstLastName = findFirstLastName(record);
    if (!name && firstLastName) name = firstLastName;

    let email = findColumn(record, COLUMN_ALIASES.email) || '';
    let mobileRaw = findColumn(record, COLUMN_ALIASES.mobile) || '';

    const company = findColumn(record, COLUMN_ALIASES.company) || '';
    const city = findColumn(record, COLUMN_ALIASES.city) || '';
    const state = findColumn(record, COLUMN_ALIASES.state) || '';
    const country = findColumn(record, COLUMN_ALIASES.country) || '';
    const leadOwner = findColumn(record, COLUMN_ALIASES.lead_owner) || '';
    const notes = findColumn(record, COLUMN_ALIASES.notes) || '';
    let source = findColumn(record, COLUMN_ALIASES.source) || '';
    let dateRaw = findColumn(record, COLUMN_ALIASES.date) || '';

    const addressInfo = parseAddress(record);
    const finalCity = city || addressInfo.city;
    const finalState = state || addressInfo.state;
    const finalCountry = country || addressInfo.country;

    const scanned = scanAllColumns(record);

    if (!email) email = scanned.allEmails[0] || '';
    if (!mobileRaw && scanned.allPhones.length > 0) mobileRaw = scanned.allPhones[0].raw;
    if (!name) name = inferNameFromValues(scanned.allValues);

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

    if (addressInfo.zip) {
      combinedNotes += (combinedNotes ? ' | ' : '') + 'Zip: ' + addressInfo.zip;
    }

    let created_at = dateRaw ? parseAnyDate(dateRaw) : '';
    if (!created_at) created_at = parseAnyDate(findColumn(record, COLUMN_ALIASES.date) || '');

    const knownSources = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'];
    const sourceLower = (source || '').toLowerCase().replace(/[\s_-]+/g, '_');
    let dataSource = knownSources.find(s => sourceLower.includes(s)) || '';

    if (!dataSource && source) {
      const campaignWords = source.split(/[\s_-]+/).map(s => s.toLowerCase());
      for (const ks of knownSources) {
        if (campaignWords.some(w => ks.includes(w) || w.includes(ks))) {
          dataSource = ks;
          break;
        }
      }
    }

    const foundEmail = email && email.length > 0;
    const foundPhone = mobileWithoutCode && mobileWithoutCode.length > 0;

    if (!foundEmail && !foundPhone) return null;

    return {
      created_at,
      name: name || '',
      email: email || '',
      country_code: countryCode,
      mobile_without_country_code: mobileWithoutCode,
      company,
      city: finalCity,
      state: finalState,
      country: finalCountry,
      lead_owner: leadOwner,
      crm_status: crmStatus,
      crm_note: combinedNotes,
      data_source: dataSource,
      possession_time: '',
      description: notes || '',
    };
  }).filter(Boolean);
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
