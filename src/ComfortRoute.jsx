// ============================================================
// ComfortRoute.jsx — Full App
// Replace keys via Vercel environment variables (see README)
// ============================================================

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

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

  /* Background mesh */
  .app::before {
    content: '';
    position: fixed;
    top: -40%;
    left: -20%;
    width: 140%;
    height: 80%;
    background: radial-gradient(ellipse at 30% 40%, rgba(110,231,183,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(56,189,248,0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .content { position: relative; z-index: 1; }

  /* Header */
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
  }

  .tagline {
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  /* Context pill */
  .context-strip {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }

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

  .pill-icon { font-size: 13px; }

  /* Search bar */
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
    transition: opacity 0.2s, transform 0.15s;
  }

  .search-btn:hover { opacity: 0.85; transform: translateY(-50%) scale(1.05); }
  .search-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: translateY(-50%); }

  /* Context clarify button */
  .clarify-btn {
    width: 100%;
    padding: 13px 18px;
    background: rgba(251,191,36,0.08);
    border: 1px solid rgba(251,191,36,0.25);
    border-radius: var(--radius);
    color: var(--warn);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 20px;
    text-align: left;
    display: flex; align-items: center; gap: 8px;
    transition: background 0.2s;
  }

  .clarify-btn:hover { background: rgba(251,191,36,0.14); }

  /* Cards */
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
  }

  .route-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
    background: var(--card-accent, var(--accent));
    opacity: 0;
    transition: opacity 0.2s;
  }

  .route-card:hover {
    background: var(--card-hover);
    border-color: rgba(255,255,255,0.14);
    transform: translateY(-1px);
  }

  .route-card:hover::before { opacity: 1; }

  .route-card.recommended {
    border-color: rgba(110,231,183,0.25);
    background: rgba(110,231,183,0.04);
    --card-accent: var(--accent);
  }

  .route-card.recommended::before { opacity: 1; }

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

  .badge-recommended {
    background: rgba(110,231,183,0.15);
    color: var(--accent);
  }

  .badge-alt {
    background: rgba(56,189,248,0.12);
    color: var(--accent2);
  }

  .badge-resilient {
    background: rgba(167,139,250,0.12);
    color: #a78bfa;
  }

  .badge-budget {
    background: rgba(251,191,36,0.12);
    color: var(--warn);
  }

  .card-rationale {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: 12px;
    font-style: italic;
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

  .meta-chip span { font-size: 13px; }

  /* Loading skeleton */
  .skeleton-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    animation: pulse 1.6s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
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

  /* Empty / error states */
  .state-box {
    text-align: center;
    padding: 48px 24px;
    color: var(--muted);
  }

  .state-icon { font-size: 36px; margin-bottom: 12px; }
  .state-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .state-sub { font-size: 13px; line-height: 1.6; }

  /* Demo mode banner */
  .demo-banner {
    background: rgba(56,189,248,0.08);
    border: 1px solid rgba(56,189,248,0.2);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12px;
    color: var(--accent2);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Shimmer on load */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .route-card { animation: fadeUp 0.35s ease both; }
  .route-card:nth-child(1) { animation-delay: 0.05s; }
  .route-card:nth-child(2) { animation-delay: 0.12s; }
  .route-card:nth-child(3) { animation-delay: 0.19s; }
  .route-card:nth-child(4) { animation-delay: 0.26s; }
`;

// ─── INFERENCE ENGINE ─────────────────────────────────────────
function inferContext(weather = null, nearGrocery = false) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;

  let walkPenalty = 1.0;
  let contextLabel = "standard";
  let contextEmoji = "🧭";
  let pills = [];

  // Time signals
  if (!isWeekend && hour >= 6 && hour < 9) {
    walkPenalty *= 3.0;
    contextLabel = "low-energy";
    contextEmoji = "😴";
    pills.push({ label: "Morning commute", active: true });
  } else if (!isWeekend && hour >= 16 && hour < 19) {
    walkPenalty *= 2.5;
    contextLabel = "low-energy";
    contextEmoji = "😮‍💨";
    pills.push({ label: "Evening rush", active: true });
  } else if (hour >= 22 || hour < 5) {
    walkPenalty *= 4.0;
    contextLabel = "low-energy";
    contextEmoji = "🌙";
    pills.push({ label: "Late night", active: true });
  } else if (isWeekend && hour >= 11 && hour < 18) {
    walkPenalty *= 0.9;
    contextLabel = "leisure";
    contextEmoji = "☀️";
    pills.push({ label: "Weekend afternoon", active: true });
  } else {
    pills.push({ label: isWeekend ? "Weekend" : "Midday", active: false });
  }

  // Weather signals
  if (weather?.rain) {
    walkPenalty *= 1.6;
    pills.push({ label: "Raining", active: true, icon: "🌧️" });
  } else if (weather?.snow) {
    walkPenalty *= 1.8;
    pills.push({ label: "Snowing", active: true, icon: "❄️" });
  } else {
    pills.push({ label: weather?.description || "Clear", active: false, icon: "🌤️" });
  }

  // Grocery signal
  if (nearGrocery) {
    walkPenalty *= 1.6;
    contextLabel = "load-carrier";
    pills.push({ label: "Near grocery", active: true, icon: "🛒" });
  }

  const confidence = Math.min(95, 60 + Math.round(Math.abs(walkPenalty - 1) * 20));

  return { walkPenalty, contextLabel, contextEmoji, pills, confidence };
}

// ─── CARD LABEL SYSTEM ───────────────────────────────────────
function getCardLabels(contextLabel, isUnfamiliar = false) {
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
      { slot: "resilient", label: "Fewer transfers", badge: "resilient", badgeClass: "badge-resilient" },
      { slot: "budget", label: "Cheapest option", badge: "budget", badgeClass: "badge-budget" },
    ],
  };

  const label = isUnfamiliar ? "anxiety" : (contextLabel in sets ? contextLabel : "standard");
  return sets[label];
}

// ─── MOCK DATA (demo mode when no API keys) ──────────────────
function getMockRoutes(destination, contextLabel) {
  const base = [
    { duration: 28, transfers: 1, walkMin: 4, fare: 2.90, lines: ["A", "C"] },
    { duration: 22, transfers: 2, walkMin: 9, fare: 2.90, lines: ["1", "2", "3"] },
    { duration: 35, transfers: 0, walkMin: 3, fare: 2.90, lines: ["E"] },
    { duration: 31, transfers: 1, walkMin: 6, fare: 0, lines: ["M15 SBS"] },
  ];
  return base;
}

// ─── CLAUDE RATIONALE ────────────────────────────────────────
async function getClaudeRationale(cardLabel, route, context) {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "PASTE_YOUR_ANTHROPIC_API_KEY_HERE") {
    const fallbacks = {
      "recommended": "Minimizes walking given current conditions — best choice right now.",
      "alt": "Shaves 6 minutes off, though you'll walk more. Worth it if you're pressed for time.",
      "resilient": "Fewer connections means fewer failure points. Reliable when things are unpredictable.",
      "budget": "Same city, same transit network — no reason to overpay.",
    };
    return fallbacks[cardLabel] || "Solid option for your current context.";
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are a transit routing assistant. Write exactly ONE sentence (max 18 words) explaining why this route matches the user's current situation. Be specific, warm, and direct. No filler phrases.",
        messages: [{
          role: "user",
          content: `Route: ${route.duration} min, ${route.transfers} transfer(s), ${route.walkMin} min walk. Context: ${context}. Card slot: "${cardLabel}". Write one sentence.`
        }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || "Smart choice for your current conditions.";
  } catch {
    return "Smart choice for your current conditions.";
  }
}

// ─── GOOGLE ROUTES (real mode) ───────────────────────────────
async function fetchGoogleRoutes(origin, destination) {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "PASTE_YOUR_GOOGLE_API_KEY_HERE") {
    return null; // triggers demo mode
  }

  const body = {
    origin: { address: origin },
    destination: { address: destination },
    travelMode: "TRANSIT",
    computeAlternativeRoutes: true,
    transitPreferences: { routingPreference: "LESS_WALKING" },
  };

  try {
    const res = await fetch(
      `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "routes.duration,routes.legs,routes.travelAdvisory",
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return data.routes || null;
  } catch {
    return null;
  }
}

