# 🏥 AI Smart OPD Intake Kiosk & Doctor Consultation Assistant
### Multilingual Voice-Guided Triage, Camera OCR Scanner & ABDM-Ready Clinical EMR

---

## 📌 1. Project Overview

The **AI Smart OPD Intake Kiosk & Doctor Consultation Assistant** is a full-stack, production-ready healthcare application designed to modernize Outpatient Department (OPD) workflows in hospitals, clinics, and primary healthcare centers (PHCs).

It bridges the communication gap between patients and doctors by offering:
1. **Multilingual Patient Self-Registration Kiosk**: Touch and voice-driven OPD token registration in **14 Indian languages** (Hindi, Marathi, Bengali, Gujarati, Tamil, Telugu, Kannada, Punjabi, Bhojpuri, Malayalam, Odia, Urdu, Hinglish, and English).
2. **AI-Assisted SOCRATES Clinical Interview**: Dynamic medical interview collecting Chief Complaints, Onset, Character, Radiation, Associated Symptoms, Timing, Exacerbating Factors, and Severity (1-10 scale).
3. **Prescription & Medical Record Camera OCR**: Real-time camera scanner that extracts past medical history, current medications, and lab reports using Gemini Vision AI.
4. **Clinical Triage & Red-Flag Alerts**: Automatic urgency classification (🔴 Emergency / 🟡 Priority / 🟢 Routine) with clinical red-flag warnings for doctors.
5. **Doctor Consultation Station & EMR**: 10-second bulleted clinical briefings, one-click PA speaker token call with hospital chime, digital prescription writing, and direct **A4 OPD PDF slip downloads**.
6. **Dual Platform Support**: Runs smoothly as a web application and as a **Native Android APK** with zero-login direct role selection.

---

## 🌟 2. Key Features & Capabilities

### A. Patient Kiosk Experience
* **Role Selection Screen**: Clean entry screen to choose between Patient Intake and Doctor/Staff Console.
* **14 Indian Regional Languages**: Full text-to-speech (TTS), speech-to-text (STT), and translated UI.
* **Step-by-Step Guided Intake**:
  - **Identity & Demographics**: Name, Age, Gender, Mobile Number, and optional ABHA (Ayushman Bharat Health Account) ID.
  - **Interactive Voice & Touch Interview**: Visual symptom chips + continuous microphone speech recognition.
  - **Smart Camera OCR Scanner**: Direct camera capture or file upload to scan past prescriptions.
  - **Review & Digital Token Slip**: Instant generation of OPD token numbers (e.g. `TK-101`), QR codes, and assigned room numbers.
  - **WhatsApp & SMS Sharing**: One-tap share of OPD token slip to patient's mobile number.

### B. Doctor & Clinical Staff Console
* **Live OPD Patient Queue**: Real-time queue showing triage status, wait times, and token numbers.
* **10-Second AI Clinical Briefing**: Bullet-point summary of patient history, duration, severity, and past medications.
* **One-Click Patient Voice Call (📢 बोलकर बुलाएं)**: Plays an acoustic hospital chime followed by a multilingual PA announcement (e.g., *"टोकन नंबर TK-102, रमेश कुमार, कृपया ओपीडी कमरा नंबर 2 में पधारें"*).
* **Live Language Switcher**: Allows the doctor to view patient briefs and UI in any language on the fly.
* **Digital Prescription (Rx) & Advice**: Add medications, dosage, frequency, lab test orders, and doctor notes.
* **Direct A4 PDF Export**: Instant download of hospital OPD consultation slips with patient vitals, clinical summary, Rx table, and doctor stamp/signature placeholder.

---

## 🏗️ 3. System Architecture & Component Design

