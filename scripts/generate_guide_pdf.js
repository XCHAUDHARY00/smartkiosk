import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

const doc = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4",
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 15;
const contentWidth = pageWidth - margin * 2;
let y = margin;

function checkPage(needed = 20) {
  if (y + needed > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }
}

// Header
doc.setFillColor(15, 23, 42); // slate-900
doc.rect(margin, y, contentWidth, 24, "F");

doc.setTextColor(255, 255, 255);
doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.text("SMART OPD - TEAM GITHUB SETUP & PUSH GUIDE", margin + 6, y + 10);

doc.setFontSize(9);
doc.setFont("helvetica", "normal");
doc.setTextColor(56, 189, 248); // sky-400
doc.text("Repo: https://github.com/XCHAUDHARY00/SmartOpd.git", margin + 6, y + 18);

y += 30;

// Section 0
doc.setFillColor(241, 245, 249);
doc.rect(margin, y, contentWidth, 22, "F");
doc.setTextColor(15, 23, 42);
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text("0. Sabse Pehle (Repo Owner ke liye):", margin + 4, y + 6);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(51, 65, 85);
doc.text("1. GitHub repo par jao: https://github.com/XCHAUDHARY00/SmartOpd", margin + 4, y + 12);
doc.text("2. Settings -> Collaborators -> Add people me jaakar baaki 3 logo ko invite bhej do.", margin + 4, y + 17);

y += 28;

// Section 1
doc.setFillColor(241, 245, 249);
doc.rect(margin, y, contentWidth, 34, "F");
doc.setTextColor(15, 23, 42);
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text("1. ZIP File ko VS Code me Open Kaise Karein? (Sabke liye same):", margin + 4, y + 6);

doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
doc.setTextColor(51, 65, 85);
doc.text("1. ZIP file par Right Click karo -> 'Extract All' (Unzip karo).", margin + 4, y + 12);
doc.text("2. VS Code open karo -> 'File' -> 'Open Folder...' -> Extracted folder select karo.", margin + 4, y + 17);
doc.text("3. Terminal open karo: Press Ctrl + ~ (ya top menu: Terminal -> New Terminal).", margin + 4, y + 22);
doc.text("4. Ab neeche se apna-apna ek command copy karke terminal me paste karo aur Enter dabao.", margin + 4, y + 27);

y += 40;

const members = [
  {
    num: "MEMBER 1",
    name: "HIMANSHU",
    role: "UI / UX Design & Localization",
    desc: "Official SMART OPD Vector Logo, 14 Languages Dictionary, Layout Styles, README & Guides.",
    cmd: "git init && git remote remove origin 2>/dev/null; git remote add origin https://github.com/XCHAUDHARY00/SmartOpd.git && git checkout -B feature/ui-ux-branding && git add public/ src/components/common/AppLogo.tsx src/components/Header.tsx src/components/kiosk/LanguageDropdown.tsx src/utils/roleTranslations.ts src/utils/translations.ts src/index.css index.html README.md ANDROID_STUDIO_GUIDE.md && git commit -m \"feat(ui): setup branding, official logo, translations and design layout\" && git push -u origin feature/ui-ux-branding"
  },
  {
    num: "MEMBER 2",
    name: "RAHUL CHAUHAN",
    role: "Frontend React.js",
    desc: "Patient Kiosk Stepper (Identity, Voice Interview, Camera OCR step, Token Slip), Doctor Station Console, React State Types.",
    cmd: "git init && git remote remove origin 2>/dev/null; git remote add origin https://github.com/XCHAUDHARY00/SmartOpd.git && git fetch origin && git checkout -B feature/frontend-kiosk-doctor && git add src/App.tsx src/types.ts src/components/RoleSelectionScreen.tsx src/components/kiosk/ src/components/doctor/ && git commit -m \"feat(react): build patient kiosk intake flow and doctor station console\" && git push -u origin feature/frontend-kiosk-doctor"
  },
  {
    num: "MEMBER 3",
    name: "ABHISHEK",
    role: "Machine Learning & AI Triage",
    desc: "Gemini Multimodal OCR Vision Scanner, Clinical Triage scoring, Red-flag alert logic, Hospital Information System pushing.",
    cmd: "git init && git remote remove origin 2>/dev/null; git remote add origin https://github.com/XCHAUDHARY00/SmartOpd.git && git fetch origin && git checkout -B feature/ml-ai-triage && git add src/services/geminiService.ts src/services/aiService.ts && git commit -m \"feat(ai): integrate Gemini vision OCR and clinical symptom triage engine\" && git push -u origin feature/ml-ai-triage"
  },
  {
    num: "MEMBER 4",
    name: "RAJ CHAUDHARY",
    role: "AI Backend & Android Bridge",
    desc: "Express Backend Server, Port 3000 Routing, WebAudio Chime Synthesizer, PDF Generation Service, Android Native Java Bridge.",
    cmd: "git init && git remote remove origin 2>/dev/null; git remote add origin https://github.com/XCHAUDHARY00/SmartOpd.git && git fetch origin && git checkout -B feature/backend-android-bridge && git add server.ts package.json tsconfig.json vite.config.ts .env.example src/services/pdfExportService.ts src/services/speechService.ts android/ metadata.json app-favicon.ico && git commit -m \"feat(backend): configure Express server, WebAudio chime, PDF engine and Android native bridge\" && git push -u origin feature/backend-android-bridge"
  }
];

members.forEach((m, idx) => {
  checkPage(42);
  
  // Card header
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 38, "FD");

  doc.setTextColor(14, 116, 144); // cyan-700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`${m.num}: ${m.name} (${m.role})`, margin + 3, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Kaam: ${m.desc}`, margin + 3, y + 10);

  // Command Box
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 2, y + 13, contentWidth - 4, 22, "F");

  doc.setTextColor(56, 189, 248);
  doc.setFont("courier", "bold");
  doc.setFontSize(6.2);
  
  const splitCmd = doc.splitTextToSize(m.cmd, contentWidth - 8);
  doc.text(splitCmd, margin + 4, y + 17);

  y += 42;
});

checkPage(30);

// PR Merge Order
doc.setFillColor(240, 253, 250);
doc.setDrawColor(153, 246, 228);
doc.rect(margin, y, contentWidth, 26, "FD");

doc.setTextColor(15, 118, 110);
doc.setFont("helvetica", "bold");
doc.setFontSize(9.5);
doc.text("GitHub par PR Merge Karne Ka Sahi Order:", margin + 4, y + 6);

doc.setFont("helvetica", "normal");
doc.setFontSize(8);
doc.setTextColor(51, 65, 85);
doc.text("1. Merge Himanshu's PR (feature/ui-ux-branding) -> main", margin + 4, y + 11);
doc.text("2. Merge Rahul's PR (feature/frontend-kiosk-doctor) -> main", margin + 4, y + 15);
doc.text("3. Merge Abhishek's PR (feature/ml-ai-triage) -> main", margin + 4, y + 19);
doc.text("4. Merge Raj's PR (feature/backend-android-bridge) -> main", margin + 4, y + 23);

y += 32;

const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
fs.writeFileSync(path.join(process.cwd(), "public", "SmartOpd_GitHub_Team_Guide.pdf"), pdfBuffer);
console.log("PDF generated successfully at public/SmartOpd_GitHub_Team_Guide.pdf");
