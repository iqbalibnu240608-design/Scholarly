<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KantinMenu;
use App\Models\KopsisProduct;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class POSController extends Controller
{
    /**
     * Checkout Kasir Koperasi Siswa (Direct Payment: QRIS & Cash Langsung Tanpa Sistem Saldo)
     */
    public function checkoutKopsis(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:kopsis_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:qris,cash,tunai,wallet',
            'student_identifier' => 'nullable|string', // NISN/NIP jika dicatat oleh kasir
        ]);

        $rawMethod = strtolower(trim($validated['payment_method']));
        if ($rawMethod === 'wallet') {
            return response()->json([
                'success' => false,
                'message' => 'Sistem saldo e-wallet telah ditiadakan sesuai kebijakan sekolah. Silakan gunakan metode pembayaran langsung menggunakan QRIS atau Tunai (Cash).',
            ], 422);
        }

        $paymentMethod = match ($rawMethod) {
            'cash', 'tunai' => 'cash',
            default => 'qris',
        };

        $currentUser = $request->user();
        $rawRole = strtolower(trim($currentUser->role_name ?? ''));
        $normalizedRole = match ($rawRole) {
            'koperasi', 'pengelola koperasi', 'pengelola_koperasi' => 'kopsis',
            default => $rawRole,
        };

        // Keamanan Otorisasi: Pembayaran tunai fisik wajib diverifikasi oleh staf kasir
        if ($paymentMethod === 'cash' && !in_array($normalizedRole, ['kopsis', 'admin', 'petugas', 'kepsek'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tunai wajib disetorkan langsung di kasir Koperasi. Silakan pilih opsi QRIS untuk pemesanan digital mandiri.',
            ], 422);
        }

        return DB::transaction(function () use ($validated, $paymentMethod, $request, $currentUser) {
            // FASE 0: Agregasi kuantitas item per product_id untuk mencegah eksploitasi payload duplikat
            $aggregated = [];
            foreach ($validated['items'] as $item) {
                $pId = (int)$item['product_id'];
                $aggregated[$pId] = ($aggregated[$pId] ?? 0) + (int)$item['quantity'];
            }

            // Urutkan kunci ID secara konsisten untuk mencegah potensi InnoDB Deadlock pada concurrent requests
            ksort($aggregated);

            // FASE 1 (Two-Pass Validation): Kunci dan validasi total kebutuhan stok dengan Pessimistic Locking
            $preparedItems = [];
            foreach ($aggregated as $productId => $totalQty) {
                $product = KopsisProduct::lockForUpdate()->find($productId);
                if (!$product || $product->stock < $totalQty) {
                    $stockAvailable = $product?->stock ?? 0;
                    $productName = $product?->name ?? 'Produk';
                    return response()->json([
                        'success' => false,
                        'message' => "Stok produk '{$productName}' tidak mencukupi (permintaan: {$totalQty}, sisa: {$stockAvailable}). Transaksi dibatalkan.",
                    ], 422);
                }

                $preparedItems[] = [
                    'product' => $product,
                    'quantity' => $totalQty,
                    'subtotal' => $product->price * $totalQty,
                ];
            }

            // FASE 2: Mutasi stok dan kalkulasi total belanja setelah SEMUA item terbukti memiliki stok aman
            $totalAmount = 0;
            $itemsDetail = [];
            foreach ($preparedItems as $entry) {
                $entry['product']->decrement('stock', $entry['quantity']);
                $totalAmount += $entry['subtotal'];
                $itemsDetail[] = "{$entry['product']->name} x{$entry['quantity']}";
            }

            // Tentukan Pelanggan (Customer): Hanya staf kasir Koperasi yang boleh menginput atas nama NISN lain
            $rawRole = strtolower(trim($currentUser->role_name ?? ''));
            $isCashierStaff = in_array($rawRole, ['kopsis', 'koperasi', 'pengelola_koperasi', 'admin', 'petugas'], true);
            $customer = $currentUser;
            if ($isCashierStaff && !empty($validated['student_identifier'])) {
                $targetUser = User::where('identifier_number', $validated['student_identifier'])->first();
                if ($targetUser) {
                    $customer = $targetUser;
                }
            }

            // Catat Transaksi Pembelian Langsung (Status: Approved / Lunas)
            $methodLabel = $paymentMethod === 'qris' ? 'QRIS Langsung' : 'Tunai (Cash)';
            $trx = Transaction::create([
                'reference_no' => 'KOP-' . strtoupper(Str::random(8)),
                'user_id' => $customer->id,
                'type' => 'purchase_kopsis',
                'amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'status' => 'approved',
                'description' => 'Belanja Kopsis (' . $methodLabel . '): ' . implode(', ', $itemsDetail),
                'operator_id' => $currentUser->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => $paymentMethod === 'qris'
                    ? 'Pembayaran QRIS Kopsis berhasil diverifikasi. Transaksi selesai.'
                    : 'Pembayaran tunai kasir Kopsis berhasil diterima. Transaksi selesai.',
                'reference_no' => $trx->reference_no,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'customer' => $customer->name,
                'transaction' => $trx,
            ]);
        });
    }

    /**
     * Checkout Kasir Kantin Sekolah (Direct Payment: QRIS & Cash Langsung Tanpa Sistem Saldo)
     */
    public function checkoutKantin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:kantin_menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:qris,cash,tunai,wallet',
            'student_identifier' => 'nullable|string',
        ]);

        $rawMethod = strtolower(trim($validated['payment_method']));
        if ($rawMethod === 'wallet') {
            return response()->json([
                'success' => false,
                'message' => 'Sistem saldo e-wallet telah ditiadakan sesuai kebijakan sekolah. Silakan gunakan metode pembayaran langsung menggunakan QRIS atau Tunai (Cash).',
            ], 422);
        }

        $paymentMethod = match ($rawMethod) {
            'cash', 'tunai' => 'cash',
            default => 'qris',
        };

        $currentUser = $request->user();
        $rawRole = strtolower(trim($currentUser->role_name ?? ''));

        // Keamanan Otorisasi: Pembayaran tunai fisik wajib diverifikasi oleh staf pengelola kantin
        if ($paymentMethod === 'cash' && !in_array($rawRole, ['kantin', 'admin', 'petugas', 'kepsek'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tunai wajib disetorkan langsung di kasir stan Kantin. Silakan pilih opsi QRIS untuk pemesanan digital mandiri.',
            ], 422);
        }

        return DB::transaction(function () use ($validated, $paymentMethod, $request, $currentUser) {
            // FASE 0: Agregasi kuantitas menu per menu_id
            $aggregated = [];
            foreach ($validated['items'] as $item) {
                $mId = (int)$item['menu_id'];
                $aggregated[$mId] = ($aggregated[$mId] ?? 0) + (int)$item['quantity'];
            }

            ksort($aggregated);

            // FASE 1 (Two-Pass Validation): Validasi ketersediaan menu terlebih dahulu
            $preparedMenus = [];
            foreach ($aggregated as $menuId => $totalQty) {
                $menu = KantinMenu::lockForUpdate()->find($menuId);
                if (!$menu || !$menu->is_available) {
                    $menuName = $menu?->name ?? 'Pilihan';
                    return response()->json([
                        'success' => false,
                        'message' => "Menu '{$menuName}' saat ini sedang tutup / tidak tersedia. Pesanan dibatalkan.",
                    ], 422);
                }

                $preparedMenus[] = [
                    'menu' => $menu,
                    'quantity' => $totalQty,
                    'subtotal' => $menu->price * $totalQty,
                ];
            }

            // FASE 2: Hitung total setelah seluruh menu terkonfirmasi tersedia
            $totalAmount = 0;
            $itemsDetail = [];
            foreach ($preparedMenus as $entry) {
                $totalAmount += $entry['subtotal'];
                $itemsDetail[] = "{$entry['menu']->name} x{$entry['quantity']}";
            }

            // Tentukan Pelanggan (Customer): Hanya staf kasir Kantin yang boleh menginput atas nama NISN lain
            $rawRole = strtolower(trim($currentUser->role_name ?? ''));
            $isCashierStaff = in_array($rawRole, ['kantin', 'admin', 'petugas'], true);
            $customer = $currentUser;
            if ($isCashierStaff && !empty($validated['student_identifier'])) {
                $targetUser = User::where('identifier_number', $validated['student_identifier'])->first();
                if ($targetUser) {
                    $customer = $targetUser;
                }
            }

            // Catat Transaksi Pembelian Langsung (Status: Approved / Lunas)
            $methodLabel = $paymentMethod === 'qris' ? 'QRIS Langsung' : 'Tunai (Cash)';
            $trx = Transaction::create([
                'reference_no' => 'KTN-' . strtoupper(Str::random(8)),
                'user_id' => $customer->id,
                'type' => 'purchase_kantin',
                'amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'status' => 'approved',
                'description' => 'Pesanan Kantin (' . $methodLabel . '): ' . implode(', ', $itemsDetail),
                'operator_id' => $currentUser->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => $paymentMethod === 'qris'
                    ? 'Pembayaran QRIS pesanan kantin berhasil dikonfirmasi. Pesanan diteruskan ke stan.'
                    : 'Pembayaran tunai kasir kantin berhasil diterima. Pesanan diteruskan ke stan.',
                'reference_no' => $trx->reference_no,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'customer' => $customer->name,
                'transaction' => $trx,
            ]);
        });
    }
}
