import React, { useState, useEffect } from 'react';
import './WordScrambleGame.css';
const WordScrambleGame = () => {
    const maxAttempts = 3;
    const maxPass = 2;

    const WordList = [
        "apple", "banana", "cherry", "date", "elderberry",
        "fig", "grape", "honeydew", "kiwi", "lemon"
    ];
    

    const [word, setWord] = useState([]);
    const [currentWord, setCurrentWord] = useState('');
    const [scrambledWord, setScrambledWord] = useState('');
    const [Input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [pass, setPass] = useState(maxPass);
    const [isGameOver, setIsGameOver] = useState(false);
    const [status, setStatus] = useState('');

    const shuffle = (input) => {
        const tempArray = [...input];
        const arrayLength = tempArray.length;
        for (let i = 0; i < arrayLength; i++) {
            const currentItem = tempArray[i];
            const randomIndex = Math.floor(Math.random() * arrayLength);
            const randomItem = tempArray[randomIndex];
            tempArray[i] = randomItem;
            tempArray[randomIndex] = currentItem;
        }
        return typeof input === 'string' ? tempArray.join('') : tempArray;
    };

    const initiateNewGame = () => {
        const freshWordList = [...WordList];
        setWord(freshWordList);
        const firstWord = freshWordList[0];
        setCurrentWord(firstWord);
        setScrambledWord(shuffle(firstWord));
        setScore(0);
        setStrikes(0);
        setPass(maxPass);
        setStatus('');
        setIsGameOver(false);
        storeGameProgress(freshWordList, firstWord, 0, 0, maxPass, false);
    };

    const storeGameProgress = (words, current, score, strikes, skips, over) => {
        const gameProgress = { words, current, score, strikes, skips, over };
        localStorage.setItem('wordScrambleGameProgress', JSON.stringify(gameProgress));
        // console.log("Game progress saved:", gameProgress); Testing
    };

    useEffect(() => {
        const savedProgress = JSON.parse(localStorage.getItem('wordScrambleGameProgress'));
        if (savedProgress) {
            setWord(savedProgress.words);
            setCurrentWord(savedProgress.current);
            setScrambledWord(shuffle(savedProgress.current));
            setScore(savedProgress.score);
            setStrikes(savedProgress.strikes);
            setPass(savedProgress.skips);
            setIsGameOver(savedProgress.over);
            if (savedProgress.over) {
                setStatus('Game Over! Your final score was: ' + savedProgress.score);
            } else {
                setStatus('');
            }
        } else {
            initiateNewGame();
        }
    }, []);

    const submit = (event) => {
        event.preventDefault();
        if (Input.toLowerCase() === currentWord) {
            const newScore = score + 1;
            setScore(newScore);
            setStatus('Correct!');
            NextWord(newScore);
        } else {
            const updatedstrikes = strikes + 1;
            setStrikes(updatedstrikes);
            setStatus('Incorrect!');
            storeGameProgress(word, currentWord, score, updatedstrikes, pass, isGameOver);
            if (updatedstrikes >= maxAttempts) {
                setIsGameOver(true);
                storeGameProgress(word, currentWord, score, updatedstrikes, pass, true);
            }
        }
        setInput('');
    };

    const NextWord = (newScore) => {
        const remainingWords = word.filter(word => word !== currentWord);
        if (remainingWords.length > 0) {
            const nextWord = remainingWords[0];
            setWord(remainingWords);
            setCurrentWord(nextWord);
            setScrambledWord(shuffle(nextWord));
            storeGameProgress(remainingWords, nextWord, newScore, strikes, pass, isGameOver);
        } else {
            setIsGameOver(true);
            storeGameProgress([], '', newScore, strikes, pass, true);
        }
    };

    const PassWord = () => {
        if (pass > 0) {
            const updatedSkips = pass - 1;
            setPass(updatedSkips);
            // console.log(`Skip used! Remaining skips: ${updatedSkips}`); Testing
            NextWord(score);
            setStatus('Skipped!');
            storeGameProgress(word, currentWord, score, strikes, updatedSkips, isGameOver);
        } else {
            setStatus('No skips remaining!');
            // console.log("No skips remaining!"); Testing
        }
    };

    return (
        <div className="container">
            <h1 className="title">Word Scramble Game</h1>
            {!isGameOver ? (
                <div className="content">
                    <p className="scrambled-Word">Scrambled Word: <strong>{scrambledWord}</strong></p>
                    <form className="form" onSubmit={submit}>
                        <input
                            type="text"
                            className="input"
                            value={Input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your guess"
                        />
                        <button type="submit" className="guessbtn">Guess</button>
                    </form>
                    <p className="status">{status}</p>
                    <button className="passbtn" onClick={PassWord} disabled={pass === 0}>
                    Pass (Remaining: {pass})
                    </button>
                    <p className="score">Score: {score} | Strikes: {strikes}/{maxAttempts}</p>
                </div>
            ) : (
                <div className="gameover">
                    <h2 className="gameoverTitle">Game Over!</h2>
                    <p className="finalscoretxt">Your final score is: {score}</p>
                    <button className="playagainbtn" onClick={initiateNewGame}>Play Again</button>
                </div>
            )}
        </div>
    );
    
};

export default WordScrambleGame;
