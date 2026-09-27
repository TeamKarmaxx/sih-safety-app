
import { useRef, useEffect, useState } from 'react';
import DrillQuizScreen from './DrillQuizScreen';
import RealisticBabylonGas from './Realisticbabylongas';
import { useAuth } from './context/useAuth.js';
import { updateDrillProgress } from './api/drills';
import { ApiError } from './api/client';
import { enqueueAction } from './offline/db.js';
import { ACTION_TYPES } from './offline/syncQueue.js';

const STEPS = [
  {
    stepNum: '1',
    badge: 'EVACUATE',
    title: 'EVACUATE IMMEDIATELY',
    subtitle: 'Leave the hazard area immediately following designated emergency exit routes.',
    icon: 'evacuate',
  },
  {
    stepNum: '2',
    badge: 'NO SPARKS',
    title: 'NO ELECTRICAL SWITCHES',
    subtitle: 'Do NOT operate light switches, phones, or appliances that could create an ignition spark.',
    icon: 'noswitch',
  },
  {
    stepNum: '3',
    badge: 'VENTILATE',
    title: 'VENTILATE IF SAFE',
    subtitle: 'Open doors and windows to disperse accumulated gas only if safe to do so.',
    icon: 'ventilate',
  },
  {
    stepNum: '4',
    badge: 'ALERT',
    title: 'ALERT SUPERVISOR & EMS',
    subtitle: 'Contact plant safety officer, supervisor, and emergency services from a safe distance.',
    icon: 'alert',
  },
];

/* ===================================================
   VECTOR STEP ANIMATIONS FOR GAS HAZARDS
   =================================================== */
