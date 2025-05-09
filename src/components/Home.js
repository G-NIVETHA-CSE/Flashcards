import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import './Home.css'; 

function Home() { 
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  
  const titleText = "Flashcard Learning App";
  const subtitleText = "A memory-training tool using flashcards";
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    try {
      setIsSubmitting(true);
      
      
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong during signup');
      }
      
     
      setAuthMessage('Account created successfully! Please sign in.');
      
      setIsLogin(true);
     
      setFormData({
        email: formData.email,
        password: '',
        confirmPassword: '',
        name: ''
      });
      
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
    
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }
    
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    
      navigate('/dashboard');
      
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthMessage('');
    
    if (validateForm()) {
      if (isLogin) {
        handleLogin();
      } else {
        handleSignup();
      }
    }
  };

  const openModal = (loginMode = true) => {
    setIsLogin(loginMode);
    setShowModal(true);
    setAuthMessage('');
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const switchAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthMessage('');
    setErrors({});
  };
 
  return ( 
    <div className="home-container"> 
      <div className={`content-wrapper ${isLoaded ? 'slide-up-animation' : ''}`}>
        <h1 className={`home-title ${isLoaded ? 'animated' : ''}`}>
          {titleText.split('').map((letter, index) => (
            <span 
              key={index} 
              className="letter"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </h1>
        
        <p className={`home-subtitle ${isLoaded ? 'fade-in' : ''}`}>
          {subtitleText}
        </p>
        
        <div className={`buttons-container ${isLoaded ? 'fade-in-delay' : ''}`}>
          <button 
            className="login-button primary-button" 
            onClick={() => openModal(true)}
          >
            Login
            <span className="button-icon">→</span>
          </button>
          <button 
            className="signup-button secondary-button" 
            onClick={() => openModal(false)}
          >
            Sign Up
          </button>
        </div>
      </div>

   
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>×</button>
            <h2 className="modal-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            
            {authMessage && (
              <div className={`auth-message ${authMessage.includes('success') ? 'success' : 'error'}`}>
                {authMessage}
              </div>
            )}
            
            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className={errors.name ? 'error-input' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'error-input' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error-input' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'error-input' : ''}
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              )}
              
              <button 
                type="submit" 
                className="auth-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
              </button>
            </form>
            
            <div className="auth-switch">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="switch-link" 
                onClick={switchAuthMode}
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="floating-cards">
        <div className="card card-1">Aptitude</div>
        <div className="card card-2">C Program</div>
        <div className="card card-3">C++ Program</div>
        <div className="card card-4">DBMS</div>
        <div className="card card-5">FullStack</div>
        <div className="card card-6">Python</div>
      </div>
    </div> 
  ); 
} 
 
export default Home;