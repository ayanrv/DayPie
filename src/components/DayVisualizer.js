import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import html2canvas from "html2canvas";

ChartJS.register(ArcElement, Tooltip, Legend);

// Дефолтные базовые категории (нельзя удалить)
const defaultBaseCategories = [
  { id: 1, name: "Учёба", hours: 0 },
  { id: 2, name: "Работа", hours: 0 },
  { id: 3, name: "Отдых", hours: 0 },
  { id: 4, name: "Спорт", hours: 0 },
  { id: 5, name: "Сон", hours: 0 },
];

const DayVisualizer = ({ darkMode }) => {
  const getStoredBaseCategories = () => {
    const savedData = localStorage.getItem("daypie_base_categories");
    return savedData ? JSON.parse(savedData) : defaultBaseCategories;
  };

  const getStoredUserCategories = () => {
    const savedData = localStorage.getItem("daypie_user_categories");
    return savedData ? JSON.parse(savedData) : [];
  };

  const [baseCategories, setBaseCategories] = useState(getStoredBaseCategories);
  const [userCategories, setUserCategories] = useState(getStoredUserCategories);

  useEffect(() => {
    localStorage.setItem("daypie_base_categories", JSON.stringify(baseCategories));
  }, [baseCategories]);

  useEffect(() => {
    localStorage.setItem("daypie_user_categories", JSON.stringify(userCategories));
  }, [userCategories]);

  const handleInputChange = (id, type, value, isBaseCategory) => {
    let numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue < 0) return;
    if (type === "minutes" && numericValue >= 60) {
      alert("Минуты не могут быть больше 59.");
      return;
    }

    const updateCategory = (categoryList, setCategoryList) => {
      const updatedCategories = categoryList.map(category => {
        if (category.id === id) {
          const hours = type === "hours" ? numericValue : Math.floor(category.hours);
          const minutes = type === "minutes" ? numericValue : Math.round((category.hours - Math.floor(category.hours)) * 60);
          return { ...category, hours: hours + minutes / 60 };
        }
        return category;
      });
      setCategoryList(updatedCategories);
    };

    if (isBaseCategory) {
      updateCategory(baseCategories, setBaseCategories);
    } else {
      updateCategory(userCategories, setUserCategories);
    }
  };

  const addCategory = () => {
    const newName = prompt("Введите название новой категории:");
    if (!newName) return;

    const newCategory = {
      id: Date.now(),
      name: newName,
      hours: 0,
    };

    setUserCategories([...userCategories, newCategory]);
  };

  const deleteCategory = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить эту категорию?")) {
      setUserCategories(userCategories.filter(category => category.id !== id));
    }
  };

  const resetCategories = () => {
    if (window.confirm("Вы уверены, что хотите сбросить данные?")) {
      setBaseCategories(defaultBaseCategories);
      setUserCategories([]);
      localStorage.setItem("daypie_base_categories", JSON.stringify(defaultBaseCategories));
      localStorage.setItem("daypie_user_categories", JSON.stringify([]));
    }
  };

  const remainingTime = (24 - [...baseCategories, ...userCategories].reduce((sum, activity) => sum + activity.hours, 0)).toFixed(2);

  const chartData = {
    labels: [...baseCategories, ...userCategories].map((a) => a.name),
    datasets: [
      {
        data: [...baseCategories, ...userCategories].map((a) => parseFloat(a.hours.toFixed(2))),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#F77737", "#C71585"],
        borderColor: darkMode ? "#ffffff" : "#000000", // 🌟 Белые границы в темной теме, черные в светлой
        borderWidth: 1
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "left", // 📌 Легенда теперь слева от графика
        labels: {
          color: darkMode ? "#ffffff" : "#000000",
          font: {
            size: 14,
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className={`flex flex-col items-center p-4 min-h-screen transition-all duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-black"}`}>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">📊 День в цифрах</h1>
  
      {/* Остаток времени */}
      <p className={`text-lg font-semibold mb-6 ${remainingTime < 0 ? "text-red-500" : "text-green-500"}`}>
        Осталось времени: {remainingTime < 0 ? "Ошибка! Превышение лимита" : `${remainingTime} ч`}
      </p>
  
      {/* Основной контейнер (две колонки) */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto px-6">
        
        {/* Левая колонка с категориями */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...baseCategories, ...userCategories].map((activity) => (
            <div key={activity.id} className={`p-6 rounded-lg shadow-md flex flex-col items-center justify-center 
              ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}>
              <label className="text-lg font-medium">{activity.name}</label>
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  type="number"
                  value={Math.floor(activity.hours)}
                  onChange={(e) => handleInputChange(activity.id, "hours", e.target.value, baseCategories.includes(activity))}
                  className={`border p-2 w-16 text-center rounded-md transition-all ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
                  min="0"
                />
                <span>ч</span>
                <input
                  type="number"
                  value={Math.round((activity.hours - Math.floor(activity.hours)) * 60)}
                  onChange={(e) => handleInputChange(activity.id, "minutes", e.target.value, baseCategories.includes(activity))}
                  className={`border p-2 w-16 text-center rounded-md transition-all ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
                  min="0"
                  max="59"
                />
                <span>м</span>
              </div>
              {!baseCategories.includes(activity) && (
                <button onClick={() => deleteCategory(activity.id)} className="text-red-500 mt-2">❌ Удалить</button>
              )}
            </div>
          ))}
        </div>
  
       {/* Правая колонка с графиком (адаптируется к новому контенту) */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] lg:min-h-[600px] w-full sm:w-auto">
            <div className={`w-full p-6 rounded-lg shadow-lg transition-all overflow-auto 
                ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}>
                <Pie data={chartData} options={chartOptions} />
            </div>
        </div>

      </div>
  
      {/* 🔘 Кнопки теперь под контентом */}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        <button onClick={addCategory} className="bg-blue-500 text-white px-4 md:px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition flex items-center gap-2">
          ➕ Добавить
        </button>
        <button onClick={resetCategories} className="bg-red-500 text-white px-4 md:px-6 py-2 rounded-lg shadow-md hover:bg-red-600 transition flex items-center gap-2">
          🔄 Сбросить
        </button>
      </div>
    </div>
  );
  
};

export default DayVisualizer;
