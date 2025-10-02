// Train individual models for each event type to predict T+1 delta
// Each model predicts the change in count for that specific event type from T to T+1
// Usage: node scripts/AI/train-all-models.js --input "artifacts/modified-stats-json" --output "artifacts/models"

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { input: null, output: 'artifacts/models' };
  for (let i = 2; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--input' && v) args.input = v;
    if (k === '--output' && v) args.output = v;
  }
  if (!args.input) {
    console.error('Usage: node scripts/AI/train-all-models.js --input <folder> [--output <folder>]');
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
  if (!ts || typeof ts !== 'string') return null;
  const parts = ts.split(':');
  if (parts.length < 2) return null;
  const minutes = parseInt(parts[1], 10);
  if (Number.isNaN(minutes)) return null;
  return minutes;
}

// Event types to train models for (excluding Goal and Goalkeeper as requested)
const EVENT_TYPES = [
  'Pass', 'Shot', 'Foul Committed', 'Duel', 'Block', 
  'Ball Recovery', 'Pressure', 'Miscontrol', 'Interception', 'Possession Change'
];

function buildPerMinuteCumulative(events) {
  const minuteMap = new Map();
  const teamCounts = new Map();
  
  // Count events per team to determine home/away
  for (const ev of events) {
    const team = ev.player1_team || '';
    if (!team) continue;
    teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
  }
  const teams = Array.from(teamCounts.keys()).sort((a, b) => teamCounts.get(b) - teamCounts.get(a));
  const homeTeam = teams[0] || 'HOME';
  const awayTeam = teams[1] || 'AWAY';

  // Initialize minute buckets for all event types
  for (const ev of events) {
    const m = timestampToMinute(ev.timestamp);
    if (m == null) continue;
    if (!minuteMap.has(m)) {
      const bucket = {};
      for (const eventType of EVENT_TYPES) {
        bucket[`${eventType.toLowerCase().replace(/\s+/g, '_')}_h`] = 0;
        bucket[`${eventType.toLowerCase().replace(/\s+/g, '_')}_a`] = 0;
      }
      minuteMap.set(m, bucket);
    }
  }

  // Count events per minute
  for (const ev of events) {
    const m = timestampToMinute(ev.timestamp);
    if (m == null) continue;
    const bucket = minuteMap.get(m);
    const isHome = ev.player1_team === homeTeam;
    const isAway = ev.player1_team === awayTeam;
    
    // Map event types to bucket keys
    const eventKey = ev.event_type.toLowerCase().replace(/\s+/g, '_');
    const homeKey = `${eventKey}_h`;
    const awayKey = `${eventKey}_a`;
    
    // Handle normalized event types from simplifier
    if (ev.event_type.startsWith('pass_') || ev.event_type === 'Pass') {
      if (isHome) bucket.pass_h += 1;
      else if (isAway) bucket.pass_a += 1;
    } else if (ev.event_type.startsWith('shot_') || ev.event_type === 'Shot') {
      if (isHome) bucket.shot_h += 1;
      else if (isAway) bucket.shot_a += 1;
    } else if (ev.event_type === 'Foul Committed') {
      if (isHome) bucket.foul_committed_h += 1;
      else if (isAway) bucket.foul_committed_a += 1;
    } else if (ev.event_type === 'Duel') {
      if (isHome) bucket.duel_h += 1;
      else if (isAway) bucket.duel_a += 1;
    } else if (ev.event_type === 'Block') {
      if (isHome) bucket.block_h += 1;
      else if (isAway) bucket.block_a += 1;
    } else if (ev.event_type === 'Ball Recovery') {
      if (isHome) bucket.ball_recovery_h += 1;
      else if (isAway) bucket.ball_recovery_a += 1;
    } else if (ev.event_type === 'Pressure') {
      if (isHome) bucket.pressure_h += 1;
      else if (isAway) bucket.pressure_a += 1;
    } else if (ev.event_type === 'Miscontrol') {
      if (isHome) bucket.miscontrol_h += 1;
      else if (isAway) bucket.miscontrol_a += 1;
    } else if (ev.event_type === 'Interception') {
      if (isHome) bucket.interception_h += 1;
      else if (isAway) bucket.interception_a += 1;
    }
    
    // Calculate possession changes
    const possessionLossEvents = ['Miscontrol', 'Interception', 'Duel', 'Foul Committed'];
    const possessionGainEvents = ['Ball Recovery', 'Interception', 'Duel'];
    
    if (possessionLossEvents.includes(ev.event_type)) {
      if (isHome) bucket.possession_change_a += 1;
      else if (isAway) bucket.possession_change_h += 1;
    } else if (possessionGainEvents.includes(ev.event_type)) {
      if (isHome) bucket.possession_change_h += 1;
      else if (isAway) bucket.possession_change_a += 1;
    }
  }

  // Build cumulative rows
  const minutes = Array.from(minuteMap.keys()).sort((a, b) => a - b);
  const cumulative = {};
  for (const eventType of EVENT_TYPES) {
    const key = eventType.toLowerCase().replace(/\s+/g, '_');
    cumulative[`${key}_h`] = 0;
    cumulative[`${key}_a`] = 0;
  }
  
  const rows = [];
  for (const m of minutes) {
    const b = minuteMap.get(m);
    for (const eventType of EVENT_TYPES) {
      const key = eventType.toLowerCase().replace(/\s+/g, '_');
      cumulative[`${key}_h`] += b[`${key}_h`];
      cumulative[`${key}_a`] += b[`${key}_a`];
    }
    
    const row = { minute: m };
    for (const eventType of EVENT_TYPES) {
      const key = eventType.toLowerCase().replace(/\s+/g, '_');
      row[`cum_${key}_h`] = cumulative[`${key}_h`];
      row[`cum_${key}_a`] = cumulative[`${key}_a`];
    }
    rows.push(row);
  }
  
  return { rows, homeTeam, awayTeam };
}

