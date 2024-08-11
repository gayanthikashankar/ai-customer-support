"use client";
import { useState, useEffect } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from "@google/generative-ai";
import ThemeToggleButton from './components/ThemeToggleButton';
import { hardcodedQnA } from './hardcoded.js';

function findAnswer(question) {
    for (const qna of hardcodedQnA) {
        if (qna.question.includes(question.toLowerCase())) {
            return qna.answer;
        }
    }
    return "Sorry, I don't understand the question.";
}

export default function Home() {
  const [messages, setMessages] = useState([]); // array that stores messages exchanged between user and assistant
  const [userInput, setUserInput] = useState(""); // state for user input
  const [chat, setChat] = useState(null); // object that represents the chat session
  const [theme, setTheme] = useState("light"); // state for the theme
  const [error, setError] = useState(null); // stores current error
  const [botMessageCount, setBotMessageCount] = useState(0); // state to track bot messages

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const MODEL_NAME = "gemini-1.0-pro-001";

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY); // instance of google generative AI class

  const generationConfig = {
    temperature: 0.7, //lower value, more deterministic
    topP: 0.9, //conrols nucleus sampling
    topK: 50, //controls top-k sampling
    maxOutputTokens: 2048, //maximum number of tokens to generate
  };
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];


  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genAI
          .getGenerativeModel({ model: MODEL_NAME })
          .startChat({
            generationConfig,
            safetySettings,
            history: messages.map((msg) => ({
              text: msg.text,
              role: msg.role,
            })),
          });
        setChat(newChat);
      } catch (error) {
        setError("Failed to initialize the chat, please try again.");
      }
    };

    initChat();
  }, []);

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      if (chat) {
        console.log("Sending message to chat:", userInput);

        // Check if the user input explicitly asks for the time, date, month, or year
        const timeKeywords = ["time", "current time"];
        const dateKeywords = ["date", "current date", "day", "current day"];
        const monthKeywords = ["month", "current month"];
        const yearKeywords = ["year", "current year"];
        
        const isTimeRequest = timeKeywords.some(keyword =>
          userInput.toLowerCase().includes(keyword)
        );
        const isDateRequest = dateKeywords.some(keyword =>
          userInput.toLowerCase().includes(keyword)
        );
        const isMonthRequest = monthKeywords.some(keyword =>
          userInput.toLowerCase().includes(keyword)
        );
        const isYearRequest = yearKeywords.some(keyword =>
          userInput.toLowerCase().includes(keyword)
        );

        if (isTimeRequest) {
          const currentTime = new Date().toLocaleTimeString();
          const botMessage = {
            text: `The current time is ${currentTime}.`,
            role: "bot",
            timestamp: new Date(),
          };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
          return;
        }

        if (isDateRequest) {
          const currentDate = new Date().toLocaleDateString();
          const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const botMessage = {
            text: `Today is ${currentDay}, ${currentDate}.`,
            role: "bot",
            timestamp: new Date(),
          };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
          return;
        }

        if (isMonthRequest) {
          const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
          const botMessage = {
            text: `The current month is ${currentMonth}.`,
            role: "bot",
            timestamp: new Date(),
          };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
          return;
        }

        if (isYearRequest) {
          const currentYear = new Date().getFullYear();
          const botMessage = {
            text: `The current year is ${currentYear}.`,
            role: "bot",
            timestamp: new Date(),
          };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
          return;
        }

        // Check if the user input matches any hardcoded Q&A
        const hardcodedAnswer = findAnswer(userInput);
        if (hardcodedAnswer !== "Sorry, I don't understand the question.") {
          const botMessage = {
            text: hardcodedAnswer,
            role: "bot",
            timestamp: new Date(),
          };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
          return;
        }

        const result = await chat.sendMessage(userInput);
        console.log("Received response from chat:", result);

        // Post-process the response to ensure conciseness
        let cleanText = result.response.text().replace(/[*]+/g, '').split('. ').slice(0, 2).join('. ');
        cleanText = cleanText.trim(); // Trim any extra spaces
        if (cleanText.endsWith('.')) {
          cleanText = cleanText.slice(0, -1); // Remove the trailing period if it exists
        }

        // Replace "gemini" with "assistly"
        cleanText = cleanText.replace(/gemini/gi, 'assistly');

        // Remove any sentence that includes "google"
        cleanText = cleanText.split('. ').filter(sentence => !sentence.toLowerCase().includes('google')).join('. ');

        const botMessage = {
          text: cleanText,
          role: "bot",
          timestamp: new Date(),
        };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setBotMessageCount((prevCount) => prevCount + 1); // Increment bot message count
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message, please try again.");
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const getThemeColors = () => {
    switch (theme) {
      case "light":
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
        };
      case "dark":
        return {
          primary: "bg-gray-900",
          secondary: "bg-gray-800",
          accent: "bg-blue-500",
          text: "text-gray-100",
        };
      default:
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
        };
    }
  };

  const { primary, secondary, accent, text } = getThemeColors();

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex justify-center items-center h-screen transition duration-500 font-sans ${theme === "dark" ? "dark" : ""}`}>
      <div className={`w-full max-w-lg h-3/4 p-4 rounded-xl shadow-lg overflow-hidden ${primary} transition duration-500`}>
        <div className={`flex flex-col h-full transition duration-500 ${primary}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-2xl font-bold transition duration-500 ${text}`}>
              Assistly.
            </h1>
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </div>
          <div className={`flex-1 overflow-y-auto transition duration-500 ${secondary} rounded-md p-2`}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"} ${msg.role === "user" ? "message-sent" : "message-received"}`}
              >
                <span className={`p-2 rounded-lg leading-loose transition duration-500 ${msg.role === "user" ? `${accent} text-white` : `${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} ${text}`}`}>
                  {msg.text}
                </span> 
                <p className={`text-xs transition duration-500 ${text} mt-2 ml-3`}>
                  {msg.role === "bot" ? "Bot" : "You"} - {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="flex items-center mt-4 px-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 p-2 pl-4 rounded-l-full border focus:outline-none transition duration-500 focus:ring-1 focus:ring-blue-500 bg-blue-100 text-black"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 h-full bg-blue-500 text-white rounded-r-full hover:bg-opacity-80 focus:outline-none transition duration-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}