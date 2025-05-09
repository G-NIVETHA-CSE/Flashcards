
import React, { useState, useEffect } from "react";
import { deckService } from "../services/api";
import "./CreateDeck.css";

const CreateDeck = () => {
  const [cards, setCards] = useState([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [category, setCategory] = useState("");
  const [deckName, setDeckName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState(["", "", ""]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const fetchedDecks = await deckService.getDecks();
        setDecks(fetchedDecks);
        
        if (fetchedDecks.length > 0) {
          setCategory(fetchedDecks[0]._id);
        }
        
        setIsLoaded(true);
      } catch (error) {
        showNotification("Error loading decks", "error");
      }
    };
    
    fetchDecks();
  }, []);

  const addCard = () => {
    if (front && back && wrongAnswers.filter(a => a).length >= 2) {
      setCards([...cards, { 
        front, 
        back,
        wrongAnswers: wrongAnswers.filter(a => a) 
      }]);
      setFront("");
      setBack("");
      setWrongAnswers(["", "", ""]);
    } else {
      showNotification("Please fill front, back, and at least 2 wrong answers", "error");
    }
  };


  const removeCard = (index) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
    showNotification("Card removed");
  };

  const saveDeck = async () => {
    if (cards.length === 0) {
      showNotification("Please add at least one card before saving.", "error");
      return;
    }
  
    setIsLoading(true);
  
    const cardsToSave = cards.map(card => ({
      front: card.front,
      back: card.back,
      wrongAnswers: Array.isArray(card.wrongAnswers) 
        ? card.wrongAnswers.filter(a => a && typeof a === 'string' && a.trim() !== "") 
        : []
    }));
    
    try {
      if (deckName) {
        
        const newDeck = await deckService.createDeck({
          name: deckName,
          cards: cardsToSave
        });
        showNotification(`New deck "${newDeck.name}" created with ${cards.length} card(s)!`, "success");
        
       
        const updatedDecks = await deckService.getDecks();
        setDecks(updatedDecks);
      } else if (category) {
        const updatedDeck = await deckService.addCardsToDeck(category, cardsToSave);
        showNotification(`Added ${cards.length} card(s) to "${updatedDeck.name}" deck!`, "success");
      }
      
      setCards([]);
      setDeckName("");
    } catch (error) {
      showNotification(`Error: ${error.response?.data?.message || "Failed to save deck"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "" });
    }, 3000);
  };

  const togglePreview = () => {
    if (cards.length > 0) {
      setShowPreview(!showPreview);
      setCurrentPreview(0);
    } else {
      showNotification("No cards to preview", "error");
    }
  };

  const nextPreview = () => {
    setCurrentPreview((prev) => (prev + 1) % cards.length);
  };

  const prevPreview = () => {
    setCurrentPreview((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="create-deck-container">
      <div className="create-deck-bg"></div>
      
      <div className="animated-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className={`create-deck-content ${isLoaded ? 'active' : ''}`}>
        <h1 className="create-title">
          <span className="text-glow">Create</span> Your Flashcards
        </h1>
        
        <div className="deck-options">
          <div className="option-group">
            <label className="option-label">Create New Deck</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                value={deckName} 
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Enter new deck name"
                className="deck-name-input"
              />
              <span className="input-focus-effect"></span>
            </div>
          </div>
          
          <div className="option-divider">OR</div>
          
          <div className="option-group">
            <label className="option-label">Add to Existing Deck</label>
            <div className="select-wrapper">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="deck-select"
                disabled={decks.length === 0}
              >
                {decks.length === 0 ? (
                  <option value="">No decks available</option>
                ) : (
                  decks.map(deck => (
                    <option key={deck._id} value={deck._id}>
                      {deck.name}
                    </option>
                  ))
                )}
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>
        </div>

        <div className="card-creation-area">
          <h2 className="section-title">Add New Card</h2>
          
          <div className="card-inputs">
            <div className="input-group">
              <label>Front Side</label>
              <div className="input-wrapper">
                <input 
                  value={front} 
                  onChange={(e) => setFront(e.target.value)} 
                  placeholder="Question or term" 
                />
                <span className="input-focus-effect"></span>
              </div>
            </div>
            
            <div className="input-group">
              <label>Back Side</label>
              <div className="input-wrapper">
                <input 
                  value={back} 
                  onChange={(e) => setBack(e.target.value)} 
                  placeholder="Answer or definition" 
                />
                <span className="input-focus-effect"></span>
              </div>
            </div>
            <div className="input-group">
            <label>Wrong Answers</label>
            {[0, 1, 2].map((index) => (
              <div className="input-wrapper" key={index}>
                <input
                  value={wrongAnswers[index]}
                  onChange={(e) => {
                    const newWrong = [...wrongAnswers];
                    newWrong[index] = e.target.value;
                    setWrongAnswers(newWrong);
                  }}
                  placeholder={`Wrong answer ${index + 1}`}
                />
                <span className="input-focus-effect"></span>
              </div>
            ))}
          </div>
            
            <button 
              className="add-card-btn" 
              onClick={addCard}
            >
              <span className="btn-text">Add Card</span>
              <span className="btn-icon">+</span>
            </button>
          </div>
        </div>
        
        {cards.length > 0 && (
          <div className="cards-list-container">
            <div className="cards-header">
              <h2 className="section-title">Cards in Queue ({cards.length})</h2>
              <button className="preview-btn" onClick={togglePreview}>
                {showPreview ? "Hide Preview" : "Preview Cards"}
              </button>
            </div>
            
            {!showPreview ? (
              <div className="cards-list">
                {cards.map((card, index) => (
                  <div className="card-item" key={index}>
                    <div className="card-content">
                      <div className="card-front">{card.front}</div>
                      <div className="card-divider"></div>
                      <div className="card-back">{card.back}</div>
                    </div>
                    <button 
                      className="remove-card-btn" 
                      onClick={() => removeCard(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-preview-container">
                <div className="card-preview">
                  <div className="preview-front">
                    <div className="preview-content">{cards[currentPreview].front}</div>
                  </div>
                  <div className="preview-back">
                    <div className="preview-content">{cards[currentPreview].back}</div>
                  </div>
                </div>
                <div className="preview-controls">
                  <button onClick={prevPreview}>←</button>
                  <span>{currentPreview + 1} of {cards.length}</span>
                  <button onClick={nextPreview}>→</button>
                </div>
              </div>
            )}
            
            <button 
              className={`save-deck-btn ${isLoading ? 'loading' : ''}`}
              onClick={saveDeck}
              disabled={isLoading}
            >
              <span className="btn-text">{isLoading ? 'Saving...' : 'Save Deck'}</span>
              <span className="btn-icon">💾</span>
            </button>
          </div>
        )}
        
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDeck;