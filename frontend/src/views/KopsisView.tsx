import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { ShoppingBag, DollarSign, PackageCheck, PlusCircle, X, Check } from 'lucide-react';

interface KopsisProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface KopsisData {
  kasir_status: string;
  transaksi_hari_ini: {
    total_transaksi: number;
    total_omset: number;
    pembayaran_digital: string;
    pembayaran_tunai: string;
  };
  produk_populer: KopsisProduct[];
}

export const KopsisView: React.FC = () => {
  const [data, setData] = useState<KopsisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [sku, setSku] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Alat Tulis');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');

  const fetchKopsisData = async () => {
    try {
      const res = await apiClient.get('/school/kopsis');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching kopsis data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKopsisData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/school/kopsis/products', {
        sku: sku || `ATK-${Date.now().toString().slice(-4)}`,
        name,
        category,
        price: Number(price),
        stock: Number(stock),
      });
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowAddModal(false);
      setName('');
      setSku('');
      setPrice('');
      setStock('');
      await fetchKopsisData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan produk.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Kopsis...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>🛒 Portal Koperasi Siswa (Kopsis)</h2>
          <p>Sistem Point of Sale (POS), manajemen stok barang, perlengkapan seragam, dan penjualan ATK.</p>
        </div>
        <div className="header-meta">
          <span className="badge-status-paid">Kasir: {data?.kasir_status}</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid-cards-3">
        <div className="feature-card">
          <div className="card-top-icon text-amber-600">
            <DollarSign size={22} />
          </div>
          <h4>Omset Penjualan Hari Ini</h4>
          <div className="amount-display text-amber-700">
            Rp {(data?.transaksi_hari_ini.total_omset ?? 0).toLocaleString('id-ID')}
          </div>
          <p className="card-subtext">{data?.transaksi_hari_ini.total_transaksi} Transaksi Berhasil</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-indigo-600">
            <ShoppingBag size={22} />
          </div>
          <h4>Metode Pembayaran</h4>
          <div className="amount-display text-indigo-700">
            {data?.transaksi_hari_ini.pembayaran_digital} Digital
          </div>
          <p className="card-subtext">Tunai: {data?.transaksi_hari_ini.pembayaran_tunai} (QRIS & Saldo Siswa Dominan)</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <PackageCheck size={22} />
          </div>
          <h4>Total Item Produk</h4>
          <div className="amount-display text-emerald-700">
            {data?.produk_populer.length} Macam
          </div>
          <p className="card-subtext">Tersinkronisasi dengan Database MySQL</p>
        </div>
      </div>

      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>Katalog Produk Koperasi Siswa (MySQL Table: `kopsis_products`)</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="badge-pill bg-indigo-600 text-white flex items-center gap-1 cursor-pointer hover:bg-indigo-700"
          >
            <PlusCircle size={14} /> Tambah Barang
          </button>
        </div>

        {/* Modal Tambah Barang */}
        {showAddModal && (
          <div className="p-4 mb-4 bg-slate-50 border border-indigo-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-slate-800">Tambah Produk Baru ke Kopsis</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pensil 2B Faber Castell"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded text-xs bg-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Kode SKU</label>
                <input
                  type="text"
                  placeholder="Contoh: ATK-015 (otomatis jika kosong)"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full p-2 border rounded text-xs bg-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded text-xs bg-white mt-1"
                >
                  <option value="Alat Tulis">Alat Tulis</option>
                  <option value="Seragam">Seragam</option>
                  <option value="Buku">Buku & Modul</option>
                  <option value="Makanan">Makanan Ringan</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 4500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 border rounded text-xs bg-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Jumlah Stok Awal</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-2 border rounded text-xs bg-white mt-1"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga Jual</th>
              <th>Sisa Stok</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.produk_populer.map((prod) => (
              <tr key={prod.id}>
                <td><code>{prod.sku}</code></td>
                <td><strong>{prod.name}</strong></td>
                <td><span className="badge-pill">{prod.category}</span></td>
                <td>Rp {Number(prod.price).toLocaleString('id-ID')}</td>
                <td>{prod.stock} unit</td>
                <td>
                  <span className={prod.stock > 10 ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                    {prod.stock > 10 ? 'Tersedia' : 'Stok Menipis'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
