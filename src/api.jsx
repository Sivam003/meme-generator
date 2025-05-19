// API utilities for fetching meme templates and generating captions
import axios from 'axios';

// The imgflip API for getting meme templates
const IMGFLIP_API = 'https://api.imgflip.com/get_memes';

// OpenAI API for caption generation (you'll need to add your API key)
const OPENAI_API = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = 'YOUR_API_KEY'; // Replace with your API key or use environment variable

// Cache memes to avoid repeated API calls
let cachedMemes = null;

// Function to fetch meme templates from ImgFlip API
export async function fetchMemeTemplates() {
  try {
    // Use cached memes if available
    if (cachedMemes) {
      return cachedMemes;
    }
    
    const response = await axios.get(IMGFLIP_API);
    
    if (response.data.success) {
      // Transform the API response to match our template format
      const apiMemes = response.data.data.memes.map(meme => ({
        id: meme.id,
        name: meme.name,
        url: meme.url,
        width: meme.width,
        height: meme.height
      }));
      
      // Cache the fetched memes
      cachedMemes = apiMemes;
      return apiMemes;
    } else {
      console.error('Failed to fetch memes from API');
      return [];
    }
  } catch (error) {
    console.error('Error fetching meme templates:', error);
    return [];
  }
}

// Generate captions using OpenAI's API
export async function generateRoastCaption(template, name, roastLevel = 'medium', roastStyle = 'funny') {
  try {
    // If API key isn't set, use fallback mode
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_API_KEY') {
      return generateFallbackCaption(template, name, roastLevel, roastStyle);
    }
    
    const response = await axios.post(
      OPENAI_API,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a creative and witty caption generator for memes. 
                     Generate a short, funny caption for the "${template}" meme template.
                     The caption should roast a person named "${name}" at a ${roastLevel} intensity level,
                     with a ${roastStyle} style. Keep it under 150 characters and appropriate for general audiences.`
          },
          {
            role: "user",
            content: `Create a ${roastStyle} roast caption for the "${template}" meme about ${name}.`
          }
        ],
        max_tokens: 100,
        temperature: roastLevel === 'savage' ? 0.9 : roastLevel === 'medium' ? 0.7 : 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating caption with API:', error);
    // Fall back to local generation if API fails
    return generateFallbackCaption(template, name, roastLevel, roastStyle);
  }
}

// Alternative caption API - you can swap this with another service
export async function generateCaptionWithHuggingFace(template, name, roastLevel = 'medium', roastStyle = 'funny') {
  try {
    const HUGGINGFACE_API = 'https://api-inference.huggingface.co/models/google/flan-t5-xxl';
    const HF_API_KEY = 'YOUR_HUGGINGFACE_API_KEY'; // Replace with your key
    
    if (!HF_API_KEY || HF_API_KEY === 'YOUR_HUGGINGFACE_API_KEY') {
      return generateFallbackCaption(template, name, roastLevel, roastStyle);
    }
    
    const promptText = `Create a ${roastStyle} ${roastLevel} roast caption for the "${template}" meme about a person named ${name}.`;
    
    const response = await axios.post(
      HUGGINGFACE_API,
      { inputs: promptText },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data[0].generated_text;
  } catch (error) {
    console.error('Error generating caption with HuggingFace:', error);
    return generateFallbackCaption(template, name, roastLevel, roastStyle);
  }
}

// Fallback caption generation when API is not available
function generateFallbackCaption(template, name, roastLevel = 'medium', roastStyle = 'funny') {
  // Templates based on meme and roast parameters
  const templates = {
    mild: {
      funny: [
        `When ${name} thinks they can cook but everyone's just being polite`,
        `${name}'s playlist when they offer to DJ the party`,
        `${name} explaining why they were "only 5 minutes late"`,
        `When ${name} says they're "almost done" with the group project`,
        `${name}'s face when the WiFi drops for 3 seconds`
      ],
      sarcastic: [
        `"I'm great at directions" - ${name}, currently 20 miles off course`,
        `${name}'s definition of "clean room" is truly revolutionary`,
        `${name} saying they'll "be ready in 5 minutes" for the tenth time`,
        `Oh look, ${name} is telling that story again... how fascinating`,
        `${name}'s idea of "meal prep" is ordering takeout for the week`
      ],
      clever: [
        `${name}'s browser history: 'how to look busy while doing nothing at work'`,
        `${name}'s autobiography: "I'll Get To It Tomorrow - A Procrastinator's Tale"`,
        `${name}: Exercise? I thought you said 'extra fries'`,
        `${name}'s dance moves: confusing but delivered with confidence`,
        `${name}'s strategy for adulting: pretend until it somehow works out`
      ]
    },
    medium: {
      funny: [
        `${name} after spending 5 hours on TikTok: "I don't know where the day went"`,
        `${name}'s cooking skills have the smoke detector working overtime`,
        `${name}'s dating profile vs ${name} in real life`,
        `When ${name} says "I'll pick up the tab next time" for the 8th week in a row`,
        `${name} explaining why showing up 40 minutes late is "actually on time"`
      ],
      sarcastic: [
        `${name}'s contribution to the group project was truly... minimal yet confident`,
        `${name} giving fitness advice is like a sloth teaching a sprinting class`,
        `${name}'s playlists have ruined more parties than bad weather`,
        `${name}'s "shortcut" that added 30 minutes to our journey was super helpful`,
        `Yes ${name}, tell us again how you "almost" went pro in high school sports`
      ],
      clever: [
        `${name} doesn't actually use email, they just respond to the notifications`,
        `${name}'s workout routine consists solely of jumping to conclusions`,
        `${name}'s approach to deadlines: panic, procrastinate, pray, repeat`,
        `The food in ${name}'s fridge has started its own civilization`,
        `${name}'s bank account after online shopping: "I'm never gonna financially recover from this"`
      ]
    },
    savage: {
      funny: [
        `${name}'s search history: "how to convince others you're smart without actually studying"`,
        `${name} getting ready to post another gym selfie after doing exactly 3 push-ups`,
        `LinkedIn: Professional ${name}. Instagram: Party ${name}. Reality: Disappointment ${name}.`,
        `${name}'s idea of "meal prep" is deciding which fast food drive-thru to visit each day`,
        `${name}'s room is so messy even Marie Kondo would just burn the whole place down`
      ],
      sarcastic: [
        `${name}'s opinions are like their fashion sense - we all have to endure it, but nobody asked for it`,
        `${name}'s diet plan: take pictures of salads for Instagram, then order pizza`,
        `${name}'s "detailed explanation" contains about as much substance as a hollow chocolate bunny`,
        `${name} treating basic adult responsibilities like they deserve a medal and parade`,
        `Nothing says "I'm insecure" quite like ${name}'s need to mention their one accomplishment from 2015`
      ],
      clever: [
        `If commitment issues were a person, they'd be jealous of ${name}`,
        `${name} has the attention span of a goldfish with ADHD at a laser light show`,
        `${name}'s excuses are like onions - multi-layered and they make everyone cry`,
        `${name}'s résumé contains more fiction than the entire Lord of the Rings series`,
        `Scientists are studying ${name}'s ability to talk for hours without actually saying anything of substance`
      ]
    }
  };
  
  // Select the appropriate template set based on roast level and style
  const templateSet = templates[roastLevel][roastStyle];
  
  // Customize based on meme template
  const memeSpecificTemplates = {
    "Drake Hotline Bling": [
      `${name} avoiding responsibilities | ${name} avoiding responsibilities by making memes about avoiding responsibilities`,
      `${name} when asked to help with chores | ${name} when invited to waste time online`,
      `${name} waking up for work | ${name} staying up until 3AM watching videos`
    ],
    "Distracted Boyfriend": [
      `${name} | Any bad idea ever | Common sense`,
      `${name} | "Just one more episode" | Sleep and responsibilities`,
      `${name} | The "easy way" | Actually doing things properly`
    ],
    "Change My Mind": [
      `${name}'s cooking belongs in a horror movie, change my mind`,
      `${name} couldn't find their way out of a paper bag even with GPS, change my mind`,
      `${name} has more excuses than actual work completed, change my mind`
    ]
  };
  
  // If we have specific templates for this meme, use those sometimes
  if (memeSpecificTemplates[template] && Math.random() > 0.6) {
    const specificOptions = memeSpecificTemplates[template];
    return specificOptions[Math.floor(Math.random() * specificOptions.length)];
  }
  
  // Otherwise use the general templates
  return templateSet[Math.floor(Math.random() * templateSet.length)];
}

