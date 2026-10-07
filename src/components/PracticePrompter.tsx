import React, { useState, useEffect, useRef } from 'react';
import {
  Shuffle,
  Quote,
  Sparkles,
  Copy,
  Check,
  Play,
  Volume2
} from 'lucide-react';
import { MeaningfulSpeech, getRandomSpeech } from '../data/speeches';

interface PracticePrompterProps {
  isRecording: boolean;
  onStartRecording?: () => void;
  onUseSpeechForBenchmark: (speech: MeaningfulSpeech) => void;
}

export const PracticePrompter: React.FC<PracticePrompterProps> = ({
  isRecording,
  onStartRecording,
  onUseSpeechForBenchmark,
}) => {
  const [currentSpeech, setCurrentSpeech] = useState<MeaningfulSpeech>(() => getRandomSpeech());
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showPacingCues, setShowPacingCues] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when recording
  useEffect(() => {
    let scrollInterval: any;
    if (isRecording && autoScroll && scrollContainerRef.current) {
      scrollInterval = setInterval(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += 1;
        }
      }, 90);
    }
    return () => clearInterval(scrollInterval);
  }, [isRecording, autoScroll]);

  // Reset scroll when speech changes or recording starts
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentSpeech, isRecording]);

  const handleShuffle = () => {
    setCurrentSpeech((prev) => getRandomSpeech(prev.id));
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSpeech.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render speech text with Variation 5 breath tags
  const renderFormattedSpeech = () => {
    if (!showPacingCues) {
      return (
        <p className="prompter-text whitespace-pre-wrap text-[#1E293B]">
          {currentSpeech.text}
        </p>
      );
    }

    const sentences = currentSpeech.text.match(/[^.!?]+[.!?]+/g) || [currentSpeech.text];

    return (
      <div className="space-y-4">
        {sentences.map((sentence, idx) => (
          <p key={idx} className="prompter-text text-[#1E293B]">
            <span>{sentence.trim()}</span>
            {idx < sentences.length - 1 && (
              <span className="breath-tag">
                [breath]
              </span>
            )}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="surface flex-1 flex flex-col justify-between overflow-hidden">
      {/* Header bar matching Variation 5 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-label text-slate-500 mb-0.5">CURRENT SPEECH</div>
          <h3 className="text-xl font-extrabold text-[#1E293B] leading-tight">
            {currentSpeech.title}
          </h3>
          <div className="text-[#1CB0F6] text-xs font-bold mt-0.5">
            {currentSpeech.author} · {currentSpeech.wordCount} words
          </div>
        </div>

        <button
          onClick={handleShuffle}
          className="btn-secondary py-1.5! px-3! text-xs flex items-center gap-1.5"
          title="Pick another random speech to practice"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Prompter Controls strip */}
      <div className="py-2 border-y-2 border-[#E5E7EB] flex items-center justify-between text-xs text-[#64748B] mb-3">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>~{currentSpeech.estimatedSeconds}s at 140 WPM</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPacingCues(!showPacingCues)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              showPacingCues
                ? 'bg-[#E0F2FE] text-[#0284C7]'
                : 'text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
          >
            Breath Cues {showPacingCues ? 'On' : 'Off'}
          </button>

          <div className="flex items-center border-2 border-[#E5E7EB] rounded-lg overflow-hidden text-[10px] font-bold">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 cursor-pointer ${fontSize === 'sm' ? 'bg-[#1CB0F6] text-white' : 'hover:bg-[#F1F5F9] text-[#1E293B]'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 cursor-pointer ${fontSize === 'base' ? 'bg-[#1CB0F6] text-white' : 'hover:bg-[#F1F5F9] text-[#1E293B]'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 cursor-pointer ${fontSize === 'lg' ? 'bg-[#1CB0F6] text-white' : 'hover:bg-[#F1F5F9] text-[#1E293B]'}`}
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Teleprompter Text Display */}
      <div
        ref={scrollContainerRef}
        className={`p-3 overflow-y-auto max-h-56 scroll-smooth select-text ${
          fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-xl' : 'text-base'
        }`}
      >
        {renderFormattedSpeech()}
      </div>

      {/* Coach Note Tip */}
      <div className="mt-3 p-3 bg-[#F0F9FF] rounded-xl border-2 border-[#E5E7EB] text-xs text-[#1E293B] flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-[#FF9600] shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong className="font-extrabold text-[#0284C7]">Coach Cadence Tip:</strong>{' '}
          {currentSpeech.keyPacingNote}
        </p>
      </div>

      {/* Bottom Action Button matching Variation 5: "Read This Speech" */}
      <div className="mt-4 pt-3 border-t-2 border-[#E5E7EB] flex items-center justify-between gap-3">
        <button
          onClick={handleCopy}
          className="text-[#94A3B8] hover:text-[#1E293B] flex items-center gap-1 transition-colors cursor-pointer text-xs font-bold"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#58CC02]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Text'}</span>
        </button>

        <div className="flex items-center gap-2">
          {!isRecording && onStartRecording && (
            <button
              onClick={onStartRecording}
              className="btn-primary text-xs py-2! px-4! flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Read This Speech</span>
            </button>
          )}

          <button
            onClick={() => onUseSpeechForBenchmark(currentSpeech)}
            className="btn-secondary text-xs py-2! px-3!"
            title="Instant benchmark analysis using this speech"
          >
            ⚡ Test Speech
          </button>
        </div>
      </div>
    </div>
  );
};
