// Pakistani Universities with logos
export const universities = [
  {
    id: 'umt',
    name: 'University of Management and Technology (UMT)',
    shortName: 'UMT',
    domain: 'umt.edu.pk',
    city: 'Lahore',
    type: 'Private',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('UMT')}&background=0ea5e9&color=fff&size=128&bold=true`
  },
  {
    id: 'lums',
    name: 'Lahore University of Management Sciences',
    shortName: 'LUMS',
    domain: 'lums.edu.pk',
    city: 'Lahore',
    type: 'Private',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('LUMS')}&background=0284c7&color=fff&size=128&bold=true`
  },
  {
    id: 'nust',
    name: 'National University of Sciences and Technology',
    shortName: 'NUST',
    domain: 'nust.edu.pk',
    city: 'Islamabad',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('NUST')}&background=0369a1&color=fff&size=128&bold=true`
  },
  {
    id: 'uet',
    name: 'University of Engineering and Technology',
    shortName: 'UET Lahore',
    domain: 'uet.edu.pk',
    city: 'Lahore',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('UET')}&background=075985&color=fff&size=128&bold=true`
  },
  {
    id: 'fast',
    name: 'FAST National University',
    shortName: 'FAST',
    domain: 'nu.edu.pk',
    city: 'Lahore',
    type: 'Private',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('FAST')}&background=0c4a6e&color=fff&size=128&bold=true`
  },
  {
    id: 'comsats',
    name: 'COMSATS University',
    shortName: 'COMSATS',
    domain: 'comsats.edu.pk',
    city: 'Islamabad',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('COMSATS')}&background=7c3aed&color=fff&size=128&bold=true`
  },
  {
    id: 'qau',
    name: 'Quaid-i-Azam University',
    shortName: 'QAU',
    domain: 'qau.edu.pk',
    city: 'Islamabad',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('QAU')}&background=8b5cf6&color=fff&size=128&bold=true`
  },
  {
    id: 'pu',
    name: 'University of the Punjab',
    shortName: 'PU',
    domain: 'pu.edu.pk',
    city: 'Lahore',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('PU')}&background=a855f7&color=fff&size=128&bold=true`
  },
  {
    id: 'iba',
    name: 'Institute of Business Administration',
    shortName: 'IBA',
    domain: 'iba.edu.pk',
    city: 'Karachi',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('IBA')}&background=c084fc&color=fff&size=128&bold=true`
  },
  {
    id: 'aku',
    name: 'Aga Khan University',
    shortName: 'AKU',
    domain: 'aku.edu',
    city: 'Karachi',
    type: 'Private',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('AKU')}&background=d946ef&color=fff&size=128&bold=true`
  },
  {
    id: 'habib',
    name: 'Habib University',
    shortName: 'Habib',
    domain: 'habib.edu.pk',
    city: 'Karachi',
    type: 'Private',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('Habib')}&background=ec4899&color=fff&size=128&bold=true`
  },
  {
    id: 'giki',
    name: 'GIK Institute',
    shortName: 'GIKI',
    domain: 'giki.edu.pk',
    city: 'Topi',
    type: 'Private',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('GIKI')}&background=f43f5e&color=fff&size=128&bold=true`
  },
  {
    id: 'uok',
    name: 'University of Karachi',
    shortName: 'UoK',
    domain: 'uok.edu.pk',
    city: 'Karachi',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('UoK')}&background=fb7185&color=fff&size=128&bold=true`
  },
  {
    id: 'bahria',
    name: 'Bahria University',
    shortName: 'Bahria',
    domain: 'bahria.edu.pk',
    city: 'Islamabad',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('Bahria')}&background=14b8a6&color=fff&size=128&bold=true`
  },
  {
    id: 'air',
    name: 'Air University',
    shortName: 'Air University',
    domain: 'au.edu.pk',
    city: 'Islamabad',
    type: 'Public',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('Air')}&background=06b6d4&color=fff&size=128&bold=true`
  },
  {
    id: 'other',
    name: 'Other University',
    shortName: 'Other',
    domain: '',
    city: 'Unknown',
    type: 'Other',
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent('Other')}&background=64748b&color=fff&size=128&bold=true`
  }
];

// Get university by domain
export const getUniversityByDomain = (domain) => {
  return universities.find(uni => uni.domain === domain) || universities.find(uni => uni.id === 'other');
};

// Get university by name
export const getUniversityByName = (name) => {
  return universities.find(uni => 
    uni.name.toLowerCase().includes(name.toLowerCase()) ||
    uni.shortName.toLowerCase() === name.toLowerCase()
  ) || universities.find(uni => uni.id === 'other');
};

// Get university by ID
export const getUniversityById = (id) => {
  return universities.find(uni => uni.id === id) || universities.find(uni => uni.id === 'other');
};

