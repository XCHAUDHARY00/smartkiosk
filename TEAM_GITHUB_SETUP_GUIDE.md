# 🏥 SMART OPD - Team GitHub Setup & Push Guide

**Official Repo:** `https://github.com/XCHAUDHARY00/SmartOpd.git`

---

## ⚡ MEMBER 4: RAJ CHAUDHARY (AI Backend & Android Bridge)
**Corrected Command:**
```bash
git checkout -B feature/backend-android-bridge && git add server.ts package.json tsconfig.json vite.config.ts .env.example src/services/pdfExportService.ts src/services/speechService.ts android/ metadata.json && git commit -m "feat(backend): configure Express server, WebAudio chime, PDF engine and Android native bridge" && git push -u origin feature/backend-android-bridge
```

---

## 🎨 MEMBER 1: HIMANSHU (UI / UX Design & Localization)
```bash
git checkout -B feature/ui-ux-branding && git add public/ src/components/common/AppLogo.tsx src/components/Header.tsx src/components/kiosk/LanguageDropdown.tsx src/utils/roleTranslations.ts src/utils/translations.ts src/index.css index.html README.md ANDROID_STUDIO_GUIDE.md && git commit -m "feat(ui): setup branding, official logo, translations and design layout" && git push -u origin feature/ui-ux-branding
```

---

## ⚛️ MEMBER 2: RAHUL CHAUHAN (Frontend React.js)
```bash
git checkout -B feature/frontend-kiosk-doctor && git add src/App.tsx src/types.ts src/components/RoleSelectionScreen.tsx src/components/kiosk/ src/components/doctor/ && git commit -m "feat(react): build patient kiosk intake flow and doctor station console" && git push -u origin feature/frontend-kiosk-doctor
```

---

## 🤖 MEMBER 3: ABHISHEK (Machine Learning & AI Triage)
```bash
git checkout -B feature/ml-ai-triage && git add src/services/geminiService.ts src/services/aiService.ts && git commit -m "feat(ai): integrate Gemini vision OCR and clinical symptom triage engine" && git push -u origin feature/ml-ai-triage
```
