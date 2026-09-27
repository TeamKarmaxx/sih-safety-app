import { useEffect, useRef, useState } from 'react';
import SpriteFireComponent from './SpriteFireComponent';
import DrillQuizScreen from './DrillQuizScreen';
import { useAuth } from './context/useAuth.js';
import { updateDrillProgress } from './api/drills';
import { ApiError } from './api/client';
import { enqueueAction } from './offline/db.js';
import { ACTION_TYPES } from './offline/syncQueue.js';

const STEPS = [
  {
    letter: 'P',
    title: 'PULL THE PIN',
    subtitle: 'Pull the safety pin to break the tamper seal.',
    icon: 'pull',
  },
  {
    letter: 'A',
    title: 'AIM AT BASE',
    subtitle: 'Aim low, pointing the nozzle directly at the base of the fire.',
    icon: 'aim',
  },
  {
    letter: 'S',
    title: 'SQUEEZE HANDLE',
    subtitle: 'Squeeze the top lever to release the extinguishing agent.',
    icon: 'squeeze',
  },
  {
    letter: 'S',
    title: 'SWEEP SIDE-TO-SIDE',
    subtitle: 'Sweep the nozzle from side to side until flames are extinguished.',
    icon: 'sweep',
  },
];

const FIRE_SIZE = 280;
const EXT_SIZE = 90;

/* ===================================================
   HIGH QUALITY ANIMATED PASS STEP GRAPHICS
   =================================================== */
function StepAnimation({ type }) {
  if (type === 'pull') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150">
        <defs>
          <linearGradient id="extRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e53935" />
            <stop offset="100%" stopColor="#b71c1c" />
          </linearGradient>
          <linearGradient id="metalSilver" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cfd8dc" />
            <stop offset="50%" stopColor="#eceff1" />
            <stop offset="100%" stopColor="#90a4ae" />
          </linearGradient>
        </defs>

        <rect x="75" y="85" width="50" height="65" rx="10" fill="url(#extRed)" />
        <rect x="88" y="72" width="24" height="15" fill="url(#metalSilver)" rx="3" />
        <path d="M 60 70 L 88 75 L 88 83 L 60 80 Z" fill="#37474f" />
        <path d="M 60 52 L 100 70 L 98 76 L 58 58 Z" fill="#455a64" />
        <circle cx="108" cy="78" r="8" fill="#fff" stroke="#37474f" strokeWidth="2" />
        <line x1="108" y1="78" x2="111" y2="73" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" />

        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 35,-5; 65,-10; 0,0"
            keyTimes="0; 0.4; 0.7; 1"
            dur="2s"
            repeatCount="indefinite"
          />
          <line x1="84" y1="68" x2="110" y2="68" stroke="#ffd54f" strokeWidth="4" strokeLinecap="round" />
          <circle cx="118" cy="68" r="10" fill="none" stroke="#ffb300" strokeWidth="3" />
          <path d="M 132 68 L 148 68 M 143 63 L 148 68 L 143 73" fill="none" stroke="#FF9800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    );
  }

  if (type === 'aim') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150">
        <defs>
          <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#d32f2f" />
            <stop offset="60%" stopColor="#ff9800" />
            <stop offset="100%" stopColor="#ffee58" />
          </linearGradient>
        </defs>

        <path d="M 25 110 Q 55 60 90 75" fill="none" stroke="#263238" strokeWidth="10" strokeLinecap="round" />
        <polygon points="90,68 115,75 90,82" fill="#37474f" />

        <g transform="translate(145, 60)">
          <path d="M 20 55 Q 0 35 15 15 Q 25 35 30 5 Q 45 25 35 55 Z" fill="url(#fireGrad)">
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1 1; 1.08 0.95; 0.95 1.05; 1 1"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
          <ellipse cx="25" cy="56" rx="22" ry="6" fill="rgba(255, 152, 0, 0.3)" />
        </g>

        <line x1="115" y1="75" x2="165" y2="110" stroke="#00e676" strokeWidth="2.5" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" values="8;0" dur="0.5s" repeatCount="indefinite" />
        </line>

        <g transform="translate(165, 110)">
          <circle cx="0" cy="0" r="10" fill="none" stroke="#00e676" strokeWidth="2.5">
            <animate attributeName="r" values="7;13;7" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#00e676" strokeWidth="1.5" />
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#00e676" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  if (type === 'squeeze') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150">
        <defs>
          <linearGradient id="extRed2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e53935" />
            <stop offset="100%" stopColor="#b71c1c" />
          </linearGradient>
        </defs>

        <rect x="80" y="80" width="45" height="70" rx="10" fill="url(#extRed2)" />
        <path d="M 50 78 L 82 82 L 82 90 L 50 86 Z" fill="#263238" />

        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 82 82; 14 82 82; 0 82 82"
            dur="1.2s"
            repeatCount="indefinite"
          />
          <path d="M 50 55 L 82 80 L 82 86 L 50 63 Z" fill="#37474f" />
        </g>

        <g transform="translate(58, 30)">
          <path d="M 0 0 L 0 15 M -5 10 L 0 15 L 5 10" fill="none" stroke="#FF9800" strokeWidth="3" strokeLinecap="round">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,8; 0,0" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>

        <circle cx="112" cy="78" r="10" fill="#fff" stroke="#37474f" strokeWidth="2.5" />
        <g transform="translate(112, 78)">
          <line x1="0" y1="0" x2="4" y2="-6" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-25 0 0; 35 0 0; -25 0 0"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </line>
        </g>
      </svg>
    );
  }

  if (type === 'sweep') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150">
        <defs>
          <linearGradient id="sprayGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#eceff1" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#b0bec5" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <circle cx="35" cy="75" r="8" fill="#263238" />
        <g transform="translate(35, 75)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-22 35 75; 22 35 75; -22 35 75"
            dur="1.8s"
            repeatCount="indefinite"
          />
          <polygon points="0,-6 140,-35 140,35 0,6" fill="url(#sprayGrad)" />
          <circle cx="120" cy="-12" r="14" fill="#ffffff" opacity="0.4" />
          <circle cx="135" cy="10" r="16" fill="#ffffff" opacity="0.5" />
          <circle cx="110" cy="18" r="12" fill="#ffffff" opacity="0.3" />
        </g>

        <path d="M 130 130 Q 155 125 180 130" fill="none" stroke="#FF9800" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="128,130 135,125 135,135" fill="#FF9800" />
        <polygon points="182,130 175,125 175,135" fill="#FF9800" />
      </svg>
    );
  }

  return null;
}

