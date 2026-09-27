import { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const STEPS = [
  { text: 'Step 1: PULL the safety pin', icon: 'pull' },
  { text: 'Step 2: AIM at the base of the fire', icon: 'aim' },
  { text: 'Step 3: SQUEEZE the handle slowly', icon: 'squeeze' },
  { text: 'Step 4: SWEEP side to side until fire is out', icon: 'sweep' },
];

function StepAnimation({ type }) {
  if (type === 'pull') {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <rect x="50" y="40" width="20" height="50" fill="#1565c0" rx="4" />
        <circle cx="60" cy="30" r="10" fill="#ffca28">
          <animate attributeName="cy" values="30;10;30" dur="1.2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }
  if (type === 'aim') {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <rect x="30" y="55" width="60" height="10" fill="#1565c0" rx="4" />
        <polygon points="90,50 110,60 90,70" fill="#e53935">
          <animateTransform attributeName="transform" type="translate" values="0 0; 10 0; 0 0" dur="1s" repeatCount="indefinite" />
        </polygon>
      </svg>
    );
  }
  if (type === 'squeeze') {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <rect x="40" y="30" width="40" height="60" fill="#1565c0" rx="8" />
        <rect x="45" y="20" width="30" height="15" fill="#0d47a1" rx="4">
          <animateTransform attributeName="transform" type="scale" values="1;0.7;1" additive="sum" dur="0.8s" repeatCount="indefinite" />
        </rect>
      </svg>
    );
  }
  if (type === 'sweep') {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="8" fill="#1565c0" />
        <polygon points="60,60 90,40 90,80" fill="#90caf9" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" values="-20 60 60; 20 60 60; -20 60 60" dur="1.4s" repeatCount="indefinite" />
        </polygon>
      </svg>
    );
  }
  return null;
}

const FIRE_TRIGGER_OBJECTS = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe',
  'backpack', 'umbrella', 'handbag', 'tie', 'suitcase',
  'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
  'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
  'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet',
  'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
  'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
  'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush','tree'
];

function ArTest() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Loading AI model...');
  const [box, setBox] = useState(null); // {left, top, width, height} in screen px
  const [onFire, setOnFire] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const onFireRef = useRef(onFire);
  onFireRef.current = onFire;

  const mapVideoBoxToScreen = useCallback((bbox, video) => {
    const [x, y, w, h] = bbox;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const dw = window.innerWidth;
    const dh = window.innerHeight;

    // object-fit: cover math
    const scale = Math.max(dw / vw, dh / vh);
    const scaledW = vw * scale;
    const scaledH = vh * scale;
    const offsetX = (scaledW - dw) / 2;
    const offsetY = (scaledH - dh) / 2;

    return {
      left: x * scale - offsetX,
      top: y * scale - offsetY,
      width: w * scale,
      height: h * scale,
    };
  }, []);

  useEffect(() => {
    let model;
    let animationId;
    let stream;

    async function setup() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch (err) {
        setStatus('Camera error: ' + err.message);
        return;
      }

      setStatus('Loading AI model...');
      model = await cocoSsd.load();
      setStatus('Point your camera at a bottle, cup, or chair.');

      let isDetecting = false;

      async function detectFrame() {
        if (isDetecting) return;
        if (videoRef.current && videoRef.current.readyState === 4) {
          isDetecting = true;
          const predictions = await model.detect(videoRef.current);
          const relevant = predictions.filter((p) =>
            FIRE_TRIGGER_OBJECTS.includes(p.class)
          );
          if (relevant.length > 0) {
            // Use the highest-confidence relevant detection
            const best = relevant.reduce((a, b) => (a.score > b.score ? a : b));
            const screenBox = mapVideoBoxToScreen(best.bbox, videoRef.current);
            setBox(screenBox);
            if (!onFireRef.current) {
              setStatus(`Detected: ${best.class}. Tap it to simulate a fire hazard.`);
            }
          } else {
            setBox(null);
            if (!onFireRef.current) {
              setStatus('Point your camera at a bottle, cup, or chair.');
            }
          }
          isDetecting = false;
        }
      }

      // Run detection twice per second instead of every frame - much lighter on mobile CPUs
      animationId = setInterval(detectFrame, 500);
    }

    setup();

    return () => {
      if (animationId) clearInterval(animationId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [mapVideoBoxToScreen]);

  const handleFireStart = () => {
    setOnFire(true);
    setStatus('Fire started! Tap the blinking extinguisher.');
  };

  const handleExtinguisherTap = () => {
    if (!onFire) return;
    setTutorialOpen(true);
    setStepIndex(0);
  };

  const nextStep = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setTutorialOpen(false);
      setOnFire(false);
      setStatus('Great job! Fire extinguished correctly.');
    }
  };

  // Extinguisher sits just to the right of the detected object's box
  const extinguisherBox = box
    ? {
        left: box.left + box.width + 10,
        top: box.top,
        width: Math.max(box.width * 0.4, 50),
        height: box.height,
      }
    : null;

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 10,
          left: 10,
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

      {box && (
        <>
          {/* Highlight outline on the detected object (subtle, not a solid block) */}
          <div
            style={{
              position: 'fixed',
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              border: `3px dashed ${onFire ? 'orangered' : '#00e676'}`,
              zIndex: 5,
              pointerEvents: 'none',
              borderRadius: '6px',
            }}
          />
          {/* Fire icon appears once triggered, centered on the object */}
          {onFire && (
            <div
              style={{
                position: 'fixed',
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.min(box.width, box.height) * 0.8,
                zIndex: 6,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 0 10px rgba(255,87,34,0.8))',
              }}
            >
              🔥
            </div>
          )}
          <button
            onClick={handleFireStart}
            style={{
              position: 'fixed',
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              zIndex: 10,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="detected object"
          />

          {/* Extinguisher icon next to the detected object */}
          <div
            style={{
              position: 'fixed',
              left: extinguisherBox.left,
              top: extinguisherBox.top,
              width: extinguisherBox.width,
              height: extinguisherBox.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.min(extinguisherBox.width, extinguisherBox.height) * 0.9,
              zIndex: 5,
              pointerEvents: 'none',
              animation: onFire ? 'pulseScale 0.4s ease-in-out infinite alternate' : 'none',
              filter: onFire ? 'drop-shadow(0 0 12px rgba(33,150,243,0.9))' : 'none',
            }}
          >
            🧯
          </div>
          <button
            onClick={handleExtinguisherTap}
            style={{
              position: 'fixed',
              left: extinguisherBox.left,
              top: extinguisherBox.top,
              width: extinguisherBox.width,
              height: extinguisherBox.height,
              zIndex: 10,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="extinguisher"
          />
        </>
      )}

      <style>{`
        @keyframes pulseScale {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
      `}</style>

      {tutorialOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: 10,
            right: 10,
            zIndex: 30,
            background: 'white',
            color: 'black',
            padding: '16px',
            borderRadius: '10px',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          }}
        >
          <StepAnimation type={STEPS[stepIndex].icon} />
          <p style={{ fontSize: '15px', margin: '10px 0' }}>{STEPS[stepIndex].text}</p>
          <button
            onClick={nextStep}
            style={{
              padding: '8px 20px',
              background: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            {stepIndex < STEPS.length - 1 ? 'Next' : 'Done'}
          </button>
        </div>
      )}
    </>
  );
}

export default ArTest;