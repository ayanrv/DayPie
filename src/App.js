import React, { useState, useEffect } from "react";
import DayVisualizer from "./components/DayVisualizer";

function App() {
  // Читаем тему из localStorage, если она была установлена ранее
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("daypie_dark_mode") === "true";
  });

  // При изменении darkMode сохраняем его в localStorage
  useEffect(() => {
    localStorage.setItem("daypie_dark_mode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className={`App min-h-screen transition-all duration-300 ${darkMode ? "dark bg-gray-900 text-gray-200" : "bg-white text-black"}`}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-md transition 
        ${darkMode ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-gray-200 text-gray-900 hover:bg-gray-300"}`}
      >
        {darkMode ? "☀️ Светлая тема" : "🌙 Тёмная тема"}
      </button>

      {/* Передаём darkMode и toggleDarkMode в DayVisualizer */}
      <DayVisualizer darkMode={darkMode} />
    </div>
  );
}

export default App;
