import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

/*
  Fase 2: conectado a Supabase (auth real, productos compartidos, recetas,
  diario y tickets persistentes). Tema visual: el propio ticket de la
  compra — papel, tipografía monoespaciada para cifras, líneas de puntos.
*/

const SUPABASE_URL = "https://hzmpfpeykizwzfhvphmm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_IvudTVA4RLbDHAiSESE6Zg_ebI9YDcY";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const palette = {
  paper: "#F3FAEE",
  paperDark: "#E2F1D8",
  ink: "#15271A",
  inkSoft: "#4E6A4A",
  line: "#B7D8A8",
  red: "#E0672F",
  green: "#2F8F3E",
  greenSoft: "#D6F0C7",
  redSoft: "#FBDFCB",
};

const MEALS = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];

const gastoCategorias = [
  { name: "Fruta y verdura", color: palette.green },
  { name: "Carne", color: "#A65C3E" },
  { name: "Pescado", color: "#3E7EA6" },
  { name: "Lácteos y huevos", color: "#C7A24A" },
  { name: "Despensa (pasta, arroz, legumbres)", color: "#8C6A46" },
  { name: "Procesados y snacks", color: palette.red },
  { name: "Higiene y hogar", color: palette.inkSoft },
];
const CATEGORIAS_PRODUCTO = gastoCategorias.map((c) => c.name);
function colorCategoria(nombre) {
  const c = gastoCategorias.find((c) => c.name === nombre);
  return c ? c.color : palette.inkSoft;
}

function pad(n) {
  return String(n).padStart(2, "0");
}
function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function hoy() {
  return new Date();
}

// ---------- Piezas visuales reutilizables ----------
function Ticket({ children }) {
  return (
    <div className="relative w-full" style={{ background: palette.paper, color: palette.ink, boxShadow: "0 18px 40px rgba(36,31,22,0.28)" }}>
      <div style={{ borderTop: `2px dashed ${palette.line}` }} />
      {children}
      <div style={{ borderBottom: `2px dashed ${palette.line}` }} />
    </div>
  );
}

function Row({ left, right, sub, muted }) {
  return (
    <div className="flex items-baseline justify-between py-1.5" style={{ opacity: muted ? 0.55 : 1 }}>
      <div className="pr-2">
        <div className="text-[13.5px] leading-tight">{left}</div>
        {sub && <div className="text-[11px]" style={{ color: palette.inkSoft }}>{sub}</div>}
      </div>
      <div className="flex-1 border-b border-dotted mx-1 mb-1" style={{ borderColor: palette.line }} />
      {right !== undefined && (
        <div className="text-[13px] whitespace-nowrap pl-3 text-right" style={{ fontFamily: "'Courier New', monospace", minWidth: 58 }}>
          {right}
        </div>
      )}
    </div>
  );
}

function Stamp({ children, tone = "ink" }) {
  const colors = {
    ink: { bg: "transparent", fg: palette.ink, bd: palette.ink },
    red: { bg: palette.redSoft, fg: palette.red, bd: palette.red },
    green: { bg: palette.greenSoft, fg: palette.green, bd: palette.green },
  }[tone];
  return (
    <span className="inline-block px-1.5 py-0.5 text-[10px] tracking-wide uppercase" style={{ color: colors.fg, border: `1px solid ${colors.bd}`, background: colors.bg, transform: "rotate(-1.5deg)" }}>
      {children}
    </span>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-baseline justify-between text-[12px] tracking-[0.14em] uppercase mb-2 pb-1" style={{ color: palette.inkSoft, borderBottom: `1px solid ${palette.line}` }}>
      <span>{children}</span>
      {right && <span style={{ fontFamily: "'Courier New', monospace", color: palette.ink }}>{right}</span>}
    </div>
  );
}

function Loading({ text }) {
  return <div className="px-5 py-8 text-center text-[12.5px]" style={{ color: palette.inkSoft }}>{text || "Cargando…"}</div>;
}

