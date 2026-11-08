import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import {
  BookOpen,
  BookmarkCheck,
  Clock,
  PlusCircle,
  Search,
  BookMarked,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';

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

  const fetchLibraryData = useCallback(async () => {
    try {
      const res = await apiClient.get('/school/library');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching library data', err);
      toast.error('Gagal memuat katalog perpustakaan');
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
      toast.success(`Buku "${title}" berhasil ditambahkan ke katalog.`);
      await fetchLibraryData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan buku');
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

      toast.success(res.data.message || 'Peminjaman buku berhasil dicatat.');
      setShowBorrowModal(false);
      setSelectedBookToBorrow(null);
      await fetchLibraryData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses peminjaman buku.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Pengembalian Buku
  const handleReturnBook = async (loanId: number) => {
    try {
      const res = await apiClient.post('/library/return', {
        loan_id: loanId,
      });

      toast.success(res.data.message || 'Buku berhasil dikembalikan.');
      await fetchLibraryData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengembalikan buku.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Perpustakaan...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* TAMPILAN 1: SISWA & GURU VIEW (E-LIBRARY KATALOG PINJAM) */}
      {!isLibrarianView ? (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 md:p-8 border border-emerald-900/50 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[11px] font-bold mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Perpustakaan Digital Sekolah</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  E-Library & Katalog Sirkulasi Buku
                </h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Temukan ribuan koleksi buku pelajaran kejuruan, modul kurikulum merdeka, sastra, dan referensi akademik.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10">
                <BookmarkCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="text-[11px] text-slate-300 uppercase font-bold tracking-wider">
                    Pinjaman Aktif Anda
                  </div>
                  <div className="text-xl font-black text-emerald-300">
                    {data?.pinjaman_aktif.length ?? 0} Buku
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Kategori */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {['Semua', 'Pelajaran', 'Teknologi', 'Fiksi', 'Sastra', 'Komik', 'Referensi'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari judul, pengarang, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Grid Koleksi Buku */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => {
              const isOutOfStock = book.stock <= 0;
              return (
                <Card
                  key={book.id}
                  className="flex flex-col justify-between border-slate-200/80 hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Badge variant="primary" className="text-[10px] uppercase font-bold">
                        {book.category}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400">
                        {book.shelf_location}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {book.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      Pengarang: <strong className="text-slate-700">{book.author}</strong>
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          ISBN: {book.isbn.slice(-7)}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isOutOfStock ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {isOutOfStock ? 'Habis Dipinjam' : `Sisa ${book.stock} unit`}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedBookToBorrow(book);
                          setShowBorrowModal(true);
                        }}
                        disabled={isOutOfStock}
                        className="gap-1.5 text-xs rounded-xl"
                      >
                        <BookMarked className="w-3.5 h-3.5" />
                        <span>Pinjam</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* TABEL BUKU YANG SEDANG SAYA PINJAM */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Buku yang Sedang Saya Pinjam ({data?.pinjaman_aktif.length ?? 0})
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                Batas Waktu: 7 Hari
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {!data?.pinjaman_aktif || data.pinjaman_aktif.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Anda sedang tidak meminjam buku perpustakaan.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Pinjam</TableHead>
                      <TableHead>Judul Buku</TableHead>
                      <TableHead>Tanggal Pinjam</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead>Status Pinjaman</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pinjaman_aktif.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-mono text-xs font-bold text-emerald-700">
                          {loan.reference_no}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900 text-sm">
                            {loan.book?.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            {loan.book?.author} • {loan.book?.shelf_location}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {loan.borrow_date}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-bold ${
                              loan.status === 'overdue' ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            {loan.due_date}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={loan.status === 'overdue' ? 'destructive' : 'success'}
                            className="text-xs"
                          >
                            {loan.status === 'overdue' ? 'Terlambat (Denda Aktif)' : 'Sedang Dipinjam'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReturnBook(loan.id)}
                            className="gap-1 text-xs rounded-xl"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Kembalikan</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* TAMPILAN 2: PETUGAS PERPUSTAKAAN & ADMIN (SIRKULASI & KATALOG) */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <BookMarked className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="primary" className="text-xs">
                    Sirkulasi & E-Library
                  </Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Portal Sirkulasi Perpustakaan Sekolah
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Kelola katalog inventaris buku, peminjaman & pengembalian, serta denda keterlambatan.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowAddBookModal(true)}
              className="shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Koleksi Buku</span>
            </Button>
          </div>

          {/* Metric Cards Petugas Perpustakaan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-100/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Judul Buku
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {data?.metrics.total_judul_buku ?? 0} Judul
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {data?.metrics.total_eksemplar ?? 0} total eksemplar fisik tersedia
                </p>
              </CardContent>
            </Card>

            <Card className="border-indigo-100/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Buku Sedang Dipinjam
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {data?.metrics.sedang_dipinjam ?? 0} Buku
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dipinjam oleh siswa dan tenaga pendidik
                </p>
              </CardContent>
            </Card>

            <Card className="border-rose-100/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Terlambat & Denda Aktif
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-rose-600 tracking-tight">
                  {data?.metrics.terlambat_denda ?? 0} Kasus
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Tarif denda keterlambatan: Rp 1.000 / hari
                </p>
              </CardContent>
            </Card>
          </div>

          {/* TABEL 1: SIRKULASI PEMINJAMAN BUKU AKTIF */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Daftar Sirkulasi Peminjaman Buku Aktif
                </CardTitle>
              </div>
              <Badge variant="primary" className="text-xs font-bold">
                {data?.pinjaman_aktif.length ?? 0} Aktif
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {!data?.pinjaman_aktif || data.pinjaman_aktif.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada peminjaman buku aktif saat ini.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Pinjam</TableHead>
                      <TableHead>Peminjam</TableHead>
                      <TableHead>Buku yang Dipinjam</TableHead>
                      <TableHead>Tgl Pinjam</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead>Status & Denda</TableHead>
                      <TableHead className="text-right">Aksi Loket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pinjaman_aktif.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-mono text-xs font-bold text-blue-600">
                          {loan.reference_no}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900 text-sm">
                            {loan.user?.name}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            NISN: {loan.user?.identifier_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-800 text-sm">
                            {loan.book?.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            Rak: {loan.book?.shelf_location}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {loan.borrow_date}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-bold ${
                              loan.status === 'overdue' ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            {loan.due_date}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={loan.status === 'overdue' ? 'destructive' : 'success'}
                            className="text-xs"
                          >
                            {loan.status === 'overdue'
                              ? `Terlambat (Denda: Rp ${Number(loan.fine_amount).toLocaleString('id-ID')})`
                              : 'Dipinjam'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleReturnBook(loan.id)}
                            className="gap-1 text-xs rounded-xl"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Proses Kembali</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* TABEL 2: KATALOG INVENTARIS BUKU PERPUSTAKAAN */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Inventaris Koleksi Buku Perpustakaan
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                {data?.katalog_buku.length || 0} Judul Buku
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Judul Buku</TableHead>
                    <TableHead>Pengarang & Penerbit</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Stok Fisik</TableHead>
                    <TableHead>Lokasi Rak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.katalog_buku.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <code className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {b.isbn}
                        </code>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {b.title}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {b.author}
                        {b.publisher && <span className="text-slate-400 block">{b.publisher}</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {b.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-black text-xs ${
                            b.stock > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {b.stock} unit
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono text-slate-600">
                          {b.shelf_location}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal: Tambah Buku Baru (Shadcn Dialog) */}
      <Dialog
        open={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
        title="Tambah Koleksi Buku Perpustakaan"
        description="Masukkan metadata buku baru ke dalam inventaris katalog perpustakaan."
      >
        <form onSubmit={handleAddBook} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nomor ISBN *
            </label>
            <Input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Contoh: 978-602-123-456-7"
              required
              className="font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Judul Buku *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Algoritma & Pemrograman Lanjutan"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Pengarang *
              </label>
              <Input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Penulis..."
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Penerbit
              </label>
              <Input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Penerbit..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Pelajaran">Pelajaran</option>
                <option value="Teknologi">Teknologi</option>
                <option value="Fiksi">Fiksi</option>
                <option value="Sastra">Sastra</option>
                <option value="Komik">Komik</option>
                <option value="Referensi">Referensi</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Stok Eksemplar
              </label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lokasi Rak
              </label>
              <Input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Rak A-1"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddBookModal(false)}
            >
              Batal
            </Button>
            <Button type="submit">
              Simpan Buku ke Katalog
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Konfirmasi Pinjam Buku (Shadcn Dialog) */}
      <Dialog
        open={showBorrowModal && !!selectedBookToBorrow}
        onClose={() => setShowBorrowModal(false)}
        title="Konfirmasi Peminjaman Buku"
        description="Periksa detail buku sebelum memproses peminjaman."
      >
        {selectedBookToBorrow && (
          <form onSubmit={handleBorrowBook} className="space-y-4 mt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="font-extrabold text-sm text-slate-900">
                {selectedBookToBorrow.title}
              </div>
              <div className="text-slate-600">
                Pengarang: {selectedBookToBorrow.author}
              </div>
              <div className="text-slate-500">
                Kategori: {selectedBookToBorrow.category} • Lokasi: <code>{selectedBookToBorrow.shelf_location}</code>
              </div>
              <div className="text-emerald-700 font-bold pt-1">
                Stok Tersedia: {selectedBookToBorrow.stock} eksemplar
              </div>
            </div>

            {isLibrarianView && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  NISN Siswa Peminjam *
                </label>
                <Input
                  type="text"
                  value={studentNisn}
                  onChange={(e) => setStudentNisn(e.target.value)}
                  placeholder="Masukkan NISN Siswa..."
                  required
                  className="font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Durasi Peminjaman
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={7}>7 Hari (Standar Siswa)</option>
                <option value={14}>14 Hari (Dua Minggu)</option>
                <option value={30}>30 Hari (Khusus Guru / Penelitian)</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Buku wajib dikembalikan tepat waktu sebelum tanggal jatuh tempo. Tarif denda keterlambatan: Rp 1.000 / hari.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBorrowModal(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="success" disabled={processing}>
                {processing ? 'Memproses...' : 'Konfirmasi Pinjam Buku'}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
};

export default PerpusView;
