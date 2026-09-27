import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const doneTimer = setTimeout(() => onFinish(), 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a2a4a 0%, #0d47a1 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        color: 'white',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          fontSize: '64px',
          marginBottom: '16px',
          animation: 'splashPop 0.6s ease-out',
        }}
      >
        🛡️
      </div>
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0,
          letterSpacing: '0.5px',
          animation: 'splashFadeUp 0.7s ease-out',
        }}
      >
        𝙰𝚁𝚛𝚊𝚔𝚜𝚑𝚊
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: '#b0bec5',
          marginTop: '10px',
          animation: 'splashFadeUp 0.9s ease-out',
        }}
      >
        Train. Practice. Stay Safe.
      </p>

      <style>{`
        @keyframes splashPop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashFadeUp {
          0% { transform: translateY(15px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;