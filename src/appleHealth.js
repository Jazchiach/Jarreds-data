*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --green: #4ade80; --green-soft: rgba(74,222,128,0.12); --green-border: rgba(74,222,128,0.2);
  --amber: #fbbf24; --amber-bg: rgba(251,191,36,0.12); --amber-border: rgba(251,191,36,0.2);
  --red: #f87171; --red-bg: rgba(248,113,113,0.12); --red-border: rgba(248,113,113,0.2);
  --blue: #60a5fa; --blue-bg: rgba(96,165,250,0.12); --blue-border: rgba(96,165,250,0.2);
  --purple: #a78bfa; --purple-bg: rgba(167,139,250,0.12);
  --bg: #0a0f0a; --bg2: #111611; --bg3: #161d16; --bg4: #1c251c;
  --border: rgba(74,222,128,0.08); --border2: rgba(74,222,128,0.14);
  --text: #e8f5e8; --text2: #9ab59a; --text3: #5a755a;
  --r: 10px; --rl: 14px;
  --fd: 'DM Serif Display', Georgia, serif;
  --fb: 'DM Sans', system-ui, sans-serif;
}
body { background: var(--bg); color: var(--text); font-family: var(--fb); font-size: 14px; line-height: 1.6; min-height: 100vh; -webkit-font-smoothing: antialiased; }

/* HEADER */
.app-header { border-bottom: 0.5px solid var(--border2); background: var(--bg); position: sticky; top: 0; z-index: 50; }
.header-inner { max-width: 900px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
.logo { font-family: var(--fd); font-size: 18px; color: var(--text); display: flex; align-items: center; gap: 8px; }
.header-pills { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pill { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text2); background: var(--bg3); border: 0.5px solid var(--border2); padding: 4px 10px; border-radius: 20px; }
.pill-dot { width: 5px; height: 5px; border-radius: 50%; }
.dot-green { background: var(--green); box-shadow: 0 0 6px var(--green); }
.dot-amber { background: var(--amber); }
.dot-gray { background: var(--text3); }
.date-label { font-size: 12px; color: var(--text3); }

/* NAV */
.app-nav { border-bottom: 0.5px solid var(--border); background: var(--bg); }
.nav-inner { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; gap: 2px; overflow-x: auto; }
.nav-tab { font-family: var(--fb); font-size: 13px; color: var(--text3); background: transparent; border: none; cursor: pointer; padding: 12px 16px; border-bottom: 2px solid transparent; transition: all .15s; white-space: nowrap; }
.nav-tab:hover { color: var(--text2); }
.nav-tab.active { color: var(--green); border-bottom-color: var(--green); }

/* MAIN */
.app-main { max-width: 900px; margin: 0 auto; padding: 28px 24px 80px; }

/* SECTION LABEL */
.sl { font-size: 10px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; }

/* CARDS */
.card { background: var(--bg2); border: 0.5px solid var(--border2); border-radius: var(--rl); padding: 20px; margin-bottom: 16px; }
.card-inner { background: var(--bg3); border: 0.5px solid var(--border); border-radius: var(--r); padding: 14px 16px; }

/* METRICS */
.mg4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
.mg3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.mc { background: var(--bg3); border: 0.5px solid var(--border); border-radius: var(--r); padding: 14px 16px; }
.ml { font-size: 10px; color: var(--text3); margin-bottom: 4px; text-transform: uppercase; letter-spacing: .06em; }
.mv { font-family: var(--fd); font-size: 26px; color: var(--text); line-height: 1.1; }
.ms { font-size: 11px; color: var(--text3); margin-top: 2px; }
.mdu { color: var(--green); font-size: 11px; }
.mdd { color: var(--red); font-size: 11px; }

/* READINESS */
.rc { background: var(--bg2); border: 0.5px solid var(--border2); border-radius: var(--rl); padding: 20px; margin-bottom: 16px; display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: center; }
.rt { font-family: var(--fd); font-size: 22px; color: var(--text); margin-bottom: 6px; line-height: 1.2; }
.rd { font-size: 13px; color: var(--text2); margin-bottom: 10px; line-height: 1.5; }

/* BADGES */
.badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; margin-right: 4px; margin-bottom: 4px; }
.bg { background: var(--green-soft); color: var(--green); border: 0.5px solid var(--green-border); }
.ba { background: var(--amber-bg); color: var(--amber); border: 0.5px solid var(--amber-border); }
.br { background: var(--red-bg); color: var(--red); border: 0.5px solid var(--red-border); }
.bb { background: var(--blue-bg); color: var(--blue); border: 0.5px solid var(--blue-border); }
.bp { background: var(--purple-bg); color: var(--purple); border: 0.5px solid rgba(167,139,250,0.2); }

