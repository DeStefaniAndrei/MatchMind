// Test the trained model: either predict from manual inputs or evaluate MAE on a folder
// Usage examples:
//   node scripts/test-model.js --model "artifacts/models/passes-tplus1.json" --input "artifacts/nodified-stats-json"
//removed ability to use CL it was slow to manually input all the data (6 * 3 inputs rn per test)

const fs = require('fs');
const path = require('path');

// Static configuration (no CLI inputs)
const MODEL_PATH = 'artifacts/models/passes-tplus1.json';
// Folder containing per-match JSON event arrays to evaluate MAE
const INPUT_FOLDER = 'artifacts/modified-stats-json';
// Optional: set to an object to run a single manual prediction; otherwise leave as null
// Example: { cumHome: 120, cumAway: 110, minute: 35 }
const MANUAL = null;

function loadModel(p) {
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  const home = m?.coefficients?.home;
  const away = m?.coefficients?.away;
  if (!Array.isArray(home) || !Array.isArray(away)) {
    throw new Error('Invalid model coefficients');
  }
  return { home, away };
}

function dot(w, v) { return w.reduce((s, wi, i) => s + wi * (v[i] ?? 0), 0); }

function predictNextFeatures({ betaHome, betaAway }, featureVector, cumHome, cumAway) {
  const dh = Math.max(0, dot(betaHome, featureVector));
  const da = Math.max(0, dot(betaAway, featureVector));
  return { homeNext: cumHome + dh, awayNext: cumAway + da, homeDelta: dh, awayDelta: da };
}

// Minimal manual prediction helper when only cumHome/cumAway/minute are provided.
// Other features (shots/fouls/tackles/goals and lags) are set to 0.
function predictNext({ betaHome, betaAway }, cumHome, cumAway, minute) {
  const fv = [
    1, minute,
    // T (only passes provided manually)
    cumHome, cumAway,
    0, 0, // shots H/A
    0, 0, // fouls H/A
    0, 0, // tackles H/A
    0, 0, // goals H/A
    // T-5 (unknown -> zeros)
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // T-20 (unknown -> zeros)
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  return predictNextFeatures({ betaHome, betaAway }, fv, cumHome, cumAway);
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
        shotH: 0, shotA: 0,
        foulH: 0, foulA: 0,
        tackleH: 0, tackleA: 0,
        goalH: 0, goalA: 0,
      });
    }
    const bucket = minuteMap.get(m);
    const isHome = ev.player1_team === homeTeam;
    if (ev.event_type === 'Pass') { if (isHome) bucket.passH += 1; else if (ev.player1_team === awayTeam) bucket.passA += 1; }
    else if (ev.event_type === 'Shot') { if (isHome) bucket.shotH += 1; else if (ev.player1_team === awayTeam) bucket.shotA += 1; }
    else if (ev.event_type === 'Foul Committed') { if (isHome) bucket.foulH += 1; else if (ev.player1_team === awayTeam) bucket.foulA += 1; }
    else if (ev.event_type === 'Tackle') { if (isHome) bucket.tackleH += 1; else if (ev.player1_team === awayTeam) bucket.tackleA += 1; }
    else if (ev.event_type === 'Goal') { if (isHome) bucket.goalH += 1; else if (ev.player1_team === awayTeam) bucket.goalA += 1; }
  }

  const minutes = Array.from(minuteMap.keys()).sort((a, b) => a - b);
  let ch = { pass:0, shot:0, foul:0, tackle:0, goal:0 };
  let ca = { pass:0, shot:0, foul:0, tackle:0, goal:0 };
  const rows = [];
  for (const m of minutes) {
    const b = minuteMap.get(m);
    ch.pass += b.passH; ca.pass += b.passA;
    ch.shot += b.shotH; ca.shot += b.shotA;
    ch.foul += b.foulH; ca.foul += b.foulA;
    ch.tackle += b.tackleH; ca.tackle += b.tackleA;
    ch.goal += b.goalH; ca.goal += b.goalA;
    rows.push({
      minute: m,
      cumPassH: ch.pass, cumPassA: ca.pass,
      cumShotH: ch.shot, cumShotA: ca.shot,
      cumFoulH: ch.foul, cumFoulA: ca.foul,
      cumTackleH: ch.tackle, cumTackleA: ca.tackle,
      cumGoalH: ch.goal, cumGoalA: ca.goal,
    });
  }
  return rows;
}

