// back-end/service/WeatherAPI.js
// Open-Meteo: HTTPS, sem chave e com forecast diário

const WMO_MAP = {
  0: "Céu limpo",
  1: "Predomínio de sol",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Nevoeiro",
  48: "Nevoeiro com gelo",
  51: "Garoa fraca",
  53: "Garoa moderada",
  55: "Garoa intensa",
  61: "Chuva fraca",
  63: "Chuva moderada",
  65: "Chuva forte",
  66: "Chuva congelante fraca",
  67: "Chuva congelante forte",
  71: "Neve fraca",
  73: "Neve moderada",
  75: "Neve forte",
  77: "Grãos de neve",
  80: "Aguaceiros fracos",
  81: "Aguaceiros moderados",
  82: "Aguaceiros fortes",
  85: "Aguaceiros de neve fracos",
  86: "Aguaceiros de neve fortes",
  95: "Trovoadas",
  96: "Trovoadas com granizo fraco",
  99: "Trovoadas com granizo forte",
};

function wmoToDescription(code) {
  return WMO_MAP[code] || "Condição desconhecida";
}

/**
 * Busca clima atual e previsão diária para Florianópolis (7 dias)
 * Retorno no mesmo formato "normalizado" que seu App.jsx espera.
 */
export default async function getWeatherFlorianopolis() {
  // Florianópolis
  const latitude = -27.5949;
  const longitude = -48.5482;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { error: true, message: `HTTP ${res.status} ao consultar Open-Meteo`, details: null };
    }
    const body = await res.json();

    // --- Current ---
    const current = body.current || {};
    const description = wmoToDescription(current.weather_code);

    // --- Daily forecast -> objeto { 'YYYY-MM-DD': { maxtemp, mintemp, weather_code, description } }
    const forecast = {};
    const dates = body.daily?.time || [];
    const tmax = body.daily?.temperature_2m_max || [];
    const tmin = body.daily?.temperature_2m_min || [];
    const wcode = body.daily?.weather_code || [];

    dates.forEach((date, i) => {
      forecast[date] = {
        maxtemp: tmax[i],
        mintemp: tmin[i],
        weather_code: wcode[i],
        description: wmoToDescription(wcode[i]),
      };
    });

    return {
      location: {
        name: "Florianópolis",
        region: "SC",
        country: "Brasil",
        timezone_id: body.timezone,
      },
      current: {
        temperature: current.temperature_2m,
        feelslike: null, // Open-Meteo não retorna "sensação" diretamente
        humidity: current.relative_humidity_2m,
        wind_speed: current.wind_speed_10m,
        weather_descriptions: [description],
        icon: null, // sem ícones nativos; se quiser, mapeamos depois
        observation_time: current.time,
      },
      forecast,
      description,
    };
  } catch (err) {
    return { error: true, message: `Erro de rede: ${err.message}`, details: null };
  }
}
