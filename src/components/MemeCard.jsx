import React from "react";

function MemeCard({ meme, onClick }) {
  return (
    <div 
      className="cursor-pointer transition-transform hover:scale-105 bg-white rounded-lg shadow overflow-hidden"
      onClick={() => onClick(meme)}
    >
      <div className="h-40 overflow-hidden">
        <img 
          src={meme.url} 
          alt={meme.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2">
        <p className="text-center font-medium truncate text-sm">{meme.name}</p>
      </div>
    </div>
  );
}

export default MemeCard;