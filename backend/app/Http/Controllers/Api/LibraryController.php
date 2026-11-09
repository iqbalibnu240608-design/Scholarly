<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookLoan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LibraryController extends Controller
{
    /**
     * Dapatkan Data Katalog & Sirkulasi Perpustakaan
     */
    public function getLibraryData(Request $request): JsonResponse
    {
        $user = $request->user();
        $rawRole = strtolower(trim($user->role_name ?? ''));
        $isLibrarianOrAdmin = in_array($rawRole, ['perpustakaan', 'admin'], true);

        $books = Book::latest()->get();
        $totalBooks = $books->count();
        $totalStock = $books->sum('stock');

        $activeLoansQuery = BookLoan::with('book', 'user:id,name,identifier_number', 'operator:id,name')
            ->whereIn('status', ['borrowed', 'overdue'])
            ->latest();

        // Siswa hanya melihat buku yang dipinjam oleh dirinya sendiri
        if (!$isLibrarianOrAdmin) {
            $activeLoansQuery->where('user_id', $user->id);
        }

        $activeLoans = $activeLoansQuery->get();

        // Update status terlambat (overdue) jika melebihi due_date
        $today = Carbon::today();
        foreach ($activeLoans as $loan) {
            if (Carbon::parse($loan->due_date)->lt($today) && $loan->status === 'borrowed') {
                $daysLate = $today->diffInDays(Carbon::parse($loan->due_date));
                $loan->status = 'overdue';
                $loan->fine_amount = $daysLate * 1000; // Denda Rp 1.000 / hari
                $loan->save();
            }
        }

        $allBorrowedCount = BookLoan::where('status', 'borrowed')->count();
        $allOverdueCount = BookLoan::where('status', 'overdue')->count();

        $recentLoansQuery = BookLoan::with('book', 'user:id,name,identifier_number')
            ->latest()
            ->take(15);

        if (!$isLibrarianOrAdmin) {
            $recentLoansQuery->where('user_id', $user->id);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'total_judul_buku' => $totalBooks,
                    'total_eksemplar' => $totalStock + $allBorrowedCount,
                    'sedang_dipinjam' => $allBorrowedCount,
                    'terlambat_denda' => $allOverdueCount,
                ],
                'katalog_buku' => $books,
                'pinjaman_aktif' => $activeLoans,
                'riwayat_sirkulasi' => $recentLoansQuery->get(),
            ],
        ]);
    }

    /**
     * Peminjaman Buku Perpustakaan (Bisa oleh Siswa Mandiri atau Petugas Perpus)
     */
    public function borrowBook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'student_identifier' => 'nullable|string',
            'duration_days' => 'nullable|integer|min:1|max:30',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $book = Book::lockForUpdate()->find($validated['book_id']);

            if ($book->stock < 1) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok buku '{$book->title}' sedang habis dipinjam.",
                ], 422);
            }

            // Tentukan peminjam (Siswa hanya dapat meminjam atas nama dirinya sendiri)
            $currentUser = $request->user();
            $borrower = null;

            if (in_array($currentUser->role_name, ['perpustakaan', 'admin'], true)) {
                if (!empty($validated['student_identifier'])) {
                    $borrower = User::where('identifier_number', $validated['student_identifier'])->first();
                }
                if (!$borrower) {
                    $borrower = $currentUser;
                }
            } else {
                $borrower = $currentUser;
            }

            // Cek apakah siswa sudah meminjam buku yang sama dan belum dikembalikan
            $alreadyBorrowed = BookLoan::where('book_id', $book->id)
                ->where('user_id', $borrower->id)
                ->whereIn('status', ['borrowed', 'overdue'])
                ->exists();

            if ($alreadyBorrowed) {
                return response()->json([
                    'success' => false,
                    'message' => "Anda masih meminjam buku '{$book->title}'. Harap kembalikan terlebih dahulu.",
                ], 422);
            }

            // Kurangi stok buku
            $book->decrement('stock', 1);

            $duration = $validated['duration_days'] ?? 7;
            $borrowDate = Carbon::today();
            $dueDate = Carbon::today()->addDays($duration);

            $loan = BookLoan::create([
                'reference_no' => 'LIB-' . strtoupper(Str::random(8)),
                'book_id' => $book->id,
                'user_id' => $borrower->id,
                'borrow_date' => $borrowDate,
                'due_date' => $dueDate,
                'status' => 'borrowed',
                'fine_amount' => 0,
                'operator_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Buku '{$book->title}' berhasil dipinjam oleh {$borrower->name}. Harap dikembalikan sebelum {$dueDate->format('d M Y')}.",
                'loan' => $loan->load('book', 'user'),
            ]);
        });
    }

    /**
     * Pengembalian Buku Perpustakaan
     */
    public function returnBook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'loan_id' => 'required|exists:book_loans,id',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $loan = BookLoan::with('book', 'user')->lockForUpdate()->find($validated['loan_id']);

            if ($loan->status === 'returned') {
                return response()->json([
                    'success' => false,
                    'message' => 'Buku ini sudah tercatat dikembalikan.',
                ], 422);
            }

            $currentUser = $request->user();
            $rawRole = strtolower(trim($currentUser->role_name ?? ''));
            $isLibrarianOrAdmin = in_array($rawRole, ['perpustakaan', 'admin'], true);

            if (!$isLibrarianOrAdmin && (int)$loan->user_id !== (int)$currentUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak akses untuk mengembalikan buku pinjaman pengguna lain.',
                ], 403);
            }

            $today = Carbon::today();
            $dueDate = Carbon::parse($loan->due_date);
            $fine = 0;
            $daysLate = 0;

            if ($today->gt($dueDate)) {
                $daysLate = $today->diffInDays($dueDate);
                $fine = $daysLate * 1000;
            }

            $loan->status = 'returned';
            $loan->return_date = $today;
            $loan->fine_amount = $fine;
            $loan->save();

            // Kembalikan stok buku
            $loan->book->increment('stock', 1);

            $borrowerName = $loan->user?->name ?? 'Peminjam';
            $msg = "Buku '{$loan->book->title}' berhasil dikembalikan oleh {$borrowerName}. Catatan pengembalian telah tersimpan di sistem perpustakaan.";
            if ($fine > 0) {
                $msg .= " Terlambat {$daysLate} hari, dikenakan denda sebesar Rp " . number_format($fine, 0, ',', '.') . ".";
            }

            return response()->json([
                'success' => true,
                'message' => $msg,
                'loan' => $loan,
            ]);
        });
    }

    /**
     * Tambah Buku Baru ke Katalog (Khusus Petugas Perpustakaan / Admin)
     */
    public function addBook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'isbn' => 'required|string|max:50|unique:books,isbn',
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'stock' => 'required|integer|min:1',
            'shelf_location' => 'required|string|max:100',
        ]);

        $book = Book::create($validated);

        return response()->json([
            'success' => true,
            'message' => "Buku '{$book->title}' berhasil ditambahkan ke katalog perpustakaan.",
            'book' => $book,
        ]);
    }
}
