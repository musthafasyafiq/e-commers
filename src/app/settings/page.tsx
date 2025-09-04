"use client"

import { useState } from "react"
import { 
  User, 
  MapPin, 
  Shield, 
  CreditCard, 
  Bell, 
  Globe, 
  Lock, 
  HelpCircle, 
  LogOut,
  Camera,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Eye,
  EyeOff,
  MessageCircle,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/layout/navbar"

const settingsMenuItems = [
  { id: 'profile', label: 'Profil Akun', icon: User },
  { id: 'addresses', label: 'Alamat Pengiriman', icon: MapPin },
  { id: 'security', label: 'Keamanan', icon: Shield },
  { id: 'payment', label: 'Metode Pembayaran', icon: CreditCard },
  { id: 'notifications', label: 'Notifikasi', icon: Bell },
  { id: 'language', label: 'Bahasa & Mata Uang', icon: Globe },
  { id: 'privacy', label: 'Privasi', icon: Lock },
  { id: 'help', label: 'Bantuan & Support', icon: HelpCircle },
]

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Addresses state
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Rumah',
      name: 'John Doe',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      phone: '+62 812-3456-7890',
      isDefault: true
    },
    {
      id: 2,
      label: 'Kantor',
      name: 'John Doe',
      address: 'Jl. Thamrin No. 456, Jakarta Pusat',
      phone: '+62 812-3456-7890',
      isDefault: false
    }
  ])

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'credit_card',
      name: 'Visa **** 1234',
      isDefault: true,
      icon: '💳'
    },
    {
      id: 2,
      type: 'ewallet',
      name: 'GoPay',
      isDefault: false,
      icon: '🟢'
    }
  ])

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    whatsappNotifications: false,
    promoNotifications: true,
    otpEnabled: true,
    publicReviews: true,
    dataSharing: false,
    language: 'id',
    currency: 'IDR'
  })

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    // Show success message
  }

  const handlePasswordUpdate = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleLogout = () => {
    logout()
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>
            Kelola informasi profil dan foto akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.avatar} />
              <AvatarFallback className="text-lg">
                {profileData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="mb-2">
                <Camera className="h-4 w-4 mr-2" />
                Ubah Foto
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG atau GIF. Maksimal 2MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+62 812-3456-7890"
              />
            </div>
          </div>

          <Button onClick={handleProfileUpdate} disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>
            Pastikan akun Anda menggunakan password yang kuat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>
          <Button onClick={handlePasswordUpdate} disabled={isLoading}>
            {isLoading ? 'Mengubah...' : 'Ubah Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderAddressesSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alamat Pengiriman</h2>
          <p className="text-muted-foreground">Kelola alamat pengiriman Anda</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Alamat
        </Button>
      </div>

      <div className="grid gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={address.isDefault ? "default" : "secondary"}>
                      {address.label}
                    </Badge>
                    {address.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold">{address.name}</h3>
                  <p className="text-muted-foreground">{address.address}</p>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!address.isDefault && (
                <Button variant="outline" size="sm" className="mt-4">
                  Jadikan Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Keamanan</h2>
        <p className="text-muted-foreground">Kelola pengaturan keamanan akun Anda</p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Autentikasi OTP</CardTitle>
          <CardDescription>
            Aktifkan OTP via email untuk keamanan tambahan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">OTP via Email</p>
              <p className="text-sm text-muted-foreground">
                Terima kode OTP melalui email saat login
              </p>
            </div>
            <Switch
              checked={settings.otpEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, otpEnabled: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Riwayat Login</CardTitle>
          <CardDescription>
            Aktivitas login terbaru pada akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { device: 'Chrome on Windows', time: '2 jam yang lalu', location: 'Jakarta, Indonesia' },
              { device: 'Mobile App', time: '1 hari yang lalu', location: 'Jakarta, Indonesia' },
              { device: 'Safari on MacOS', time: '3 hari yang lalu', location: 'Bandung, Indonesia' }
            ].map((login, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">{login.device}</p>
                  <p className="text-sm text-muted-foreground">{login.location}</p>
                </div>
                <p className="text-sm text-muted-foreground">{login.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPaymentSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Metode Pembayaran</h2>
          <p className="text-muted-foreground">Kelola metode pembayaran Anda</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Metode
        </Button>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-medium">{method.name}</p>
                    {method.isDefault && (
                      <Badge variant="outline" className="mt-1">Default</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm">
                      Set Default
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifikasi</h2>
        <p className="text-muted-foreground">Atur preferensi notifikasi Anda</p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifikasi Email</p>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi pesanan dan update via email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifikasi WhatsApp</p>
              <p className="text-sm text-muted-foreground">
                Terima update pesanan via WhatsApp
              </p>
            </div>
            <Switch
              checked={settings.whatsappNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, whatsappNotifications: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifikasi Promo</p>
              <p className="text-sm text-muted-foreground">
                Terima informasi promo dan penawaran khusus
              </p>
            </div>
            <Switch
              checked={settings.promoNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, promoNotifications: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLanguageSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bahasa & Mata Uang</h2>
        <p className="text-muted-foreground">Atur bahasa dan mata uang yang digunakan</p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Bahasa</Label>
            <Select value={settings.language} onValueChange={(value) => 
              setSettings(prev => ({ ...prev, language: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mata Uang</Label>
            <Select value={settings.currency} onValueChange={(value) => 
              setSettings(prev => ({ ...prev, currency: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                <SelectItem value="USD">US Dollar (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Privasi</h2>
        <p className="text-muted-foreground">Kelola pengaturan privasi Anda</p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Review Publik</p>
              <p className="text-sm text-muted-foreground">
                Tampilkan review Anda secara publik
              </p>
            </div>
            <Switch
              checked={settings.publicReviews}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, publicReviews: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Berbagi Data</p>
              <p className="text-sm text-muted-foreground">
                Izinkan berbagi data untuk meningkatkan layanan
              </p>
            </div>
            <Switch
              checked={settings.dataSharing}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, dataSharing: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHelpSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bantuan & Support</h2>
        <p className="text-muted-foreground">Dapatkan bantuan dan dukungan</p>
      </div>

      <div className="grid gap-4">
        <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Pusat Bantuan</p>
                <p className="text-sm text-muted-foreground">
                  Temukan jawaban untuk pertanyaan umum
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">
                  Chat langsung dengan customer service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">FAQ</p>
                <p className="text-sm text-muted-foreground">
                  Pertanyaan yang sering diajukan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection()
      case 'addresses':
        return renderAddressesSection()
      case 'security':
        return renderSecuritySection()
      case 'payment':
        return renderPaymentSection()
      case 'notifications':
        return renderNotificationsSection()
      case 'language':
        return renderLanguageSection()
      case 'privacy':
        return renderPrivacySection()
      case 'help':
        return renderHelpSection()
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <h1 className="text-xl font-bold mb-6">Pengaturan</h1>
                <nav className="space-y-2">
                  {settingsMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  })}
                  
                  <Separator className="my-4" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