// ─── WEATHER (Google Weather API) ────────────────────────────
async function fetchWeather(lat, lng) {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "PASTE_YOUR_GOOGLE_API_KEY_HERE") {
    return null;
  }
  try {
    const res = await fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
    );
    const data = await res.json();
    const code = data?.weatherCondition?.type || "";
    return {
      rain: code.includes("RAIN") || code.includes("DRIZZLE"),
      snow: code.includes("SNOW"),
      description: data?.weatherCondition?.description?.text || "Clear",
    };
  } catch {
    return null;
  }
}

// ─── NEARBY GROCERY (Google Places) ──────────────────────────
async function fetchNearGrocery(lat, lng) {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "PASTE_YOUR_GOOGLE_API_KEY_HERE") {
    return false;
  }
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places:searchNearby?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "places.id",
        },
        body: JSON.stringify({
          includedTypes: ["grocery_store", "supermarket"],
          locationRestriction: {
            circle: { center: { latitude: lat, longitude: lng }, radius: 200 },
          },
          maxResultCount: 1,
        }),
      }
    );
    const data = await res.json();
    return (data.places?.length || 0) > 0;
  } catch {
    return false;
  }
}

// ─── PARSE GOOGLE ROUTES → normalized format ─────────────────
function parseGoogleRoutes(rawRoutes) {
  if (!rawRoutes) return null;
  return rawRoutes.slice(0, 4).map((r) => {
    const leg = r.legs?.[0];
    let walkMin = 0;
    let transfers = 0;
    let lines = [];
    leg?.steps?.forEach((s) => {
      if (s.travelMode === "WALK") walkMin += Math.round((s.staticDuration?.seconds || 0) / 60);
      if (s.travelMode === "TRANSIT") {
        transfers++;
        const line = s.transitDetails?.transitLine?.nameShort || s.transitDetails?.transitLine?.name || "";
        if (line) lines.push(line);
      }
    });
    return {
      duration: Math.round((r.duration?.seconds || 0) / 60),
      transfers: Math.max(0, transfers - 1),
      walkMin,
      fare: 2.90,
      lines,
    };
  });
}

