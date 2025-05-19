import React, { useState, useEffect } from "react";
import MemeCard from "./components/MemeCard";
import RoastForm from "./components/RoastForm";
import MemeRoulette from "./components/MemeRoulette";
import MemeEditor from "./components/MemeEditor";
import { fetchMemeTemplates } from "./api";

function App() {
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [caption, setCaption] = useState("");
  const [allMemes, setAllMemes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(0);
    }
  }, [isLoading]);

  // Fetch memes from API on component mount
  useEffect(() => {
    const loadMemes = async () => {
      setIsLoading(true);
      try {
        const apiMemes = await fetchMemeTemplates();
        if (apiMemes.length > 0) {
          // Use only API memes, no local memes
          setAllMemes(apiMemes);
        } else {
          // fallback if API returns empty
          setAllMemes([]);
        }
      } catch (error) {
        console.error("Failed to load memes:", error);
        setError("Failed to load memes from API.");
        setAllMemes([]); // Clear memes on error
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    loadMemes();
  }, []);

  // Filter memes based on search term
  const filteredMemes = allMemes.filter((meme) =>
    meme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setSelectedMeme(null);
      setCaption("");
    }
  };

  const handleMemeSelect = (meme) => {
    setSelectedMeme(meme);
    setCaption("");
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      } transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto p-4">
        <header className="text-center py-8 relative">
          <button
            onClick={toggleTheme}
            className={`absolute right-2 top-2 w-10 h-10 rounded-full flex items-center justify-center 
                      ${
                        theme === "dark"
                          ? "bg-gray-700 text-yellow-300"
                          : "bg-gray-200 text-gray-800"
                      }`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center">
            <span className="mr-3 text-3xl md:text-4xl">🔥</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">
              Meme Creator
            </span>
          </h1>
          <p
            className={`text-lg ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Create, Edit, and Share your favorite memes!
          </p>
        </header>

        {!selectedMeme ? (
          <>
            <div className="mb-6">
              <div
                className={`relative rounded-full overflow-hidden shadow-md 
                             ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for meme templates..."
                  className={`w-full p-4 pr-12 text-base rounded-full outline-none focus:ring-2 
                            ${
                              theme === "dark"
                                ? "bg-gray-800 text-white focus:ring-blue-500"
                                : "bg-white text-gray-900 focus:ring-amber-400"
                            }`}
                />
                <div className="absolute right-4 top-4">
                  <span className="text-xl">{searchTerm ? "🔍" : "🔎"}</span>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={`absolute right-12 top-4 text-lg ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-red-500 h-2.5 rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p
                  className={
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }
                >
                  Loading meme templates... {Math.round(loadingProgress)}%
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
                    <p className="flex items-center">
                      <span className="mr-2">⚠️</span>
                      <span>{error}</span>
                    </p>
                  </div>
                )}

                {filteredMemes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredMemes.map((meme) => (
                      <MemeCard
                        key={meme.id || meme.name}
                        meme={meme}
                        onClick={handleMemeSelect}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className={`text-center py-12 rounded-lg ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    } shadow`}
                  >
                    <p className="text-5xl mb-4">🧐</p>
                    <p className="text-xl font-medium mb-2">No memes found</p>
                    <p
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }
                    >
                      Try a different search term or clear your search
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                <div className="flex justify-center mt-10">
                  <MemeRoulette onPick={handleMemeSelect} memes={allMemes} />
                </div>
              </>
            )}
          </>
        ) : (
          <div
            className={`rounded-lg shadow-lg p-6 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            {isEditing ? (
              <MemeEditor meme={selectedMeme} onBack={handleBack} />
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-2/3">
                  <div
                    className={`rounded-lg shadow-md overflow-hidden ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <img
                      src={selectedMeme.url}
                      alt={selectedMeme.name}
                      className="w-full"
                    />
                  </div>

                  {caption && (
                    <div
                      className={`p-4 rounded-lg mt-4 border-l-4 ${
                        theme === "dark"
                          ? "bg-gray-700 border-amber-500"
                          : "bg-amber-50 border-amber-500"
                      }`}
                    >
                      <p className="text-xl font-bold">{caption}</p>
                    </div>
                  )}
                </div>

                <div className="md:w-1/3">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold truncate">
                      {selectedMeme.name}
                    </h2>
                    <button
                      onClick={handleBack}
                      className={`px-3 py-1 rounded-full flex items-center ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <span className="mr-1">←</span> Back
                    </button>
                  </div>

                  <button
                    onClick={handleStartEditing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                              text-white px-4 py-3 rounded-lg mb-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                  >
                    <span className="mr-2">✏️</span> Edit Meme
                  </button>

                  <RoastForm meme={selectedMeme} onGenerate={setCaption} />
                </div>
              </div>
            )}
          </div>
        )}

        <footer
          className={`mt-12 text-center ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          } text-sm py-4`}
        >
          <p>
            © {new Date().getFullYear()} Meme Creator | All memes belong to
            their respective owners
          </p>
          <div className="flex justify-center gap-3 mt-2">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:underline">
              Terms of Use
            </a>
            <span>•</span>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
