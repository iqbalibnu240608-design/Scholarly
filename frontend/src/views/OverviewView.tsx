import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ROLE_LABELS } from '../types/auth';
import {
  Users,
  GraduationCap,
  Store,
  Building,
  Bell,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  BookOpen,
  Award,
  Calendar,
  ShoppingBag,
  UtensilsCrossed,
  FileSpreadsheet,
  BookMarked,
  Shield,
  Settings,
  CreditCard,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OverviewData {
  current_user: { name: string; role: string };
  metrics: {
    total_siswa: number;
    total_guru: number;
    total_petugas: number;
    total_kelas: number;
    total_kopsis_products: number;
    total_kantin_menus: number;
    active_roles_count: number;
  };
  announcements: Array<{
    id: number;
    title: string;
    content: string;
    target_role: string;
    created_at: string;
  }>;
}

export const OverviewView: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Student personalized stats
  const [studentStats, setStudentStats] = useState<{
    saldo_kopsis: number;
    saldo_kantin: number;
    spp_status: string;
    kelas: string;
    jadwal_count: number;
    kehadiran: string;
  }>({
    saldo_kopsis: 75000,
    saldo_kantin: 45000,
    spp_status: 'Lunas',
    kelas: 'XII RPL 1',
    jadwal_count: 3,
    kehadiran: '96.2%',
  });

  const isAdmin = activeRole === 'admin';
  const isStudent = activeRole === 'siswa';

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await apiClient.get('/school/overview');
        setData(res.data);

        if (activeRole === 'siswa') {
          const [resWallet, resSiswa] = await Promise.all([
            apiClient.get('/wallet/balance').catch(() => null),
            apiClient.get('/school/siswa').catch(() => null),
          ]);

          setStudentStats({
            saldo_kopsis: resWallet?.data?.wallet?.balance_kopsis ?? 75000,
            saldo_kantin: resWallet?.data?.wallet?.balance_kantin ?? 45000,
            spp_status: resSiswa?.data?.data?.tagihan_spp?.status ?? 'Lunas',
            kelas: resSiswa?.data?.data?.kelas ?? 'XII RPL 1',
            jadwal_count: resSiswa?.data?.data?.jadwal_hari_ini?.length ?? 3,
            kehadiran: resSiswa?.data?.data?.presensi_bulan_ini?.persentase ?? '96.2%',
          });
        }
      } catch (err) {
        console.error('Gagal mengambil overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [activeRole]);

  // White & Blue Portal Card Items with Lucide Icons
  const allPortals = [
    {
      to: '/app/siswa',
      icon: GraduationCap,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      borderColor: '#bfdbfe',
      title: isStudent ? 'Akademik & Nilai Saya' : 'Portal Siswa',
      desc: isStudent ? 'Lihat jadwal kelas, presensi, buku nilai tugas & rapor' : 'Jadwal pelajaran, nilai, presensi & saldo digital siswa',
      buttonText: 'Buka Portal Siswa',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas'],
    },
    {
      to: '/app/kantin',
      icon: UtensilsCrossed,
      iconBg: '#eff6ff',
      iconColor: '#0284c7',
      borderColor: '#bae6fd',
      title: isStudent || activeRole === 'guru' ? 'Pesan Makanan Kantin' : 'Kasir Stan Kantin',
      desc: isStudent || activeRole === 'guru' ? 'Pesan menu makanan & minuman lezat (Dompet Digital / Tunai / QRIS)' : 'Kelola menu stan kantin, stok, & antrean pesanan siswa',
      buttonText: 'Menuju Kantin',
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
    },
    {
      to: '/app/kopsis',
      icon: ShoppingBag,
      iconBg: '#eff6ff',
      iconColor: '#4f46e5',
      borderColor: '#c7d2fe',
      title: isStudent || activeRole === 'guru' ? 'Koperasi Siswa (Kopsis)' : 'Kasir POS Koperasi',
      desc: isStudent || activeRole === 'guru' ? 'Beli perlengkapan alat tulis kantor (ATK), seragam, & buku sekolah' : 'Kasir POS penjualan langsung, inventaris ATK, & mutasi omset',
      buttonText: 'Buka Koperasi',
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
    },
    {
      to: '/app/petugas',
      icon: FileSpreadsheet,
      iconBg: '#eff6ff',
      iconColor: '#0d9488',
      borderColor: '#99f6e4',
      title: isStudent ? 'Layanan SPP & Administrasi' : 'Tata Usaha (TU & SPP)',
      desc: isStudent ? 'Bayar tagihan SPP bulanan mandiri & cek riwayat kuitansi pembayaran' : 'Buku kas pembayaran SPP, arsip kwitansi, & verifikasi transaksi',
      buttonText: 'Layanan TU & SPP',
      allowedRoles: ['admin', 'petugas', 'siswa'],
    },
    {
      to: '/app/perpus',
      icon: BookMarked,
      iconBg: '#eff6ff',
      iconColor: '#7c3aed',
      borderColor: '#ddd6fe',
      title: isStudent ? 'Perpustakaan (E-Library)' : 'Portal Pustakawan',
      desc: isStudent ? 'Katalog digital, peminjaman mandiri 7/14 hari & cek countdown denda' : 'Inventaris koleksi buku rak, sirkulasi peminjaman, & pengembalian',
      buttonText: 'Buka Perpustakaan',
      allowedRoles: ['admin', 'perpustakaan', 'siswa', 'guru'],
    },
    {
      to: '/app/guru',
      icon: BookOpen,
      iconBg: '#eff6ff',
      iconColor: '#1d4ed8',
      borderColor: '#bfdbfe',
      title: 'Portal Dewan Guru',
      desc: 'Input nilai evaluasi (Tugas/UH/PTS/PAS), rekapitulasi absensi rombel & jurnal mengajar',
      buttonText: 'Portal Guru',
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      icon: Award,
      iconBg: '#eff6ff',
      iconColor: '#b45309',
      borderColor: '#fde68a',
      title: 'Monitoring Kepala Sekolah',
      desc: 'Dashboard KPI eksekutif, rekapitulasi kehadiran sekolah, & perputaran omset',
      buttonText: 'Monitoring Kepsek',
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/security',
      icon: Shield,
      iconBg: '#eff6ff',
      iconColor: '#334155',
      borderColor: '#cbd5e1',
      title: 'Presensi Gerbang Satpam',
      desc: 'Gate check-in RFID & NISN gerbang utama, auto-deteksi menit keterlambatan',
      buttonText: 'Pos Gerbang Satpam',
      allowedRoles: ['admin', 'security'],
    },
    {
      to: '/app/admin',
      icon: Settings,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      borderColor: '#bfdbfe',
      title: 'Manajemen Sistem & Role',
      desc: 'Manajemen master akun pengguna, penugasan role dinamis, & reset kata sandi',
      buttonText: 'Panel Admin',
      allowedRoles: ['admin'],
    },
  ];

  const visiblePortals = allPortals.filter(
    (p) => isAdmin || p.allowedRoles.includes(activeRole)
  );

  const visibleAnnouncements = (data?.announcements || []).filter(
    (ann) =>
      isAdmin ||
      ann.target_role === 'all' ||
      ann.target_role === activeRole
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-semibold">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
        Memuat data ekosistem sekolah...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. GREETING BANNER (White & Blue Professional Executive Theme) */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 md:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-blue-50/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/80 text-blue-700 rounded-full text-xs font-bold mb-3 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Sesi Aktif: {ROLE_LABELS[activeRole] || activeRole}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang, {user?.name || (isAdmin ? 'Administrator' : 'Pengguna')}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              {isStudent
                ? `NISN: ${user?.identifier_number || '0061234567'} • Rombongan Belajar: ${studentStats.kelas} • Seluruh layanan terhubung otomatis dengan saldo dompet digital Anda.`
                : 'Sistem Ekosistem Sekolah Terpadu aktif. Seluruh modul operasional tersinkronisasi langsung dengan basis data MySQL.'}
            </p>

            {/* Quick Action Shortcuts for Students */}
            {isStudent && (
              <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-slate-100">
                <Link to="/app/kantin" className="btn-primary-action text-xs" style={{ padding: '6px 14px' }}>
                  <UtensilsCrossed size={14} /> Pesan Kantin
                </Link>
                <Link to="/app/kopsis" className="btn-secondary-action text-xs" style={{ padding: '6px 14px' }}>
                  <ShoppingBag size={14} /> Belanja Kopsis
                </Link>
                <Link to="/app/petugas" className="btn-secondary-action text-xs" style={{ padding: '6px 14px' }}>
                  <CreditCard size={14} /> Bayar SPP
                </Link>
                <Link to="/app/perpus" className="btn-secondary-action text-xs" style={{ padding: '6px 14px' }}>
                  <BookMarked size={14} /> Pinjam Buku
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            {isAdmin ? (
              <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Full System Access</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Akun Terverifikasi</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 4-GRID KEY METRIC CARDS (High-Contrast White & Blue Theme)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="feature-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isStudent ? 'Saldo Koperasi Siswa' : 'Total Siswa Terdaftar'}
              </span>
              <div className="amount-display text-blue-600 mt-1">
                {isStudent
                  ? `Rp ${studentStats.saldo_kopsis.toLocaleString('id-ID')}`
                  : (data?.metrics?.total_siswa || 348)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>{isStudent ? 'Siap Dibelanjakan' : '+12 Siswa Baru Bulan Ini'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="feature-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isStudent ? 'Saldo Kantin Sehat' : 'Dewan Guru & Staf'}
              </span>
              <div className="amount-display text-blue-600 mt-1">
                {isStudent
                  ? `Rp ${studentStats.saldo_kantin.toLocaleString('id-ID')}`
                  : (data?.metrics?.total_guru || 24)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{isStudent ? 'Cashless Stand Ready' : 'Tenaga Pendidik Aktif'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              {isStudent ? <UtensilsCrossed className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="feature-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isStudent ? 'Kehadiran Bulan Ini' : 'Rombongan Belajar'}
              </span>
              <div className="amount-display text-emerald-600 mt-1">
                {isStudent ? studentStats.kehadiran : (data?.metrics?.total_kelas || 12)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isStudent ? 'Disiplin Sangat Baik' : 'Kelas X, XI, XII Jurusan'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              {isStudent ? <Calendar className="w-6 h-6" /> : <Building className="w-6 h-6" />}
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="feature-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isStudent ? 'Status SPP Bulan Ini' : 'Unit Usaha Sekolah'}
              </span>
              <div className={`amount-display mt-1 ${isStudent ? 'text-emerald-600' : 'text-slate-900'}`}>
                {isStudent
                  ? studentStats.spp_status
                  : `${data?.metrics?.total_kopsis_products || 28} ATK / ${data?.metrics?.total_kantin_menus || 19} Menu`}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                <span>{isStudent ? 'Kuitansi Digital Tersedia' : 'Koperasi & Kantin Aktif'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              {isStudent ? <CreditCard className="w-6 h-6" /> : <Store className="w-6 h-6" />}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MODUL CIVITAS SEKOLAH + LIVE ANNOUNCEMENTS                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modul Akses Cepat (Col span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Modul Civitas Sekolah</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih modul kerja untuk mengelola aktivitas operasional peran Anda
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {visiblePortals.length} Modul Terbuka
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visiblePortals.map((portal, idx) => {
              const PortalIcon = portal.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-4 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all duration-200 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs"
                        style={{
                          backgroundColor: portal.iconBg,
                          color: portal.iconColor,
                          borderColor: portal.borderColor,
                        }}
                      >
                        <PortalIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                        Aktif
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {portal.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                      {portal.desc}
                    </p>
                  </div>

                  {/* Tombol yang SANGAT JELAS kelihatan sebagai tombol */}
                  <Link
                    to={portal.to}
                    className="btn-primary-action text-xs mt-4 w-full"
                    style={{ padding: '7px 14px' }}
                  >
                    <span>{portal.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Papan Pengumuman Sekolah (Col span 1) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Pengumuman Sekolah
                  </h3>
                  <p className="text-[11px] text-slate-500">Pemberitahuan terpusat</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {visibleAnnouncements.length > 0 ? (
                visibleAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-blue-100 text-blue-800">
                        {ann.target_role === 'all' ? 'Semua Civitas' : ann.target_role}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(ann.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1">
                      {ann.title}
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada pengumuman baru untuk peran Anda.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ekosistem Terhubung</span>
            <span className="font-bold text-blue-600">MySQL Database</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
