// WeatherCard.jsx - Corrigido
import { useState, useEffect } from "react";
import { getWeatherByCity } from "../service/WeatherService.js";
import Calendar from "./Calendar.jsx";
import "./WeatherCard.css";

export default function WeatherCard() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState("single");
  const [filteredForecast, setFilteredForecast] = useState([]);

  useEffect(() => {
    setCity("Florianópolis");
    fetchWeather("Florianópolis");
  }, []);

  useEffect(() => {
    if (weather && weather.forecast) {
      filterForecastData();
    }
  }, [selectedDate, viewMode, weather]);

  const fetchWeather = async (cityName = city) => {
    if (!cityName) return;
    setLoading(true);
    setError("");
    try {
      const data = await getWeatherByCity(cityName, 14);
      setWeather(data);
      
      // Definir data selecionada como hoje se não estiver definida
      const today = new Date().toISOString().split('T')[0];
      if (!selectedDate) {
        setSelectedDate(today);
      }
    } catch (err) {
      console.error("Erro:", err);
      setWeather(null);
      setError("❌ Não foi possível buscar o clima. Verifique o nome da cidade.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setViewMode("single");
  };

  const handleWeekSelect = () => {
    setViewMode("week");
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const filterForecastData = () => {
    if (!weather || !weather.forecast || weather.forecast.length === 0) {
      setFilteredForecast([]);
      return;
    }

    if (viewMode === "single") {
      // Encontrar previsão para a data selecionada ou a mais próxima
      let dailyForecast = weather.forecast.find(day => day.date === selectedDate);
      
      // Se não encontrar exato, usar o primeiro disponível
      if (!dailyForecast) {
        dailyForecast = weather.forecast[0];
        setSelectedDate(weather.forecast[0].date);
      }
      
      setFilteredForecast(dailyForecast ? [dailyForecast] : []);
    } else if (viewMode === "week") {
      // Mostrar toda a previsão disponível (máximo 7 dias)
      const weekForecast = weather.forecast.slice(0, 7);
      setFilteredForecast(weekForecast);
    }
  };

  const getDayName = (dateString, index) => {
    if (index === 0 && dateString === new Date().toISOString().split('T')[0]) return "Hoje";
    
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="weather-app">
      <div className="weather-card">
        <h2 className="title">🌤️ Previsão do Tempo</h2>

        <div className="search-box">
          <input
            type="text"
            placeholder="Digite a cidade..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
          />
          <button onClick={() => fetchWeather()} disabled={loading}>
            {loading ? "⏳" : "🔍"}
          </button>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Buscando dados meteorológicos...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {weather && (
          <>
            <div className="location-header">
              <h3>
                {weather.city}, {weather.country}
              </h3>
              <p className="update-time">
                Atualizado: {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Calendar sempre visível quando há dados */}
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onWeekSelect={handleWeekSelect}
              forecastData={weather.forecast || []}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />

            {filteredForecast.length === 0 ? (
              <div className="no-forecast-message">
                <p>Nenhuma previsão disponível para a seleção atual.</p>
              </div>
            ) : viewMode === "single" ? (
              // Visualização de dia único
              <div className="weather-display">
                <div className="current-weather">
                  <div className="weather-icon">
                    <img src={filteredForecast[0].icon} alt={filteredForecast[0].condition} />
                  </div>
                  <div className="temperature-main">
                    {filteredForecast[0].avg_temp}°C
                  </div>
                  <div className="weather-condition">
                    {filteredForecast[0].condition}
                  </div>
                  <div className="selected-date">
                    {formatDate(selectedDate)}
                  </div>
                  <div className="weather-details">
                    <div className="detail-item">
                      <span>🌡️ Máxima</span>
                      <span>{filteredForecast[0].max_temp}°C</span>
                    </div>
                    <div className="detail-item">
                      <span>🌡️ Mínima</span>
                      <span>{filteredForecast[0].min_temp}°C</span>
                    </div>
                    <div className="detail-item">
                      <span>💧 Umidade</span>
                      <span>{filteredForecast[0].humidity}%</span>
                    </div>
                    <div className="detail-item">
                      <span>💨 Vento</span>
                      <span>{filteredForecast[0].wind_speed} km/h</span>
                    </div>
                    {filteredForecast[0].sunrise && (
                      <div className="detail-item">
                        <span>🌅 Nascer do sol</span>
                        <span>{filteredForecast[0].sunrise}</span>
                      </div>
                    )}
                    {filteredForecast[0].sunset && (
                      <div className="detail-item">
                        <span>🌇 Pôr do sol</span>
                        <span>{filteredForecast[0].sunset}</span>
                      </div>
                    )}
                    {filteredForecast[0].uv_index !== undefined && (
                      <div className="detail-item">
                        <span>☀️ Índice UV</span>
                        <span>{filteredForecast[0].uv_index}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Visualização de semana
              <div className="weekly-forecast">
                <h4>Previsão para a semana</h4>
                <div className="forecast-grid">
                  {filteredForecast.map((day, index) => (
                    <div key={day.date} className="forecast-item">
                      <div className="forecast-day">{getDayName(day.date, index)}</div>
                      <div className="forecast-date">{formatDate(day.date)}</div>
                      <img src={day.icon} alt={day.condition} />
                      <div className="forecast-temps">
                        <span className="temp-max">{day.max_temp}°</span>
                        <span className="temp-min">{day.min_temp}°</span>
                      </div>
                      <div className="forecast-desc">{day.condition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}