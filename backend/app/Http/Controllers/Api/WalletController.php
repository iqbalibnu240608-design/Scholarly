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
     * Top-up Saldo E-Wallet (Dinonaktifkan: Sistem pembayaran beralih ke QRIS dan Tunai langsung)
     */
    public function topup(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Sistem saldo e-wallet telah ditiadakan sesuai keputusan sekolah. Pembayaran di Koperasi dan Kantin kini dilakukan secara langsung menggunakan QRIS atau Tunai (Cash) di kasir / stan.',
        ], 422);
    }

    /**
     * Dapatkan Status Saldo Akun (Dinonaktifkan: Saldo Default 0.00 untuk Direct Payment)
     */
    public function getBalance(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'wallet' => [
                'user_id' => $request->user()->id,
                'balance' => 0.00,
                'balance_kopsis' => 0.00,
                'balance_kantin' => 0.00,
            ],
            'payment_mode' => 'direct_payment',
            'supported_methods' => ['qris', 'cash'],
            'message' => 'Sistem pembayaran kini menggunakan QRIS dan Tunai (Cash) langsung tanpa saldo akun.',
        ]);
    }

    /**
     * Riwayat Transaksi Pengguna (Pembelian Kopsis, Kantin, SPP)
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $user = $request->user();
        $rawRole = strtolower(trim($user->role_name ?? ''));
        $normalizedRole = match ($rawRole) {
            'koperasi', 'pengelola koperasi', 'pengelola_koperasi' => 'kopsis',
            default => $rawRole,
        };

        // Siswa & Guru melihat transaksi miliknya; Admin/Petugas/Kopsis/Kantin dapat melihat riwayat operasional
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
     * Dapatkan Daftar Pengajuan Top-Up (Dinonaktifkan: Selalu Kosong 0)
     */
    public function getPendingTopups(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'total_pending' => 0,
            'pending_topups' => [],
            'notice' => 'Sistem saldo dan pengajuan top-up telah ditiadakan sesuai kebijakan pembayaran langsung (QRIS & Tunai).',
        ]);
    }

    /**
     * Setujui (Approve) Pengajuan Top-Up (Dinonaktifkan)
     */
    public function approveTopup(Request $request, $id): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Layanan persetujuan top-up telah dinonaktifkan karena sekolah kini menggunakan sistem pembayaran langsung (Direct Payment via QRIS & Tunai).',
        ], 422);
    }

    /**
     * Tolak (Reject) Pengajuan Top-Up (Dinonaktifkan)
     */
    public function rejectTopup(Request $request, $id): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Layanan permohonan top-up telah dinonaktifkan karena sekolah kini menggunakan sistem pembayaran langsung (Direct Payment via QRIS & Tunai).',
        ], 422);
    }
}
