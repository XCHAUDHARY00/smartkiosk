import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { PatientFeedback } from '../../types';
import { playTouchFeedback, playSuccessChime } from '../../services/speechService';

interface FeedbackModalProps {
  tokenNumber: string;
  onClose: () => void;
  onSubmit: (feedback: PatientFeedback) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  tokenNumber,
  onClose,
  onSubmit
}) => {
  const [easeRating, setEaseRating] = useState(5);
  const [voiceClarityRating, setVoiceClarityRating] = useState(5);
  const [kioskHelpful, setKioskHelpful] = useState(true);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    playTouchFeedback();
    const feedback: PatientFeedback = {
      id: `fb_${Date.now()}`,
      tokenNumber,
      easeRating,
      voiceClarityRating,
      preferredLanguage: 'Hindi / Regional',
      kioskHelpful,
      comments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSubmit(feedback);
    setSubmitted(true);
    playSuccessChime();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Thank You! / धन्यवाद!</h3>
            <p className="text-xs text-slate-500">Your feedback helps improve public hospital OPD care.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full w-fit mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Patient Experience Feedback
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                Rate Your Kiosk Experience
              </h3>
              <p className="text-xs text-slate-500">
                How easy was it to complete your pre-consultation intake?
              </p>
            </div>

            {/* Ease of Use Stars */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ease of Voice & Touch Kiosk (सरलता)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      playTouchFeedback();
                      setEaseRating(star);
                    }}
                    className={`p-1.5 transition-transform hover:scale-110 cursor-pointer ${
                      star <= easeRating ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Clarity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Doctor Voice & Audio Clarity (डॉक्टर आवाज़ की स्पष्टता)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      playTouchFeedback();
                      setVoiceClarityRating(star);
                    }}
                    className={`p-1.5 transition-transform hover:scale-110 cursor-pointer ${
                      star <= voiceClarityRating ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Was it helpful */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Did this save waiting time for doctor consultation?
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playTouchFeedback();
                    setKioskHelpful(true);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    kioskHelpful
                      ? 'bg-teal-50 border-teal-500 text-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Yes (हाँ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTouchFeedback();
                    setKioskHelpful(false);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !kioskHelpful
                      ? 'bg-red-50 border-red-500 text-red-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> No (नहीं)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Submit Feedback (प्रतिक्रिया भेजें)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
