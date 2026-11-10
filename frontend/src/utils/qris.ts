/**
 * QRIS Management & Real Transaction Utility for School Ecosystem
 * Mendukung isolasi penuh konfigurasi QRIS (Kantin, Kopsis, TU)
 * dan konversi QRIS dinamis untuk pengujian transaksi riil (Rp 1).
 */

export type QRISType = 'kantin' | 'kopsis' | 'tu' | 'universal';

export interface QRISConfig {
  merchantName: string;
  nmid: string;
  imageUrl: string;
  rawString?: string;
  source: 'kantin' | 'kopsis' | 'tu' | 'default';
}

// Vector SVG Fallback unik per entitas jika belum ada upload gambar
export const DEFAULT_QRIS_KANTIN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="240" height="240" fill="%23fffbeb"/><g fill="%23d97706"><rect x="20" y="20" width="50" height="50" rx="6"/><rect x="30" y="30" width="30" height="30" fill="%23fffbeb"/><rect x="38" y="38" width="14" height="14"/><rect x="170" y="20" width="50" height="50" rx="6"/><rect x="180" y="30" width="30" height="30" fill="%23fffbeb"/><rect x="188" y="38" width="14" height="14"/><rect x="20" y="170" width="50" height="50" rx="6"/><rect x="30" y="180" width="30" height="30" fill="%23fffbeb"/><rect x="38" y="188" width="14" height="14"/><rect x="85" y="20" width="14" height="14"/><rect x="105" y="35" width="14" height="14"/><rect x="125" y="20" width="14" height="14"/><rect x="145" y="45" width="14" height="14"/><rect x="85" y="60" width="14" height="14"/><rect x="110" y="70" width="20" height="14"/><rect x="140" y="75" width="14" height="14"/><rect x="20" y="85" width="14" height="14"/><rect x="50" y="85" width="20" height="14"/><rect x="80" y="95" width="14" height="14"/><rect x="110" y="105" width="20" height="20"/><rect x="145" y="105" width="14" height="14"/><rect x="175" y="90" width="14" height="25"/><rect x="205" y="85" width="15" height="14"/><rect x="30" y="125" width="15" height="15"/><rect x="60" y="130" width="15" height="15"/><rect x="85" y="135" width="25" height="14"/><rect x="125" y="145" width="14" height="14"/><rect x="155" y="135" width="25" height="14"/><rect x="195" y="135" width="25" height="25"/><rect x="85" y="170" width="14" height="14"/><rect x="115" y="175" width="14" height="25"/><rect x="145" y="170" width="14" height="14"/><rect x="175" y="180" width="14" height="14"/><rect x="205" y="175" width="15" height="14"/><rect x="85" y="205" width="25" height="15"/><rect x="140" y="205" width="15" height="15"/><rect x="170" y="205" width="20" height="15"/><rect x="205" y="205" width="15" height="15"/></g><text x="120" y="232" font-size="11" font-family="sans-serif" font-weight="bold" fill="%23b45309" text-anchor="middle">QRIS KANTIN SEKOLAH</text></svg>`;

export const DEFAULT_QRIS_KOPSIS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="240" height="240" fill="%23ecfdf5"/><g fill="%23059669"><rect x="20" y="20" width="50" height="50" rx="6"/><rect x="30" y="30" width="30" height="30" fill="%23ecfdf5"/><rect x="38" y="38" width="14" height="14"/><rect x="170" y="20" width="50" height="50" rx="6"/><rect x="180" y="30" width="30" height="30" fill="%23ecfdf5"/><rect x="188" y="38" width="14" height="14"/><rect x="20" y="170" width="50" height="50" rx="6"/><rect x="30" y="180" width="30" height="30" fill="%23ecfdf5"/><rect x="38" y="188" width="14" height="14"/><rect x="85" y="20" width="14" height="14"/><rect x="105" y="35" width="14" height="14"/><rect x="125" y="20" width="14" height="14"/><rect x="145" y="45" width="14" height="14"/><rect x="85" y="60" width="14" height="14"/><rect x="110" y="70" width="20" height="14"/><rect x="140" y="75" width="14" height="14"/><rect x="20" y="85" width="14" height="14"/><rect x="50" y="85" width="20" height="14"/><rect x="80" y="95" width="14" height="14"/><rect x="110" y="105" width="20" height="20"/><rect x="145" y="105" width="14" height="14"/><rect x="175" y="90" width="14" height="25"/><rect x="205" y="85" width="15" height="14"/><rect x="30" y="125" width="15" height="15"/><rect x="60" y="130" width="15" height="15"/><rect x="85" y="135" width="25" height="14"/><rect x="125" y="145" width="14" height="14"/><rect x="155" y="135" width="25" height="14"/><rect x="195" y="135" width="25" height="25"/><rect x="85" y="170" width="14" height="14"/><rect x="115" y="175" width="14" height="25"/><rect x="145" y="170" width="14" height="14"/><rect x="175" y="180" width="14" height="14"/><rect x="205" y="175" width="15" height="14"/><rect x="85" y="205" width="25" height="15"/><rect x="140" y="205" width="15" height="15"/><rect x="170" y="205" width="20" height="15"/><rect x="205" y="205" width="15" height="15"/></g><text x="120" y="232" font-size="11" font-family="sans-serif" font-weight="bold" fill="%23047857" text-anchor="middle">QRIS KOPSIS STILLSCHOOL</text></svg>`;

