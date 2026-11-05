import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  BookOpen,
  BookmarkCheck,
  Clock,
  PlusCircle,
  X,
  CheckCircle,
  Search,
  BookMarked,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import './EcosystemModals.css';

interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  category: string;
  stock: number;
  shelf_location: string;
}

interface BookLoan {
  id: number;
  reference_no: string;
  book_id: number;
  user_id: number;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fine_amount: number;
  book: Book;
  user: {
    id: number;
    name: string;
    identifier_number: string;
  };
}

interface LibraryData {
  metrics: {
    total_judul_buku: number;
    total_eksemplar: number;
    sedang_dipinjam: number;
    terlambat_denda: number;
  };
  katalog_buku: Book[];
  pinjaman_aktif: BookLoan[];
  riwayat_sirkulasi: BookLoan[];
}

export const PerpusView: React.FC = () => {
  const { user, activeRole } = useAuth();
  const isLibrarianView = activeRole === 'perpustakaan' || activeRole === 'admin';

  const [data, setData] = useState<LibraryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modal State: Tambah Buku (Petugas Perpus)
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  const [isbn, setIsbn] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [publisher, setPublisher] = useState<string>('');
  const [category, setCategory] = useState<string>('Pelajaran');
  const [stock, setStock] = useState<string>('5');
  const [shelfLocation, setShelfLocation] = useState<string>('Rak A-1');

  // Modal State: Pinjam Buku (Siswa / Petugas)
  const [showBorrowModal, setShowBorrowModal] = useState<boolean>(false);
  const [selectedBookToBorrow, setSelectedBookToBorrow] = useState<Book | null>(null);
  const [studentNisn, setStudentNisn] = useState<string>(user?.identifier_number || '0061234567');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [processing, setProcessing] = useState<boolean>(false);

  // Feedback State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchLibraryData = useCallback(async () => {
    try {
      const res = await apiClient.get('/school/library');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching library data', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchLibraryData();
      setLoading(false);
    };
    init();
  }, [fetchLibraryData]);

  // Sync NISN when active user changes
  useEffect(() => {
    if (user?.identifier_number) {
      setStudentNisn(user.identifier_number);
    }
  }, [user]);

  // Handle Tambah Buku
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/library/books', {
        isbn,
        title,
        author,
        publisher: publisher || undefined,
        category,
        stock: Number(stock),
        shelf_location: shelfLocation,
      });

      setShowAddBookModal(false);
      setIsbn('');
      setTitle('');
      setAuthor('');
      setPublisher('');
      setStock('5');
      setSuccessMsg(`Buku "${title}" berhasil ditambahkan ke katalog perpustakaan.`);
      await fetchLibraryData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan buku');
    }
  };

  // Handle Pinjam Buku
  const handleBorrowBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookToBorrow) return;

    setProcessing(true);
    try {
      const payloadNisn = !isLibrarianView
        ? user?.identifier_number || '0061234567'
        : studentNisn;

      const res = await apiClient.post('/library/borrow', {
        book_id: selectedBookToBorrow.id,
        student_identifier: payloadNisn,
        duration_days: durationDays,
      });

      setSuccessMsg(res.data.message || 'Peminjaman buku berhasil dicatat.');
      setShowBorrowModal(false);
      setSelectedBookToBorrow(null);
      await fetchLibraryData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses peminjaman buku.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Pengembalian Buku
  const handleReturnBook = async (loanId: number) => {
    if (!confirm('Apakah Anda yakin ingin mengembalikan buku ini ke perpustakaan?')) return;

    try {
      const res = await apiClient.post('/library/return', {
        loan_id: loanId,
      });

      setSuccessMsg(res.data.message || 'Buku berhasil dikembalikan.');
      await fetchLibraryData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengembalikan buku.');
    }
  };

  // Filter Buku berdasarkan search query & kategori
  const filteredBooks = (data?.katalog_buku || []).filter((book) => {
    const matchCategory =
      selectedCategory === 'Semua' ||
      book.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <div className="loading-container">Memuat modul Perpustakaan...</div>;

  return (
    <div className="view-container">
      {successMsg && (
        <div className="feedback-alert mb-4">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAMPILAN 1: SISWA & GURU VIEW (E-LIBRARY KATALOG PINJAM)       */}
      {/* ============================================================== */}
      {!isLibrarianView ? (
        <>
          <div className="wallet-hero-banner" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)' }}>
            <div className="wallet-hero-left">
              <h3>
                <BookOpen size={20} className="text-emerald-400" />
                Perpustakaan Digital Sekolah (E-Library)
              </h3>
              <p>
                Temukan ribuan koleksi buku pelajaran, novel sastra, komik edukasi, dan modul riset resmi sekolah.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="wallet-balance-box">
                <BookmarkCheck size={20} className="text-emerald-300" />
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Pinjaman Aktif Anda
                  </div>
                  <div className="wallet-amount-val" style={{ color: '#34d399' }}>
                    {data?.pinjaman_aktif.length ?? 0} Buku
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Kategori */}
          <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
            <div className="catalog-tabs mb-0" style={{ flex: 1, minWidth: '300px' }}>
              {['Semua', 'Pelajaran', 'Teknologi', 'Fiksi', 'Sastra', 'Komik', 'Referensi'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`catalog-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'Pelajaran' ? '📖 Pelajaran' : cat === 'Teknologi' ? '💻 Teknologi' : cat === 'Fiksi' ? '✨ Fiksi' : cat === 'Komik' ? '🎨 Komik' : cat}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Cari judul, pengarang, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="eco-form-input"
                style={{ paddingLeft: '32px' }}
              />
              <Search size={16} className="text-slate-400" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            </div>
          </div>

          {/* Grid Koleksi Buku */}
          <div className="catalog-grid">
            {filteredBooks.map((book) => {
              const isOutOfStock = book.stock <= 0;
              return (
                <div key={book.id} className="catalog-item-card">
                  <div>
                    <span className="catalog-item-badge">{book.category}</span>
                    <h4 className="catalog-item-name">{book.title}</h4>
                    <p className="catalog-item-meta">
                      Pengarang: <strong>{book.author}</strong>
                      <br />
                      Lokasi: <code>{book.shelf_location}</code> •{' '}
                      <span className={isOutOfStock ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'}>
                        {isOutOfStock ? 'Habis Dipinjam' : `Sisa ${book.stock} unit`}
                      </span>
                    </p>
                  </div>

                  <div className="catalog-item-bottom">
                    <span className="text-xs text-slate-500">ISBN: {book.isbn.slice(-7)}</span>
                    <button
                      onClick={() => {
                        setSelectedBookToBorrow(book);
                        setShowBorrowModal(true);
                      }}
                      disabled={isOutOfStock}
                      className="btn-primary-action"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <BookMarked size={14} /> Pinjam Buku
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TABEL BUKU YANG SEDANG SAYA PINJAM */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>
                <Sparkles size={18} className="inline mr-2 text-emerald-600" />
                Buku yang Sedang Saya Pinjam ({data?.pinjaman_aktif.length ?? 0})
              </h3>
              <span className="badge-pill">Batas Waktu 7 Hari</span>
            </div>
            <div className="table-responsive">
              {!data?.pinjaman_aktif || data.pinjaman_aktif.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Anda sedang tidak meminjam buku perpustakaan.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kode Pinjam</th>
                      <th>Judul Buku</th>
                      <th>Tanggal Pinjam</th>
                      <th>Jatuh Tempo</th>
                      <th>Status Pinjaman</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pinjaman_aktif.map((loan) => (
                      <tr key={loan.id}>
                        <td><strong className="text-emerald-700">{loan.reference_no}</strong></td>
                        <td>
                          <strong>{loan.book?.title}</strong>
                          <div className="text-xs text-slate-500">{loan.book?.author} • {loan.book?.shelf_location}</div>
                        </td>
                        <td>{loan.borrow_date}</td>
                        <td>
                          <strong className={loan.status === 'overdue' ? 'text-red-600' : 'text-slate-800'}>
                            {loan.due_date}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge-pill text-xs font-bold ${loan.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {loan.status === 'overdue' ? 'Terlambat (Denda Aktif)' : 'Sedang Dipinjam'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleReturnBook(loan.id)}
                            className="btn-secondary-action"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            <RotateCcw size={12} /> Kembalikan
                          </button>
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
        /* TAMPILAN 2: PETUGAS PERPUSTAKAAN & ADMIN (SIRKULASI & KATALOG) */
        /* ============================================================== */
        <>
          <div className="view-header">
            <div>
              <h2>📚 Portal Sirkulasi Perpustakaan Sekolah</h2>
              <p>Kelola katalog koleksi buku, sirkulasi peminjaman & pengembalian, serta denda keterlambatan.</p>
            </div>
            <div className="card-header-actions">
              <button onClick={() => setShowAddBookModal(true)} className="btn-secondary-action">
                <PlusCircle size={16} /> Tambah Koleksi Buku Baru
              </button>
            </div>
          </div>

          {/* Metric Cards Petugas Perpustakaan */}
          <div className="grid-cards-3">
            <div className="feature-card highlight-card">
              <div className="card-top-icon text-emerald-600"><BookOpen size={22} /></div>
              <h4>Total Judul Koleksi Buku</h4>
              <div className="amount-display">{data?.metrics.total_judul_buku ?? 0} Judul</div>
              <p className="card-subtext">{data?.metrics.total_eksemplar ?? 0} total eksemplar fisik tersedia</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-indigo-600"><BookmarkCheck size={22} /></div>
              <h4>Buku Sedang Dipinjam</h4>
              <div className="amount-display">{data?.metrics.sedang_dipinjam ?? 0} Buku</div>
              <p className="card-subtext">Dipinjam oleh siswa & tenaga pendidik</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-amber-600"><Clock size={22} /></div>
              <h4>Terlambat / Menunggak Denda</h4>
              <div className="amount-display" style={{ color: '#dc2626' }}>
                {data?.metrics.terlambat_denda ?? 0} Kasus
              </div>
              <p className="card-subtext">Tarif denda keterlambatan: Rp 1.000 / hari</p>
            </div>
          </div>

          {/* TABEL 1: SIRKULASI PEMINJAMAN BUKU AKTIF */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>Daftar Sirkulasi Peminjaman Buku Aktif ({data?.pinjaman_aktif.length ?? 0})</h3>
              <span className="badge-pill bg-emerald-100 text-emerald-800">Operasional Loket</span>
            </div>
            <div className="table-responsive">
              {!data?.pinjaman_aktif || data.pinjaman_aktif.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Tidak ada peminjaman buku aktif saat ini.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kode Pinjam</th>
                      <th>Nama Siswa (Peminjam)</th>
                      <th>Buku yang Dipinjam</th>
                      <th>Tgl Pinjam</th>
                      <th>Jatuh Tempo</th>
                      <th>Status & Denda</th>
                      <th>Aksi Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pinjaman_aktif.map((loan) => (
                      <tr key={loan.id}>
                        <td><strong className="text-emerald-700">{loan.reference_no}</strong></td>
                        <td>
                          <strong>{loan.user?.name}</strong>
                          <div className="text-xs text-slate-500">NISN: {loan.user?.identifier_number}</div>
                        </td>
                        <td>
                          <strong>{loan.book?.title}</strong>
                          <div className="text-xs text-slate-500">Rak: {loan.book?.shelf_location}</div>
                        </td>
                        <td>{loan.borrow_date}</td>
                        <td>
                          <strong className={loan.status === 'overdue' ? 'text-red-600' : 'text-slate-800'}>
                            {loan.due_date}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge-pill text-xs font-bold ${loan.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {loan.status === 'overdue' ? `Terlambat (Denda: Rp ${Number(loan.fine_amount).toLocaleString('id-ID')})` : 'Dipinjam'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleReturnBook(loan.id)}
                            className="btn-success-action"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            <RotateCcw size={12} /> Proses Pengembalian
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* TABEL 2: KATALOG INVENTARIS BUKU PERPUSTAKAAN */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>Inventaris Koleksi Buku Perpustakaan</h3>
              <span className="badge-pill">{data?.katalog_buku.length || 0} Judul Buku</span>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ISBN</th>
                    <th>Judul Buku</th>
                    <th>Pengarang & Penerbit</th>
                    <th>Kategori</th>
                    <th>Stok Fisik</th>
                    <th>Lokasi Rak</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.katalog_buku.map((b) => (
                    <tr key={b.id}>
                      <td><code>{b.isbn}</code></td>
                      <td><strong>{b.title}</strong></td>
                      <td>
                        {b.author}
                        {b.publisher && <div className="text-xs text-slate-500">{b.publisher}</div>}
                      </td>
                      <td><span className="badge-pill text-xs">{b.category}</span></td>
                      <td>
                        <strong className={b.stock > 0 ? 'text-emerald-700' : 'text-red-500'}>
                          {b.stock} unit
                        </strong>
                      </td>
                      <td><code>{b.shelf_location}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH BUKU BARU (PETUGAS PERPUS / ADMIN)               */}
      {/* ============================================================== */}
      {showAddBookModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowAddBookModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><PlusCircle size={18} className="text-emerald-600" /> Tambah Koleksi Buku Perpustakaan</h3>
              <button onClick={() => setShowAddBookModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddBook} className="eco-modal-form">
              <div className="eco-modal-body">
                <div className="eco-form-group">
                  <label className="eco-form-label">Nomor ISBN</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="Contoh: 978-602-123-456-7"
                    required
                    className="eco-form-input"
                  />
                </div>
                <div className="eco-form-group">
                  <label className="eco-form-label">Judul Buku</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Algoritma & Pemrograman Lanjutan"
                    required
                    className="eco-form-input"
                  />
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="eco-form-group">
                    <label className="eco-form-label">Nama Pengarang</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Penulis..."
                      required
                      className="eco-form-input"
                    />
                  </div>
                  <div className="eco-form-group">
                    <label className="eco-form-label">Penerbit</label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="Penerbit..."
                      className="eco-form-input"
                    />
                  </div>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="eco-form-group">
                    <label className="eco-form-label">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="eco-form-input"
                    >
                      <option value="Pelajaran">Pelajaran</option>
                      <option value="Teknologi">Teknologi</option>
                      <option value="Fiksi">Fiksi</option>
                      <option value="Sastra">Sastra</option>
                      <option value="Komik">Komik</option>
                      <option value="Referensi">Referensi</option>
                    </select>
                  </div>
                  <div className="eco-form-group">
                    <label className="eco-form-label">Jumlah Stok</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      min="1"
                      required
                      className="eco-form-input"
                    />
                  </div>
                  <div className="eco-form-group">
                    <label className="eco-form-label">Lokasi Rak</label>
                    <input
                      type="text"
                      value={shelfLocation}
                      onChange={(e) => setShelfLocation(e.target.value)}
                      placeholder="Rak A-1"
                      required
                      className="eco-form-input"
                    />
                  </div>
                </div>
              </div>
              <div className="eco-modal-footer">
                <button type="button" onClick={() => setShowAddBookModal(false)} className="btn-secondary-action">
                  Batal
                </button>
                <button type="submit" className="btn-primary-action">
                  Simpan Buku ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI PINJAM BUKU (SISWA & PETUGAS)                */}
      {/* ============================================================== */}
      {showBorrowModal && selectedBookToBorrow && (
        <div className="eco-modal-backdrop" onClick={() => setShowBorrowModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><BookMarked size={18} className="text-emerald-600" /> Konfirmasi Peminjaman Buku</h3>
              <button onClick={() => setShowBorrowModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleBorrowBook} className="eco-modal-form">
              <div className="eco-modal-body">
                <div className="p-3 bg-slate-50 border rounded text-xs">
                  <div className="font-bold text-sm text-slate-800">{selectedBookToBorrow.title}</div>
                  <div className="text-slate-600 mt-1">Pengarang: {selectedBookToBorrow.author}</div>
                  <div className="text-slate-600">Kategori: {selectedBookToBorrow.category} • Lokasi: <code>{selectedBookToBorrow.shelf_location}</code></div>
                  <div className="text-emerald-700 font-semibold mt-1">Stok Tersedia: {selectedBookToBorrow.stock} eksemplar</div>
                </div>

                {isLibrarianView && (
                  <div className="eco-form-group">
                    <label className="eco-form-label">NISN Siswa Peminjam</label>
                    <input
                      type="text"
                      value={studentNisn}
                      onChange={(e) => setStudentNisn(e.target.value)}
                      placeholder="Masukkan NISN Siswa..."
                      required
                      className="eco-form-input"
                    />
                  </div>
                )}

                <div className="eco-form-group">
                  <label className="eco-form-label">Durasi Peminjaman</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="eco-form-input"
                  >
                    <option value={7}>7 Hari (Standar Siswa)</option>
                    <option value={14}>14 Hari (Dua Minggu)</option>
                    <option value={30}>30 Hari (Khusus Guru / Penelitian)</option>
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200">
                  💡 Buku wajib dikembalikan tepat waktu sebelum tanggal jatuh tempo agar tidak terkena denda keterlambatan Rp 1.000 / hari.
                </div>
              </div>

              <div className="eco-modal-footer">
                <button type="button" onClick={() => setShowBorrowModal(false)} className="btn-secondary-action">
                  Batal
                </button>
                <button type="submit" disabled={processing} className="btn-success-action">
                  {processing ? 'Memproses...' : 'Konfirmasi Pinjam Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
