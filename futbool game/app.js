/* ═══════════════════════════════════════════
   SOCCER LEAGUE PRO – app.js
═══════════════════════════════════════════ */

// ─── DATA STORE ────────────────────────────
const DB = {
  get: (k)    => JSON.parse(localStorage.getItem('slp_' + k) || 'null'),
  set: (k, v) => localStorage.setItem('slp_' + k, JSON.stringify(v)),
};

// Default admin account
let users = DB.get('users') || [
  { username: 'admin', password: 'admin123', role: 'admin', email: 'admin@league.com' }
];
users = users.map(user => user.username.toLowerCase() === 'yahrty'
  ? { ...user, role: 'user' }
  : user);
DB.set('users', users);
let currentUser = DB.get('currentUser') || null;
if (currentUser && currentUser.username.toLowerCase() === 'yahrty') {
  currentUser = { ...currentUser, role: 'user' };
  DB.set('currentUser', currentUser);
}
let teams   = DB.get('teams')   || [];
let matches = DB.get('matches') || [];

function saveAll() {
  DB.set('users', users);
  DB.set('teams', teams);
  DB.set('matches', matches);
}
function saveUser() { DB.set('currentUser', currentUser); }

// ─── AUTH ───────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.textContent.toLowerCase().includes(tab === 'login' ? 'sign' : 'reg'))
      b.classList.add('active');
  });
  document.getElementById('login-error').textContent = '';
}

function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  const found = users.find(x => x.username === u && x.password === p);
  if (!found) { err.textContent = '❌ Invalid username or password.'; return; }
  currentUser = found;
  saveUser();
  enterApp();
}

function doRegister() {
  const u = document.getElementById('reg-user').value.trim();
  const e = document.getElementById('reg-email').value.trim();
  const p = document.getElementById('reg-pass').value;
  const err = document.getElementById('login-error');
  if (!u || !p) { err.textContent = '❌ Please fill in all fields.'; return; }
  if (users.find(x => x.username === u)) { err.textContent = '❌ Username already taken.'; return; }
  const newUser = { username: u, password: p, email: e, role: 'user' };
  users.push(newUser);
  saveAll();
  currentUser = newUser;
  saveUser();
  toast('✅ Welcome, ' + u + '!');
  enterApp();
}

function doLogout() {
  currentUser = null;
  DB.set('currentUser', null);
  document.getElementById('page-login').classList.add('active');
  document.getElementById('page-app').classList.remove('active');
}

function enterApp() {
  document.getElementById('page-login').classList.remove('active');
  document.getElementById('page-app').classList.add('active');
  document.getElementById('nav-username').textContent = '👤 ' + currentUser.username;
  const adminNav = document.getElementById('nav-admin');
  adminNav.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
  showSection('home');
  renderAll();
}

// Auto-login if session exists
window.addEventListener('DOMContentLoaded', () => {
  if (currentUser) enterApp();
  // seed demo data if empty
  if (teams.length === 0) seedDemoData();
});

// ─── SEED DEMO DATA ─────────────────────────
function seedDemoData() {
  teams = [
    { id: uid(), name: 'FC United',    color: '#00d4ff', logo: '' },
    { id: uid(), name: 'Red Dragons',  color: '#ff4757', logo: '' },
    { id: uid(), name: 'Golden Stars', color: '#ffd700', logo: '' },
    { id: uid(), name: 'Green Bulls',  color: '#00ff88', logo: '' },
  ];
  const now = Date.now();
  const day = 86400000;
  matches = [
    { id: uid(), home: teams[0].id, away: teams[1].id, date: new Date(now - 3*day).toISOString(), stadium: 'City Arena',  matchday: 'Round 1', homeGoals: 3, awayGoals: 1, status: 'FT', scorers: 'Johnson 12\', Smith 34\', Brown 67\'' },
    { id: uid(), home: teams[2].id, away: teams[3].id, date: new Date(now - 3*day).toISOString(), stadium: 'Gold Stadium', matchday: 'Round 1', homeGoals: 1, awayGoals: 1, status: 'FT', scorers: 'King 20\'' },
    { id: uid(), home: teams[0].id, away: teams[2].id, date: new Date(now - 1*day).toISOString(), stadium: 'City Arena',  matchday: 'Round 2', homeGoals: 2, awayGoals: 0, status: 'FT', scorers: 'Johnson 55\', 78\'' },
    { id: uid(), home: teams[1].id, away: teams[3].id, date: new Date(now + 2*day).toISOString(), stadium: 'Dragon Park', matchday: 'Round 2', homeGoals: null, awayGoals: null, status: 'UP', scorers: '' },
    { id: uid(), home: teams[2].id, away: teams[1].id, date: new Date(now + 5*day).toISOString(), stadium: 'Gold Stadium', matchday: 'Round 3', homeGoals: null, awayGoals: null, status: 'UP', scorers: '' },
    { id: uid(), home: teams[3].id, away: teams[0].id, date: new Date(now + 7*day).toISOString(), stadium: 'Green Dome',  matchday: 'Round 3', homeGoals: null, awayGoals: null, status: 'UP', scorers: '' },
  ];
  saveAll();
}

