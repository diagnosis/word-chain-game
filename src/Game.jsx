import {useEffect, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {postWord} from "./api/postWord.js";
import Footer from "./Footer.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faHamburger, faHouse} from "@fortawesome/free-solid-svg-icons";

function Game({timeout, highScore,setHighScore}) {
    const [result, setResult] = useState('');
    const [resultStatus, setResultStatus] = useState('neutral');
    const [score, setScore] = useState(0);

    const [minimumLength, setMinimumLength] = useState(2);
    const [time, setTime] = useState(timeout);
    const [firstLetter, setFirstLetter] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isStartDisabled, setIsStartDisabled] = useState(false);
    const [isCounting, setIsCounting] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false); // Track game over state
    const [words, setWords] = useState([])
    const getRandomLetter = () => {
        return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    };
    useEffect(()=>{
        setTime(timeout)
    },[timeout])
    // Update high score whenever score changes
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('wordChainHighScore', score.toString());
        }
    }, [score, highScore]);

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
                setTime(timeout);
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
        setTime(timeout);
        setIsCounting(true);
        setScore(0);
        setMinimumLength(2);
        setUserInput('');
        setIsStartDisabled(true);
        setIsGameOver(false); // Reset game over
        setWords([])
    }

    function restartGame() {
        if (!isCounting || isGameOver) return;
        setResult('Click Start to play');
        setResultStatus('neutral');
        setTime(timeout);
        setIsCounting(false);
        setScore(0);
        setUserInput('');
        setMinimumLength(2);
        setIsStartDisabled(false);
        setIsGameOver(false); // Reset game over
        setWords([])
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
        <div>
            <h1 className="title">Word Chain Game</h1>
            <p className={`result result-${resultStatus}`}>
                {result || (firstLetter ? `Enter a word starting with: ${firstLetter.toUpperCase()}` : 'Click Start to play')}
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
                    disabled={!isCounting || isGameOver}
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

export default Game;