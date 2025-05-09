
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return ( 
    <div className="home-container"> 
      <div className="home-bg"></div>
      
      <div className="animated-elements">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>
      
      <div className={`home-content ${isLoaded ? 'active' : ''}`}> 
        <h1 className="home-title">
          <span className="text-animated">Flash</span>
          <span className="highlight">Master</span>
        </h1>
        
        <p className="home-subtitle">
        <div class="wave-text">
    <span>B</span><span>o</span><span>o</span><span>s</span><span>t</span> <span>y</span><span>o</span><span>u</span><span>r</span> <span>m</span><span>e</span><span>m</span><span>o</span><span>r</span><span>y</span>, <span>l</span><span>e</span><span>a</span><span>r</span><span>n</span> <span>f</span><span>a</span><span>s</span><span>t</span><span>e</span><span>r</span> <br></br>
    </div>
        </p> 
       
        <div className="main-actions">
          <button 
            className="action-button create-button"
            onClick={() => handleNavigation('/create')}
          >
            <span className="button-text">Create New Deck</span>
            <span className="button-icon">+</span>
          </button>
          
          <button 
            className="action-button library-button"
            onClick={() => handleNavigation('/quiz')}
          >
            <span className="button-text">My Decks</span>
            <span className="button-icon">📚</span>
          </button>
        </div>

        <div className="feature-cards"> 
          <div className="feature-card" onClick={() => handleNavigation('/create')}> 
            <div className="feature-icon">✏️</div>
            <h3>Create Decks</h3> 
            <p>Design flashcard sets for any subject with our intuitive editor</p>
          </div> 
          
          <div className="feature-card" onClick={() => handleNavigation('/quiz')}> 
            <div className="feature-icon">🎯</div>
            <h3>Quiz Mode</h3> 
            <p>Test your knowledge with adaptive quizzes that match your learning pace</p>
          </div> 
          
          <div className="feature-card" onClick={() => handleNavigation('/stats')}> 
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3> 
            <p>Visualize your learning journey with detailed stats and insights</p>
          </div> 
        </div>
      </div>
    </div> 
  ); 
} 
 
export default Dashboard;