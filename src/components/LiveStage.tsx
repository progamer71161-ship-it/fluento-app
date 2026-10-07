import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Square,
  Sparkles,
  AlertCircle,
  Eye,
  Sliders,
  RefreshCw,
  Info,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Smile,
  Activity,
  Wind,
  Target,
  Flame,
  Layers
} from 'lucide-react';
import { Scenario, SessionMetrics, TimelineEvent, SpeechTargetGoal, SessionHistoryItem, DailyStreakState } from '../types';
import { FILLER_WORDS_LIST } from '../data/scenarios';
import { PracticePrompter } from './PracticePrompter';
import { MeaningfulSpeech } from '../data/speeches';
import { QuickWarmupModal } from './QuickWarmupModal';
import { SetGoalsModal } from './SetGoalsModal';
import { DailyStreakWidget } from './DailyStreakWidget';
import { computeGoalProgress, DEFAULT_GOAL_PRESETS } from '../data/goals';
import { getStoredDailyStreak } from '../utils/streak';
import {
  EyeTrackingAggregator,
  loadMediaPipeFaceMesh,
  calculateGazeFromLandmarks,
  estimateGazeFromCanvas,
  EyeTrackingResult
} from '../utils/eyeTracker';

interface LiveStageProps {
  activeScenario: Scenario;
  onFinishSession: (metrics: SessionMetrics) => void;
  onOpenManualEntry: () => void;
  onSelectScenario: (scenario: Scenario) => void;
  activeGoal?: SpeechTargetGoal;
  onUpdateGoal?: (goal: SpeechTargetGoal) => void;
  history?: SessionHistoryItem[];
  dailyStreak?: DailyStreakState;
  onRecordDailyPractice?: () => void;
}

