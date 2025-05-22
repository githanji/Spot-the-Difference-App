import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import gameData from './gameData.json';

function App() {
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [differencesFound, setDifferencesFound] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const config = gameData;

  const image1Ref = useRef(null);
  const image2Ref = useRef(null);
  const overlay1Ref = useRef(null);
  const overlay2Ref = useRef(null);
  const timerId = useRef(null); 

  
  useEffect(() => {
    if (gameStarted && !showSuccess) {
      timerId.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerId.current);
  }, [gameStarted, showSuccess]);

  const syncOverlaySize = () => {
    if (
      image1Ref.current &&
      overlay1Ref.current &&
      image2Ref.current &&
      overlay2Ref.current
    ) {
      const width = Math.min(
        image1Ref.current.clientWidth,
        image2Ref.current.clientWidth
      );
      const height = Math.min(
        image1Ref.current.clientHeight,
        image2Ref.current.clientHeight
      );

      overlay1Ref.current.style.width = width + 'px';
      overlay1Ref.current.style.height = height + 'px';
      overlay2Ref.current.style.width = width + 'px';
      overlay2Ref.current.style.height = height + 'px';
    }
  };

  useEffect(() => {
    syncOverlaySize();
    window.addEventListener('resize', syncOverlaySize);
    return () => window.removeEventListener('resize', syncOverlaySize);
  }, [gameStarted]);

  const drawMarker = (ref, diff, scaleX, scaleY) => {
    const marker = document.createElement('div');
    marker.className = 'highlight';
    marker.style.left = diff.x * scaleX + 'px';
    marker.style.top = diff.y * scaleY + 'px';
    marker.style.width = diff.width * scaleX + 'px';
    marker.style.height = diff.height * scaleY + 'px';
    ref.current.appendChild(marker);
  };

  const handleImageClick = (e, overlayRef, imgRef) => {
    if (!gameStarted) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const img = imgRef.current;
    const scaleX = img.clientWidth / img.naturalWidth;
    const scaleY = img.clientHeight / img.naturalHeight;

    const clickX = (e.clientX - rect.left) / scaleX;
    const clickY = (e.clientY - rect.top) / scaleY;

    config.differences.forEach((diff, index) => {
      if (!differencesFound.includes(index)) {
        const inX = clickX >= diff.x && clickX <= diff.x + diff.width;
        const inY = clickY >= diff.y && clickY <= diff.y + diff.height;
        if (inX && inY) {
          setDifferencesFound(prev => [...prev, index]);
          setScore(prev => prev + 1);
          drawMarker(overlay1Ref, diff, scaleX, scaleY);
          drawMarker(overlay2Ref, diff, scaleX, scaleY);

          
          if (score + 1 === config.differences.length) {
            setShowSuccess(true);
            clearInterval(timerId.current); 
          }
        }
      }
    });
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimer(0);
    setDifferencesFound([]);
    setShowSuccess(false);

    if (overlay1Ref.current) overlay1Ref.current.innerHTML = '';
    if (overlay2Ref.current) overlay2Ref.current.innerHTML = '';
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <div className="config-screen">
          <h2>{config.gameTitle}</h2>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <>
          <h1>{config.gameTitle}</h1>
          <div className="stats">
            <span>Score: {score}</span>
            <span>Time: {timer}s</span>
          </div>
          <div className="game-container">
            <div className="image-wrapper">
              <img
                ref={image1Ref}
                src={config.images.image1}
                alt="spotone"
                onLoad={syncOverlaySize}
              />
              <div
                ref={overlay1Ref}
                className="overlay"
                onClick={e => handleImageClick(e, overlay1Ref, image1Ref)}
              ></div>
            </div>
            <div className="image-wrapper">
             <img
                  ref={image2Ref}
                  src={config.images.image2}   // Assuming config.images.image2 === "/assets/secondimg.jpg"
                  alt="spottwo"
                  onLoad={syncOverlaySize}
              />
              <div
                ref={overlay2Ref}
                className="overlay"
                onClick={e => handleImageClick(e, overlay2Ref, image2Ref)}
              ></div>
            </div>
          </div>
          {showSuccess && (
            <div className="success">
              🎉 Congratulations! You found all differences in {timer} seconds!
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
