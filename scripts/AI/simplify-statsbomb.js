// This simplifies the Json files give by "https://github.com/statsbomb/open-data" into a more readable & usable format.

// Usage:
//   npm run ai:simplify --input "C:\Users\zacmo\StatsBombJson --outDir "artifacts/modified-stats-json" //download the files locally 

const fs = require('fs');
const path = require('path');
// Removed external deps to avoid install issues

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error('Failed to read JSON:', filePath, err.message);
    return null;
  }
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function findRelatedPlayer(event, eventsData, eventsById) {
  const related = event?.related_events || [];
  for (const id of related) {
    const re = eventsById.get(id);
    if (!re) continue;
    const typeName = re?.type?.name || '';
    if (['Tackle', 'Duel', 'Card', 'Foul Committed'].includes(typeName)) {
      return re?.player?.name || '';
    }
  }
  return '';
}

function getDuelOpponent(event) {
  const opponent = event?.duel?.opponent;
  if (opponent) return opponent.name || '';
  return '';
}

function getTackleVictim(event) {
  const victim = event?.tackle?.victim;
  if (victim) return victim.name || '';
  return '';
}

function getCardVictim(_event) {
  // Typically card is on the same player; return empty for now
  return '';
}

function simplifyEvent(event, eventsData, eventsById) {
  try {
    const eventType = event?.type?.name || 'Unknown';
    const timestamp = event?.timestamp || '';
    const player1Name = event?.player?.name || '';
    const player1Team = event?.team?.name || '';

    let player2Name = '';
    let player2Team = '';

    if (eventType === 'Pass' && event.pass) {
      player2Name = event.pass?.recipient?.name || '';
      player2Team = player1Team;
    } else if (eventType === 'Ball Receipt*') {
      player2Name = findRelatedPlayer(event, eventsData, eventsById) || '';
      player2Team = player2Name ? player1Team : '';
    } else if (eventType === 'Tackle') {
      player2Name = getTackleVictim(event) || findRelatedPlayer(event, eventsData, eventsById) || '';
    } else if (eventType === 'Duel') {
      player2Name = getDuelOpponent(event) || findRelatedPlayer(event, eventsData, eventsById) || '';
    } else if (['Card', 'Foul Committed'].includes(eventType)) {
      player2Name = getCardVictim(event) || findRelatedPlayer(event, eventsData, eventsById) || '';
    }

    const skipTypes = new Set(['Starting XI', 'Half Start', 'Half End', 'Injury Stoppage', 'Referee Ball-Drop']);
    if (skipTypes.has(eventType)) return null;

    // normalize event type for Pass and Shot, and extract set-pieces
    function normalizeEventType(et, ev) {
      try {
        if (et === 'Pass') {
          const sp = ev?.pass?.type?.name || ''
          // Explicit set-piece mapping
          if (sp === 'Corner') return 'corner'
          if (sp === 'Free Kick') return 'free_kick'
          if (sp === 'Throw-in' || sp === 'Throw-In' || sp === 'Throw In') return 'throw_in'
          const hasFailureOutcome = !!(ev?.pass?.outcome?.name);
          return hasFailureOutcome ? 'pass_failure' : 'pass_success';
        }
        if (et === 'Shot') {
          const outcome = ev?.shot?.outcome?.name || '';
          if (outcome === 'Goal') return 'shot_goal';
          const onTargetOutcomes = new Set(['Saved', 'Saved To Post', 'Shot On Target', 'Blocked']);
          return onTargetOutcomes.has(outcome) ? 'shot_on_target' : 'shot_miss';
        }
        return et;
      } catch {
        return et;
      }
    }

    return {
      event_type: normalizeEventType(eventType, event),
      player1: player1Name,
      player2: player2Name,
      player1_team: player1Team,
      player2_team: player2Team,
      timestamp,
    };
  } catch (err) {
    return null;
  }
}

function simplifyFile(inFile, outDir) {
  const data = readJson(inFile);
  if (!data) return { inFile, outFile: null, total: 0 };

  const events = Array.isArray(data) ? data : (Array.isArray(data?.events) ? data.events : []);
  if (!Array.isArray(events) || events.length === 0) {
    return { inFile, outFile: null, total: 0 };
  }

  const eventsById = new Map(events.map(e => [e?.id, e]));
  const simplified = [];
  for (const ev of events) {
    const s = simplifyEvent(ev, events, eventsById);
    if (s) simplified.push(s);
  }

  const base = path.basename(inFile).replace(/\.json$/i, '') + '_simplified.json';
  const outFile = path.join(outDir, base);
  writeJson(outFile, simplified);
  return { inFile, outFile, total: simplified.length };
}

//argv contains the input folder full of stats-bomb-json given in run input
function parseArgs(argv) {
  const args = { input: null, outDir: 'artifacts/modified-stats-json' };
  for (let i = 2; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--input' && v) args.input = v;
    if (k === '--outDir' && v) args.outDir = v;
  }
  if (!args.input) {
    console.error('Usage: node scripts/simplify-statsbomb.js --input <folder> [--outDir <folder>]');
    process.exit(1);
  }
  return args;
}

function walkJsonFiles(rootDir) {
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.toLowerCase().endsWith('.json')) results.push(p);
    }
  }
  walk(rootDir);
  return results;
}

function main() {
  const argv = parseArgs(process.argv);
  ensureDir(argv.outDir);

  const files = walkJsonFiles(argv.input);
  console.log(`Found ${files.length} JSON files under ${argv.input}`);

  let totalEvents = 0;
  let written = 0;
  for (const f of files) {
    const result = simplifyFile(f, argv.outDir);
    if (result.outFile) {
      written += 1;
      totalEvents += result.total;
      console.log(`Wrote ${result.total.toString().padStart(4, ' ')} events → ${result.outFile}`);
    } else {
      console.log(`Skipped (no events) → ${f}`);
    }
  }

  console.log(`Done. Files written: ${written}. Total simplified events: ${totalEvents}. Output dir: ${argv.outDir}`);
}

main();


