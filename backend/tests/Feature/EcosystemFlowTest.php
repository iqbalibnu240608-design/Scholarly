<?php

namespace Tests\Feature;

use App\Models\KantinMenu;
use App\Models\KopsisProduct;
use App\Models\User;
use App\Models\Wallet;
use Tests\TestCase;

class EcosystemFlowTest extends TestCase
{
    /**
     * Test Siswa Login using NISN
     */
    public function test_siswa_login_with_nisn(): void
    {
        $response = $this->postJson('/api/login', [
            'identifier' => '0061234567',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.identifier_number', '0061234567')
            ->assertJsonStructure(['token', 'user']);
    }

    /**
     * Test Siswa Portal Data (Wallet, Schedule, Attendance)
     */
    public function test_siswa_portal_data(): void
    {
        $siswa = User::where('identifier_number', '0061234567')->first();
        $this->actingAs($siswa, 'sanctum');

        $response = $this->getJson('/api/school/siswa');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'kelas',
                    'wali_kelas',
                    'presensi_bulan_ini',
                    'jadwal_hari_ini',
                    'saldo_digital',
                    'tagihan_spp',
                ]
            ]);
    }

    /**
     * Test Kasir Kopsis Checkout with Direct QRIS Payment
     */
    public function test_kopsis_pos_checkout_with_qris(): void
    {
        $kopsis = User::where('role_name', 'kopsis')->first();
        $siswa = User::where('identifier_number', '0061234567')->first();
        $product = KopsisProduct::first();
        $initialStock = $product->stock;

        $this->actingAs($kopsis, 'sanctum');

        $response = $this->postJson('/api/kopsis/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'payment_method' => 'qris',
            'student_identifier' => '0061234567',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('payment_method', 'qris');

        // Assert stock decrement
        $product->refresh();
        $this->assertEquals($initialStock - 2, $product->stock);
    }

    /**
     * Test Kasir Kopsis Checkout Rejects Deprecated Wallet Payment
     */
    public function test_kopsis_pos_checkout_rejects_wallet(): void
    {
        $kopsis = User::where('role_name', 'kopsis')->first();
        $product = KopsisProduct::first();

        $this->actingAs($kopsis, 'sanctum');

        $response = $this->postJson('/api/kopsis/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'payment_method' => 'wallet',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test Satpam Gate Checkin (Late and On-Time Detection)
     */
    public function test_security_gate_checkin(): void
    {
        $satpam = User::where('role_name', 'security')->first();
        $this->actingAs($satpam, 'sanctum');

        $response = $this->postJson('/api/security/gate-checkin', [
            'identifier_number' => '0061234567',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['attendance', 'student']);
    }

    /**
     * Test Guru Input Grade
     */
    public function test_guru_input_grade(): void
    {
        $guru = User::where('role_name', 'guru')->first();
        $this->actingAs($guru, 'sanctum');

        $response = $this->postJson('/api/guru/grades', [
            'student_identifier' => '0061234567',
            'subject_name' => 'Pemrograman Web & Backend Laravel',
            'type' => 'tugas',
            'score' => 96,
            'feedback' => 'Tugas REST API Laravel selesai dengan sangat baik.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('grade.score', '96.00');
    }
}
