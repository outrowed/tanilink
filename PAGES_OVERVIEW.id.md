# Ikhtisar Halaman

Dokumen ini merangkum alur halaman pada aplikasi dan memberikan tautan langsung ke komponen halaman di bawah [pages](src/pages).

## Halaman Publik

### [`PlannerLanding.tsx`](src/pages/PlannerLanding.tsx) (`/`)

Halaman beranda adalah pengalaman landing yang berfokus pada AI. Tujuannya adalah membantu pengguna memulai dari niat seperti masakan, menu, atau paket kebutuhan dapur tanpa harus langsung menelusuri bahan satu per satu secara manual. Dari sisi fungsional, halaman ini menempatkan kotak pencarian utama di tengah, memakai lokasi pengguna yang sedang dipilih untuk mempersonalisasi pesan, dan menjadi pintu masuk utama menuju pencarian marketplace maupun perencanaan berbantuan AI.

### [`SearchPlanner.tsx`](src/pages/SearchPlanner.tsx) (`/search`)

Halaman ini adalah permukaan hasil pencarian terpadu untuk pencarian marketplace biasa maupun perencanaan AI. Tujuannya adalah memungkinkan pengguna mencari bahan secara langsung sambil tetap bisa memperluas kueri yang cocok menjadi alur perencanaan multi-bahan. Secara fungsional, halaman ini membaca parameter kueri dari URL, menampilkan kecocokan marketplace, secara opsional mengaktifkan rencana bundel AI, membuka pratinjau detail bahan dari sisi kanan, mengurutkan seller, dan mendukung penambahan langsung ke basket dari panel seller.

### [`Dashboard.tsx`](src/pages/Dashboard.tsx) (`/marketplace`)

Halaman ini adalah peramban marketplace bahan. Tujuannya adalah memberi pengguna tampilan bergaya katalog untuk seluruh bahan yang dipantau pasar agar mereka dapat memfilter, membandingkan, dan membuka halaman produk yang lebih rinci. Secara fungsional, halaman ini merespons pencarian berbasis query string dan filter kategori, merender kartu produk dari lapisan data marketplace, lalu mengarahkan setiap kartu ke halaman detail produk yang sesuai.

### [`ProductPage.tsx`](src/pages/ProductPage.tsx) (`/products/:slug`)

Ini adalah halaman detail bahan untuk pembeli. Tujuannya adalah menampilkan sudut pandang pasar untuk satu bahan tertentu, termasuk perilaku harga dan rekomendasi seller berdasarkan lokasi pengguna yang dipilih. Secara fungsional, halaman ini menampilkan grafik harga interaktif, menyorot kandidat seller terbaik, memungkinkan pengurutan seller berdasarkan smart match, jarak, harga, atau rating, serta mendukung pemilihan kuantitas dan penambahan ke basket untuk setiap penawaran seller.

### [`BasketPage.tsx`](src/pages/BasketPage.tsx) (`/basket`)

Halaman ini adalah layar peninjauan basket pembeli. Tujuannya adalah mengumpulkan baris bahan yang sudah dipilih sebelum alur checkout di masa depan, sekaligus membantu pengguna membandingkan pilihan seller dalam satu tempat. Secara fungsional, halaman ini menampilkan daftar baris basket, mendukung perubahan kuantitas dan penghapusan item, menghitung ringkasan seperti subtotal dan jumlah seller, serta menyediakan jalur kembali yang jelas ke marketplace atau beranda saat basket masih kosong.

### [`AuthPage.tsx`](src/pages/AuthPage.tsx) (`/auth`)

Halaman ini adalah gerbang masuk bersama untuk login dan pendaftaran akun. Tujuannya adalah mengautentikasi pengguna pembeli maupun seller lalu mengarahkan mereka ke area terlindungi yang benar di dalam aplikasi. Secara fungsional, halaman ini mendukung mode login dan pembuatan akun, menampilkan akun preset untuk akses cepat, menangani target redirect dari rute terlindungi, dan memindahkan pengguna yang berhasil diautentikasi ke area akun secara otomatis.

## Halaman Akun Pembeli

### [`AccountPage.tsx`](src/pages/AccountPage.tsx) (`/account`)

Halaman ini adalah hub akun pembeli dan menjadi layar utama terlindungi setelah autentikasi. Tujuannya adalah memusatkan identitas pengguna, metrik akun terbaru, dan navigasi menuju alat-alat akun lainnya. Secara fungsional, halaman ini menampilkan kartu ringkasan akun, tautan menuju transaksi, pengaturan, dan inbox, serta untuk pengguna dengan peran seller juga menampilkan ringkasan seller hub yang dipadatkan beserta pintu masuk menuju alat seller.

