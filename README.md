# 🚀 B2B Bayi Portalı (B2B Dealer Portal)

Bu proje, modern bir Business-to-Business (B2B) satış platformu ön yüzüdür. Bayilerin ürün kataloglarını incelemesi, stok takibi yapması ve ticari kurallara (miktar çarpanları) uygun sipariş yönetimi için tasarlanmıştır.

## ✨ Özellikler

### 🔐 Kimlik Doğrulama ve Güvenlik
*   **Modern Giriş Paneli:** Bayi bazlı giriş sistemi.
*   **Tam Şifre Kurtarma Akışı:** E-posta doğrulama, 6 haneli kod onayı ve şifre sıfırlama adımlarını içeren kullanıcı dostu süreç.
*   **Güvenli Çıkış:** Token ve kullanıcı bilgilerinin temizlenmesi.

### 📦 Ürün Kataloğu ve B2B Kuralları
*   **Dinamik Listeleme:** API üzerinden çekilen gerçek zamanlı ürün verileri.
*   **Gelişmiş Filtreleme:** Marka ve teknik özelliklere göre anlık süzme.
*   **Debounce Arama:** Yüksek performanslı, yazma bitince tetiklenen arama çubuğu.
*   **Miktar Çarpanı (B2B Logic):** Ürünlerin koli/paket katlarına göre (örn: 3, 6, 9...) eklenebilmesini sağlayan akıllı miktar kontrolü.
*   **Stok Uyarıları:** Kritik stok seviyeleri için görsel uyarılar.

### 🛒 Sepet Yönetimi
*   **Modern Yan Panel (Drawer):** Sağdan açılan, animasyonlu sepet çekmecesi.
*   **Otomatik Hesaplama:** Ara toplam ve miktarların anlık güncellenmesi.

## 🛠️ Teknik Yığın (Tech Stack)

*   **Framework:** [Vue.js 3](https://vuejs.org/) (Composition API - script setup)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **İkonlar:** [Lucide Vue Next](https://lucide.dev/)
*   **Stil:** Modern CSS Variables & Responsive Design
*   **Font:** Plus Jakarta Sans

## 🚀 Kurulum ve Çalıştırma

1. Projeyi klonlayın:
```bash
git clone [sizin-repo-linkiniz]
cd b2b-task
```

2. Bağımlılıkları kurun:
```bash
npm install
```

Bu komut `package.json` dosyasındaki tüm gerekli paketleri indirir:
- `vite`: Geliştirme sunucusu ve build aracı
- `vue`: Vue.js framework
- `@vitejs/plugin-vue`: Vite için Vue eklentisi
- `@lucide/vue`: İkon kütüphanesi

### 3. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Sunucu başlatıldığında konsolda şu çıktı görülecek:
```text
VITE vX.X.X ready in XXX ms

➜  Local:   http://127.0.0.1:5175/
```

Tarayıcıda `http://127.0.0.1:5175` adresini aç.

## Hızlı Başlangıç (Tek Komut Bloğu)

Windows PowerShell, Command Prompt veya macOS/Linux Terminal'e yapıştır:

```bash
# Proje klasörüne gir, bağımlılıkları kur ve başlat
cd [proje-klasörü] && npm install && npm run dev
```

Veya adım adım:

**Windows PowerShell/CMD:**
```cmd
cd [proje-klasörü]
npm install
npm run dev
```

**macOS/Linux Terminal:**
```bash
cd [proje-klasörü]
npm install
npm run dev
```

Başarılı olursa, tarayıcıda otomatik açılacak veya `http://127.0.0.1:5175` adresine manuel olarak git.


## Giriş Bilgileri (Test Hesabı)

- **Kullanıcı Adı**: `test_customer`
- **Şifre**: `kg$E4J_13Gtu`

## API Yapılandırması

### Yerel Proxy (Geliştirme)

Geliştirme sırasında istekler yerel proxy üzerinden iletilir:
- Yerel: `http://127.0.0.1:5175/api/...`
- Hedef: `https://testb2bapi.maverabilisim.com/api/v1/...`

Proxy ayarı: `vite.config.js` dosyasında tanımlıdır.

### Doğrudan Backend (Üretim)

```text
https://testb2bapi.maverabilisim.com/api/v1
```

## Proje Yapısı

```
src/
├── App.vue              # Ana uygulama bileşeni
├── main.js              # Giriş noktası
├── styles.css           # Global stil
├── services/
│   └── api.js          # API çağrıları ve token yönetimi
├── views/
│   ├── Login.vue       # Giriş sayfası
│   └── Products.vue    # Ürünler sayfası
├── components/
│   ├── Pagination.vue  # Sayfalama bileşeni
│   ├── ProductCard.vue # Ürün kartı bileşeni
│   └── SidebarFilter.vue # Filtreleme bileşeni
└── utils/
    └── product.js      # Ürün yardımcı fonksiyonları
```

## Kapsam

- ✅ Kullanıcı girişi ve token saklama
- ✅ Çıkış yapma ve token temizleme
- ✅ Dinamik ürün filtreleri
- ✅ Ürün listeleme ve arama
- ✅ Ürün kartı, fiyat, iskonto ve stok gösterimi
- ✅ Sepet miktar çarpanı kontrolü
- ✅ Sayfalama bileşeni

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlat (sıcak yükleme etkin) |
| `npm run build` | Üretim için projeyi derle |
| `npm run preview` | Derlenen üretim projesini önizle |

## Sorun Giderme

### Port 5175 Zaten Kullanılıyor

Eğer port kullanılıyorsa, alternatif portu kullan:
```bash
npm run dev -- --port 5176
```

### Proxy 500 Hatası

Tarayıcı konsolunda `POST /api/auth/login 500` görüyorsan:
1. API temel adresini kontrol et (vite.config.js)
2. Giriş kimlik bilgilerini doğrula
3. Test API'nin `/api/v1/auth/login` servisinin aktif olduğunu kontrol et

### Modüller Kurulamadı

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Tarayıcı Uyumluluğu

- Chrome/Chromium (en son sürüm)
- Firefox (en son sürüm)
- Safari (en son sürüm)
- Edge (en son sürüm)

## İletişim

API sorunları için: `testb2bapi@maverabilisim.com`
