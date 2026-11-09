import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient, getCachedData } from '../api/client';
import {
  UtensilsCrossed,
  Coffee,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ShoppingCart,
  X,
  CreditCard,
  Banknote,
  Receipt,
  Wallet,
  Sparkles,
  QrCode,
  Store,
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
  const { user, activeRole } = useAuth();
  const isCustomerView = activeRole === 'siswa' || activeRole === 'guru';

  const [data, setData] = useState<KantinData | null>(() => getCachedData('/school/kantin')?.data || null);
  const [recentOrders, setRecentOrders] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/kantin'));

  // Student Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<number>(20000);
  const [topupSubmitting, setTopupSubmitting] = useState<boolean>(false);

  // Cart & Ordering State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [studentNisn, setStudentNisn] = useState<string>(user?.identifier_number || '0061234567');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash' | 'qris'>('qris');
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);

  // Modal State: Tambah Menu (Staff/Admin)
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Makanan');
  const [price, setPrice] = useState<string>('');
  const [stallName, setStallName] = useState<string>('Stand 1 Bu Titin');

  // Modal State: Pengaturan / Upload QRIS Stan (Staff Kantin)
  const [showQrisSettingsModal, setShowQrisSettingsModal] = useState<boolean>(false);
  const [qrisStallName, setQrisStallName] = useState<string>(() => {
    return localStorage.getItem('kantin_qris_stall') || 'Kantin Sehat Bu Titin - Stand 1';
  });
  const [qrisImage, setQrisImage] = useState<string>(() => {
    return localStorage.getItem('kantin_qris_image') || '';
  });

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

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await apiClient.get('/wallet/balance');
      if (res.data?.wallet) {
        setWalletBalance(Number(res.data.wallet.balance ?? res.data.wallet.balance_kantin) || 0);
      }
    } catch (err) {
      console.error('Error fetching wallet balance', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchKantinData(), fetchRecentTransactions(), fetchWalletBalance()]);
      setLoading(false);
    };
    init();
  }, [fetchWalletBalance]);

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

  // Top Up Handler
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupSubmitting(true);
    try {
      const targetNisn = user?.identifier_number || '0061234567';
      await apiClient.post('/wallet/topup', {
        identifier_number: targetNisn,
        amount: topupAmount,
        target_wallet: 'universal',
        notes: 'Top-up mandiri via simulasi e-wallet siswa',
      });
      await fetchWalletBalance();
      setShowTopupModal(false);
      setSuccessMsg(`Top-up sebesar Rp ${topupAmount.toLocaleString('id-ID')} berhasil ditambahkan ke Saldo Kantin!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal melakukan top-up');
    } finally {
      setTopupSubmitting(false);
    }
  };

  // Save QRIS Settings
  const handleSaveQrisSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kantin_qris_stall', qrisStallName);
    localStorage.setItem('kantin_qris_image', qrisImage);
    setShowQrisSettingsModal(false);
    setSuccessMsg('Pengaturan & Gambar QRIS Stan Kantin berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleQrisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrisImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Checkout Handler (Siswa & Kasir)
  const handleCheckout = async (isStudentSelfOrder: boolean = false) => {
    if (cart.length === 0) return;

    if (paymentMethod === 'wallet' && walletBalance < cartTotal) {
      alert('Saldo E-Wallet Anda tidak mencukupi. Silakan lakukan Top Up atau gunakan opsi Bayar Tunai di Stan / QRIS.');
      return;
    }

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
        paymentMethod === 'wallet'
          ? 'Saldo Digital E-Wallet (Cashless)'
          : paymentMethod === 'cash'
          ? 'Tunai di Stan (Cash)'
          : 'QRIS / E-Money';

      const instructionText =
        paymentMethod === 'cash'
          ? `Pesanan Diterima! Silakan bayar tunai Rp ${Number(res.data.total_amount).toLocaleString('id-ID')} di stan kantin saat mengambil makanan.`
          : paymentMethod === 'qris'
          ? 'Pembayaran QRIS berhasil diverifikasi! Makanan Anda sedang disiapkan di stan.'
          : 'Pembayaran berhasil dipotong dari Saldo Digital E-Wallet. Tunjukkan nomor pesanan untuk mengambil makanan.';

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
      await Promise.all([fetchKantinData(), fetchRecentTransactions(), fetchWalletBalance()]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pesanan kantin.');
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
      alert(err.response?.data?.message || 'Gagal menambahkan menu');
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
                Pesan makanan lezat dengan berbagai metode pembayaran: Saldo Digital E-Wallet, Tunai di Stan, atau QRIS.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="wallet-balance-box w-full sm:w-auto flex-1">
                <Wallet size={20} className="text-sky-300 shrink-0" />
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Saldo Digital E-Wallet Anda
                  </div>
                  <div className="wallet-amount-val">
                    Rp {Math.round(Number(walletBalance || 0)).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTopupModal(true)}
                className="btn-success-action w-full sm:w-auto justify-center"
                style={{ padding: '10px 16px', fontSize: '13px' }}
              >
                <PlusCircle size={16} /> Isi Saldo
              </button>
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
                  <ShoppingCart size={16} /> Pilih Pembayaran & Checkout (Rp {cartTotal.toLocaleString('id-ID')})
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
                onClick={() => setShowQrisSettingsModal(true)}
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
      {/* MODAL: PENGATURAN / UPLOAD QRIS STAN (STAFF KANTIN)             */}
      {/* ============================================================== */}
      {showQrisSettingsModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowQrisSettingsModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><QrCode size={18} className="text-indigo-600" /> Pengaturan QRIS Stan Kantin</h3>
              <button onClick={() => setShowQrisSettingsModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveQrisSettings} className="eco-modal-form">
              <div className="eco-modal-body">
                <div className="eco-form-group">
                  <label className="eco-form-label">Nama Stan Kantin (Merchant Name)</label>
                  <input
                    type="text"
                    value={qrisStallName}
                    onChange={(e) => setQrisStallName(e.target.value)}
                    placeholder="Contoh: Kantin Sehat Bu Titin - Stand 1"
                    required
                    className="eco-form-input"
                  />
                </div>

                <div className="eco-form-group">
                  <label className="eco-form-label">Upload Gambar Barcode QRIS Stan</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrisFileChange}
                      className="eco-form-input text-xs"
                    />
                    <span className="text-xs text-slate-500">Atau masukkan URL gambar barcode QRIS:</span>
                    <input
                      type="url"
                      value={qrisImage}
                      onChange={(e) => setQrisImage(e.target.value)}
                      placeholder="https://... atau biarkan kosong untuk barcode standar"
                      className="eco-form-input text-xs"
                    />
                  </div>
                </div>

                {/* Preview QRIS */}
                <div className="p-3 bg-slate-50 border rounded text-center">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Preview QRIS yang Dilihat Siswa:</div>
                  {qrisImage ? (
                    <img
                      src={qrisImage}
                      alt="QRIS Stan Preview"
                      style={{ maxWidth: '160px', maxHeight: '160px', margin: '0 auto', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  ) : (
                    <div style={{ padding: '16px', background: '#ffffff', display: 'inline-block', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <QrCode size={120} className="text-indigo-700" />
                    </div>
                  )}
                  <div className="mt-2 font-bold text-xs text-slate-800">{qrisStallName}</div>
                  <div className="text-xs text-slate-500">NMID: ID1029384756910 • A.N {qrisStallName}</div>
                </div>
              </div>

              <div className="eco-modal-footer">
                <button type="button" onClick={() => setShowQrisSettingsModal(false)} className="btn-secondary-action">
                  Batal
                </button>
                <button type="submit" className="btn-success-action">
                  Simpan Pengaturan QRIS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TOP-UP SALDO KANTIN SISWA                                */}
      {/* ============================================================== */}
      {showTopupModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowTopupModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><Wallet size={18} className="text-sky-500" /> Isi Saldo Digital E-Wallet</h3>
              <button onClick={() => setShowTopupModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleTopup} className="eco-modal-form">
              <div className="eco-modal-body">
                <p className="text-xs text-slate-600">
                  Pilih nominal saldo yang ingin Anda tambahkan ke Saldo Digital E-Wallet (Universal):
                </p>
                <div className="topup-grid">
                  {[10000, 20000, 50000, 100000, 150000, 200000].map((amt) => (
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
                <div className="mt-4 p-3 bg-sky-50 rounded text-xs text-sky-800 border border-sky-200">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} style={{ color: '#0284c7' }} /> Saldo ini langsung dapat dipakai untuk checkout pesanan makanan tanpa uang tunai.</span>
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
      {/* MODAL: KONFIRMASI CHECKOUT SISWA (DENGAN MULTI-PAYMENT & QRIS)  */}
      {/* ============================================================== */}
      {showStudentCheckoutModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowStudentCheckoutModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><ShoppingCart size={18} className="text-emerald-600" /> Konfirmasi & Metode Pembayaran</h3>
              <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <div className="eco-modal-body">
              {/* Rincian Pesanan */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold mb-2 uppercase">Rincian Item:</div>
                {cart.map((item) => (
                  <div key={item.menu_id} className="flex justify-between text-xs py-1 border-b border-slate-200">
                    <span>{item.name} x{item.quantity}</span>
                    <strong>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</strong>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 mt-1">
                  <span>Total Tagihan:</span>
                  <span className="text-indigo-600">Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Pilihan Metode Pembayaran Fleksibel */}
              <div className="eco-form-group">
                <label className="eco-form-label font-bold">Pilih Cara Pembayaran:</label>
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`payment-method-btn flex-col items-center justify-center p-3 text-center ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                  >
                    <CreditCard size={20} className="mb-1 text-sky-600" />
                    <span className="font-bold text-xs">Saldo E-Wallet</span>
                    <span className="text-xs text-slate-500 mt-1">Rp {walletBalance.toLocaleString('id-ID')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`payment-method-btn flex-col items-center justify-center p-3 text-center ${paymentMethod === 'cash' ? 'selected' : ''}`}
                  >
                    <Banknote size={20} className="mb-1 text-emerald-600" />
                    <span className="font-bold text-xs">Bayar Tunai</span>
                    <span className="text-xs text-slate-500 mt-1">Bayar di Stan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`payment-method-btn flex-col items-center justify-center p-3 text-center ${paymentMethod === 'qris' ? 'selected' : ''}`}
                  >
                    <QrCode size={20} className="mb-1 text-indigo-600" />
                    <span className="font-bold text-xs">QRIS Instan</span>
                    <span className="text-xs text-slate-500 mt-1">Scan QR Stan</span>
                  </button>
                </div>
              </div>

              {/* Informasi Sesuai Metode yang Dipilih */}
              {paymentMethod === 'wallet' && (
                <div className="p-3 rounded border border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span>Saldo E-Wallet Saat Ini:</span>
                    <strong>Rp {walletBalance.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Sisa Saldo Setelah Pembayaran:</span>
                    <strong className={walletBalance >= cartTotal ? 'text-emerald-600' : 'text-red-500'}>
                      Rp {(walletBalance - cartTotal).toLocaleString('id-ID')}
                    </strong>
                  </div>

                  {walletBalance < cartTotal && (
                    <div className="mt-3 p-2 bg-amber-50 text-amber-800 rounded border border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600 inline mr-1.5" />
                      Saldo E-Wallet Anda kurang. Anda bisa <strong>Isi Saldo</strong> atau cukup klik opsi <strong>Bayar Tunai</strong> di atas!
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded text-xs border border-emerald-200">
                  <Banknote size={16} className="inline mr-1 text-primary" /> <strong>Bayar Tunai di Stan:</strong> Nomor pesanan akan langsung dibuat. Bawa uang pas sebesar <strong>Rp {cartTotal.toLocaleString('id-ID')}</strong> saat mengambil makanan di stan.
                </div>
              )}

              {paymentMethod === 'qris' && (
                <div className="p-3 bg-indigo-50 text-indigo-800 rounded text-xs border border-indigo-200 text-center">
                  <div className="text-xs font-semibold text-indigo-900 mb-2">Scan QRIS Stan untuk Bayar:</div>
                  {qrisImage ? (
                    <img
                      src={qrisImage}
                      alt="QRIS Stan Kantin"
                      style={{ maxWidth: '140px', maxHeight: '140px', margin: '0 auto 8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  ) : (
                    <div style={{ padding: '12px', background: '#ffffff', display: 'inline-block', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
                      <QrCode size={100} className="text-indigo-700" />
                    </div>
                  )}
                  <p className="font-bold text-xs text-indigo-950">{qrisStallName}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Nominal: <strong>Rp {cartTotal.toLocaleString('id-ID')}</strong> • Mendukung GoPay, OVO, Dana, ShopeePay & BCA.
                  </p>
                </div>
              )}
            </div>

            <div className="eco-modal-footer">
              <button onClick={() => setShowStudentCheckoutModal(false)} className="btn-secondary-action">
                Batal
              </button>

              {paymentMethod === 'wallet' && walletBalance < cartTotal ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentCheckoutModal(false);
                    setShowTopupModal(true);
                  }}
                  className="btn-primary-action"
                >
                  Isi Saldo Cepat
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(true)}
                  disabled={processingOrder}
                  className="btn-success-action"
                >
                  {processingOrder
                    ? 'Memproses...'
                    : paymentMethod === 'cash'
                    ? 'Pesan Sekarang (Bayar Tunai)'
                    : paymentMethod === 'qris'
                    ? 'Konfirmasi Pembayaran QRIS'
                    : 'Bayar via Saldo E-Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KASIR POS KANTIN (STAFF/ADMIN)                           */}
      {/* ============================================================== */}
      {showPOSModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowPOSModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><ShoppingCart size={18} className="text-indigo-600" /> Kasir POS Stan Kantin</h3>
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
                <label className="eco-form-label">Pilih Menu untuk Ditambahkan ke Pesanan</label>
                <div className="catalog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                  {data?.daftar_menu.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => addToCart(menu)}
                      className="p-2 border rounded text-left hover:bg-slate-50 transition"
                    >
                      <div className="font-bold text-xs">{menu.name}</div>
                      <div className="text-xs text-indigo-600 font-semibold">Rp {Number(menu.price).toLocaleString('id-ID')}</div>
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
                        <tr key={item.menu_id}>
                          <td>{item.name}</td>
                          <td>
                            <div className="pos-qty-controls">
                              <button onClick={() => updateQuantity(item.menu_id, -1)} className="pos-qty-btn">-</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.menu_id, 1)} className="pos-qty-btn">+</button>
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
                <label className="eco-form-label">Metode Pembayaran Kasir</label>
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
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`payment-method-btn ${paymentMethod === 'qris' ? 'selected' : ''}`}
                  >
                    <QrCode size={16} /> QRIS
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
                {processingOrder ? 'Memproses...' : `Selesaikan Pesanan (Rp ${cartTotal.toLocaleString('id-ID')})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH MENU BARU (STAFF/ADMIN)                           */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><PlusCircle size={18} className="text-indigo-600" /> Tambah Menu Stan Kantin</h3>
              <button onClick={() => setShowAddModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateMenu} className="eco-modal-form">
              <div className="eco-modal-body">
                <div className="eco-form-group">
                  <label className="eco-form-label">Nama Menu</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Nasi Goreng Spesial"
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
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div className="eco-form-group">
                  <label className="eco-form-label">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 12000"
                    required
                    className="eco-form-input"
                  />
                </div>
                <div className="eco-form-group">
                  <label className="eco-form-label">Stan Penjual</label>
                  <input
                    type="text"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    placeholder="Contoh: Stand 1 Bu Titin"
                    required
                    className="eco-form-input"
                  />
                </div>
              </div>
              <div className="eco-modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary-action">Batal</button>
                <button type="submit" className="btn-primary-action">Simpan Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

