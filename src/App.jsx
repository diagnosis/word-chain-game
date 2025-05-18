import './App.css';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { postWord } from './api/postWord.js';
const TIME_OUT = 10

// Child component for the game logic
function Game() {
  const [result, setResult] = useState('');
  const [resultStatus, setResultStatus] = useState('neutral');
  const [score, setScore] = useState(0);
  const [minimumLength, setMinimumLength] = useState(2);
  const [time, setTime] = useState(TIME_OUT);
  const [firstLetter, setFirstLetter] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isStartDisabled, setIsStartDisabled] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false); // Track game over state
  const [words, setWords] = useState([])
  const getRandomLetter = () => {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  };

  useEffect(() => {
    if (!isCounting || time <= 0) return;

    const intervalId = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          setResult('Game Over');
          setResultStatus('error');
          setIsCounting(false);
          setIsStartDisabled(false);
          setIsGameOver(true); // Set game over
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isCounting, time]);

  const mutation = useMutation({
    mutationFn: (word) => postWord(word),
    onSettled: (data, error, word) => {
      console.log('postWord response:', { data, error });
      if (error) {
        setResult(`Word not found, try another word! Start with: ${firstLetter.toUpperCase()}`);
        setResultStatus('error');
      } else if (data && Array.isArray(data) && data[0]?.word && word.length >= minimumLength) {
        setScore((prev) => prev + 1);
        const nextLetter = data[0].word.slice(-1).toLowerCase();
        setFirstLetter(nextLetter);
        setUserInput('');
        setResult(`Word found! Next word starts with: ${nextLetter.toUpperCase()}`);
        setResultStatus('success');
        setTime(TIME_OUT);
        setMinimumLength(data[0].word.length);
        setWords(prev => [...prev, data[0].word])
      } else {
        setResult(`Invalid word! Start with: ${firstLetter.toUpperCase()}`);
        setResultStatus('error');
      }
    },
  });

  function startGame() {
    setFirstLetter(getRandomLetter());
    setResult('');
    setResultStatus('neutral');
    setTime(TIME_OUT);
    setIsCounting(true);
    setScore(0);
    setMinimumLength(2);
    setUserInput('');
    setIsStartDisabled(true);
    setIsGameOver(false); // Reset game over
  }

  function restartGame() {
    if (!isCounting || isGameOver) return;
    setFirstLetter(getRandomLetter());
    setResult('');
    setResultStatus('neutral');
    setTime(TIME_OUT);
    setIsCounting(false);
    setScore(0);
    setUserInput('');
    setMinimumLength(2);
    setIsStartDisabled(false);
    setIsGameOver(false); // Reset game over
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isGameOver) return; // Prevent submission if game is over
    const word = userInput.trim();
    if (!word) {
      setResult(`Please enter a word! Start with: ${firstLetter.toUpperCase()}`);
      setResultStatus('error');
      return;
    }
    if (word[0].toLowerCase() !== firstLetter) {
      setResult(`You should start with: ${firstLetter.toUpperCase()}`);
      setResultStatus('error');
      return;
    }
    if (word.length < minimumLength) {
      setResult(`Minimum length is ${minimumLength}! Start with: ${firstLetter.toUpperCase()}`);
      setResultStatus('error');
      return;
    }
    if(words.filter(el => el === word).length !== 0) {
      setResult(`You already used this word! Start with: ${firstLetter.toUpperCase()}`);
      setResultStatus('error');
      return;
    }
    mutation.mutate(word);
  }

  return (
      <div className="container">
        <h1 className="title">Word Chain Game</h1>
        <p className={`result result-${resultStatus}`}>
          {result || `Enter a word starting with: ${firstLetter ? firstLetter.toUpperCase() : 'N/A'}`}
        </p>
        <p className="minimum-length">Minimum word length: {minimumLength}</p>
        <h2 className="time-left">Time left: {time}s</h2>
        <h3 className="score">Score: {score}</h3>
        <form onSubmit={handleSubmit}>
          <input
              disabled={!isCounting || isGameOver}
              type="text"
              className="input"
              placeholder="Type your word"
              name="word"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
          />
          <button
              type="submit"
              className="submit-button"
              disabled={isGameOver}
          >
            Submit
          </button>
        </form>
        <div className="buttons">
          <button
              onClick={startGame}
              disabled={isStartDisabled}
              className="start-button"
          >
            Start
          </button>
          <button
              disabled={!(isCounting && !isGameOver)}
              onClick={restartGame}
              className="restart-button">
            Restart
          </button>
        </div>
      </div>
  );
}

// Parent component wrapping with QueryClientProvider
function App() {
  const queryClient = new QueryClient();

  return (
      <QueryClientProvider client={queryClient}>
        <Game />
      </QueryClientProvider>
  );
}

export default App;