function StepAnimation({ type }) {
  if (type === 'evacuate') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150">
        <defs>
          <linearGradient id="exitGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e676" />
            <stop offset="100%" stopColor="#00c853" />
          </linearGradient>
        </defs>

        <rect x="110" y="25" width="70" height="24" rx="4" fill="url(#exitGreen)" />
        <text x="145" y="41" fill="#0d162b" fontSize="11" fontWeight="bold" textAnchor="middle">
          EXIT →
        </text>

        <rect x="125" y="50" width="45" height="85" fill="#1b2a4a" stroke="#00e676" strokeWidth="2" />
        <polygon points="125,50 155,42 155,135 125,135" fill="#2e7d32" opacity="0.4" />

        <g stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 40 135 L 60 135 M 54 130 L 60 135 L 54 140">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
          </path>
          <path d="M 75 135 L 95 135 M 89 130 L 95 135 L 89 140">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" begin="0.3s" repeatCount="indefinite" />
          </path>
        </g>

        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 75,-2; 0,0"
            dur="1.8s"
            repeatCount="indefinite"
          />
          <circle cx="45" cy="65" r="8" fill="#ffd54f" />
          <path d="M 37 63 Q 45 56 53 63 Z" fill="#ffb300" />
          <line x1="45" y1="73" x2="48" y2="95" stroke="#29b6f6" strokeWidth="7" strokeLinecap="round" />
          <line x1="45" y1="76" x2="35" y2="88" stroke="#29b6f6" strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="76" x2="58" y2="82" stroke="#29b6f6" strokeWidth="4" strokeLinecap="round" />
          <line x1="48" y1="95" x2="36" y2="118" stroke="#1565c0" strokeWidth="5" strokeLinecap="round" />
          <line x1="48" y1="95" x2="62" y2="112" stroke="#1565c0" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (type === 'noswitch') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150">
        <defs>
          <linearGradient id="switchPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eceff1" />
            <stop offset="100%" stopColor="#cfd8dc" />
          </linearGradient>
        </defs>

        <rect x="75" y="40" width="50" height="75" rx="8" fill="url(#switchPlate)" stroke="#90a4ae" strokeWidth="2" />
        <rect x="92" y="65" width="16" height="25" rx="4" fill="#37474f" />
        <rect x="95" y="75" width="10" height="12" rx="2" fill="#fff" />

        <g stroke="#ffd54f" strokeWidth="2.5" strokeLinecap="round">
          <path d="M 115 50 L 125 55 L 120 62 L 132 68">
            <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M 68 85 L 58 92 L 64 98 L 52 105">
            <animate attributeName="opacity" values="0;1;0" dur="0.5s" begin="0.25s" repeatCount="indefinite" />
          </path>
        </g>

        <g transform="translate(100, 78)">
          <circle cx="0" cy="0" r="42" fill="none" stroke="#f44336" strokeWidth="7">
            <animate attributeName="r" values="39;44;39" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <line x1="-30" y1="-30" x2="30" y2="30" stroke="#f44336" strokeWidth="7" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (type === 'ventilate') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0288d1" />
            <stop offset="100%" stopColor="#03a9f4" />
          </linearGradient>
          <linearGradient id="gasFade" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#76ff03" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#00e676" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#29b6f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="35" y="30" width="80" height="90" rx="4" fill="url(#skyGrad)" stroke="#b0bec5" strokeWidth="4" />
        <line x1="75" y1="30" x2="75" y2="120" stroke="#b0bec5" strokeWidth="3" />
        <line x1="35" y1="75" x2="115" y2="75" stroke="#b0bec5" strokeWidth="3" />

        <polygon points="35,30 15,40 15,110 35,120" fill="rgba(255,255,255,0.4)" stroke="#b0bec5" strokeWidth="2" />
        <polygon points="115,30 135,40 135,110 115,120" fill="rgba(255,255,255,0.4)" stroke="#b0bec5" strokeWidth="2" />

        <g fill="none" stroke="url(#gasFade)" strokeWidth="3.5" strokeLinecap="round">
          <path d="M 20 60 Q 60 45, 100 60 T 175 55">
            <animate
              attributeName="d"
              values="M 20 60 Q 60 45, 100 60 T 175 55; M 20 60 Q 60 75, 100 60 T 175 65; M 20 60 Q 60 45, 100 60 T 175 55"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M 30 85 Q 70 70, 110 85 T 185 80">
            <animate
              attributeName="d"
              values="M 30 85 Q 70 70, 110 85 T 185 80; M 30 85 Q 70 100, 110 85 T 185 90; M 30 85 Q 70 70, 110 85 T 185 80"
              dur="1.8s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
    );
  }

  if (type === 'alert') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150">
        <defs>
          <linearGradient id="radioBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#37474f" />
            <stop offset="100%" stopColor="#212121" />
          </linearGradient>
        </defs>

        <rect x="75" y="55" width="48" height="75" rx="6" fill="url(#radioBody)" stroke="#546e7a" strokeWidth="2" />
        <rect x="82" y="25" width="6" height="30" rx="3" fill="#263238" />
        <line x1="86" y1="80" x2="112" y2="80" stroke="#78909c" strokeWidth="2" strokeLinecap="round" />
        <line x1="86" y1="87" x2="112" y2="87" stroke="#78909c" strokeWidth="2" strokeLinecap="round" />
        <line x1="86" y1="94" x2="112" y2="94" stroke="#78909c" strokeWidth="2" strokeLinecap="round" />
        <rect x="84" y="63" width="30" height="12" fill="#00e676" rx="2" />
        <text x="99" y="72" fill="#0d162b" fontSize="8" fontWeight="bold" textAnchor="middle">
          SOS
        </text>

        <circle cx="112" cy="48" r="6" fill="#ff9800">
          <animate attributeName="fill" values="#ff9800;#ff1744;#ff9800" dur="0.6s" repeatCount="indefinite" />
        </circle>

        <g stroke="#29b6f6" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 130 50 Q 145 70, 130 90">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
          </path>
          <path d="M 142 42 Q 165 70, 142 98">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" begin="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M 68 50 Q 53 70, 68 90">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    );
  }

  return null;
}

const LEAK_SIZE = 100;
const ALERT_SIZE = 90;

