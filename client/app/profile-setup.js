import { useState, useEffect } from "react";

const GOAL_OPTIONS = [
  { id: "fat_loss", label: "Fat Loss", icon: "📉", color: "#FF6B35", desc: "Burn fat & get lean" },
  { id: "maintain", label: "Maintain", icon: "⚖️", color: "#4A90E2", desc: "Stay at current weight" },
  { id: "gain", label: "Muscle Gain", icon: "📈", color: "#4CAF50", desc: "Build muscle & strength" },
];

const MEAL_PREFERENCES = [
  { id: "everything", label: "Everything", icon: "🍖" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥦" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "keto", label: "Keto", icon: "🥑" },
  { id: "paleo", label: "Paleo", icon: "🦴" },
];

const ACTIVITY_LEVELS = [
  { id: "sedentary",  label: "Sedentary",          subtitle: "Office job, little exercise", icon: "🪑", multiplier: 1.2   },
  { id: "light",     label: "Lightly Active",       subtitle: "1-2 days/week",              icon: "🚶", multiplier: 1.375 },
  { id: "moderate",  label: "Moderately Active",    subtitle: "3-5 days/week",              icon: "🏃", multiplier: 1.55  },
  { id: "active",    label: "Very Active",           subtitle: "6-7 days/week",              icon: "⚡", multiplier: 1.725 },
  { id: "very_active", label: "Extremely Active",   subtitle: "Athlete level",              icon: "🏋️", multiplier: 1.9   },
];

const WORKOUT_PLACES = [
  { id: "gym",      label: "Gym",      icon: "🏋️" },
  { id: "home",     label: "Home",     icon: "🏠" },
  { id: "outdoors", label: "Outdoors", icon: "🌲" },
  { id: "mixed",    label: "Mixed",    icon: "🔀" },
];

const SPORTS = [
  { id: "running",    label: "Running",    icon: "🏃" },
  { id: "cycling",   label: "Cycling",    icon: "🚴" },
  { id: "swimming",  label: "Swimming",   icon: "🏊" },
  { id: "yoga",      label: "Yoga",       icon: "🧘" },
  { id: "basketball",label: "Basketball", icon: "🏀" },
  { id: "football",  label: "Football",   icon: "⚽" },
  { id: "tennis",    label: "Tennis",     icon: "🎾" },
  { id: "none",      label: "No Sports",  icon: "❌" },
];

// ── Calorie formulas (Mifflin-St Jeor) ───────────────────────────────────────
function calcBMR(weight, height, age, gender) {
  const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
  if (!w || !h || !a) return 0;
  const base = 10 * w + 6.25 * h - 5 * a;
  return gender === "Female" ? base - 161 : base + 5;
}
function calcTDEE(bmr, activityId) {
  const lvl = ACTIVITY_LEVELS.find(l => l.id === activityId);
  return Math.round(bmr * (lvl?.multiplier || 1.2));
}
function calcGoalCalories(tdee, goal) {
  if (goal === "fat_loss") return tdee - 500;
  if (goal === "gain")     return tdee + 300;
  return tdee;
}
function calcMacros(calories, goal) {
  const splits = {
    fat_loss: { p: 0.35, c: 0.35, f: 0.30 },
    gain:     { p: 0.30, c: 0.45, f: 0.25 },
    maintain: { p: 0.30, c: 0.40, f: 0.30 },
  };
  const sp = splits[goal] || splits.maintain;
  return {
    protein: Math.round((calories * sp.p) / 4),
    carbs:   Math.round((calories * sp.c) / 4),
    fat:     Math.round((calories * sp.f) / 9),
  };
}

// ── Weight journey mock API ───────────────────────────────────────────────────
function mockJourneyAPI(curW, tgtW, goal, ratePerMonth) {
  const months = [];
  const today = new Date();
  const n = Math.ceil(Math.abs(curW - tgtW) / ratePerMonth);
  for (let i = 0; i <= Math.min(n, 12); i++) {
    const d = new Date(today); d.setMonth(d.getMonth() + i);
    const label = d.toLocaleString("default", { month: "short" }) + " '" + d.getFullYear().toString().slice(2);
    const w = goal === "fat_loss"
      ? Math.max(tgtW, curW - ratePerMonth * i)
      : Math.min(tgtW, curW + ratePerMonth * i);
    months.push({ label, weight: parseFloat(w.toFixed(1)) });
  }
  return { months, startMonth: months[0]?.label, goalMonth: months[months.length - 1]?.label };
}

// ── WeightJourneyGraph ────────────────────────────────────────────────────────
function WeightJourneyGraph({ currentWeight, targetWeight, goal, weightGoalRate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentWeight || !targetWeight) { setData(null); return; }
    setLoading(true);
    const t = setTimeout(() => {
      const rate = parseFloat(weightGoalRate) * 4.33;
      setData(mockJourneyAPI(parseFloat(currentWeight), parseFloat(targetWeight), goal, rate || 4));
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, [currentWeight, targetWeight, goal, weightGoalRate]);

  if (!currentWeight || !targetWeight)
    return <div style={{ textAlign: "center", color: "#555", padding: "14px 0", fontSize: 12 }}>Enter current & target weight to see your journey</div>;
  if (loading)
    return <div style={{ textAlign: "center", color: "#4A90E2", padding: "14px 0", fontSize: 12 }}>⏳ Calculating journey...</div>;
  if (!data) return null;

  const { months } = data;
  const ws = months.map(m => m.weight);
  const minW = Math.min(...ws) - 2, maxW = Math.max(...ws) + 2, range = maxW - minW;
  const gH = 108, gW = 300, pL = 34, pR = 10, pT = 8, pB = 26;
  const iW = gW - pL - pR, iH = gH - pT - pB;
  const pts = months.map((m, i) => ({
    x: pL + (i / Math.max(months.length - 1, 1)) * iW,
    y: pT + ((maxW - m.weight) / range) * iH,
    ...m,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${pT+iH} L ${pL} ${pT+iH} Z`;
  const color = goal === "fat_loss" ? "#FF6B35" : "#4CAF50";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
        <span style={{ color: "#666" }}>Start <b style={{ color: "#aaa" }}>{data.startMonth}</b></span>
        <span style={{ color: "#666" }}>Goal <b style={{ color }}>{data.goalMonth}</b></span>
      </div>
      <svg width="100%" viewBox={`0 0 ${gW} ${gH}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t, i) => (
          <g key={i}>
            <line x1={pL} y1={pT+t*iH} x2={pL+iW} y2={pT+t*iH} stroke="#252830" strokeWidth="1"/>
            <text x={pL-4} y={pT+t*iH+4} textAnchor="end" fontSize="9" fill="#444">{(maxW-t*range).toFixed(0)}</text>
          </g>
        ))}
        <path d={areaD} fill="url(#wg)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.filter((_, i) => i === 0 || i === pts.length - 1).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill={color} stroke="#13151a" strokeWidth="2" />
            <text x={p.x} y={p.y-9} textAnchor="middle" fontSize="9" fill={color} fontWeight="700">{p.weight}</text>
          </g>
        ))}
        <text x={pL}    y={gH} textAnchor="middle" fontSize="8" fill="#444">{pts[0]?.label}</text>
        <text x={pL+iW} y={gH} textAnchor="middle" fontSize="8" fill="#444">{pts[pts.length-1]?.label}</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "9px 12px", marginTop: 8 }}>
        {[
          { label: "Current", val: `${currentWeight} kg`, color: "#ccc" },
          { label: goal === "fat_loss" ? "To lose" : "To gain", val: `${Math.abs(parseFloat(currentWeight)-parseFloat(targetWeight)).toFixed(1)} kg`, color },
          { label: "Target", val: `${targetWeight} kg`, color },
        ].map(item => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CalorieCard with count-up animation ──────────────────────────────────────
function CalorieCard({ label, calories, accent, description, macros, isHighlight }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 950, 1);
      setDisplayed(Math.round(calories * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [calories]);

  return (
    <div style={{
      background: isHighlight ? `linear-gradient(135deg, ${accent}18, ${accent}08)` : "#1a1c24",
      border: `${isHighlight ? 2 : 1}px solid ${isHighlight ? accent + "55" : "#252830"}`,
      borderRadius: 16, padding: "16px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: macros ? 10 : 0 }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <div style={{ fontSize: 11, color: isHighlight ? accent : "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: "#444", lineHeight: 1.5 }}>{description}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: isHighlight ? accent : "#999", letterSpacing: -1.5, lineHeight: 1 }}>
            {displayed.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>kcal / day</div>
        </div>
      </div>
      {macros && (
        <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid #252830" }}>
          {[
            { label: "Protein", val: `${macros.protein}g`, color: "#4A90E2" },
            { label: "Carbs",   val: `${macros.carbs}g`,   color: "#F5A623" },
            { label: "Fat",     val: `${macros.fat}g`,     color: "#FF6B35" },
          ].map(m => (
            <div key={m.label} style={{
              flex: 1, textAlign: "center",
              background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 4px",
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.val}</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── WelcomeScreen ─────────────────────────────────────────────────────────────
function WelcomeScreen({ name, onContinue }) {
  const [stars] = useState(() => Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    size: Math.random()*3+2, delay: Math.random(),
  })));
  useEffect(() => { const t = setTimeout(onContinue, 4000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "absolute", inset: 0, background: "linear-gradient(135deg,#0d1117,#1A1B1E)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 100, overflow: "hidden",
    }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "#FFD700", opacity: 0.5,
          animation: `twinkle 1.5s ${s.delay}s infinite alternate`,
        }} />
      ))}
      <div style={{ textAlign: "center", padding: 36, animation: "popIn .6s cubic-bezier(.34,1.56,.64,1) forwards" }}>
        <div style={{ fontSize: 76, marginBottom: 18, animation: "bounce 1s .6s infinite alternate" }}>🎉</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", marginBottom: 10 }}>Welcome to FitMe!</div>
        <div style={{ fontSize: 15, color: "#777", marginBottom: 24, lineHeight: 1.7 }}>
          Your journey starts now,<br/>
          <span style={{ color: "#4A90E2", fontWeight: 700 }}>{name}!</span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {["⭐","⭐","⭐"].map((s,i) => (
            <span key={i} style={{ fontSize: 26, animation: `starPop .4s ${.8+i*.15}s both` }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#333" }}>Taking you to your dashboard...</div>
      </div>
      <style>{`
        @keyframes popIn  { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
        @keyframes bounce { from{transform:translateY(0)}       to{transform:translateY(-10px)} }
        @keyframes twinkle{ from{opacity:.15}                   to{opacity:.8} }
        @keyframes starPop{ from{opacity:0;transform:scale(0)}  to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileSetupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showWelcome, setShowWelcome] = useState(false);

  const [fd, setFd] = useState({
    firstName: "", lastName: "",
    goal: "",
    weightLossGoal: "1", weightGainGoal: "0.5",
    mealPreference: "", activityLevel: "",
    height: "", weight: "", targetWeight: "",
    gender: "", age: "",
    workoutPlace: "", sports: [],
  });
  const upd = (k, v) => setFd(p => ({ ...p, [k]: v }));

  // Step order: 1→2→4→5→6→7→8(calories, always)→3(weight goal, conditional)
  const visibleSteps = (() => {
    const base = [1, 2, 4, 5, 6, 7, 8];
    if (fd.goal === "fat_loss" || fd.goal === "gain") base.push(3);
    return base;
  })();
  const stepIdx   = visibleSteps.indexOf(currentStep);
  const totalSteps = visibleSteps.length;
  const progress   = (stepIdx + 1) / totalSteps;
  const isLast     = stepIdx === totalSteps - 1;

  const handleNext = () => {
    if (stepIdx < totalSteps - 1) setCurrentStep(visibleSteps[stepIdx + 1]);
    else setShowWelcome(true);
  };
  const handleBack = () => {
    if (stepIdx > 0) setCurrentStep(visibleSteps[stepIdx - 1]);
  };

  // Derived calorie data
  const bmr          = calcBMR(fd.weight, fd.height, fd.age, fd.gender);
  const tdee         = calcTDEE(bmr, fd.activityLevel);
  const goalCals     = calcGoalCalories(tdee, fd.goal);
  const goalMacros   = calcMacros(goalCals, fd.goal);
  const maintMacros  = calcMacros(tdee, "maintain");
  const activityInfo = ACTIVITY_LEVELS.find(a => a.id === fd.activityLevel);

  const weightLossOpts = [
    { value: "0.5", label: "0.5 kg/week", subtitle: "Slow & Steady", icon: "🐢" },
    { value: "1",   label: "1 kg/week",   subtitle: "Recommended",   icon: "👍" },
    { value: "1.5", label: "1.5 kg/week", subtitle: "Aggressive",    icon: "🔥" },
  ];
  const weightGainOpts = [
    { value: "0.25", label: "0.25 kg/week", subtitle: "Lean Bulk",   icon: "🌱" },
    { value: "0.5",  label: "0.5 kg/week",  subtitle: "Recommended", icon: "👍" },
    { value: "0.75", label: "0.75 kg/week", subtitle: "Fast Bulk",   icon: "⚡" },
  ];

  const renderStep = () => {
    switch (currentStep) {

      case 1: return (
        <div style={sx.step}>
          <div style={sx.icon}>👤</div>
          <div style={sx.title}>What should we call you?</div>
          <input style={sx.input} placeholder="First Name" value={fd.firstName} onChange={e=>upd("firstName",e.target.value)}/>
          <input style={sx.input} placeholder="Last Name"  value={fd.lastName}  onChange={e=>upd("lastName",e.target.value)}/>
        </div>
      );

      case 2: return (
        <div style={sx.step}>
          <div style={sx.icon}>🎯</div>
          <div style={sx.title}>What's your goal?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {GOAL_OPTIONS.map(opt => (
              <button key={opt.id} onClick={()=>upd("goal",opt.id)} style={{
                ...sx.listItem,
                borderColor: fd.goal===opt.id ? opt.color : "#252830",
                background:  fd.goal===opt.id ? opt.color+"15" : "#1a1c24",
                cursor:"pointer", textAlign:"left",
              }}>
                <span style={{fontSize:30,marginRight:14}}>{opt.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color: fd.goal===opt.id ? opt.color:"#ddd", fontWeight:700,fontSize:15}}>{opt.label}</div>
                  <div style={{color:"#555",fontSize:12,marginTop:2}}>{opt.desc}</div>
                </div>
                {fd.goal===opt.id && <span style={{color:opt.color,fontSize:18}}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      );

      case 4: return (
        <div style={sx.step}>
          <div style={sx.icon}>🍽️</div>
          <div style={sx.title}>Meal Preference</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
            {MEAL_PREFERENCES.map(opt => (
              <button key={opt.id} onClick={()=>upd("mealPreference",opt.id)} style={{
                ...sx.chip,
                borderColor: fd.mealPreference===opt.id ? "#4A90E2":"#252830",
                background:  fd.mealPreference===opt.id ? "rgba(74,144,226,0.15)":"#1a1c24",
                cursor:"pointer",
              }}>
                <span style={{fontSize:20}}>{opt.icon}</span>
                <span style={{color: fd.mealPreference===opt.id?"#4A90E2":"#888",fontWeight:600,fontSize:13}}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      );

      case 5: return (
        <div style={sx.step}>
          <div style={sx.icon}>🏃</div>
          <div style={sx.title}>Activity Level</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ACTIVITY_LEVELS.map(opt => (
              <button key={opt.id} onClick={()=>upd("activityLevel",opt.id)} style={{
                ...sx.listItem,
                borderColor: fd.activityLevel===opt.id?"#4A90E2":"#252830",
                background:  fd.activityLevel===opt.id?"rgba(74,144,226,0.1)":"#1a1c24",
                cursor:"pointer",textAlign:"left",
              }}>
                <span style={{fontSize:22,marginRight:12}}>{opt.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color: fd.activityLevel===opt.id?"#4A90E2":"#ddd",fontWeight:600,fontSize:14}}>{opt.label}</div>
                  <div style={{color:"#555",fontSize:12}}>{opt.subtitle}</div>
                </div>
                {fd.activityLevel===opt.id && <span style={{color:"#4A90E2"}}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      );

      case 6: return (
        <div style={sx.step}>
          <div style={sx.icon}>📋</div>
          <div style={sx.title}>Personal Information</div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <div style={sx.label}>Height (cm)</div>
              <input style={sx.input} placeholder="170" type="number" value={fd.height} onChange={e=>upd("height",e.target.value)}/>
            </div>
            <div style={{flex:1}}>
              <div style={sx.label}>Weight (kg)</div>
              <input style={sx.input} placeholder="70"  type="number" value={fd.weight} onChange={e=>upd("weight",e.target.value)}/>
            </div>
          </div>
          <div style={sx.label}>Gender</div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            {["Male","Female","Other"].map(g=>(
              <button key={g} onClick={()=>upd("gender",g)} style={{
                flex:1,padding:"12px 0",borderRadius:10,cursor:"pointer",
                border:`1px solid ${fd.gender===g?"#4A90E2":"#252830"}`,
                background: fd.gender===g?"rgba(74,144,226,0.15)":"#1a1c24",
                color: fd.gender===g?"#4A90E2":"#666",fontWeight:600,fontSize:14,
              }}>{g}</button>
            ))}
          </div>
          <div style={sx.label}>Age</div>
          <input style={sx.input} placeholder="25" type="number" value={fd.age} onChange={e=>upd("age",e.target.value)}/>
        </div>
      );

      case 7: return (
        <div style={sx.step}>
          <div style={sx.icon}>💪</div>
          <div style={sx.title}>Workout Preference</div>
          <div style={{color:"#555",fontSize:12,marginBottom:12,textTransform:"uppercase",letterSpacing:0.5}}>Where do you prefer to workout?</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:24}}>
            {WORKOUT_PLACES.map(opt=>(
              <button key={opt.id} onClick={()=>upd("workoutPlace",opt.id)} style={{
                ...sx.chip,
                borderColor: fd.workoutPlace===opt.id?"#4A90E2":"#252830",
                background:  fd.workoutPlace===opt.id?"rgba(74,144,226,0.15)":"#1a1c24",
                cursor:"pointer",
              }}>
                <span style={{fontSize:20}}>{opt.icon}</span>
                <span style={{color:fd.workoutPlace===opt.id?"#4A90E2":"#777",fontWeight:600,fontSize:13}}>{opt.label}</span>
              </button>
            ))}
          </div>
          <div style={{color:"#555",fontSize:12,marginBottom:12,textTransform:"uppercase",letterSpacing:0.5}}>Sports you enjoy? <span style={{color:"#333"}}>(optional)</span></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {SPORTS.map(sport=>{
              const sel=fd.sports.includes(sport.id);
              return (
                <button key={sport.id} onClick={()=>{
                  const arr=sel?fd.sports.filter(x=>x!==sport.id):[...fd.sports,sport.id];
                  upd("sports",arr);
                }} style={{
                  display:"flex",alignItems:"center",gap:6,
                  background:sel?"#4A90E2":"#1a1c24",
                  border:`1px solid ${sel?"#4A90E2":"#252830"}`,
                  borderRadius:20,padding:"7px 13px",cursor:"pointer",
                }}>
                  <span style={{fontSize:14}}>{sport.icon}</span>
                  <span style={{color:sel?"#fff":"#666",fontSize:12,fontWeight:600}}>{sport.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );

      // ── Step 8: Calorie Summary ─────────────────────────────────────────
      case 8: {
        const canCalc = fd.weight && fd.height && fd.age && fd.activityLevel && fd.gender;
        const goalColor = fd.goal==="fat_loss"?"#FF6B35":fd.goal==="gain"?"#4CAF50":"#4A90E2";
        const goalLabel = fd.goal==="fat_loss"?"Fat Loss Target":fd.goal==="gain"?"Muscle Gain Target":"Maintenance";

        return (
          <div style={sx.step}>
            <div style={sx.icon}>🔥</div>
            <div style={sx.title}>Your Calorie Targets</div>

            {!canCalc ? (
              <div style={{
                background:"#1a1c24",border:"1px solid #252830",borderRadius:14,
                padding:20,textAlign:"center",color:"#555",fontSize:13,lineHeight:1.6,
              }}>
                ⚠️ Please complete your<br/>personal information first<br/>
                <span style={{color:"#333",fontSize:11}}>(height, weight, age, gender & activity)</span>
              </div>
            ) : (
              <>
                {/* BMR / TDEE pills */}
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {[
                    {label:"BMR",  val:`${Math.round(bmr)} kcal`,  tip:"Base Metabolic Rate — calories at rest"},
                    {label:"TDEE", val:`${tdee} kcal`,             tip:`Maintenance × ${activityInfo?.multiplier} (${activityInfo?.label})`},
                  ].map(item=>(
                    <div key={item.label} style={{
                      flex:1,background:"#1a1c24",border:"1px solid #252830",
                      borderRadius:12,padding:"11px 10px",textAlign:"center",
                    }}>
                      <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1}}>{item.label}</div>
                      <div style={{fontSize:18,fontWeight:900,color:"#999",margin:"4px 0"}}>{item.val}</div>
                      <div style={{fontSize:9,color:"#3a3d48",lineHeight:1.4}}>{item.tip}</div>
                    </div>
                  ))}
                </div>

                {/* Maintenance card */}
                <CalorieCard
                  label="Maintenance Calories"
                  calories={tdee}
                  accent="#4A90E2"
                  description="Calories to stay at your current weight with no change"
                  macros={fd.goal==="maintain" ? maintMacros : null}
                  isHighlight={fd.goal==="maintain"}
                />

                {/* Goal calories card */}
                {fd.goal!=="maintain" && (
                  <CalorieCard
                    label={goalLabel}
                    calories={goalCals}
                    accent={goalColor}
                    description={
                      fd.goal==="fat_loss"
                        ? `Maintenance − 500 kcal · creates a safe caloric deficit`
                        : `Maintenance + 300 kcal · lean surplus for muscle growth`
                    }
                    macros={goalMacros}
                    isHighlight={true}
                  />
                )}

                {/* Diff callout */}
                {fd.goal!=="maintain" && (
                  <div style={{
                    display:"flex",alignItems:"center",gap:10,
                    background: goalColor+"10",border:`1px solid ${goalColor}28`,
                    borderRadius:12,padding:"12px 14px",
                  }}>
                    <span style={{fontSize:18}}>{fd.goal==="fat_loss"?"📉":"📈"}</span>
                    <div>
                      <div style={{fontSize:12,color:goalColor,fontWeight:700,marginBottom:2}}>
                        {fd.goal==="fat_loss" ? "500 kcal daily deficit" : "300 kcal daily surplus"}
                      </div>
                      <div style={{fontSize:11,color:"#444"}}>
                        {fd.goal==="fat_loss"
                          ? "Safe pace · ~0.5 kg loss per week on average"
                          : "Lean bulk · minimises fat gain while building muscle"}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      }

      // ── Step 3: Weight goal + journey (conditional, always last) ──────────
      case 3: {
        const isLoss   = fd.goal==="fat_loss";
        const opts     = isLoss ? weightLossOpts : weightGainOpts;
        const rateKey  = isLoss ? "weightLossGoal" : "weightGainGoal";
        const selRate  = fd[rateKey];
        const accent   = isLoss ? "#FF6B35" : "#4CAF50";

        return (
          <div style={sx.step}>
            <div style={sx.icon}>⚖️</div>
            <div style={sx.title}>{isLoss?"Weight Loss Goal":"Weight Gain Goal"}</div>
            <div style={{color:"#555",fontSize:13,marginBottom:18,textAlign:"center"}}>
              How fast do you want to {isLoss?"lose":"gain"} weight?
            </div>

            <div style={{display:"flex",gap:8,marginBottom:22}}>
              {opts.map(opt=>(
                <button key={opt.value} onClick={()=>upd(rateKey,opt.value)} style={{
                  flex:1,
                  background: selRate===opt.value ? accent+"18":"#1a1c24",
                  border:`2px solid ${selRate===opt.value?accent:"#252830"}`,
                  borderRadius:14,padding:"13px 6px",cursor:"pointer",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:5,
                }}>
                  <span style={{fontSize:22}}>{opt.icon}</span>
                  <span style={{color:selRate===opt.value?accent:"#bbb",fontWeight:700,fontSize:12}}>{opt.label}</span>
                  <span style={{color:selRate===opt.value?accent:"#444",fontSize:10}}>{opt.subtitle}</span>
                </button>
              ))}
            </div>

            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <div style={{flex:1}}>
                <div style={sx.label}>Current Weight (kg)</div>
                <input style={sx.input} placeholder="e.g. 80" type="number"
                  value={fd.weight} onChange={e=>upd("weight",e.target.value)}/>
              </div>
              <div style={{flex:1}}>
                <div style={sx.label}>Target Weight (kg)</div>
                <input style={sx.input} placeholder={isLoss?"e.g. 70":"e.g. 85"} type="number"
                  value={fd.targetWeight} onChange={e=>upd("targetWeight",e.target.value)}/>
              </div>
            </div>

            <div style={{background:"#1a1c24",borderRadius:16,padding:14,border:`1px solid ${accent}22`}}>
              <div style={{color:"#aaa",fontWeight:700,fontSize:12,marginBottom:12}}>📊 Your Weight Journey</div>
              <WeightJourneyGraph
                currentWeight={fd.weight}
                targetWeight={fd.targetWeight}
                goal={fd.goal}
                weightGoalRate={selRate}
              />
            </div>
          </div>
        );
      }

      default: return null;
    }
  };

  return (
    <div style={{
      display:"flex",justifyContent:"center",alignItems:"flex-start",
      minHeight:"100vh",background:"#0a0b0f",padding:"20px 0",
      fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif",
    }}>
      <div style={{
        width:390,background:"#13151a",borderRadius:44,
        boxShadow:"0 40px 80px rgba(0,0,0,0.8),0 0 0 1px #1e2028",
        overflow:"hidden",position:"relative",minHeight:760,
        display:"flex",flexDirection:"column",
      }}>
        {/* Header */}
        <div style={{
          background:"linear-gradient(160deg,#111827,#0d1117)",
          borderBottom:"1px solid #1a1e28",
          padding:"50px 18px 16px",
          display:"flex",alignItems:"center",gap:12,
        }}>
          <button onClick={handleBack} style={{
            width:34,height:34,borderRadius:9,
            border:`1px solid ${stepIdx>0?"#1e2a3a":"transparent"}`,
            background:stepIdx>0?"#141c28":"transparent",
            cursor:stepIdx>0?"pointer":"default",
            color:stepIdx>0?"#5a7fa8":"transparent",fontSize:16,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>←</button>
          <div style={{flex:1}}>
            <div style={{height:5,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden",marginBottom:5}}>
              <div style={{
                height:"100%",borderRadius:3,
                background:"linear-gradient(90deg,#4A90E2,#64b3f4)",
                width:`${progress*100}%`,transition:"width 0.4s ease",
              }}/>
            </div>
            <div style={{color:"#364a5f",fontSize:11,textAlign:"center",fontWeight:600}}>
              Step {stepIdx+1} of {totalSteps}
            </div>
          </div>
          <div style={{width:34}}/>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 18px 0"}}>
          {renderStep()}
        </div>

        {/* Footer */}
        <div style={{padding:"14px 18px 28px"}}>
          <button onClick={handleNext} style={{
            width:"100%",padding:"16px",borderRadius:14,border:"none",
            background:"linear-gradient(135deg,#4A90E2,#2d68c4)",
            color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:"0 8px 24px rgba(74,144,226,0.25)",
          }}>
            {isLast?"Complete Setup 🎉":"Continue →"}
          </button>
        </div>

        {showWelcome && (
          <WelcomeScreen name={fd.firstName||"there"} onContinue={()=>setShowWelcome(false)}/>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box;}
        input:focus{outline:none;border-color:#4A90E2!important;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#13151a;}
        ::-webkit-scrollbar-thumb{background:#252830;border-radius:2px;}
      `}</style>
    </div>
  );
}

const sx = {
  step:  {minHeight:420,paddingBottom:20},
  icon:  {fontSize:52,textAlign:"center",marginBottom:10},
  title: {fontSize:23,fontWeight:800,color:"#e0e2ec",textAlign:"center",marginBottom:22,letterSpacing:-.5},
  input: {
    width:"100%",background:"#1a1c24",border:"1px solid #252830",
    borderRadius:11,padding:"13px 14px",fontSize:15,color:"#d8dae8",
    marginBottom:14,display:"block",
  },
  label: {color:"#444",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.6},
  listItem:{
    width:"100%",display:"flex",alignItems:"center",
    borderRadius:12,padding:"13px 14px",border:"1px solid #252830",background:"#1a1c24",
  },
  chip:{
    display:"flex",alignItems:"center",gap:8,
    borderRadius:12,padding:"11px 14px",
    border:"1px solid #252830",background:"#1a1c24",
  },
};
