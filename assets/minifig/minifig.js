// Generador de minifiguras LEGO en SVG. Sin dependencias. Funciona en navegador y Node.
// avatar = { hair, hair_color, skin, torso, legs, accessory }
//   hair: none | short | bob | long | ponytail | curly
//   accessory: none | tie | glasses | headset | hardhat | cap
// state: idle | working | waiting | blocked  (cambia la expresión y el brillo del estado)

const STROKE = 'rgba(0,0,0,.28)';
const DEFAULTS = { hair: 'short', hair_color: '#4a2f1b', skin: '#ffd21f', torso: '#2f6fed', legs: '#27304a', accessory: 'none' };

function backHair(a) {
  const c = a.hair_color;
  if (a.hair === 'bob') return `<rect x="25" y="14" width="50" height="34" rx="12" fill="${c}" stroke="${STROKE}"/>`;
  if (a.hair === 'long') return `<rect x="24" y="12" width="52" height="56" rx="14" fill="${c}" stroke="${STROKE}"/>`;
  if (a.hair === 'ponytail') return `<rect x="68" y="26" width="14" height="30" rx="7" fill="${c}" stroke="${STROKE}"/>`;
  return '';
}

function frontHair(a) {
  const c = a.hair_color;
  const cap = `M27 30 V22 Q27 8 50 8 Q73 8 73 22 V30 Q67 21 50 21 Q33 21 27 30 Z`;
  switch (a.hair) {
    case 'short': case 'ponytail': case 'bob': case 'long':
      return `<path d="${cap}" fill="${c}" stroke="${STROKE}"/>`;
    case 'curly':
      return [34, 42, 50, 58, 66].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 14 : 17}" r="9" fill="${c}" stroke="${STROKE}"/>`).join('')
        + `<rect x="27" y="14" width="46" height="10" fill="${c}"/>`;
    default:
      return `<rect x="40" y="3" width="20" height="8" rx="2" fill="${a.skin}" stroke="${STROKE}"/>`; // stud
  }
}

function accessory(a, face) {
  switch (a.accessory) {
    case 'tie':
      return `<path d="M46 52 H54 L56 74 L50 82 L44 74 Z" fill="#d6242b" stroke="${STROKE}"/>`;
    case 'glasses':
      return face
        ? `<g fill="rgba(255,255,255,.25)" stroke="#222" stroke-width="2"><rect x="33" y="22" width="14" height="11" rx="3"/><rect x="53" y="22" width="14" height="11" rx="3"/></g><path d="M47 27 H53" stroke="#222" stroke-width="2"/>`
        : '';
    case 'headset':
      return face
        ? `<path d="M26 30 Q26 6 50 6 Q74 6 74 30" fill="none" stroke="#333" stroke-width="4"/><rect x="21" y="24" width="8" height="14" rx="3" fill="#333"/><rect x="71" y="24" width="8" height="14" rx="3" fill="#333"/><path d="M24 38 Q26 48 41 46" fill="none" stroke="#333" stroke-width="3"/><circle cx="42" cy="46" r="3" fill="#333"/>`
        : '';
    case 'hardhat':
      return face
        ? `<path d="M25 22 Q25 3 50 3 Q75 3 75 22 Z" fill="#ffb400" stroke="${STROKE}"/><rect x="21" y="20" width="58" height="6" rx="3" fill="#ffb400" stroke="${STROKE}"/><rect x="46" y="1" width="8" height="8" rx="2" fill="#ffb400" stroke="${STROKE}"/>`
        : '';
    case 'cap':
      return face
        ? `<path d="M26 24 Q26 5 50 5 Q74 5 74 24 Z" fill="#d6242b" stroke="${STROKE}"/><rect x="38" y="21" width="44" height="6" rx="3" fill="#b01c22" stroke="${STROKE}"/>`
        : '';
    default: return '';
  }
}

function mouth(state) {
  if (state === 'blocked') return `<path d="M41 42 Q50 36 59 42" fill="none" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>`;
  if (state === 'working') return `<path d="M42 39 H58" fill="none" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<path d="M40 37 Q50 46 60 37" fill="none" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>`;
}

const STATE_COLOR = { idle: '#9aa3b2', working: '#2ecc71', waiting: '#f5a623', blocked: '#e5484d' };

/** @returns {string} SVG markup */
export function renderMinifig(avatar = {}, { size = 160, state = 'idle', label = '' } = {}) {
  const a = { ...DEFAULTS, ...avatar };
  const h = Math.round((size * 176) / 100);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 176" width="${size}" height="${h}" role="img" aria-label="${label || 'minifigura'}">
  <ellipse cx="50" cy="168" rx="30" ry="5" fill="rgba(0,0,0,.15)"/>
  ${backHair(a)}
  <!-- piernas -->
  <rect x="31" y="98" width="38" height="10" rx="2" fill="${a.legs}" stroke="${STROKE}"/>
  <rect x="31" y="106" width="18" height="52" rx="3" fill="${a.legs}" stroke="${STROKE}"/>
  <rect x="51" y="106" width="18" height="52" rx="3" fill="${a.legs}" stroke="${STROKE}"/>
  <!-- brazos y manos -->
  <rect x="17" y="54" width="14" height="40" rx="6" fill="${a.torso}" stroke="${STROKE}"/>
  <rect x="69" y="54" width="14" height="40" rx="6" fill="${a.torso}" stroke="${STROKE}"/>
  <path d="M18 98 a7 7 0 1 1 12 0 l-2 4 h-8 z" fill="${a.skin}" stroke="${STROKE}"/>
  <path d="M70 98 a7 7 0 1 1 12 0 l-2 4 h-8 z" fill="${a.skin}" stroke="${STROKE}"/>
  <!-- torso -->
  <rect x="30" y="52" width="40" height="48" rx="4" fill="${a.torso}" stroke="${STROKE}"/>
  ${accessory(a, false)}
  <circle cx="63" cy="64" r="3" fill="${STATE_COLOR[state] || STATE_COLOR.idle}" stroke="${STROKE}"/>
  <!-- cabeza -->
  <rect x="28" y="10" width="44" height="42" rx="11" fill="${a.skin}" stroke="${STROKE}"/>
  <circle cx="41" cy="28" r="2.8" fill="#222"/><circle cx="59" cy="28" r="2.8" fill="#222"/>
  ${mouth(state)}
  ${frontHair(a)}
  ${accessory(a, true)}
</svg>`;
}
