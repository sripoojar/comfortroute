// ============================================================
// ComfortRoute.jsx — Full App v2
// API keys live in Vercel environment variables only
// Anthropic calls go through /api/rationale (serverless proxy)
// ============================================================

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const IS_DEMO = !GOOGLE_API_KEY || GOOGLE_API_KEY === "PASTE_YOUR_GOOGLE_API_KEY_HERE";

import { useState, useEffect, useCallback } from "react";

// ─── STYLES ──────────────────────────────────────────────────
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0f1e;
    --surface: #111827;
    --surface2: #1a2235;
    --border: rgba(255,255,255,0.08);
    --accent: #6ee7b7;
    --accent2: #38bdf8;
    --warn: #fbbf24;
    --text: #f1f5f9;
    --muted: #64748b;
    --card-hover: #1e2d45;
    --radius: 16px;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root { min-height: 100vh; }

  .app {
    max-width: 480px;
    margin: 0 auto;
    padding: 24px 16px 80px;
    min-height: 100vh;
    position: relative;
  }

  .app::before {
    content: '';
    position: fixed;
    top: -40%; left: -20%;
    width: 140%; height: 80%;
    background: radial-gradient(ellipse at 30% 40%, rgba(110,231,183,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(56,189,248,0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .content { position: relative; z-index: 1; }

  .header { margin-bottom: 28px; }

  .logo {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .logo-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent);
    display: inline-block;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }

  .tagline { font-size: 13px; color: var(--muted); }

  .context-strip {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    min-height: 32px;
  }

  .context-label { font-size: 13px; color: var(--muted); flex-shrink: 0; }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 11px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    white-space: nowrap;
  }

  .pill.active {
    background: rgba(110,231,183,0.1);
    border-color: rgba(110,231,183,0.3);
    color: var(--accent);
  }

  .location-status {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .location-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--muted);
    flex-shrink: 0;
  }

  .location-dot.live { background: var(--accent); animation: pulse-dot 2s ease-in-out infinite; }
  .location-dot.denied { background: #f87171; }

  .demo-banner {
    background: rgba(56,189,248,0.08);
    border: 1px solid rgba(56,189,248,0.2);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12px;
    color: var(--accent2);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .search-wrap {
    position: relative;
    margin-bottom: 20px;
  }

  .search-input {
    width: 100%;
    padding: 14px 48px 14px 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input::placeholder { color: var(--muted); }
  .search-input:focus { border-color: rgba(110,231,183,0.4); }

  .search-btn {
    position: absolute;
    right: 8px; top: 50%;
    transform: translateY(-50%);
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--accent);
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    color: #0a0f1e;
    font-weight: 700;
    transition: opacity 0.2s, transform 0.15s;
  }

  .search-btn:hover { opacity: 0.85; transform: translateY(-50%) scale(1.05); }
  .search-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: translateY(-50%); }

  .cards-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 12px;
  }

  .cards-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .route-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 18px 16px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.35s ease both;
  }

  .route-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .route-card:hover { background: var(--card-hover); transform: translateY(-1px); }
  .route-card:hover::before { opacity: 1; }

  .route-card.recommended {
    border-color: rgba(110,231,183,0.25);
    background: rgba(110,231,183,0.04);
  }
  .route-card.recommended::before { opacity: 1; }

  .route-card:nth-child(1) { animation-delay: 0.05s; }
  .route-card:nth-child(2) { animation-delay: 0.12s; }
  .route-card:nth-child(3) { animation-delay: 0.19s; }
  .route-card:nth-child(4) { animation-delay: 0.26s; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .card-label {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    flex: 1;
    padding-right: 12px;
  }

  .card-badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 100px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .badge-recommended { background: rgba(110,231,183,0.15); color: var(--accent); }
  .badge-alt { background: rgba(56,189,248,0.12); color: var(--accent2); }
  .badge-resilient { background: rgba(167,139,250,0.12); color: #a78bfa; }
  .badge-budget { background: rgba(251,191,36,0.12); color: var(--warn); }

  .card-rationale {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: 12px;
    font-style: italic;
  }

  .rationale-loading {
    height: 12px;
    width: 75%;
    background: var(--surface2);
    border-radius: 6px;
    animation: shimmer 1.5s ease-in-out infinite;
    margin-bottom: 12px;
  }

  @keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .card-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .meta-chip {
    font-size: 12px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .skeleton-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    animation: shimmer 1.6s ease-in-out infinite;
  }

  .skel-line {
    height: 12px;
    background: var(--surface2);
    border-radius: 6px;
    margin-bottom: 10px;
  }

  .skel-line.short { width: 40%; }
  .skel-line.med { width: 65%; }
  .skel-line.full { width: 100%; }

  .state-box {
    text-align: center;
    padding: 48px 24px;
    color: var(--muted);
  }

  .state-icon { font-size: 36px; margin-bottom: 12px; }
  .state-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .state-sub { font-size: 13px; line-height: 1.6; }

  .error-box {
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: var(--radius);
    padding: 14px 16px;
    font-size: 13px;
    color: #f87171;
    margin-bottom: 16px;
  }
`;

// ─── INFERENCE ENGINE ─────────────────────────────────────────
function inferContext(weather = null, nearGrocery = false) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  let walkPenalty = 1.0;
  let contextLabel = "standard";
  let contextEmoji = "🧭";
  let pills = [];

  if (!isWeekend && hour >= 6 && hour < 9) {
    walkPenalty *= 3.0; contextLabel = "low-energy"; contextEmoji = "😴";
    pills.push({ label: "Morning commute", active: true });
  } else if (!isWeekend && hour >= 16 && hour < 19) {
    walkPenalty *= 2.5; contextLabel = "low-energy"; contextEmoji = "😮‍💨";
    pills.push({ label: "Evening rush", active: true });
  } else if (hour >= 22 || hour < 5) {
    walkPenalty *= 4.0; contextLabel = "low-energy"; contextEmoji = "🌙";
    pills.push({ label: "Late night", active: true });
  } else if (isWeekend && hour >= 11 && hour < 18) {
    walkPenalty *= 0.9; contextLabel = "leisure"; contextEmoji = "☀️";
    pills.push({ label: "Weekend afternoon", active: true });
  } else {
    pills.push({ label: isWeekend ? "Weekend" : "Midday", active: false });
  }

  if (weather?.rain) {
    walkPenalty *= 1.6;
    pills.push({ label: "Raining", active: true, icon: "🌧️" });
  } else if (weather?.snow) {
    walkPenalty *= 1.8;
    pills.push({ label: "Snowing", active: true, icon: "❄️" });
  } else if (weather?.description) {
    pills.push({ label: weather.description, active: false, icon: "🌤️" });
  }

  if (nearGrocery) {
    walkPenalty *= 1.6; contextLabel = "load-carrier";
    pills.push({ label: "Near grocery", active: true, icon: "🛒" });
  }

  const confidence = Math.min(95, 60 + Math.round(Math.abs(walkPenalty - 1) * 15));
  return { walkPenalty, contextLabel, contextEmoji, pills, confidence };
}

// ─── CARD LABEL SETS ─────────────────────────────────────────
function getCardLabels(contextLabel) {
  const sets = {
    "low-energy": [
      { slot: "recommended", label: "Get me there easy", badge: "recommended", badgeClass: "badge-recommended" },
      { slot: "alt", label: "If I'm running late", badge: "faster", badgeClass: "badge-alt" },
      { slot: "resilient", label: "If my train doesn't come", badge: "resilient", badgeClass: "badge-resilient" },
      { slot: "budget", label: "Cheapest fare today", badge: "budget", badgeClass: "badge-budget" },
    ],
    "load-carrier": [
      { slot: "recommended", label: "Easiest on my body", badge: "recommended", badgeClass: "badge-recommended" },
      { slot: "alt", label: "No stairs, still fast", badge: "step-free", badgeClass: "badge-alt" },
      { slot: "resilient", label: "Step-free guaranteed", badge: "resilient", badgeClass: "badge-resilient" },
      { slot: "budget", label: "Is a cab worth it?", badge: "budget", badgeClass: "badge-budget" },
    ],
    "anxiety": [
      { slot: "recommended", label: "Hardest to mess up", badge: "recommended", badgeClass: "badge-recommended" },
      { slot: "alt", label: "Most options if late", badge: "options", badgeClass: "badge-alt" },
      { slot: "resilient", label: "One train, no transfers", badge: "simple", badgeClass: "badge-resilient" },
      { slot: "budget", label: "If something goes wrong", badge: "fallback", badgeClass: "badge-budget" },
    ],
    "leisure": [
      { slot: "recommended", label: "Scenic and easy", badge: "recommended", badgeClass: "badge-recommended" },
      { slot: "alt", label: "Still want it fast", badge: "faster", badgeClass: "badge-alt" },
      { slot: "resilient", label: "Walk more, ride less", badge: "active", badgeClass: "badge-resilient" },
      { slot: "budget", label: "Cheapest option", badge: "budget", badgeClass: "badge-budget" },
    ],
    "standard": [
      { slot: "recommended", label: "Best overall route", badge: "recommended", badgeClass: "badge-recommended" },
      { slot: "alt", label: "Faster, more walking", badge: "faster", badgeClass: "badge-alt" },
      { slot: "resilient", label: "Fewest transfers", badge: "resilient", badgeClass: "badge-resilient" },
      { slot: "budget", label: "Cheapest option", badge: "budget", badgeClass: "badge-budget" },
    ],
  };
  return sets[contextLabel] || sets["standard"];
}

// ─── MOCK DATA ────────────────────────────────────────────────
function getMockRoutes() {
  return [
    { duration: 28, transfers: 1, walkMin: 4, fare: 2.90, lines: ["A", "C"] },
    { duration: 22, transfers: 2, walkMin: 9, fare: 2.90, lines: ["1", "2"] },
    { duration: 35, transfers: 0, walkMin: 3, fare: 2.90, lines: ["E"] },
    { duration: 31, transfers: 1, walkMin: 6, fare: 2.90, lines: ["M15 SBS"] },
  ];
}

// ─── GEOLOCATION ─────────────────────────────────────────────
function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 40.7549, lng: -73.984, source: "default" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: "live" }),
      () => resolve({ lat: 40.7549, lng: -73.984, source: "denied" }),
      { timeout: 6000, enableHighAccuracy: false }
    );
  });
}

// ─── WEATHER API ──────────────────────────────────────────────
async function fetchWeather(lat, lng) {
  if (IS_DEMO) return null;
  try {
    const res = await fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const type = data?.weatherCondition?.type || "";
    return {
      rain: type.includes("RAIN") || type.includes("DRIZZLE") || type.includes("SHOWER"),
      snow: type.includes("SNOW") || type.includes("SLEET"),
      description: data?.weatherCondition?.description?.text || "Clear",
    };
  } catch { return null; }
}

// ─── NEARBY GROCERY ───────────────────────────────────────────
async function fetchNearGrocery(lat, lng) {
  if (IS_DEMO) return false;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places:searchNearby?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "places.id,places.displayName",
        },
        body: JSON.stringify({
          includedTypes: ["grocery_store", "supermarket", "food_store"],
          locationRestriction: {
            circle: { center: { latitude: lat, longitude: lng }, radius: 200 },
          },
          maxResultCount: 1,
        }),
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.places) && data.places.length > 0;
  } catch { return false; }
}

// ─── GOOGLE ROUTES API ────────────────────────────────────────
async function fetchGoogleRoutes(lat, lng, destination) {
  if (IS_DEMO) return null;
  const fieldMask = [
    "routes.duration",
    "routes.legs.steps.transitDetails",
    "routes.legs.steps.travelMode",
    "routes.legs.steps.staticDuration",
  ].join(",");

  const makeCall = async (preference) => {
    try {
      const res = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-FieldMask": fieldMask,
          },
          body: JSON.stringify({
            origin: { location: { latLng: { latitude: lat, longitude: lng } } },
            destination: { address: destination },
            travelMode: "TRANSIT",
            computeAlternativeRoutes: true,
            transitPreferences: { routingPreference: preference },
          }),
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.routes || [];
    } catch { return []; }
  };

  const [lessWalk, fewerTransfers] = await Promise.all([
    makeCall("LESS_WALKING"),
    makeCall("FEWER_TRANSFERS"),
  ]);

  const all = [...lessWalk, ...fewerTransfers];
  const seen = new Set();
  return all.filter((r) => {
    const key = r.duration?.seconds;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── PARSE GOOGLE ROUTES ──────────────────────────────────────
function parseGoogleRoutes(rawRoutes) {
  if (!rawRoutes?.length) return null;
  return rawRoutes.map((r) => {
    let walkMin = 0, transitCount = 0;
    const lines = [];
    (r.legs || []).forEach((leg) => {
      (leg.steps || []).forEach((step) => {
        if (step.travelMode === "WALK") {
          walkMin += Math.round((step.staticDuration?.seconds || 0) / 60);
        }
        if (step.travelMode === "TRANSIT") {
          transitCount++;
          const name =
            step.transitDetails?.transitLine?.nameShort ||
            step.transitDetails?.transitLine?.name ||
            step.transitDetails?.transitLine?.vehicle?.name?.text || "";
          if (name && !lines.includes(name)) lines.push(name);
        }
      });
    });
    return {
      duration: Math.round((r.duration?.seconds || 0) / 60),
      transfers: Math.max(0, transitCount - 1),
      walkMin: Math.max(0, walkMin),
      fare: 2.90,
      lines: lines.slice(0, 3),
    };
  }).filter((r) => r.duration > 0);
}

// ─── RANK ROUTES ──────────────────────────────────────────────
function rankRoutes(routes, walkPenalty) {
  const scored = routes.map((r) => ({
    ...r,
    score: r.duration + r.walkMin * walkPenalty + r.transfers * 8,
  }));

  const byScore = [...scored].sort((a, b) => a.score - b.score);
  const bySpeed = [...scored].sort((a, b) => a.duration - b.duration);
  const byTransfers = [...scored].sort((a, b) => a.transfers - b.transfers || a.duration - b.duration);
  const byFare = [...scored].sort((a, b) => a.fare - b.fare || a.duration - b.duration);

  const seen = new Set();
  const picks = [];
  for (const r of [byScore[0], bySpeed[0], byTransfers[0], byFare[0]]) {
    if (!r) continue;
    const key = `${r.duration}-${r.transfers}-${r.walkMin}`;
    if (!seen.has(key)) { seen.add(key); picks.push(r); }
  }

  // Fill remaining slots
  for (const r of byScore) {
    if (picks.length >= 4) break;
    const key = `${r.duration}-${r.transfers}-${r.walkMin}`;
    if (!seen.has(key)) { seen.add(key); picks.push(r); }
  }

  // Pad with variants if fewer than 4 unique routes
  while (picks.length < 4) {
    picks.push({ ...picks[picks.length - 1] });
  }

  return picks.slice(0, 4);
}

// ─── CLAUDE RATIONALE (via serverless proxy) ──────────────────
async function getRationale(slot, route, contextStr) {
  try {
    const res = await fetch("/api/rationale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot,
        duration: route.duration,
        transfers: route.transfers,
        walkMin: route.walkMin,
        context: contextStr,
      }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.text || null;
  } catch {
    return null;
  }
}

// ─── COMPONENTS ───────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skel-line med" />
      <div className="skel-line full" style={{ height: 10 }} />
      <div className="skel-line short" style={{ height: 10 }} />
    </div>
  );
}

function RouteCard({ cardDef, route, rationale }) {
  return (
    <div className={`route-card ${cardDef.slot === "recommended" ? "recommended" : ""}`}>
      <div className="card-header">
        <div className="card-label">{cardDef.label}</div>
        <span className={`card-badge ${cardDef.badgeClass}`}>{cardDef.badge}</span>
      </div>
      {rationale !== undefined
        ? rationale
          ? <div className="card-rationale">"{rationale}"</div>
          : <div className="rationale-loading" />
        : null
      }
      <div className="card-meta">
        <span className="meta-chip">⏱ {route.duration} min</span>
        <span className="meta-chip">🚶 {route.walkMin} min walk</span>
        <span className="meta-chip">🔄 {route.transfers} transfer{route.transfers !== 1 ? "s" : ""}</span>
        {route.lines.length > 0 && (
          <span className="meta-chip">🚇 {route.lines.join(", ")}</span>
        )}
        <span className="meta-chip">💳 ${route.fare.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function ComfortRoute() {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [rationales, setRationales] = useState({});
  const [context, setContext] = useState(null);
  const [locationSource, setLocationSource] = useState(null);
  const [isDemo, setIsDemo] = useState(IS_DEMO);
  const [error, setError] = useState(null);

  useEffect(() => {
    setContext(inferContext());
  }, []);

  const handleSearch = useCallback(async () => {
    if (!destination.trim()) return;
    setLoading(true);
    setError(null);
    setCards([]);
    setRationales({});

    try {
      const { lat, lng, source } = await getLocation();
      setLocationSource(source);

      const [weather, nearGrocery] = await Promise.all([
        fetchWeather(lat, lng),
        fetchNearGrocery(lat, lng),
      ]);

      const ctx = inferContext(weather, nearGrocery);
      setContext(ctx);

      const rawRoutes = await fetchGoogleRoutes(lat, lng, destination);
      let normalized = rawRoutes?.length ? parseGoogleRoutes(rawRoutes) : null;

      if (!normalized || normalized.length === 0) {
        normalized = getMockRoutes();
        setIsDemo(true);
      } else {
        setIsDemo(false);
      }

      const ranked = rankRoutes(normalized, ctx.walkPenalty);
      const cardDefs = getCardLabels(ctx.contextLabel);
      const paired = cardDefs.map((def, i) => ({ def, route: ranked[i] || ranked[0] }));
      setCards(paired);

      const contextStr = `${ctx.contextLabel} commuter, walk penalty ×${ctx.walkPenalty.toFixed(1)}${weather ? `, ${weather.description}` : ""}${nearGrocery ? ", likely carrying groceries" : ""}`;

      // Stream rationales in as they arrive
      paired.forEach(({ def, route }, i) => {
        getRationale(def.slot, route, contextStr).then((text) => {
          setRationales((prev) => ({ ...prev, [i]: text || "Good option for your current conditions." }));
        });
      });

    } catch (e) {
      setError("Something went wrong fetching routes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [destination]);

  const handleKey = (e) => { if (e.key === "Enter") handleSearch(); };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="content">
          <div className="header">
            <div className="logo"><span className="logo-dot" /> ComfortRoute</div>
            <div className="tagline">Context-aware transit routing. No taps required.</div>
          </div>

          {context && (
            <div className="context-strip">
              <span className="context-label">Sensing:</span>
              {context.pills.map((p, i) => (
                <span key={i} className={`pill ${p.active ? "active" : ""}`}>
                  {p.icon && <span>{p.icon}</span>} {p.label}
                </span>
              ))}
            </div>
          )}

          {locationSource && (
            <div className="location-status">
              <span className={`location-dot ${locationSource}`} />
              {locationSource === "live" && "Using your live location"}
              {locationSource === "denied" && "Location access denied — using NYC default"}
              {locationSource === "default" && "Using NYC default location"}
            </div>
          )}

          {isDemo && (
            <div className="demo-banner">
              🧪 Demo mode — mock NYC routes. Add API keys in Vercel for live routing.
            </div>
          )}

          {error && <div className="error-box">⚠️ {error}</div>}

          <div className="search-wrap">
            <input
              className="search-input"
              type="text"
              placeholder="Where are you going?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={loading || !destination.trim()}
            >
              {loading ? "⟳" : "→"}
            </button>
          </div>

          {loading && (
            <div className="cards-grid">
              {[0,1,2,3].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && cards.length > 0 && (
            <>
              <div className="cards-label">{context?.contextEmoji} Routes for you right now</div>
              <div className="cards-grid">
                {cards.map(({ def, route }, i) => (
                  <RouteCard key={i} cardDef={def} route={route} rationale={rationales[i]} />
                ))}
              </div>
            </>
          )}

          {!loading && cards.length === 0 && !error && (
            <div className="state-box">
              <div className="state-icon">🧭</div>
              <div className="state-title">Where to?</div>
              <div className="state-sub">
                Type a destination. ComfortRoute reads your current context — time, weather, location — and shows the right options automatically.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