export const DEFAULT_QRIS_TU_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="240" height="240" fill="%23eff6ff"/><g fill="%232563eb"><rect x="20" y="20" width="50" height="50" rx="6"/><rect x="30" y="30" width="30" height="30" fill="%23eff6ff"/><rect x="38" y="38" width="14" height="14"/><rect x="170" y="20" width="50" height="50" rx="6"/><rect x="180" y="30" width="30" height="30" fill="%23eff6ff"/><rect x="188" y="38" width="14" height="14"/><rect x="20" y="170" width="50" height="50" rx="6"/><rect x="30" y="180" width="30" height="30" fill="%23eff6ff"/><rect x="38" y="188" width="14" height="14"/><rect x="85" y="20" width="14" height="14"/><rect x="105" y="35" width="14" height="14"/><rect x="125" y="20" width="14" height="14"/><rect x="145" y="45" width="14" height="14"/><rect x="85" y="60" width="14" height="14"/><rect x="110" y="70" width="20" height="14"/><rect x="140" y="75" width="14" height="14"/><rect x="20" y="85" width="14" height="14"/><rect x="50" y="85" width="20" height="14"/><rect x="80" y="95" width="14" height="14"/><rect x="110" y="105" width="20" height="20"/><rect x="145" y="105" width="14" height="14"/><rect x="175" y="90" width="14" height="25"/><rect x="205" y="85" width="15" height="14"/><rect x="30" y="125" width="15" height="15"/><rect x="60" y="130" width="15" height="15"/><rect x="85" y="135" width="25" height="14"/><rect x="125" y="145" width="14" height="14"/><rect x="155" y="135" width="25" height="14"/><rect x="195" y="135" width="25" height="25"/><rect x="85" y="170" width="14" height="14"/><rect x="115" y="175" width="14" height="25"/><rect x="145" y="170" width="14" height="14"/><rect x="175" y="180" width="14" height="14"/><rect x="205" y="175" width="15" height="14"/><rect x="85" y="205" width="25" height="15"/><rect x="140" y="205" width="15" height="15"/><rect x="170" y="205" width="20" height="15"/><rect x="205" y="205" width="15" height="15"/></g><text x="120" y="232" font-size="11" font-family="sans-serif" font-weight="bold" fill="%231d4ed8" text-anchor="middle">QRIS LOKET TU STILLSCHOOL</text></svg>`;

export const DEFAULT_QRIS_SVG = DEFAULT_QRIS_TU_SVG;

/**
 * Mendapatkan konfigurasi QRIS khusus per modul secara terisolasi penuh.
 * KANTIN HANYA MEMBACA KANTIN, KOPSIS HANYA KOPSIS, TU HANYA TU.
 * TIDAK ADA CROSS-FALLBACK ANTAR MODUL.
 */
export const getStoredQRIS = (type: QRISType = 'tu'): QRISConfig => {
  if (type === 'kantin') {
    const customImg = localStorage.getItem('kantin_qris_image');
    return {
      merchantName: localStorage.getItem('kantin_qris_name') || 'KANTIN SEHAT STILLSCHOOL',
      nmid: localStorage.getItem('kantin_qris_nmid') || 'ID2026889955441',
      imageUrl: customImg || DEFAULT_QRIS_KANTIN_SVG,
      rawString: localStorage.getItem('kantin_qris_raw_string') || '',
      source: 'kantin',
    };
  }

  if (type === 'kopsis') {
    const customImg = localStorage.getItem('kopsis_qris_image');
    return {
      merchantName: localStorage.getItem('kopsis_qris_name') || 'KOPERASI SISWA STILLSCHOOL',
      nmid: localStorage.getItem('kopsis_qris_nmid') || 'ID2026889911223',
      imageUrl: customImg || DEFAULT_QRIS_KOPSIS_SVG,
      rawString: localStorage.getItem('kopsis_qris_raw_string') || '',
      source: 'kopsis',
    };
  }

  // Default atau 'tu' (Tata Usaha & Keuangan SPP)
  const customImg = localStorage.getItem('tu_qris_image');
  return {
    merchantName: localStorage.getItem('tu_qris_name') || 'LOKET TATA USAHA & KEUANGAN STILLSCHOOL',
    nmid: localStorage.getItem('tu_qris_nmid') || 'ID1029384756910',
    imageUrl: customImg || DEFAULT_QRIS_TU_SVG,
    rawString: localStorage.getItem('tu_qris_raw_string') || '',
    source: 'tu',
  };
};

/**
 * Menyimpan konfigurasi QRIS secara independen ke penyimpanan lokal browser.
 * Hanya memodifikasi kunci yang sesuai dengan jenisnya (tidak menimpa modul lain).
 */
export const saveStoredQRIS = (
  type: 'tu' | 'kopsis' | 'kantin',
  imageUrl: string,
  merchantName?: string,
  nmid?: string,
  rawString?: string
) => {
  try {
    const prefix = `${type}_qris`;
    localStorage.setItem(`${prefix}_image`, imageUrl);
    if (merchantName) localStorage.setItem(`${prefix}_name`, merchantName);
    if (nmid) localStorage.setItem(`${prefix}_nmid`, nmid);
    if (rawString !== undefined) localStorage.setItem(`${prefix}_raw_string`, rawString);
  } catch (err) {
    console.error(`Gagal menyimpan QRIS ${type} ke penyimpanan lokal browser`, err);
  }
};

/**
 * Standar Algoritma CRC-16/CCITT-FALSE (EMVCo & ASPI QRIS)
 * Polynomial 0x1021, Initial Value 0xFFFF
 */
export function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface QRISTLV {
  tag: string;
  length: number;
  value: string;
}

/**
 * Parser format TLV (Tag-Length-Value) standar EMVCo QRIS
 */
export function parseQRISTLV(raw: string): QRISTLV[] {
  const result: QRISTLV[] = [];
  let index = 0;
  while (index < raw.length) {
    if (index + 4 > raw.length) break;
    const tag = raw.substring(index, index + 2);
    const len = parseInt(raw.substring(index + 2, index + 4), 10);
    if (isNaN(len) || len < 0) break;
    const val = raw.substring(index + 4, index + 4 + len);
    result.push({ tag, length: len, value: val });
    index = index + 4 + len;
  }
  return result;
}

/**
 * Mengubah string QRIS statis merchant menjadi QRIS dinamis bernilai nominal Rp 1.
 * Saat di-scan dengan BCA Mobile, Livin' Mandiri, GoPay, Dana, OVO, ShopeePay,
 * nominal akan langsung terkunci pada angka Rp 1,-.
 */
export function createDynamicQRIS(rawQris: string, amount: number = 1): string {
  const cleaned = rawQris.trim();
  if (!cleaned || !cleaned.startsWith('000201')) {
    return cleaned;
  }

  const tlvs = parseQRISTLV(cleaned);
  const amountStr = String(amount);
  const amountLen = String(amountStr.length).padStart(2, '0');

  // Filter out existing CRC tag (63) and existing Amount tag (54)
  const filtered = tlvs.filter((t) => t.tag !== '63' && t.tag !== '54');

  let result = '';
  let amountInserted = false;

  for (const tlv of filtered) {
    if (tlv.tag === '01') {
      // Ubah dari Point of Initiation 11 (Statis) menjadi 12 (Dinamis dengan nominal terkunci)
      result += '010212';
      continue;
    }

    const lenStr = String(tlv.value.length).padStart(2, '0');
    result += tlv.tag + lenStr + tlv.value;

    // Sisipkan Tag 54 (Transaction Amount) tepat setelah Tag 53 (Currency IDR 360)
    if (tlv.tag === '53') {
      result += '54' + amountLen + amountStr;
      amountInserted = true;
    }
  }

  if (!amountInserted) {
    result += '54' + amountLen + amountStr;
  }

  // Tambahkan header Tag 63 (CRC) lalu hitung checksum
  const toSign = result + '6304';
  const checksum = crc16(toSign);
  return toSign + checksum;
}

/**
 * Menghasilkan URL gambar QR code untuk ditampilkan di layar checkout.
 * Jika rawString tersedia, QRIS dikonversi dinamis ke nominal Rp 1.
 * Jika tidak, menampilkan gambar barcode QRIS yang diunggah pengguna.
 */
export function getQRISDisplaySource(config: QRISConfig, amount: number = 1): {
  imageSrc: string;
  isDynamic: boolean;
  dynamicPayload?: string;
} {
  if (config.rawString && config.rawString.startsWith('000201')) {
    const dynamicPayload = createDynamicQRIS(config.rawString, amount);
    // Menggunakan QuickChart QR API terverifikasi untuk merender matriks QR beresolusi tinggi
    const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(dynamicPayload)}&size=300&margin=1`;
    return {
      imageSrc: qrApiUrl,
      isDynamic: true,
      dynamicPayload,
    };
  }

  return {
    imageSrc: config.imageUrl,
    isDynamic: false,
  };
}
