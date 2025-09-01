// getWeatherFlorianopolis.js
// Funciona em browser ou Node 18+ (fetch nativo)
export default getWeatherFlorianopolis;


async function getWeatherFlorianopolis({
  accessKey = "4fe555082902ea92dc943bd2d1694746",
  retries = 3,
  backoffMs = 1000,
  days = 7,
  language = "pt",
  units = "m", // m = Celsius
} = {}) {
  const city = "Florianópolis, SC";
  const base = "https://api.weatherstack.com/forecast";
  const url = `${base}?access_key=${encodeURIComponent(accessKey)}&query=${encodeURIComponent(city)}&forecast_days=${days}&language=${encodeURIComponent(language)}&units=${encodeURIComponent(units)}`;

  let attempt = 0;

  while (true) {
    try {
      const res = await fetch(url);
      const body = await res.json().catch(() => ({}));

      // Weatherstack às vezes responde 200 com { success:false, error:{...} }
      const apiHasError = body && body.success === false && body.error;

      if (!res.ok || apiHasError) {
        const status = res.status || 400;

        // 429: aplicar backoff e tentar de novo (se ainda houver retries)
        if (status === 429 && attempt < retries) {
          const wait = backoffMs * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, wait));
          attempt++;
          continue;
        }

        // Para 400 (ou quaisquer outros), retornar erro detalhado
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
      const { location, current, forecast } = body || {};
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
        forecast: forecast || null,
        description
      };

    } catch (err) {
      // Network/timeout/etc.: aplicar retry, senão retornar erro
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

// Exemplo de uso:
//getWeatherFlorianopolis().then(console.log).catch(console.error);
