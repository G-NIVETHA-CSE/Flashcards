import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import CreateDeck from './components/CreateDeck';
import QuizMode from './components/QuizMode';
import Statistics from './components/Statistics';
import Layout from './components/Layout';
import QuizSelector from "./components/QuizSelector";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route element={<ProtectedRoute />}></Route>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create" element={<CreateDeck />} />
          <Route path="stats" element={<Statistics />} />
          <Route path="/quiz" element={<QuizSelector />} />
          <Route path="/quiz/:deckId" element={<QuizMode />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
