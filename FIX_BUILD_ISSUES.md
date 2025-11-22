# Xcode Build Hatalarını Düzeltme

## Yapılan İşlemler

1. ✅ Pod install tamamlandı - react-native-image-picker başarıyla link edildi
2. ✅ iOS build cache temizlendi
3. ✅ Xcode DerivedData temizlendi

## Xcode'da Yapılması Gerekenler

### 1. Xcode'u Kapatın
Xcode'u tamamen kapatın (Cmd+Q)

### 2. Clean Build Folder
Xcode'u açtıktan sonra:
- Product → Clean Build Folder (Shift+Cmd+K)
- Veya: Product → Clean (Cmd+K)

### 3. Xcode DerivedData'yı Temizle
Xcode → Preferences → Locations → Derived Data → Ok tuşuna basıp klasörü açın, GenericMobileFE ile başlayan klasörleri silin

### 4. Yeniden Build
- Product → Build (Cmd+B)

## Eğer Hala "Cannot read property launchImageLibrary of null" Hatası Alıyorsanız

Bu hata genellikle native modülün doğru link edilmediğini gösterir. Şunları deneyin:

### 1. Metro Bundler'ı Resetleyin
```bash
npm start -- --reset-cache
```

### 2. Uygulamayı Tamamen Kaldırıp Yeniden Yükleyin
- Simulator/Device'dan uygulamayı silin
- Xcode'dan yeniden build edin

### 3. Node Modules'ı Yeniden Yükleyin (Son Çare)
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

## Notlar

- `with-environment.sh` hatası genellikle cache sorunlarından kaynaklanır ve clean build ile çözülür
- react-native-image-picker pod install ile başarıyla link edildi (loglarda görüldü)
- Info.plist ve AndroidManifest.xml izinleri eklendi

