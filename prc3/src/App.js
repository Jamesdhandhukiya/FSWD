import React, { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');


  const [currentTime, setCurrentTime] = useState(new Date());

  const [feedbackCounts, setFeedbackCounts] = useState({ Excellent: 0,Good: 0, Average: 0, Poor: 0});

  const [userCounter, setUserCounter] = useState(0);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


 useEffect(() => {
  const votingTimer = setInterval(() => {
    const feedbackOptions = ['Excellent', 'Good', 'Average', 'Poor'];
    const randomOption = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];

    setFeedbackCounts(prevCounts => ({
      ...prevCounts,
      [randomOption]: prevCounts[randomOption] + 1
    }));
  }, 2000);

  return () => clearInterval(votingTimer);
}, []);



  const handleFeedback = (feedbackType) => {
    setFeedbackCounts(prevCounts => ({
      ...prevCounts,
      [feedbackType]: prevCounts[feedbackType] + 1
    }));
    setUserCounter(prev => prev + 1);
  };


  const incrementCounter = () => setUserCounter(prev => prev + 1);
  const decrementCounter = () => setUserCounter(prev => Math.max(0, prev - 1));
  const resetCounter = () => setUserCounter(0);
  const incrementByFive = () => setUserCounter(prev => prev + 5);

  const date = currentTime.toLocaleDateString();
  const time = currentTime.toLocaleTimeString();

  return (
    <div className="dashboard">
      <div className="container">
       
        <div className="section greeting-section">
          <h1>Live Event Feedback Dashboard</h1>
          <div className="input-group">
            <input type="text"placeholder="Enter your first name"value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field"/>
            <input type="text"placeholder="Enter your surname" value={surname}onChange={(e) => setSurname(e.target.value)} className="input-field"/>
          </div>
          {firstName && surname && (
            <div className="greeting"> Welcome, {firstName} {surname} !</div>
          )}
        </div>

      
        <div className="section clock-section">
          <h2>Live Clock</h2>
          <div className="clock">
            <div className="date">{date}</div>
            <div className="time">{time}</div>
          </div>
        </div>

      
        <div className="section feedback-section">
          <h2>Session Feedback</h2>
          <div className="feedback-buttons">
            <button  onClick={() => handleFeedback('Excellent')} className="feedback-btn excellent">Excellent </button>
            <button onClick={() => handleFeedback('Good')} className="feedback-btn good" >Good </button>
            <button onClick={() => handleFeedback('Average')}className="feedback-btn average">Average</button>
            <button  onClick={() => handleFeedback('Poor')}className="feedback-btn poor">Poor </button>
          </div>
          
          <div className="feedback-results">
            <h3>Current Results:</h3>
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Excellent:</span>
                <span className="result-count">{feedbackCounts.Excellent}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Good:</span>
                <span className="result-count">{feedbackCounts.Good}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Average:</span>
                <span className="result-count">{feedbackCounts.Average}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Poor:</span>
                <span className="result-count">{feedbackCounts.Poor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section counter-section">
          <h2>Your Feedback Counter</h2>
          <div className="counter-display">
            <span className="counter-value">{userCounter}</span>
          </div>
          <div className="counter-controls">
            <button onClick={incrementCounter} className="counter-btn">
              Increment
            </button>
            <button onClick={decrementCounter} className="counter-btn">
              Decrement
            </button>
            <button onClick={resetCounter} className="counter-btn reset">
              Reset
            </button>
            <button onClick={incrementByFive} className="counter-btn">
              Increment by 5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;