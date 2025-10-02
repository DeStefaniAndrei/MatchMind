// Train linear models (home and away) to predict next-minute pass delta(change), then add to t+1
// directly from simplified StatsBomb JSON files produced by scripts/simplify-statsbomb.js
// Use:
//   node scripts/train-from-simplified.js --input "artifacts/modified-stats-json" --output "artifacts/models/passes-tplus1.json"

const fs = require('fs'); //for file manipulation
const path = require('path');

//Sets files paths from CL (defualt has output)
function parseArgs(argv) {
  const args = { input: null, output: 'artifacts/models/passes-tplus1.json' };
  for (let i = 2; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--input' && v) args.input = v;
    if (k === '--output' && v) args.output = v;
  }
  if (!args.input) {
    console.error('Usage: node scripts/train-from-simplified.js --input <folder> [--output <file>]');
    process.exit(1);
  }
  return args;
}

function listJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.json'))
    .map(e => path.join(dir, e.name));
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function timestampToMinute(ts) {
  // Expect format "00:12:34.567" 
  if (!ts || typeof ts !== 'string') return null;
  const parts = ts.split(':');
  if (parts.length < 2) return null;
  const minutes = parseInt(parts[1], 10);
  if (Number.isNaN(minutes)) return null;
  return minutes;
}

function buildPerMinuteCumulative(events) {
  // Aggregate per-minute counts for multiple event types per team, then cumulative
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

  const types = ['Pass', 'Shot', 'Foul Committed', 'Tackle', 'Goal'];

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
    if (ev.event_type === 'Pass') {
      if (isHome) bucket.passH += 1; else if (ev.player1_team === awayTeam) bucket.passA += 1;
    } else if (ev.event_type === 'Shot') {
      if (isHome) bucket.shotH += 1; else if (ev.player1_team === awayTeam) bucket.shotA += 1;
    } else if (ev.event_type === 'Foul Committed') {
      if (isHome) bucket.foulH += 1; else if (ev.player1_team === awayTeam) bucket.foulA += 1;
    } else if (ev.event_type === 'Tackle') {
      if (isHome) bucket.tackleH += 1; else if (ev.player1_team === awayTeam) bucket.tackleA += 1;
    } else if (ev.event_type === 'Goal') {
      if (isHome) bucket.goalH += 1; else if (ev.player1_team === awayTeam) bucket.goalA += 1;
    }
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
  return { rows, homeTeam, awayTeam };
}

function accumulateDatasetFromFolder(dir) {
  const files = listJsonFiles(dir);
  //Data used by all models to train:   features with lags: bias, minute, stats at T, T-5, T-20 for both teams 
  const X = []; 
  
  const Yh = []; // deltaHome(t->t+1)
  const Ya = []; // deltaAway(t->t+1)
  let usedMatches = 0;

  for (const f of files) {
    const data = readJson(f);
    if (!Array.isArray(data) || data.length === 0) continue;
    const { rows } = buildPerMinuteCumulative(data);
    if (rows.length < 2) continue;
    usedMatches += 1;
    const getLag = (arr, idx, minutesBack) => {
      const targetMinute = arr[idx].minute - minutesBack;
      // find latest row with minute <= targetMinute
      for (let j = idx; j >= 0; j--) {
        if (arr[j].minute <= targetMinute) return arr[j];
      }
      return null;
    };
    for (let i = 0; i < rows.length - 1; i += 1) {
      const cur = rows[i];
      const nxt = rows[i + 1];
      const dh = Math.max(0, (nxt.cumPassH - cur.cumPassH));
      const da = Math.max(0, (nxt.cumPassA - cur.cumPassA));

      const lag5 = getLag(rows, i, 5);
      const lag20 = getLag(rows, i, 20);

      const f = [
        1, cur.minute,
        // T stats (home/away)
        cur.cumPassH, cur.cumPassA,
        cur.cumShotH, cur.cumShotA,
        cur.cumFoulH, cur.cumFoulA,
        cur.cumTackleH, cur.cumTackleA,
        cur.cumGoalH, cur.cumGoalA,
        // T-5 (Defualt to 0 us T-5 not real (first 5 mins of game))
        lag5 ? lag5.cumPassH : 0, lag5 ? lag5.cumPassA : 0,
        lag5 ? lag5.cumShotH : 0, lag5 ? lag5.cumShotA : 0,
        lag5 ? lag5.cumFoulH : 0, lag5 ? lag5.cumFoulA : 0,
        lag5 ? lag5.cumTackleH : 0, lag5 ? lag5.cumTackleA : 0,
        lag5 ? lag5.cumGoalH : 0, lag5 ? lag5.cumGoalA : 0,
        // T-20 (Defualt to 0 us T-20 not real (first 20 mins of game))
        lag20 ? lag20.cumPassH : 0, lag20 ? lag20.cumPassA : 0,
        lag20 ? lag20.cumShotH : 0, lag20 ? lag20.cumShotA : 0,
        lag20 ? lag20.cumFoulH : 0, lag20 ? lag20.cumFoulA : 0,
        lag20 ? lag20.cumTackleH : 0, lag20 ? lag20.cumTackleA : 0,
        lag20 ? lag20.cumGoalH : 0, lag20 ? lag20.cumGoalA : 0,
      ];
      X.push(f);
      Yh.push(dh);
      Ya.push(da);
    }
  }
  return { X, Yh, Ya, usedMatches };
}

