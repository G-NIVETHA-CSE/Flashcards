import React from 'react'; 
import { Link, useLocation } from 'react-router-dom'; 
import './Navbar.css'; 
 
function Navbar() {
  const location = useLocation();
  
  return ( 
    <nav className="navbar"> 
      <div className="brand">🧠 Flashcards</div> 
      <div className="nav-links"> 
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Home</Link> 
        <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>Create Deck</Link> 
        <Link to="/quiz" className={location.pathname === '/quiz' ? 'active' : ''}>Quiz Mode</Link> 
        <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>Statistics</Link> 
      </div> 
    </nav> 
  ); 
} 
 
export default Navbar;