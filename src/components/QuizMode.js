import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deckService, statsService } from "../services/api"; 
import "./QuizMode.css";
import { Check, X, ArrowRight, BarChart2, RefreshCw, Star, Clock, Award } from "lucide-react";

const QuizMode = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [animateOut, setAnimateOut] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [animateOption, setAnimateOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [transitioning, setTransitioning] = useState(false); 

  const isQuizCompleted = deck && currentIndex >= deck.cards.length;

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const data = await deckService.getDeck(deckId);
        setDeck(data);
        setError(null);
      } catch (err) {
        setError("Deck not found");
        navigate("/quiz");
      } finally {
        setLoading(false);
      }
    };
    
    if (deckId) fetchDeck();
  }, [deckId, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveTitle = (text) => {
    return (
      <div className="wave-text">
        {text.split('').map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    );
  };

  const generateOptions = () => {
    if (!deck || isQuizCompleted || !deck.cards[currentIndex]) return;
  
    const currentCard = deck.cards[currentIndex];
    const correctAnswer = currentCard.back;
    
    
    const storedWrongAnswers = Array.isArray(currentCard.wrongAnswers) 
      ? currentCard.wrongAnswers.filter(a => a && typeof a === 'string' && a.trim() !== "")
      : [];
    
   
    if (storedWrongAnswers.length >= 3) {
     
      const selectedWrongs = storedWrongAnswers.slice(0, 3);
      const options = shuffleArray([correctAnswer, ...selectedWrongs]);
      setShuffledOptions(options);
      return;
    }
    
    const otherWrongs = [];
    
    if (storedWrongAnswers.length > 0) {
      otherWrongs.push(...storedWrongAnswers);
    }
    
    if (otherWrongs.length < 3) {
      const otherCardAnswers = deck.cards
        .filter((c, i) => i !== currentIndex) 
        .map(c => c.back)
        .filter(a => a !== correctAnswer); 
      
      
      const shuffledOthers = shuffleArray(otherCardAnswers);
      
      while (otherWrongs.length < 3 && shuffledOthers.length > 0) {
        const candidate = shuffledOthers.pop();
        if (!otherWrongs.includes(candidate)) {
          otherWrongs.push(candidate);
        }
      }
      
     
      while (otherWrongs.length < 3) {
        otherWrongs.push(`Alternative option ${otherWrongs.length + 1}`);
      }
    }
    
    
    const options = shuffleArray([correctAnswer, ...otherWrongs.slice(0, 3)]);
    setShuffledOptions(options);
  };
  
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    setTimeout(() => setPageLoaded(true), 300);
  }, []);

  useEffect(() => {
    if (quizStarted && deck && !isQuizCompleted) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizStarted, isQuizCompleted, deck]);

  useEffect(() => {
    if (deck && !transitioning) {
      generateOptions();
      setAnimateOut(false); 
    }
  }, [currentIndex, deck, transitioning]);

 
  useEffect(() => {
    if (deck && isQuizCompleted) {
      clearInterval(timerRef.current);
      
      const existingData = JSON.parse(localStorage.getItem("quizStats")) || [];
      const accuracy = Math.round((correctCount / deck.cards.length) * 100);

      const newEntry = {
        deckId: deck._id,
        deckName: deck.name,
        totalCards: deck.cards.length,
        correct: correctCount,
        accuracy,
        timeTaken: timer,
        bestStreak,
        hintsUsed,
        date: new Date().toISOString(),
      };

      localStorage.setItem("quizStats", JSON.stringify([...existingData, newEntry]));
      
      const saveStats = async () => {
        try {
          setSaveError(null);
          await statsService.recordStats({
            deck: deck.name,
            totalCards: deck.cards.length,
            correct: correctCount
          });
        } catch (error) {
          console.error("Failed to save statistics to backend:", error);
          setSaveError("Failed to save your results to the server");
        }
      };
      
      saveStats();
    }
  }, [isQuizCompleted, correctCount, deck, timer, bestStreak, hintsUsed]);

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswer = (selected) => {
    if (!deck || !deck.cards[currentIndex]) return;
    
    const currentCard = deck.cards[currentIndex];
    const isCorrect = selected === currentCard.back;
    
    setSelectedAnswer(selected);
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    setAnimateOption(selected);
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      setCorrectCount(prev => prev + 1);
    } else {
      setStreak(0);
      setWrongCount(prev => prev + 1);
    }
  
    setFlipped(true);
    
    setTransitioning(true);
  
    setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setFlipped(false);
        setSelectedAnswer(null);
        setAnswerStatus(null);
        setAnimateOption(null);
        setShowHint(false);
        
       
        setTimeout(() => {
          setTransitioning(false);
        }, 50);
      }, 600);
    }, 2000);
  };
  
  const showHintHandler = () => {
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loader"></div>
        <p>Loading deck...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <h2>{error}</h2>
        <button onClick={() => navigate("/quiz")}>Back to Quiz Select</button>
      </div>
    );
  }
  
 
  const currentCard = deck && !isQuizCompleted ? deck.cards[currentIndex] : null;
  const hasOptions = shuffledOptions && shuffledOptions.length > 0;

  const progressPercentage = isQuizCompleted 
    ? 100 
    : Math.round((currentIndex / deck.cards.length) * 100);

  return (
    <div className={`quiz-mode-container ${pageLoaded ? 'loaded' : ''}`}>
      <div className="animated-elements">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>
      
      <div className="quiz-content-wrapper">
        {!quizStarted ? (
          <div className="quiz-intro">
            <h2 className="intro-title">
              {deck.name}
              <div className="title-underline"></div>
            </h2>
            <p className="intro-description">
              {deck.description || `You're about to start a ${deck.difficulty} quiz with ${deck.cards.length} questions.`}
            </p>
            
            <div className="intro-details">
              <div className="intro-detail">
                <Clock size={24} />
                <div className="detail-info">
                  <div className="detail-value">Timed</div>
                  <div className="detail-label">Quiz</div>
                </div>
              </div>
              
              <div className="intro-detail">
                <Award size={24} />
                <div className="detail-info">
                  <div className="detail-value">{deck.cards.length}</div>
                  <div className="detail-label">Questions</div>
                </div>
              </div>
              
              <div className="intro-detail">
                <Star size={24} />
                <div className="detail-info">
                  <div className="detail-value">{deck.difficulty}</div>
                  <div className="detail-label">Difficulty</div>
                </div>
              </div>
            </div>
            
            <button className="start-quiz-button" onClick={startQuiz}>
              <span className="button-text">Start Quiz</span>
              <ArrowRight className="button-icon" size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="quiz-header">
              <h2 className="quiz-title">{deck.name}</h2>
              
              <div className="quiz-stats">
                <div className="stat-item timer">
                  <Clock size={16} />
                  <span>{formatTime(timer)}</span>
                </div>
                <div className="stat-item streak">
                  <Star size={16} className={streak > 0 ? 'streak-active' : ''} />
                  <span className={streak > 0 ? 'streak-active' : ''}>Streak: {streak}</span>
                </div>
              </div>
              
              <div className="quiz-progress-container">
                <div className="quiz-progress-bar">
                  <div 
                    className="quiz-progress-fill" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="quiz-progress-text">
                  {isQuizCompleted 
                    ? "Completed!" 
                    : `Question ${currentIndex + 1} of ${deck.cards.length}`}
                </div>
              </div>
            </div>

            {!isQuizCompleted ? (
              <div className={`quiz-card ${animateOut ? 'animate-out' : 'animate-in'}`}>
               
                {(!currentCard || !hasOptions) && (
                  <div className="debug-info" style={{color: 'red', padding: '10px', border: '1px solid red'}}>
                    <p>Debug: {!currentCard ? 'Missing card' : 'Missing options'}</p>
                    <p>Current Index: {currentIndex}</p>
                    <p>Options Count: {shuffledOptions.length}</p>
                  </div>
                )}
                
                {currentCard && (
                  <div className={`flashcard-container ${flipped ? 'is-flipped' : ''}`}>
                    <div className="flashcard-inner">
                      <div className="flashcard-front">
                        <div className="question-text">
                          {currentCard.front}
                        </div>
                        
                        {!flipped && (
                          <button 
                            className="hint-button" 
                            onClick={showHintHandler}
                            disabled={showHint}
                          >
                            Need a Hint?
                          </button>
                        )}
                        
                        {showHint && (
                          <div className="hint-box">
                            <p>{currentCard.hint || 
                              `First letter: "${currentCard.back.charAt(0)}"`}</p>
                          </div>
                        )}
                      </div>
                      <div className="flashcard-back">
                        <div className="correct-answer">
                          <span className="answer-label">Correct Answer:</span>
                          <span className="answer-text">{currentCard.back}</span>
                        </div>
                        
                        {selectedAnswer && (
                          <div className={`selected-answer ${answerStatus}`}>
                            <span className="answer-label">Your Answer:</span>
                            <span className="answer-text">{selectedAnswer}</span>
                            <div className="answer-icon">
                              {answerStatus === 'correct' ? <Check size={24} /> : <X size={24} />}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {hasOptions && (
                  <div className="quiz-options">
                    {shuffledOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        className={`quiz-option-btn ${
                          flipped ? (opt === currentCard.back ? 'correct' : 
                                  opt === selectedAnswer ? 'incorrect' : 'neutral') : ''
                        } ${animateOption === opt ? 'animated-select' : ''}`}
                        onClick={() => !flipped && handleAnswer(opt)}
                        disabled={flipped}
                      >
                        <span className="option-text">{opt}</span>
                        {flipped && opt === currentCard.back && <Check className="option-icon" size={18} />}
                        {flipped && opt === selectedAnswer && opt !== currentCard.back && <X className="option-icon" size={18} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="quiz-completion">
                <div className="confetti-container">
                  {Array(20).fill().map((_, i) => (
                    <div 
                      key={i} 
                      className="confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: ['#4f46e5', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)]
                      }}
                    ></div>
                  ))}
                </div>
                
                <div className="completion-card">
                  <div className="completion-header">
                    {renderWaveTitle("Quiz Completed!")}
                  </div>
                  
                  {saveError && (
                    <div className="error-message">
                      {saveError}
                    </div>
                  )}
                  
                  <div className="completion-stats">
                    <div className="completion-stat">
                      <div className="stat-circle correct-circle">
                        <Check size={32} />
                      </div>
                      <span className="stat-number correct">{correctCount}</span>
                      <span className="stat-label">Correct</span>
                    </div>
                    <div className="completion-stat">
                      <div className="stat-circle incorrect-circle">
                        <X size={32} />
                      </div>
                      <span className="stat-number incorrect">{wrongCount}</span>
                      <span className="stat-label">Incorrect</span>
                    </div>
                    <div className="completion-stat">
                      <div className="stat-circle accuracy-circle">
                        <span className="accuracy-value">
                          {Math.round((correctCount / deck.cards.length) * 100)}%
                        </span>
                      </div>
                      <span className="stat-label">Accuracy</span>
                    </div>
                  </div>
                  
                  <div className="additional-stats">
                    <div className="additional-stat">
                      <Clock size={20} />
                      <span>Time: {formatTime(timer)}</span>
                    </div>
                    <div className="additional-stat">
                      <Star size={20} />
                      <span>Best Streak: {bestStreak}</span>
                    </div>
                  </div>
                  
                  <div className="completion-actions">
                    <button 
                      className="view-stats-btn"
                      onClick={() => navigate("/stats")}
                    >
                      <BarChart2 size={20} />
                      View Stats
                    </button>
                    <button 
                      className="try-again-btn"
                      onClick={() => {
                        setCurrentIndex(0);
                        setCorrectCount(0);
                        setWrongCount(0);
                        setStreak(0);
                        setBestStreak(0);
                        setTimer(0);
                        setHintsUsed(0);
                        setQuizStarted(false);
                        navigate(`/quiz/${deckId}`);
                      }}
                    >
                      <RefreshCw size={20} />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizMode;