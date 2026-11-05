<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KantinMenu;
use App\Models\KopsisProduct;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class POSController extends Controller
{
    /**
     * Checkout Kasir Koperasi Siswa (Sesuai Flowchart Belanja Kopsis)
     */
    public function checkoutKopsis(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:kopsis_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:wallet,cash',
            'student_identifier' => 'nullable|string', // NISN jika bayar saldo e-wallet
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $itemsDetail = [];

            // 1. Validasi Stok & Hitung Total
            foreach ($validated['items'] as $item) {
                $product = KopsisProduct::lockForUpdate()->find($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stok produk '{$product->name}' tidak mencukupi (sisa: {$product->stock}).",
                    ], 422);
                }

                $subtotal = $product->price * $item['quantity'];
                $totalAmount += $subtotal;
                $itemsDetail[] = "{$product->name} x{$item['quantity']}";

                // Kurangi stok barang
                $product->decrement('stock', $item['quantity']);
            }

            // 2. Pemrosesan Metode Pembayaran (Saldo E-Wallet atau Tunai)
            $customer = null;
            if ($validated['payment_method'] === 'wallet') {
                if (empty($validated['student_identifier'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'NISN siswa wajib disertakan untuk pembayaran saldo e-wallet.',
                    ], 422);
                }

                $customer = User::where('identifier_number', $validated['student_identifier'])->first();
                if (!$customer) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Siswa dengan NISN tersebut tidak ditemukan.',
                    ], 404);
                }

                $wallet = Wallet::firstOrCreate(['user_id' => $customer->id]);
                if ($wallet->balance_kopsis < $totalAmount) {
                    return response()->json([
                        'success' => false,
                        'message' => "Saldo Kopsis siswa tidak mencukupi. Saldo saat ini: Rp " . number_format($wallet->balance_kopsis, 0, ',', '.') . ", total belanja: Rp " . number_format($totalAmount, 0, ',', '.') . ".",
                    ], 422);
                }

                // Potong saldo Kopsis
                $wallet->decrement('balance_kopsis', $totalAmount);
            } else {
                $customer = $request->user();
            }

            // 3. Catat Transaksi Pembelian
            $trx = Transaction::create([
                'reference_no' => 'KOP-' . strtoupper(Str::random(8)),
                'user_id' => $customer->id,
                'type' => 'purchase_kopsis',
                'amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'description' => 'Belanja Kopsis: ' . implode(', ', $itemsDetail),
                'operator_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi kasir Kopsis berhasil diproses.',
                'reference_no' => $trx->reference_no,
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'customer' => $customer->name,
                'transaction' => $trx,
            ]);
        });
    }

    /**
     * Checkout Kasir Kantin Sekolah (Sesuai Flowchart Belanja Kantin)
     */
    public function checkoutKantin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:kantin_menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:wallet,cash',
            'student_identifier' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $itemsDetail = [];

            foreach ($validated['items'] as $item) {
                $menu = KantinMenu::find($item['menu_id']);
                if (!$menu->is_available) {
                    return response()->json([
                        'success' => false,
                        'message' => "Menu '{$menu->name}' saat ini berstatus tutup / tidak tersedia.",
                    ], 422);
                }

                $subtotal = $menu->price * $item['quantity'];
                $totalAmount += $subtotal;
                $itemsDetail[] = "{$menu->name} x{$item['quantity']}";
            }

            $customer = null;
            if ($validated['payment_method'] === 'wallet') {
                if (empty($validated['student_identifier'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'NISN siswa wajib disertakan untuk pembayaran saldo e-wallet.',
                    ], 422);
                }

                $customer = User::where('identifier_number', $validated['student_identifier'])->first();
                if (!$customer) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Siswa dengan NISN tersebut tidak ditemukan.',
                    ], 404);
                }

                $wallet = Wallet::firstOrCreate(['user_id' => $customer->id]);
                if ($wallet->balance_kantin < $totalAmount) {
                    return response()->json([
                        'success' => false,
                        'message' => "Saldo Kantin siswa tidak mencukupi. Saldo saat ini: Rp " . number_format($wallet->balance_kantin, 0, ',', '.') . ", total pesanan: Rp " . number_format($totalAmount, 0, ',', '.') . ".",
                    ], 422);
                }

                $wallet->decrement('balance_kantin', $totalAmount);
            } else {
                $customer = $request->user();
            }

            $trx = Transaction::create([
                'reference_no' => 'KTN-' . strtoupper(Str::random(8)),
                'user_id' => $customer->id,
                'type' => 'purchase_kantin',
                'amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'description' => 'Pesanan Kantin: ' . implode(', ', $itemsDetail),
                'operator_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pesanan kantin berhasil diproses dan dikirim ke stan.',
                'reference_no' => $trx->reference_no,
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'customer' => $customer->name,
                'transaction' => $trx,
            ]);
        });
    }
}