function GasModule({ onBack, drillId }) {
  const { session } = useAuth();
  const userId = session?.userId ?? null;
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Tap anywhere on the camera to detect leak');
  const [leaking, setLeaking] = useState(false);
  const [leakPos, setLeakPos] = useState(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    let stream;
    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStatus('Camera is not supported by this browser.');
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        setStatus('Camera error: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleVideoTap = (e) => {
    if (leaking || tutorialOpen || quizOpen) return;
    const x = e.clientX;
    const y = e.clientY;
    setLeakPos({ x, y });
    setLeaking(true);
    setStatus('Gas leak detected! Tap the flashing alert icon.');
  };

  const handleAlertTap = () => {
    if (!leaking) return;
    setTutorialOpen(true);
    setStepIndex(0);
    setStatus('Follow the 4 Emergency Gas Response steps.');
  };

  const nextStep = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setTutorialOpen(false);
      setLeaking(false);
      setLeakPos(null);
      setQuizOpen(true);
      setStatus('Drill complete. Answer the assessment questions.');

      // Record real drill completion with the backend — queued for later if
      // offline, same approach as FireModule, rather than silently lost or
      // fabricated locally.
      if (userId && drillId) {
        const payload = { userId, drillId, completed: true };

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          enqueueAction({ type: ACTION_TYPES.DRILL_PROGRESS, payload });
        } else {
          updateDrillProgress(userId, drillId, true).catch((err) => {
            if (err instanceof ApiError && err.isNetworkError) {
              enqueueAction({ type: ACTION_TYPES.DRILL_PROGRESS, payload });
            }
          });
        }
      }
    }
  };

  const alertPos = leakPos
    ? {
        left: Math.min(
          Math.max(leakPos.x + 70, 10),
          window.innerWidth - ALERT_SIZE - 10
        ),
        top: Math.min(
          Math.max(leakPos.y - ALERT_SIZE / 2, 150),
          window.innerHeight - ALERT_SIZE - 20
        ),
      }
    : null;

  const showLeakLayer = !tutorialOpen && !quizOpen;

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onClick={handleVideoTap}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          cursor: leaking ? 'default' : 'pointer',
        }}
      />

      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 40,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 14px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      <div
        style={{
          position: 'fixed',
          top: 10,
          left: 70,
          right: 10,
          zIndex: 30,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        {status}
      </div>

      {showLeakLayer && leaking && leakPos && (
        <>
          <div
            className="leak-pop"
            style={{
              position: 'fixed',
              left: leakPos.x - LEAK_SIZE / 2,
              top: leakPos.y - LEAK_SIZE / 2,
              width: LEAK_SIZE,
              height: LEAK_SIZE,
              zIndex: 6,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 12px rgba(150,255,100,0.7))',
            }}
          >
            <RealisticBabylonGas size={LEAK_SIZE} />
          </div>

          <div
            style={{
              position: 'fixed',
              left: alertPos.left,
              top: alertPos.top,
              width: ALERT_SIZE,
              height: ALERT_SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: ALERT_SIZE * 0.85,
              zIndex: 35,
              pointerEvents: 'none',
              animation: 'pulseScale 0.4s ease-in-out infinite alternate',
              filter: 'drop-shadow(0 0 12px rgba(255,193,7,0.9))',
            }}
          >
            ⚠️
          </div>

          <button
            onClick={handleAlertTap}
            style={{
              position: 'fixed',
              left: alertPos.left,
              top: alertPos.top,
              width: ALERT_SIZE,
              height: ALERT_SIZE,
              zIndex: 36,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="alert response"
          />
        </>
      )}

      {/* MODERN ANIMATED GAS RESPONSE TUTORIAL MODAL */}
      {tutorialOpen && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '24px',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '420px',
            background: 'rgba(22, 35, 61, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(2, 136, 209, 0.4)',
            borderRadius: '20px',
            padding: '20px 20px 16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(2, 136, 209, 0.25)',
            zIndex: 80,
            textAlign: 'center',
            color: 'white',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
          }}
        >
          {/* STEP PROGRESS PILLS */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  height: '4px',
                  width: i === stepIndex ? '28px' : '10px',
                  borderRadius: '4px',
                  background: i === stepIndex ? '#0288d1' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* STEP BADGE */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(2, 136, 209, 0.15)',
              border: '1px solid rgba(2, 136, 209, 0.4)',
              color: '#29b6f6',
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}
          >
            STEP {STEPS[stepIndex].stepNum} OF 4 • {STEPS[stepIndex].badge}
          </div>

          {/* DYNAMIC ANIMATION VIEW */}
          <div
            style={{
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '6px 0',
            }}
          >
            <StepAnimation type={STEPS[stepIndex].icon} />
          </div>

          {/* STEP TITLE & SUBTITLE */}
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 6px',
              letterSpacing: '0.5px',
            }}
          >
            {STEPS[stepIndex].title}
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: '#b0bec5',
              lineHeight: '1.4',
              margin: '0 0 16px',
              minHeight: '36px',
            }}
          >
            {STEPS[stepIndex].subtitle}
          </p>

          {/* ACTION BUTTON */}
          <button
            onClick={nextStep}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #0288d1 0%, #0277bd 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 136, 209, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            {stepIndex < STEPS.length - 1 ? 'NEXT PROTOCOL →' : 'RESOLVE INCIDENT ✓'}
          </button>
        </div>
      )}

      {quizOpen && (
        <DrillQuizScreen
          drillId={drillId}
          accentColor="#0277bd"
          onComplete={() => {
            setQuizOpen(false);
            setStatus('Drill complete. Great job.');
          }}
        />
      )}
    </>
  );
}

export default GasModule;