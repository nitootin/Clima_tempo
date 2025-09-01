// src/App.jsx
import { useEffect, useMemo, useState } from "react";
// caminho a partir de src/App.jsx
import getWeatherFlorianopolis from "../back-end/service/WstackAPI.js";

export default function App() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus({ loading: true, error: null });
      const res = await getWeatherFlorianopolis({
        // ajuste se quiser mudar idioma/unidades/dias
        language: "pt",
        units: "m",
        days: 7,
      });

      if (cancelled) return;

      if (res?.error) {
        setStatus({ loading: false, error: res.message || "Erro ao carregar" });
        setData(null);
      } else {
        setData(res);
        setStatus({ loading: false, error: null });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const forecastArray = useMemo(() => {
    if (!data?.forecast) return [];
    // Weatherstack devolve objeto com chaves YYYY-MM-DD
    return Object.entries(data.forecast)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [data]);

  if (status.loading) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>Carregando clima…</div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div style={styles.wrap}>
        <div style={{ ...styles.card, ...styles.error }}>
          <h3>Ops!</h3>
          <p>{status.error}</p>
          {data?.details?.response?.error?.info && (
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              {data.details.response.error.info}
            </p>
          )}
        </div>
      </div>
    );
  }

  const { location, current, description } = data || {};
  const cityTitle =
    location?.name && location?.region
      ? `${location.name} — ${location.region}`
      : "Florianópolis, SC";

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>Clima Agora</h1>
        <div style={{ opacity: 0.8 }}>{cityTitle}</div>
      </div>

      {/* Bloco clima atual */}
      <div style={{ ...styles.card, display: "flex", gap: 16, alignItems: "center" }}>
        {current?.icon && (
          <img
            src={current.icon}
            alt={description || "Condição do tempo"}
            width={64}
            height={64}
            style={{ flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={styles.tempRow}>
            <span style={styles.temp}>{current?.temperature ?? "--"}°C</span>
            <span style={styles.desc}>{description || "-"}</span>
          </div>
          <div style={styles.meta}>
            Sensação: <strong>{current?.feelslike ?? "--"}°C</strong> ·
            Umidade: <strong>{current?.humidity ?? "--"}%</strong> ·
            Vento: <strong>{current?.wind_speed ?? "--"} km/h</strong>
          </div>
          {current?.observation_time && (
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Atualizado às {current.observation_time} (hora local da estação)
            </div>
          )}
        </div>
      </div>

      {/* Previsão */}
      <h2 style={{ marginTop: 24, marginBottom: 8 }}>Previsão • Próximos dias</h2>
      <div style={styles.grid}>
        {forecastArray.map((d) => (
          <div key={d.date} style={styles.card}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {formatDatePt(d.date)}
            </div>
            <div>Máx: <strong>{d.maxtemp ?? d.max_temp ?? "--"}°C</strong></div>
            <div>Mín: <strong>{d.mintemp ?? d.min_temp ?? "--"}°C</strong></div>
            {d.avgtemp && (
              <div>Média: <strong>{d.avgtemp}°C</strong></div>
            )}
            {d.hourly && Array.isArray(d.hourly) && d.hourly[0]?.weather_descriptions && (
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                {Array.isArray(d.hourly[0].weather_descriptions)
                  ? d.hourly[0].weather_descriptions[0]
                  : d.hourly[0].weather_descriptions}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= helpers & estilos inline simples ================= */

function formatDatePt(isoDate) {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

const styles = {
  wrap: {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    padding: 20,
    maxWidth: 960,
    margin: "0 auto",
    color: "#0f172a",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    marginBottom: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,.08)",
  },
  error: {
    border: "1px solid #ef4444",
    color: "#991b1b",
    background: "#fee2e2",
  },
  tempRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
  },
  temp: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1,
  },
  desc: {
    fontSize: 16,
    opacity: 0.85,
    textTransform: "capitalize",
  },
  meta: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.9,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
};
