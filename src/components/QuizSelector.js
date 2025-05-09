import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deckService } from "../services/api";
import "./QuizSelector.css";
import { ChevronRight } from "lucide-react";

const QuizSelector = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [decksData, setDecksData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchDecks = async () => {
      setIsLoading(true);
      try {
        const data = await deckService.getDecks();
        setDecksData(data);
      } catch (error) {
        console.error("Error fetching decks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDecks();
  }, []);


  useEffect(() => {
    setLoaded(true);
    const titleElement = document.querySelector('.quiz-selector-title');
    if (titleElement) {
      const text = titleElement.textContent;
      titleElement.innerHTML = '';
      
      [...text].forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char;
        span.style.animationDelay = `${index * 0.1}s`;
        titleElement.appendChild(span);
      });
      
      setTimeout(() => {
        titleElement.classList.add('animated');
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (loaded && decksData.length > 0) {
      const cards = document.querySelectorAll('.deck-card');
      cards.forEach(card => {
        const randomRotation = Math.random() * 4 - 2;
        card.style.setProperty('--rotation', `${randomRotation}deg`);
      });
    }
  }, [decksData, loaded]);

  const handleSelect = (deckId) => {
    navigate(`/quiz/${deckId}`);
  };

  return (
    <div className="quiz-selector-container">
      <div className="floating-cards">
      {["Aptitude", "C Program", "C++ Program", "DBMS", "FullStack", "Python"].map((label, i) => (
    <div key={i} className={`card card-${i + 1}`}>
      {label}
    </div>
  ))}
</div>
      
      <div className="content-wrapper">
        <h2 className="quiz-selector-title">Select a Quiz Category</h2>
        <p className={`selector-subtitle ${loaded ? 'fade-in' : ''}`}>
          Choose a quiz deck to challenge your knowledge
        </p>
        
        <div className="deck-list">
          {isLoading ? (
            <div className="loading-decks">
              <div className="loader"></div>
              Loading decks...
            </div>
          ) : decksData.length === 0 ? (
            <div className="no-decks">
              <p>No decks available 😞</p>
              <button 
                className="create-deck-button"
                onClick={() => navigate('/create-deck')}
              >
                Create New Deck
              </button>
            </div>
          ) : (
            decksData.map((deck, index) => (
              <div
                key={deck._id}
                className={`deck-card ${loaded ? 'appear' : ''}`}
                onClick={() => handleSelect(deck._id)}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="deck-card-content">
                  <h3>{deck.name}</h3>
                  <p>{deck.cards.length} cards</p>
                  <div className="card-difficulty">
                    <span className={`difficulty-badge ${deck.difficulty}`}>
                      {deck.difficulty}
                    </span>
                  </div>
                  <div className="deck-card-overlay">
                    <span className="start-quiz-text">Start Quiz</span>
                    <ChevronRight className="arrow-icon" size={20} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <button 
          className={`back-button ${loaded ? 'bounce-in' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizSelector;