import { getUniversityByName } from '../data/universities';

export const getUniversityLogo = (universityName) => {
  const uni = getUniversityByName(universityName);
  if (uni) return uni.logo;
  // Generate logo for unknown universities
  const shortName = universityName.split(' ')[0] || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(shortName)}&background=64748b&color=fff&size=128&bold=true`;
};

