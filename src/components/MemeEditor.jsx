import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const MemeEditor = ({ meme, onBack, onAddText }) => {
  const [texts, setTexts] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textOutlineColor, setTextOutlineColor] = useState('#000000');
  const [textSize, setTextSize] = useState(32);
  const [fontStyle, setFontStyle] = useState('Impact');
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
  // Available font styles
  const fontStyles = ['Impact', 'Arial', 'Comic Sans MS', 'Helvetica', 'Times New Roman'];
  
  // Draw the meme with all text overlays
  const drawMeme = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    if (imageRef.current && imageRef.current.complete) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      
      // Draw texts
      texts.forEach((text, index) => {
        ctx.font = `bold ${text.size}px ${text.fontStyle}, sans-serif`;
        ctx.fillStyle = text.color;
        ctx.textAlign = 'center';
        
        // Text outline
        ctx.strokeStyle = text.outlineColor || '#000000';
        ctx.lineWidth = text.size / 15;
        ctx.strokeText(text.value, text.x, text.y);
        
        // Text fill
        ctx.fillText(text.value, text.x, text.y);
        
        // Draw selection rectangle if selected
        if (index === selectedTextIndex && !isDragging) {
          const textMetrics = ctx.measureText(text.value);
          const height = text.size;
          const width = textMetrics.width;
          
          ctx.strokeStyle = '#3b82f6'; // Blue outline for selection
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]); // Dashed outline
          ctx.strokeRect(
            text.x - width/2 - 5,
            text.y - height + 5,
            width + 10,
            height + 5
          );
          ctx.setLineDash([]); // Reset line dash
        }
      });
    }
  };
  
  // Initialize canvas size when image loads
  useEffect(() => {
    const img = imageRef.current;
    
    const handleImageLoad = () => {
      if (canvasRef.current) {
        canvasRef.current.width = img.naturalWidth;
        canvasRef.current.height = img.naturalHeight;
        drawMeme();
      }
    };
    
    if (img) {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        return () => img.removeEventListener('load', handleImageLoad);
      }
    }
  }, [meme]);
  
  // Redraw when texts change
  useEffect(() => {
    drawMeme();
  }, [texts, selectedTextIndex, isDragging]);
  
  const handleCanvasClick = (e) => {
    if (isDragging) return; // Don't handle clicks during drag operations
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Check if clicked on existing text
    let clickedTextIndex = -1;
    texts.forEach((text, index) => {
      const ctx = canvas.getContext('2d');
      ctx.font = `bold ${text.size}px ${text.fontStyle}, sans-serif`;
      const metrics = ctx.measureText(text.value);
      const width = metrics.width;
      const height = text.size;
      
      if (
        x >= text.x - width/2 &&
        x <= text.x + width/2 &&
        y >= text.y - height &&
        y <= text.y
      ) {
        clickedTextIndex = index;
      }
    });
    
    if (clickedTextIndex >= 0) {
      setSelectedTextIndex(clickedTextIndex);
      setCurrentText(texts[clickedTextIndex].value);
      setTextColor(texts[clickedTextIndex].color);
      setTextOutlineColor(texts[clickedTextIndex].outlineColor || '#000000');
      setTextSize(texts[clickedTextIndex].size);
      setFontStyle(texts[clickedTextIndex].fontStyle || 'Impact');
    } else if (currentText) {
      // Add new text at click position
      const newText = {
        value: currentText,
        x,
        y,
        color: textColor,
        outlineColor: textOutlineColor,
        size: textSize,
        fontStyle: fontStyle
      };
      
      setTexts([...texts, newText]);
      setCurrentText('');
      setSelectedTextIndex(null);
    }
  };
  
  const handleUpdateText = () => {
    if (selectedTextIndex !== null) {
      const updatedTexts = [...texts];
      updatedTexts[selectedTextIndex] = {
        ...updatedTexts[selectedTextIndex],
        value: currentText,
        color: textColor,
        outlineColor: textOutlineColor,
        size: textSize,
        fontStyle: fontStyle
      };
      setTexts(updatedTexts);
      setSelectedTextIndex(null);
      setCurrentText('');
    }
  };
  
  const handleRemoveText = () => {
    if (selectedTextIndex !== null) {
      const updatedTexts = texts.filter((_, index) => index !== selectedTextIndex);
      setTexts(updatedTexts);
      setSelectedTextIndex(null);
      setCurrentText('');
    }
  };
  
  const handleDragStart = (index) => {
    setSelectedTextIndex(index);
    setCurrentText(texts[index].value);
    setTextColor(texts[index].color);
    setTextOutlineColor(texts[index].outlineColor || '#000000');
    setTextSize(texts[index].size);
    setFontStyle(texts[index].fontStyle || 'Impact');
    setIsDragging(true);
  };
  
  const handleDragEnd = (index, event, info) => {
    setIsDragging(false);
    
    // Calculate the new position in canvas coordinates
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasScaleX = canvas.width / rect.width;
    const canvasScaleY = canvas.height / rect.height;
    
    const updatedTexts = [...texts];
    const currentPos = { x: updatedTexts[index].x, y: updatedTexts[index].y };
    
    // Apply the delta from dragging to current position, considering canvas scaling
    updatedTexts[index] = {
      ...updatedTexts[index],
      x: currentPos.x + (info.offset.x * canvasScaleX),
      y: currentPos.y + (info.offset.y * canvasScaleY)
    };
    
    setTexts(updatedTexts);
  };
  
  const handleDownload = () => {
    setDownloading(true);
    // Make sure no text is selected when downloading
    setSelectedTextIndex(null);
    
    // Wait for the next render to ensure selection is cleared
    setTimeout(() => {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `${meme.name.replace(/\s+/g, '-').toLowerCase()}-meme.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    }, 100);
  };
  
  const handleShare = async () => {
    setSharing(true);
    setSelectedTextIndex(null);
    
    // Wait for the next render to ensure selection is cleared
    setTimeout(async () => {
      try {
        const canvas = canvasRef.current;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        if (navigator.share) {
          await navigator.share({
            title: `${meme.name} Meme`,
            files: [new File([blob], `${meme.name.replace(/\s+/g, '-').toLowerCase()}-meme.png`, { type: 'image/png' })]
          });
        } else {
          // Fallback for browsers without Web Share API
          const url = URL.createObjectURL(blob);
          const shareText = 'Check out this meme I created!';
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
        }
      } catch (error) {
        console.error('Error sharing meme:', error);
        alert('Sorry, there was an error sharing your meme');
      }
      setSharing(false);
    }, 100);
  };
  
  const handleAddText = () => {
    if (!currentText.trim()) {
      alert("Please enter some text first");
      return;
    }
    
    // Add text to center of canvas if no click position specified
    const canvas = canvasRef.current;
    const newText = {
      value: currentText,
      x: canvas.width / 2,
      y: canvas.height / 2,
      color: textColor,
      outlineColor: textOutlineColor,
      size: textSize,
      fontStyle: fontStyle
    };
    
    setTexts([...texts, newText]);
    setCurrentText('');
  };
  
  // Function to duplicate selected text
  const handleDuplicateText = () => {
    if (selectedTextIndex !== null) {
      const textToDuplicate = texts[selectedTextIndex];
      const newText = {
        ...textToDuplicate,
        x: textToDuplicate.x + 20,
        y: textToDuplicate.y + 20
      };
      
      setTexts([...texts, newText]);
      setSelectedTextIndex(texts.length); // Select the new text
    }
  };
  
  // Generate text layers for dragging
  const textLayers = texts.map((text, index) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    
    // Calculate the left and top position for the div
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${text.size}px ${text.fontStyle}, sans-serif`;
    const metrics = ctx.measureText(text.value);
    const width = metrics.width * scaleX;
    const height = text.size * scaleY;
    
    const left = (text.x * scaleX) - (width / 2);
    const top = (text.y * scaleY) - height;
    
    return (
      <motion.div
        key={index}
        className={`absolute cursor-move ${selectedTextIndex === index ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: `${left}px`,
          top: `${top}px`,
          color: text.color,
          fontSize: `${text.size * scaleY}px`,
          fontFamily: `${text.fontStyle}, sans-serif`,
          fontWeight: 'bold',
          textShadow: `
            -1px -1px 0 ${text.outlineColor || '#000'}, 
            1px -1px 0 ${text.outlineColor || '#000'}, 
            -1px 1px 0 ${text.outlineColor || '#000'}, 
            1px 1px 0 ${text.outlineColor || '#000'}
          `,
          userSelect: 'none',
          zIndex: selectedTextIndex === index ? 10 : 1
        }}
        drag
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTextIndex(index);
          setCurrentText(text.value);
          setTextColor(text.color);
          setTextOutlineColor(text.outlineColor || '#000000');
          setTextSize(text.size);
          setFontStyle(text.fontStyle || 'Impact');
        }}
        onDragStart={() => handleDragStart(index)}
        onDragEnd={(e, info) => handleDragEnd(index, e, info)}
      >
        {text.value}
      </motion.div>
    );
  });
  
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <div 
          ref={containerRef} 
          className="relative w-full bg-gray-100 rounded shadow overflow-hidden"
        >
          <img 
            ref={imageRef}
            src={meme.url} 
            alt={meme.name} 
            className="w-full h-auto invisible absolute" 
          />
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick}
            className="w-full h-auto cursor-pointer"
          />
          {/* Draggable text layers */}
          {textLayers}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onBack}
            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded flex items-center"
          >
            <span className="mr-1">🔙</span> Back
          </button>
          
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
          >
            <span className="mr-1">💾</span> {downloading ? 'Downloading...' : 'Download'}
          </button>
          
          <button
            onClick={handleShare}
            disabled={sharing}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
          >
            <span className="mr-1">📤</span> {sharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
      
      <div className="w-full md:w-72 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Edit Meme</h3>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">Text</label>
          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Enter text to add"
            className="border p-2 w-full rounded resize-y"
            rows="2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm mb-1">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full cursor-pointer h-8 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Outline Color</label>
            <input
              type="color"
              value={textOutlineColor}
              onChange={(e) => setTextOutlineColor(e.target.value)}
              className="w-full cursor-pointer h-8 rounded"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">Font Style</label>
          <select
            value={fontStyle}
            onChange={(e) => setFontStyle(e.target.value)}
            className="border p-2 w-full rounded"
          >
            {fontStyles.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">Text Size: {textSize}px</label>
          <input
            type="range"
            min="12"
            max="72"
            value={textSize}
            onChange={(e) => setTextSize(parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleAddText}
            disabled={!currentText.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-2 rounded flex-1 flex items-center justify-center"
          >
            <span className="mr-1">➕</span> Add Text
          </button>
          
          {selectedTextIndex !== null && (
            <button
              onClick={handleDuplicateText}
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-2 rounded flex-1 flex items-center justify-center"
            >
              <span className="mr-1">📋</span> Duplicate
            </button>
          )}
        </div>
        
        {selectedTextIndex !== null ? (
          <div className="flex gap-2">
            <button
              onClick={handleUpdateText}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex-1 flex items-center justify-center"
            >
              <span className="mr-1">✔️</span> Update
            </button>
            <button
              onClick={handleRemoveText}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex-1 flex items-center justify-center"
            >
              <span className="mr-1">🗑️</span> Remove
            </button>
          </div>
        ) : (
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 border border-blue-200">
            <p className="flex items-center">
              <span className="mr-2">💡</span>
              <span>Drag text to position it, or click on the image to add text.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeEditor;