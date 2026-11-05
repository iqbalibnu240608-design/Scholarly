<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    /**
     * Top-up Saldo E-Wallet Siswa (Bisa dilakukan oleh Petugas TU, Kopsis, atau Admin)
     */
    public function topup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier_number' => 'required|string', // NISN Siswa
            'amount' => 'required|numeric|min:5000',
            'target_wallet' => 'required|in:kopsis,kantin,all',
            'notes' => 'nullable|string',
        ]);

        $student = User::where('identifier_number', $validated['identifier_number'])->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => "Siswa dengan NISN {$validated['identifier_number']} tidak ditemukan.",
            ], 404);
        }

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $student->id],
            ['balance_kopsis' => 0, 'balance_kantin' => 0]
        );

        $amount = (float)$validated['amount'];
        $type = 'topup_' . ($validated['target_wallet'] === 'kantin' ? 'kantin' : 'kopsis');

        if ($validated['target_wallet'] === 'kantin') {
            $wallet->balance_kantin += $amount;
        } elseif ($validated['target_wallet'] === 'kopsis') {
            $wallet->balance_kopsis += $amount;
        } else {
            // Split 50:50 if target_wallet == 'all'
            $wallet->balance_kopsis += ($amount / 2);
            $wallet->balance_kantin += ($amount / 2);
        }
        $wallet->save();

        // Catat transaksi
        $trx = Transaction::create([
            'reference_no' => 'TOPUP-' . strtoupper(Str::random(8)),
            'user_id' => $student->id,
            'type' => $type,
            'amount' => $amount,
            'payment_method' => 'cash',
            'description' => "Top-up saldo {$validated['target_wallet']} untuk {$student->name} (NISN: {$student->identifier_number})",
            'operator_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Top-up sebesar Rp " . number_format($amount, 0, ',', '.') . " berhasil ditambahkan ke saldo {$student->name}.",
            'wallet' => $wallet,
            'transaction' => $trx,
        ]);
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

        // Siswa hanya melihat transaksi miliknya; Admin/Petugas bisa melihat seluruhnya
        $query = Transaction::with('user:id,name,identifier_number', 'operator:id,name');

        if ($user->role_name === 'siswa') {
            $query->where('user_id', $user->id);
        }

        $transactions = $query->latest()->take(50)->get();

        return response()->json([
            'success' => true,
            'transactions' => $transactions,
        ]);
    }
}