/* RISK FACTORS */
.rfr { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 0.5px solid var(--border); font-size: 13px; }
.rfr:last-child { border-bottom: none; }
.rfl { color: var(--text2); }
.rok { color: var(--green); font-size: 12px; }
.rmo { color: var(--amber); font-size: 12px; }
.rhi { color: var(--red); font-size: 12px; }

/* AI BRIEF */
.bi { display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 0.5px solid var(--border); }
.bi:last-child { border-bottom: none; }
.bic { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; background: var(--bg4); }
.btl { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
.bbd { font-size: 12px; color: var(--text2); line-height: 1.6; }

/* LOG */
.lr { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 0.5px solid var(--border); gap: 12px; }
.lr:last-child { border-bottom: none; }
.ll { font-size: 13px; color: var(--text2); flex-shrink: 0; max-width: 200px; }
.lo { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.lb { font-size: 11px; font-family: var(--fb); padding: 5px 12px; border: 0.5px solid var(--border2); border-radius: 20px; background: transparent; color: var(--text3); cursor: pointer; transition: all .12s; white-space: nowrap; }
.lb:hover { color: var(--text2); }
.lb.sel { background: var(--green-soft); color: var(--green); border-color: var(--green-border); }

/* BUTTONS */
.btn-p { width: 100%; padding: 12px; border: 0.5px solid var(--border2); border-radius: var(--r); background: var(--green-soft); color: var(--green); font-family: var(--fb); font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; margin-top: 16px; }
.btn-p:hover { background: rgba(74,222,128,0.18); }
.btn-sm { font-size: 11px; font-family: var(--fb); padding: 6px 14px; border: 0.5px solid var(--border2); border-radius: 20px; background: transparent; color: var(--green); cursor: pointer; white-space: nowrap; flex-shrink: 0; }
.btn-sm:hover { background: var(--green-soft); }

/* BARS */
.bt { height: 5px; background: var(--bg4); border-radius: 3px; overflow: hidden; margin: 5px 0 10px; }
.bf { height: 100%; border-radius: 3px; transition: width .6s ease; }
.tmb { display: flex; align-items: flex-end; gap: 2px; height: 56px; }
.tbar { flex: 1; border-radius: 2px 2px 0 0; min-width: 2px; }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }

/* INSIGHT BOX */
.ib { background: rgba(74,222,128,0.04); border: 0.5px solid rgba(74,222,128,0.15); border-radius: var(--r); padding: 14px 16px; font-size: 12px; color: var(--text2); line-height: 1.7; margin-top: 12px; }

/* SETUP CARD */
.setup-card { background: var(--bg3); border: 0.5px solid var(--amber-border); border-radius: var(--rl); padding: 20px; margin-bottom: 16px; }
.setup-card h3 { font-family: var(--fd); font-size: 16px; color: var(--amber); margin-bottom: 8px; }
.setup-step { display: flex; gap: 12px; align-items: flex-start; padding: 8px 0; border-bottom: 0.5px solid var(--border); font-size: 13px; color: var(--text2); line-height: 1.6; }
.setup-step:last-child { border-bottom: none; }
.step-num { width: 22px; height: 22px; border-radius: 50%; background: var(--amber-bg); color: var(--amber); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; flex-shrink: 0; margin-top: 1px; }
.api-input { width: 100%; padding: 10px 14px; background: var(--bg2); border: 0.5px solid var(--border2); border-radius: var(--r); color: var(--text); font-family: var(--fb); font-size: 13px; outline: none; margin: 8px 0; }
.api-input:focus { border-color: var(--green-border); }
.connected-badge { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--green-soft); border: 0.5px solid var(--green-border); border-radius: var(--r); font-size: 13px; color: var(--green); margin-top: 8px; }

/* STRAVA ACTIVITY */
.activity-card { background: var(--bg3); border: 0.5px solid var(--border); border-radius: var(--r); padding: 12px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
.activity-name { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
.activity-meta { font-size: 11px; color: var(--text3); }

/* HEADACHE EVENT */
.hae { background: var(--bg3); border: 0.5px solid var(--border); border-radius: var(--r); padding: 12px 14px; margin-bottom: 8px; }

@media (max-width: 640px) {
  .mg4 { grid-template-columns: repeat(2, 1fr); }
  .mg3 { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
  .rc { grid-template-columns: 1fr; }
  .app-main { padding: 20px 16px 80px; }
  .header-pills .date-label { display: none; }
}
