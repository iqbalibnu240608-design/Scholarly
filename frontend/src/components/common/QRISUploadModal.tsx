import React, { useState, useEffect, useId } from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { getStoredQRIS, saveStoredQRIS, DEFAULT_QRIS_SVG } from '../../utils/qris';
import { toast } from 'sonner';

interface QRISUploadModalProps {
  open: boolean;
  onClose: () => void;
  type: 'tu' | 'kopsis' | 'kantin';
  onSaved?: () => void;
  storeKey?: string;
  merchantTitle?: string;
}

export const QRISUploadModal: React.FC<QRISUploadModalProps> = ({
  open,
  onClose,
  type,
  onSaved,
}) => {
  const [merchantName, setMerchantName] = useState<string>('');
  const [nmid, setNmid] = useState<string>('');
  const [rawString, setRawString] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const merchantNameId = useId();
  const nmidId = useId();
  const rawStringId = useId();
  const unitLabel = type === 'tu' ? 'TU' : type === 'kopsis' ? 'Koperasi' : 'Kantin';

  useEffect(() => {
    if (open) {
      const config = getStoredQRIS(type);
      setMerchantName(config.merchantName);
      setNmid(config.nmid);
      setRawString(config.rawString || '');
      setImageUrl(config.imageUrl.startsWith('data:image/svg+xml') ? '' : config.imageUrl);
      setPreviewUrl(config.imageUrl);
    }
  }, [open, type]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB.');
      return;
    }

    try {
      const compressedBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = async () => {
            // Coba deteksi barcode string dengan BarcodeDetector jika didukung browser
            if ('BarcodeDetector' in window) {
              try {
                const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                const barcodes = await detector.detect(img);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  const detectedStr = barcodes[0].rawValue;
                  setRawString(detectedStr);
                  toast.success('String payload QRIS berhasil dipindai otomatis dari barcode!');
                }
              } catch (detErr) {
                console.log('BarcodeDetector scan fallback', detErr);
              }
            }

            const canvas = document.createElement('canvas');
            const maxDim = 450;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(event.target?.result as string);
              return;
            }
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          };
          img.onerror = () => reject(new Error('Gagal memproses gambar'));
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Gagal membaca file'));
        reader.readAsDataURL(file);
      });

      setImageUrl(compressedBase64);
      setPreviewUrl(compressedBase64);
      toast.success('Gambar barcode QRIS berhasil dimuat dan dioptimalkan.');
    } catch {
      toast.error('Gagal memproses file gambar QRIS.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = imageUrl.trim() || previewUrl || DEFAULT_QRIS_SVG;
    saveStoredQRIS(type, finalImage, merchantName, nmid, rawString.trim() || undefined);
    toast.success(`Pengaturan QRIS khusus ${type.toUpperCase()} berhasil disimpan (Terisolasi)!`);
    onSaved?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Atur QRIS ${unitLabel}`}
      className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-4 sm:p-6"
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col pt-1">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-1 pb-4">
          <div className="space-y-1.5">
            <label htmlFor={merchantNameId} className="text-xs font-bold text-slate-700">
              {type === 'kantin' ? 'Nama stan' : type === 'kopsis' ? 'Nama toko' : 'Nama merchant'}
            </label>
            <Input
              id={merchantNameId}
              type="text"
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder={type === 'kantin' ? 'Contoh: Kantin Sehat' : type === 'kopsis' ? 'Contoh: Koperasi Sekolah' : 'Nama merchant'}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor={nmidId} className="text-xs font-bold text-slate-700">NMID</label>
            <Input
              id={nmidId}
              type="text"
              required
              value={nmid}
              onChange={(e) => setNmid(e.target.value)}
              placeholder="Contoh: ID2026889955441"
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Gambar QRIS</label>
            <label className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs font-bold leading-snug text-slate-600 transition-all hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
              <Upload className="h-4 w-4 shrink-0" />
              <span>{imageUrl ? 'Ganti gambar' : 'Pilih gambar QRIS'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
            <p className="text-[11px] text-slate-500">Format gambar · maks. 5 MB</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={rawStringId} className="text-xs font-semibold text-slate-700">
              Kode QRIS (opsional)
            </label>
            <Input
              id={rawStringId}
              type="text"
              value={rawString}
              onChange={(e) => setRawString(e.target.value)}
              placeholder="Tempel kode QRIS jika belum terbaca"
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Untuk membuat QR dengan nominal otomatis Rp1.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
            <div className="mb-2 text-xs font-bold text-slate-600">Pratinjau</div>
            <div className="inline-block rounded-xl bg-white p-2 shadow-xs sm:p-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Pratinjau QRIS ${unitLabel}`}
                  className="mx-auto h-32 w-32 rounded-lg object-contain sm:h-36 sm:w-36"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-slate-100 text-slate-400 sm:h-36 sm:w-36">
                  <ImageIcon className="h-10 w-10 opacity-40" />
                </div>
              )}
              <div className="mt-2 text-xs font-extrabold text-slate-900 truncate max-w-[200px]">
                {merchantName || 'NAMA MERCHANT'}
              </div>
              <div className="break-all text-[10px] font-mono text-slate-500">
                NMID: {nmid || 'ID1029384756910'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse items-stretch gap-2 border-t border-slate-100 bg-white pt-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button type="submit" className="h-auto min-h-10 w-full gap-1.5 whitespace-normal px-3 py-2 text-center text-xs font-bold leading-snug sm:w-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan QRIS</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default QRISUploadModal;
