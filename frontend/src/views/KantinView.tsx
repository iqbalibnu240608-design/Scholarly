import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient, getCachedData } from '../api/client';
import {
  UtensilsCrossed,
  Coffee,
  CheckCircle,
  PlusCircle,
  ShoppingCart,
  X,
  Banknote,
  Receipt,
  QrCode,
  Store,
  Trash2,
  ArrowRight,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { QRISUploadModal } from '../components/common/QRISUploadModal';
import { getStoredQRIS, getQRISDisplaySource } from '../utils/qris';
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
  const { user, activeRole } = useAuth();
  const isCustomerView = activeRole === 'siswa' || activeRole === 'guru' || activeRole === 'kepsek';

  const [data, setData] = useState<KantinData | null>(() => getCachedData('/school/kantin')?.data || null);
  const [recentOrders, setRecentOrders] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/kantin'));

  // Cart & Ordering State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [studentNisn, setStudentNisn] = useState<string>(user?.identifier_number || '0061234567');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('qris');
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);

  // Modal State: Tambah Menu (Staff/Admin)
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Makanan');
  const [price, setPrice] = useState<string>('');
  const [stallName, setStallName] = useState<string>('Stand 1 Bu Titin');
  const [savingMenu, setSavingMenu] = useState<boolean>(false);

  const [showQRISModal, setShowQRISModal] = useState<boolean>(false);
  const [kantinQris, setKantinQris] = useState(() => getStoredQRIS('kantin'));
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [posSearch, setPosSearch] = useState<string>('');
  const [posCategory, setPosCategory] = useState<string>('Semua');
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Modal State: Kasir POS (Staff/Admin)
  const [showPOSModal, setShowPOSModal] = useState<boolean>(false);

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
      const kantinTrx = (res.data.transactions || []).filter(
        (t: any) => t.type === 'purchase_kantin'
      );
      setRecentOrders(kantinTrx.slice(0, 15));
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

    useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchKantinData(), fetchRecentTransactions()]);
      setLoading(false);
    };
    init();
  }, []);

  // Keep NISN in sync when active user switches
  useEffect(() => {
    if (user?.identifier_number) {
      setStudentNisn(user.identifier_number);
    }
  }, [user]);

  // Cart Handlers
  const addToCart = (menu: KantinMenu) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menu_id === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.menu_id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          menu_id: menu.id,
          name: menu.name,
          price: Number(menu.price),
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (menuId: number, delta: number) => {
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

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTotalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  const removeFromCart = (menuId: number) => {
    setCart((prev) => prev.filter((item) => item.menu_id !== menuId));
  };

  // Checkout Handler (Siswa & Kasir)
  const handleCheckout = async (isStudentSelfOrder: boolean = false) => {
    if (cart.length === 0) return;

    

    setProcessingOrder(true);
    try {
      const payloadNisn = isStudentSelfOrder
        ? user?.identifier_number || '0061234567'
        : studentNisn;

      const res = await apiClient.post('/kantin/checkout', {
        items: cart.map((i) => ({ menu_id: i.menu_id, quantity: i.quantity })),
        payment_method: paymentMethod,
        student_identifier: payloadNisn,
      });

      const methodLabel =
        paymentMethod === 'cash'
          ? 'Tunai di Stan (Cash)'
          : 'QRIS / E-Money';

      const instructionText =
        paymentMethod === 'cash'
          ? `Pesanan Diterima! Silakan bayar tunai Rp ${Number(res.data.total_amount).toLocaleString('id-ID')} di stan kantin saat mengambil makanan.`
          : 'Pembayaran QRIS berhasil diverifikasi! Makanan Anda sedang disiapkan di stan.';

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
      await Promise.all([fetchKantinData(), fetchRecentTransactions()]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses pesanan kantin.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Tambah Menu Handler (Staff Kantin / Admin)
  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMenu(true);
    try {
      await apiClient.post('/school/kantin/menus', {
        name,
        category,
        price: Number(price),
        stall_name: stallName,
      });
      setShowAddModal(false);
      setName('');
      setPrice('');
      setSuccessMsg(`Menu "${name}" berhasil ditambahkan ke stan kantin.`);
      await fetchKantinData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan menu');
    } finally {
      setSavingMenu(false);
    }
  };

  // Filter menu berdasarkan kategori
  const filteredMenus = (data?.daftar_menu || []).filter((m) => {
    if (selectedCategory === 'Semua') return true;
    return m.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  if (loading && !data) return <div className="loading-container">Memuat modul Kantin Sekolah...</div>;

  return (
    <div className="view-container">
      {/* Alert Receipt Notifikasi */}
      {lastReceipt && (
        <div className="receipt-alert-box">
          <Receipt size={24} className="receipt-alert-icon" />
          <div className="receipt-alert-content">
            <div className="receipt-alert-title">
              <CheckCircle className="w-4 h-4 text-emerald-600 inline mr-1.5" />
              Struk Pesanan Kantin: {lastReceipt.reference_no}
            </div>
            <div className="receipt-alert-desc">
              Total Pembayaran: <strong>Rp {Number(lastReceipt.total).toLocaleString('id-ID')}</strong> ({lastReceipt.method}) • Pemesan: {lastReceipt.customer}
              {lastReceipt.items && <div className="mt-1 text-xs">Pesanan: {lastReceipt.items}</div>}
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
          <CheckCircle size={18} />
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
                <UtensilsCrossed size={20} className="text-amber-400 shrink-0" />
                <span>Pemesanan Makanan & Minuman (Pembayaran Bisa Lewat QRIS)</span>
              </h3>
            </div>
            
          </div>

          {/* Kategori Filter Tabs */}
          <div className="w-full max-w-full overflow-x-auto pb-2 mb-4 no-scrollbar">
            <div className="catalog-tabs flex items-center gap-2 max-w-full m-0 p-0">
              {['Semua', 'Makanan', 'Minuman', 'Snack'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`catalog-tab-btn shrink-0 ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'Makanan' ? 'Makanan' : cat === 'Minuman' ? 'Minuman' : cat === 'Snack' ? 'Snack' : 'Semua Menu'}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Menu Makanan Kantin */}
          <div className="catalog-grid">
            {filteredMenus.map((menu) => {
              const inCart = cart.find((i) => i.menu_id === menu.id);
              return (
                <div key={menu.id} className="catalog-item-card">
                  <div>
                    <span className="catalog-item-badge">{menu.category}</span>
                    <h4 className="catalog-item-name">{menu.name}</h4>
                    <p className="catalog-item-meta">
                      <Store size={12} className="inline mr-1 text-primary" /> {menu.stall_name} •{' '}
                      <span className={menu.is_available ? 'text-emerald-600 font-semibold' : 'text-red-500'}>
                        {menu.is_available ? 'Tersedia' : 'Habis'}
                      </span>
                    </p>
                  </div>

                  <div className="catalog-item-bottom">
                    <div className="catalog-item-price">
                      Rp {Number(menu.price).toLocaleString('id-ID')}
                    </div>

                    {inCart ? (
                      <div className="pos-qty-controls">
                        <button onClick={() => updateQuantity(menu.id, -1)} className="pos-qty-btn">
                          -
                        </button>
                        <span className="font-bold text-xs">{inCart.quantity}</span>
                        <button onClick={() => updateQuantity(menu.id, 1)} className="pos-qty-btn">
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(menu)}
                        disabled={!menu.is_available}
                        className="btn-primary-action"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <PlusCircle size={14} /> Pesan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Cart Action Button (Squircle with Red Badge) */}
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCartModal(true)}
              aria-label="Lihat Keranjang Pesanan Kantin"
              className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0F172A] shadow-2xl flex items-center justify-center border border-slate-700/60 hover:bg-[#1E293B] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
            >
              <ShoppingCart className="w-7 h-7 text-white stroke-[2.2] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-2 -right-2 min-w-7 h-7 px-1.5 rounded-full bg-red-500 text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-lg ring-2 ring-white animate-in zoom-in-75 duration-200">
                {cartTotalQty}
              </span>
            </button>
          )}

          {/* Riwayat Pesanan Siswa */}
          <div className="overview-card mt-6">
            <div className="card-header flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0">
                  Riwayat Pesanan Kantin Saya
                </h3>
              </div>
              <span className="badge-pill text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
                Terkini
              </span>
            </div>
            <div className="table-responsive">
              {recentOrders.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Belum ada pesanan kantin yang Anda lakukan.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kode Order</th>
                      <th>Keterangan Pesanan</th>
                      <th>Total Biaya</th>
                      <th>Metode</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td><strong className="text-indigo-600">{ord.reference_no}</strong></td>
                        <td>{ord.description}</td>
                        <td><strong>Rp {Number(ord.amount).toLocaleString('id-ID')}</strong></td>
                        <td>
                          <span className="badge-pill text-xs">
                            {ord.payment_method === 'wallet' ? 'Saldo E-Wallet' : ord.payment_method === 'qris' ? 'QRIS' : 'Tunai'}
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
        </>
      ) : (
        /* ============================================================== */
        /* TAMPILAN 2: STAFF KANTIN & ADMIN DASHBOARD                     */
        /* ============================================================== */
        <>
          <div className="view-header">
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UtensilsCrossed size={24} style={{ color: '#356df3' }} /> Pengelola Stan Kantin</h2>
            </div>
            <div className="card-header-actions flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowQRISModal(true)}
                className="btn-secondary-action w-full sm:w-auto justify-center"
                title="Atur QRIS Stan Kantin"
              >
                <QrCode size={16} /> Upload QRIS Stan
              </button>
              <button onClick={() => setShowAddModal(true)} className="btn-secondary-action w-full sm:w-auto justify-center">
                <PlusCircle size={16} /> Tambah Menu Baru
              </button>
              <button onClick={() => setShowPOSModal(true)} className="btn-primary-action w-full sm:w-auto justify-center">
                <ShoppingCart size={16} /> Buka Kasir POS Kantin
              </button>
            </div>
          </div>

          {/* Metric Cards Stand Kantin */}
          <div className="grid-cards-3">
            <div className="feature-card highlight-card">
              <div className="card-top-icon text-cyan-600"><Coffee size={22} /></div>
              <h4>Status Layanan Kantin</h4>
              <div className="badge-status-paid">{data?.status_kantin}</div>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-emerald-600"><UtensilsCrossed size={22} /></div>
              <h4>Total Omset Kasir Hari Ini</h4>
              <div className="amount-display">
                Rp {(data?.omset_hari_ini ?? 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-indigo-600"><CheckCircle size={22} /></div>
              <h4>Total Transaksi Masuk</h4>
              <div className="amount-display">{recentOrders.length} Pesanan</div>
              <p className="card-subtext">{data?.pesanan_aktif ?? 0} pesanan aktif dalam antrean</p>
            </div>
          </div>

          {/* TABEL 1: DAFTAR PESANAN MASUK & RIWAYAT PEMBELIAN DI KANTIN */}
          <div className="overview-card mt-6">
            <div className="card-header flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0">
                  Antrean Pesanan Masuk & Riwayat Pembelian Stan Kantin
                </h3>
              </div>
              <span className="badge-pill bg-indigo-50 text-indigo-700 text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full border border-indigo-200/60">
                {recentOrders.length} Pesanan Tercatat
              </span>
            </div>
            <div className="table-responsive">
              {recentOrders.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Belum ada pesanan yang masuk ke stan kantin hari ini.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kode Order</th>
                      <th>Pemesan / Pelanggan</th>
                      <th>Rincian Pesanan Menu</th>
                      <th>Total Bayar</th>
                      <th>Metode Bayar</th>
                      <th>Waktu Pesanan</th>
                      <th>Status Pesanan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td><strong className="text-indigo-600">{ord.reference_no}</strong></td>
                        <td>
                          <strong>{ord.user?.name || 'Siswa Sekolah'}</strong>
                          {ord.user?.identifier_number && (
                            <div className="text-xs text-slate-500">NISN: {ord.user.identifier_number}</div>
                          )}
                        </td>
                        <td>{ord.description}</td>
                        <td><strong>Rp {Number(ord.amount).toLocaleString('id-ID')}</strong></td>
                        <td>
                          <span className="badge-pill text-xs font-semibold">
                            {ord.payment_method === 'wallet'
                              ? 'Saldo E-Wallet'
                              : ord.payment_method === 'qris'
                              ? 'QRIS'
                              : 'Tunai di Stan'}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(ord.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <span className={`badge-pill text-xs font-bold ${ord.payment_method === 'cash' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {ord.payment_method === 'cash' ? 'Bayar di Stan' : 'Lunas (Siap Saji)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* TABEL 2: DAFTAR MENU STAN */}
          <div className="overview-card mt-6">
            <div className="card-header flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0">
                  Katalog Menu Stan Makanan & Minuman
                </h3>
              </div>
              <span className="badge-pill text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
                {data?.daftar_menu.length || 0} Menu Terdaftar
              </span>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Menu</th>
                    <th>Kategori</th>
                    <th>Stan Penjual</th>
                    <th>Harga Satuan</th>
                    <th>Status Ketersediaan</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.daftar_menu.map((menu) => (
                    <tr key={menu.id}>
                      <td><strong>{menu.name}</strong></td>
                      <td><span className="badge-pill text-xs">{menu.category}</span></td>
                      <td>{menu.stall_name}</td>
                      <td>Rp {Number(menu.price).toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`badge-pill text-xs ${menu.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {menu.is_available ? 'Tersedia' : 'Habis'}
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
      {/* MODAL: KERANJANG PESANAN KANTIN (DAFTAR ITEM DIPESAN)          */}
      {/* ============================================================== */}
      {showCartModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowCartModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Keranjang Pesanan Makanan</h3>
                  <p className="text-xs text-slate-500">Periksa dan atur menu kantin sebelum checkout</p>
                </div>
              </div>
              <button onClick={() => setShowCartModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>

            <div className="eco-modal-body p-4 sm:p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <UtensilsCrossed size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">Keranjang Masih Kosong</p>
                  <p className="text-xs text-slate-400 mt-1">Pilih menu makanan atau minuman favorit Anda dari daftar kantin.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.menu_id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Rp {item.price.toLocaleString('id-ID')} / porsi
                          </div>
                          <div className="text-xs font-bold text-emerald-700 mt-1">
                            Subtotal: Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Qty & Remove Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.menu_id, -1)}
                              className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 transition"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.menu_id, 1)}
                              className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 transition"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.menu_id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus dari keranjang"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ringkasan Total */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Porsi ({cartTotalQty} item):</span>
                      <span className="font-semibold text-slate-800">Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold">
                      <span className="text-slate-900">Total Tagihan:</span>
                      <span className="text-base text-emerald-700">Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="eco-modal-footer flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="btn-secondary-action text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Kosongkan Keranjang
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCartModal(false)}
                  className="btn-secondary-action text-xs"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => {
                    setShowCartModal(false);
                    setShowStudentCheckoutModal(true);
                  }}
                  className="btn-success-action gap-1.5 text-xs font-bold px-4 py-2"
                >
                  <span>Pilih Metode & Checkout</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI CHECKOUT SISWA (DENGAN MULTI-PAYMENT & QRIS)  */}
      {/* ============================================================== */}
      {showStudentCheckoutModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowStudentCheckoutModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Konfirmasi Pembayaran Kantin</h3>
                  <p className="text-xs text-slate-500">Pilih metode pembayaran Tunai di stan atau scan QRIS</p>
                </div>
              </div>
              <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <div className="eco-modal-body p-5 space-y-4">
              {/* Rincian Pesanan */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">Rincian Menu yang Dipesan:</div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.menu_id} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <span>{item.name} <strong className="text-slate-500 font-mono">x{item.quantity}</strong></span>
                      <strong className="text-slate-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</strong>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm font-black pt-2.5 mt-2 border-t border-slate-200">
                  <span className="text-slate-900">Total Tagihan:</span>
                  <span className="text-emerald-700 text-base">Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Pilihan Metode Pembayaran Fleksibel */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Pilih Cara Pembayaran:</label>
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
                    <span className="text-[11px] text-slate-500 mt-0.5">Bayar di Loket Stan</span>
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
                    <span className="text-[11px] text-slate-500 mt-0.5">Scan QRIS Stan</span>
                  </button>
                </div>
              </div>

              {/* Informasi Sesuai Metode yang Dipilih */}
              {paymentMethod === 'cash' && (
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl text-xs border border-emerald-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Banknote size={16} className="text-emerald-700" /> Bayar Tunai di Stan Kantin (Cash)
                  </div>
                  <p className="text-slate-600">
                    Nomor pesanan Anda akan langsung dibuat. Silakan siapkan uang pas sebesar <strong>Rp {cartTotal.toLocaleString('id-ID')}</strong> saat mengambil makanan di stan.
                  </p>
                </div>
              )}

              {paymentMethod === 'qris' && (
                <div className="p-3.5 bg-indigo-50/80 text-indigo-900 rounded-2xl text-xs border border-indigo-200 text-center space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-bold text-[11px] text-indigo-800">QRIS Stan Kantin (Terpisah)</span>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                      Uji Transaksi Riil: Rp 1,-
                    </span>
                  </div>

                  <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-indigo-200 shadow-xs flex items-center justify-center">
                    <img
                      src={getQRISDisplaySource(kantinQris, 1).imageSrc}
                      alt="QRIS Kantin Sekolah"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-indigo-950">{kantinQris.merchantName}</p>
                    <p className="font-mono text-[11px] text-indigo-600 mt-0.5">NMID: {kantinQris.nmid}</p>
                  </div>

                  <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 text-left space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700 text-xs">
                      <span>Total Pesanan Asli:</span>
                      <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-blue-700 text-xs">
                      <span>Nominal Bayar Uji Coba:</span>
                      <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">Rp 1,-</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 pt-1 leading-snug">
                      Buka aplikasi BCA / GoPay / OVO / Dana / ShopeePay, scan barcode di atas dan transfer <strong>Rp 1</strong>. Sistem akan mendeteksi transaksi secara otomatis dan langsung menerbitkan nota pesanan.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="eco-modal-footer p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
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
                <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-secondary-action text-xs">
                  Batal
                </button>

                {paymentMethod === 'cash' && (
                  <button
                    onClick={() => handleCheckout(true)}
                    disabled={processingOrder}
                    className="btn-success-action text-xs font-bold px-4 py-2"
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
      {/* MODAL: KASIR POS STAN KANTIN (STAFF / OPERATOR)                 */}
      {/* ============================================================== */}
      {showPOSModal && (
        <div className="eco-modal-backdrop eco-modal-backdrop--pos" onClick={() => setShowPOSModal(false)}>
          <div className="eco-modal-card eco-modal-card--pos" onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header eco-modal-header--pos bg-slate-50 border-b border-slate-200">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <ShoppingCart size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Mesin Kasir POS Stan Kantin</h3>
                  <p className="text-xs text-slate-500">Layanan pesanan langsung dengan Tunai atau QRIS</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowPOSModal(false)} className="btn-close-modal" aria-label="Tutup kasir POS"><X size={18} /></button>
            </div>

            <div className="eco-modal-body eco-modal-body--pos p-3 sm:p-4 lg:p-5">
              <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                {/* Kolom Kiri 7/12: Katalog Menu POS */}
                <div className="min-w-0 space-y-3 lg:col-span-7">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full min-w-0 sm:flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari menu kantin..."
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        className="eco-form-input min-h-11 w-full pl-9 text-base sm:text-sm"
                      />
                    </div>
                    <div className="grid w-full min-w-0 grid-cols-2 gap-1 sm:flex sm:w-auto sm:flex-wrap sm:justify-end" role="group" aria-label="Filter kategori menu">
                      {['Semua', 'Makanan', 'Minuman', 'Snack'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          aria-pressed={posCategory === cat}
                          onClick={() => setPosCategory(cat)}
                          className={`min-h-10 min-w-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                            posCategory === cat
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid Menu POS */}
                  <div className="grid min-w-0 max-h-[360px] grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3">
                    {(data?.daftar_menu || [])
                      .filter((m) => {
                        const matchCat = posCategory === 'Semua' || m.category.toLowerCase() === posCategory.toLowerCase();
                        const matchQ = m.name.toLowerCase().includes(posSearch.toLowerCase()) || m.stall_name.toLowerCase().includes(posSearch.toLowerCase());
                        return matchCat && matchQ;
                      })
                      .map((menu) => (
                        <button
                          key={menu.id}
                          type="button"
                          onClick={() => addToCart(menu)}
                          className="group flex min-w-0 cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-left transition-all hover:border-indigo-400 hover:shadow-xs"
                        >
                          <div className="min-w-0">
                            <span className="block break-words text-[10px] font-bold uppercase tracking-tight text-slate-500">
                              {menu.category}
                            </span>
                            <div className="line-clamp-2 break-words text-xs font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                              {menu.name}
                            </div>
                          </div>
                          <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                            <span className="font-extrabold text-xs text-indigo-700">
                              Rp {Number(menu.price).toLocaleString('id-ID')}
                            </span>
                            <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
                              +
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Kolom Kanan 5/12: Struk Kasir & Pembayaran */}
                <div className="flex min-w-0 flex-col justify-between space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4 lg:col-span-5">
                  <div className="space-y-3">
                    {/* Input NISN Pelanggan */}
                    <div className="space-y-1">
                      <label htmlFor="kantin-pos-customer" className="text-[11px] font-bold text-slate-700">NISN / Nama Pelanggan</label>
                      <input
                        id="kantin-pos-customer"
                        type="text"
                        value={studentNisn}
                        onChange={(e) => setStudentNisn(e.target.value)}
                        placeholder="Contoh: 0061234567"
                        className="eco-form-input min-h-11 w-full bg-white text-base font-mono sm:text-sm"
                      />
                    </div>

                    {/* Rincian Pesanan Aktif */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between gap-2">
                        <span>Item Pesanan ({cartTotalQty})</span>
                        {cart.length > 0 && (
                          <button type="button" onClick={clearCart} className="min-h-10 shrink-0 px-2 text-rose-600 hover:underline">
                            Reset
                          </button>
                        )}
                      </div>

                      <div className="max-h-[160px] space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                        {cart.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            Pilih menu di samping untuk menambahkan ke struk
                          </div>
                        ) : (
                          cart.map((item) => (
                            <div key={item.menu_id} className="flex min-w-0 flex-col gap-1 border-b border-slate-100 py-2 text-xs last:border-0 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Rp {item.price.toLocaleString('id-ID')}
                                </div>
                              </div>
                              <div className="flex min-w-0 items-center justify-between gap-1 sm:shrink-0 sm:justify-end sm:gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.menu_id, -1)}
                                  aria-label={`Kurangi ${item.name}`}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 sm:h-8 sm:w-8"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.menu_id, 1)}
                                  aria-label={`Tambah ${item.name}`}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 sm:h-8 sm:w-8"
                                >
                                  +
                                </button>
                                <span className="min-w-0 break-all text-right font-bold text-xs text-indigo-700 sm:ml-1">
                                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Total Tagihan */}
                    <div className="flex min-w-0 flex-col items-start gap-1 rounded-xl border border-blue-200 bg-white p-3">
                      <span className="text-xs font-semibold text-slate-600">Total tagihan</span>
                      <span className="w-full break-words text-left text-xl font-extrabold leading-tight tracking-tight text-blue-700 sm:text-2xl">
                        Rp {cartTotal.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Pilihan Metode Bayar Kasir */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Metode Pembayaran</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cash')}
                          className={`min-h-11 min-w-0 rounded-xl border px-2 py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
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
                          className={`min-h-11 min-w-0 rounded-xl border px-2 py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
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
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-slate-700">Uang Diterima:</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={cashTendered || ''}
                            onChange={(e) => setCashTendered(Number(e.target.value))}
                            placeholder={String(cartTotal)}
                            className="eco-form-input min-w-0 flex-1 bg-slate-50 text-right text-xs font-mono sm:flex-none sm:w-28"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setCashTendered(cartTotal)}
                            className="min-h-10 rounded-lg bg-slate-100 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                          >
                            Uang Pas
                          </button>
                          {[10000, 20000, 50000, 100000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setCashTendered(amt)}
                              className="min-h-10 rounded-lg bg-slate-100 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
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
                    {/* Jika QRIS: Preview QRIS Stan Kasir & Panduan Rp 1 */}
                    {paymentMethod === 'qris' && cartTotal > 0 && (
                      <div className="p-3 bg-indigo-50/90 rounded-xl border border-indigo-200 text-xs space-y-2 text-center">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <span className="min-w-0 truncate font-bold text-indigo-950 text-[11px]">{kantinQris.merchantName}</span>
                          <span className="shrink-0 text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            Uji Transaksi: Rp 1,-
                          </span>
                        </div>
                        <div className="w-28 h-28 mx-auto bg-white p-1.5 rounded-xl border border-indigo-200 shadow-2xs flex items-center justify-center">
                          <img
                            src={getQRISDisplaySource(kantinQris, 1).imageSrc}
                            alt="QRIS Kantin"
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
                    className="pos-checkout-button w-full btn-success-action px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
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
      {/* MODAL: TAMBAH MENU BARU (STAFF/ADMIN)                           */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="eco-modal-backdrop eco-modal-backdrop--entry" onClick={() => !savingMenu && setShowAddModal(false)}>
          <div className="eco-modal-card eco-modal-card--entry" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <PlusCircle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Tambah menu</h3>
                </div>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} disabled={savingMenu} className="btn-close-modal" aria-label="Tutup form tambah menu"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateMenu} className="eco-modal-form">
              <div className="eco-modal-body eco-modal-body--entry p-4 sm:p-5">
                <div className="space-y-1.5">
                  <label htmlFor="kantin-menu-name" className="text-xs font-bold text-slate-700">Nama menu</label>
                  <input
                    id="kantin-menu-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Nasi ayam bakar"
                    required
                    className="eco-form-input min-h-11 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700">Kategori</div>
                  <div role="group" aria-label="Kategori menu" className="grid grid-cols-3 gap-2">
                    {['Makanan', 'Minuman', 'Snack'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        aria-pressed={category === cat}
                        onClick={() => setCategory(cat)}
                        className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-bold text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                          category === cat
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
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
                    <label htmlFor="kantin-menu-price" className="text-xs font-bold text-slate-700">Harga (Rp)</label>
                    {price && Number(price) > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Rp {Number(price).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <input
                    id="kantin-menu-price"
                    type="number"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 12000"
                    required
                    min="500"
                    step="500"
                    className="eco-form-input min-h-11 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="kantin-menu-stall" className="text-xs font-bold text-slate-700">Nama stan</label>
                  <input
                    id="kantin-menu-stall"
                    type="text"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    placeholder="Contoh: Stand 1 Bu Titin"
                    required
                    className="eco-form-input min-h-11 text-base sm:text-sm"
                  />
                </div>
              </div>
              <div className="eco-modal-footer eco-modal-footer--entry p-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} disabled={savingMenu} className="btn-secondary-action min-h-11 w-full text-xs sm:w-auto">
                  Batal
                </button>
                <button type="submit" disabled={savingMenu} className="btn-primary-action min-h-11 w-full text-xs font-bold px-4 py-2 sm:w-auto">
                  {savingMenu ? 'Menyimpan...' : 'Simpan menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QRIS Upload Modal (Kantin) */}
      <QRISUploadModal
        open={showQRISModal}
        onClose={() => {
          setShowQRISModal(false);
          setKantinQris(getStoredQRIS('kantin'));
        }}
        type="kantin"
        onSaved={() => setKantinQris(getStoredQRIS('kantin'))}
      />
    </div>
  );
};

export default KantinView;