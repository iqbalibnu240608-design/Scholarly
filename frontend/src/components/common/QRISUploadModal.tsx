import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { getStoredQRIS, saveStoredQRIS, DEFAULT_QRIS_SVG } from '../../utils/qris';
import { toast } from 'sonner';

interface QRISUploadModalProps {
  open: boolean;
  onClose: () => void;
  type: 'tu' | 'kopsis';
  onSaved?: () => void;
}

export const QRISUploadModal: React.FC<QRISUploadModalProps> = ({
  open,
  onClose,
  type,
  onSaved,
}) => {
  const [merchantName, setMerchantName] = useState<string>('');
  const [nmid, setNmid] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (open) {
      const config = getStoredQRIS(type);
      setMerchantName(config.merchantName);
      setNmid(config.nmid);
      setImageUrl(config.imageUrl === DEFAULT_QRIS_SVG ? '' : config.imageUrl);
      setPreviewUrl(config.imageUrl);
    }
  }, [open, type]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 400;
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
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
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
    saveStoredQRIS(type, finalImage, merchantName, nmid);
    toast.success(
      `Pengaturan barcode QRIS ${type === 'tu' ? 'Loket TU / Sekolah' : 'Koperasi Siswa'} berhasil disimpan!`
    );
    if (onSaved) onSaved();
    onClose();
  };

  const modalTitle =
    type === 'tu'
      ? 'Pengaturan & Upload Barcode QRIS Loket TU'
      : 'Pengaturan & Upload Barcode QRIS Koperasi Siswa';

  const modalDesc =
    type === 'tu'
      ? 'Upload gambar barcode QRIS resmi sekolah untuk pembayaran SPP dan top-up saldo digital siswa/guru.'
      : 'Upload gambar barcode QRIS stan Koperasi untuk transaksi belanja dan top-up saldo.';

  return (
    <Dialog open={open} onClose={onClose} title={modalTitle} description={modalDesc}>
      <form onSubmit={handleSave} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Nama Merchant / Toko Resmi</label>
          <Input
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            placeholder={type === 'tu' ? 'SMK BINA MANDIRI - LOKET TU' : 'KOPERASI SISWA BINA MANDIRI'}
            required
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Nomor National Merchant ID (NMID)</label>
          <Input
            value={nmid}
            onChange={(e) => setNmid(e.target.value)}
            placeholder="ID1029384756910"
            required
            className="text-xs font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Upload Berkas Gambar QRIS (PNG / JPG)</label>
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-all text-xs font-bold text-slate-600 hover:text-blue-700">
                <Upload className="w-4 h-4" />
                <span>Pilih Gambar QRIS dari Perangkat</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Atau Masukkan URL Gambar QRIS:</label>
          <Input
            type="url"
            value={imageUrl.startsWith('data:') ? '' : imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setPreviewUrl(e.target.value || DEFAULT_QRIS_SVG);
            }}
            placeholder="https://... (opsional jika sudah upload berkas)"
            className="text-xs"
          />
        </div>

        {/* Live Preview Container */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Preview QRIS yang Dilihat Siswa & Guru
          </div>
          <div className="inline-block p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Barcode QRIS Preview"
                className="w-36 h-36 object-contain mx-auto rounded-lg"
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                <ImageIcon className="w-10 h-10 opacity-40" />
              </div>
            )}
            <div className="mt-2 text-xs font-extrabold text-slate-900 truncate max-w-[200px]">
              {merchantName || 'NAMA MERCHANT'}
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              NMID: {nmid || 'ID1029384756910'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" className="gap-1.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Barcode QRIS</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