// ─── HELPERS ────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function getTeam(id) { return teams.find(t => t.id === id); }

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
       + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function teamLogoHTML(team, size = 'sm') {
  if (team && team.logo) {
    return `<img src="${team.logo}" class="team-logo-${size}" alt="${team.name}" />`;
  }
  const color = team ? team.color : '#00d4ff';
  const emoji = '⚽';
  return `<div class="team-color-${size}" style="background:${color}22;border-color:${color}55">${emoji}</div>`;
}

// ─── STANDINGS CALC ──────────────────────────
function calcStandings() {
  const table = {};
  teams.forEach(t => {
    table[t.id] = { id: t.id, P:0, W:0, D:0, L:0, GF:0, GA:0, GD:0, Pts:0, form:[] };
  });
  const sorted_m = [...matches].filter(m => m.status === 'FT').sort((a,b) => new Date(a.date) - new Date(b.date));
  sorted_m.forEach(m => {
    if (m.homeGoals === null) return;
    const h = table[m.home], a = table[m.away];
    if (!h || !a) return;
    h.P++; a.P++;
    h.GF += m.homeGoals; h.GA += m.awayGoals;
    a.GF += m.awayGoals; a.GA += m.homeGoals;
    if (m.homeGoals > m.awayGoals)      { h.W++; h.Pts+=3; h.form.push('W'); a.L++; a.form.push('L'); }
    else if (m.homeGoals < m.awayGoals) { a.W++; a.Pts+=3; a.form.push('W'); h.L++; h.form.push('L'); }
    else                                { h.D++; a.D++; h.Pts++; a.Pts++; h.form.push('D'); a.form.push('D'); }
  });
  Object.values(table).forEach(r => { r.GD = r.GF - r.GA; });
  return Object.values(table).sort((a,b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF);
}

// ─── RENDER ─────────────────────────────────
function renderAll() {
  renderStandings();
  renderSchedule();
  renderTeams();
  renderHome();
  if (currentUser && currentUser.role === 'admin') renderAdmin();
}

// ── STANDINGS ──
function renderStandings() {
  const rows = calcStandings();
  const tbody = document.getElementById('standings-body');
  tbody.innerHTML = '';
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11"><div class="empty-state"><i class="fa fa-table"></i>No teams yet. Admin can add teams.</div></td></tr>';
    return;
  }
  rows.forEach((r, i) => {
    const team = getTeam(r.id);
    if (!team) return;
    const pos = i + 1;
    const posCls = pos === 1 ? 'pos-1' : pos === 2 ? 'pos-2' : pos === 3 ? 'pos-3' : 'pos-other';
    const formHtml = r.form.slice(-5).map(f => `<span class="form-badge form-${f}">${f}</span>`).join('');
    tbody.innerHTML += `
      <tr>
        <td><span class="pos-badge ${posCls}">${pos}</span></td>
        <td>
          <div class="team-cell">
            ${teamLogoHTML(team, 'sm')}
            <span class="team-name-sm">${team.name}</span>
          </div>
        </td>
        <td>${r.P}</td><td>${r.W}</td><td>${r.D}</td><td>${r.L}</td>
        <td>${r.GF}</td><td>${r.GA}</td>
        <td style="color:${r.GD>=0?'var(--green)':'var(--red)'}">${r.GD>0?'+':''}${r.GD}</td>
        <td class="pts-cell">${r.Pts}</td>
        <td><div class="form-row">${formHtml}</div></td>
      </tr>`;
  });
}

