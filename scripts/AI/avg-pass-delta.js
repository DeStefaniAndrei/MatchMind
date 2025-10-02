//TO DO replace this with better tests
//Just exists for sanity checks on agent 


const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { input: 'artifacts/modified-stats-json' };
  for (let i = 2; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--input' && v) args.input = v;
  }
  return args;
}

function listJsonFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.json'))
    .map(e => path.join(dir, e.name));
}

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function timestampToMinute(ts) {
  if (!ts || typeof ts !== 'string') return null;
  const parts = ts.split(':');
  if (parts.length < 2) return null;
  const minutes = parseInt(parts[1], 10);
  if (Number.isNaN(minutes)) return null;
  return minutes;
}

function buildPerMinuteCumulative(events) {
  const minuteMap = new Map();
  const teamCounts = new Map();
  for (const ev of events) {
    const team = ev.player1_team || '';
    if (!team) continue;
    teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
  }
  const teams = Array.from(teamCounts.keys()).sort((a, b) => teamCounts.get(b) - teamCounts.get(a));
  const homeTeam = teams[0] || 'HOME';
  const awayTeam = teams[1] || 'AWAY';

  for (const ev of events) {
    const m = timestampToMinute(ev.timestamp);
    if (m == null) continue;
    if (!minuteMap.has(m)) {
      minuteMap.set(m, {
        passH: 0, passA: 0,
      });
    }
    const bucket = minuteMap.get(m);
    const isHome = ev.player1_team === homeTeam;
    if (ev.event_type === 'Pass') {
      if (isHome) bucket.passH += 1; else if (ev.player1_team === awayTeam) bucket.passA += 1;
    }
  }

  const minutes = Array.from(minuteMap.keys()).sort((a, b) => a - b);
  let ch = 0, ca = 0;
  const rows = [];
  for (const m of minutes) {
    const b = minuteMap.get(m);
    ch += b.passH; ca += b.passA;
    rows.push({ minute: m, cumPassH: ch, cumPassA: ca });
  }
  return rows;
}

function main() {
  const args = parseArgs(process.argv);
  if (!fs.existsSync(args.input)) {
    console.error('Input folder not found:', args.input);
    process.exit(1);
  }
  const files = listJsonFiles(args.input);
  let n = 0; let sumDh = 0; let sumDa = 0;
  for (const f of files) {
    const data = readJson(f);
    if (!Array.isArray(data) || data.length === 0) continue;
    const rows = buildPerMinuteCumulative(data);
    if (rows.length < 2) continue;
    for (let i = 0; i < rows.length - 1; i += 1) {
      const cur = rows[i];
      const nxt = rows[i + 1];
      const dh = Math.max(0, nxt.cumPassH - cur.cumPassH);
      const da = Math.max(0, nxt.cumPassA - cur.cumPassA);
      sumDh += dh;
      sumDa += da;
      n += 1;
    }
  }
  if (n === 0) {
    console.log('No samples found.');
    return;
  }
  const avgH = sumDh / n;
  const avgA = sumDa / n;
  const avg = (avgH + avgA) / 2;
  console.log('Samples:', n);
  console.log('Avg delta home (t->t+1):', avgH.toFixed(3));
  console.log('Avg delta away  (t->t+1):', avgA.toFixed(3));
  console.log('Avg delta overall       :', avg.toFixed(3));
}

main();