function accumulateDatasetForEventType(dir, targetEventType) {
  const files = listJsonFiles(dir);
  const X = [];
  const Y = [];
  let usedMatches = 0;
  
  const targetKey = targetEventType.toLowerCase().replace(/\s+/g, '_');

  for (const f of files) {
    const data = readJson(f);
    if (!Array.isArray(data) || data.length === 0) continue;
    const { rows } = buildPerMinuteCumulative(data);
    if (rows.length < 2) continue;
    usedMatches += 1;
    
    const getLag = (arr, idx, minutesBack) => {
      const targetMinute = arr[idx].minute - minutesBack;
      for (let j = idx; j >= 0; j--) {
        if (arr[j].minute <= targetMinute) return arr[j];
      }
      return null;
    };
    
    for (let i = 0; i < rows.length - 1; i += 1) {
      const cur = rows[i];
      const nxt = rows[i + 1];
      
      // Calculate delta for target event type (home + away combined)
      const curTotal = cur[`cum_${targetKey}_h`] + cur[`cum_${targetKey}_a`];
      const nxtTotal = nxt[`cum_${targetKey}_h`] + nxt[`cum_${targetKey}_a`];
      const delta = Math.max(0, nxtTotal - curTotal);
      
      const lag5 = getLag(rows, i, 5);
      const lag20 = getLag(rows, i, 20);
      
      // Build feature vector with all event types
      const features = [
        1, cur.minute, // bias, minute
      ];
      
      // Current minute stats (T) - all event types
      for (const eventType of EVENT_TYPES) {
        const key = eventType.toLowerCase().replace(/\s+/g, '_');
        features.push(cur[`cum_${key}_h`], cur[`cum_${key}_a`]);
      }
      
      // T-5 lag stats
      for (const eventType of EVENT_TYPES) {
        const key = eventType.toLowerCase().replace(/\s+/g, '_');
        features.push(
          lag5 ? lag5[`cum_${key}_h`] : 0,
          lag5 ? lag5[`cum_${key}_a`] : 0
        );
      }
      
      // T-20 lag stats
      for (const eventType of EVENT_TYPES) {
        const key = eventType.toLowerCase().replace(/\s+/g, '_');
        features.push(
          lag20 ? lag20[`cum_${key}_h`] : 0,
          lag20 ? lag20[`cum_${key}_a`] : 0
        );
      }
      
      X.push(features);
      Y.push(delta);
    }
  }
  
  return { X, Y, usedMatches };
}

// Linear regression functions
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

function gaussianSolve(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-12) return null;
    if (piv !== col) [M[col], M[piv]] = [M[piv], M[col]];
    const div = M[col][col];
    for (let c = col; c <= n; c++) M[col][c] /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map(row => row[n]);
}

function solveNormalEq(X, y, ridge = 1e-6) {
  const XT = transpose(X);
  const XTX = matMul(XT, X);
  for (let i = 0; i < XTX.length; i++) XTX[i][i] += ridge;
  const XTy = matMul(XT, y.map(v => [v]));
  const beta = gaussianSolve(XTX, XTy.map(row => row[0]));
  return beta;
}

function saveModel(outputPath, eventType, beta) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  // Build feature names
  const features = ['bias', 'minute'];
  for (const eventType of EVENT_TYPES) {
    const key = eventType.toLowerCase().replace(/\s+/g, '_');
    features.push(`T_${key}_h`, `T_${key}_a`);
  }
  for (const eventType of EVENT_TYPES) {
    const key = eventType.toLowerCase().replace(/\s+/g, '_');
    features.push(`T5_${key}_h`, `T5_${key}_a`);
  }
  for (const eventType of EVENT_TYPES) {
    const key = eventType.toLowerCase().replace(/\s+/g, '_');
    features.push(`T20_${key}_h`, `T20_${key}_a`);
  }
  
  const model = {
    name: `${eventType.toLowerCase().replace(/\s+/g, '_')}_tplus1_delta_individual`,
    eventType: eventType,
    input: { features },
    output: { label: `delta${eventType}(t->t+1)` },
    coefficients: beta,
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(model, null, 2));
}

function main() {
  const args = parseArgs(process.argv);
  
  //Justification in 
  console.log('Training individual models for each event type...');
  console.log('Event types:', EVENT_TYPES.join(', '));
  console.log('Output directory:', args.output);
  
  for (const eventType of EVENT_TYPES) {
    console.log(`\nTraining model for: ${eventType}`);
    
    const { X, Y, usedMatches } = accumulateDatasetForEventType(args.input, eventType);
    console.log(`  Samples: ${X.length} from ${usedMatches} matches`);
    
    if (X.length < 100) {
      console.log(`  Skipping ${eventType} - not enough samples`);
      continue;
    }
    
    const beta = solveNormalEq(X, Y);
    if (!beta) {
      console.log(`  Failed to train ${eventType} - matrix inversion failed`);
      continue;
    }
    
    const fileName = `${eventType.toLowerCase().replace(/\s+/g, '_')}-tplus1.json`;
    const outputPath = path.join(args.output, fileName);
    saveModel(outputPath, eventType, beta);
    
    console.log(`  Model saved to: ${outputPath}`);
  }
  
  console.log('\nTraining completed!');
}

main();
