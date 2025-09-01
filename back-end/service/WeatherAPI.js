// back-end/service/WeatherAPI.js
const WMO = {
  0:"Céu limpo",1:"Predomínio de sol",2:"Parcialmente nublado",3:"Nublado",
  45:"Nevoeiro",48:"Nevoeiro com gelo",51:"Garoa fraca",53:"Garoa moderada",
  55:"Garoa intensa",61:"Chuva fraca",63:"Chuva moderada",65:"Chuva forte",
  66:"Chuva congelante fraca",67:"Chuva congelante forte",71:"Neve fraca",
  73:"Neve moderada",75:"Neve forte",77:"Grãos de neve",80:"Aguaceiros fracos",
  81:"Aguaceiros moderados",82:"Aguaceiros fortes",85:"Aguaceiros de neve fracos",
  86:"Aguaceiros de neve fortes",95:"Trovoadas",96:"Trovoadas com granizo fraco",
  99:"Trovoadas com granizo forte",
};
const desc = (code)=> WMO[code] || "Condição desconhecida";

export default async function getWeatherFlorianopolis() {
  const lat = -27.5949, lon = -48.5482;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { error:true, message:`HTTP ${res.status} ao consultar Open-Meteo` };
    const b = await res.json();

    const cur = b.current || {};
    const d = desc(cur.weather_code);

    const forecast = {};
    const dates = b.daily?.time || [];
    const tmax = b.daily?.temperature_2m_max || [];
    const tmin = b.daily?.temperature_2m_min || [];
    const wcode = b.daily?.weather_code || [];
    dates.forEach((dt,i)=> forecast[dt] = {
      maxtemp: tmax[i], mintemp: tmin[i], weather_code: wcode[i], description: desc(wcode[i])
    });

    return {
      location: { name:"Florianópolis", region:"SC", country:"Brasil", timezone_id:b.timezone },
      current: {
        temperature: cur.temperature_2m,
        feelslike: null,
        humidity: cur.relative_humidity_2m,
        wind_speed: cur.wind_speed_10m,
        weather_descriptions: [d],
        icon: null,
        observation_time: cur.time,
      },
      forecast,
      description: d,
    };
  } catch (e) {
    return { error:true, message:`Erro de rede: ${e.message}` };
  }
}
