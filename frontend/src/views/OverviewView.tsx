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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

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

  // Clean NexaAdmin role portal items with Lucide icons (No raw emoji)
  const allPortals = [
    {
      to: '/app/siswa',
      icon: GraduationCap,
      iconBg: '#e0e7ff',
      iconColor: '#356df3',
      title: isStudent ? 'Akademik & Nilai Saya' : 'Portal Siswa',
      desc: isStudent ? 'Lihat jadwal kelas, presensi, buku nilai & rapor' : 'Jadwal pelajaran, nilai, presensi & saldo digital',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas'],
    },
    {
      to: '/app/kantin',
      icon: UtensilsCrossed,
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      title: isStudent || activeRole === 'guru' ? 'Pesan Kantin Sekolah' : 'Kasir Kantin Sekolah',
      desc: isStudent || activeRole === 'guru' ? 'Pesan menu makanan & minuman secara cashless' : 'Kasir POS stan kantin & kelola menu makanan',
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
    },
    {
      to: '/app/kopsis',
      icon: ShoppingBag,
      iconBg: '#fce7f3',
      iconColor: '#db2777',
      title: isStudent || activeRole === 'guru' ? 'Belanja Koperasi (Kopsis)' : 'Kasir Koperasi (Kopsis)',
      desc: isStudent || activeRole === 'guru' ? 'Beli alat tulis, seragam, & buku pelajaran sekolah' : 'Kasir POS koperasi, stok ATK & seragam sekolah',
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
    },
    {
      to: '/app/petugas',
      icon: FileSpreadsheet,
      iconBg: '#d1fae5',
      iconColor: '#059669',
      title: isStudent ? 'Layanan SPP & Administrasi' : 'Portal Tata Usaha (TU)',
      desc: isStudent ? 'Bayar tagihan SPP bulanan mandiri & cek riwayat kuitansi' : 'Buku induk, verifikasi pembayaran SPP & top-up wallet',
      allowedRoles: ['admin', 'petugas', 'siswa'],
    },
    {
      to: '/app/perpus',
      icon: BookMarked,
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
      title: isStudent ? 'Perpustakaan (E-Library)' : 'Portal Perpustakaan',
      desc: isStudent ? 'Pinjam buku pelajaran, modul, sastra & referensi' : 'Katalog inventaris buku & sirkulasi peminjaman',
      allowedRoles: ['admin', 'perpustakaan', 'siswa', 'guru'],
    },
    {
      to: '/app/guru',
      icon: BookOpen,
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
      title: 'Portal Dewan Guru',
      desc: 'Input nilai evaluasi (Tugas/UTS/UAS), absensi kelas & jurnal pengajaran',
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      icon: Award,
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      title: 'Monitoring Kepala Sekolah',
      desc: 'Monitoring eksekutif KPI, akreditasi & perputaran omset unit usaha',
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/security',
      icon: Shield,
      iconBg: '#e0e7ff',
      iconColor: '#4338ca',
      title: 'Presensi Gerbang Satpam',
      desc: 'Gate check-in RFID gerbang sekolah, auto-kalkulasi menit keterlambatan',
      allowedRoles: ['admin', 'security'],
    },
    {
      to: '/app/admin',
      icon: Settings,
      iconBg: '#ede9fe',
      iconColor: '#6366f1',
      title: 'Manajemen Sistem & Role',
      desc: 'Kelola akun pengguna, reset sandi & konfigurasi hak akses RBAC',
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
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat data ekosistem sekolah...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Greeting Banner (Flowize AI Style: Soft lavender gradient, rounded-3xl) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/40 border border-indigo-100/80 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/80 text-blue-700 rounded-full text-xs font-bold mb-3">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sesi Aktif: {ROLE_LABELS[activeRole] || activeRole}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang, {user?.name || (isAdmin ? 'Administrator' : 'Pengguna')}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              {isStudent
                ? `NISN: ${user?.identifier_number || '0061234567'} • Rombel Kelas: ${studentStats.kelas}`
                : 'Ekosistem Sekolah Terpadu berjalan lancar dan terintegrasi secara real-time.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Badge variant="success" className="px-3.5 py-1.5 text-xs font-bold gap-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                <span>Full Admin Access</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-full bg-white text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Status Terverifikasi</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* NexaAdmin 4-Grid Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="border-slate-200/80 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isStudent ? 'Saldo Koperasi Siswa' : 'Total Siswa Terdaftar'}
              </span>
              <span className="text-2xl font-black text-slate-900 tracking-tight mt-1.5 block">
                {isStudent
                  ? `Rp ${studentStats.saldo_kopsis.toLocaleString('id-ID')}`
                  : (data?.metrics?.total_siswa || 348)}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{isStudent ? 'Siap Dibelanjakan' : '+12 Siswa Baru'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-slate-200/80 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isStudent ? 'Saldo Kantin Sehat' : 'Dewan Guru & Staf'}
              </span>
              <span className="text-2xl font-black text-slate-900 tracking-tight mt-1.5 block">
                {isStudent
                  ? `Rp ${studentStats.saldo_kantin.toLocaleString('id-ID')}`
                  : (data?.metrics?.total_guru || 24)}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-indigo-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isStudent ? 'Bebas Tunai' : 'Aktif Mengajar'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              {isStudent ? <UtensilsCrossed className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-slate-200/80 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isStudent ? 'Kehadiran Bulan Ini' : 'Rombongan Belajar'}
              </span>
              <span className="text-2xl font-black text-slate-900 tracking-tight mt-1.5 block">
                {isStudent ? studentStats.kehadiran : (data?.metrics?.total_kelas || 12)}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isStudent ? 'Disiplin Tinggi' : 'Kelas X, XI, XII'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              {isStudent ? <Calendar className="w-6 h-6" /> : <Building className="w-6 h-6" />}
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="border-slate-200/80 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isStudent ? 'Status SPP Bulan Ini' : 'Unit Usaha Sekolah'}
              </span>
              <span className={`text-2xl font-black tracking-tight mt-1.5 block ${isStudent ? 'text-emerald-600' : 'text-slate-900'}`}>
                {isStudent
                  ? studentStats.spp_status
                  : `${data?.metrics?.total_kopsis_products || 28} ATK / ${data?.metrics?.total_kantin_menus || 19} Menu`}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isStudent ? 'Kuitansi Digital' : 'Kopsis & Kantin'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              {isStudent ? <CreditCard className="w-6 h-6" /> : <Store className="w-6 h-6" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Modul Civitas (NexaAdmin) + Papan Pengumuman (Flowize AI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modul Akses Cepat (Col span 2) */}
        <Card className="lg:col-span-2 border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base md:text-lg font-bold text-slate-900">
                Modul Civitas Sekolah
              </CardTitle>
              <CardDescription className="text-xs">
                Pilih modul untuk mengelola operasional peran Anda
              </CardDescription>
            </div>
            <Badge variant="primary" className="text-xs font-bold rounded-full">
              {visiblePortals.length} Modul Tersedia
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {visiblePortals.map((portal, idx) => {
                const PortalIcon = portal.icon;
                return (
                  <Link
                    key={idx}
                    to={portal.to}
                    className="group flex flex-col justify-between p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: portal.iconBg,
                          color: portal.iconColor,
                        }}
                      >
                        <PortalIcon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {portal.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {portal.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-3 pt-2 border-t border-slate-100 group-hover:translate-x-1 transition-transform">
                      <span>Buka Modul</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Papan Pengumuman Sekolah (Col span 1) */}
        <Card className="border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Pengumuman Sekolah
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-[11px] font-mono">
              Live Feed
            </Badge>
          </CardHeader>

          <CardContent className="space-y-3">
            {visibleAnnouncements.length > 0 ? (
              visibleAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="primary" className="text-[10px] uppercase font-bold py-0.5">
                      {ann.target_role === 'all' ? 'Semua Civitas' : ann.target_role}
                    </Badge>
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
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada pengumuman baru untuk peran Anda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewView;
