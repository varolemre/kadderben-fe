# Coffee Fortune Feature Setup

## Installation

### 1. Install react-native-image-picker

```bash
npm install react-native-image-picker
```

### 2. iOS Setup

#### Install Pods
```bash
cd ios && pod install && cd ..
```

#### Update Info.plist

Add the following keys to `ios/GenericMobileFE/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Kahve fincanı fotoğrafını çekebilmemiz için kamera erişimine ihtiyacımız var.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Kahve fincanı fotoğrafını seçebilmeniz için fotoğraf albümüne erişime ihtiyacımız var.</string>
```

### 3. Android Setup

#### Update AndroidManifest.xml

Add the following permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

For Android 13+ (API 33+), also add:

```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

## Navigation Routes

The following routes have been added to `HomeStackNavigator`:

- `CoffeeFortune` - Main coffee fortune creation screen
- `CoffeeFortuneHistory` - History of past coffee fortunes

## API Endpoints

The following endpoints are used:

- `POST /coffee-fortune` - Create a new coffee fortune (multipart/form-data)
- `GET /coffee-fortune/{fortuneId}` - Get a specific coffee fortune
- `GET /coffee-fortune?page={page}&size={size}` - Get paginated list of user's coffee fortunes

## Files Created

1. **Types**: `src/types/coffeeFortune.ts`
   - CoffeeFortuneStatus enum
   - CoffeeFortuneResponse interface
   - CoffeeFortuneListResponse interface
   - CoffeeFortuneCreateRequest interface

2. **API**: `src/api/coffeeFortuneApi.js`
   - createCoffeeFortune()
   - getCoffeeFortune()
   - getUserCoffeeFortunes()

3. **Utils**: `src/utils/imagePicker.js`
   - takePhoto() - Open camera
   - pickFromGallery() - Open gallery

4. **Screens**:
   - `src/screens/coffeeFortune/CoffeeFortuneScreen.tsx`
   - `src/screens/coffeeFortune/CoffeeFortuneHistoryScreen.tsx`

## Features

### CoffeeFortuneScreen
- Category selection (6 categories)
- Photo capture/selection
- Submit coffee fortune
- Display current/latest fortune status
- WAITING state with ETA
- READY state with fortune comment

### CoffeeFortuneHistoryScreen
- Paginated list of past fortunes
- Pull-to-refresh
- Load more functionality
- Empty state
- Status indicators (WAITING/READY)
- Image thumbnails

## Design Notes

- Uses existing COLORS from constants
- Dark mystical theme (#27192c cards)
- Soft glow animations
- Consistent spacing (8/12/16/24)
- Turkish locale for dates

