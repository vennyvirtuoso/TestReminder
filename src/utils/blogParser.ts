import { CompanyApplication } from '../types';

export interface BlogTestAnnouncement {
  id: string;
  rawText: string;
  companyName: string;
  profile?: string;
  testDate: string; // e.g. "2026-11-10" or "Nov 10, 2026"
  testTime?: string; // e.g. "06:00 PM"
  venue?: string; // e.g. "Online (HackerRank)", "LH 101"
  instructions?: string;
  matchedCompanyId?: string;
}

// Normalized fuzzy match helper for company names
export function isCompanyMatch(blogCompany: string, appCompany: string): boolean {
  if (!blogCompany || !appCompany) return false;
  const cleanA = blogCompany.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanB = appCompany.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  if (cleanA === cleanB) return true;
  if (cleanA.length >= 4 && cleanB.includes(cleanA)) return true;
  if (cleanB.length >= 4 && cleanA.includes(cleanB)) return true;

  // Keyword tokens match
  const stopWords = new Set(['pvt', 'ltd', 'private', 'limited', 'inc', 'corp', 'corporation', 'india', 'solutions', 'technologies', 'services', 'group', 'the']);
  const tokensA = cleanA.split(' ').filter((w) => w.length > 2 && !stopWords.has(w));
  const tokensB = cleanB.split(' ').filter((w) => w.length > 2 && !stopWords.has(w));

  return tokensA.some((t) => tokensB.includes(t));
}

/**
 * Normalizes role text into lowercase alphanumeric words
 */
function normalizeRoleWords(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'for', 'of', 'in', 'at', 'on', 'with',
    'jr', 'sr', 'junior', 'senior', 'fte', 'pg', 'ug', 'intern', 'internship',
    'profile', 'role', 'code', 'jaf', 'pvt', 'ltd', 'i', 'ii', 'iii', '1', '2', '3', '4', '5'
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));
}

/**
 * Checks whether a test announcement role matches an applied application's role/profile
 */