// Upload image to a temporary storage service and get shareable URL
// In a real app, you'd use a service like Cloudinary, Imgur, etc.
export async function uploadMemeForSharing(imageBlob) {
  // For real implementation, use a service like Cloudinary, Imgur, etc.
  try {
    // Example with Cloudinary (you would need to add the Cloudinary SDK)
    // const cloudinary = require('cloudinary').v2;
    // cloudinary.config({
    //   cloud_name: 'your_cloud_name',
    //   api_key: 'your_api_key',
    //   api_secret: 'your_api_secret'
    // });
    
    // const result = await new Promise((resolve, reject) => {
    //   const uploadStream = cloudinary.uploader.upload_stream(
    //     { folder: 'meme-creator' },
    //     (error, result) => {
    //       if (error) reject(error);
    //       else resolve(result);
    //     }
    //   );
    //   
    //   // Convert blob to stream and pipe to uploadStream
    //   // This is pseudo-code and would need adapting based on your environment
    //   const reader = imageBlob.stream().getReader();
    //   const pump = async () => {
    //     const { done, value } = await reader.read();
    //     if (done) uploadStream.end();
    //     else {
    //       uploadStream.write(value);
    //       pump();
    //     }
    //   };
    //   pump();
    // });
    //
    // return result.secure_url;
    
    // Mock implementation for now
    return new Promise((resolve) => {
      setTimeout(() => {
        const tempUrl = URL.createObjectURL(imageBlob);
        resolve(tempUrl);
      }, 500);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return URL.createObjectURL(imageBlob); // Fallback to local object URL
  }
}