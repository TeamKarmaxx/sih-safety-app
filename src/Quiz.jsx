import { useState } from 'react';

function Quiz({ questions, onComplete, accentColor = '#d32f2f' }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const passThreshold = 0.7;

  const handleSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
    setShowResult(true);
    if (index === q.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
  };

  const passed = finished && score / questions.length >= passThreshold;

  if (finished) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: 10,
          right: 10,
          zIndex: 30,
          background: 'white',
          color: 'black',
          padding: '20px',
          borderRadius: '10px',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        }}
      >
        <p style={{ fontSize: '18px', marginBottom: '8px' }}>
          {passed ? '✅ Certified!' : '❌ Not Passed'}
        </p>
        <p style={{ fontSize: '15px', marginBottom: '14px' }}>
          You scored {score} / {questions.length}
          {passed ? '' : ' — need 70% to pass'}
        </p>
        {passed ? (
          <button
            onClick={() => onComplete(true, score, questions.length)}
            style={{
              padding: '8px 20px',
              background: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleRetry}
            style={{
              padding: '8px 20px',
              background: accentColor,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            Retry Quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 10,
        right: 10,
        zIndex: 30,
        background: 'white',
        color: 'black',
        padding: '18px',
        borderRadius: '10px',
        fontFamily: 'sans-serif',
        textAlign: 'left',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ fontSize: '12px', color: '#777', marginBottom: '6px' }}>
        Question {current + 1} of {questions.length}
      </p>
      <p style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>{q.question}</p>

      {q.options.map((opt, i) => {
        let bg = '#f0f0f0';
        if (showResult) {
          if (i === q.correctIndex) bg = '#c8e6c9';
          else if (i === selected) bg = '#ffcdd2';
        }
        return (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              marginBottom: '8px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: bg,
              fontSize: '14px',
              cursor: selected === null ? 'pointer' : 'default',
            }}
          >
            {opt}
          </button>
        );
      })}

      {showResult && (
        <button
          onClick={handleNext}
          style={{
            marginTop: '6px',
            padding: '8px 20px',
            background: accentColor,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          {current < questions.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      )}
    </div>
  );
}

export default Quiz;