function buildFeatureVector(rows, idx) {
  const cur = rows[idx];
  const getLag = (minutesBack) => {
    const targetMinute = cur.minute - minutesBack;
    for (let j = idx; j >= 0; j--) if (rows[j].minute <= targetMinute) return rows[j];
    return null;
  };
  const lag5 = getLag(5);
  const lag20 = getLag(20);
  return [
    1, cur.minute,
    cur.cumPassH, cur.cumPassA,
    cur.cumShotH, cur.cumShotA,
    cur.cumFoulH, cur.cumFoulA,
    cur.cumTackleH, cur.cumTackleA,
    cur.cumGoalH, cur.cumGoalA,
    // T-5
    lag5 ? lag5.cumPassH : 0, lag5 ? lag5.cumPassA : 0,
    lag5 ? lag5.cumShotH : 0, lag5 ? lag5.cumShotA : 0,
    lag5 ? lag5.cumFoulH : 0, lag5 ? lag5.cumFoulA : 0,
    lag5 ? lag5.cumTackleH : 0, lag5 ? lag5.cumTackleA : 0,
    lag5 ? lag5.cumGoalH : 0, lag5 ? lag5.cumGoalA : 0,
    // T-20
    lag20 ? lag20.cumPassH : 0, lag20 ? lag20.cumPassA : 0,
    lag20 ? lag20.cumShotH : 0, lag20 ? lag20.cumShotA : 0,
    lag20 ? lag20.cumFoulH : 0, lag20 ? lag20.cumFoulA : 0,
    lag20 ? lag20.cumTackleH : 0, lag20 ? lag20.cumTackleA : 0,
    lag20 ? lag20.cumGoalH : 0, lag20 ? lag20.cumGoalA : 0,
  ];
}

function evaluateOnFolder(modelPath, folder) {
  const { home, away } = loadModel(modelPath);
  const files = listJsonFiles(folder);
  let n = 0, maeH = 0, maeA = 0;
  for (const f of files) {
    const data = readJson(f);
    if (!Array.isArray(data) || data.length === 0) continue;
    const rows = buildPerMinuteCumulative(data);
    if (rows.length < 2) continue;
    for (let i = 0; i < rows.length - 1; i += 1) {
      const cur = rows[i];
      const nxt = rows[i + 1];
      const fv = buildFeatureVector(rows, i);
      const pred = predictNextFeatures({ betaHome: home, betaAway: away }, fv, cur.cumPassH, cur.cumPassA);
      maeH += Math.abs(pred.homeNext - nxt.cumPassH);
      maeA += Math.abs(pred.awayNext - nxt.cumPassA);
      n += 1;
    }
  }
  if (n === 0) {
    console.log('No samples found to evaluate.');
    return;
  }
  console.log('Samples:', n);
  console.log('MAE home:', (maeH / n).toFixed(3));
  console.log('MAE away:', (maeA / n).toFixed(3));
  console.log('MAE avg :', ((maeH + maeA) / (2 * n)).toFixed(3));
}

function main() {
  if (INPUT_FOLDER) {
    evaluateOnFolder(MODEL_PATH, INPUT_FOLDER);
  }
  if (MANUAL) {
    const { home, away } = loadModel(MODEL_PATH);
    const pred = predictNext({ betaHome: home, betaAway: away }, MANUAL.cumHome, MANUAL.cumAway, MANUAL.minute);
    console.log(JSON.stringify(pred, null, 2));
  }
}

main();


