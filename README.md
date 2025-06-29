# SpaceWars - Gezegen Fetih Strateji Oyunu

Modern web teknolojileri ile geliştirilmiş gerçek zamanlı strateji oyunu.

## 🎮 Oyun Hakkında

SpaceWars, oyuncuların gezegenler arasında asker üretip savaş yaptığı bir strateji oyunudur. Her oyuncu kendi gezegeniyle başlar ve diğer gezegenleri ele geçirmeye çalışır.

### 🎯 Oyun Amacı
- Tüm gezegenlerin kontrolünü ele geçirin
- Asker üretim hızını optimize edin
- Stratejik saldırılar planlayın

## 🚀 Özellikler

### Temel Mekanikler
- **Asker Üretimi**: Gezegenler sürekli asker üretir
- **Gezegen Boyutları**: Küçük, Orta, Büyük gezegenler
- **Saldırı Sistemi**: %25, %50, %100 saldırı güçleri
- **AI Rakip**: Akıllı yapay zeka sistemi

### Görsel Özellikler
- Modern uzay teması
- Animasyonlu yıldız arka planı
- Gezegen efektleri ve vurgular
- Sıra göstergesi ve durum bilgileri

## 🎮 Nasıl Oynanır

1. **Gezegen Seçimi**: Kendi gezegeninizi (yeşil renkli) seçin
2. **Hedef Belirleme**: Saldırmak istediğiniz gezegeni seçin
3. **Saldırı Gücü**: %25, %50 veya %100 saldırı gücü seçin
4. **Strateji**: Tüm gezegenleri ele geçirin!

### Kontroller
- **Mouse**: Gezegen seçimi ve etkileşim
- **Saldırı Butonları**: %25, %50, %100 saldırı güçleri

## 🛠️ Teknik Detaylar

### Kullanılan Teknolojiler
- **React 18**: Modern UI framework
- **TypeScript**: Tip güvenliği
- **Styled Components**: CSS-in-JS styling
- **Custom Hooks**: Oyun mantığı yönetimi

### Proje Yapısı
```
src/
├── components/          # UI bileşenleri
│   ├── GameBoard.tsx   # Ana oyun alanı
│   ├── Planet.tsx      # Gezegen bileşeni
│   └── AttackButtons.tsx # Saldırı butonları
├── hooks/              # Custom hooks
│   └── useGameLogic.ts # Oyun mantığı
├── types/              # TypeScript tipleri
│   └── game.ts         # Oyun tipleri
└── App.tsx             # Ana uygulama
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 16+ 
- npm veya yarn

### Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

### Build
```bash
# Production build
npm run build
```

## 🎯 Gelecek Özellikler

### Planlanan Geliştirmeler
- [ ] Çoklu oyuncu desteği (PvP)
- [ ] Farklı oyun modları
- [ ] Ses efektleri
- [ ] Animasyonlu saldırı efektleri
- [ ] Gezegen sınıfları (Savunma, Üretim, Saldırı)
- [ ] Teknoloji ağacı
- [ ] Turnuva sistemi

### Monetizasyon
- [ ] Reklam entegrasyonu
- [ ] Premium özellikler
- [ ] Kozmetik ürünler
- [ ] Özel haritalar

## 📱 Platform Desteği

- ✅ Web (Desktop/Mobile)
- 🔄 React Native (Gelecek)
- 🔄 PWA (Progressive Web App)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**SpaceWars** - Modern web tabanlı strateji oyunu

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
