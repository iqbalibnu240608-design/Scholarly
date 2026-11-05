import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {
  UtensilsCrossed,
  Coffee,
  CheckCircle,
  Clock,
  PlusCircle,
  ShoppingCart,
  X,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react';
import './EcosystemModals.css';

interface KantinMenu {
  id: number;
  name: string;
  category: string;
  price: number;
  stall_name: string;
  is_available: boolean;
}

interface CartItem {
  menu_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface RecentTransaction {
  id: number;
  reference_no: string;
  amount: number;
  payment_method: string;
  description: string;
  created_at: string;
  user?: {
    name: string;
    identifier_number: string;
  };
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
  const [recentOrders, setRecentOrders] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State: Tambah Menu
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Makanan');
  const [price, setPrice] = useState<string>('');
  const [stallName, setStallName] = useState<string>('Stand 1 Bu Titin');

  // Modal State: Kasir POS Kantin
  const [showPOSModal, setShowPOSModal] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [studentNisn, setStudentNisn] = useState<string>('0061234567');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>('wallet');
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);

  // Feedback State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{
    reference_no: string;
    total: number;
    customer: string;
    method: string;
  } | null>(null);

  const fetchKantinData = async () => {
    try {
      const res = await apiClient.get('/school/kantin');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching kantin data', err);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await apiClient.get('/wallet/transactions');
      // Filter transaksi tipe kantin
      const kantinTrx = (res.data.transactions || []).filter(
        (t: any) => t.type === 'purchase_kantin'
      );
      setRecentOrders(kantinTrx.slice(0, 5));
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchKantinData(), fetchRecentTransactions()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  // Handler: Tambah Menu Baru
  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/school/kantin/menus', {
        name,
        category,
        price: Number(price),
        stall_name: stallName,
      });
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(null), 3500);
      setShowAddModal(false);
      setName('');
      setPrice('');
      await fetchKantinData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan menu.');
    }
  };

  // Helper Cart POS
  const addToCart = (menu: KantinMenu) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menu_id === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.menu_id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { menu_id: menu.id, name: menu.name, price: Number(menu.price), quantity: 1 }];
    });
  };

  const updateCartQty = (menuId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.menu_id === menuId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handler: Checkout Kasir Kantin (Eksekusi API Riil)
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong! Silakan pilih menu.');
      return;
    }

    setProcessingOrder(true);
    try {
      const res = await apiClient.post('/kantin/checkout', {
        items: cart.map((c) => ({ menu_id: c.menu_id, quantity: c.quantity })),
        payment_method: paymentMethod,
        student_identifier: paymentMethod === 'wallet' ? studentNisn : undefined,
      });

      setLastReceipt({
        reference_no: res.data.reference_no,
        total: res.data.total_amount,
        customer: res.data.customer,
        method: paymentMethod === 'wallet' ? 'Saldo Dompet Siswa' : 'Tunai (Cash)',
      });

      setSuccessMsg(res.data.message);
      setShowPOSModal(false);
      setCart([]);

      // Refresh statistik kantin & histori transaksi riil
      await Promise.all([fetchKantinData(), fetchRecentTransactions()]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pesanan kasir.');
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Kantin...</div>;

  return (
    <div className="view-container">
      {/* Header Halaman */}
      <div className="view-header">
        <div>
          <h2>🍜 Portal Pengelola Kantin Sekolah</h2>
          <p>Sistem kasir Point of Sale (POS) cashless, kelola menu kuliner sehat, dan pantau omset.</p>
        </div>
        <div className="header-meta">
          <span className="badge-status-paid">Status: {data?.status_kantin}</span>
        </div>
      </div>

      {/* Alert Notifikasi Sukses */}
      {successMsg && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
          <span>✅ {successMsg}</span>
        </div>
      )}

      {/* Alert Resi Transaksi Terakhir */}
      {lastReceipt && (
        <div className="receipt-alert-box">
          <Receipt size={24} className="receipt-alert-icon" />
          <div className="receipt-alert-content">
            <div className="receipt-alert-title">
              ✅ Pesanan Berhasil! Resi: <code>{lastReceipt.reference_no}</code>
            </div>
            <div className="receipt-alert-desc">
              Pelanggan: <strong>{lastReceipt.customer}</strong> • Total: <strong>Rp {lastReceipt.total.toLocaleString('id-ID')}</strong> ({lastReceipt.method})
            </div>
          </div>
          <button onClick={() => setLastReceipt(null)} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Kartu Ringkasan Metrik */}
      <div className="grid-cards-3">
        <div className="feature-card">
          <div className="card-top-icon text-cyan-600">
            <Clock size={22} />
          </div>
          <h4>Pesanan Aktif</h4>
          <div className="amount-display text-cyan-700">{data?.pesanan_aktif} Antrean</div>
          <p className="card-subtext">Jam istirahat aktif</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <CheckCircle size={22} />
          </div>
          <h4>Pesanan Selesai Hari Ini</h4>
          <div className="amount-display text-emerald-700">{data?.pesanan_selesai_hari_ini} Porsi</div>
          <p className="card-subtext">Pelayanan makanan higienis</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-amber-600">
            <UtensilsCrossed size={22} />
          </div>
          <h4>Omset Penjualan Hari Ini</h4>
          <div className="amount-display text-amber-700">
            Rp {(data?.omset_hari_ini ?? 0).toLocaleString('id-ID')}
          </div>
          <p className="card-subtext">Tersinkronisasi otomatis dengan buku kasir</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowPOSModal(true)}
          className="badge-pill bg-emerald-600 text-white flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-emerald-700 font-bold shadow-sm"
        >
          <ShoppingCart size={16} /> Buka Kasir / Pesanan Baru
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="badge-pill bg-indigo-600 text-white flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-indigo-700 font-bold shadow-sm"
        >
          <PlusCircle size={16} /> Tambah Menu Baru
        </button>
      </div>

      {/* Modal 1: Kasir POS Kantin (Pilih Menu & Potong Saldo) */}
      {showPOSModal && (
        <div className="eco-modal-backdrop">
          <div className="eco-modal-card">
            <div className="eco-modal-header">
              <h3>
                <ShoppingCart size={18} className="text-emerald-600" />
                Terminal Kasir Kantin Sekolah
              </h3>
              <button onClick={() => setShowPOSModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCheckout}>
              <div className="eco-modal-body">
                {/* 1. Pilih Item Menu */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    1. Klik Menu Makanan / Minuman yang Dipesan:
                  </label>
                  <div className="pos-items-grid">
                    {data?.daftar_menu.map((menu) => (
                      <div
                        key={menu.id}
                        onClick={() => addToCart(menu)}
                        className="pos-item-card"
                        title="Klik untuk tambah ke keranjang"
                      >
                        <div className="pos-item-title">{menu.name}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="pos-item-price">Rp {Number(menu.price).toLocaleString('id-ID')}</span>
                          <span className="text-xs text-indigo-600 font-bold">+ Pilih</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Keranjang Belanja */}
                <div className="pos-cart-box">
                  <div className="pos-cart-header">
                    <span>🛒 Keranjang ({cart.length} Jenis Item)</span>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCart([])}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Kosongkan
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Belum ada menu yang dipilih. Klik sajian di atas untuk menambahkan.
                    </div>
                  ) : (
                    <table className="pos-cart-table">
                      <thead>
                        <tr>
                          <th>Menu</th>
                          <th>Harga</th>
                          <th>Jumlah</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.menu_id}>
                            <td><strong>{item.name}</strong></td>
                            <td>Rp {item.price.toLocaleString('id-ID')}</td>
                            <td>
                              <div className="pos-qty-controls">
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.menu_id, -1)}
                                  className="pos-qty-btn"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.menu_id, 1)}
                                  className="pos-qty-btn"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <div className="pos-total-row">
                    <span>Total Pembayaran:</span>
                    <span className="text-emerald-700 font-extrabold text-base">
                      Rp {cartTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* 3. Metode Pembayaran & Identitas Siswa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Metode Pembayaran:
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`flex-1 p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 ${
                          paymentMethod === 'wallet'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <CreditCard size={14} /> Saldo E-Wallet Siswa
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex-1 p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 ${
                          paymentMethod === 'cash'
                            ? 'bg-amber-50 border-amber-500 text-amber-700'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Banknote size={14} /> Tunai (Cash)
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'wallet' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nomor Identitas (NISN Siswa):
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 0061234567"
                        value={studentNisn}
                        onChange={(e) => setStudentNisn(e.target.value)}
                        className="w-full p-2 border rounded text-xs bg-white"
                      />
                      {/* Preset Cepat Siswa Demo */}
                      <div className="quick-preset-container">
                        <span className="text-[11px] text-slate-500">Pilih Siswa:</span>
                        <button
                          type="button"
                          onClick={() => setStudentNisn('0061234567')}
                          className={`quick-preset-btn ${studentNisn === '0061234567' ? 'active' : ''}`}
                        >
                          Ahmad (0061234567)
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentNisn('0089876543')}
                          className={`quick-preset-btn ${studentNisn === '0089876543' ? 'active' : ''}`}
                        >
                          Siti (0089876543)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="eco-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowPOSModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingOrder || cart.length === 0}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {processingOrder ? 'Memproses Transaksi...' : `Bayar Rp ${cartTotal.toLocaleString('id-ID')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Tambah Menu Baru */}
      {showAddModal && (
        <div className="p-4 my-4 bg-slate-50 border border-indigo-200 rounded-lg">
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
                className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
              >
                Simpan Menu
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

      {/* Tabel Menu Kantin */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Coffee size={18} className="inline mr-2 text-indigo-600" />
            Daftar Menu Kantin Sehat (MySQL Table: `kantin_menus`)
          </h3>
          <span className="badge-pill">{data?.daftar_menu.length} Sajian Aktif</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th>Stand / Penjual</th>
              <th>Harga</th>
              <th>Status</th>
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

      {/* Tabel Riwayat Pesanan Kantin Terkini */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Receipt size={18} className="inline mr-2 text-emerald-600" />
            Riwayat Pesanan Kantin Terkini (MySQL: `transactions`)
          </h3>
          <span className="badge-pill bg-emerald-50 text-emerald-700">Tersinkronisasi Kasir</span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            Belum ada transaksi pesanan kantin hari ini. Klik tombol "Buka Kasir" di atas untuk memulai.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Referensi</th>
                <th>Pelanggan</th>
                <th>Rincian Pesanan</th>
                <th>Total Bayar</th>
                <th>Metode</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord.id}>
                  <td><code>{ord.reference_no}</code></td>
                  <td>
                    <strong>{ord.user?.name || 'Siswa'}</strong>
                    {ord.user?.identifier_number && (
                      <span className="text-xs text-slate-400 block">NISN: {ord.user.identifier_number}</span>
                    )}
                  </td>
                  <td>{ord.description}</td>
                  <td className="font-bold text-emerald-700">
                    Rp {Number(ord.amount).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className="badge-pill text-xs">
                      {ord.payment_method === 'wallet' ? '💳 E-Wallet' : '💵 Tunai'}
                    </span>
                  </td>
                  <td className="text-xs text-slate-500">
                    {new Date(ord.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