### [`AccountTransactionsPage.tsx`](src/pages/AccountTransactionsPage.tsx) (`/account/transactions`)

Halaman ini adalah layar riwayat pesanan dan pelacakan pengiriman. Tujuannya adalah memungkinkan pengguna memeriksa riwayat pembelian mereka dan memahami progres pengiriman setiap pesanan dengan lebih rinci. Secara fungsional, halaman ini memfilter transaksi berdasarkan status, mempertahankan satu transaksi terpilih sebagai fokus, menampilkan item pesanan dan total, serta merender timeline pengiriman dengan pembaruan status yang rinci.

### [`AccountSettingsPage.tsx`](src/pages/AccountSettingsPage.tsx) (`/account/settings`)

Halaman ini adalah permukaan pengelolaan akun. Tujuannya adalah mengumpulkan kontrol konfigurasi akun yang masih bersifat statis ke dalam satu layar agar aplikasi memiliki tujuan pengaturan yang jelas bahkan sebelum alur pengelolaan akun yang lebih dalam dibuat. Secara fungsional, halaman ini merender kelompok pengaturan, menampilkan tombol aksi placeholder untuk kontrol di masa depan, dan menyertakan aksi logout langsung untuk mengakhiri sesi saat ini.

### [`AccountInboxPage.tsx`](src/pages/AccountInboxPage.tsx) (`/account/inbox`)

Halaman ini adalah inbox pesan dan dukungan akun. Tujuannya adalah memusatkan pembaruan dari seller dan komunikasi dukungan ke dalam satu antarmuka yang mudah ditinjau. Secara fungsional, halaman ini menampilkan daftar percakapan, menjaga satu thread tetap terpilih pada satu waktu, merender riwayat pesan dalam mode baca-saja, menyorot status belum dibaca, dan menyertakan composer balasan yang dinonaktifkan sebagai penanda perilaku chat di masa depan.

## Halaman Seller

### [`SellerHubPage.tsx`](src/pages/SellerHubPage.tsx) (`/seller`)

Halaman ini adalah hub analitik seller. Tujuannya adalah memberi pemilik toko pandangan tingkat toko terhadap performa bahan sebelum mereka masuk lebih dalam ke listing tertentu. Secara fungsional, halaman ini menampilkan KPI tingkat atas, mendukung filter status, kategori, dan stok, merender kartu analitik per listing, menjaga rata-rata terfilter di panel samping, menyediakan dialog panduan statistik, dan mengarahkan seller lebih jauh ke detail bahan, routing, serta alur pengaturan toko.

### [`SellerStorePage.tsx`](src/pages/SellerStorePage.tsx) (`/seller/store`)

Halaman ini adalah area konfigurasi toko seller. Tujuannya adalah mengelola data operasional yang mendukung kehadiran seller di marketplace, termasuk identitas toko, lokasi, opsi pengiriman, dan pendaftaran bahan baru. Secara fungsional, halaman ini memungkinkan seller mengedit profil toko, menambah dan menghapus lokasi gudang, mengelola metode pengiriman, serta mendaftarkan listing bahan baru ke produk marketplace yang sudah ada.

### [`SellerIngredientPage.tsx`](src/pages/SellerIngredientPage.tsx) (`/seller/ingredients/:slug`)

Halaman ini adalah layar detail seller khusus untuk satu listing bahan. Tujuannya adalah menggabungkan kontrol listing dan analitik mendalam untuk satu produk yang dikelola seller agar keputusan harga dan inventaris dapat diambil dengan konteks yang cukup. Secara fungsional, halaman ini mengedit harga live, stok, waktu penanganan, lokasi gudang, dan opsi pengiriman, sambil juga merender analitik penjualan, analitik rating, serta snapshot performa spesifik listing.

### [`SellerRoutingPage.tsx`](src/pages/SellerRoutingPage.tsx) (`/seller/routing`)

Halaman ini adalah papan routing multi-gudang untuk seller. Tujuannya adalah membantu operator toko menetapkan listing bahan ke gudang atau lokasi fulfillment yang benar secara visual. Secara fungsional, halaman ini mengelompokkan listing berdasarkan lokasi, menampilkan ringkasan routing per kolom, mendukung pemindahan drag-and-drop antar kolom gudang, menyorot listing dengan stok rendah, dan menautkan setiap kartu routing kembali ke halaman detail bahan seller yang relevan.
