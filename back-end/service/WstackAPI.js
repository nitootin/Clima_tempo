// back-end/service/WstackAPI.js
// Funciona em browser ou Node 18+ (fetch nativo)

async function getWeatherFlorianopolis({
  accessKey = "4fe555082902ea92dc943bd2d1694746",
  retries = 3,
  backoffMs = 1000,
} = {}) {
  const city = "Florianópolis, SC";
  const base = "http://api.weatherstack.com/current"; // FREE só aceita /current
  const url = `${base}?access_key=${encodeURIComponent(accessKey)}&query=${encodeURIComponent(city)}`;

  let attempt = 0;

  while (true) {
    try {
      const res = await fetch(url);
      const body = await res.json().catch(() => ({}));

      // Weatherstack às vezes responde 200 com { success:false, error:{...} }
      const apiHasError = body && body.success === false && body.error;

      if (!res.ok || apiHasError) {
        const status = res.status || 400;

        // Retry em caso de 429
        if (status === 429 && attempt < retries) {
          const wait = backoffMs * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, wait));
          attempt++;
          continue;
        }

        const apiMessage = apiHasError
          ? `${body.error.code || ""} ${body.error.type || ""} - ${body.error.info || ""}`.trim()
          : `HTTP ${status}`;

        return {
          error: true,
          message: `Falha na chamada Weatherstack: ${apiMessage}`,
          details: { status, response: body }
        };
      }

      // Monta o retorno normalizado
      const { location, current } = body || {};
      const description =
        (current && Array.isArray(current.weather_descriptions) && current.weather_descriptions[0]) ||
        (current && current.weather_description) ||
        null;

      return {
        location,
        current: current
          ? {
              temperature: current.temperature,
              feelslike: current.feelslike,
              humidity: current.humidity,
              wind_speed: current.wind_speed,
              weather_descriptions: current.weather_descriptions,
              icon: Array.isArray(current.weather_icons) ? current.weather_icons[0] : null,
              observation_time: current.observation_time
            }
          : null,
        forecast: null, // sem forecast no plano free
        description
      };

    } catch (err) {
      if (attempt < retries) {
        const wait = backoffMs * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, wait));
        attempt++;
        continue;
      }
      return {
        error: true,
        message: `Erro de rede ao consultar Weatherstack: ${err.message}`,
        details: null
      };
    }
  }
}

export default getWeatherFlorianopolis;
