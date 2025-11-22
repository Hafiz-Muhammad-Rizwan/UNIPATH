// University name mapping - maps various formats to canonical names
// This ensures search works regardless of how universities are stored

const universityMappings = {
  // UMT variations
  'umt': 'University of Management and Technology (UMT)',
  'UMT': 'University of Management and Technology (UMT)',
  'University of Management and Technology': 'University of Management and Technology (UMT)',
  'University of Management and Technology (UMT)': 'University of Management and Technology (UMT)',
  
  // LUMS variations
  'lums': 'Lahore University of Management Sciences',
  'LUMS': 'Lahore University of Management Sciences',
  'Lahore University of Management Sciences': 'Lahore University of Management Sciences',
  
  // NUST variations
  'nust': 'National University of Sciences and Technology',
  'NUST': 'National University of Sciences and Technology',
  'National University of Sciences and Technology': 'National University of Sciences and Technology',
  
  // UET variations
  'uet': 'University of Engineering and Technology',
  'UET': 'University of Engineering and Technology',
  'UET Lahore': 'University of Engineering and Technology',
  'University of Engineering and Technology': 'University of Engineering and Technology',
  
  // FAST variations
  'fast': 'FAST National University',
  'FAST': 'FAST National University',
  'FAST National University': 'FAST National University',
  
  // COMSATS variations
  'comsats': 'COMSATS University',
  'COMSATS': 'COMSATS University',
  'COMSATS University': 'COMSATS University',
  
  // Admin
  'admin': 'Admin',
  'Admin': 'Admin',
};

// Domain to canonical name mapping (for registration)
export const domainToCanonicalName = {
  'umt.edu.pk': 'University of Management and Technology (UMT)',
  'lums.edu.pk': 'Lahore University of Management Sciences',
  'nust.edu.pk': 'National University of Sciences and Technology',
  'uet.edu.pk': 'University of Engineering and Technology',
  'nu.edu.pk': 'FAST National University',
  'comsats.edu.pk': 'COMSATS University',
  'gmail.com': 'Admin', // For admin email
};

// Get all search variations for a university name
export function getUniversitySearchVariations(universityName) {
  if (!universityName) return [];
  
  const normalized = universityName.trim();
  const variations = new Set();
  
  // Add original
  variations.add(normalized);
  variations.add(normalized.toLowerCase());
  variations.add(normalized.toUpperCase());
  variations.add(normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase());
  
  // Add mapped canonical name if exists
  const canonical = universityMappings[normalized] || universityMappings[normalized.toLowerCase()];
  if (canonical) {
    variations.add(canonical);
    variations.add(canonical.toLowerCase());
    variations.add(canonical.toUpperCase());
  }
  
  // Extract acronym from parentheses
  if (normalized.includes('(')) {
    const match = normalized.match(/\(([^)]+)\)/);
    if (match) {
      const acronym = match[1];
      variations.add(acronym);
      variations.add(acronym.toLowerCase());
      variations.add(acronym.toUpperCase());
    }
  }
  
  // Extract short name (first letters of words)
  const words = normalized.split(/\s+/);
  if (words.length > 1) {
    const shortName = words.map(w => w.charAt(0).toUpperCase()).join('');
    if (shortName.length <= 10) {
      variations.add(shortName);
      variations.add(shortName.toLowerCase());
    }
  }
  
  return Array.from(variations);
}

// Normalize university name to canonical form
export function normalizeUniversityName(universityName) {
  if (!universityName) return universityName;
  
  const normalized = universityName.trim();
  
  // Check direct mapping
  if (universityMappings[normalized]) {
    return universityMappings[normalized];
  }
  
  // Check lowercase mapping
  if (universityMappings[normalized.toLowerCase()]) {
    return universityMappings[normalized.toLowerCase()];
  }
  
  // Return original if no mapping found
  return normalized;
}

// Get all possible search patterns for a university
export function getUniversitySearchPatterns(universityName) {
  const variations = getUniversitySearchVariations(universityName);
  const patterns = [];
  
  for (const variation of variations) {
    const escaped = variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    patterns.push(
      new RegExp(`^${escaped}$`, 'i'), // Exact match
      new RegExp(`^${escaped}\\s`, 'i'), // Starts with
      new RegExp(`\\s${escaped}$`, 'i'), // Ends with
      new RegExp(`\\b${escaped}\\b`, 'i'), // Word boundary
      new RegExp(escaped, 'i'), // Contains
      new RegExp(`\\(${escaped}\\)`, 'i'), // In parentheses
      new RegExp(`\\(.*${escaped}.*\\)`, 'i') // Anywhere in parentheses
    );
  }
  
  // Remove duplicates
  const uniquePatterns = [];
  const patternStrings = new Set();
  for (const pattern of patterns) {
    const patternStr = pattern.toString();
    if (!patternStrings.has(patternStr)) {
      patternStrings.add(patternStr);
      uniquePatterns.push(pattern);
    }
  }
  
  return uniquePatterns;
}

