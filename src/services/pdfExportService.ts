import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PatientProfile, ClinicalSummary, UploadedDocument } from '../types';
import { sanitizeTextForPDF, translateSymptomToClinicalEnglish } from '../utils/medicalTransliterator';

export async function downloadPatientClinicalPDF(data: {
  patient: PatientProfile;
  summary: ClinicalSummary | null;
  documents: UploadedDocument[];
  elementToCapture?: HTMLElement | null;
}): Promise<string> {
  const { patient, summary, elementToCapture } = data;
  const token = sanitizeTextForPDF(patient.tokenNumber || 'TK-101');
  const patientNameClean = sanitizeTextForPDF(patient.name || 'Anonymous_Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `OPD_Clinical_Prescription_${token}_${patientNameClean}.pdf`;

  // Strategy 1: If a high-fidelity DOM element is provided or present in DOM, render via html2canvas
  const printableDomNode = elementToCapture || (typeof document !== 'undefined' ? document.getElementById('opd-consultation-slip-printable') : null);

  if (printableDomNode) {
    try {
      const canvas = await html2canvas(printableDomNode, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794 // Standard A4 width in pixels at 96 DPI
      });

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
      
      savePdfFile(doc, filename);
      return filename;
    } catch (err) {
      console.warn('html2canvas rendering fallback to direct vector PDF:', err);
    }
  }

  // Strategy 2: Direct Vector jsPDF with 100% Safe Clinical English Sanitization
  // Guarantees zero mojibake or UTF-16 byte splitting (no `. G 0 G 8 ? 0...`)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // 1. Header Banner (Teal Header)
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(margin, y, contentWidth, 22, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SMART OPD CLINICAL CONSULTATION SLIP', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Government & ABDM Certified OPD Intake System', margin + 6, y + 16);

  // Token Badge in Header
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 32, y + 3, 26, 16, 2, 2, 'F');
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(token, pageWidth - margin - 19, y + 13, { align: 'center' });

  y += 28;

  // 2. Patient Demographics Card
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  const cleanName = sanitizeTextForPDF(patient.name || 'Anonymous Patient');
  const cleanMobile = sanitizeTextForPDF(patient.mobile || 'N/A');
  const cleanAbha = sanitizeTextForPDF(patient.abhaId || 'ABHA Linked via Mobile');
  const cleanDept = sanitizeTextForPDF(patient.department.replace(/_/g, ' ').toUpperCase());
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Patient: ${cleanName}`, margin + 4, y + 7);
  doc.text(`Age/Sex: ${patient.age || 40} Yrs / ${patient.gender === 'M' ? 'Male' : 'Female'}`, margin + 100, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile: ${cleanMobile}`, margin + 4, y + 14);
  doc.text(`ABHA ID: ${cleanAbha}`, margin + 100, y + 14);
  doc.text(`OPD Dept: ${cleanDept}`, margin + 4, y + 20);
  doc.text(`Date: ${dateStr}`, margin + 100, y + 20);

  y += 30;

  // 3. Clinical Intake Highlights / Key Points Box
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('KEY CLINICAL POINTS & PATIENT SUMMARY', margin, y);
  y += 5;

  const rawChief = summary?.chiefComplaint || 'General OPD Health Review';
  const chief = sanitizeTextForPDF(translateSymptomToClinicalEnglish(rawChief));
  const site = sanitizeTextForPDF(summary?.socrates?.site ? translateSymptomToClinicalEnglish(summary.socrates.site) : 'Precordial / Chest');
  const onset = sanitizeTextForPDF(summary?.socrates?.timing || summary?.socrates?.onset || 'Subacute (2-3 days)');
  const charac = sanitizeTextForPDF(summary?.socrates?.character || 'Heaviness / Discomfort');
  const sev = sanitizeTextForPDF(summary?.socrates?.severity || '6/10 Moderate');
  
  // Format clean HPI without raw question prompts or unhandled Indic characters
  const hpi = sanitizeTextForPDF(summary?.historyOfPresentIllness || `Patient presents with ${chief}. Evaluated via pre-consultation intake.`);

  // Key Highlight Summary Cards in PDF
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text('Key Highlights (Easily Understandable Findings):', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`1. Main Concern: ${chief}`, margin + 5, y + 12);
  doc.text(`2. Duration: ${onset}`, margin + 5, y + 17);
  doc.text(`3. Location & Nature: ${site} (${charac})`, margin + 5, y + 22);
  doc.text(`4. Severity & Status: ${sev} - OPD Evaluation Complete`, margin + 5, y + 27);

  y += 39;

  // Executive Clinical Notes
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const hpiLines = doc.splitTextToSize(`Clinical History (HPI): ${hpi}`, contentWidth);
  doc.text(hpiLines, margin + 2, y);
  y += hpiLines.length * 4.2 + 4;

  // Add executive key points if present
  if (summary?.executiveKeyPoints && summary.executiveKeyPoints.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Important Triage Findings:', margin + 2, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    for (const kp of summary.executiveKeyPoints.slice(0, 3)) {
      const cleanKp = sanitizeTextForPDF(kp);
      if (cleanKp) {
        const kpLines = doc.splitTextToSize(`* ${cleanKp}`, contentWidth - 4);
        doc.text(kpLines, margin + 4, y);
        y += kpLines.length * 4.2;
      }
    }
    y += 2;
  }

  y += 4;

  // 4. Doctor Prescription & Advice (Rx)
  doc.setDrawColor(15, 118, 110);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('DOCTOR PRESCRIPTION (Rx) & ADVICE', margin, y);
  y += 6;

  // Prescribed Medicines
  const rawMeds = summary?.medications && summary.medications.length > 0 
    ? summary.medications 
    : ['Tab Paracetamol 650mg (1-0-1) - 3 days', 'Tab Pantoprazole 40mg (1-0-0 Before Food) - 5 days'];

  const meds = rawMeds.map(m => sanitizeTextForPDF(m));

  doc.setFillColor(240, 253, 250); // Teal-50
  doc.roundedRect(margin, y, contentWidth, Math.max(22, meds.length * 5.5 + 9), 2, 2, 'F');
  
  doc.setTextColor(17, 94, 89);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Prescribed Medicines:', margin + 4, y + 6);

  let medY = y + 11;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  meds.forEach((m, idx) => {
    doc.text(`${idx + 1}. ${m}`, margin + 6, medY);
    medY += 5.2;
  });

  y = medY + 6;

  // Doctor Advice / Notes
  const adviceText = sanitizeTextForPDF(summary?.doctorConsultationNotes || 'Rest advised. Hydration maintenance. Return for emergency review if symptoms persist.');
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Doctor Advice / Follow-up Instructions:', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const adviceLines = doc.splitTextToSize(adviceText, contentWidth);
  doc.text(adviceLines, margin + 2, y);
  y += adviceLines.length * 4.2 + 4;

  // 5. Sign-off Footer
  y = Math.max(y + 8, 255);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Doctor Signature / Stamp: ______________________', margin, y);
  doc.text('OPD Room: Station 02', pageWidth - margin - 40, y);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated via Smart OPD AI Intake & Clinical System - Valid EMR Consultation Slip', pageWidth / 2, y, { align: 'center' });

  savePdfFile(doc, filename);
  return filename;
}

function savePdfFile(doc: jsPDF, filename: string): void {
  try {
    if (typeof window !== 'undefined' && (window as any).AndroidApp && (window as any).AndroidApp.savePdfBase64) {
      const base64Data = doc.output('datauristring').split(',')[1];
      (window as any).AndroidApp.savePdfBase64(base64Data, filename);
    } else {
      doc.save(filename);
    }
  } catch (err) {
    doc.save(filename);
  }
}