// ── SCHEDULE ──
function renderSchedule() {
  const container = document.getElementById('schedule-list');
  if (matches.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fa fa-calendar"></i>No matches scheduled yet.</div>';
    return;
  }
  const groups = {};
  [...matches].sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(m => {
    const day = m.matchday || 'Unassigned';
    if (!groups[day]) groups[day] = [];
    groups[day].push(m);
  });
  container.innerHTML = '';
  Object.entries(groups).forEach(([day, ms]) => {
    let html = `<div class="matchday-group">
      <div class="matchday-title"><i class="fa fa-calendar-day"></i> ${day}</div>`;
    ms.forEach(m => {
      const h = getTeam(m.home), a = getTeam(m.away);
      if (!h || !a) return;
      const score = m.status === 'FT'
        ? `<div class="match-score">${m.homeGoals} – ${m.awayGoals}</div>`
        : `<div class="match-score" style="color:rgba(255,255,255,.4)">vs</div>`;
      const badge = `<span class="status-badge status-${m.status}">${m.status === 'FT' ? '⚽ FT' : m.status === 'LIVE' ? '🔴 LIVE' : '🕐 Soon'}</span>`;
      const scorers = m.scorers ? `<div class="scorers-row">⚽ ${m.scorers}</div>` : '';
      html += `
        <div class="match-card">
          <div class="match-team home">
            ${teamLogoHTML(h, 'team')}
            <span class="match-team-name">${h.name}</span>
          </div>
          <div class="match-center">
            ${score}
            <div class="match-time-info">${m.stadium || ''}</div>
            <div class="match-date-display">${formatDate(m.date)}</div>
            ${badge}
          </div>
          <div class="match-team away">
            ${teamLogoHTML(a, 'team')}
            <span class="match-team-name">${a.name}</span>
          </div>
          ${scorers}
        </div>`;
    });
    html += '</div>';
    container.innerHTML += html;
  });
}

// ── TEAMS ──
function renderTeams() {
  const grid = document.getElementById('teams-grid');
  if (teams.length === 0) {
    grid.innerHTML = '<div class="empty-state"><i class="fa fa-shield-halved"></i>No teams yet.</div>';
    return;
  }
  const standings = calcStandings();
  grid.innerHTML = '';
  teams.forEach(t => {
    const s = standings.find(x => x.id === t.id) || { P:0, W:0, Pts:0 };
    const pos = standings.findIndex(x => x.id === t.id) + 1;
    const logo = t.logo
      ? `<img src="${t.logo}" class="team-logo-lg" alt="${t.name}"/>`
      : `<div class="team-color-lg" style="background:${t.color}22;border-color:${t.color}55">⚽</div>`;
    grid.innerHTML += `
      <div class="team-card card-3d" style="border-color:${t.color}33">
        <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${t.color};border-radius:20px 20px 0 0"></div>
        ${logo}
        <div class="team-card-name">${t.name}</div>
        <div class="team-card-stats">
          <div class="team-card-stat"><strong>${pos || '–'}</strong><span>Rank</span></div>
          <div class="team-card-stat"><strong>${s.Pts}</strong><span>Pts</span></div>
          <div class="team-card-stat"><strong>${s.W}</strong><span>Wins</span></div>
          <div class="team-card-stat"><strong>${s.P}</strong><span>Played</span></div>
        </div>
      </div>`;
  });
}

