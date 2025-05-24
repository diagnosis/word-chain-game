import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const postWord = async (word) => {
  const baseUrl = Platform.select({
    web: '',
    default: Constants.expoConfig.extra.apiUrl || 'http://localhost:8081',
  });
  
  const res = await fetch(`${baseUrl}/api/dictionary?word=${encodeURIComponent(word)}`);
  
  if (!res.ok) {
    throw new Error(await res.text());
  }
  
  return res.json();
};

export default function Game() {
  const [result, setResult] = useState('');
  const [resultStatus, setResultStatus] = useState('neutral');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [minimumLength, setMinimumLength] = useState(2);
  const [time, setTime] = useState(10);
  const [firstLetter, setFirstLetter] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isStartDisabled, setIsStartDisabled] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [words, setWords] = useState([]);

  useEffect(() => {
    loadHighScore();
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      saveHighScore(score);
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
          setIsGameOver(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isCounting, time]);

  const loadHighScore = async () => {
    try {
      const savedScore = await AsyncStorage.getItem('wordChainHighScore');
      if (savedScore) {
        setHighScore(parseInt(savedScore));
      }
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  };

  const saveHighScore = async (score) => {
    try {
      await AsyncStorage.setItem('wordChainHighScore', score.toString());
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  const getRandomLetter = () => {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  };

  const mutation = useMutation({
    mutationFn: postWord,
    onSettled: (data, error, word) => {
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
        setTime(10);
        setMinimumLength(data[0].word.length);
        setWords(prev => [...prev, data[0].word]);
      } else {
        setResult(`Invalid word! Start with: ${firstLetter.toUpperCase()}`);
        setResultStatus('error');
      }
    },
  });

  const startGame = () => {
    setFirstLetter(getRandomLetter());
    setResult('');
    setResultStatus('neutral');
    setTime(10);
    setIsCounting(true);
    setScore(0);
    setMinimumLength(2);
    setUserInput('');
    setIsStartDisabled(true);
    setIsGameOver(false);
    setWords([]);
  };

  const restartGame = () => {
    if (!isCounting || isGameOver) return;
    setResult('Press Start to play');
    setResultStatus('neutral');
    setTime(10);
    setIsCounting(false);
    setScore(0);
    setUserInput('');
    setMinimumLength(2);
    setIsStartDisabled(false);
    setIsGameOver(false);
    setWords([]);
  };

  const handleSubmit = () => {
    if (isGameOver) return;
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
    if (words.includes(word)) {
      setResult(`You already used this word! Start with: ${firstLetter.toUpperCase()}`);
      setResultStatus('error');
      return;
    }
    mutation.mutate(word);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Word Chain Game</Text>
      <Text style={[styles.result, styles[`result${resultStatus}`]]}>
        {result || (firstLetter ? `Enter a word starting with: ${firstLetter.toUpperCase()}` : 'Press Start to play')}
      </Text>
      <Text style={styles.info}>Minimum word length: {minimumLength}</Text>
      <Text style={styles.info}>Time left: {time}s</Text>
      <Text style={styles.info}>Score: {score}</Text>
      <Text style={styles.info}>High Score: {highScore}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Type your word"
        value={userInput}
        onChangeText={setUserInput}
        editable={isCounting && !isGameOver}
        onSubmitEditing={handleSubmit}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, (!isCounting || isGameOver) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isCounting || isGameOver}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.startButton, isStartDisabled && styles.buttonDisabled]}
          onPress={startGame}
          disabled={isStartDisabled}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.restartButton, (!isCounting || isGameOver) && styles.buttonDisabled]}
          onPress={restartGame}
          disabled={!isCounting || isGameOver}
        >
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  result: {
    fontSize: 16,
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  resultneutral: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
  },
  resultsuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  },
  resulterror: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: '#64748b',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#22c55e',
  },
  startButton: {
    backgroundColor: '#6366f1',
  },
  restartButton: {
    backgroundColor: '#eab308',
  },
  buttonDisabled: {
    backgroundColor: '#e2e8f0',
  },
});