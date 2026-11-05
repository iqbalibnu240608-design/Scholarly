import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {
  ShoppingBag,
  DollarSign,
  PackageCheck,
  PlusCircle,
  ShoppingCart,
  X,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react';
import './EcosystemModals.css';

interface KopsisProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  stock: number;
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
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State: Tambah Barang
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [sku, setSku] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Alat Tulis');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');

  // Modal State: Kasir POS Koperasi
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

  const fetchKopsisData = async () => {
    try {
      const res = await apiClient.get('/school/kopsis');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching kopsis data', err);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await apiClient.get('/wallet/transactions');
      const kopsisTrx = (res.data.transactions || []).filter(
        (t: any) => t.type === 'purchase_kopsis'
      );
      setRecentTransactions(kopsisTrx.slice(0, 5));
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchKopsisData(), fetchRecentTransactions()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  // Handler: Tambah Produk Baru
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/school/kopsis/products', {
        sku: sku || `ATK-${Date.now().toString().slice(-4)}`,
        name,
        category,
        price: Number(price),
        stock: Number(stock),
      });
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(null), 3500);
      setShowAddModal(false);
      setName('');
      setSku('');
      setPrice('');
      setStock('');
      await fetchKopsisData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan produk.');
    }
  };

  // Helper Cart POS
  const addToCart = (product: KopsisProduct) => {
    if (product.stock <= 0) {
      alert(`Stok produk "${product.name}" sedang habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Jumlah melebihi batas stok tersedia (${product.stock} unit).`);
          return prev;
        }
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              alert(`Jumlah melebihi stok yang tersedia (${item.stock} unit).`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handler: Checkout Kasir Kopsis (Eksekusi API Riil)
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong! Silakan pilih produk ATK/Seragam.');
      return;
    }

    setProcessingOrder(true);
    try {
      const res = await apiClient.post('/kopsis/checkout', {
        items: cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity })),
        payment_method: paymentMethod,
        student_identifier: paymentMethod === 'wallet' ? studentNisn : undefined,
      });

      setLastReceipt({
        reference_no: res.data.reference_no,
        total: res.data.total_amount,
        customer: res.data.customer,
        method: paymentMethod === 'wallet' ? 'Saldo Dompet Kopsis Siswa' : 'Tunai (Cash)',
      });

      setSuccessMsg(res.data.message);
      setShowPOSModal(false);
      setCart([]);

      // Refresh statistik kopsis & histori transaksi riil
      await Promise.all([fetchKopsisData(), fetchRecentTransactions()]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses transaksi kasir.');
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Kopsis...</div>;

  return (
    <div className="view-container">
      {/* Header Halaman */}
      <div className="view-header">
        <div>
          <h2>🛒 Portal Koperasi Siswa (Kopsis)</h2>
          <p>Sistem Point of Sale (POS) kasir koperasi, manajemen inventaris ATK & seragam, dan riwayat transaksi.</p>
        </div>
        <div className="header-meta">
          <span className="badge-status-paid">Kasir: {data?.kasir_status}</span>
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
              ✅ Transaksi Berhasil! No. Transaksi: <code>{lastReceipt.reference_no}</code>
            </div>
            <div className="receipt-alert-desc">
              Pelanggan: <strong>{lastReceipt.customer}</strong> • Total Belanja: <strong>Rp {lastReceipt.total.toLocaleString('id-ID')}</strong> ({lastReceipt.method})
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
          <p className="card-subtext">Tunai: {data?.transaksi_hari_ini.pembayaran_tunai} (Cashless Terintegrasi)</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <PackageCheck size={22} />
          </div>
          <h4>Total Item Produk</h4>
          <div className="amount-display text-emerald-700">
            {data?.produk_populer.length} Macam
          </div>
          <p className="card-subtext">Stok otomatis berkurang saat transaksi</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowPOSModal(true)}
          className="badge-pill bg-emerald-600 text-white flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-emerald-700 font-bold shadow-sm"
        >
          <ShoppingCart size={16} /> Buka Kasir Koperasi / Transaksi Baru
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="badge-pill bg-indigo-600 text-white flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-indigo-700 font-bold shadow-sm"
        >
          <PlusCircle size={16} /> Tambah Barang Baru
        </button>
      </div>

      {/* Modal 1: Kasir POS Kopsis */}
      {showPOSModal && (
        <div className="eco-modal-backdrop">
          <div className="eco-modal-card">
            <div className="eco-modal-header">
              <h3>
                <ShoppingCart size={18} className="text-emerald-600" />
                Terminal Kasir Koperasi Siswa (Kopsis)
              </h3>
              <button onClick={() => setShowPOSModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCheckout}>
              <div className="eco-modal-body">
                {/* 1. Pilih Item Produk */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    1. Klik Barang yang Dibeli Siswa:
                  </label>
                  <div className="pos-items-grid">
                    {data?.produk_populer.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => addToCart(prod)}
                        className={`pos-item-card ${prod.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={prod.stock > 0 ? 'Klik untuk tambah ke keranjang' : 'Stok habis'}
                      >
                        <div className="pos-item-title">{prod.name}</div>
                        <div className="pos-item-stock">SKU: {prod.sku} • Stok: {prod.stock}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="pos-item-price">Rp {Number(prod.price).toLocaleString('id-ID')}</span>
                          <span className="text-xs text-indigo-600 font-bold">+ Pilih</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Keranjang Belanja */}
                <div className="pos-cart-box">
                  <div className="pos-cart-header">
                    <span>🛒 Keranjang Belanja ({cart.length} Jenis Item)</span>
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
                      Belum ada barang yang dipilih. Klik produk di atas untuk menambahkan.
                    </div>
                  ) : (
                    <table className="pos-cart-table">
                      <thead>
                        <tr>
                          <th>Barang</th>
                          <th>Harga</th>
                          <th>Jumlah</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.product_id}>
                            <td><strong>{item.name}</strong></td>
                            <td>Rp {item.price.toLocaleString('id-ID')}</td>
                            <td>
                              <div className="pos-qty-controls">
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.product_id, -1)}
                                  className="pos-qty-btn"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.product_id, 1)}
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
                    <span>Total Belanja:</span>
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
                        <CreditCard size={14} /> Saldo E-Wallet Kopsis
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

      {/* Modal 2: Tambah Barang Baru */}
      {showAddModal && (
        <div className="p-4 my-4 bg-slate-50 border border-indigo-200 rounded-lg">
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
                className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
              >
                Simpan Produk
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

      {/* Tabel Katalog Produk Kopsis */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>Katalog Produk Koperasi Siswa (MySQL Table: `kopsis_products`)</h3>
          <span className="badge-pill">{data?.produk_populer.length} Item Tersedia</span>
        </div>

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
                <td><strong>{prod.stock}</strong> unit</td>
                <td>
                  <span className={prod.stock > 10 ? 'text-emerald-600 font-medium' : prod.stock > 0 ? 'text-amber-600 font-medium' : 'text-red-600 font-bold'}>
                    {prod.stock > 10 ? 'Tersedia' : prod.stock > 0 ? 'Stok Menipis' : 'Habis'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabel Riwayat Transaksi Kopsis Terkini */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Receipt size={18} className="inline mr-2 text-emerald-600" />
            Riwayat Transaksi Kasir Kopsis (MySQL: `transactions`)
          </h3>
          <span className="badge-pill bg-emerald-50 text-emerald-700">Tersinkronisasi Kasir</span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            Belum ada transaksi koperasi hari ini. Klik "Buka Kasir Koperasi" di atas untuk memulai.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Transaksi</th>
                <th>Pelanggan</th>
                <th>Rincian Pembelian</th>
                <th>Total Belanja</th>
                <th>Metode</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((trx) => (
                <tr key={trx.id}>
                  <td><code>{trx.reference_no}</code></td>
                  <td>
                    <strong>{trx.user?.name || 'Siswa'}</strong>
                    {trx.user?.identifier_number && (
                      <span className="text-xs text-slate-400 block">NISN: {trx.user.identifier_number}</span>
                    )}
                  </td>
                  <td>{trx.description}</td>
                  <td className="font-bold text-emerald-700">
                    Rp {Number(trx.amount).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className="badge-pill text-xs">
                      {trx.payment_method === 'wallet' ? '💳 E-Wallet' : '💵 Tunai'}
                    </span>
                  </td>
                  <td className="text-xs text-slate-500">
                    {new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
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