function FireModule({ onBack, drillId }) {
  const { session } = useAuth();
  const userId = session?.userId ?? null;
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Tap anywhere on the camera to start');
  const [onFire, setOnFire] = useState(false);
  const [firePos, setFirePos] = useState(null);
  const [fireClicked, setFireClicked] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [extinguishing, setExtinguishing] = useState(false);

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
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Camera error: ${message}`);
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function handleVideoTap(event) {
    if (onFire || tutorialOpen || quizOpen) return;
    const x = event.clientX;
    const y = event.clientY;
    setFirePos({ x, y });
    setOnFire(true);
    setFireClicked(false);
    setExtinguishing(false);
    setStatus('Fire started! Tap the fire.');
  }

  function handleFireTap() {
    if (!onFire || extinguishing) return;
    setFireClicked(true);
    setStatus('Tap the blinking extinguisher.');
  }

  function handleExtinguisherTap() {
    if (!onFire || !fireClicked || extinguishing) return;
    setTutorialOpen(true);
    setStepIndex(0);
    setStatus('Follow the PASS technique.');
  }

  function nextStep() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((currentIndex) => currentIndex + 1);
      return;
    }
    setTutorialOpen(false);
    setExtinguishing(true);
    setStatus('Extinguishing fire...');
  }

  function handleExtinguishComplete() {
    setExtinguishing(false);
    setOnFire(false);
    setFireClicked(false);
    setFirePos(null);
    setQuizOpen(true);
    setStatus('Drill complete. Answer the assessment questions.');

    // Record real drill completion with the backend. Fire-and-forget from
    // the AR flow's point of view (not a blocker for moving on to the
    // quiz), but if it can't reach the backend right now it's queued for
    // later rather than silently lost — the dashboard's real progress is
    // never faked either way.
    if (userId && drillId) {
      const payload = { userId, drillId, completed: true };

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        enqueueAction({ type: ACTION_TYPES.DRILL_PROGRESS, payload });
      } else {
        updateDrillProgress(userId, drillId, true).catch((err) => {
          if (err instanceof ApiError && err.isNetworkError) {
            enqueueAction({ type: ACTION_TYPES.DRILL_PROGRESS, payload });
          }
          // Non-network errors (e.g. validation) are intentionally not
          // queued — retrying the same bad request wouldn't help.
        });
      }
    }
  }

  const extinguisherPos = firePos
    ? {
        left: Math.min(
          Math.max(firePos.x + FIRE_SIZE * 0.65, 10),
          window.innerWidth - EXT_SIZE - 10
        ),
        top: Math.min(
          Math.max(firePos.y - EXT_SIZE / 2, 150),
          window.innerHeight - EXT_SIZE - 20
        ),
      }
    : null;

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPointerDown={handleVideoTap}
        className="camera-screen"
        style={{
          cursor: onFire ? 'default' : 'pointer',
        }}
      />

      <button onClick={onBack} className="fire-back-button">
        ← Back
      </button>

      <div className="fire-status">{status}</div>

      {onFire && firePos && (
        <>
          <div
            className={
              extinguishing
                ? 'fire-pop fire-extinguishing'
                : 'fire-pop'
            }
            style={{
              position: 'fixed',
              left: firePos.x - FIRE_SIZE / 2,
              top: firePos.y - FIRE_SIZE / 2,
              width: FIRE_SIZE,
              height: FIRE_SIZE,
              zIndex: 10,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 15px rgba(255, 87, 34, 0.9))',
            }}
          >
            <SpriteFireComponent
              active={onFire}
              size={FIRE_SIZE}
              intensity={1.5}
              extinguishing={extinguishing}
              onError={(error) => {
                setStatus(`Babylon error: ${error}`);
              }}
              onExtinguishComplete={handleExtinguishComplete}
            />
          </div>

          {!fireClicked && !tutorialOpen && !extinguishing && (
            <button
              onClick={handleFireTap}
              aria-label="Tap fire"
              style={{
                position: 'fixed',
                left: firePos.x - FIRE_SIZE / 2,
                top: firePos.y - FIRE_SIZE / 2,
                width: FIRE_SIZE,
                height: FIRE_SIZE,
                zIndex: 20,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          )}

          {fireClicked &&
            !tutorialOpen &&
            !extinguishing &&
            extinguisherPos && (
              <>
                <div
                  className="extinguisher-button"
                  style={{
                    position: 'fixed',
                    left: extinguisherPos.left,
                    top: extinguisherPos.top,
                    width: EXT_SIZE,
                    height: EXT_SIZE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: EXT_SIZE * 0.85,
                    zIndex: 35,
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 0 12px rgba(33, 150, 243, 0.9))',
                  }}
                >
                  🧯
                </div>

                <button
                  onClick={handleExtinguisherTap}
                  aria-label="Open extinguisher tutorial"
                  style={{
                    position: 'fixed',
                    left: extinguisherPos.left,
                    top: extinguisherPos.top,
                    width: EXT_SIZE,
                    height: EXT_SIZE,
                    zIndex: 36,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              </>
            )}
        </>
      )}

      {/* MODERN ANIMATED PASS TUTORIAL DIALOG */}
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
            border: '1px solid rgba(255, 152, 0, 0.4)',
            borderRadius: '20px',
            padding: '20px 20px 16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 152, 0, 0.2)',
            zIndex: 80,
            textAlign: 'center',
            color: 'white',
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
                  background: i === stepIndex ? '#FF9800' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* PASS BADGE */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 152, 0, 0.15)',
              border: '1px solid rgba(255, 152, 0, 0.4)',
              color: '#FF9800',
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}
          >
            STEP {stepIndex + 1} OF 4 • {STEPS[stepIndex].letter}
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
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: '#0d162b',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {stepIndex < STEPS.length - 1 ? 'NEXT STEP →' : 'START EXTINGUISHING 🔥'}
          </button>
        </div>
      )}

      {quizOpen && (
        <DrillQuizScreen
          drillId={drillId}
          accentColor="#d32f2f"
          onComplete={() => {
            setQuizOpen(false);
            setStatus('Drill complete. Great job.');
          }}
        />
      )}
    </>
  );
}

export default FireModule;