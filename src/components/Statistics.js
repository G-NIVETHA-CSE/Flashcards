import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Statistics.css";
import { statsService } from "../services/api"; 
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

function Statistics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [groupedStats, setGroupedStats] = useState([]);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [accuracyOverTime, setAccuracyOverTime] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const statsData = await statsService.getUserStats();
        setStats(statsData);
        const grouped = statsData.reduce((acc, entry) => {
          const existing = acc.find(item => item.deck === entry.deck);
          if (existing) {
            existing.totalCards += entry.totalCards;
            existing.correct += entry.correct;
          } else {
            acc.push({ ...entry });
          }
          return acc;
        }, []);
        const total = grouped.reduce((sum, d) => sum + d.totalCards, 0);
        const accuracyData = statsData.map((s) => ({
          date: s.date,
          accuracy: s.accuracy,
          deck: s.deck
        }));

        setGroupedStats(grouped);
        setTotalReviewed(total);
        setAccuracyOverTime(accuracyData);
        setIsLoading(false);
        setTimeout(() => {
          setIsLoaded(true);
        }, 500);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        setError(error.message);
        setIsLoading(false);
        if (error.message.includes('authorize')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
        }
      }
    };

    fetchStats();
  }, [navigate]);
  const handleResetStats = async () => {
    if (window.confirm("Are you sure you want to reset your statistics?")) {
      try {
        setError(null);
        await statsService.resetStats();
        
        setStats([]);
        setGroupedStats([]);
        setTotalReviewed(0);
        setAccuracyOverTime([]);
      } catch (error) {
        console.error("Failed to reset statistics:", error);
        setError("Failed to reset statistics. Please try again.");
        if (error.message.includes('authorize')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const overallAccuracy = totalReviewed > 0 
    ? Math.round((groupedStats.reduce((sum, d) => sum + d.correct, 0) / totalReviewed) * 100) 
    : 0;

  return (
    <div className="statistics">
      <div className="stats-card stats-card-1">{overallAccuracy}%</div>
      <div className="stats-card stats-card-2">{totalReviewed}</div>
      <div className="stats-card stats-card-3">{groupedStats.length}</div>
      
      <h2>📊 Your Study Statistics</h2>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading statistics...</div>
      ) : (
        <>
          <div className="summary">
            <div>
              <p><strong>Total Cards Reviewed:</strong> {totalReviewed}</p>
              {totalReviewed > 0 && (
                <p><strong>Overall Accuracy:</strong> {overallAccuracy}%</p>
              )}
              <p><strong>Total Decks Studied:</strong> {groupedStats.length}</p>
            </div>
            <button className="reset-btn" onClick={handleResetStats}>
              🔄 Reset Statistics
            </button>
          </div>

          {groupedStats.length > 0 ? (
            <div className="deck-stats">
              <h3>📚 Deck-wise Accuracy</h3>
              {groupedStats.map((deck, index) => {
                const accuracy = Math.round((deck.correct / deck.totalCards) * 100);
                return (
                  <div 
                    key={index} 
                    className="deck-progress"
                    style={{ 
                      animationDelay: `${0.2 * index + 1}s`,
                      opacity: isLoaded ? 1 : 0,
                      transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'opacity 0.5s ease, transform 0.5s ease',
                    }}
                  >
                    <p>
                      <span>{deck.deck} - {deck.totalCards} cards</span>
                      <span className="accuracy-value">{accuracy}%</span>
                    </p>
                    <div className="progress-bar">
                      <div 
                        className="fill" 
                        style={{ 
                          width: isLoaded ? `${accuracy}%` : '0%',
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data">No deck statistics available yet. Start a quiz to track your progress!</div>
          )}

          {accuracyOverTime.length > 1 ? (
            <div className="chart-container">
              <h3>📈 Accuracy Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={accuracyOverTime}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fill: '#2d3748' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#2d3748' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Accuracy']}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorAccuracy)"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                    name="Accuracy"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : accuracyOverTime.length === 1 ? (
            <div className="chart-container">
              <h3>📈 Accuracy Over Time</h3>
              <div className="no-data">You need at least two quiz attempts to display the trend chart.</div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default Statistics;