# Step-by-Step Guide to Build Android APK in Android Studio

## 📁 Android Studio Files Created
The complete Android project structure is now initialized under the `/android` directory:
- `android/build.gradle` (Project level Gradle)
- `android/settings.gradle` (Project Settings)
- `android/app/build.gradle` (App level Gradle with Target SDK 34)
- `android/app/src/main/AndroidManifest.xml` (Microphone, Camera, Audio, Network permissions)
- `android/app/src/main/java/com/hospital/opdintake/MainActivity.java`
- `capacitor.config.json`

---

## 🚀 How to Generate APK using Android Studio

### Step 1: Open the Project in Android Studio
1. Open **Android Studio**.
2. Click **Open** (or **File > Open**).
3. Select the `android` folder of this project.
4. Android Studio will automatically perform the initial Gradle sync.

### Step 2: Build Debug APK (For Immediate Testing on Mobile / Kiosk Tablet)
1. In Android Studio top menu, click **Build**.
2. Click **Build Bundle(s) / APK(s)** $\rightarrow$ **Build APK(s)**.
3. Once the build finishes (takes ~1-2 minutes), a notification popup will say:
   `APK(s) generated successfully for 1 module: app-debug.apk`
4. Click **locate** or open:
   `android/app/build/outputs/apk/debug/app-debug.apk`
5. Transfer this `.apk` file to your Android phone/tablet and install it!

---

### Step 3: Build Signed Release APK (For Production / Play Store / Hospital Kiosk)
1. In Android Studio top menu, click **Build** $\rightarrow$ **Generate Signed Bundle / APK...**
2. Select **APK** and click **Next**.
3. Under **Key store path**, click **Create new...** to create your hospital release key.
4. Fill in:
   - Key store password
   - Key alias (e.g. `opd_kiosk`)
   - Certificate details
5. Choose **release** build variant and check **V1 (Jar Signature)** & **V2 (Full APK Signature)**.
6. Click **Finish**.
7. Your production-ready signed APK is generated at:
   `android/app/release/app-release.apk`

---

## ⚡ Direct Command-Line APK Generation (Without Android Studio GUI)
If you have Android SDK installed on your terminal:
```bash
# Debug APK
cd android
./gradlew assembleDebug

# Release APK
./gradlew assembleRelease
```
