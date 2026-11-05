import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  DollarSign,
  PackageCheck,
  PlusCircle,
  ShoppingCart,
  X,
  CreditCard,
  Banknote,
  Receipt,
  Wallet,
  Sparkles,
  ShoppingBag,
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
  const { user, activeRole } = useAuth();
  const isCustomerView = activeRole === 'siswa' || activeRole === 'guru';

  const [data, setData] = useState<KopsisData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Student Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<number>(50000);
  const [topupSubmitting, setTopupSubmitting] = useState<boolean>(false);

  // Cart & Ordering State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [studentNisn, setStudentNisn] = useState<string>(user?.identifier_number || '0061234567');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>('wallet');
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);

  // Modal State: Tambah Barang (Staff/Admin)
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [sku, setSku] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Alat Tulis');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');

  // Modal State: Kasir POS Koperasi (Staff/Admin)
  const [showPOSModal, setShowPOSModal] = useState<boolean>(false);

  // Modal State: Konfirmasi Checkout Siswa
  const [showStudentCheckoutModal, setShowStudentCheckoutModal] = useState<boolean>(false);

  // Feedback State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{
    reference_no: string;
    total: number;
    customer: string;
    method: string;
    items?: string;
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
      setRecentTransactions(kopsisTrx.slice(0, 6));
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await apiClient.get('/wallet/balance');
      if (res.data?.wallet) {
        setWalletBalance(Number(res.data.wallet.balance_kopsis) || 0);
      }
    } catch (err) {
      console.error('Error fetching wallet balance', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchKopsisData(), fetchRecentTransactions(), fetchWalletBalance()]);
      setLoading(false);
    };
    init();
  }, [fetchWalletBalance]);

  // Cart Handlers
  const addToCart = (product: KopsisProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Maksimal pembelian untuk ${product.name} adalah ${product.stock} item.`);
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

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              alert(`Stok hanya tersedia ${item.stock} item.`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTotalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Top Up Handler
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupSubmitting(true);
    try {
      const targetNisn = user?.identifier_number || '0061234567';
      await apiClient.post('/wallet/topup', {
        identifier_number: targetNisn,
        amount: topupAmount,
        target_wallet: 'kopsis',
        notes: 'Top-up mandiri via simulasi e-wallet kopsis siswa',
      });
      await fetchWalletBalance();
      setShowTopupModal(false);
      setSuccessMsg(`Top-up sebesar Rp ${topupAmount.toLocaleString('id-ID')} berhasil ditambahkan ke Saldo Kopsis!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal melakukan top-up');
    } finally {
      setTopupSubmitting(false);
    }
  };

  // Checkout Handler (Siswa & Staff)
  const handleCheckout = async (isStudentSelfOrder: boolean = false) => {
    if (cart.length === 0) return;
    setProcessingOrder(true);
    try {
      const payloadNisn = isStudentSelfOrder
        ? user?.identifier_number || '0061234567'
        : studentNisn;

      const res = await apiClient.post('/kopsis/checkout', {
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        payment_method: isStudentSelfOrder ? 'wallet' : paymentMethod,
        student_identifier: payloadNisn,
      });

      setLastReceipt({
        reference_no: res.data.reference_no,
        total: res.data.total_amount,
        customer: res.data.customer,
        method: isStudentSelfOrder ? 'Saldo Kopsis (Cashless)' : paymentMethod === 'wallet' ? 'Saldo E-Wallet' : 'Tunai',
        items: cart.map((i) => `${i.name} (x${i.quantity})`).join(', '),
      });

      setSuccessMsg(
        isStudentSelfOrder
          ? `Pembelian Koperasi berhasil! Silakan ambil barang di loket Kopsis dengan menyebutkan kode ${res.data.reference_no}.`
          : `Transaksi kasir kopsis berhasil diselesaikan untuk ${res.data.customer}.`
      );

      clearCart();
      setShowPOSModal(false);
      setShowStudentCheckoutModal(false);
      await Promise.all([fetchKopsisData(), fetchRecentTransactions(), fetchWalletBalance()]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses transaksi kopsis.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Tambah Barang Baru (Staff/Admin)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/school/kopsis/products', {
        sku,
        name,
        category,
        price: Number(price),
        stock: Number(stock),
      });
      setShowAddModal(false);
      setSku('');
      setName('');
      setPrice('');
      setStock('');
      setSuccessMsg(`Produk "${name}" berhasil ditambahkan ke inventaris.`);
      await fetchKopsisData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan produk');
    }
  };

  // Filter produk berdasarkan kategori
  const filteredProducts = (data?.produk_populer || []).filter((p) => {
    if (selectedCategory === 'Semua') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  if (loading) return <div className="loading-container">Memuat modul Koperasi Siswa...</div>;

  return (
    <div className="view-container">
      {/* Alert Struk Pembelian */}
      {lastReceipt && (
        <div className="receipt-alert-box">
          <Receipt size={24} className="receipt-alert-icon" />
          <div className="receipt-alert-content">
            <div className="receipt-alert-title">
              ✅ Bukti Belanja Koperasi: {lastReceipt.reference_no}
            </div>
            <div className="receipt-alert-desc">
              Total Pembayaran: <strong>Rp {Number(lastReceipt.total).toLocaleString('id-ID')}</strong> ({lastReceipt.method}) • Pembeli: {lastReceipt.customer}
              {lastReceipt.items && <div className="mt-1 text-xs">Item: {lastReceipt.items}</div>}
              {isCustomerView && (
                <div className="mt-1 font-semibold text-emerald-800">
                  📦 Silakan ambil barang Anda di etalase Kopsis sekolah!
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setLastReceipt(null)} className="btn-close-modal">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && !lastReceipt && (
        <div className="feedback-alert mb-4">
          <PackageCheck size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAMPILAN 1: CUSTOMER VIEW (UNTUK SISWA & GURU)                 */}
      {/* ============================================================== */}
      {isCustomerView ? (
        <>
          {/* Hero Saldo Banner */}
          <div className="wallet-hero-banner">
            <div className="wallet-hero-left">
              <h3>
                <ShoppingBag size={20} className="text-orange-400" />
                Katalog Koperasi Siswa (Kopsis Digital)
              </h3>
              <p>
                Beli buku, alat tulis, seragam, dan perlengkapan sekolah praktis menggunakan Saldo Kopsis.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="wallet-balance-box">
                <Wallet size={20} className="text-amber-300" />
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Saldo Kopsis Anda
                  </div>
                  <div className="wallet-amount-val" style={{ color: '#fb923c' }}>
                    Rp {walletBalance.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTopupModal(true)}
                className="btn-success-action"
                style={{ padding: '10px 16px', fontSize: '13px' }}
              >
                <PlusCircle size={16} /> Isi Saldo
              </button>
            </div>
          </div>

          {/* Kategori Filter Tabs */}
          <div className="catalog-tabs">
            {['Semua', 'Alat Tulis', 'Seragam', 'Buku'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`catalog-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat === 'Alat Tulis' ? '✏️ Alat Tulis' : cat === 'Seragam' ? '👕 Seragam' : cat === 'Buku' ? '📚 Buku & Modul' : '🛍️ Semua Produk'}
              </button>
            ))}
          </div>

          {/* Grid Katalog Produk Kopsis */}
          <div className="catalog-grid">
            {filteredProducts.map((prod) => {
              const inCart = cart.find((i) => i.product_id === prod.id);
              const isOutOfStock = prod.stock <= 0;

              return (
                <div key={prod.id} className="catalog-item-card">
                  <div>
                    <span className="catalog-item-badge">{prod.category}</span>
                    <h4 className="catalog-item-name">{prod.name}</h4>
                    <p className="catalog-item-meta">
                      SKU: <code className="text-xs">{prod.sku}</code> •{' '}
                      <span className={isOutOfStock ? 'text-red-500 font-semibold' : 'text-slate-600'}>
                        Stok: {prod.stock} unit
                      </span>
                    </p>
                  </div>

                  <div className="catalog-item-bottom">
                    <div className="catalog-item-price">
                      Rp {Number(prod.price).toLocaleString('id-ID')}
                    </div>

                    {inCart ? (
                      <div className="pos-qty-controls">
                        <button onClick={() => updateQuantity(prod.id, -1)} className="pos-qty-btn">
                          -
                        </button>
                        <span className="font-bold text-xs">{inCart.quantity}</span>
                        <button onClick={() => updateQuantity(prod.id, 1)} className="pos-qty-btn">
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(prod)}
                        disabled={isOutOfStock}
                        className="btn-primary-action"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <PlusCircle size={14} /> Beli
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Floating Cart Summary Bar */}
          {cart.length > 0 && (
            <div className="cart-floating-bar">
              <div className="cart-floating-info">
                <div className="cart-count-badge" style={{ backgroundColor: '#ea580c' }}>
                  {cartTotalQty}
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Belanja Kopsis:</div>
                  <div className="cart-total-text" style={{ color: '#fed7aa' }}>
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearCart}
                  className="btn-secondary-action"
                  style={{ background: '#334155', color: '#ffffff', borderColor: '#475569', padding: '8px 14px' }}
                >
                  Batal
                </button>
                <button
                  onClick={() => setShowStudentCheckoutModal(true)}
                  className="btn-success-action"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  <ShoppingCart size={16} /> Bayar Sekarang (Rp {cartTotal.toLocaleString('id-ID')})
                </button>
              </div>
            </div>
          )}

          {/* Riwayat Belanja Kopsis Siswa */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>
                <Sparkles size={18} className="inline mr-2 text-orange-500" />
                Riwayat Pembelian Kopsis Saya
              </h3>
              <span className="badge-pill">Terkini</span>
            </div>
            <div className="table-responsive">
              {recentTransactions.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Belum ada transaksi belanja di Kopsis.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kode Transaksi</th>
                      <th>Deskripsi Barang</th>
                      <th>Total Belanja</th>
                      <th>Metode</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((trx) => (
                      <tr key={trx.id}>
                        <td><strong className="text-orange-600">{trx.reference_no}</strong></td>
                        <td>{trx.description}</td>
                        <td><strong>Rp {Number(trx.amount).toLocaleString('id-ID')}</strong></td>
                        <td>
                          <span className="badge-pill text-xs">
                            {trx.payment_method === 'wallet' ? 'Saldo E-Wallet' : 'Tunai'}
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
        </>
      ) : (
        /* ============================================================== */
        /* TAMPILAN 2: STAFF KOPSIS & ADMIN DASHBOARD                     */
        /* ============================================================== */
        <>
          <div className="view-header">
            <div>
              <h2>🛒 Portal Koperasi Siswa (Kopsis)</h2>
              <p>Kelola inventaris seragam, alat tulis sekolah, dan operasional kasir harian.</p>
            </div>
            <div className="card-header-actions">
              <button onClick={() => setShowAddModal(true)} className="btn-secondary-action">
                <PlusCircle size={16} /> Tambah Barang Baru
              </button>
              <button onClick={() => setShowPOSModal(true)} className="btn-primary-action">
                <ShoppingCart size={16} /> Buka Kasir POS Koperasi
              </button>
            </div>
          </div>

          {/* Metric Cards Kopsis */}
          <div className="grid-cards-3">
            <div className="feature-card highlight-card">
              <div className="card-top-icon text-orange-600"><DollarSign size={22} /></div>
              <h4>Total Omset Kasir Hari Ini</h4>
              <div className="amount-display">
                Rp {(data?.transaksi_hari_ini.total_omset ?? 0).toLocaleString('id-ID')}
              </div>
              <p className="card-subtext">Dari {data?.transaksi_hari_ini.total_transaksi ?? 0} total transaksi belanja</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-indigo-600"><PackageCheck size={22} /></div>
              <h4>Pembayaran Non-Tunai</h4>
              <div className="amount-display">{data?.transaksi_hari_ini.pembayaran_digital}</div>
              <p className="card-subtext">Menggunakan kartu NISN / Saldo E-Wallet Kopsis</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-emerald-600"><ShoppingCart size={22} /></div>
              <h4>Status Layanan Kasir</h4>
              <div className="badge-status-paid">{data?.kasir_status}</div>
              <p className="card-subtext">Koneksi database inventaris realtime aktif</p>
            </div>
          </div>

          {/* Tabel Inventaris Produk Kopsis */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>Inventaris Produk & Stok Koperasi</h3>
              <span className="badge-pill">{data?.produk_populer.length || 0} Barang Terdaftar</span>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU / Barcode</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Harga Satuan</th>
                    <th>Stok Tersedia</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.produk_populer.map((prod) => (
                    <tr key={prod.id}>
                      <td><code>{prod.sku}</code></td>
                      <td><strong>{prod.name}</strong></td>
                      <td><span className="badge-pill text-xs">{prod.category}</span></td>
                      <td>Rp {Number(prod.price).toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`badge-pill text-xs ${prod.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {prod.stock} unit
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* MODAL: TOP-UP SALDO KOPSIS SISWA                               */}
      {/* ============================================================== */}
      {showTopupModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowTopupModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><Wallet size={18} className="text-orange-500" /> Isi Saldo Kopsis</h3>
              <button onClick={() => setShowTopupModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleTopup} className="eco-modal-form">
              <div className="eco-modal-body">
                <p className="text-xs text-slate-600">
                  Pilih nominal saldo yang ingin Anda tambahkan ke Saldo E-Wallet Koperasi Siswa:
                </p>
                <div className="topup-grid">
                  {[20000, 50000, 100000, 150000, 200000, 300000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`topup-btn ${topupAmount === amt ? 'selected' : ''}`}
                    >
                      Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-orange-50 rounded text-xs text-orange-800 border border-orange-200">
                  💡 Saldo ini langsung dapat dipakai untuk checkout perlengkapan ATK & seragam tanpa uang tunai.
                </div>
              </div>
              <div className="eco-modal-footer">
                <button type="button" onClick={() => setShowTopupModal(false)} className="btn-secondary-action">
                  Batal
                </button>
                <button type="submit" disabled={topupSubmitting} className="btn-success-action">
                  {topupSubmitting ? 'Memproses...' : `Konfirmasi Top Up Rp ${topupAmount.toLocaleString('id-ID')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI CHECKOUT SISWA KOPSIS                        */}
      {/* ============================================================== */}
      {showStudentCheckoutModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowStudentCheckoutModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><ShoppingCart size={18} className="text-orange-600" /> Konfirmasi Pembelian Kopsis</h3>
              <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <div className="eco-modal-body">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold mb-2 uppercase">Rincian Barang:</div>
                {cart.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-xs py-1 border-b border-slate-200">
                    <span>{item.name} x{item.quantity}</span>
                    <strong>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</strong>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 mt-1">
                  <span>Total Belanja:</span>
                  <span className="text-orange-600">Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="p-3 rounded border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span>Saldo Kopsis Anda:</span>
                  <strong>Rp {walletBalance.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Sisa Saldo Setelah Belanja:</span>
                  <strong className={walletBalance >= cartTotal ? 'text-emerald-600' : 'text-red-500'}>
                    Rp {(walletBalance - cartTotal).toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>

              {walletBalance < cartTotal && (
                <div className="p-3 bg-red-50 text-red-700 rounded text-xs border border-red-200">
                  ⚠️ Saldo Kopsis Anda tidak mencukupi. Silakan lakukan Top Up terlebih dahulu sebelum membeli.
                </div>
              )}
            </div>
            <div className="eco-modal-footer">
              <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-secondary-action">
                Batal
              </button>
              {walletBalance < cartTotal ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentCheckoutModal(false);
                    setShowTopupModal(true);
                  }}
                  className="btn-primary-action"
                >
                  Isi Saldo Sekarang
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(true)}
                  disabled={processingOrder}
                  className="btn-success-action"
                >
                  {processingOrder ? 'Memproses...' : 'Bayar via Saldo Kopsis'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KASIR POS KOPSIS (STAFF/ADMIN)                          */}
      {/* ============================================================== */}
      {showPOSModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowPOSModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><ShoppingCart size={18} className="text-indigo-600" /> Kasir POS Koperasi Siswa</h3>
              <button onClick={() => setShowPOSModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <div className="eco-modal-body">
              <div className="eco-form-group">
                <label className="eco-form-label">Identitas Pembeli (NISN Siswa)</label>
                <input
                  type="text"
                  value={studentNisn}
                  onChange={(e) => setStudentNisn(e.target.value)}
                  placeholder="Masukkan NISN Siswa..."
                  className="eco-form-input"
                />
              </div>

              <div className="eco-form-group">
                <label className="eco-form-label">Pilih Barang untuk Ditambahkan</label>
                <div className="catalog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                  {data?.produk_populer.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addToCart(prod)}
                      className="p-2 border rounded text-left hover:bg-slate-50 transition"
                    >
                      <div className="font-bold text-xs">{prod.name}</div>
                      <div className="text-xs text-orange-600 font-semibold">Rp {Number(prod.price).toLocaleString('id-ID')}</div>
                      <div className="text-xs text-slate-500">Stok: {prod.stock}</div>
                    </button>
                  ))}
                </div>
              </div>

              {cart.length > 0 && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <table className="pos-cart-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.product_id}>
                          <td>{item.name}</td>
                          <td>
                            <div className="pos-qty-controls">
                              <button onClick={() => updateQuantity(item.product_id, -1)} className="pos-qty-btn">-</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product_id, 1)} className="pos-qty-btn">+</button>
                            </div>
                          </td>
                          <td><strong>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pos-total-row">
                    <span>Total Pembayaran:</span>
                    <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              <div className="eco-form-group">
                <label className="eco-form-label">Metode Pembayaran</label>
                <div className="payment-method-selector">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`payment-method-btn ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                  >
                    <CreditCard size={16} /> Saldo E-Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`payment-method-btn ${paymentMethod === 'cash' ? 'selected' : ''}`}
                  >
                    <Banknote size={16} /> Tunai (Cash)
                  </button>
                </div>
              </div>
            </div>
            <div className="eco-modal-footer">
              <button onClick={() => setShowPOSModal(false)} className="btn-secondary-action">Batal</button>
              <button
                onClick={() => handleCheckout(false)}
                disabled={processingOrder || cart.length === 0}
                className="btn-success-action"
              >
                {processingOrder ? 'Memproses...' : `Selesaikan Transaksi (Rp ${cartTotal.toLocaleString('id-ID')})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH BARANG BARU (STAFF/ADMIN)                        */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><PlusCircle size={18} className="text-orange-600" /> Tambah Barang Kopsis</h3>
              <button onClick={() => setShowAddModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="eco-modal-form">
              <div className="eco-modal-body">
                <div className="eco-form-group">
                  <label className="eco-form-label">Kode SKU / Barcode</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Contoh: ATK-009"
                    required
                    className="eco-form-input"
                  />
                </div>
                <div className="eco-form-group">
                  <label className="eco-form-label">Nama Barang</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Buku Tulis Campus 58 Lembar"
                    required
                    className="eco-form-input"
                  />
                </div>
                <div className="eco-form-group">
                  <label className="eco-form-label">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="eco-form-input"
                  >
                    <option value="Alat Tulis">Alat Tulis</option>
                    <option value="Seragam">Seragam</option>
                    <option value="Buku">Buku</option>
                  </select>
                </div>
                <div className="eco-form-group">
                  <label className="eco-form-label">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 6500"
                    required
                    className="eco-form-input"
                  />
                </div>
                <div className="eco-form-group">
                  <label className="eco-form-label">Jumlah Stok</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Contoh: 100"
                    required
                    className="eco-form-input"
                  />
                </div>
              </div>
              <div className="eco-modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary-action">Batal</button>
                <button type="submit" className="btn-primary-action">Simpan Barang</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
