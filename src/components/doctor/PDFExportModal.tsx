import React, { useState } from 'react';
import { X, Download, Printer, CheckCircle2, Loader2 } from 'lucide-react';
import { PatientProfile, ClinicalSummary, UploadedDocument } from '../../types';
import { downloadPatientClinicalPDF } from '../../services/pdfExportService';
import { AppLogo } from '../common/AppLogo';
import { PrintableConsultationSlip } from '../common/PrintableConsultationSlip';

interface PDFExportModalProps {
  patient: PatientProfile;
  summary: ClinicalSummary | null;
  documents: UploadedDocument[];
  onClose: () => void;
}

export const PDFExportModal: React.FC<PDFExportModalProps> = ({
  patient,
  summary,
  documents,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await downloadPatientClinicalPDF({ patient, summary, documents });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col my-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4 shrink-0">
          <AppLogo variant="icon" size="md" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
              Official ABDM OPD Consultation Slip
            </h3>
            <p className="text-xs text-slate-500">
              Government Certified Clinical EMR Summary • Token {patient.tokenNumber}
            </p>
          </div>
        </div>

        {/* Scrollable Document Preview */}
        <div className="overflow-y-auto flex-1 pr-1 -mr-1 border border-slate-200 rounded-2xl p-2 sm:p-4 bg-slate-100/50">
          <PrintableConsultationSlip
            patient={patient}
            summary={summary}
            id="opd-consultation-slip-printable"
            className="shadow-md"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 shrink-0">
          <div>
            {downloadSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> PDF slip downloaded successfully!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer touch-target"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Slip</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-bold text-xs shadow-xs cursor-pointer touch-target transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Slip</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
