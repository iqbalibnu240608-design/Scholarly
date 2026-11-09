<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    /**
     * Top-up Saldo E-Wallet Siswa (Bisa dilakukan oleh Petugas TU, Kopsis, atau Admin)
     */
    public function topup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier_number' => 'nullable|string', // NISN Siswa, NIP Guru, atau Kode Staf
            'amount' => 'required|numeric|min:5000|max:2000000',
            'payment_method' => 'nullable|string|in:cash,qris,tunai,transfer,wallet',
            'target_wallet' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $currentUser = $request->user();
        if (!empty($validated['identifier_number'])) {
            $student = User::where('identifier_number', $validated['identifier_number'])->first();
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => "Pengguna dengan NISN / NIP / ID {$validated['identifier_number']} tidak ditemukan.",
                ], 404);
            }
        } else {
            $student = $currentUser;
        }
        $rawRole = strtolower(trim($currentUser->role_name ?? ''));
        $normalizedRole = match ($rawRole) {
            'koperasi', 'pengelola koperasi', 'pengelola_koperasi' => 'kopsis',
            default => $rawRole,
        };

        $paymentMethod = $validated['payment_method'] ?? 'cash';
        if ($paymentMethod === 'tunai') $paymentMethod = 'cash';

        $isCashierStaff = in_array($normalizedRole, ['admin', 'petugas', 'kopsis'], true);
        $isSelfTopup = ($student->id === $currentUser->id);

        // Jika bukan staf loket kasir (misal: siswa, guru, perpustakaan, security, dll),
        // atau jika staf loket sendiri yang mengajukan top-up non-tunai / via loket
        if (!$isCashierStaff || ($isSelfTopup && ($request->has('payment_method') || $request->has('notes')))) {
            if (!$isSelfTopup && !$isCashierStaff) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki wewenang untuk mengajukan top-up akun pengguna lain.',
                ], 403);
            }
            if ($validated['amount'] > 2000000) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batas maksimal pengajuan top-up mandiri adalah Rp 2.000.000.',
                ], 422);
            }

            // Buat transaksi dengan status 'pending', saldo BELUM bertambah
            $methodLabel = $paymentMethod === 'qris' ? 'Scan QRIS Pendidikan' : 'Tunai di Loket';
            $roleLabel = $normalizedRole;
            $desc = !empty($validated['notes'])
                ? "Pengajuan top-up ({$methodLabel}) saldo digital {$roleLabel}: {$validated['notes']} (Menunggu verifikasi)"
                : "Pengajuan top-up ({$methodLabel}) saldo digital {$roleLabel} universal (Menunggu verifikasi)";

            $trx = Transaction::create([
                'reference_no' => 'TOPUP-' . strtoupper(Str::random(8)),
                'user_id' => $student->id,
                'type' => 'topup_wallet',
                'amount' => (float)$validated['amount'],
                'payment_method' => $paymentMethod,
                'status' => 'pending',
                'description' => $desc,
                'operator_id' => null,
            ]);

            return response()->json([
                'success' => true,
                'status' => 'pending',
                'message' => "Pengajuan top-up sebesar Rp " . number_format($validated['amount'], 0, ',', '.') . " ({$methodLabel}) berhasil dikirim! Saldo digital Anda akan bertambah setelah diverifikasi petugas loket TU / Koperasi.",
                'transaction' => $trx,
            ]);
        } elseif (!$isCashierStaff) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya petugas TU, kopsis, atau administrator yang dapat melakukan top-up langsung di loket.',
            ], 403);
        }

        // Staf loket mengeksekusi top-up langsung (Status: 'completed', Saldo langsung bertambah)
        return DB::transaction(function () use ($validated, $student, $request, $paymentMethod) {
            $wallet = Wallet::lockForUpdate()->firstOrCreate(
                ['user_id' => $student->id],
                ['balance_kopsis' => 0, 'balance_kantin' => 0]
            );

            $amount = (float)$validated['amount'];
            $currentBalance = (float)($wallet->balance ?? $wallet->balance_kopsis ?? 0);
            $wallet->balance = $currentBalance + $amount;
            $wallet->balance_kopsis = $wallet->balance;
            $wallet->balance_kantin = $wallet->balance;
            $wallet->save();

            $methodLabel = $paymentMethod === 'qris' ? 'QRIS' : 'Tunai';

            // Catat transaksi terverifikasi
            $trx = Transaction::create([
                'reference_no' => 'TOPUP-' . strtoupper(Str::random(8)),
                'user_id' => $student->id,
                'type' => 'topup_wallet',
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'status' => 'completed',
                'description' => "Top-up saldo digital universal ({$methodLabel}) sebesar Rp " . number_format($amount, 0, ',', '.') . " untuk {$student->name} (Disetujui di Loket oleh {$request->user()->name})",
                'operator_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'status' => 'completed',
                'message' => "Top-up sebesar Rp " . number_format($amount, 0, ',', '.') . " berhasil diverifikasi dan ditambahkan ke saldo {$student->name}.",
                'wallet' => $wallet,
                'transaction' => $trx,
            ]);
        });
    }

    /**
     * Dapatkan Saldo E-Wallet Pengguna yang Sedang Login
     */
    public function getBalance(Request $request): JsonResponse
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance_kopsis' => 0, 'balance_kantin' => 0]
        );

        return response()->json([
            'success' => true,
            'wallet' => $wallet,
        ]);
    }

    /**
     * Riwayat Transaksi E-Wallet
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $user = $request->user();
        $rawRole = strtolower(trim($user->role_name ?? ''));
        $normalizedRole = match ($rawRole) {
            'koperasi', 'pengelola koperasi', 'pengelola_koperasi' => 'kopsis',
            default => $rawRole,
        };

        // Siswa & Guru hanya melihat transaksi miliknya; Admin/Petugas/Kopsis dapat melihat riwayat operasional
        $query = Transaction::with('user:id,name,identifier_number', 'operator:id,name');

        if (!in_array($normalizedRole, ['admin', 'petugas', 'kopsis', 'kantin', 'kepsek'], true)) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        $transactions = $query->latest()->take(50)->get();

        return response()->json([
            'success' => true,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Dapatkan Daftar Pengajuan Top-Up yang Menunggu Persetujuan (Pending)
     */
    public function getPendingTopups(Request $request): JsonResponse
    {
        $pending = Transaction::with('user:id,name,identifier_number')
            ->where('status', 'pending')
            ->whereIn('type', ['topup_wallet', 'topup_kopsis', 'topup_kantin'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'total_pending' => $pending->count(),
            'pending_topups' => $pending,
        ]);
    }

    /**
     * Setujui (Approve) Pengajuan Top-Up Siswa
     */
    public function approveTopup(Request $request, $id): JsonResponse
    {
        return DB::transaction(function () use ($request, $id) {
            $trx = Transaction::lockForUpdate()->findOrFail($id);

            if ($trx->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => "Pengajuan ini sudah tidak berstatus pending (status saat ini: {$trx->status}).",
                ], 422);
            }

            if (!in_array($trx->type, ['topup_wallet', 'topup_kopsis', 'topup_kantin'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi ini bukan merupakan permohonan top-up yang valid untuk disetujui.',
                ], 422);
            }

            $student = User::findOrFail($trx->user_id);
            $wallet = Wallet::lockForUpdate()->firstOrCreate(
                ['user_id' => $student->id],
                ['balance' => 0, 'balance_kopsis' => 0, 'balance_kantin' => 0]
            );

            $amount = (float)$trx->amount;
            $currentBalance = (float)($wallet->balance ?? $wallet->balance_kopsis ?? 0);
            $wallet->balance = $currentBalance + $amount;
            $wallet->balance_kopsis = $wallet->balance;
            $wallet->balance_kantin = $wallet->balance;
            $wallet->save();

            $trx->status = 'completed';
            $trx->operator_id = $request->user()->id;
            $trx->description = "Top-up saldo digital universal sebesar Rp " . number_format($amount, 0, ',', '.') . " untuk {$student->name} (Disetujui oleh {$request->user()->name})";
            $trx->save();

            return response()->json([
                'success' => true,
                'message' => "Pengajuan top-up {$student->name} sebesar Rp " . number_format($amount, 0, ',', '.') . " berhasil disetujui & saldo telah masuk ke akun siswa.",
                'transaction' => $trx,
                'wallet' => $wallet,
            ]);
        });
    }

    /**
     * Tolak (Reject) Pengajuan Top-Up Siswa
     */
    public function rejectTopup(Request $request, $id): JsonResponse
    {
        return DB::transaction(function () use ($request, $id) {
            $trx = Transaction::lockForUpdate()->findOrFail($id);

            if ($trx->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => "Pengajuan ini sudah tidak berstatus pending (status saat ini: {$trx->status}).",
                ], 422);
            }

            if (!in_array($trx->type, ['topup_wallet', 'topup_kopsis', 'topup_kantin'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi ini bukan merupakan permohonan top-up yang valid untuk ditolak.',
                ], 422);
            }

            $student = User::find($trx->user_id);
            $studentName = $student?->name ?? 'Siswa';
            $reason = $request->input('reason', 'Ditolak oleh petugas loket');

            $trx->status = 'rejected';
            $trx->operator_id = $request->user()->id;
            $trx->description = "Pengajuan top-up dibatalkan/ditolak oleh {$request->user()->name}: {$reason}";
            $trx->save();

            return response()->json([
                'success' => true,
                'message' => "Pengajuan top-up {$studentName} sebesar Rp " . number_format($trx->amount, 0, ',', '.') . " telah ditolak.",
                'transaction' => $trx,
            ]);
        });
    }
}
