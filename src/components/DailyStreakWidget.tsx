import React, { useState } from 'react';
import { Flame, Trophy, Calendar, CheckCircle2, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyStreakState } from '../types';
import { getWeeklyDayTrail } from '../utils/streak';

interface DailyStreakWidgetProps {
  streak: DailyStreakState;
  onRecordTodayPractice?: () => void;
  onStartPractice?: () => void;
}

export const DailyStreakWidget: React.FC<DailyStreakWidgetProps> = ({
  streak,
  onRecordTodayPractice,
  onStartPractice,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const dayTrail = getWeeklyDayTrail(streak.practiceHistory);

  const handleCelebrate = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#58CC02', '#1CB0F6', '#FF9600', '#FFC800'],
      });
    } catch {
      // non-critical
    }
    if (onRecordTodayPractice) {
      onRecordTodayPractice();
    }
  };

  const getMotivationalMessage = () => {
    if (streak.todayPracticed) {
      if (streak.currentStreak >= 7) {
        return "Incredible mastery! You've maintained a full week of daily speech consistency.";
      }
      if (streak.currentStreak >= 3) {
        return `Day ${streak.currentStreak} secured! Regular daily practice locks in lower filler counts.`;
      }
      return "Today's daily speech target is complete! Your vocal muscles thank you.";
    }

    if (streak.currentStreak > 0) {
      return `Practice today to protect your ${streak.currentStreak}-day streak and elevate your cadence!`;
    }

    return 'Deliver 1 quick practice speech today to initiate your daily communication streak.';
  };

  return (
    <div className="surface space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="text-4xl sm:text-5xl font-extrabold text-[#FF9600] font-sans tracking-tight shrink-0 flex items-center gap-1">
            <span>{streak.currentStreak}</span>
            <Flame className="w-8 h-8 fill-[#FF9600] text-[#FF9600]" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-[#1E293B]">
                Daily Streak
              </h3>

              {streak.todayPracticed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#58CC02]" /> Today Done
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF2DE] text-[#D97706] border border-[#FDE68A] text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                  Pending Today
                </span>
              )}
            </div>

            <p className="font-label text-slate-500 mt-0.5">
              TARGET: 140 WPM · ≤2 FILLERS · DAILY IMPROVEMENT
            </p>
            <p className="text-xs text-[#64748B] mt-1 font-medium">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>

        {/* Milestone Stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB] text-xs flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#FF9600]" />
            <span className="font-label">BEST:</span>
            <strong className="text-[#1E293B] font-extrabold">{streak.bestStreak}d</strong>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB] text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1CB0F6]" />
            <span className="font-label">TOTAL:</span>
            <strong className="text-[#1E293B] font-extrabold">{streak.totalPracticeDays}d</strong>
          </div>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-8 h-8 rounded-xl text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#F1F5F9] border-2 border-transparent hover:border-[#E5E7EB] flex items-center justify-center transition-colors cursor-pointer"
            title="How daily streak tracking works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Visual Activity Trail */}
      <div className="pt-3 border-t-2 border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-label text-[#64748B] mr-1 hidden sm:inline">
            PAST 7 DAYS:
          </span>

          <div className="flex items-center gap-2">
            {dayTrail.map((day) => (
              <div
                key={day.dateStr}
                className="flex flex-col items-center gap-1"
                title={`${day.dateStr} · ${day.practiced ? 'Speech Practiced ✓' : 'No Session'}`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all ${
                    day.practiced
                      ? 'bg-[#58CC02] text-white shadow-xs'
                      : day.isToday
                      ? 'bg-white text-[#FF9600] border-2 border-[#FF9600] border-dashed'
                      : 'bg-[#F1F5F9] text-[#94A3B8] border-2 border-[#E2E8F0]'
                  }`}
                >
                  {day.practiced ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : day.isToday ? (
                    <span className="text-[9px] font-extrabold">TODAY</span>
                  ) : (
                    <span className="text-[10px] font-bold">{day.dayName}</span>
                  )}
                </div>
                <span className="text-[10px] font-extrabold text-[#94A3B8]">
                  {day.dayName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!streak.todayPracticed && onRecordTodayPractice && (
            <button
              onClick={handleCelebrate}
              className="btn-secondary flex items-center gap-1.5 text-xs text-[#FF9600]! border-[#FED7AA]! hover:bg-[#FFF7ED]!"
              title="Claim streak for today"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9600]" />
              <span>Mark Today Done</span>
            </button>
          )}

          {onStartPractice && (
            <button
              onClick={onStartPractice}
              className="btn-primary text-xs py-2! px-4! flex items-center gap-1"
            >
              <span>{streak.todayPracticed ? 'Practice Another Speech' : 'Practice Now to Keep Streak'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Explainer Drawer */}
      {showInfo && (
        <div className="p-3 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB] text-xs text-[#475569] space-y-1.5">
          <p className="font-extrabold text-[#1E293B]">Why Daily Practice Matters:</p>
          <p className="leading-relaxed">
            Deliberate verbal communication forms subconscious muscle memory. Practicing just 1 speech session (30–60 seconds) every day reduces reflexive filler words like "um" and "you know" significantly faster than infrequent long sessions.
          </p>
          <p className="text-[11px] text-[#58CC02] font-semibold">
            • Complete any live recording, instant benchmark test, or vocal drill to maintain your streak.
            <br />
            • Your streak state is safely stored in your browser's local storage and updates each calendar day.
          </p>
        </div>
      )}
    </div>
  );
};