// ── HOME ──
function renderHome() {
  // Stats
  const finished = matches.filter(m => m.status === 'FT');
  const totalGoals = finished.reduce((acc, m) => acc + (m.homeGoals||0) + (m.awayGoals||0), 0);
  document.getElementById('hero-stats').innerHTML = `
    <div class="hero-stat"><div class="hero-stat-num">${teams.length}</div><div class="hero-stat-label">TEAMS</div></div>
    <div class="hero-stat"><div class="hero-stat-num">${matches.length}</div><div class="hero-stat-label">MATCHES</div></div>
    <div class="hero-stat"><div class="hero-stat-num">${totalGoals}</div><div class="hero-stat-label">GOALS</div></div>
    <div class="hero-stat"><div class="hero-stat-num">${finished.length}</div><div class="hero-stat-label">PLAYED</div></div>`;

  // Latest results
  const results = [...matches].filter(m => m.status === 'FT')
    .sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,4);
  const latestEl = document.getElementById('latest-results');
  if (results.length === 0) {
    latestEl.innerHTML = '<div class="empty-state"><i class="fa fa-futbol"></i>No results yet.</div>';
  } else {
    latestEl.innerHTML = results.map(m => {
      const h = getTeam(m.home), a = getTeam(m.away);
      if (!h || !a) return '';
      return `<div class="result-row">
        ${teamLogoHTML(h,'sm')}
        <span style="flex:1;font-size:.85rem">${h.name}</span>
        <span class="result-score">${m.homeGoals}–${m.awayGoals}</span>
        <span style="flex:1;text-align:right;font-size:.85rem">${a.name}</span>
        ${teamLogoHTML(a,'sm')}
      </div>`;
    }).join('');
  }

  // Top of table
  const top = calcStandings().slice(0, 4);
  const topEl = document.getElementById('top-table');
  if (top.length === 0) {
    topEl.innerHTML = '<div class="empty-state"><i class="fa fa-crown"></i>No data yet.</div>';
  } else {
    topEl.innerHTML = top.map((r,i) => {
      const team = getTeam(r.id);
      if (!team) return '';
      return `<div class="top-row">
        <span class="top-pos">${i+1}</span>
        ${teamLogoHTML(team,'sm')}
        <span style="flex:1;font-size:.9rem">${team.name}</span>
        <span style="font-family:'Orbitron',monospace;font-size:.9rem;color:var(--green)">${r.Pts}pts</span>
      </div>`;
    }).join('');
  }

  // Upcoming
  const upcoming = [...matches].filter(m => m.status === 'UP')
    .sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0,3);
  const upEl = document.getElementById('upcoming-matches');
  if (upcoming.length === 0) {
    upEl.innerHTML = '<div class="empty-state"><i class="fa fa-clock"></i>No upcoming matches.</div>';
  } else {
    upEl.innerHTML = upcoming.map(m => {
      const h = getTeam(m.home), a = getTeam(m.away);
      if (!h || !a) return '';
      return `<div class="upcoming-row">
        <span style="font-size:.8rem;color:rgba(255,255,255,.5);min-width:90px">${formatDate(m.date)}</span>
        <span style="flex:1;font-size:.9rem;font-weight:600">${h.name} <span style="color:rgba(255,255,255,.4)">vs</span> ${a.name}</span>
      </div>`;
    }).join('');
  }
}

// ── ADMIN ──
function renderAdmin() {
  // Team selects
  const opts = `<option value="">-- Select Team --</option>` +
    teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  document.getElementById('a-home').innerHTML = opts;
  document.getElementById('a-away').innerHTML = opts;

  // Result match select (only played/upcoming)
  const matchOpts = `<option value="">-- Select Match --</option>` +
    [...matches].sort((a,b) => new Date(a.date)-new Date(b.date))
    .map(m => {
      const h = getTeam(m.home), a = getTeam(m.away);
      if (!h || !a) return '';
      const label = `${h.name} vs ${a.name}  [${m.matchday || ''}]  ${m.status === 'FT' ? '✅' : '⏳'}`;
      return `<option value="${m.id}">${label}</option>`;
    }).join('');
  document.getElementById('a-result-match').innerHTML = matchOpts;
  document.getElementById('a-delete-match').innerHTML = matchOpts;

  // Team list
  const listEl = document.getElementById('team-list-admin');
  listEl.innerHTML = teams.map(t => `
    <div class="team-admin-row">
      ${teamLogoHTML(t,'sm')}
      <span style="flex:1">${t.name}</span>
      <button class="del-btn" onclick="deleteTeam('${t.id}')"><i class="fa fa-trash"></i></button>
    </div>`).join('');
}

// ─── NAV ────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  renderAll();
}

// ─── ADMIN ACTIONS ───────────────────────────
let logoDataUrl = '';

