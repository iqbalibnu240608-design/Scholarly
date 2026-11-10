import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient, getCachedData } from '../api/client';
import {
  DollarSign,
  PackageCheck,
  CheckCircle,
  PlusCircle,
  ShoppingCart,
  X,
  Banknote,
  Receipt,
  ShoppingBag,
  QrCode,
  Search,
  Trash2,
} from 'lucide-react';
import './EcosystemModals.css';
import { toast } from 'sonner';
import { QRISUploadModal } from '../components/common/QRISUploadModal';
import { getStoredQRIS, getQRISDisplaySource } from '../utils/qris';

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
  type?: string;
  amount: number;
  payment_method: string;
  status?: 'pending' | 'completed' | 'rejected' | 'failed' | string;
  description: string;
  created_at: string;
  user?: {
    name: string;
    identifier_number: string;
  };
  operator?: {
    name: string;
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
  const normalizedRole = (activeRole || '').trim().toLowerCase();
  const isKopsisStaff = ['kopsis', 'koperasi', 'pengelola_koperasi', 'admin'].includes(normalizedRole);
  const isCustomerView = !isKopsisStaff;
  const [data, setData] = useState<KopsisData | null>(() => getCachedData('/school/kopsis')?.data || null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/kopsis'));

  // Student Wallet State
    // Cart & Ordering State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [studentNisn, setStudentNisn] = useState<string>(user?.identifier_number || '0061234567');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('qris');
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
  const [posSearch, setPosSearch] = useState<string>('');
  const [posCategory, setPosCategory] = useState<string>('Semua');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [showQRISModal, setShowQRISModal] = useState<boolean>(false);
  const [kopsisQris, setKopsisQris] = useState(() => getStoredQRIS('kopsis'));
  // Modal State: Konfirmasi Checkout Siswa
  const [showStudentCheckoutModal, setShowStudentCheckoutModal] = useState<boolean>(false);

  // Auto-detection & auto-trigger when QRIS is paid
  useEffect(() => {
    if (!showStudentCheckoutModal || paymentMethod !== 'qris') return;

    const timer = setTimeout(() => {
      handleCheckout(true);
    }, 8500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleCheckout(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showStudentCheckoutModal, paymentMethod]);

  // Feedback State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{
    reference_no: string;
    total: number;
    customer: string;
    method: string;
    items?: string;
    instructions?: string;
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
        (t: any) => t.type === 'purchase_kopsis' || t.type === 'topup_kopsis' || t.type === 'topup_wallet'
      );
      setRecentTransactions(kopsisTrx.slice(0, 25));
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

    useEffect(() => {
    const init = async () => {
      setLoading(true);
      const promises: Promise<any>[] = [fetchKopsisData(), fetchRecentTransactions()];

      await Promise.all(promises);
      setLoading(false);
    };
    init();
  }, [activeRole]);

  // Keep NISN in sync when active user switches
  useEffect(() => {
    if (user?.identifier_number) {
      setStudentNisn(user.identifier_number);
    }
  }, [user]);

  // Cart Handlers
  const addToCart = (product: KopsisProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Maksimal pembelian untuk ${product.name} adalah ${product.stock} item.`);
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
              toast.error(`Stok hanya tersedia ${item.stock} item.`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };
  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTotalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Checkout Handler (Siswa & Kasir)
  const handleCheckout = async (isStudentSelfOrder: boolean = false) => {
    if (cart.length === 0) return;



    setProcessingOrder(true);
    try {
      const payloadNisn = isStudentSelfOrder
        ? user?.identifier_number || '0061234567'
        : studentNisn;

      const res = await apiClient.post('/kopsis/checkout', {
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        payment_method: paymentMethod,
        student_identifier: payloadNisn,
      });

      const methodLabel =
        paymentMethod === 'cash'
          ? 'Tunai di Loket Kopsis'
          : 'QRIS / E-Money';

      const instructionText =
        paymentMethod === 'cash'
          ? `Pesanan Diterima! Silakan bayar tunai Rp ${Number(res.data.total_amount).toLocaleString('id-ID')} saat mengambil barang di loket Kopsis.`
          : paymentMethod === 'qris'
          ? 'Pembayaran QRIS Koperasi berhasil diverifikasi! Barang Anda siap diambil.'
          : 'Pembayaran berhasil dipotong dari Saldo Kopsis. Tunjukkan kode bukti untuk mengambil barang.';

      setLastReceipt({
        reference_no: res.data.reference_no,
        total: res.data.total_amount,
        customer: res.data.customer,
        method: methodLabel,
        items: cart.map((i) => `${i.name} (x${i.quantity})`).join(', '),
        instructions: instructionText,
      });

      setSuccessMsg(instructionText);

      clearCart();
      setShowPOSModal(false);
      setShowStudentCheckoutModal(false);
      const promises: Promise<any>[] = [fetchKopsisData(), fetchRecentTransactions()];

      await Promise.all(promises);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses transaksi kopsis.');
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
      toast.error(err.response?.data?.message || 'Gagal menambahkan produk');
    }
  };

  // Filter produk berdasarkan kategori
  const filteredProducts = (data?.produk_populer || []).filter((p) => {
    if (selectedCategory === 'Semua') return true;
    return (p.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat data modul Koperasi Siswa...
      </div>
    );
  }

  return (
    <div className="view-container">
      {/* Alert Struk Pembelian */}
      {lastReceipt && (
        <div className="receipt-alert-box">
          <Receipt size={24} className="receipt-alert-icon" />
          <div className="receipt-alert-content">
            <div className="receipt-alert-title">
              <CheckCircle className="w-4 h-4 text-emerald-600 inline mr-1.5" />
              Bukti Belanja Koperasi: {lastReceipt.reference_no}
            </div>
            <div className="receipt-alert-desc">
              Total Pembayaran: <strong>Rp {Number(lastReceipt.total).toLocaleString('id-ID')}</strong> ({lastReceipt.method}) • Pembeli: {lastReceipt.customer}
              {lastReceipt.items && <div className="mt-1 text-xs">Item: {lastReceipt.items}</div>}
              {lastReceipt.instructions && (
                <div className="mt-2 font-semibold text-emerald-800 p-2 bg-emerald-100 rounded">
                  <CheckCircle size={14} className="inline mr-1 text-emerald-700" /> {lastReceipt.instructions}
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
          <div className="wallet-hero-banner w-full max-w-full box-border">
            <div className="wallet-hero-left w-full sm:w-auto">
              <h3>
                <ShoppingBag size={20} className="text-orange-400 shrink-0" />
                <span>Katalog Koperasi Siswa (Pembayaran Bisa Lewat QRIS)</span>
              </h3>
            </div>
          </div>

          {/* Kategori Filter Tabs */}
          <div className="w-full max-w-full overflow-x-auto pb-2 mb-4 no-scrollbar">
            <div className="catalog-tabs flex items-center gap-2 max-w-full m-0 p-0">
              {['Semua', 'Alat Tulis', 'Seragam', 'Buku'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`catalog-tab-btn shrink-0 ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'Alat Tulis' ? 'Alat Tulis' : cat === 'Seragam' ? 'Seragam' : cat === 'Buku' ? 'Buku & Modul' : 'Semua Produk'}
                </button>
              ))}
            </div>
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

          {/* Floating Cart Action Button (Squircle with Orange Badge) */}
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => setShowStudentCheckoutModal(true)}
              aria-label="Lihat Keranjang Belanja Kopsis"
              className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0F172A] shadow-2xl flex items-center justify-center border border-slate-700/60 hover:bg-[#1E293B] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
            >
              <ShoppingBag className="w-7 h-7 text-white stroke-[2.2] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-2 -right-2 min-w-7 h-7 px-1.5 rounded-full bg-orange-500 text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-lg ring-2 ring-white animate-in zoom-in-75 duration-200">
                {cartTotalQty}
              </span>
            </button>
          )}

          {/* Riwayat Belanja Kopsis Siswa */}
          <div className="overview-card mt-6">
            <div className="card-header flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0">
                  Riwayat Pembelian Kopsis Saya
                </h3>
              </div>
              <span className="badge-pill bg-orange-50 text-orange-700 text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full border border-orange-200/60">
                {recentTransactions.length} Transaksi Tercatat
              </span>
            </div>
            <div className="table-responsive">
              {recentTransactions.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  <Receipt size={32} className="mx-auto text-slate-400 mb-2 opacity-50" />
                  Belum ada transaksi belanja di Kopsis untuk akun ini.
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
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((trx) => (
                      <tr key={trx.id}>
                        <td><strong className="text-orange-600">{trx.reference_no}</strong></td>
                        <td>{trx.description}</td>
                        <td><strong>Rp {Number(trx.amount).toLocaleString('id-ID')}</strong></td>
                        <td>
                          <span className={`badge-pill text-xs font-semibold ${
                            trx.payment_method === 'wallet'
                              ? 'bg-blue-100 text-blue-800'
                              : trx.payment_method === 'qris'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {trx.payment_method === 'wallet' ? 'Saldo E-Wallet' : trx.payment_method === 'qris' ? 'QRIS' : 'Tunai'}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(trx.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          {trx.status === 'pending' ? (
                            <span className="badge-pill text-xs font-bold bg-amber-100 text-amber-800">
                              Menunggu Verifikasi
                            </span>
                          ) : trx.status === 'rejected' ? (
                            <span className="badge-pill text-xs font-bold bg-rose-100 text-rose-800">
                              Ditolak
                            </span>
                          ) : (
                            <span className="badge-pill text-xs font-bold bg-emerald-100 text-emerald-800">
                              Selesai
                            </span>
                          )}
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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingBag size={24} style={{ color: '#356df3' }} /> Koperasi Siswa (Kopsis)</h2>
            </div>
            <div className="card-header-actions flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button onClick={() => setShowQRISModal(true)} className="btn-secondary-action w-full sm:w-auto justify-center">
                <QrCode size={16} /> Upload QRIS Kopsis
              </button>
              <button onClick={() => setShowAddModal(true)} className="btn-secondary-action w-full sm:w-auto justify-center">
                <PlusCircle size={16} /> Tambah Barang Baru
              </button>
              <button onClick={() => setShowPOSModal(true)} className="btn-primary-action w-full sm:w-auto justify-center">
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
                Rp {(data?.transaksi_hari_ini?.total_omset ?? 0).toLocaleString('id-ID')}
              </div>
              <p className="card-subtext">Dari {data?.transaksi_hari_ini?.total_transaksi ?? 0} total transaksi belanja</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-indigo-600"><PackageCheck size={22} /></div>
              <h4>Pembayaran Non-Tunai</h4>
              <div className="amount-display">{data?.transaksi_hari_ini?.pembayaran_digital ?? '72%'}</div>
              <p className="card-subtext">Menggunakan kartu NISN / Saldo E-Wallet Kopsis & QRIS</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-emerald-600"><ShoppingCart size={22} /></div>
              <h4>Status Layanan Kasir</h4>
              <div className="badge-status-paid">{data?.kasir_status ?? 'Online'}</div>
              <p className="card-subtext">Koneksi database inventaris realtime aktif</p>
            </div>
          </div>

          {/* Tabel Inventaris Produk Kopsis */}
          <div className="overview-card mt-6">
            <div className="card-header flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0">
                  Inventaris Produk & Stok Koperasi
                </h3>
              </div>
              <span className="badge-pill text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
                {data?.produk_populer?.length || 0} Barang Terdaftar
              </span>
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
                  {(data?.produk_populer || []).map((prod) => (
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

          {/* Tabel Riwayat Transaksi & Penjualan Kasir Koperasi */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>
                <Receipt size={18} className="inline mr-2 text-orange-600" />
                Riwayat Transaksi & Penjualan Kasir Koperasi
              </h3>
              <span className="badge-pill bg-orange-50 text-orange-700 font-bold">
                {recentTransactions.length} Transaksi Tercatat
              </span>
            </div>
            <div className="table-responsive">
              {recentTransactions.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  <Receipt size={32} className="mx-auto text-slate-400 mb-2 opacity-50" />
                  Belum ada transaksi kasir koperasi yang tercatat.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kode Transaksi</th>
                      <th>Pelanggan / Siswa</th>
                      <th>Rincian Barang</th>
                      <th>Total Belanja</th>
                      <th>Metode Bayar</th>
                      <th>Kasir / Petugas</th>
                      <th>Waktu Transaksi</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((trx) => (
                      <tr key={trx.id}>
                        <td><strong className="text-orange-600">{trx.reference_no}</strong></td>
                        <td>
                          <strong>{trx.user?.name || 'Siswa / Umum'}</strong>
                          {trx.user?.identifier_number && (
                            <div className="text-xs text-slate-500">NISN: {trx.user.identifier_number}</div>
                          )}
                        </td>
                        <td>{trx.description}</td>
                        <td><strong>Rp {Number(trx.amount).toLocaleString('id-ID')}</strong></td>
                        <td>
                          <span className={`badge-pill text-xs font-semibold ${
                            trx.payment_method === 'wallet'
                              ? 'bg-blue-100 text-blue-800'
                              : trx.payment_method === 'qris'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {trx.payment_method === 'wallet'
                              ? 'Saldo E-Wallet'
                              : trx.payment_method === 'qris'
                              ? 'QRIS'
                              : 'Tunai di Kasir'}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-600 font-medium">
                            {trx.operator?.name || 'Petugas Koperasi'}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(trx.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          {trx.status === 'pending' ? (
                            <span className="badge-pill text-xs font-bold bg-amber-100 text-amber-800">
                              Menunggu Verifikasi
                            </span>
                          ) : trx.status === 'rejected' ? (
                            <span className="badge-pill text-xs font-bold bg-rose-100 text-rose-800">
                              Ditolak
                            </span>
                          ) : (
                            <span className="badge-pill text-xs font-bold bg-emerald-100 text-emerald-800">
                              Selesai
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI CHECKOUT SISWA KOPSIS (MULTI-PAYMENT)        */}
      {/* ============================================================== */}
      {showStudentCheckoutModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowStudentCheckoutModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><ShoppingCart size={18} className="text-orange-600" /> Konfirmasi & Metode Pembayaran Kopsis</h3>
              <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <div className="eco-modal-body">
              {/* Rincian Barang */}
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

              {/* Pilihan Metode Pembayaran */}
              <div className="eco-form-group">
                <label className="eco-form-label font-bold">Pilih Cara Pembayaran:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote size={22} className="mb-1 text-emerald-600" />
                    <span className="font-bold text-xs">Bayar Tunai</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Bayar di Loket Kopsis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                      paymentMethod === 'qris'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode size={22} className="mb-1 text-indigo-600" />
                    <span className="font-bold text-xs">QRIS Instan</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Scan QRIS Koperasi</span>
                  </button>
                </div>
              </div>

              {/* Informasi Sesuai Metode */}
              {paymentMethod === 'cash' && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded text-xs border border-emerald-200">
                  <Banknote size={16} className="inline mr-1 text-primary" /> <strong>Bayar Tunai di Loket Kopsis:</strong> Nomor pesanan akan langsung dibuat. Siapkan uang tunai sebesar <strong>Rp {cartTotal.toLocaleString('id-ID')}</strong> saat mengambil barang di etalase koperasi.
                </div>
              )}

              {paymentMethod === 'qris' && (
                <div className="p-3.5 bg-indigo-50/80 text-indigo-900 rounded-xl text-xs border border-indigo-200 text-center space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-bold text-[11px] text-indigo-800">QRIS Koperasi Siswa (Terpisah)</span>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                      Uji Transaksi Riil: Rp 1,-
                    </span>
                  </div>

                  <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-indigo-200 shadow-xs flex items-center justify-center">
                    <img
                      src={getQRISDisplaySource(kopsisQris, 1).imageSrc}
                      alt="QRIS Koperasi Siswa"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-indigo-950">{kopsisQris.merchantName}</p>
                    <p className="font-mono text-[11px] text-indigo-600 mt-0.5">NMID: {kopsisQris.nmid}</p>
                  </div>

                  <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 text-left space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700 text-xs">
                      <span>Total Belanja Asli:</span>
                      <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-blue-700 text-xs">
                      <span>Nominal Bayar Uji Coba:</span>
                      <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">Rp 1,-</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 pt-1 leading-snug">
                      Buka aplikasi BCA / GoPay / OVO / Dana / ShopeePay, scan barcode di atas dan transfer <strong>Rp 1</strong>. Sistem akan mendeteksi transaksi secara otomatis dan langsung mencetak struk koperasi.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="eco-modal-footer flex items-center justify-between">
              {paymentMethod === 'qris' ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>{processingOrder ? 'Pembayaran Masuk! Memproses...' : 'Menunggu transfer Rp 1 dari HP...'}</span>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-secondary-action">
                  Batal
                </button>

                {paymentMethod === 'cash' && (
                  <button
                    onClick={() => handleCheckout(true)}
                    disabled={processingOrder}
                    className="btn-success-action"
                  >
                    {processingOrder ? 'Memproses...' : 'Pesan Sekarang (Bayar Tunai)'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KASIR POS KOPSIS (STAFF/ADMIN)                          */}
      {/* ============================================================== */}
      {showPOSModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowPOSModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '880px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Mesin Kasir POS Koperasi Siswa</h3>
                  <p className="text-xs text-slate-500">Layanan penjualan perlengkapan sekolah dengan Tunai atau QRIS</p>
                </div>
              </div>
              <button onClick={() => setShowPOSModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>

            <div className="eco-modal-body p-4 sm:p-5 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Kolom Kiri 7/12: Katalog Produk Kopsis POS */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama barang atau SKU..."
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        className="eco-form-input text-xs pl-8 h-8"
                      />
                    </div>
                    <div className="flex gap-1">
                      {['Semua', 'Alat Tulis', 'Seragam', 'Buku'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setPosCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            posCategory === cat
                              ? 'bg-orange-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid Produk POS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {(data?.produk_populer || [])
                      .filter((p) => {
                        const matchCat = posCategory === 'Semua' || p.category.toLowerCase() === posCategory.toLowerCase();
                        const matchQ = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
                        return matchCat && matchQ;
                      })
                      .map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => addToCart(prod)}
                          className="p-2.5 border border-slate-200 rounded-xl text-left bg-white hover:border-orange-400 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                              {prod.sku} • {prod.category}
                            </span>
                            <div className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                              {prod.name}
                            </div>
                          </div>
                          <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="font-extrabold text-xs text-orange-700">
                                Rp {Number(prod.price).toLocaleString('id-ID')}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Stok: {prod.stock}
                              </div>
                            </div>
                            <span className="w-5 h-5 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold group-hover:bg-orange-600 group-hover:text-white transition">
                              +
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Kolom Kanan 5/12: Struk Kasir & Pembayaran */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="space-y-3">
                    {/* Input NISN Pelanggan */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">NISN / Nama Pelanggan</label>
                      <input
                        type="text"
                        value={studentNisn}
                        onChange={(e) => setStudentNisn(e.target.value)}
                        placeholder="Contoh: 0061234567"
                        className="eco-form-input text-xs font-mono h-8 bg-white"
                      />
                    </div>

                    {/* Rincian Pesanan Aktif */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase flex justify-between">
                        <span>Keranjang Belanja ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                        {cart.length > 0 && (
                          <button type="button" onClick={clearCart} className="text-rose-600 hover:underline">
                            Reset
                          </button>
                        )}
                      </div>

                      <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1 bg-white p-2 rounded-xl border border-slate-200">
                        {cart.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            Pilih produk di samping untuk menambahkan ke struk
                          </div>
                        ) : (
                          cart.map((item) => (
                            <div key={item.product_id} className="flex items-center justify-between py-1 text-xs border-b border-slate-100 last:border-0">
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Rp {item.price.toLocaleString('id-ID')}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product_id, -1)}
                                  className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product_id, 1)}
                                  className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                                <span className="font-bold text-xs text-orange-700 ml-1">
                                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.product_id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 ml-0.5"
                                  title="Hapus"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Total Tagihan */}
                    <div className="p-2.5 bg-orange-950 text-white rounded-xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-orange-200">Total Tagihan:</span>
                      <span className="text-lg font-black tracking-tight">Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Pilihan Metode Bayar Kasir */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Metode Pembayaran</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cash')}
                          className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            paymentMethod === 'cash'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <Banknote size={14} /> Tunai
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('qris')}
                          className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            paymentMethod === 'qris'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <QrCode size={14} /> QRIS
                        </button>
                      </div>
                    </div>

                    {/* Jika Tunai: Quick Money & Hitung Kembalian */}
                    {paymentMethod === 'cash' && cartTotal > 0 && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">Uang Diterima:</span>
                          <input
                            type="number"
                            value={cashTendered || ''}
                            onChange={(e) => setCashTendered(Number(e.target.value))}
                            placeholder={String(cartTotal)}
                            className="eco-form-input text-xs font-mono h-7 w-28 text-right bg-slate-50"
                          />
                        </div>
                        <div className="flex gap-1 pt-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setCashTendered(cartTotal)}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                          >
                            Uang Pas
                          </button>
                          {[10000, 20000, 50000, 100000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setCashTendered(amt)}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                            >
                              {amt >= 1000 ? `${amt / 1000}rb` : amt}
                            </button>
                          ))}
                        </div>
                        {cashTendered > 0 && (
                          <div className={`p-1.5 rounded-lg flex items-center justify-between font-bold ${
                            cashTendered >= cartTotal ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                          }`}>
                            <span>{cashTendered >= cartTotal ? 'Kembalian:' : 'Kurang:'}</span>
                            <span>Rp {Math.abs(cashTendered - cartTotal).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Jika QRIS: Preview QRIS Kasir Kopsis & Panduan Rp 1 */}
                    {paymentMethod === 'qris' && cartTotal > 0 && (
                      <div className="p-3 bg-indigo-50/90 rounded-xl border border-indigo-200 text-xs space-y-2 text-center">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-950 text-[11px] truncate max-w-[170px]">{kopsisQris.merchantName}</span>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            Uji Transaksi: Rp 1,-
                          </span>
                        </div>
                        <div className="w-28 h-28 mx-auto bg-white p-1.5 rounded-xl border border-indigo-200 shadow-2xs flex items-center justify-center">
                          <img
                            src={getQRISDisplaySource(kopsisQris, 1).imageSrc}
                            alt="QRIS Kopsis"
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Arahkan pembeli scan barcode ini. Bayar <strong>Rp 1</strong> via BCA / GoPay / Dana dll.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tombol Eksekusi Transaksi POS */}
                  <button
                    type="button"
                    onClick={() => handleCheckout(false)}
                    disabled={processingOrder || cart.length === 0}
                    className="w-full btn-success-action py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {processingOrder
                      ? 'Memproses...'
                      : paymentMethod === 'qris'
                      ? 'Selesaikan Transaksi QRIS (Rp 1 Masuk)'
                      : `Selesaikan Transaksi (Rp ${cartTotal.toLocaleString('id-ID')})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH BARANG BARU (STAFF/ADMIN)                        */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  <PlusCircle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Tambah Barang Koperasi</h3>
                  <p className="text-xs text-slate-500">Daftarkan inventaris ATK, seragam, atau buku baru</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="eco-modal-form">
              <div className="eco-modal-body p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kode SKU / Barcode</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Contoh: ATK-009"
                    required
                    className="eco-form-input text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Barang / Produk</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Buku Tulis Campus 58 Lembar"
                    required
                    className="eco-form-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kategori Barang</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Alat Tulis', 'Seragam', 'Buku', 'Aksesoris', 'Lainnya'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          category === cat
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Harga Satuan (Rp)</label>
                    {price && Number(price) > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Rp {Number(price).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 6500"
                    required
                    min="500"
                    step="500"
                    className="eco-form-input text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Jumlah Stok Fisik</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Contoh: 100"
                    required
                    min="1"
                    className="eco-form-input text-xs font-mono"
                  />
                </div>
              </div>
              <div className="eco-modal-footer p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary-action text-xs">
                  Batal
                </button>
                <button type="submit" className="btn-primary-action text-xs font-bold px-4 py-2">
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QRISUploadModal
        open={showQRISModal}
        onClose={() => {
          setShowQRISModal(false);
          setKopsisQris(getStoredQRIS('kopsis'));
        }}
        type="kopsis"
        onSaved={() => setKopsisQris(getStoredQRIS('kopsis'))}
      />
    </div>
  );
};
