// components/Calendar.jsx
import { useState, useEffect } from "react";
import "./Calendar.css";

export default function Calendar({ 
  selectedDate, 
  onDateSelect, 
  onWeekSelect, 
  forecastData,
  viewMode,
  onViewModeChange 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentMonth(currentDate.getMonth());
    setCurrentYear(currentDate.getFullYear());
  }, [currentDate]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    onDateSelect(new Date().toISOString().split('T')[0]);
  };

  const hasForecastData = (date) => {
    return forecastData && forecastData.some(day => day.date === date);
  };

  const getDayForecast = (date) => {
    return forecastData && forecastData.find(day => day.date === date);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Dias vazios no início do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasData = forecastData && forecastData.length > 0 && hasForecastData(dateStr);
      const dayForecast = hasData ? getDayForecast(dateStr) : null;
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={dateStr}
          className={`calendar-day ${hasData ? 'has-data' : 'no-data'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => hasData && onDateSelect(dateStr)}
          title={hasData ? `${dayForecast.condition}, ${dayForecast.max_temp}°C / ${dayForecast.min_temp}°C` : 'Sem previsão'}
        >
          <span className="day-number">{day}</span>
          {hasData && (
            <div className="day-weather-preview">
              <img src={dayForecast.icon} alt={dayForecast.condition} />
              <span>{dayForecast.max_temp}°</span>
            </div>
          )}
          {isToday && <div className="today-indicator">Hoje</div>}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Jullio", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={handlePrevMonth}>&lt;</button>
          <h3>{monthNames[currentMonth]} {currentYear}</h3>
          <button onClick={handleNextMonth}>&gt;</button>
        </div>
        <button onClick={handleToday} className="today-btn">Hoje</button>
      </div>

      <div className="view-mode-selector">
        <button 
          className={viewMode === 'single' ? 'active' : ''} 
          onClick={() => onViewModeChange('single')}
        >
          Dia
        </button>
        <button 
          className={viewMode === 'week' ? 'active' : ''} 
          onClick={() => onWeekSelect()}
        >
          Semana
        </button>
      </div>

      <div className="week-days">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="week-day">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>
    </div>
  );
}