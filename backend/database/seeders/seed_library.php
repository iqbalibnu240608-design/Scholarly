<?php

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Book;
use App\Models\BookLoan;
use App\Models\User;
use Carbon\Carbon;

$books = [
    ['isbn' => '978-602-291-001-1', 'title' => 'Laskar Pelangi', 'author' => 'Andrea Hirata', 'publisher' => 'Bentang Pustaka', 'category' => 'Fiksi', 'stock' => 5, 'shelf_location' => 'Rak A-1 Novel'],
    ['isbn' => '978-602-8758-26-0', 'title' => 'Matematika Diskrit & Algoritma', 'author' => 'Rinaldi Munir', 'publisher' => 'Informatika', 'category' => 'Pelajaran', 'stock' => 8, 'shelf_location' => 'Rak B-2 Sains'],
    ['isbn' => '978-623-00-1234-5', 'title' => 'Pemrograman Web Modern (React & Laravel)', 'author' => 'Budi Raharjo', 'publisher' => 'Modula', 'category' => 'Teknologi', 'stock' => 6, 'shelf_location' => 'Rak C-1 Komputer'],
    ['isbn' => '978-979-3062-79-2', 'title' => 'Bumi Manusia', 'author' => 'Pramoedya Ananta Toer', 'publisher' => 'Hasta Mitra', 'category' => 'Sastra', 'stock' => 4, 'shelf_location' => 'Rak A-2 Sejarah'],
    ['isbn' => '978-979-011-890-1', 'title' => 'Fisika Dasar untuk Sains & Teknik', 'author' => 'Halliday & Resnick', 'publisher' => 'Erlangga', 'category' => 'Pelajaran', 'stock' => 7, 'shelf_location' => 'Rak B-1 Sains'],
    ['isbn' => '978-602-02-9988-7', 'title' => 'Komik Sains Kuark: Eksplorasi Antariksa', 'author' => 'PT Kuark Internasional', 'publisher' => 'Elex Media', 'category' => 'Komik', 'stock' => 10, 'shelf_location' => 'Rak D-1 Komik'],
    ['isbn' => '978-602-123-456-7', 'title' => 'Ensiklopedia Pengetahuan Umum Dunia', 'author' => 'National Geographic', 'publisher' => 'Gramedia', 'category' => 'Referensi', 'stock' => 3, 'shelf_location' => 'Rak E-1 Referensi'],
];

foreach ($books as $b) {
    Book::updateOrCreate(['isbn' => $b['isbn']], $b);
}

// Sample loan for Ahmad Pratama
$student = User::where('role_name', 'siswa')->first();
$book1 = Book::first();

if ($student && $book1) {
    BookLoan::updateOrCreate(
        ['reference_no' => 'LIB-INIT-001'],
        [
            'book_id' => $book1->id,
            'user_id' => $student->id,
            'borrow_date' => Carbon::today()->subDays(2),
            'due_date' => Carbon::today()->addDays(5),
            'status' => 'borrowed',
            'fine_amount' => 0,
        ]
    );
}

echo "Seeded " . Book::count() . " books and " . BookLoan::count() . " active loan.\n";
