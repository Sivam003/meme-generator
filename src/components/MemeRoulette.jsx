
import React, { useState } from "react";

function MemeRoulette({ onPick, memes }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const randomMeme = () => {
    setIsAnimating(true);
    
    // Add some delay to make the animation more noticeable
    setTimeout(() => {
      const index = Math.floor(Math.random() * memes.length);
      onPick(memes[index]);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <button
      onClick={randomMeme}
      disabled={isAnimating}
      className={`
        bg-gradient-to-r from-yellow-400 to-amber-500 
        text-white px-6 py-3 rounded-full font-medium 
        shadow-md hover:shadow-lg transition-all 
        flex items-center justify-center
        ${isAnimating ? 'animate-pulse' : ''}
      `}
    >
      <span className={`text-2xl mr-2 ${isAnimating ? 'animate-spin' : ''}`}>🎲</span> 
      <span>{isAnimating ? "Rolling..." : "Random Meme"}</span>
    </button>
  );
}

export default MemeRoulette;