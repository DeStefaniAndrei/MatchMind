// Test individual models for each event type
// Usage: node scripts/AI/test-all-models.js --models "artifacts/models/individual" --input "artifacts/modified-stats-json"

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { models: null, input: null };
  for (let i = 2; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--models' && v) args.models = v;
    if (k === '--input' && v) args.input = v;
  }
  if (!args.models || !args.input) {
    console.error('Usage: node scripts/AI/test-all-models.js --models <folder> --input <folder>');
    process.exit(1);
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

const EVENT_TYPES = [
  'Pass', 'Shot', 'Foul Committed', 'Duel', 'Block', 
  'Ball Recovery', 'Pressure', 'Miscontrol', 'Interception', 'Possession Change'
];

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
      const bucket = {};
      for (const eventType of EVENT_TYPES) {
        bucket[`${eventType.toLowerCase().replace(/\s+/g, '_')}_h`] = 0;
        bucket[`${eventType.toLowerCase().replace(/\s+/g, '_')}_a`] = 0;
      }
      minuteMap.set(m, bucket);
    }
  }

  for (const ev of events) {
    const m = timestampToMinute(ev.timestamp);
    if (m == null) continue;
    const bucket = minuteMap.get(m);
    const isHome = ev.player1_team === homeTeam;
    const isAway = ev.player1_team === awayTeam;
    
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
  
  const features = [1, cur.minute];
  
  for (const eventType of EVENT_TYPES) {
    const key = eventType.toLowerCase().replace(/\s+/g, '_');
    features.push(cur[`cum_${key}_h`], cur[`cum_${key}_a`]);
  }
  
  for (const eventType of EVENT_TYPES) {
    const key = eventType.toLowerCase().replace(/\s+/g, '_');
    features.push(
      lag5 ? lag5[`cum_${key}_h`] : 0,
      lag5 ? lag5[`cum_${key}_a`] : 0
    );
  }
  
  for (const eventType of EVENT_TYPES) {
    const key = eventType.toLowerCase().replace(/\s+/g, '_');
    features.push(
      lag20 ? lag20[`cum_${key}_h`] : 0,
      lag20 ? lag20[`cum_${key}_a`] : 0
    );
  }
  
  return features;
}

function dot(w, v) { 
  return w.reduce((s, wi, i) => s + wi * (v[i] ?? 0), 0); 
}

function evaluateModel(modelPath, inputFolder, eventType) {
  const model = readJson(modelPath);
  if (!model || !model.coefficients) {
    console.log(`  Failed to load model for ${eventType}`);
    return null;
  }
  
  const files = listJsonFiles(inputFolder);
  let n = 0, mae = 0, totalActual = 0;
  const targetKey = eventType.toLowerCase().replace(/\s+/g, '_');
  
  for (const f of files) {
    const data = readJson(f);
    if (!Array.isArray(data) || data.length === 0) continue;
    const rows = buildPerMinuteCumulative(data);
    if (rows.length < 2) continue;
    
    for (let i = 0; i < rows.length - 1; i += 1) {
      const cur = rows[i];
      const nxt = rows[i + 1];
      const fv = buildFeatureVector(rows, i);
      
      const curTotal = cur[`cum_${targetKey}_h`] + cur[`cum_${targetKey}_a`];
      const nxtTotal = nxt[`cum_${targetKey}_h`] + nxt[`cum_${targetKey}_a`];
      const actualDelta = Math.max(0, nxtTotal - curTotal);
      
      const predictedDelta = Math.max(0, dot(model.coefficients, fv));
      
      mae += Math.abs(predictedDelta - actualDelta);
      totalActual += actualDelta;
      n += 1;
    }
  }
  
  if (n === 0) return null;
  
  const avgMae = mae / n;
  const avgActual = totalActual / n;
  const errorRate = avgActual > 0 ? (avgMae / avgActual * 100).toFixed(1) : 'ERROR';
  
  return { samples: n, mae: avgMae, avgActual, errorRate };
}

function main() {
  const args = parseArgs(process.argv);
  
  console.log('Testing individual models...');
  console.log('Models directory:', args.models);
  console.log('Input directory:', args.input);
  console.log('');
  
  const results = [];
  
  for (const eventType of EVENT_TYPES) {
    const fileName = `${eventType.toLowerCase().replace(/\s+/g, '_')}-tplus1.json`;
    const modelPath = path.join(args.models, fileName);
    
    if (!fs.existsSync(modelPath)) {
      console.log(`${eventType}: Model file not found`);
      continue;
    }
    
    console.log(`Testing ${eventType}...`);
    const result = evaluateModel(modelPath, args.input, eventType);
    
    if (result) {
      console.log(`  Samples: ${result.samples}`);
      console.log(`  MAE: ${result.mae}`);
      console.log(`  Avg Actual: ${result.avgActual}`);
      console.log(`  Error Rate: ${result.errorRate}%`);
      results.push({ eventType, ...result });
    }
    console.log('');
  }
  

}

main();
