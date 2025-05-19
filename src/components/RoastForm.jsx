import React, { useState } from "react";
import { generateRoastCaption } from "../api";

function RoastForm({ meme, onGenerate }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [roastLevel, setRoastLevel] = useState("medium"); // mild, medium, savage
  const [roastStyle, setRoastStyle] = useState("funny"); // funny, sarcastic, clever
  const [advanced, setAdvanced] = useState(false);

  async function handleGenerate() {
    if (!name.trim()) {
      alert("Please enter your friend's name");
      return;
    }
    
    setLoading(true);
    try {
      const caption = await generateRoastCaption(meme.name, name, roastLevel, roastStyle);
      onGenerate(caption);
    } catch (error) {
      console.error("Failed to generate caption:", error);
      alert("Failed to generate caption. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <span className="mr-2">🔥</span>
        Generate Roast Caption
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Friend's Name</label>
          <input
            type="text"
            placeholder="Enter your friend's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-2 w-full focus:ring focus:ring-blue-300 focus:outline-none"
          />
        </div>
        
        <div className="flex items-center text-sm">
          <button 
            onClick={() => setAdvanced(!advanced)} 
            className="text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
          >
            {advanced ? "Hide" : "Show"} Advanced Options
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`ml-1 h-4 w-4 transform transition-transform ${advanced ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {advanced && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roast Intensity</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRoastLevel("mild")}
                  className={`flex-1 py-1 px-2 rounded text-sm ${
                    roastLevel === "mild"
                      ? "bg-yellow-100 border-2 border-yellow-300 text-yellow-800"
                      : "bg-gray-100 hover:bg-yellow-50"
                  }`}
                >
                  Mild 🙂
                </button>
                <button
                  type="button"
                  onClick={() => setRoastLevel("medium")}
                  className={`flex-1 py-1 px-2 rounded text-sm ${
                    roastLevel === "medium"
                      ? "bg-orange-100 border-2 border-orange-300 text-orange-800"
                      : "bg-gray-100 hover:bg-orange-50"
                  }`}
                >
                  Medium 😏
                </button>
                <button
                  type="button"
                  onClick={() => setRoastLevel("savage")}
                  className={`flex-1 py-1 px-2 rounded text-sm ${
                    roastLevel === "savage"
                      ? "bg-red-100 border-2 border-red-300 text-red-800"
                      : "bg-gray-100 hover:bg-red-50"
                  }`}
                >
                  Savage 🔥
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roast Style</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRoastStyle("funny")}
                  className={`flex-1 py-1 px-2 rounded text-sm ${
                    roastStyle === "funny"
                      ? "bg-blue-100 border-2 border-blue-300 text-blue-800"
                      : "bg-gray-100 hover:bg-blue-50"
                  }`}
                >
                  Funny 😂
                </button>
                <button
                  type="button"
                  onClick={() => setRoastStyle("sarcastic")}
                  className={`flex-1 py-1 px-2 rounded text-sm ${
                    roastStyle === "sarcastic"
                      ? "bg-purple-100 border-2 border-purple-300 text-purple-800"
                      : "bg-gray-100 hover:bg-purple-50"
                  }`}
                >
                  Sarcastic 🙄
                </button>
                <button
                  type="button"
                  onClick={() => setRoastStyle("clever")}
                  className={`flex-1 py-1 px-2 rounded text-sm ${
                    roastStyle === "clever"
                      ? "bg-green-100 border-2 border-green-300 text-green-800"
                      : "bg-gray-100 hover:bg-green-50"
                  }`}
                >
                  Clever 🧠
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-2">🔥</span> Generate Roast
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default RoastForm;