// ─── RANK ROUTES by context ───────────────────────────────────
function rankRoutes(routes, walkPenalty) {
  const scored = routes.map((r) => ({
    ...r,
    score: r.duration + r.walkMin * walkPenalty + r.transfers * 8,
  }));

  const sorted = [...scored].sort((a, b) => a.score - b.score);
  const byWalk = [...scored].sort((a, b) => a.walkMin - b.walkMin);
  const byTransfers = [...scored].sort((a, b) => a.transfers - b.transfers);
  const byFare = [...scored].sort((a, b) => a.fare - b.fare || a.duration - b.duration);

  const dedup = (arr) => {
    const seen = new Set();
    return arr.filter((r) => {
      const k = `${r.duration}-${r.transfers}-${r.walkMin}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const picks = dedup([sorted[0], byWalk[0], byTransfers[0], byFare[0]]);
  while (picks.length < 4 && scored.length > picks.length) {
    const remaining = scored.filter(
      (r) => !picks.find((p) => p.duration === r.duration && p.transfers === r.transfers)
    );
    if (!remaining.length) break;
    picks.push(remaining[0]);
  }

  return picks.slice(0, 4);
}

// ─── SKELETON ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skel-line med" />
      <div className="skel-line full" style={{ height: 10 }} />
      <div className="skel-line short" style={{ height: 10 }} />
    </div>
  );
}

// ─── ROUTE CARD COMPONENT ─────────────────────────────────────
function RouteCard({ cardDef, route, rationale, index }) {
  const isRecommended = cardDef.slot === "recommended";
  return (
    <div
      className={`route-card ${isRecommended ? "recommended" : ""}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="card-header">
        <div className="card-label">{cardDef.label}</div>
        <span className={`card-badge ${cardDef.badgeClass}`}>{cardDef.badge}</span>
      </div>
      {rationale && <div className="card-rationale">"{rationale}"</div>}
      <div className="card-meta">
        <span className="meta-chip"><span>⏱</span>{route.duration} min</span>
        <span className="meta-chip"><span>🚶</span>{route.walkMin} min walk</span>
        <span className="meta-chip"><span>🔄</span>{route.transfers} transfer{route.transfers !== 1 ? "s" : ""}</span>
        {route.lines.length > 0 && (
          <span className="meta-chip"><span>🚇</span>{route.lines.slice(0, 2).join(", ")}</span>
        )}
        {route.fare > 0 && (
          <span className="meta-chip"><span>💳</span>${route.fare.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function ComfortRoute() {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [rationales, setRationales] = useState([]);
  const [context, setContext] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState(null);
  const [showClarify, setShowClarify] = useState(false);

  // Run inference on mount (no APIs needed)
  useEffect(() => {
    const ctx = inferContext();
    setContext(ctx);
    setShowClarify(ctx.confidence < 75);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!destination.trim()) return;

    setLoading(true);
    setError(null);
    setCards([]);
    setRationales([]);

    try {
      // 1. Get location
      let lat = 40.7549, lng = -73.984; // NYC default
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch { /* use default */ }

      // 2. Weather + grocery in parallel
      const [weather, nearGrocery] = await Promise.all([
        fetchWeather(lat, lng),
        fetchNearGrocery(lat, lng),
      ]);

      // 3. Update context with real signals
      const ctx = inferContext(weather, nearGrocery);
      setContext(ctx);
      setShowClarify(ctx.confidence < 75);

      // 4. Fetch routes (or mock)
      let rawRoutes = await fetchGoogleRoutes(`${lat},${lng}`, destination);
      let normalized;
      if (rawRoutes) {
        normalized = parseGoogleRoutes(rawRoutes);
        setIsDemo(false);
      } else {
        normalized = getMockRoutes(destination, ctx.contextLabel);
        setIsDemo(true);
      }

      // 5. Rank routes
      const ranked = rankRoutes(normalized, ctx.walkPenalty);

      // 6. Get card labels
      const isUnfamiliar = destination.toLowerCase().includes("?") || destination.split(" ").length > 4;
      const cardDefs = getCardLabels(ctx.contextLabel, isUnfamiliar);

      // Build card pairs
      const paired = cardDefs.map((def, i) => ({ def, route: ranked[i] || ranked[0] }));
      setCards(paired);

      // 7. Fetch rationales
      const contextStr = `${ctx.contextLabel}, walk penalty ×${ctx.walkPenalty.toFixed(1)}, ${weather?.description || "clear"}, ${nearGrocery ? "near grocery" : "standard origin"}`;
      const rationaleList = await Promise.all(
        paired.map(({ def, route }) => getClaudeRationale(def.slot, route, contextStr))
      );
      setRationales(rationaleList);

    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [destination]);

  const handleKey = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const demoKeys =
    !GOOGLE_API_KEY || GOOGLE_API_KEY === "PASTE_YOUR_GOOGLE_API_KEY_HERE";

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="content">
          {/* Header */}
          <div className="header">
            <div className="logo">
              <span className="logo-dot" />
              ComfortRoute
            </div>
            <div className="tagline">Context-aware transit routing. No taps required.</div>
          </div>

          {/* Context pills */}
          {context && (
            <div className="context-strip">
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Sensing:</span>
              {context.pills.map((p, i) => (
                <span key={i} className={`pill ${p.active ? "active" : ""}`}>
                  {p.icon && <span className="pill-icon">{p.icon}</span>}
                  {p.label}
                </span>
              ))}
            </div>
          )}

          {/* Demo banner */}
          {demoKeys && (
            <div className="demo-banner">
              🧪 Demo mode — mock NYC routes. Add API keys for live routing.
            </div>
          )}

          {/* Search */}
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
              aria-label="Search routes"
            >
              {loading ? "⟳" : "→"}
            </button>
          </div>

          {/* Clarify button (low confidence) */}
          {showClarify && !loading && cards.length === 0 && (
            <button className="clarify-btn" onClick={() => setShowClarify(false)}>
              ⚡ Are you carrying anything heavy right now?
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="cards-grid">
              {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="state-box">
              <div className="state-icon">⚠️</div>
              <div className="state-title">Something went wrong</div>
              <div className="state-sub">{error}</div>
            </div>
          )}

          {/* Cards */}
          {!loading && cards.length > 0 && (
            <>
              <div className="cards-label">
                {context?.contextEmoji} Routes for you right now
              </div>
              <div className="cards-grid">
                {cards.map(({ def, route }, i) => (
                  <RouteCard
                    key={i}
                    index={i}
                    cardDef={def}
                    route={route}
                    rationale={rationales[i]}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!loading && cards.length === 0 && !error && (
            <div className="state-box">
              <div className="state-icon">🧭</div>
              <div className="state-title">Where to?</div>
              <div className="state-sub">
                Type a destination and ComfortRoute will infer the right options for your current context — no filters, no setup.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