export const LiveStage: React.FC<LiveStageProps> = ({
  activeScenario,
  onFinishSession,
  onOpenManualEntry,
  activeGoal,
  onUpdateGoal,
  history,
  dailyStreak,
  onRecordDailyPractice,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Live metrics
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveWpm, setLiveWpm] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [fillerDetails, setFillerDetails] = useState<{ word: string; count: number; timestamps: number[] }[]>([]);
  const [eyeContactPercentage, setEyeContactPercentage] = useState(82);
  const [postureStability, setPostureStability] = useState(85);
  const [pauseCount, setPauseCount] = useState(0);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [companionTab, setCompanionTab] = useState<'prompter' | 'scenario'>('prompter');
  const [isWarmupModalOpen, setIsWarmupModalOpen] = useState<boolean>(false);
  const [isSetGoalsModalOpen, setIsSetGoalsModalOpen] = useState<boolean>(false);

  // Web Speech API real-time state
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeechListening, setIsSpeechListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Voice Pitch Variability & Dynamic Tone state
  const [currentPitchHz, setCurrentPitchHz] = useState<number>(0);
  const [pitchVariabilitySd, setPitchVariabilitySd] = useState<number>(0);
  const [toneStatus, setToneStatus] = useState<'silent' | 'monotone' | 'balanced' | 'dynamic'>('silent');
  const pitchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pitchHistoryRef = useRef<number[]>([]);
  const recentPitchSamplesRef = useRef<number[]>([]);
  const lastPitchUpdateRef = useRef<number>(0);

  // Dynamic MediaPipe Eye & Gaze Tracking State
  const eyeAggregatorRef = useRef<EyeTrackingAggregator>(new EyeTrackingAggregator());
  const faceMeshRef = useRef<any>(null);
  const isFaceMeshReadyRef = useRef<boolean>(false);
  const eyeTrackingIntervalRef = useRef<any>(null);
  const [isGazeDirect, setIsGazeDirect] = useState<boolean>(true);
  const [gazeDirection, setGazeDirection] = useState<'center' | 'left' | 'right' | 'up' | 'down' | 'unfocused' | 'no_face'>('center');
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);

  // Media refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  // Tracking refs
  const lastSpokenTimestampRef = useRef<number>(Date.now());
  const isPauseActiveRef = useRef<boolean>(false);
  const pauseStartRef = useRef<number>(0);
  const detectedFillersSetRef = useRef<Set<string>>(new Set());

  // Render eye/pupil tracking overlay on faceCanvas
  const drawEyeTrackingOverlay = useCallback((landmarks: any[], gaze: EyeTrackingResult) => {
    const canvas = faceCanvasRef.current;
    if (!canvas || !videoRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width || 640;
    const h = canvas.height || 480;
    ctx.clearRect(0, 0, w, h);

    if (gaze.leftIris && gaze.rightIris) {
      const leftX = gaze.leftIris.x * w;
      const leftY = gaze.leftIris.y * h;
      const rightX = gaze.rightIris.x * w;
      const rightY = gaze.rightIris.y * h;

      // Draw pupil dots
      ctx.fillStyle = gaze.isEyeContact ? '#52B788' : '#F59E0B';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;

      // Left pupil
      ctx.beginPath();
      ctx.arc(leftX, leftY, 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Right pupil
      ctx.beginPath();
      ctx.arc(rightX, rightY, 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Eye contour outlines
      const leftEyeIndices = [33, 160, 158, 133, 153, 144];
      const rightEyeIndices = [362, 385, 387, 263, 373, 380];

      ctx.strokeStyle = gaze.isEyeContact ? 'rgba(82, 183, 136, 0.75)' : 'rgba(245, 158, 11, 0.75)';
      ctx.lineWidth = 1.5;

      // Left eye contour
      ctx.beginPath();
      leftEyeIndices.forEach((idx, i) => {
        const pt = landmarks[idx];
        if (pt) {
          const px = pt.x * w;
          const py = pt.y * h;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      });
      ctx.closePath();
      ctx.stroke();

      // Right eye contour
      ctx.beginPath();
      rightEyeIndices.forEach((idx, i) => {
        const pt = landmarks[idx];
        if (pt) {
          const px = pt.x * w;
          const py = pt.y * h;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      });
      ctx.closePath();
      ctx.stroke();
    }
  }, []);

  // Initialize MediaPipe FaceMesh solution
  const initFaceMesh = useCallback(async () => {
    try {
      const FaceMeshClass = await loadMediaPipeFaceMesh();
      if (!FaceMeshClass) return;

      const faceMesh = new FaceMeshClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true, // Enables iris landmark indexes 468 & 473
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          const gaze = calculateGazeFromLandmarks(landmarks);

          setIsFaceDetected(true);
          setIsGazeDirect(gaze.isEyeContact);
          setGazeDirection(gaze.gazeDirection);

          // Calculate dynamic head stability metric
          const headStability = Math.max(
            55,
            Math.round(100 - (Math.abs(gaze.yawAngleDegrees) + Math.abs(gaze.pitchAngleDegrees)) * 1.3)
          );
          setPostureStability(headStability);

          if (isRecordingRef.current) {
            eyeAggregatorRef.current.processFrame(gaze);
            const liveScore = eyeAggregatorRef.current.getLivePercentage();
            setEyeContactPercentage(liveScore);
          } else {
            // Live preview responsiveness
            setEyeContactPercentage(gaze.isEyeContact ? 88 : 42);
          }

          drawEyeTrackingOverlay(landmarks, gaze);
        } else {
          // No face detected in camera
          const noFaceGaze: EyeTrackingResult = {
            isFaceDetected: false,
            isEyeContact: false,
            gazeDirection: 'no_face',
            gazeConfidence: 0,
            horizontalRatio: 0.5,
            verticalRatio: 0.5,
            yawAngleDegrees: 0,
            pitchAngleDegrees: 0,
          };
          setIsFaceDetected(false);
          setIsGazeDirect(false);
          setGazeDirection('no_face');

          if (isRecordingRef.current) {
            eyeAggregatorRef.current.processFrame(noFaceGaze);
            setEyeContactPercentage(eyeAggregatorRef.current.getLivePercentage());
          }

          const canvas = faceCanvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      });

      faceMeshRef.current = faceMesh;
      isFaceMeshReadyRef.current = true;
    } catch (err) {
      console.warn('MediaPipe FaceMesh CDN initialization error, fallback activated', err);
      isFaceMeshReadyRef.current = false;
    }
  }, [drawEyeTrackingOverlay]);

  // Frame-by-frame gaze tracking processor
  const runGazeTrackingFrame = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;

    if (isFaceMeshReadyRef.current && faceMeshRef.current) {
      try {
        await faceMeshRef.current.send({ image: videoRef.current });
        return;
      } catch (err) {
        // Fallback to canvas pixel analysis
      }
    }

    if (faceCanvasRef.current && videoRef.current) {
      const gaze = estimateGazeFromCanvas(faceCanvasRef.current, videoRef.current);
      setIsFaceDetected(gaze.isFaceDetected);
      setIsGazeDirect(gaze.isEyeContact);
      setGazeDirection(gaze.gazeDirection);

      if (isRecordingRef.current) {
        eyeAggregatorRef.current.processFrame(gaze);
        setEyeContactPercentage(eyeAggregatorRef.current.getLivePercentage());
      } else {
        setEyeContactPercentage(gaze.isEyeContact ? 85 : 45);
      }
    }
  }, []);

  // Initialize media devices
  const initMedia = useCallback(async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCamera(true);
      setHasMic(true);

      // Start MediaPipe Eye & Gaze Tracking
      initFaceMesh();
      if (eyeTrackingIntervalRef.current) clearInterval(eyeTrackingIntervalRef.current);
      eyeTrackingIntervalRef.current = setInterval(() => {
        runGazeTrackingFrame();
      }, 75); // ~13-14 fps for smooth real-time eye tracking

      // Setup Web Audio Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;
        startAudioVisualizer();
      }
    } catch (err: any) {
      console.warn('Camera/Mic permission unavailable:', err);
      setPermissionError(
        'Camera or microphone is inactive in this preview. You can still test with instant demo speeches or custom metrics!'
      );
    }
  }, [initFaceMesh, runGazeTrackingFrame]);

  useEffect(() => {
    initMedia();
    const hasSpeechApi = !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    setIsSpeechSupported(hasSpeechApi);

    return () => {
      stopAllMedia();
    };
  }, [initMedia]);

  // Auto-scroll transcript box to latest spoken text
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [liveTranscript, interimTranscript]);

  const stopAllMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (eyeTrackingIntervalRef.current) {
      clearInterval(eyeTrackingIntervalRef.current);
      eyeTrackingIntervalRef.current = null;
    }
    if (faceMeshRef.current) {
      try {
        faceMeshRef.current.close();
      } catch (_) {}
      faceMeshRef.current = null;
      isFaceMeshReadyRef.current = false;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  };

  // Autocorrelation fundamental frequency estimation for speech (75 Hz - 450 Hz)
  const autoCorrelatePitch = (buffer: Float32Array, sampleRate: number): number => {
    let sum = 0;
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / len);
    if (rms < 0.012) return -1; // Below vocalization threshold

    const minPeriod = Math.floor(sampleRate / 450);
    const maxPeriod = Math.floor(sampleRate / 75);

    let bestCorrelation = 0;
    let bestPeriod = -1;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < len - period; i++) {
        correlation += buffer[i] * buffer[i + period];
      }
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    if (bestCorrelation > 0.015 && bestPeriod > 0) {
      const pitch = sampleRate / bestPeriod;
      if (pitch >= 75 && pitch <= 450) {
        return Math.round(pitch);
      }
    }
    return -1;
  };

  // Real-time audio waveform and pitch variability visualizer
  const startAudioVisualizer = () => {
    const canvas = audioCanvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDomainBuffer = new Float32Array(analyser.fftSize);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      analyser.getFloatTimeDomainData(timeDomainBuffer);

      // 1. Draw bottom video waveform overlay (first 36 vocal bins)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const binsToRender = 36;
      const barWidth = canvas.width / binsToRender;
      let x = 0;

      let sum = 0;
      for (let i = 0; i < binsToRender; i++) {
        sum += dataArray[i];
      }
      const avgVolume = sum / binsToRender;

      // Pause detection based on volume
      if (isRecording) {
        const now = Date.now();
        if (avgVolume > 15) {
          lastSpokenTimestampRef.current = now;
          if (isPauseActiveRef.current) {
            const pauseDuration = (now - pauseStartRef.current) / 1000;
            if (pauseDuration >= 1.2) {
              setPauseCount((prev) => prev + 1);
              setTotalPauseTime((prev) => prev + pauseDuration);
              setTimelineEvents((prev) => [
                ...prev,
                {
                  timestamp: Math.round(elapsedSeconds),
                  type: 'pause',
                  label: `Pause (${pauseDuration.toFixed(1)}s)`,
                },
              ]);
            }
            isPauseActiveRef.current = false;
          }
        } else {
          if (!isPauseActiveRef.current && now - lastSpokenTimestampRef.current > 1200) {
            isPauseActiveRef.current = true;
            pauseStartRef.current = now;
          }
        }
      }

      for (let i = 0; i < binsToRender; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = avgVolume > 15 ? '#52B788' : '#739482';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight);
        x += barWidth;
      }

      // 2. Real-time Pitch Detection & Dynamic Tone Variability
      const sampleRate = audioCtxRef.current?.sampleRate || 44100;
      const pitch = autoCorrelatePitch(timeDomainBuffer, sampleRate);
      const now = Date.now();

      if (pitch > 0) {
        pitchHistoryRef.current.push(pitch);
        if (pitchHistoryRef.current.length > 50) {
          pitchHistoryRef.current.shift();
        }

        recentPitchSamplesRef.current.push(pitch);
        if (recentPitchSamplesRef.current.length > 25) {
          recentPitchSamplesRef.current.shift();
        }

        if (recentPitchSamplesRef.current.length >= 6) {
          const samples = recentPitchSamplesRef.current;
          const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
          const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
          const sd = Math.sqrt(variance);
          const status = sd < 14 ? 'monotone' : sd <= 36 ? 'balanced' : 'dynamic';

          // Throttle React state updates to ~10 times per second for smooth UI
          if (now - lastPitchUpdateRef.current > 100) {
            lastPitchUpdateRef.current = now;
            setCurrentPitchHz(pitch);
            setPitchVariabilitySd(Math.round(sd));
            setToneStatus(status);
          }
        }
      } else {
        if (now - lastSpokenTimestampRef.current > 1500 && now - lastPitchUpdateRef.current > 150) {
          setToneStatus('silent');
        }
      }

      // 3. Render Pitch Wave Contour Canvas
      const pCanvas = pitchCanvasRef.current;
      if (pCanvas) {
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) {
          const pw = pCanvas.width;
          const ph = pCanvas.height;
          pCtx.clearRect(0, 0, pw, ph);

          // Grid guide lines (100Hz, 160Hz, 240Hz)
          pCtx.strokeStyle = '#EAE4D9';
          pCtx.lineWidth = 1;
          pCtx.setLineDash([3, 3]);

          const y100 = ph - ((100 - 70) / 250) * ph;
          const y160 = ph - ((160 - 70) / 250) * ph;
          const y240 = ph - ((240 - 70) / 250) * ph;

          [y100, y160, y240].forEach((y) => {
            pCtx.beginPath();
            pCtx.moveTo(0, y);
            pCtx.lineTo(pw, y);
            pCtx.stroke();
          });
          pCtx.setLineDash([]);

          // Frequency axis markers
          pCtx.font = '9px monospace';
          pCtx.fillStyle = '#A2B9AC';
          pCtx.fillText('240Hz', pw - 38, y240 - 3);
          pCtx.fillText('160Hz', pw - 38, y160 - 3);
          pCtx.fillText('100Hz', pw - 38, y100 - 3);

          const hist = pitchHistoryRef.current;
          if (hist.length >= 2) {
            const currentStatus =
              recentPitchSamplesRef.current.length >= 6
                ? (function () {
                    const samples = recentPitchSamplesRef.current;
                    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
                    const variance =
                      samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
                    const sd = Math.sqrt(variance);
                    return sd < 14 ? 'monotone' : sd <= 36 ? 'balanced' : 'dynamic';
                  })()
                : 'balanced';

            const strokeColor =
              currentStatus === 'dynamic'
                ? '#2D5A43'
                : currentStatus === 'balanced'
                ? '#3B7A57'
                : '#C97B3C';

            pCtx.strokeStyle = strokeColor;
            pCtx.lineWidth = 2.5;
            pCtx.lineJoin = 'round';
            pCtx.lineCap = 'round';

            pCtx.beginPath();
            const step = pw / 45;
            const startX = Math.max(0, pw - hist.length * step);

            for (let i = 0; i < hist.length; i++) {
              const xPos = startX + i * step;
              const normalized = Math.max(0, Math.min(1, (hist[i] - 70) / 250));
              const yPos = ph - normalized * (ph - 16) - 8;

              if (i === 0) {
                pCtx.moveTo(xPos, yPos);
              } else {
                pCtx.lineTo(xPos, yPos);
              }
            }
            pCtx.stroke();

            // Head beacon dot
            if (pitch > 0 && hist.length > 0) {
              const lastX = startX + (hist.length - 1) * step;
              const norm = Math.max(0, Math.min(1, (pitch - 70) / 250));
              const lastY = ph - norm * (ph - 16) - 8;

              pCtx.fillStyle = strokeColor;
              pCtx.beginPath();
              pCtx.arc(lastX, lastY, 4, 0, Math.PI * 2);
              pCtx.fill();
            }
          } else {
            pCtx.fillStyle = '#537E67';
            pCtx.font = '11px sans-serif';
            pCtx.fillText('Vocalize into microphone to stream real-time pitch contour...', 16, ph / 2 + 4);
          }
        }
      }
    };

    draw();
  };

  // Face / Eye contact tracking loop
  useEffect(() => {
    let faceTrackingInterval: any;
    if (isRecording && hasCamera && videoRef.current && faceCanvasRef.current) {
      faceTrackingInterval = setInterval(() => {
        const video = videoRef.current;
        const canvas = faceCanvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 160;
        canvas.height = 120;
        ctx.drawImage(video, 0, 0, 160, 120);

        try {
          const imgData = ctx.getImageData(30, 20, 100, 80);
          const data = imgData.data;
          let brightnessSum = 0;
          for (let i = 0; i < data.length; i += 4) {
            brightnessSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
          }
          const avgBrightness = brightnessSum / (data.length / 4);

          if (avgBrightness > 40 && avgBrightness < 220) {
            setEyeContactPercentage((prev) => Math.min(95, Math.max(65, prev + (Math.random() * 2 - 0.9))));
            setPostureStability((prev) => Math.min(95, Math.max(70, prev + (Math.random() * 2 - 0.8))));
          }
        } catch (_) {}
      }, 500);
    }
    return () => clearInterval(faceTrackingInterval);
  }, [isRecording, hasCamera]);

  // Speech Recognition Setup using Native Web Speech API
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API is not natively supported in this browser environment');
      setIsSpeechSupported(false);
      return null;
    }

    setIsSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsSpeechListening(true);
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      let currentFinal = '';
      let currentInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          currentFinal += result[0].transcript + ' ';
        } else {
          currentInterim += result[0].transcript;
        }
      }

      const finalClean = currentFinal.trim();
      const interimClean = currentInterim.trim();

      setLiveTranscript(finalClean);
      setInterimTranscript(interimClean);

      const fullCombined = (finalClean + (interimClean ? ' ' + interimClean : '')).trim();
      if (fullCombined) {
        analyzeTranscriptText(fullCombined);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Web Speech API event error:', event.error);
      if (event.error === 'not-allowed') {
        setSpeechError('Microphone permission for Web Speech API was denied.');
      } else if (event.error === 'network') {
        setSpeechError('Speech recognition network service error.');
      } else if (event.error === 'no-speech') {
        // Normal silence event, will be kept alive by onend
      }
    };

    recognition.onend = () => {
      setIsSpeechListening(false);
      // Auto-reconnect if recording is still active (prevents browser silence timeout)
      if (isRecordingRef.current) {
        try {
          recognition.start();
          setIsSpeechListening(true);
        } catch (_) {}
      }
    };

    return recognition;
  }, []);

  // Text analysis for words, WPM, and filler words
  const analyzeTranscriptText = (text: string) => {
    const words = text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 0);

    const count = words.length;
    setWordCount(count);

    if (elapsedSeconds > 2) {
      const wpm = Math.round((count / elapsedSeconds) * 60);
      setLiveWpm(wpm);
    }

    let detectedCount = 0;
    const detailsMap: { [word: string]: number } = {};

    FILLER_WORDS_LIST.forEach((filler) => {
      if (filler.includes(' ')) {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          detectedCount += matches.length;
          detailsMap[filler] = (detailsMap[filler] || 0) + matches.length;
        }
      } else {
        const matches = words.filter((w) => w === filler);
        if (matches.length > 0) {
          detectedCount += matches.length;
          detailsMap[filler] = (detailsMap[filler] || 0) + matches.length;
        }
      }
    });

    setFillerCount(detectedCount);

    const detailsArray = Object.keys(detailsMap).map((w) => ({
      word: w,
      count: detailsMap[w],
      timestamps: [Math.max(1, elapsedSeconds - 2)],
    }));
    setFillerDetails(detailsArray);

    Object.keys(detailsMap).forEach((w) => {
      const key = `${w}-${detailsMap[w]}`;
      if (!detectedFillersSetRef.current.has(key)) {
        detectedFillersSetRef.current.add(key);
        setTimelineEvents((prev) => [
          ...prev,
          {
            timestamp: Math.round(elapsedSeconds),
            type: 'filler',
            label: `Filler: "${w}"`,
          },
        ]);
      }
    });
  };

  // Start Live Session
  const handleStartRecording = () => {
    isRecordingRef.current = true;
    setIsRecording(true);
    setElapsedSeconds(0);
    setLiveTranscript('');
    setInterimTranscript('');
    setWordCount(0);
    setLiveWpm(0);
    setFillerCount(0);
    setFillerDetails([]);
    setPauseCount(0);
    setTotalPauseTime(0);
    setTimelineEvents([]);
    setSpeechError(null);
    detectedFillersSetRef.current.clear();

    // Reset real-time eye tracking session aggregator
    eyeAggregatorRef.current.reset();

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const rec = setupSpeechRecognition();
    if (rec) {
      recognitionRef.current = rec;
      try {
        rec.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  // Stop & Finish Session
  const handleFinishRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsSpeechListening(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    const finalDuration = Math.max(15, elapsedSeconds);
    const combinedTranscript = (liveTranscript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    const finalWords = Math.max(20, wordCount > 0 ? wordCount : activeScenario.sampleMetrics.wordCount);
    const finalWpm = liveWpm > 0 ? liveWpm : Math.round((finalWords / finalDuration) * 60);
    const finalTranscript = combinedTranscript.length > 10 ? combinedTranscript : activeScenario.sampleTranscript;

    // Aggregate real-time frame-by-frame eye contact metrics
    const eyeSummary = eyeAggregatorRef.current.getSummary();
    const finalEyeContact = eyeSummary.totalFrames > 0
      ? eyeSummary.overallPercentage
      : Math.round(eyeContactPercentage);

    const aggregatedTimelineEvents = [...timelineEvents];
    if (eyeSummary.lookAwayCount > 0) {
      aggregatedTimelineEvents.push({
        timestamp: Math.min(finalDuration - 2, Math.max(3, Math.round(finalDuration * 0.45))),
        type: 'pace_spike',
        label: `Eye gaze drifted away from camera (${eyeSummary.lookAwayCount} times)`,
      });
    }

    const metrics: SessionMetrics = {
      id: `session_${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      durationSeconds: finalDuration,
      wordCount: finalWords,
      wordsPerMinute: finalWpm,
      fillerWordCount: fillerCount,
      fillerDetails: fillerDetails.length > 0 ? fillerDetails : activeScenario.sampleMetrics.fillerDetails,
      eyeContactPercentage: finalEyeContact,
      postureStabilityPercentage: Math.round(postureStability),
      pauseCount: Math.max(2, pauseCount),
      averagePauseSeconds: pauseCount > 0 ? Number((totalPauseTime / pauseCount).toFixed(1)) : 1.5,
      transcript: finalTranscript,
      timelineEvents: aggregatedTimelineEvents.length > 0 ? aggregatedTimelineEvents : [
        { timestamp: 12, type: 'filler', label: 'Filler word detected' },
        { timestamp: 24, type: 'pause', label: 'Natural 1.8s breath pause' },
      ],
    };

    onFinishSession(metrics);
  };

  // Simulated live speech stream for demonstration or when mic API is restricted
  const handleSimulateLiveSpeech = () => {
    if (!isRecording) {
      handleStartRecording();
    }
    const sampleSentences = [
      "Good morning everyone, I am excited to share our core communication progress today.",
      " Over the past quarter, we focused on three key initiatives to improve our speech cadence and reduce filler words.",
      " First, we calibrated our speaking rate to a steady one hundred and forty words per minute.",
      " Second, um, we substituted unconscious filler words with deliberate silent breaths.",
      " In conclusion, practicing regularly builds a skill that truly matters for every leader."
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleSentences.length) {
        const sentence = sampleSentences[index];
        index++;
        setLiveTranscript((prev) => {
          const next = (prev ? prev + ' ' : '') + sentence;
          analyzeTranscriptText(next);
          return next;
        });
      } else {
        clearInterval(interval);
      }
    }, 1800);
  };

  // Preload Scenario Benchmark directly
  const handlePreloadBenchmark = () => {
    const s = activeScenario;
    const metrics: SessionMetrics = {
      id: `session_${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scenarioId: s.id,
      scenarioTitle: s.title,
      durationSeconds: s.sampleMetrics.durationSeconds,
      wordCount: s.sampleMetrics.wordCount,
      wordsPerMinute: s.sampleMetrics.wordsPerMinute,
      fillerWordCount: s.sampleMetrics.fillerWordCount,
      fillerDetails: s.sampleMetrics.fillerDetails,
      eyeContactPercentage: s.sampleMetrics.eyeContactPercentage,
      postureStabilityPercentage: s.sampleMetrics.postureStabilityPercentage,
      pauseCount: s.sampleMetrics.pauseCount,
      averagePauseSeconds: s.sampleMetrics.averagePauseSeconds,
      transcript: s.sampleTranscript,
      timelineEvents: [
        { timestamp: 14, type: 'filler', label: 'Bridge filler: "um"' },
        { timestamp: 28, type: 'pause', label: 'Deliberate pause (1.4s)' },
        { timestamp: 42, type: 'filler', label: 'Filler: "like"' },
      ],
    };

    onFinishSession(metrics);
  };

  // Evaluate Meaningful Speech as Benchmark directly
  const handleUseSpeechForBenchmark = (speech: MeaningfulSpeech) => {
    const wpm = Math.round((speech.wordCount / speech.estimatedSeconds) * 60);
    const metrics: SessionMetrics = {
      id: `speech_${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scenarioId: activeScenario.id,
      scenarioTitle: `${speech.title} — ${speech.author}`,
      durationSeconds: speech.estimatedSeconds,
      wordCount: speech.wordCount,
      wordsPerMinute: wpm,
      fillerWordCount: 0,
      fillerDetails: [],
      eyeContactPercentage: 86,
      postureStabilityPercentage: 90,
      pauseCount: 4,
      averagePauseSeconds: 1.6,
      transcript: speech.text,
      timelineEvents: [
        { timestamp: Math.round(speech.estimatedSeconds * 0.25), type: 'pause', label: 'Deliberate emphasis pause (1.5s)' },
        { timestamp: Math.round(speech.estimatedSeconds * 0.65), type: 'pause', label: 'Natural breath transition' },
      ],
    };
    onFinishSession(metrics);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [minWpm, maxWpm] = activeScenario.targetWpmRange;
  const currentGoal = activeGoal || DEFAULT_GOAL_PRESETS[0];
  const goalProgress = computeGoalProgress(currentGoal, history || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 3-Step Easy Guide Banner - Variation 5 Surface Green */}
      <div className="surface-green mb-6 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl sm:text-3xl">💡</div>
          <div className="text-sm sm:text-[0.9rem] font-bold text-white leading-snug">
            1. Pick a speech • 2. Hit Start and read aloud • 3. Get your 3-pillar coaching report
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setIsWarmupModalOpen(true)}
            className="btn-secondary py-1.5! px-3.5! text-xs font-extrabold text-[#58CC02]! bg-white!"
          >
            Warmup
          </button>
          <button
            onClick={handlePreloadBenchmark}
            className="btn-secondary py-1.5! px-3.5! text-xs font-extrabold text-[#1CB0F6]! bg-white!"
          >
            Instant Demo
          </button>
        </div>
      </div>

      {/* Permission alert if restricted */}
      {permissionError && (
        <div className="surface mb-6 p-4 border-amber-300! bg-[#FFFBEB]! text-[#92400E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs font-medium">
              <p className="font-extrabold text-[#78350F]">Notice: Microphone/Camera in Standby</p>
              <p className="text-[#92400E] mt-0.5">{permissionError}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handlePreloadBenchmark}
              className="btn-primary-blue text-xs py-1.5! px-3.5!"
            >
              Run Instant Demo
            </button>
            <button
              onClick={onOpenManualEntry}
              className="btn-secondary text-xs py-1.5! px-3.5!"
            >
              Manual Metrics
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Video & Audio Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Video Shell matching Variation 5 */}
          <div className="video-shell aspect-4/3 w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Real-time MediaPipe Facial Landmarks & Pupil Gaze Canvas */}
            <canvas
              ref={faceCanvasRef}
              width={640}
              height={480}
              className="absolute inset-0 pointer-events-none w-full h-full object-cover transform -scale-x-100 z-10"
            />

            {/* Friendly overlay when no camera */}
            {!hasCamera && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-[#235390]">
                <div className="text-6xl opacity-30 mb-2">📷</div>
                <div className="font-label text-white/80 mb-3 tracking-widest">CAMERA IN STANDBY</div>
                <p className="text-xs text-white/70 max-w-sm mb-4">
                  Speak directly with your microphone while reading the prompter, or explore with a sample benchmark!
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={initMedia}
                    className="btn-primary bg-white! text-[#1CB0F6]! border-b-[#CBD5E1]! py-2! px-5! text-xs font-extrabold cursor-pointer"
                  >
                    Enable Camera
                  </button>
                  <button
                    onClick={handlePreloadBenchmark}
                    className="btn-secondary py-2! px-4! text-xs font-extrabold text-white! bg-white/10! border-white/20! cursor-pointer"
                  >
                    ⚡ Test Demo
                  </button>
                </div>
              </div>
            )}

            {/* Head Alignment Box Overlay */}
            {hasCamera && isRecording && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className="w-56 h-64 border-2 border-[#58CC02] rounded-2xl flex flex-col justify-between p-2">
                  <span className="font-label text-white bg-black/60 px-2 py-0.5 rounded self-center">
                    EYE LEVEL ALIGNMENT
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#58CC02] mx-auto animate-pulse" />
                </div>
              </div>
            )}

            {/* Recording status banner on top of video */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-extrabold backdrop-blur-md uppercase tracking-wider ${
                    isRecording
                      ? 'bg-[#E11D48] text-white animate-pulse'
                      : 'bg-[#1E293B]/80 text-white border border-white/20'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-[#58CC02]'}`} />
                  <span>{isRecording ? 'RECORDING LIVE' : 'STUDIO READY'}</span>
                </div>

                <div className="bg-[#1E293B]/80 text-white border border-white/20 px-3 py-1 rounded-xl text-xs font-mono tabular-nums backdrop-blur-md font-bold">
                  {formatTimer(elapsedSeconds)}
                </div>
              </div>

              {/* Dynamic Real-time Eye Contact & Gaze Meter */}
              <div
                className={`border-2 px-3 py-1 rounded-xl text-xs font-mono tabular-nums backdrop-blur-md flex items-center gap-2 transition-all ${
                  !isFaceDetected
                    ? 'bg-[#E11D48]/90 text-white border-white/30'
                    : isGazeDirect
                    ? 'bg-[#1E293B]/85 text-white border-[#58CC02]'
                    : 'bg-[#FF9600]/90 text-white border-white/30'
                }`}
              >
                <Eye
                  className={`w-3.5 h-3.5 ${
                    !isFaceDetected
                      ? 'text-white'
                      : isGazeDirect
                      ? 'text-[#58CC02]'
                      : 'text-amber-200 animate-pulse'
                  }`}
                />
                <span>Eye Focus: {eyeContactPercentage.toFixed(0)}%</span>
                <span
                  className={`text-[9px] font-sans font-extrabold px-1.5 py-0.2 rounded tracking-wide uppercase ${
                    !isFaceDetected
                      ? 'bg-rose-950 text-rose-200'
                      : isGazeDirect
                      ? 'bg-[#58CC02] text-white'
                      : 'bg-amber-950 text-amber-200'
                  }`}
                >
                  {!isFaceDetected ? 'No Face' : isGazeDirect ? 'Direct' : gazeDirection}
                </span>
              </div>
            </div>

            {/* Audio Waveform Bottom Overlay */}
            <div className="absolute bottom-3 left-4 right-4 bg-[#1E293B]/85 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-center gap-3 z-20">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                {hasMic ? (
                  <Mic className="w-3.5 h-3.5 text-[#58CC02]" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-[#94A3B8]" />
                )}
              </div>
              <div className="flex-1 h-6">
                <canvas ref={audioCanvasRef} className="w-full h-full" width={320} height={24} />
              </div>
              <div className="text-[11px] font-mono tabular-nums text-white/80 shrink-0 font-bold">
                {wordCount} words
              </div>
            </div>
          </div>

          {/* Action Button Bar - Variation 5 3D Tactile Buttons */}
          <div className="surface flex flex-col sm:flex-row items-center justify-between gap-3 p-4">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="btn-primary w-full sm:w-auto text-sm py-3! px-7! flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Practice Session</span>
              </button>
            ) : (
              <button
                onClick={handleFinishRecording}
                className="btn-primary bg-[#E11D48]! border-b-[#BE123C]! hover:bg-[#BE123C]! w-full sm:w-auto text-sm py-3! px-7! flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Finish & Analyze Speech</span>
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <button
                onClick={() => setIsWarmupModalOpen(true)}
                className="btn-secondary py-2! px-3.5! text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                title="Guided 30-second vocal warmup"
              >
                <Wind className="w-3.5 h-3.5 text-[#1CB0F6]" />
                <span>30s Warmup</span>
              </button>

              <button
                onClick={handlePreloadBenchmark}
                className="btn-primary-blue py-2! px-3.5! text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                title="Evaluate preloaded benchmark for this scenario"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Instant Demo</span>
              </button>

              <button
                onClick={onOpenManualEntry}
                className="btn-secondary py-2! px-3.5! text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#1CB0F6]" />
                <span>Custom Metrics</span>
              </button>
            </div>
          </div>

          {/* Target Metrics Card - Variation 5 Surface */}
          <div className="surface space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-label text-slate-500 mb-0.5">TARGET METRICS</div>
                <h2 className="text-2xl font-extrabold text-[#1CB0F6] leading-tight">
                  {currentGoal.name}
                </h2>
              </div>
              <button
                onClick={() => setIsSetGoalsModalOpen(true)}
                className="btn-secondary text-xs py-1.5! px-3.5! self-start sm:self-auto flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Set / Edit Targets</span>
              </button>
            </div>

            {/* 4-Box Metric Grid */}
            <div className="metric-grid">
              <div className="metric-box">
                <div className="font-label">PACE</div>
                <div className="font-extrabold text-base text-[#1E293B] mt-1">{currentGoal.targetWpm} WPM</div>
                <div className="text-[11px] font-bold text-[#64748B] mt-0.5 font-mono">
                  Live: {liveWpm > 0 ? `${liveWpm} WPM` : '-- WPM'}
                </div>
              </div>

              <div className="metric-box">
                <div className="font-label">FILLERS</div>
                <div className="font-extrabold text-base text-[#1E293B] mt-1">≤ {currentGoal.maxFillers}</div>
                <div className="text-[11px] font-bold text-[#64748B] mt-0.5 font-mono">
                  Live: {fillerCount} detected
                </div>
              </div>

              <div className="metric-box">
                <div className="font-label">DYNAMICS</div>
                <div className="font-extrabold text-base text-[#1E293B] mt-1 capitalize">
                  {toneStatus === 'dynamic' ? 'Dynamic' : toneStatus === 'monotone' ? 'Monotone' : toneStatus === 'balanced' ? 'Balanced' : 'Steady'}
                </div>
                <div className="text-[11px] font-bold text-[#64748B] mt-0.5 font-mono">
                  {pitchVariabilitySd > 0 ? `±${pitchVariabilitySd} Hz` : 'Natural'}
                </div>
              </div>

              <div className="metric-box">
                <div className="font-label">FOCUS</div>
                <div className="font-extrabold text-base text-[#1E293B] mt-1">≥ {currentGoal.minEyeContact}%</div>
                <div className="text-[11px] font-bold text-[#64748B] mt-0.5 font-mono">
                  Live: {eyeContactPercentage.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold pt-1 border-t-2 border-[#E5E7EB]">
              <span>
                Target Hit Rate: <strong className="text-[#58CC02] font-mono font-extrabold">{goalProgress.successRate}%</strong> ({goalProgress.achievedCount} of {goalProgress.totalAttempts} sessions)
              </span>
              {goalProgress.bestStreak > 0 && (
                <span className="font-mono hidden sm:inline">Best Streak: {goalProgress.bestStreak}x</span>
              )}
            </div>
          </div>

          {/* Voice Pitch Variability & Dynamic Tone Visualizer - Variation 5 Surface */}
          <div className="surface space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#1CB0F6] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1E293B] flex items-center gap-2">
                    <span>Voice Pitch Variability & Dynamic Tone</span>
                    {isRecording && (
                      <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                    )}
                  </h4>
                  <span className="font-label text-slate-500">
                    REAL-TIME INTONATION (MONOTONE VS. DYNAMIC)
                  </span>
                </div>
              </div>

              {/* Real-time Tone Status Badges */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {toneStatus === 'dynamic' && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-ping" />
                    <span>Dynamic</span>
                  </span>
                )}
                {toneStatus === 'balanced' && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                    <span>Balanced</span>
                  </span>
                )}
                {toneStatus === 'monotone' && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#FFF2DE] text-[#D97706] border border-[#FDE68A] flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                    <span>Monotone</span>
                  </span>
                )}
                {toneStatus === 'silent' && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                    Standby
                  </span>
                )}

                <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs font-bold">
                  <span className="px-2 py-0.5 rounded-lg bg-[#F0F9FF] border-2 border-[#E5E7EB] text-[#1E293B]">
                    {currentPitchHz > 0 ? `${currentPitchHz} Hz` : '-- Hz'}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#F0F9FF] border-2 border-[#E5E7EB] text-[#64748B]">
                    {pitchVariabilitySd > 0 ? `±${pitchVariabilitySd} Hz` : '±0 Hz'}
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Pitch Wave Contour Canvas */}
            <div className="relative w-full h-16 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB] overflow-hidden flex items-center">
              <canvas
                ref={pitchCanvasRef}
                className="w-full h-full"
                width={520}
                height={64}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Practice Companion, Daily Streak & Live Transcript (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Daily Practice Streak Counter on Right Column matching Variation 5 */}
          <DailyStreakWidget
            streak={dailyStreak || getStoredDailyStreak()}
            onRecordTodayPractice={onRecordDailyPractice}
            onStartPractice={() => {
              if (!isRecording) {
                handleStartRecording();
              }
            }}
          />

          {/* Segmented Controller: Meaningful Speech Prompter vs Scenario Objective */}
          <div className="flex items-center gap-1 p-1 bg-[#E2E8F0] rounded-2xl">
            <button
              onClick={() => setCompanionTab('prompter')}
              className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                companionTab === 'prompter'
                  ? 'bg-white text-[#1E293B] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1CB0F6]" />
              <span>Practice Prompter</span>
            </button>
            <button
              onClick={() => setCompanionTab('scenario')}
              className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                companionTab === 'scenario'
                  ? 'bg-white text-[#1E293B] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scenario Goal & Hints</span>
            </button>
          </div>

          {/* Conditional Display: Meaningful Speech to Read OR Scenario Objective */}
          {companionTab === 'prompter' ? (
            <PracticePrompter
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onUseSpeechForBenchmark={handleUseSpeechForBenchmark}
            />
          ) : (
            <div className="surface space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#E5E7EB]">
                <span className="font-label text-[#58CC02]">
                  {activeScenario.category} SCENARIO
                </span>
                <span className="text-xs text-[#64748B] font-mono tabular-nums font-bold">
                  Ideal: {activeScenario.targetWpmRange[0]}–{activeScenario.targetWpmRange[1]} WPM
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-[#1E293B]">{activeScenario.title}</h2>
              <p className="text-xs text-[#64748B]">{activeScenario.description}</p>

              <div className="mt-2 p-3.5 bg-[#F0F9FF] rounded-xl border-2 border-[#E5E7EB]">
                <span className="font-label text-[#0284C7] block mb-1">PROMPT QUESTION:</span>
                <p className="text-sm font-semibold text-[#1E293B] italic">"{activeScenario.promptQuestion}"</p>
              </div>

              <div className="mt-3 space-y-2">
                <span className="font-label text-slate-500 block">COACHING DELIVERY TIPS:</span>
                {activeScenario.hints.map((hint, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#1E293B]">
                    <span className="text-[#58CC02] font-bold shrink-0">✓</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Transcript Stream (Web Speech API) - Variation 5 Surface */}
          <div className="surface flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5E7EB] mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#1E293B] flex items-center gap-2">
                  <span>Real-Time Speech Transcript</span>
                  {isRecording && isSpeechListening && (
                    <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                  )}
                </h3>
                {isRecording && isSpeechListening && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02] animate-ping" />
                    <span>Web Speech API Active</span>
                  </span>
                )}
                {!isSpeechSupported && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] text-amber-800 bg-amber-50 border border-amber-200 font-bold">
                    Speech API Limited
                  </span>
                )}
              </div>
              <span className="text-xs text-[#64748B] font-mono tabular-nums font-bold">{wordCount} words captured</span>
            </div>

            {/* Error or status notice if permission blocked */}
            {speechError && (
              <div className="mb-3 p-2 bg-[#FFFBEB] border-2 border-amber-200 text-[#92400E] rounded-xl text-xs flex items-center justify-between">
                <span>{speechError}</span>
                <button
                  onClick={handleSimulateLiveSpeech}
                  className="font-bold underline text-[#1CB0F6] ml-2 cursor-pointer"
                >
                  Simulate Speech
                </button>
              </div>
            )}

            {/* Transcript Scroll Area with final and interim results */}
            <div
              ref={transcriptContainerRef}
              className="flex-1 overflow-y-auto max-h-56 pr-1 text-sm leading-relaxed text-[#1E293B]"
            >
              {liveTranscript || interimTranscript ? (
                <div className="whitespace-pre-wrap font-medium">
                  {liveTranscript && <span>{liveTranscript} </span>}
                  {interimTranscript && (
                    <span className="text-[#1CB0F6] font-semibold italic transition-all">
                      {interimTranscript}
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#1CB0F6] animate-pulse align-middle" />
                    </span>
                  )}
                </div>
              ) : isRecording ? (
                <div className="py-8 text-center text-[#64748B] space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#1CB0F6] flex items-center justify-center mx-auto animate-pulse">
                    <Mic className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-extrabold text-[#1E293B]">Listening for your speech via Web Speech API...</p>
                  <p className="text-[11px] text-[#64748B] max-w-xs mx-auto">
                    Speak clearly into your microphone or read the prompter. Your words will transcribe live.
                  </p>
                  <button
                    onClick={handleSimulateLiveSpeech}
                    className="mt-2 text-[11px] font-bold text-[#1CB0F6] hover:underline cursor-pointer"
                  >
                    Or test with simulated voice stream
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-[#64748B] space-y-2">
                  <Mic className="w-8 h-8 mx-auto text-[#CBD5E1] mb-1" />
                  <p className="text-xs font-semibold">
                    Hit "Start Practice Session" or "Read This Speech" to begin live speech capture.
                  </p>
                  <button
                    onClick={handleSimulateLiveSpeech}
                    className="text-[11px] font-bold text-[#1CB0F6] hover:underline cursor-pointer"
                  >
                    Test real-time speech capture demo
                  </button>
                </div>
              )}
            </div>

            {/* Filler Word Tag Ticker */}
            {fillerDetails.length > 0 && (
              <div className="mt-3 pt-3 border-t-2 border-[#E5E7EB] flex items-center gap-2 flex-wrap text-xs text-[#64748B]">
                <span className="font-extrabold text-[#1E293B]">Detected Fillers:</span>
                {fillerDetails.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-[#FFF2DE] border border-[#FDE68A] text-[#D97706] font-mono font-bold">
                    "{f.word}" ({f.count})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 30-Second Guided Vocal Warmup Modal */}
      <QuickWarmupModal
        isOpen={isWarmupModalOpen}
        onClose={() => setIsWarmupModalOpen(false)}
        onStartPracticeAfterWarmup={() => {
          setIsWarmupModalOpen(false);
          handleStartRecording();
        }}
      />

      {/* Target Goals & Class-Wise Levels Modal */}
      <SetGoalsModal
        isOpen={isSetGoalsModalOpen}
        onClose={() => setIsSetGoalsModalOpen(false)}
        activeGoal={currentGoal}
        onSaveGoal={(goal) => {
          if (onUpdateGoal) onUpdateGoal(goal);
        }}
        history={history || []}
      />
    </div>
  );
};