function previewLogo(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    logoDataUrl = ev.target.result;
    const prev = document.getElementById('logo-preview');
    prev.src = logoDataUrl;
    prev.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function addTeam() {
  const name  = document.getElementById('a-team-name').value.trim();
  const color = document.getElementById('a-team-color').value;
  if (!name) { toast('❌ Enter a team name'); return; }
  if (teams.find(t => t.name.toLowerCase() === name.toLowerCase())) {
    toast('❌ Team already exists'); return;
  }
  teams.push({ id: uid(), name, color, logo: logoDataUrl });
  logoDataUrl = '';
  document.getElementById('a-team-name').value = '';
  document.getElementById('logo-preview').style.display = 'none';
  document.getElementById('a-team-logo').value = '';
  saveAll();
  renderAll();
  toast('✅ Team "' + name + '" added!');
}

function deleteTeam(id) {
  if (!confirm('Delete this team? All their matches will also be removed.')) return;
  teams = teams.filter(t => t.id !== id);
  matches = matches.filter(m => m.home !== id && m.away !== id);
  saveAll(); renderAll();
  toast('🗑️ Team deleted');
}

function scheduleMatch() {
  const home = document.getElementById('a-home').value;
  const away = document.getElementById('a-away').value;
  const date = document.getElementById('a-match-date').value;
  const stadium = document.getElementById('a-stadium').value.trim();
  const matchday = document.getElementById('a-matchday').value.trim();
  if (!home || !away) { toast('❌ Select both teams'); return; }
  if (home === away)  { toast('❌ Teams must be different'); return; }
  if (!date)          { toast('❌ Select a date & time'); return; }
  matches.push({ id: uid(), home, away, date: new Date(date).toISOString(), stadium, matchday, homeGoals: null, awayGoals: null, status: 'UP', scorers: '' });
  saveAll(); renderAll();
  toast('✅ Match scheduled!');
  document.getElementById('a-home').value = '';
  document.getElementById('a-away').value = '';
  document.getElementById('a-match-date').value = '';
  document.getElementById('a-stadium').value = '';
  document.getElementById('a-matchday').value = '';
}

function prefillResult() {
  const id = document.getElementById('a-result-match').value;
  const m = matches.find(x => x.id === id);
  if (!m) return;
  document.getElementById('a-home-goals').value = m.homeGoals ?? '';
  document.getElementById('a-away-goals').value = m.awayGoals ?? '';
  document.getElementById('a-scorers').value = m.scorers || '';
}

function updateResult() {
  const id = document.getElementById('a-result-match').value;
  const hg = document.getElementById('a-home-goals').value;
  const ag = document.getElementById('a-away-goals').value;
  const scorers = document.getElementById('a-scorers').value.trim();
  if (!id)       { toast('❌ Select a match'); return; }
  if (hg === '' || ag === '') { toast('❌ Enter both goal counts'); return; }
  const m = matches.find(x => x.id === id);
  if (!m) return;
  m.homeGoals = parseInt(hg);
  m.awayGoals = parseInt(ag);
  m.scorers   = scorers;
  m.status    = 'FT';
  saveAll(); renderAll();
  toast('✅ Result updated!');
}

function deleteMatch() {
  const id = document.getElementById('a-delete-match').value;
  if (!id) { toast('❌ Select a match'); return; }
  if (!confirm('Delete this match?')) return;
  matches = matches.filter(m => m.id !== id);
  saveAll(); renderAll();
  toast('🗑️ Match deleted');
}

// ─── SHARE ───────────────────────────────────
function shareApp() {
  const modal = document.getElementById('share-modal');
  modal.classList.add('open');
  const url = window.location.href.split('?')[0];
  document.getElementById('share-url').value = url;
  const text = encodeURIComponent('⚽ Follow our Soccer League live! Check standings, schedule & results here: ' + url);
  document.getElementById('share-wa').href = `https://wa.me/?text=${text}`;
  document.getElementById('share-tg').href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('⚽ Follow our Soccer League live!')}`;
}

function closeShareModal() {
  document.getElementById('share-modal').classList.remove('open');
}

function copyShareUrl() {
  const inp = document.getElementById('share-url');
  inp.select();
  document.execCommand('copy');
  toast('📋 Link copied!');
}
