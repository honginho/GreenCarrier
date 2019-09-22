# Green Carrier
2019 ASVF Green Carrier App - Taiwan team

## Environment Settings
Android Studio version - 2019.03.15

### 1. Create project && Move to the very folder:
```shell
cordova create [project_folder] [io.honginho.test] [Test] && cd [project_folder]
```

### 2. Add Android platform:
```shell
cordova platform add android
```

### 3. Add plugins:
Barcode(QR code) Scanner
```shell
cordova plugin add phonegap-plugin-barcodescanner --variable CAMERA_USAGE_DESCRIPTION="To scan barcodes"
```

Gradle (Android 9 <=> 28)
```shell
cordova plugin add cordova-android-support-gradle-release --variable ANDROID_SUPPORT_VERSION=28+
```

### 4. Add app icon:
Replace `mipmap-*` folder in `.\platforms\android\app\src\main\res\`

### 5. Prepare codes to the very platform:
Move your codes to the `www` folder in `project_folder`, then execute this instruction.
```shell
cordova prepare android
```
