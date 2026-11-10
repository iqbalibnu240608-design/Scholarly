/**
 * QRIS Management Utility for School Ecosystem (TU, Kopsis & Kantin)
 */

export interface QRISConfig {
  merchantName: string;
  nmid: string;
  imageUrl: string;
  source: 'tu' | 'kopsis' | 'kantin' | 'default';
}

// Fallback high-contrast vector QR code representation if no custom image is uploaded
export const DEFAULT_QRIS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="240" height="240" fill="%23ffffff"/><g fill="%230f172a"><rect x="20" y="20" width="50" height="50" rx="4"/><rect x="30" y="30" width="30" height="30" fill="%23ffffff"/><rect x="38" y="38" width="14" height="14"/><rect x="170" y="20" width="50" height="50" rx="4"/><rect x="180" y="30" width="30" height="30" fill="%23ffffff"/><rect x="188" y="38" width="14" height="14"/><rect x="20" y="170" width="50" height="50" rx="4"/><rect x="30" y="180" width="30" height="30" fill="%23ffffff"/><rect x="38" y="188" width="14" height="14"/><rect x="85" y="20" width="14" height="14"/><rect x="105" y="35" width="14" height="14"/><rect x="125" y="20" width="14" height="14"/><rect x="145" y="45" width="14" height="14"/><rect x="85" y="60" width="14" height="14"/><rect x="110" y="70" width="20" height="14"/><rect x="140" y="75" width="14" height="14"/><rect x="20" y="85" width="14" height="14"/><rect x="50" y="85" width="20" height="14"/><rect x="80" y="95" width="14" height="14"/><rect x="110" y="105" width="20" height="20"/><rect x="145" y="105" width="14" height="14"/><rect x="175" y="90" width="14" height="25"/><rect x="205" y="85" width="15" height="14"/><rect x="30" y="125" width="15" height="15"/><rect x="60" y="130" width="15" height="15"/><rect x="85" y="135" width="25" height="14"/><rect x="125" y="145" width="14" height="14"/><rect x="155" y="135" width="25" height="14"/><rect x="195" y="135" width="25" height="25"/><rect x="85" y="170" width="14" height="14"/><rect x="115" y="175" width="14" height="25"/><rect x="145" y="170" width="14" height="14"/><rect x="175" y="180" width="14" height="14"/><rect x="205" y="175" width="15" height="14"/><rect x="85" y="205" width="25" height="15"/><rect x="140" y="205" width="15" height="15"/><rect x="170" y="205" width="20" height="15"/><rect x="205" y="205" width="15" height="15"/></g></svg>`;

export const getStoredQRIS = (preferredType: 'kopsis' | 'tu' | 'kantin' | 'universal' = 'universal'): QRISConfig => {
  const kopsisImg = localStorage.getItem('kopsis_qris_image');
  const tuImg = localStorage.getItem('tu_qris_image');
  const kantinImg = localStorage.getItem('kantin_qris_image');
  const schoolImg = localStorage.getItem('school_qris_image');

  if (preferredType === 'kopsis') {
    if (kopsisImg) {
      return {
        merchantName: localStorage.getItem('kopsis_qris_name') || 'KOPERASI SISWA STILLSCHOOL',
        nmid: localStorage.getItem('kopsis_qris_nmid') || 'ID2026889911223',
        imageUrl: kopsisImg,
        source: 'kopsis',
      };
    }
  }

  if (preferredType === 'kantin') {
    const customKantinImg = localStorage.getItem('kantin_qris_image');
    if (customKantinImg) {
      return {
        merchantName: localStorage.getItem('kantin_qris_name') || localStorage.getItem('kantin_qris_stall') || 'KANTIN SEHAT STILLSCHOOL',
        nmid: localStorage.getItem('kantin_qris_nmid') || 'ID2026889955441',
        imageUrl: customKantinImg,
        source: 'kantin',
      };
    }
  }

  if (preferredType === 'tu') {
    if (tuImg) {
      return {
        merchantName: localStorage.getItem('tu_qris_name') || 'LOKET TATA USAHA STILLSCHOOL',
        nmid: localStorage.getItem('tu_qris_nmid') || 'ID1029384756910',
        imageUrl: tuImg,
        source: 'tu',
      };
    }
  }

  // Universal fallback order: schoolImg -> tuImg -> kopsisImg -> kantinImg -> default
  const activeImg = schoolImg || tuImg || kopsisImg || kantinImg || '';
  const merchant =
    localStorage.getItem('tu_qris_name') ||
    localStorage.getItem('kopsis_qris_name') ||
    localStorage.getItem('kantin_qris_name') ||
    'STILLSCHOOL ECOSYSTEM (QRIS)';
  const nmid =
    localStorage.getItem('tu_qris_nmid') ||
    localStorage.getItem('kopsis_qris_nmid') ||
    localStorage.getItem('kantin_qris_nmid') ||
    'ID1029384756910';

  return {
    merchantName: merchant,
    nmid,
    imageUrl: activeImg || DEFAULT_QRIS_SVG,
    source: activeImg ? (tuImg ? 'tu' : (kopsisImg ? 'kopsis' : 'kantin')) : 'default',
  };
};

export const saveStoredQRIS = (
  type: 'tu' | 'kopsis' | 'kantin',
  imageUrl: string,
  merchantName?: string,
  nmid?: string
) => {
  try {
    if (type === 'tu') {
      localStorage.setItem('tu_qris_image', imageUrl);
      localStorage.setItem('school_qris_image', imageUrl);
      if (merchantName) localStorage.setItem('tu_qris_name', merchantName);
      if (nmid) localStorage.setItem('tu_qris_nmid', nmid);
    } else if (type === 'kopsis') {
      localStorage.setItem('kopsis_qris_image', imageUrl);
      if (merchantName) localStorage.setItem('kopsis_qris_name', merchantName);
      if (nmid) localStorage.setItem('kopsis_qris_nmid', nmid);
    } else if (type === 'kantin') {
      localStorage.setItem('kantin_qris_image', imageUrl);
      if (merchantName) {
        localStorage.setItem('kantin_qris_name', merchantName);
        localStorage.setItem('kantin_qris_stall', merchantName);
      }
      if (nmid) localStorage.setItem('kantin_qris_nmid', nmid);
    }
  } catch (err) {
    console.error('Gagal menyimpan QRIS ke penyimpanan lokal browser', err);
  }
};