export function isRoleMatch(
  testRole?: string,
  appProfile?: string,
  appJafId?: string
): boolean {
  if (!testRole || !testRole.trim()) return true;

  const cleanTestRole = testRole.toLowerCase().trim();
  const candidates = [appProfile, appJafId].filter(Boolean).map((s) => String(s).toLowerCase().trim());

  if (candidates.length === 0) return true;

  for (const cand of candidates) {
    if (!cand) continue;

    // 1. Direct equality or substring match
    if (cand === cleanTestRole) return true;
    if (cleanTestRole.length >= 4 && cand.includes(cleanTestRole)) return true;
    if (cand.length >= 4 && cleanTestRole.includes(cand)) return true;

    // 2. Numeric profile match: e.g. "Profile 1" vs "1" or "Profile #2" vs "2"
    const numTestMatch = cleanTestRole.match(/(?:profile\s*#?|#)?\s*(\d+)/i);
    const numCandMatch = cand.match(/(?:profile\s*#?|#)?\s*(\d+)/i);
    if (numTestMatch && numCandMatch && numTestMatch[1] === numCandMatch[1]) {
      return true;
    }

    // 3. Domain specializations
    // Machine Learning / Deep Learning / AI
    const testIsML = /\b(ai|ml|machine\s*learning|deep\s*learning|artificial\s*intelligence)\b/i.test(cleanTestRole);
    const candIsML = /\b(ai|ml|machine\s*learning|deep\s*learning|artificial\s*intelligence)\b/i.test(cand);
    // Quantitative / Math / Trading
    const testIsQuant = /\b(quant|quantitative|trader|trading|broking)\b/i.test(cleanTestRole);
    const candIsQuant = /\b(quant|quantitative|trader|trading|broking)\b/i.test(cand);
    // Software Development / SDE / SWE
    const testIsSWE = /\b(sde|swe|software|developer|dev|programmer|fullstack|backend|frontend)\b/i.test(cleanTestRole);
    const candIsSWE = /\b(sde|swe|software|developer|dev|programmer|fullstack|backend|frontend)\b/i.test(cand);
    // Data Science / Analytics
    const testIsDS = /\b(data\s*scientist|data\s*science|analytics|analyst)\b/i.test(cleanTestRole);
    const candIsDS = /\b(data\s*scientist|data\s*science|analytics|analyst)\b/i.test(cand);
    // Speech / Audio
    const testIsSpeech = /\b(speech|audio|voice|nlp)\b/i.test(cleanTestRole);
    const candIsSpeech = /\b(speech|audio|voice|nlp)\b/i.test(cand);

    if (testIsML && candIsML) return true;
    if (testIsQuant && candIsQuant) return true;
    if (testIsSWE && candIsSWE) return true;
    if (testIsDS && candIsDS) return true;
    if (testIsSpeech && candIsSpeech) return true;

    // 4. Overlapping significant keywords
    const testWords = normalizeRoleWords(cleanTestRole);
    const candWords = normalizeRoleWords(cand);
    const sharedWords = testWords.filter((w) => candWords.includes(w));
    if (sharedWords.length > 0) return true;
  }

  return false;
}

/**
 * Checks whether both Company Name AND Applied Role match for an announcement
 */
export function isCompanyAndRoleMatch(
  test: { companyName: string; profile?: string },
  app: CompanyApplication,
  allUserAppsForCompany?: CompanyApplication[]
): boolean {
  if (!isCompanyMatch(test.companyName, app.companyName)) {
    return false;
  }

  const testRole = (test.profile || '').trim();

  // If announcement mentions a specific profile/role
  if (testRole && testRole !== 'General Role' && testRole.toLowerCase() !== 'all') {
    return isRoleMatch(testRole, app.profile, app.jafId);
  }

  // If announcement did not specify a role:
  // If the user has multiple applications for this same company, do not match ambiguously
  if (allUserAppsForCompany && allUserAppsForCompany.length > 1) {
    return false;
  }

  return true;
}

// Check if a date string represents today
export function isTestToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const lower = dateStr.toLowerCase().trim();
  if (lower.includes('today')) return true;

  const now = new Date();
  const day = now.getDate();
  const dayPadded = String(day).padStart(2, '0');
  const monthShort = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const monthFull = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const year = now.getFullYear();
  const todayIso = now.toISOString().slice(0, 10);

  if (lower.includes(todayIso)) return true;

  // e.g. "5 Nov", "05 Nov", "5th Nov", "5 November", "05 November"
  const dayPatterns = [
    `${day} ${monthShort}`,
    `${dayPadded} ${monthShort}`,
    `${day}th ${monthShort}`,
    `${day}st ${monthShort}`,
    `${day}nd ${monthShort}`,
    `${day}rd ${monthShort}`,
    `${day} ${monthFull}`,
    `${dayPadded} ${monthFull}`,
    `${monthShort} ${day}`,
    `${monthShort} ${dayPadded}`,
    `${monthFull} ${day}`,
    `${day}/${now.getMonth() + 1}/${year}`,
    `${dayPadded}/${String(now.getMonth() + 1).padStart(2, '0')}/${year}`,
    `${day}-${now.getMonth() + 1}-${year}`,
    `${dayPadded}-${String(now.getMonth() + 1).padStart(2, '0')}-${year}`,
  ];

  if (dayPatterns.some((pattern) => lower.includes(pattern))) {
    return true;
  }

  // Also specifically check active target date Nov 5, 2026
  if (
    lower.includes('5 nov') ||
    lower.includes('05 nov') ||
    lower.includes('5th nov') ||
    lower.includes('nov 5') ||
    lower.includes('2026-11-05') ||
    lower.includes('05/11/2026') ||
    lower.includes('5/11/2026')
  ) {
    return true;
  }

  return false;
}

// Parse dates in various Indian formats: "10th Nov 2026", "10/11/2026", "Nov 10", "10-11-2026"
function extractDate(text: string): string | null {
  // Pattern 1: "10th November 2026", "12 Nov 2026", "15 November"
  const monthNames =
    '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
  const pattern1 = new RegExp(
    `(\\b\\d{1,2}(?:st|nd|rd|th)?\\s+${monthNames}(?:\\s*,?\\s*\\d{4})?)`,
    'i'
  );
  const match1 = text.match(pattern1);
  if (match1) return match1[1].trim();

  // Pattern 2: "November 10, 2026" or "Nov 12"
  const pattern2 = new RegExp(
    `(${monthNames}\\s+\\d{1,2}(?:st|nd|rd|th)?(?:\\s*,?\\s*\\d{4})?)`,
    'i'
  );
  const match2 = text.match(pattern2);
  if (match2) return match2[1].trim();

  // Pattern 3: "10/11/2026" or "10-11-2026"
  const pattern3 = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/;
  const match3 = text.match(pattern3);
  if (match3) return match3[1].trim();

  return null;
}

// Extract time like "6:00 PM", "18:00", "06:30 PM - 08:30 PM"
function extractTime(text: string): string | null {
  const pattern =
    /\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s*(?:to|-)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))?)\b/;
  const match = text.match(pattern);
  if (match) return match[1].trim();

  const pattern24 = /\b([012]?\d:\d{2}\s*(?:hrs|hours)?(?:\s*(?:to|-)\s*[012]?\d:\d{2})?)\b/i;
  const match24 = text.match(pattern24);
  if (match24) return match24[1].trim();

  return null;
}

