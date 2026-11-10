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
  Sparkles,
  QrCode,
  Store,
  Trash2,
  ArrowRight,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { QRISUploadModal } from '../components/common/QRISUploadModal';
import { getStoredQRIS } from '../utils/qris';
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
  const isCustomerView = activeRole === 'siswa' || activeRole === 'guru';

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
                  <Sparkles size={14} className="inline mr-1 text-primary" /> {lastReceipt.instructions}
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
                <span>Pemesanan Makanan & Minuman Kantin</span>
              </h3>
              <p>
                Pesan makanan lezat dengan metode pembayaran langsung QRIS Instan atau Tunai di Stan.
              </p>
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

          {/* Sticky Floating Cart Summary Bar */}
          {cart.length > 0 && (
            <div className="cart-floating-bar">
              <div className="cart-floating-info">
                <div className="cart-count-badge">{cartTotalQty}</div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Pesanan Kantin:</div>
                  <div className="cart-total-text">Rp {cartTotal.toLocaleString('id-ID')}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowCartModal(true)}
                  className="btn-secondary-action"
                  style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155', padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShoppingCart size={15} />
                  <span>Lihat Keranjang ({cartTotalQty})</span>
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="btn-secondary-action"
                  style={{ background: '#334155', color: '#ffffff', borderColor: '#475569', padding: '8px 12px' }}
                  title="Kosongkan Keranjang"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentCheckoutModal(true)}
                  className="btn-success-action"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  <span>Checkout (Rp {cartTotal.toLocaleString('id-ID')})</span>
                </button>
              </div>
            </div>
          )}

          {/* Riwayat Pesanan Siswa */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>
                <Sparkles size={18} className="inline mr-2 text-indigo-600" />
                Riwayat Pesanan Kantin Saya
              </h3>
              <span className="badge-pill">Terkini</span>
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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UtensilsCrossed size={24} style={{ color: '#356df3' }} /> Portal Pengelola Stan Kantin</h2>
              <p>Kelola menu makanan harian, pantau antrean pesanan masuk, dan atur QRIS stan Anda.</p>
            </div>
            <div className="card-header-actions">
              <button
                onClick={() => setShowQRISModal(true)}
                className="btn-secondary-action"
                title="Atur QRIS Stan Kantin"
              >
                <QrCode size={16} /> Upload QRIS Stan
              </button>
              <button onClick={() => setShowAddModal(true)} className="btn-secondary-action">
                <PlusCircle size={16} /> Tambah Menu Baru
              </button>
              <button onClick={() => setShowPOSModal(true)} className="btn-primary-action">
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
              <p className="card-subtext">Jam istirahat aktif, melayani pemesanan cashless & tunai</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-emerald-600"><UtensilsCrossed size={22} /></div>
              <h4>Total Omset Kasir Hari Ini</h4>
              <div className="amount-display">
                Rp {(data?.omset_hari_ini ?? 0).toLocaleString('id-ID')}
              </div>
              <p className="card-subtext">Akumulasi seluruh stan makanan & minuman</p>
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
            <div className="card-header">
              <h3>
                <Sparkles size={18} className="inline mr-2 text-indigo-600" />
                Antrean Pesanan Masuk & Riwayat Pembelian Stan Kantin
              </h3>
              <span className="badge-pill bg-indigo-50 text-indigo-700 font-bold">
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
            <div className="card-header">
              <h3>Katalog Menu Stan Makanan & Minuman</h3>
              <span className="badge-pill">{data?.daftar_menu.length || 0} Menu Terdaftar</span>
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
                <div className="p-3.5 bg-indigo-50/80 text-indigo-900 rounded-2xl text-xs border border-indigo-200 text-center space-y-2">
                  <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-indigo-200 shadow-xs flex items-center justify-center">
                    <img
                      src={kantinQris.imageUrl}
                      alt="QRIS Kantin Sekolah"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-indigo-950">{kantinQris.merchantName}</p>
                    <p className="font-mono text-[11px] text-indigo-600 mt-0.5">NMID: {kantinQris.nmid}</p>
                  </div>
                  <p className="text-xs text-slate-600">
                    Scan via mobile banking atau dompet digital (GoPay, OVO, Dana, ShopeePay, BCA, dll).
                  </p>
                </div>
              )}
            </div>

            <div className="eco-modal-footer p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-secondary-action text-xs">
                Batal
              </button>

              <button
                onClick={() => handleCheckout(true)}
                disabled={processingOrder}
                className="btn-success-action text-xs font-bold px-4 py-2"
              >
                {processingOrder
                  ? 'Memproses...'
                  : paymentMethod === 'cash'
                  ? 'Pesan Sekarang (Bayar Tunai)'
                  : 'Konfirmasi Pembayaran QRIS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KASIR POS STAN KANTIN (STAFF / OPERATOR)                 */}
      {/* ============================================================== */}
      {showPOSModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowPOSModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '880px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Mesin Kasir POS Stan Kantin</h3>
                  <p className="text-xs text-slate-500">Layanan pesanan langsung dengan Tunai atau QRIS</p>
                </div>
              </div>
              <button onClick={() => setShowPOSModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>

            <div className="eco-modal-body p-4 sm:p-5 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Kolom Kiri 7/12: Katalog Menu POS */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari menu kantin..."
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        className="eco-form-input text-xs pl-8 h-8"
                      />
                    </div>
                    <div className="flex gap-1">
                      {['Semua', 'Makanan', 'Minuman', 'Snack'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setPosCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
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
                          className="p-2.5 border border-slate-200 rounded-xl text-left bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                              {menu.category}
                            </span>
                            <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
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
                        <span>Item Pesanan ({cartTotalQty})</span>
                        {cart.length > 0 && (
                          <button type="button" onClick={clearCart} className="text-rose-600 hover:underline">
                            Reset
                          </button>
                        )}
                      </div>

                      <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1 bg-white p-2 rounded-xl border border-slate-200">
                        {cart.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            Pilih menu di samping untuk menambahkan ke struk
                          </div>
                        ) : (
                          cart.map((item) => (
                            <div key={item.menu_id} className="flex items-center justify-between py-1 text-xs border-b border-slate-100 last:border-0">
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Rp {item.price.toLocaleString('id-ID')}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.menu_id, -1)}
                                  className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.menu_id, 1)}
                                  className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                                <span className="font-bold text-xs text-indigo-700 ml-1">
                                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Total Tagihan */}
                    <div className="p-2.5 bg-indigo-900 text-white rounded-xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-200">Total Tagihan:</span>
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
                  </div>

                  {/* Tombol Eksekusi Transaksi POS */}
                  <button
                    type="button"
                    onClick={() => handleCheckout(false)}
                    disabled={processingOrder || cart.length === 0}
                    className="w-full btn-success-action py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {processingOrder ? 'Memproses...' : `Selesaikan Transaksi (Rp ${cartTotal.toLocaleString('id-ID')})`}
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
        <div className="eco-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <PlusCircle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Tambah Menu Stan Kantin</h3>
                  <p className="text-xs text-slate-500">Daftarkan menu makanan, minuman, atau camilan baru</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateMenu} className="eco-modal-form">
              <div className="eco-modal-body p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Menu Makanan / Minuman</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Nasi Ayam Bakar Sambal Matah"
                    required
                    className="eco-form-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kategori Menu</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Makanan', 'Minuman', 'Snack'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
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
                    placeholder="Contoh: 12000"
                    required
                    min="500"
                    step="500"
                    className="eco-form-input text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Stan Penjual / Penyedia</label>
                  <input
                    type="text"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    placeholder="Contoh: Stand 1 Bu Titin"
                    required
                    className="eco-form-input text-xs"
                  />
                </div>
              </div>
              <div className="eco-modal-footer p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary-action text-xs">
                  Batal
                </button>
                <button type="submit" className="btn-primary-action text-xs font-bold px-4 py-2">
                  Simpan Menu
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