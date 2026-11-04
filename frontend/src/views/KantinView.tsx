import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { UtensilsCrossed, Coffee, CheckCircle, Clock, PlusCircle, X, Check } from 'lucide-react';

interface KantinMenu {
  id: number;
  name: string;
  category: string;
  price: number;
  stall_name: string;
  is_available: boolean;
}

interface KantinData {
  status_kantin: string;
  pesanan_aktif: number;
  pesanan_selesai_hari_ini: number;
  omset_hari_ini: number;
  daftar_menu: KantinMenu[];
}

export const KantinView: React.FC = () => {
  const [data, setData] = useState<KantinData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Makanan');
  const [price, setPrice] = useState<string>('');
  const [stallName, setStallName] = useState<string>('Stand 1 Bu Titin');

  const fetchKantinData = async () => {
    try {
      const res = await apiClient.get('/school/kantin');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching kantin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKantinData();
  }, []);

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/school/kantin/menus', {
        name,
        category,
        price: Number(price),
        stall_name: stallName,
      });
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowAddModal(false);
      setName('');
      setPrice('');
      await fetchKantinData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan menu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Kantin...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>🍜 Portal Pengelola Kantin Sekolah</h2>
          <p>Manajemen stand kuliner, daftar menu makanan/minuman sehat, dan antrean pesanan istirahat.</p>
        </div>
        <div className="header-meta">
          <span className="badge-status-paid">Status: {data?.status_kantin}</span>
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
          <div className="card-top-icon text-cyan-600">
            <Clock size={22} />
          </div>
          <h4>Pesanan Sedang Diproses</h4>
          <div className="amount-display text-cyan-700">{data?.pesanan_aktif} Antrean</div>
          <p className="card-subtext">Waktu istirahat jam 09:45 & 12:15</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <CheckCircle size={22} />
          </div>
          <h4>Pesanan Selesai Hari Ini</h4>
          <div className="amount-display text-emerald-700">{data?.pesanan_selesai_hari_ini} Porsi</div>
          <p className="card-subtext">Semua pesanan dilayani dengan higienis</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-amber-600">
            <UtensilsCrossed size={22} />
          </div>
          <h4>Omset Penjualan Hari Ini</h4>
          <div className="amount-display text-amber-700">
            Rp {(data?.omset_hari_ini ?? 0).toLocaleString('id-ID')}
          </div>
          <p className="card-subtext">Transaksi cashless via saldo siswa & QRIS</p>
        </div>
      </div>

      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Coffee size={18} className="inline mr-2 text-indigo-600" />
            Daftar Menu Kantin Sehat (MySQL Table: `kantin_menus`)
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="badge-pill bg-indigo-600 text-white flex items-center gap-1 cursor-pointer hover:bg-indigo-700"
          >
            <PlusCircle size={14} /> Tambah Menu
          </button>
        </div>

        {/* Modal Tambah Menu */}
        {showAddModal && (
          <div className="p-4 mb-4 bg-slate-50 border border-indigo-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-slate-800">Tambah Sajian Menu Kantin Baru</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateMenu} className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nama Makanan / Minuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Batagor Kuah Spesial"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  <option value="Makanan">Makanan Berat</option>
                  <option value="Minuman">Minuman Segar</option>
                  <option value="Snack">Snack & Camilan</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Nama Stand Penjual</label>
                <input
                  type="text"
                  placeholder="Contoh: Stand 1 Bu Titin"
                  value={stallName}
                  onChange={(e) => setStallName(e.target.value)}
                  className="w-full p-2 border rounded text-xs bg-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 10000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 border rounded text-xs bg-white mt-1"
                />
              </div>
              <div className="flex items-end gap-2 col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Menu'}
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
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th>Stand / Penjual</th>
              <th>Harga</th>
              <th>Ketersediaan</th>
            </tr>
          </thead>
          <tbody>
            {data?.daftar_menu.map((menu) => (
              <tr key={menu.id}>
                <td><strong>{menu.name}</strong></td>
                <td><span className="badge-pill">{menu.category}</span></td>
                <td>{menu.stall_name}</td>
                <td>Rp {Number(menu.price).toLocaleString('id-ID')}</td>
                <td>
                  <span className="text-emerald-600 font-medium">Tersedia</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