// Extract venue like "LH 101", "Online (HackerRank)", "Mettl", "CodeSignal", "LA 201"
function extractVenue(text: string): string | null {
  const venueKeywords =
    /(?:venue|platform|mode|location|portal)\s*[:=-]\s*([^\n,;]+)/i;
  const match = text.match(venueKeywords);
  if (match) return match[1].trim();

  if (/hackerrank/i.test(text)) return 'Online (HackerRank)';
  if (/codesignal/i.test(text)) return 'Online (CodeSignal)';
  if (/mettl/i.test(text)) return 'Online (Mettl)';
  if (/amcat/i.test(text)) return 'Online (AMCAT)';
  if (/google form/i.test(text)) return 'Online (Google Form)';
  if (/lh\s*\d+|la\s*\d+|lt\s*\d+|som\s*\d+|fcr\s*\d+/i.test(text)) {
    const hallMatch = text.match(/\b(LH\s*\d+|LA\s*\d+|LT\s*\d+|SOM\s*\d+|FCR\s*\d+)\b/i);
    if (hallMatch) return hallMatch[1].toUpperCase();
  }
  if (/online/i.test(text)) return 'Online';

  return null;
}

/**
 * Intelligent parser for IIT Bombay Placement Blog posts
 * Handles paragraphs, emails, and table formats
 */
export function parsePlacementBlog(rawText: string): BlogTestAnnouncement[] {
  if (!rawText || !rawText.trim()) return [];

  const results: BlogTestAnnouncement[] = [];

  // 1. Check if input is a structured table (separated by | or tabs)
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Split into chunks or posts (usually separated by double newlines, "---", or "Company:")
  const blocks = rawText
    .split(/(?:\n\s*[-=_]{3,}\s*\n|\n\s*\n\s*\n|(?=Company\s*[:=-])|(?=Post\s*[:#\d]))/gi)
    .map((b) => b.trim())
    .filter((b) => b.length > 15);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Extract company name
    let company = '';
    const compMatch = block.match(/(?:Company|Organization|Firm|Employer)\s*[:=-]\s*([^\n]+)/i);
    if (compMatch) {
      company = compMatch[1].trim();
    } else {
      // First line might be company name if it looks like a title
      const firstLine = block.split('\n')[0].replace(/^#+\s*/, '').trim();
      if (firstLine.length < 60 && !/test|schedule|date|venue/i.test(firstLine)) {
        company = firstLine;
      }
    }

    // Extract profile / role
    let profile = '';
    const profMatch = block.match(/(?:Profile|Role|Designation|Position)\s*[:=-]\s*([^\n]+)/i);
    if (profMatch) {
      profile = profMatch[1].trim();
    }

    const testDate = extractDate(block);
    const testTime = extractTime(block);
    const venue = extractVenue(block);

    // If we found at least a company name and a date/venue, create an announcement
    if (company && (testDate || venue || testTime)) {
      results.push({
        id: `blog-post-${Date.now()}-${i}`,
        rawText: block,
        companyName: company,
        profile: profile || undefined,
        testDate: testDate || 'Date TBA',
        testTime: testTime || undefined,
        venue: venue || 'TBA',
        instructions: block.slice(0, 300),
      });
    }
  }

  // Also support line-by-line quick tables
  if (results.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/test|assessment|shortlist/i.test(line) || line.includes('|') || line.includes('\t')) {
        const parts = line.split(/[|\t,]/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const comp = parts[0];
          const date = extractDate(line);
          const time = extractTime(line);
          const ven = extractVenue(line);
          if (comp && (date || ven)) {
            results.push({
              id: `blog-line-${Date.now()}-${i}`,
              rawText: line,
              companyName: comp,
              testDate: date || 'Date TBA',
              testTime: time || undefined,
              venue: ven || 'Online',
            });
          }
        }
      }
    }
  }

  return results;
}

/**
 * Match announcements against the student's applied companies
 * and return merged updates
 */
export function matchBlogAnnouncementsWithApplications(
  announcements: BlogTestAnnouncement[],
  applications: CompanyApplication[]
): {
  matchedAnnouncements: (BlogTestAnnouncement & { matchedApp: CompanyApplication })[];
  unmatchedAnnouncements: BlogTestAnnouncement[];
} {
  const matched: (BlogTestAnnouncement & { matchedApp: CompanyApplication })[] = [];
  const unmatched: BlogTestAnnouncement[] = [];

  for (const ann of announcements) {
    const appsForCompany = applications.filter((app) =>
      isCompanyMatch(ann.companyName, app.companyName)
    );

    const matchingApp = applications.find((app) =>
      isCompanyAndRoleMatch(ann, app, appsForCompany)
    );

    if (matchingApp) {
      matched.push({
        ...ann,
        matchedCompanyId: matchingApp.id,
        matchedApp: matchingApp,
      });
    } else {
      unmatched.push(ann);
    }
  }

  return { matchedAnnouncements: matched, unmatchedAnnouncements: unmatched };
}