// ---------- Autenticación ----------
function AuthScreen() {
  const [modo, setModo] = useState("entrar"); // entrar | crear
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [avisoConfirma, setAvisoConfirma] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      if (modo === "crear") {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        setAvisoConfirma(true);
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "Algo ha ido mal");
    } finally {
      setCargando(false);
    }
  }

  const inputStyle = {
    border: `1.5px solid ${palette.line}`,
    background: "#FFFFFF",
    color: palette.ink,
    borderRadius: 10,
  };

  return (
    <div
      className="w-full centered-screen px-4"
      style={{ background: `linear-gradient(160deg, #BFE0AE 0%, #8FCB78 55%, #6AB558 100%)` }}
    >
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-14">
          <div
            className="flex items-center justify-center mb-4"
            style={{ width: 92, height: 92, borderRadius: 24, background: "linear-gradient(135deg, #6FCB57 0%, #2F8F3E 55%, #1D5C28 100%)", boxShadow: "0 10px 26px rgba(31,92,40,0.4)" }}
          >
            <svg width="50" height="50" viewBox="0 0 34 34">
              <path d="M13 13 C13 8 14.8 5 17 5 C19.2 5 21 8 21 13" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <ellipse cx="14" cy="9" rx="2.6" ry="4.6" fill="#FFD34D" transform="rotate(-25 14 9)" />
              <ellipse cx="19.5" cy="8.5" rx="2.6" ry="5" fill="#FFD34D" transform="rotate(20 19.5 8.5)" />
              <ellipse cx="17" cy="9.5" rx="2.3" ry="4.2" fill="#FF8A4C" />
              <path d="M9 14 H25 L27 29 H7 Z" fill="#FFFFFF" />
            </svg>
          </div>
          <div
            className="text-center"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 34, letterSpacing: -0.5, color: "#1D5C28", lineHeight: 1.05 }}
          >
            Diario Nutricional
          </div>
        </div>

        <div
          className="px-6 pt-6 pb-6"
          style={{ background: "#FFFFFF", borderRadius: 20, boxShadow: "0 20px 45px rgba(21,39,26,0.25)" }}
        >
          {avisoConfirma ? (
            <div className="text-[13px] py-2 text-center" style={{ color: palette.inkSoft }}>
              Te he enviado un email de confirmación a <b>{email}</b>. Ábrelo y luego vuelve aquí para entrar.
            </div>
          ) : (
            <>
              <div className="flex mb-5" style={{ background: palette.paperDark, borderRadius: 12, padding: 4 }}>
                {["entrar", "crear"].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setModo(m); setError(null); }}
                    className="flex-1 py-2 text-[12.5px] uppercase tracking-wide"
                    style={{
                      borderRadius: 9,
                      background: modo === m ? palette.green : "transparent",
                      color: modo === m ? "#FFFFFF" : palette.inkSoft,
                      fontWeight: modo === m ? 600 : 400,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {m === "entrar" ? "Entrar" : "Crear cuenta"}
                  </button>
                ))}
              </div>

              <form onSubmit={enviar}>
                <label className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: palette.inkSoft }}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-3 px-3.5 py-2.5 text-[14px]"
                  style={inputStyle}
                />

                <label className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: palette.inkSoft }}>Contraseña</label>
                <div className="relative mb-4">
                  <input
                    type={verPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-14 text-[14px]"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase"
                    style={{ color: palette.green }}
                  >
                    {verPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>

                {error && (
                  <div className="text-[12px] mb-3 px-3 py-2" style={{ color: palette.red, background: palette.redSoft, borderRadius: 8 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full py-3 text-[13.5px] uppercase tracking-wide font-semibold"
                  style={{
                    background: palette.green,
                    color: "#FFFFFF",
                    borderRadius: 12,
                    opacity: cargando ? 0.6 : 1,
                    boxShadow: "0 8px 20px rgba(47,143,62,0.35)",
                  }}
                >
                  {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Calendario reutilizable ----------
function MiniCalendar({ selected, onSelect, monthTotals, onMonthChange }) {
  const [viewMonth, setViewMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const monthLabel = viewMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const firstWeekday = (viewMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));

  useEffect(() => {
    onMonthChange && onMonthChange(viewMonth.getFullYear(), viewMonth.getMonth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMonth]);

  function cambiarMes(delta) {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));
  }

  return (
    <div className="px-5 pb-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => cambiarMes(-1)} className="text-[13px] px-2">‹</button>
        <span className="text-[12px] uppercase tracking-wide" style={{ color: palette.inkSoft }}>{monthLabel}</span>
        <button onClick={() => cambiarMes(1)} className="text-[13px] px-2">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-[10px]" style={{ color: palette.inkSoft }}>{d}</div>
        ))}
        {cells.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const key = toKey(date);
          const isSelected = key === toKey(selected);
          const isToday = key === toKey(hoy());
          const isFuture = date > hoy();
          const kcal = monthTotals && monthTotals[key] !== undefined ? monthTotals[key] : null;
          return (
            <button
              key={idx}
              onClick={() => onSelect(date)}
              className="text-[11.5px] flex flex-col items-center justify-center relative py-1"
              style={{
                minHeight: 40,
                background: isSelected ? palette.ink : "transparent",
                color: isSelected ? palette.paper : isFuture ? palette.inkSoft : palette.ink,
                border: isToday && !isSelected ? `1px solid ${palette.ink}` : "1px solid transparent",
              }}
            >
              <span>{date.getDate()}</span>
              <span
                className="text-[8.5px] leading-none mt-0.5"
                style={{ fontFamily: "'Courier New', monospace", color: isSelected ? palette.paper : kcal !== null ? palette.green : palette.line }}
              >
                {kcal !== null ? kcal : "·"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function dayLabel(date) {
  const key = toKey(date);
  if (key === toKey(hoy())) return "Hoy";
  const diff = Math.round((date - hoy()) / 86400000);
  const fecha = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  if (diff === -1) return `Ayer · ${fecha}`;
  if (diff === 1) return `Mañana · ${fecha}`;
  return fecha;
}

function DayBreakdown({ date, dayData, loading, compact }) {
  const isFuture = date > hoy();
  const hasAny = MEALS.some((m) => (dayData[m] || []).length);
  const total = MEALS.reduce((s, m) => s + (dayData[m] || []).reduce((s2, i) => s2 + i.kcal, 0), 0);

  if (loading) return <Loading />;

  return (
    <div className="px-5">
      {isFuture && (
        <div className="mb-3 p-2.5 text-[12px]" style={{ background: palette.greenSoft, border: `1px dashed ${palette.green}`, color: palette.ink }}>
          Día futuro: planifica añadiendo recetas o productos.
        </div>
      )}
      {!isFuture && !hasAny && !compact && (
        <div className="mb-3 text-[12px]" style={{ color: palette.inkSoft }}>No hay registros guardados este día.</div>
      )}
      {MEALS.map((meal) => {
        const items = dayData[meal] || [];
        const subtotal = items.reduce((s, i) => s + i.kcal, 0);
        if (compact && items.length === 0) {
          return (
            <div key={meal} className="flex items-center justify-between py-1" style={{ borderBottom: `1px dotted ${palette.line}` }}>
              <span className="text-[11.5px] uppercase tracking-wide" style={{ color: palette.inkSoft }}>{meal}</span>
              <span className="text-[11px]" style={{ color: palette.line }}>—</span>
            </div>
          );
        }
        return (
          <div key={meal} className={compact ? "mb-2" : "mb-3"}>
            <SectionTitle right={items.length ? `${subtotal} kcal` : undefined}>{meal}</SectionTitle>
            {items.length === 0 ? (
              <div className="text-[11px] py-1" style={{ color: palette.inkSoft }}>Sin registros</div>
            ) : (
              items.map((it, idx) => <Row key={idx} left={it.name} sub={it.qty} right={`${it.kcal} kcal`} />)
            )}
          </div>
        );
      })}
      <div className={"flex items-center justify-between " + (compact ? "pt-2 mt-1" : "pt-3 mt-1")} style={{ borderTop: `2px solid ${palette.ink}` }}>
        <span className="text-[13px] uppercase tracking-wide">Total día</span>
        <span className="text-[22px] font-bold" style={{ fontFamily: "'Courier New', monospace", color: palette.red }}>{total} kcal</span>
      </div>
    </div>
  );
}

async function fetchDiaEntradas(userId, dateKey) {
  const { data, error } = await sb.from("diary_entries").select("meal,name,qty,kcal").eq("user_id", userId).eq("entry_date", dateKey);
  if (error) throw error;
  const dayData = Object.fromEntries(MEALS.map((m) => [m, []]));
  (data || []).forEach((row) => dayData[row.meal] && dayData[row.meal].push(row));
  return dayData;
}

// ---------- Diario (hoy) ----------
function DiarioTab({ userId, displayName }) {
  const [view, setView] = useState("diario"); // diario -> meal -> receta
  const [mealElegido, setMealElegido] = useState(null);
  const [dayData, setDayData] = useState(Object.fromEntries(MEALS.map((m) => [m, []])));
  const [loading, setLoading] = useState(true);
  const [recetas, setRecetas] = useState([]);
  const todayKey = toKey(hoy());

  async function recargar() {
    setLoading(true);
    try {
      setDayData(await fetchDiaEntradas(userId, todayKey));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function abrirRecetasDe(meal) {
    setMealElegido(meal);
    setView("receta");
    const { data } = await sb
      .from("recipes")
      .select("id,name,servings,recipe_ingredients(grams,products(kcal))")
      .eq("user_id", userId)
      .eq("meal", meal);
    setRecetas(data || []);
  }

  async function agregarReceta(recipe) {
    const total = (recipe.recipe_ingredients || []).reduce(
      (s, ri) => s + (ri.grams / 100) * ((ri.products && ri.products.kcal) || 0),
      0
    );
    await sb.from("diary_entries").insert({
      user_id: userId,
      entry_date: todayKey,
      meal: mealElegido,
      name: recipe.name,
      qty: "1 ración",
      kcal: Math.round(total),
    });
    setView("diario");
    setMealElegido(null);
    recargar();
  }

  if (view === "meal") {
    return (
      <Ticket>
        <div className="px-5 pt-5 pb-3 text-center">
          <button onClick={() => setView("diario")} className="text-[11px] uppercase tracking-wide mb-2" style={{ color: palette.inkSoft }}>‹ Cancelar</button>
          <div className="text-[20px] font-semibold mt-1">¿Para cuándo?</div>
        </div>
        <div className="px-5 pb-5">
          {MEALS.map((m) => (
            <button key={m} onClick={() => abrirRecetasDe(m)} className="w-full text-left py-2.5" style={{ borderBottom: `1px dotted ${palette.line}` }}>
              <span className="text-[14px]">{m}</span>
            </button>
          ))}
        </div>
      </Ticket>
    );
  }

  if (view === "receta") {
    return (
      <Ticket>
        <div className="px-5 pt-5 pb-3 text-center">
          <button onClick={() => setView("meal")} className="text-[11px] uppercase tracking-wide mb-2" style={{ color: palette.inkSoft }}>‹ Cambiar franja</button>
          <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>{mealElegido}</div>
          <div className="text-[20px] font-semibold mt-1">Elige receta</div>
        </div>
        <div className="px-5 pb-5">
          {recetas.length === 0 ? (
            <div className="text-[12.5px] py-3" style={{ color: palette.inkSoft }}>
              Todavía no tienes recetas guardadas en {mealElegido.toLowerCase()}. Créala primero en la pestaña Recetas.
            </div>
          ) : (
            recetas.map((r) => {
              const total = (r.recipe_ingredients || []).reduce((s, ri) => s + (ri.grams / 100) * ((ri.products && ri.products.kcal) || 0), 0);
              return (
                <button key={r.id} onClick={() => agregarReceta(r)} className="w-full text-left py-2.5 flex items-baseline justify-between" style={{ borderBottom: `1px dotted ${palette.line}` }}>
                  <span className="text-[14px]">{r.name}</span>
                  <span className="text-[13px]" style={{ fontFamily: "'Courier New', monospace" }}>{Math.round(total)} kcal</span>
                </button>
              );
            })
          )}
        </div>
      </Ticket>
    );
  }

  return (
    <Ticket>
      <div className="px-5 pt-4 pb-2 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>Diario de {displayName}</div>
        <div className="text-[18px] font-semibold mt-0.5">Hoy · {hoy().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
        <button onClick={() => setView("meal")} className="mt-2 px-4 py-1 text-[11.5px] uppercase tracking-wide" style={{ background: palette.green, color: palette.paper }}>
          + Añadir
        </button>
      </div>
      <DayBreakdown date={hoy()} dayData={dayData} loading={loading} compact />
    </Ticket>
  );
}

// ---------- Calendario ----------
function CalendarioTab({ userId }) {
  const [selected, setSelected] = useState(hoy());
  const [dayData, setDayData] = useState(Object.fromEntries(MEALS.map((m) => [m, []])));
  const [loading, setLoading] = useState(true);
  const [monthTotals, setMonthTotals] = useState({});

  useEffect(() => {
    setLoading(true);
    fetchDiaEntradas(userId, toKey(selected))
      .then(setDayData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selected, userId]);

  async function onMonthChange(year, month) {
    const start = toKey(new Date(year, month, 1));
    const end = toKey(new Date(year, month + 1, 0));
    const { data } = await sb.from("diary_entries").select("entry_date,kcal").eq("user_id", userId).gte("entry_date", start).lte("entry_date", end);
    const totals = {};
    (data || []).forEach((row) => {
      totals[row.entry_date] = (totals[row.entry_date] || 0) + row.kcal;
    });
    setMonthTotals(totals);
  }

  return (
    <Ticket>
      <div className="px-5 pt-5 pb-1 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>Calendario</div>
        <div className="text-[20px] font-semibold mt-1">{dayLabel(selected)}</div>
      </div>
      <MiniCalendar selected={selected} onSelect={setSelected} monthTotals={monthTotals} onMonthChange={onMonthChange} />
      <DayBreakdown date={selected} dayData={dayData} loading={loading} />
    </Ticket>
  );
}

// ---------- Ticket: Supermercado -> Cámara -> Lectura ----------
const SUPERMERCADOS = ["Mercadona", "Carrefour", "Lidl", "Dia", "Alcampo", "Otro"];

function EscanearTab({ userId }) {
  const [step, setStep] = useState("supermercado");
  const [super_, setSuper] = useState(null);
  const [foto, setFoto] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pidiendoEtiqueta, setPidiendoEtiqueta] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const fileInputRef = React.useRef(null);
  const etiquetaInputRef = React.useRef(null);

  function onFotoSeleccionada(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFoto(reader.result);
      setStep("leyendo");
      // Simulación de la lectura del ticket: en la app real aquí se envía la
      // foto a un modelo con visión para extraer productos y precios, y para
      // cada producto nuevo se busca su información nutricional real.
      setTimeout(() => {
        setProductos([
          { name: "Yogur griego ligero", price: "1,45", status: "ok" },
          { name: "Pechuga de pavo 92%", price: "2,85", status: "ok" },
          { name: "Salmón ahumado", price: "3,55", status: "ok" },
          { name: "Q. Lonchas light", price: "2,90", status: "pendiente" },
          { name: "Burger M Vacun 1000g", price: "10,80", status: "pendiente" },
          { name: "Brócoli 0,570kg", price: "1,71", status: "ok" },
        ]);
        setStep("resultado");
      }, 1600);
    };
    reader.readAsDataURL(file);
  }

  function onFotoEtiqueta(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || pidiendoEtiqueta === null) return;
    // En la app real: se manda a un modelo con visión para leer la tabla
    // nutricional, y esos valores se guardan para siempre en "Productos".
    setProductos((prev) => prev.map((p, i) => (i === pidiendoEtiqueta ? { ...p, status: "ok" } : p)));
    setPidiendoEtiqueta(null);
  }

  const total = productos.reduce((s, p) => s + parseFloat(p.price.replace(",", ".")), 0);

  async function guardarTicket() {
    setGuardando(true);
    try {
      // 1. asegurar que cada producto existe en la base compartida
      for (const p of productos) {
        const { data: existente } = await sb.from("products").select("id").eq("name", p.name).maybeSingle();
        if (!existente) {
          await sb.from("products").insert({
            name: p.name,
            categoria: p.status === "pendiente" ? null : "Despensa (pasta, arroz, legumbres)",
            ultimo_precio: parseFloat(p.price.replace(",", ".")),
          });
        } else {
          await sb.from("products").update({ ultimo_precio: parseFloat(p.price.replace(",", ".")) }).eq("id", existente.id);
        }
      }
      // 2. crear el ticket
      await sb.from("tickets").insert({ user_id: userId, supermercado: super_, total });
      setGuardado(true);
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar el ticket: " + e.message);
    }
    setGuardando(false);
  }

  if (step === "supermercado") {
    return (
      <Ticket>
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>Nuevo ticket</div>
          <div className="text-[20px] font-semibold mt-1">¿Dónde compraste?</div>
        </div>
        <div className="px-5 pb-5">
          {SUPERMERCADOS.map((s) => (
            <button key={s} onClick={() => { setSuper(s); setStep("camara"); }} className="w-full text-left py-2.5" style={{ borderBottom: `1px dotted ${palette.line}` }}>
              <span className="text-[14px]">{s}</span>
            </button>
          ))}
        </div>
      </Ticket>
    );
  }

  if (step === "camara") {
    return (
      <Ticket>
        <div className="px-5 pt-5 pb-3 text-center">
          <button onClick={() => setStep("supermercado")} className="text-[11px] uppercase tracking-wide mb-2" style={{ color: palette.inkSoft }}>‹ Cambiar supermercado</button>
          <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>{super_}</div>
          <div className="text-[20px] font-semibold mt-1">Haz foto al ticket</div>
        </div>
        <div className="px-5 pb-5 text-center">
          <div className="flex flex-col items-center justify-center py-10 mb-3" style={{ border: `2px dashed ${palette.line}`, color: palette.inkSoft }}>
            <span className="text-[34px] mb-2">📷</span>
            <span className="text-[12px]">Encájalo bien recto y con buena luz</span>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFotoSeleccionada} className="hidden" />
          <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="w-full py-2.5 text-[13px] uppercase tracking-wide" style={{ background: palette.green, color: palette.paper }}>
            Abrir cámara
          </button>
        </div>
      </Ticket>
    );
  }

  if (step === "leyendo") {
    return (
      <Ticket>
        <div className="px-5 py-10 text-center">
          {foto && <img src={foto} alt="Ticket" className="mx-auto mb-4" style={{ maxHeight: 160, border: `1px solid ${palette.line}` }} />}
          <div className="text-[13px] uppercase tracking-wide" style={{ color: palette.inkSoft }}>Leyendo el ticket de {super_}…</div>
          <div className="text-[11px] mt-1" style={{ color: palette.inkSoft }}>Identificando productos, precios y buscando sus datos nutricionales</div>
        </div>
      </Ticket>
    );
  }

  if (guardado) {
    return (
      <Ticket>
        <div className="px-5 py-12 text-center">
          <div className="text-[15px] mb-2">✓ Ticket guardado</div>
          <div className="text-[12.5px]" style={{ color: palette.inkSoft }}>{total.toFixed(2)}€ sumados a tu gasto de esta semana.</div>
          <button
            onClick={() => { setStep("supermercado"); setFoto(null); setSuper(null); setProductos([]); setGuardado(false); }}
            className="mt-5 px-4 py-2 text-[12px] uppercase tracking-wide"
            style={{ background: palette.green, color: palette.paper }}
          >
            Escanear otro ticket
          </button>
        </div>
      </Ticket>
    );
  }

  const pendientes = productos.filter((r) => r.status === "pendiente").length;
  return (
    <Ticket>
      <div className="px-5 pt-5 pb-3 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>Nuevo ticket</div>
        <div className="text-[20px] font-semibold mt-1">{super_.toUpperCase()}</div>
      </div>
      <div className="px-5">
        <SectionTitle right={`${total.toFixed(2)}€`}>Productos detectados</SectionTitle>
        {productos.map((it, idx) => (
          <div key={idx}>
            <Row left={<span>{it.name} {it.status === "pendiente" && <span style={{ color: palette.red }}>·sin valores nutricionales</span>}</span>} right={`${it.price}€`} muted={it.status === "pendiente"} />
            {it.status === "pendiente" && (
              <button onClick={() => { setPidiendoEtiqueta(idx); etiquetaInputRef.current && etiquetaInputRef.current.click(); }} className="text-[11px] mb-1.5" style={{ color: palette.green }}>
                📷 Subir foto de la etiqueta
              </button>
            )}
          </div>
        ))}
        <input ref={etiquetaInputRef} type="file" accept="image/*" capture="environment" onChange={onFotoEtiqueta} className="hidden" />
        {pendientes > 0 && (
          <div className="mt-3 mb-2 p-3 text-[12.5px]" style={{ background: palette.redSoft, border: `1px dashed ${palette.red}`, color: palette.ink }}>
            No encontré datos nutricionales reales de {pendientes} producto{pendientes > 1 ? "s" : ""}. Sube foto de su etiqueta y quedará guardado para siempre.
          </div>
        )}
        <button onClick={guardarTicket} disabled={guardando} className="w-full py-2.5 mt-3 mb-2 text-[13px] uppercase tracking-wide" style={{ background: palette.green, color: palette.paper, opacity: guardando ? 0.6 : 1 }}>
          {guardando ? "Guardando…" : "Guardar ticket"}
        </button>
        <button onClick={() => { setStep("supermercado"); setFoto(null); setSuper(null); setProductos([]); }} className="w-full py-2 mb-5 text-[12px] uppercase tracking-wide" style={{ color: palette.inkSoft }}>
          Descartar
        </button>
      </div>
    </Ticket>
  );
}

// ---------- Recetas ----------
function NuevaReceta({ userId, onDone, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [meal, setMeal] = useState(MEALS[0]);
  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]); // {product_id, name, grams}
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    sb.from("products").select("id,name").order("name").then(({ data }) => setProductos(data || []));
  }, []);

  function addIngrediente(p) {
    if (ingredientes.some((i) => i.product_id === p.id)) return;
    setIngredientes((prev) => [...prev, { product_id: p.id, name: p.name, grams: 100 }]);
  }

  async function guardar() {
    if (!nombre || ingredientes.length === 0) return;
    setGuardando(true);
    const { data: receta, error } = await sb.from("recipes").insert({ user_id: userId, name: nombre, meal, servings: 1 }).select().single();
    if (!error && receta) {
      await sb.from("recipe_ingredients").insert(ingredientes.map((i) => ({ recipe_id: receta.id, product_id: i.product_id, grams: i.grams })));
    }
    setGuardando(false);
    onDone();
  }

  return (
    <Ticket>
      <div className="px-5 pt-5 pb-3 text-center">
        <button onClick={onCancel} className="text-[11px] uppercase tracking-wide mb-2" style={{ color: palette.inkSoft }}>‹ Cancelar</button>
        <div className="text-[20px] font-semibold mt-1">Nueva receta</div>
      </div>
      <div className="px-5 pb-5">
        <input placeholder="Nombre de la receta" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full mb-2 px-3 py-2 text-[13px]" style={{ border: `1px solid ${palette.line}`, background: palette.paperDark, color: palette.ink }} />
        <select value={meal} onChange={(e) => setMeal(e.target.value)} className="w-full mb-3 px-3 py-2 text-[13px]" style={{ border: `1px solid ${palette.line}`, background: palette.paperDark, color: palette.ink }}>
          {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <SectionTitle>Ingredientes añadidos</SectionTitle>
        {ingredientes.length === 0 && <div className="text-[12px] py-1.5" style={{ color: palette.inkSoft }}>Ninguno todavía</div>}
        {ingredientes.map((ing, idx) => (
          <div key={idx} className="flex items-center justify-between py-1">
            <span className="text-[13px] flex-1">{ing.name}</span>
            <input
              type="number"
              value={ing.grams}
              onChange={(e) => setIngredientes((prev) => prev.map((i, iidx) => (iidx === idx ? { ...i, grams: Number(e.target.value) || 0 } : i)))}
              className="w-16 text-right px-1 py-0.5 mr-1"
              style={{ fontFamily: "'Courier New', monospace", border: `1px solid ${palette.line}`, background: palette.paperDark, color: palette.ink }}
            />
            <span className="text-[11px]" style={{ color: palette.inkSoft }}>g</span>
          </div>
        ))}

        <SectionTitle>Añadir de tus productos</SectionTitle>
        <div style={{ maxHeight: 160, overflowY: "auto" }}>
          {productos.map((p) => (
            <button key={p.id} onClick={() => addIngrediente(p)} className="w-full text-left py-1.5" style={{ borderBottom: `1px dotted ${palette.line}` }}>
              <span className="text-[12.5px]">{p.name}</span>
            </button>
          ))}
        </div>

        <button onClick={guardar} disabled={guardando || !nombre || ingredientes.length === 0} className="w-full py-2.5 mt-4 text-[13px] uppercase tracking-wide" style={{ background: palette.green, color: palette.paper, opacity: guardando ? 0.6 : 1 }}>
          {guardando ? "Guardando…" : "Guardar receta"}
        </button>
      </div>
    </Ticket>
  );
}

function RecetaDetalle({ recipe, onBack }) {
  const [grams, setGrams] = useState(
    Object.fromEntries((recipe.recipe_ingredients || []).map((ri) => [ri.products.name, ri.grams]))
  );
  const total = (recipe.recipe_ingredients || []).reduce((s, ri) => s + (grams[ri.products.name] / 100) * (ri.products.kcal || 0), 0);
  return (
    <Ticket>
      <div className="px-5 pt-5 pb-3">
        <button onClick={onBack} className="text-[11px] uppercase tracking-wide mb-2" style={{ color: palette.inkSoft }}>‹ Volver a recetas</button>
        <div className="text-[19px] font-semibold">{recipe.name}</div>
        <div className="text-[11px]" style={{ color: palette.inkSoft }}>{recipe.meal}</div>
      </div>
      <div className="px-5 pb-5">
        <SectionTitle>Ingredientes</SectionTitle>
        {(recipe.recipe_ingredients || []).map((ri, idx) => (
          <div key={idx} className="flex items-center justify-between py-1.5">
            <div className="text-[13.5px] flex-1">{ri.products.name}</div>
            <input
              type="number"
              value={grams[ri.products.name]}
              onChange={(e) => setGrams((g) => ({ ...g, [ri.products.name]: Number(e.target.value) || 0 }))}
              className="w-16 text-right px-1 py-0.5 mr-1"
              style={{ fontFamily: "'Courier New', monospace", border: `1px solid ${palette.line}`, background: palette.paperDark, color: palette.ink }}
            />
            <span className="text-[12px] w-6" style={{ color: palette.inkSoft }}>g</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: `2px solid ${palette.ink}` }}>
          <span className="text-[13px] uppercase tracking-wide">Total</span>
          <span className="text-[20px] font-bold" style={{ fontFamily: "'Courier New', monospace", color: palette.red }}>{Math.round(total)} kcal</span>
        </div>
      </div>
    </Ticket>
  );
}

function RecetasTab({ userId }) {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [creando, setCreando] = useState(false);
  const [expanded, setExpanded] = useState({});

  async function recargar() {
    setLoading(true);
    const { data } = await sb.from("recipes").select("id,name,meal,servings,recipe_ingredients(grams,products(name,kcal))").eq("user_id", userId);
    setRecetas(data || []);
    setLoading(false);
  }

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (creando) return <NuevaReceta userId={userId} onCancel={() => setCreando(false)} onDone={() => { setCreando(false); recargar(); }} />;
  if (open) return <RecetaDetalle recipe={open} onBack={() => setOpen(null)} />;
  if (loading) return <Ticket><Loading /></Ticket>;

  return (
    <Ticket>
      <div className="px-5 pt-5 pb-3 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>Tus recetas</div>
        <div className="text-[20px] font-semibold mt-1">{recetas.length} guardadas</div>
      </div>
      <div className="px-5 pb-3">
        {MEALS.map((meal) => {
          const delMeal = recetas.filter((r) => r.meal === meal);
          const isOpen = !!expanded[meal];
          return (
            <div key={meal} style={{ borderBottom: `1px dotted ${palette.line}` }}>
              <button onClick={() => setExpanded((e) => ({ ...e, [meal]: !e[meal] }))} className="w-full flex items-center justify-between py-2.5">
                <span className="text-[13px] uppercase tracking-wide">{meal}</span>
                <span className="text-[11px]" style={{ color: palette.inkSoft, fontFamily: "'Courier New', monospace" }}>{delMeal.length} {isOpen ? "▴" : "▾"}</span>
              </button>
              {isOpen && (
                <div className="pb-2">
                  {delMeal.length === 0 ? (
                    <div className="text-[12px] pb-2" style={{ color: palette.inkSoft }}>Sin recetas todavía</div>
                  ) : (
                    delMeal.map((r) => {
                      const total = (r.recipe_ingredients || []).reduce((s, ri) => s + (ri.grams / 100) * (ri.products.kcal || 0), 0);
                      return (
                        <button key={r.id} onClick={() => setOpen(r)} className="w-full text-left py-1.5 flex items-baseline justify-between">
                          <span className="text-[13px]">{r.name}</span>
                          <span className="text-[12.5px] pl-2 whitespace-nowrap" style={{ fontFamily: "'Courier New', monospace" }}>{Math.round(total)} kcal</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-5 pb-5">
        <button onClick={() => setCreando(true)} className="w-full py-2.5 mt-2 text-[12.5px] uppercase tracking-wide" style={{ border: `1px dashed ${palette.ink}`, color: palette.ink }}>
          + Nueva receta
        </button>
      </div>
    </Ticket>
  );
}

// ---------- Productos ----------
function ProductoDetalle({ producto, onBack, onCambiarCategoria }) {
  const [editandoCat, setEditandoCat] = useState(false);
  return (
    <Ticket>
      <div className="px-5 pt-5 pb-3">
        <button onClick={onBack} className="text-[11px] uppercase tracking-wide mb-2" style={{ color: palette.inkSoft }}>‹ Volver a productos</button>
        <div className="text-[19px] font-semibold">{producto.name}</div>
        <div className="flex items-center justify-between mt-1">
          <button onClick={() => setEditandoCat((v) => !v)} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 inline-block" style={{ background: colorCategoria(producto.categoria) }} />
            <span className="text-[11.5px]" style={{ color: palette.inkSoft }}>{producto.categoria || "Sin categoría"} ✎</span>
          </button>
          {producto.ultimo_precio != null && <span className="text-[13px]" style={{ fontFamily: "'Courier New', monospace" }}>{producto.ultimo_precio}€</span>}
        </div>
        {editandoCat && (
          <div className="mt-2" style={{ border: `1px solid ${palette.line}` }}>
            {CATEGORIAS_PRODUCTO.map((cat) => (
              <button key={cat} onClick={() => { onCambiarCategoria(producto.id, cat); setEditandoCat(false); }} className="w-full text-left px-3 py-1.5 flex items-center gap-1.5" style={{ borderBottom: `1px dotted ${palette.line}`, background: cat === producto.categoria ? palette.paperDark : "transparent" }}>
                <span className="w-2.5 h-2.5 inline-block" style={{ background: colorCategoria(cat) }} />
                <span className="text-[12px]">{cat}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        <SectionTitle>Valores nutricionales (por 100g)</SectionTitle>
        {producto.kcal == null ? (
          <div className="text-[12px] py-2" style={{ color: palette.inkSoft }}>Todavía no hay datos nutricionales para este producto.</div>
        ) : (
          <>
            <Row left="Calorías" right={`${producto.kcal} kcal`} />
            <Row left="Proteínas" right={`${producto.proteinas ?? "—"} g`} />
            <Row left="Hidratos de carbono" right={`${producto.carbohidratos ?? "—"} g`} />
            <Row left="Grasas" right={`${producto.grasas ?? "—"} g`} />
          </>
        )}
      </div>
    </Ticket>
  );
}

function ProductosTab() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  async function recargar() {
    setLoading(true);
    const { data } = await sb.from("products").select("*").order("name");
    setProductos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    recargar();
  }, []);

  async function cambiarCategoria(id, nuevaCategoria) {
    await sb.from("products").update({ categoria: nuevaCategoria }).eq("id", id);
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, categoria: nuevaCategoria } : p)));
    setOpen((prev) => (prev && prev.id === id ? { ...prev, categoria: nuevaCategoria } : prev));
  }

  if (open) return <ProductoDetalle producto={open} onBack={() => setOpen(null)} onCambiarCategoria={cambiarCategoria} />;
  if (loading) return <Ticket><Loading /></Ticket>;

  return (
    <Ticket>
      <div className="px-5 pt-5 pb-3 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>Tus productos</div>
        <div className="text-[20px] font-semibold mt-1">{productos.length} guardados</div>
      </div>
      <div className="px-5 pb-5">
        {productos.length === 0 && <div className="text-[12.5px] py-3" style={{ color: palette.inkSoft }}>Todavía no hay productos. Escanea un ticket para empezar.</div>}
        {productos.map((p) => (
          <button key={p.id} onClick={() => setOpen(p)} className="w-full text-left py-2 flex items-center justify-between" style={{ borderBottom: `1px dotted ${palette.line}` }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 inline-block flex-shrink-0" style={{ background: colorCategoria(p.categoria) }} />
              <div className="min-w-0">
                <div className="text-[13.5px] truncate">{p.name}</div>
                <div className="text-[10.5px] truncate" style={{ color: palette.inkSoft }}>{p.categoria || "Sin categoría"}</div>
              </div>
            </div>
            {p.ultimo_precio != null && <span className="text-[13px] pl-2 whitespace-nowrap" style={{ fontFamily: "'Courier New', monospace" }}>{p.ultimo_precio}€</span>}
          </button>
        ))}
      </div>
    </Ticket>
  );
}

// ---------- Resumen (gasto económico) ----------
function ResumenTab({ userId }) {
  const [range, setRange] = useState("semana");
  const [tickets, setTickets] = useState([]);
  const [productosCat, setProductosCat] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      sb.from("tickets").select("total,created_at").eq("user_id", userId),
      sb.from("products").select("name,categoria"),
    ]).then(([t, p]) => {
      setTickets(t.data || []);
      const map = {};
      (p.data || []).forEach((prod) => (map[prod.name] = prod.categoria));
      setProductosCat(map);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <Ticket><Loading /></Ticket>;

  function inicioSemana(offset) {
    const d = hoy();
    const diaSemana = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - diaSemana - offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function sumaDesde(inicio, fin) {
    return tickets.filter((t) => { const f = new Date(t.created_at); return f >= inicio && f < fin; }).reduce((s, t) => s + Number(t.total), 0);
  }

  const serieSemana = [0, 1, 2, 3].map((i) => ({
    l: i === 0 ? "Esta semana" : i === 1 ? "Semana pasada" : `Hace ${i} semanas`,
    eur: sumaDesde(inicioSemana(i), inicioSemana(i - 1)),
  }));
  const serieMes = [0, 1, 2, 3].map((i) => {
    const d = hoy();
    const inicio = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const fin = new Date(d.getFullYear(), d.getMonth() - i + 1, 1);
    return { l: i === 0 ? "Este mes" : i === 1 ? "Mes pasado" : `Hace ${i} meses`, eur: sumaDesde(inicio, fin) };
  });

  const serie = range === "semana" ? serieSemana : serieMes;
  const gastoTotal = serie[0].eur;
  const max = Math.max(...serie.map((d) => d.eur), 1);

  return (
    <Ticket>
      <div className="px-5 pt-5 pb-3 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: palette.inkSoft }}>Gasto en el súper · {range === "semana" ? "esta semana" : "este mes"}</div>
        <div className="text-[24px] font-bold mt-1" style={{ fontFamily: "'Courier New', monospace" }}>{gastoTotal.toFixed(2)}€</div>
        <div className="flex justify-center gap-1 mt-2">
          {["semana", "mes"].map((r) => (
            <button key={r} onClick={() => setRange(r)} className="px-3 py-1 text-[11px] uppercase tracking-wide" style={{ border: `1px solid ${palette.ink}`, background: range === r ? palette.green : "transparent", color: range === r ? palette.paper : palette.ink }}>
              {r === "semana" ? "Por semanas" : "Por meses"}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5">
        <SectionTitle>Comparativa con periodos anteriores</SectionTitle>
        {serie.map((d, idx) => (
          <div key={idx} className="mb-2">
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="text-[12px]" style={{ color: idx === 0 ? palette.ink : palette.inkSoft, fontWeight: idx === 0 ? 600 : 400 }}>{d.l}</span>
              <span className="text-[12px]" style={{ fontFamily: "'Courier New', monospace", color: idx === 0 ? palette.ink : palette.inkSoft }}>{d.eur.toFixed(2)}€</span>
            </div>
            <div className="h-2 w-full" style={{ background: palette.paperDark }}>
              <div style={{ width: `${(d.eur / max) * 100}%`, height: "100%", background: idx === 0 ? palette.green : palette.line }} />
            </div>
          </div>
        ))}
        <div className="text-[11px] mt-3" style={{ color: palette.inkSoft }}>
          El desglose por categoría llegará en cuanto los tickets guardados incluyan sus productos línea a línea.
        </div>
      </div>
    </Ticket>
  );
}

// ---------- Cabecera de cuenta ----------
function AccountHeader({ displayName, setDisplayName, userId, onLogout }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(displayName);

  async function guardar() {
    await sb.from("profiles").update({ display_name: valor }).eq("id", userId);
    setDisplayName(valor);
    setEditando(false);
  }

  return (
    <div className="flex items-center justify-between mb-3 px-1">
      {editando ? (
        <div className="flex items-center gap-1 flex-1">
          <input
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardar()}
            className="flex-1 px-2 py-1 text-[12px]"
            style={{ border: `1px solid ${palette.ink}`, background: palette.paper, color: palette.ink }}
          />
          <button onClick={guardar} className="text-[11px] px-2 py-1" style={{ background: palette.green, color: palette.paper }}>OK</button>
        </div>
      ) : (
        <button onClick={() => setEditando(true)} className="text-[12px] uppercase tracking-wide" style={{ color: palette.ink }}>
          {displayName} ✎
        </button>
      )}
      <button onClick={onLogout} className="text-[11px]" style={{ color: palette.inkSoft }}>Salir</button>
    </div>
  );
}

const TABS = [
  { id: "diario", label: "Diario" },
  { id: "calendario", label: "Calendario" },
  { id: "recetas", label: "Recetas" },
  { id: "ticket", label: "Ticket" },
  { id: "productos", label: "Productos" },
  { id: "resumen", label: "Resumen" },
];

export default function App() {
  const [session, setSession] = useState(undefined); // undefined=cargando, null=sin sesión
  const [displayName, setDisplayName] = useState("");
  const [tab, setTab] = useState("diario");

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: listener } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const userId = session.user.id;
      let { data: perfil } = await sb.from("profiles").select("display_name").eq("id", userId).maybeSingle();
      if (!perfil) {
        const nombre = session.user.email.split("@")[0];
        await sb.from("profiles").insert({ id: userId, display_name: nombre });
        perfil = { display_name: nombre };
      }
      setDisplayName(perfil.display_name);
    })();
  }, [session]);

  if (session === undefined) {
    return <div className="w-full flex items-center justify-center" style={{ background: "#BFE0AE", minHeight: "100vh" }}><Loading text="Cargando…" /></div>;
  }
  if (!session) return <AuthScreen />;

  const userId = session.user.id;

  return (
    <div className="w-full flex justify-center pt-6" style={{ background: "#BFE0AE", minHeight: "100vh" }}>
      <div className="w-full max-w-[380px]" style={{ paddingBottom: 76 }}>
        <AccountHeader displayName={displayName} setDisplayName={setDisplayName} userId={userId} onLogout={() => sb.auth.signOut()} />

        <div className="px-1">
          {tab === "diario" && <DiarioTab userId={userId} displayName={displayName} />}
          {tab === "calendario" && <CalendarioTab userId={userId} />}
          {tab === "recetas" && <RecetasTab userId={userId} />}
          {tab === "ticket" && <EscanearTab userId={userId} />}
          {tab === "productos" && <ProductosTab />}
          {tab === "resumen" && <ResumenTab userId={userId} />}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex mx-auto overflow-hidden" style={{ maxWidth: 380, border: `2px solid ${palette.ink}`, borderBottom: "none", background: palette.paper, boxShadow: "0 -6px 16px rgba(36,31,22,0.25)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 text-[9.5px] uppercase tracking-tight px-0.5 leading-tight"
            style={{ background: tab === t.id ? palette.green : "transparent", color: tab === t.id ? palette.paper : palette.ink, borderRight: `1px solid ${palette.line}` }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
