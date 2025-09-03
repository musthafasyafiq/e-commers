import { Locale } from './i18n'

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.cart': 'Cart',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Orders',
    'nav.logout': 'Logout',
    
    // Hero Section
    'hero.title': 'Modern E-Commerce Platform',
    'hero.subtitle': 'Discover amazing products from trusted sellers worldwide',
    'hero.cta': 'Shop Now',
    'hero.learn_more': 'Learn More',
    
    // Categories
    'categories.title': 'Shop by Category',
    'categories.electronics': 'Electronics',
    'categories.fashion': 'Fashion',
    'categories.home': 'Home & Garden',
    'categories.books': 'Books',
    'categories.sports': 'Sports',
    'categories.beauty': 'Beauty',
    
    // Products
    'products.title': 'Featured Products',
    'products.view_all': 'View All Products',
    'products.add_to_cart': 'Add to Cart',
    'products.buy_now': 'Buy Now',
    'products.out_of_stock': 'Out of Stock',
    'products.in_stock': 'In Stock',
    'products.price': 'Price',
    'products.rating': 'Rating',
    'products.reviews': 'Reviews',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continue_shopping': 'Continue Shopping',
    'cart.checkout': 'Checkout',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.remove': 'Remove',
    'cart.quantity': 'Quantity',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping_address': 'Shipping Address',
    'checkout.payment_method': 'Payment Method',
    'checkout.order_summary': 'Order Summary',
    'checkout.place_order': 'Place Order',
    'checkout.full_name': 'Full Name',
    'checkout.email': 'Email',
    'checkout.phone': 'Phone',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.postal_code': 'Postal Code',
    
    // Authentication
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.forgot_password': 'Forgot Password?',
    'auth.no_account': "Don't have an account?",
    'auth.have_account': 'Already have an account?',
    'auth.signin_with_google': 'Sign in with Google',
    'auth.signin_with_facebook': 'Sign in with Facebook',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.total_revenue': 'Total Revenue',
    'dashboard.total_orders': 'Total Orders',
    'dashboard.total_customers': 'Total Customers',
    'dashboard.recent_orders': 'Recent Orders',
    'dashboard.top_products': 'Top Products',
    'dashboard.analytics': 'Analytics',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    
    // Footer
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.help': 'Help Center',
    'footer.newsletter': 'Subscribe to Newsletter',
    'footer.newsletter_text': 'Get updates on new products and offers',
    'footer.subscribe': 'Subscribe',
    
    // Flash Sale
    'flash_sale.title': 'Flash Sale',
    'flash_sale.subtitle': 'Limited time offers',
    'flash_sale.ends_in': 'Ends in',
    'flash_sale.days': 'Days',
    'flash_sale.hours': 'Hours',
    'flash_sale.minutes': 'Minutes',
    'flash_sale.seconds': 'Seconds',
  },
  
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.products': 'Produk',
    'nav.cart': 'Keranjang',
    'nav.signin': 'Masuk',
    'nav.signup': 'Daftar',
    'nav.profile': 'Profil',
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Pesanan',
    'nav.logout': 'Keluar',
    
    // Hero Section
    'hero.title': 'Platform E-Commerce Modern',
    'hero.subtitle': 'Temukan produk menakjubkan dari penjual terpercaya di seluruh dunia',
    'hero.cta': 'Belanja Sekarang',
    'hero.learn_more': 'Pelajari Lebih Lanjut',
    
    // Categories
    'categories.title': 'Belanja Berdasarkan Kategori',
    'categories.electronics': 'Elektronik',
    'categories.fashion': 'Fashion',
    'categories.home': 'Rumah & Taman',
    'categories.books': 'Buku',
    'categories.sports': 'Olahraga',
    'categories.beauty': 'Kecantikan',
    
    // Products
    'products.title': 'Produk Unggulan',
    'products.view_all': 'Lihat Semua Produk',
    'products.add_to_cart': 'Tambah ke Keranjang',
    'products.buy_now': 'Beli Sekarang',
    'products.out_of_stock': 'Stok Habis',
    'products.in_stock': 'Tersedia',
    'products.price': 'Harga',
    'products.rating': 'Rating',
    'products.reviews': 'Ulasan',
    
    // Cart
    'cart.title': 'Keranjang Belanja',
    'cart.empty': 'Keranjang Anda kosong',
    'cart.continue_shopping': 'Lanjut Belanja',
    'cart.checkout': 'Checkout',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Ongkir',
    'cart.remove': 'Hapus',
    'cart.quantity': 'Jumlah',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping_address': 'Alamat Pengiriman',
    'checkout.payment_method': 'Metode Pembayaran',
    'checkout.order_summary': 'Ringkasan Pesanan',
    'checkout.place_order': 'Buat Pesanan',
    'checkout.full_name': 'Nama Lengkap',
    'checkout.email': 'Email',
    'checkout.phone': 'Telepon',
    'checkout.address': 'Alamat',
    'checkout.city': 'Kota',
    'checkout.postal_code': 'Kode Pos',
    
    // Authentication
    'auth.signin': 'Masuk',
    'auth.signup': 'Daftar',
    'auth.email': 'Email',
    'auth.password': 'Kata Sandi',
    'auth.confirm_password': 'Konfirmasi Kata Sandi',
    'auth.forgot_password': 'Lupa Kata Sandi?',
    'auth.no_account': 'Belum punya akun?',
    'auth.have_account': 'Sudah punya akun?',
    'auth.signin_with_google': 'Masuk dengan Google',
    'auth.signin_with_facebook': 'Masuk dengan Facebook',
    
    // Dashboard
    'dashboard.welcome': 'Selamat datang kembali',
    'dashboard.total_revenue': 'Total Pendapatan',
    'dashboard.total_orders': 'Total Pesanan',
    'dashboard.total_customers': 'Total Pelanggan',
    'dashboard.recent_orders': 'Pesanan Terbaru',
    'dashboard.top_products': 'Produk Terlaris',
    'dashboard.analytics': 'Analitik',
    
    // Common
    'common.loading': 'Memuat...',
    'common.error': 'Error',
    'common.success': 'Berhasil',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.edit': 'Edit',
    'common.delete': 'Hapus',
    'common.view': 'Lihat',
    'common.search': 'Cari',
    'common.filter': 'Filter',
    'common.sort': 'Urutkan',
    'common.next': 'Selanjutnya',
    'common.previous': 'Sebelumnya',
    'common.close': 'Tutup',
    'common.open': 'Buka',
    
    // Footer
    'footer.about': 'Tentang Kami',
    'footer.contact': 'Kontak',
    'footer.privacy': 'Kebijakan Privasi',
    'footer.terms': 'Syarat Layanan',
    'footer.help': 'Pusat Bantuan',
    'footer.newsletter': 'Berlangganan Newsletter',
    'footer.newsletter_text': 'Dapatkan update produk baru dan penawaran',
    'footer.subscribe': 'Berlangganan',
    
    // Flash Sale
    'flash_sale.title': 'Flash Sale',
    'flash_sale.subtitle': 'Penawaran terbatas',
    'flash_sale.ends_in': 'Berakhir dalam',
    'flash_sale.days': 'Hari',
    'flash_sale.hours': 'Jam',
    'flash_sale.minutes': 'Menit',
    'flash_sale.seconds': 'Detik',
  }
}

export function t(key: string, locale: Locale = 'en'): string {
  return translations[locale][key] || translations.en[key] || key
}