// Linear regression 
function transpose(A) {
  return A[0].map((_, j) => A.map(row => row[j]));
}

function matMul(A, B) {
  const rows = A.length, cols = B[0].length, inner = B.length;
  const C = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k < inner; k++) {
      const a = A[i][k];
      for (let j = 0; j < cols; j++) C[i][j] += a * B[k][j];
    }
  }
  return C;
}


//AI no idea how it work
function gaussianSolve(A, b) {
  // Solve A x = b for square A using Gaussian elimination with partial pivoting
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]); // augmented
  for (let col = 0; col < n; col++) {
    // pivot
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-12) return null;
    if (piv !== col) [M[col], M[piv]] = [M[piv], M[col]];
    // normalize row
    const div = M[col][col];
    for (let c = col; c <= n; c++) M[col][c] /= div;
    // eliminate others
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map(row => row[n]);
}

function solveNormalEq(X, y, ridge = 1e-6) {
  // X: n x p, y: n vector, ridge: small L2 regularization for stability
  const XT = transpose(X);
  const XTX = matMul(XT, X); // p x p
  // add ridge to diagonal
  for (let i = 0; i < XTX.length; i++) XTX[i][i] += ridge;
  const XTy = matMul(XT, y.map(v => [v])); // p x 1
  const beta = gaussianSolve(XTX, XTy.map(row => row[0]));
  return beta;
}

function saveModel(outputPath, betaHome, betaAway) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const model = {
    name: 'passes_tplus1_delta_linear_no_deps',
    input: { features: [
      'bias','minute',
      // T
      'T_passH','T_passA','T_shotH','T_shotA','T_foulH','T_foulA','T_tackleH','T_tackleA','T_goalH','T_goalA',
      // T-5
      'T5_passH','T5_passA','T5_shotH','T5_shotA','T5_foulH','T5_foulA','T5_tackleH','T5_tackleA','T5_goalH','T5_goalA',
      // T-20
      'T20_passH','T20_passA','T20_shotH','T20_shotA','T20_foulH','T20_foulA','T20_tackleH','T20_tackleA','T20_goalH','T20_goalA',
    ] },
    output: { labels: ['deltaHome(t->t+1)', 'deltaAway(t->t+1)'] },
    coefficients: {
      home: betaHome,
      away: betaAway,
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(model, null, 2));
}

function main() {
  const args = parseArgs(process.argv);
  //X is the actual data

  const { X, Yh, Ya, usedMatches } = accumulateDatasetFromFolder(args.input);
  console.log(`Training with ${X.length} samples from ${usedMatches} matches...`);
  if (X.length < 100) {
    console.error('Not enough samples to train.');
    process.exit(1);
  }
  const betaHome = solveNormalEq(X, Yh);
  const betaAway = solveNormalEq(X, Ya);
  if (!betaHome || !betaAway) {
    console.error('Failed to invert normal equations.');
    process.exit(1);
  }
  saveModel(args.output, betaHome, betaAway);
  console.log('Model saved to', args.output);
}

main();