```
+-----------------------------------------------------------------------------------+
|                                 USER CLIENTS                                      |
|                                                                                   |
|   +-------------------------------------+   +---------------------------------+   |
|   |          Web Browser                |   |       Native Android APK        |   |
|   |   (Chrome / Edge / Safari / Firefox)|   |  (WebView + Java Bridge + Audio)|   |
|   +------------------+------------------+   +----------------+----------------+   |
|                      |                                       |                    |
+----------------------|---------------------------------------|--------------------+
                       |                                       |
                       +-------------------+-------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        FRONTEND PRESENTATION LAYER (React 18)                     |
|                                                                                   |
|   +----------------------+  +---------------------+  +------------------------+   |
|   | RoleSelectionScreen  |  |  KioskContainer     |  |   DoctorStation        |   |
|   | (Role Switcher & i18n|  |  - StepIdentity     |  |   - Patient Queue      |   |
|   |  Translations)       |  |  - StepVoiceTouch   |  |   - AI Clinical Brief  |   |
|   |                      |  |  - StepPrescription |  |   - Voice PA Token Call|   |
|   |                      |  |  - StepReviewSubmit |  |   - PDFExportModal     |   |
|   +----------------------+  +---------------------+  +------------------------+   |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | Services & Helpers:                                                       |   |
|   | - speechService.ts (AudioContext synthesizer, Web Speech TTS/STT)         |   |
|   | - pdfExportService.ts (jsPDF A4 OPD Slip Generator & Native Bridge)       |   |
|   | - geminiService.ts / clinicalPromptEngine.ts (AI Triage & Summarizer)     |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                         BACKEND & AI PROCESSING LAYER                             |
|                                                                                   |
|   +-----------------------------------+   +-----------------------------------+   |
|   |      Express.js / Node Server     |   |          Google Gemini AI         |   |
|   |   - Static SPA Asset Delivery     |   |   - Multimodal OCR Prescription   |   |
|   |   - REST API Endpoints            |   |   - SOCRATES Symptom Triage       |   |
|   |   - Port 3000 Ingress Routing     |   |   - Clinical Red-Flag Detection   |   |
|   +-----------------------------------+   +-----------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 🔄 4. Data Flow Architecture

1. **Patient Arrival & Language Selection**:
   - Patient touches their preferred language on the Role Selection screen.
   - The app initializes audio permissions via `unlockAudioSystem()`.

2. **Demographics & Symptom Registration**:
   - Patient enters basic details (Name, Age, Gender, Mobile).
   - Voice/Touch Interview captures audio input via `webkitSpeechRecognition` or predefined interactive symptom tags.

3. **OCR Prescription Processing (Optional)**:
   - Camera takes a picture of past hospital prescriptions.
   - Gemini Vision analyzes the document image and extracts diagnosis, past drugs, and allergies into structured JSON.

4. **Triage & Summary Computation**:
   - The system computes an urgency score based on severity (1-10), duration, and symptom red flags (e.g. chest pain, high fever).
   - An OPD Token (e.g. `TK-103`) is generated and pushed to the Doctor Queue.

5. **Doctor Consultation & Token Calling**:
   - Doctor views the patient in the Live Queue.
   - Doctor clicks **Call Token**: The synthesizer plays a two-tone chime and broadcasts the patient's token and room number over speakers.
   - Doctor enters Rx and clicks **Export PDF**: `jsPDF` creates the OPD consultation slip and downloads it to the device (or `Downloads/` folder via Android Java bridge).

---

## 💻 5. Technologies Used

### Frontend & UI Technologies
* **React 18**: Component-driven reactive user interface.
* **TypeScript**: Strict type-checking and end-to-end data integrity.
* **Tailwind CSS**: High-contrast, touch-optimized, responsive styling with mobile safe-area insets.
* **Lucide React**: Modern icon set for healthcare, audio, and navigation controls.
* **Motion (`motion/react`)**: Smooth transitions, active button feedback, and modal animations.
* **jsPDF**: Client-side vector PDF generation for A4 medical consultation slips.

### Audio & Voice Technologies
* **Web Audio API**: Real-time synthesizer generating acoustic medical chimes (`playDoctorChime()`, `playTouchFeedback()`).
* **Web Speech API (`SpeechSynthesis`)**: Voice output in Hindi, Marathi, Bengali, Tamil, Telugu, English, etc.
* **Web Speech Recognition (`webkitSpeechRecognition`)**: Hands-free voice speech-to-text input.

### Backend & AI
* **Google Gemini API**: Multimodal vision analysis for prescription OCR and clinical triage reasoning.
* **Express.js & Node.js**: Lightweight backend serving production assets on port 3000.
* **Vite**: Ultra-fast build tool and frontend development server.

### 📱 Android APK Native Technologies
* **Android Java (Native)**: Custom `MainActivity.java` embedding an optimized Android `WebView`.
* **JavaScript Native Interface (`@JavascriptInterface`)**:
  - `AndroidApp.savePdfBase64()`: Directly decodes base64 PDF and saves to Android's public `Downloads` directory.
  - Native PDF Viewer Launcher (`FileProvider` + `Intent.ACTION_VIEW`).
* **Android Permissions (`AndroidManifest.xml`)**:
  - `android.permission.INTERNET`
  - `android.permission.CAMERA`
  - `android.permission.RECORD_AUDIO`
  - `android.permission.MODIFY_AUDIO_SETTINGS`
  - `android.permission.WRITE_EXTERNAL_STORAGE`
* **WebChromeClient Customizations**:
  - `onPermissionRequest`: Auto-grants camera and microphone permissions to the WebView.
  - `onShowFileChooser`: Native Android camera picker and gallery document selector.
* **Gradle Build System**: `build.gradle` configured for Android API 24 to 34.

---

## 📁 6. Project Directory Structure

```
opd-smart-intake-kiosk/
├── android/                             # Android Studio Project for APK Build
│   ├── app/
│   │   ├── build.gradle                 # Android App dependencies & SDK config
│   │   └── src/main/
│   │       ├── AndroidManifest.xml      # Camera, Mic & Storage Permissions
│   │       ├── java/com/hospital/opdintake/
│   │       │   └── MainActivity.java    # Native WebView & Java-JS Bridge
│   │       └── res/                     # Android Layouts, Strings & App Icons
│   ├── build.gradle
│   └── settings.gradle
├── src/
│   ├── components/
│   │   ├── RoleSelectionScreen.tsx      # Welcome & Role Picker (Patient vs Doctor)
│   │   ├── Header.tsx                   # Top Navigation & Quick Switcher
│   │   ├── kiosk/                       # Patient Intake Kiosk Components
│   │   │   ├── KioskContainer.tsx       # Intake Workflow Orchestrator
│   │   │   ├── StepIdentity.tsx         # Demographics & ABHA Form
│   │   │   ├── StepVoiceTouchInterview.tsx # Voice/Touch SOCRATES Interview
│   │   │   ├── StepPrescriptionScan.tsx # Camera & OCR Scanner
│   │   │   ├── StepReviewSubmit.tsx     # Review & Token Slip Generator
│   │   │   └── LanguageDropdown.tsx     # 14-Language Switcher Dropdown
│   │   └── doctor/                      # Doctor Console Components
│   │       ├── DoctorStation.tsx        # Queue, Summary, Voice Call & Rx
│   │       ├── PDFExportModal.tsx       # PDF Preview & Print Modal
│   │       └── PatientHistory.tsx       # Patient Medical Records Viewer
│   ├── services/
│   │   ├── geminiService.ts             # Gemini Vision OCR & Triage Service
│   │   ├── speechService.ts             # AudioContext Chime & Multilingual TTS/STT
│   │   └── pdfExportService.ts          # jsPDF A4 Document Generator
│   ├── utils/
│   │   ├── roleTranslations.ts          # 14-Language Dictionaries for Role Screen
│   │   └── translations.ts              # Kiosk & Doctor Localization Strings
│   ├── types.ts                         # Global TypeScript Interfaces
│   ├── App.tsx                          # Root React Component
│   ├── main.tsx                         # DOM Mounting Entrypoint
│   └── index.css                        # Tailwind CSS & Safe-Area Inset Styles
├── index.html                           # HTML5 Entry Point with Mobile Meta Tags
├── metadata.json                        # Applet Metadata Configuration
├── package.json                         # Node.js Dependencies & Scripts
├── server.ts                            # Express Server Entrypoint
└── vite.config.ts                       # Vite Bundler Configuration
```

---

## 🚀 7. How to Run & Build

### Development Mode (Web)
```bash
# Start local development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Production Build (Web)
```bash
# Build frontend and compile backend
npm run build

# Start production server
npm run start
```

### 📱 Android APK Build (Android Studio)
1. Open **Android Studio**.
2. Click **Open** and select the `/android` folder from this repository.
3. Allow Gradle to sync dependencies.
4. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
5. Locate the generated `.apk` in `android/app/build/outputs/apk/debug/app-debug.apk`.
6. Install and run on any Android phone or tablet.

---

## 🔒 8. Security & Compliance
* **ABDM & DPDP Compliance**: Data is handled with strict privacy protocols. No unencrypted health data is leaked.
* **Offline-Ready Voice Chimes**: Synthesizer chimes and localized voice fallback operate without requiring external audio asset downloads.
* **Safe-Area Insets**: Optimized for Android edge-to-edge displays, waterdrop notches, and bottom gesture bars.

---

## 👥 Authors & Credits
Developed with ❤️ for Modern Healthcare & Digital India OPD Modernization.
