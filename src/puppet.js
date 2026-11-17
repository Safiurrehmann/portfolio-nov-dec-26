// Paper marionettes, drawn as SVG. One viewBox (140 × 320) for every puppet:
// the control bar sits at the top, strings run down to the head, hands and knees.
// Groups named a-* are for the scroll story; p-* groups are for idle motion.

const INK = "#191714";
const PAPER = "#f1e9da";
const LEGS = "#e6d9c0";

// where each string ties on (bar end → body point), in viewBox units
export const STRINGS = {
  handL: [20, 8, 39, 199],
  kneeL: [44, 8, 60, 250],
  head: [70, 10, 70, 94],
  kneeR: [96, 8, 80, 250],
  handR: [120, 8, 101, 199],
};

// each moving group pivots around a fixed joint (viewBox units)
const PIVOT = {
  "p-sway": [70, 8],
  "a-body": [70, 268],
  "a-head": [70, 140],
  "a-eyes": [70, 116], "p-blink": [70, 116],
  "p-arm-l": [50, 156], "a-arm-l": [50, 156],
  "p-arm-r": [90, 156], "a-arm-r": [90, 156],
  "p-leg-l": [60, 210], "a-leg-l": [60, 210],
  "p-leg-r": [80, 210], "a-leg-r": [80, 210],
  "a-bar": [70, 8],
  "r-h-arm": [624, 90],
};

// A rig is a plain object GSAP can tween (r, x, y, sx, sy). Every change rewrites
// the group's own transform as rotate/scale about its joint, so pivots never drift.
const rigs = new WeakMap();
export function rig(g) {
  if (rigs.has(g)) return rigs.get(g);
  const key = [...g.classList].find((c) => PIVOT[c]);
  const [cx, cy] = PIVOT[key] || [0, 0];
  const st = { r: 0, x: 0, y: 0, sx: 1, sy: 1 };
  const apply = () =>
    g.setAttribute("transform", `translate(${st.x + cx} ${st.y + cy}) rotate(${st.r}) scale(${st.sx} ${st.sy}) translate(${-cx} ${-cy})`);
  const p = {};
  for (const k of Object.keys(st)) Object.defineProperty(p, k, { get: () => st[k], set: (v) => { st[k] = v; apply(); }, enumerable: true });
  rigs.set(g, p);
  return p;
}
// rig for a group inside a puppet (or anywhere under root)
export const R = (root, sel) => rig(root.querySelector(sel));

const PROPS = {
  glass: `<line x1="90" y1="201" x2="95" y2="189" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="99" cy="178" r="11" fill="rgba(241,233,218,.35)" stroke="${INK}" stroke-width="3"/>`,
  pencil: `<g transform="rotate(-18 90 201)"><rect x="86" y="160" width="8" height="42" fill="#f6d36b" stroke="${INK}" stroke-width="1.5"/>
    <path d="M86 160 L90 147 L94 160 Z" fill="#e6c49a" stroke="${INK}" stroke-width="1.5"/></g>`,
  check: `<line x1="90" y1="201" x2="94" y2="183" stroke="${INK}" stroke-width="3"/>
    <rect x="82" y="160" width="26" height="22" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
    <path d="M88 171 l4 4 l9 -9" fill="none" stroke="#4f8f5e" stroke-width="3"/>`,
  // crew props
  wrench: `<g transform="rotate(-24 90 201)"><rect x="87" y="166" width="6" height="36" rx="2" fill="#9aa0a6" stroke="${INK}" stroke-width="1.5"/>
    <path d="M82 170 a9 9 0 1 1 16 0 l-4 -6 h-8 z" fill="#9aa0a6" stroke="${INK}" stroke-width="1.5"/></g>`,
  book: `<g transform="rotate(-10 90 201)"><rect x="78" y="166" width="26" height="32" rx="2" fill="#2f4fb5" stroke="${INK}" stroke-width="2"/>
    <rect x="101" y="168" width="4" height="28" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
    <path d="M84 176 h14 M84 182 h10" stroke="${PAPER}" stroke-width="2"/></g>`,
  clip: `<g transform="rotate(-8 90 201)"><rect x="78" y="160" width="28" height="36" rx="3" fill="#c9a676" stroke="${INK}" stroke-width="2"/>
    <rect x="82" y="166" width="20" height="26" fill="${PAPER}"/><rect x="86" y="156" width="12" height="7" rx="2" fill="${INK}"/>
    <path d="M85 173 h14 M85 179 h10 M85 185 h12" stroke="${INK}" stroke-width="1.5"/></g>`,
  star: `<line x1="90" y1="201" x2="94" y2="183" stroke="${INK}" stroke-width="3"/>
    <rect x="80" y="158" width="30" height="24" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
    <path d="M95 162 l2.6 5.4 l5.9 .8 l-4.3 4.1 l1 5.9 l-5.2 -2.8 l-5.2 2.8 l1 -5.9 l-4.3 -4.1 l5.9 -.8 z" fill="#f6d36b" stroke="${INK}" stroke-width="1.2"/>`,
};

const HAT = {
  headset: `<path d="M45 116 a25 25 0 0 1 50 0" fill="none" stroke="${INK}" stroke-width="4"/>
    <rect x="40" y="108" width="9" height="17" rx="3" fill="${INK}"/><rect x="91" y="108" width="9" height="17" rx="3" fill="${INK}"/>
    <path d="M45 124 q2 13 17 11" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="63" cy="135" r="3.2" fill="#ec4a2c"/>`,
  beret: `<path d="M48 104 q4 -18 26 -18 q20 0 22 14 q-24 -4 -48 4 z" fill="#8e2a24" stroke="${INK}" stroke-width="2"/><circle cx="74" cy="85" r="3" fill="${INK}"/>`,
  glasses: `<circle cx="62" cy="116" r="7" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="78" cy="116" r="7" fill="none" stroke="${INK}" stroke-width="2"/><path d="M69 116 h2" stroke="${INK}" stroke-width="2"/>`,
  top: `<rect x="54" y="74" width="32" height="24" rx="2" fill="${INK}"/>
    <rect x="54" y="90" width="32" height="4" fill="#ec4a2c"/>
    <rect x="44" y="95" width="52" height="6" rx="3" fill="${INK}"/>`,
};

// a person's hand, coming down from above and holding the bar
const HAND = `<g class="p-hand">
    <rect x="57" y="-420" width="26" height="410" fill="#2b2622"/>
    <rect x="54" y="-26" width="32" height="12" rx="2" fill="#3a322b"/>
    <path d="M55 -14 q-4 14 4 22 h22 q8 -8 4 -22 z" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
    <path d="M60 4 h20" stroke="${INK}" stroke-width="1.5"/>
  </g>`;

export function puppetSVG({ color = "#2f4fb5", hat, prop, hand } = {}) {
  const line = ([x1, y1, x2, y2]) => `<path class="str" pathLength="1" d="M${x1} ${y1} L${x2} ${y2}"/>`;
  return `<svg viewBox="0 0 140 320" aria-hidden="true">
  <g class="p-sway">
    <g class="a-strings">${Object.values(STRINGS).map(line).join("")}</g>
    <g class="a-body">
      <g class="p-leg-l"><g class="a-leg-l">
        <rect x="54" y="208" width="12" height="58" rx="6" fill="${LEGS}" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="57" cy="268" rx="11" ry="6" fill="${INK}"/></g></g>
      <g class="p-leg-r"><g class="a-leg-r">
        <rect x="74" y="208" width="12" height="58" rx="6" fill="${LEGS}" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="83" cy="268" rx="11" ry="6" fill="${INK}"/></g></g>
      <g class="p-arm-l"><g class="a-arm-l"><g transform="rotate(14 50 156)">
        <rect x="44" y="152" width="12" height="46" rx="6" fill="${color}" stroke="${INK}" stroke-width="2"/>
        <circle cx="50" cy="201" r="7" fill="${PAPER}" stroke="${INK}" stroke-width="2"/></g></g></g>
      <rect x="47" y="146" width="46" height="68" rx="12" fill="${color}" stroke="${INK}" stroke-width="2.2"/>
      <circle cx="70" cy="166" r="2.6" fill="${INK}"/><circle cx="70" cy="184" r="2.6" fill="${INK}"/>
      <rect x="64" y="134" width="12" height="16" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
      <g class="a-head">
        <circle cx="70" cy="118" r="24" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>
        <circle cx="57" cy="126" r="4" fill="#e9a3b5" opacity=".7"/><circle cx="83" cy="126" r="4" fill="#e9a3b5" opacity=".7"/>
        <g class="a-eyes"><g class="p-blink"><circle cx="62" cy="116" r="3.2" fill="${INK}"/><circle cx="78" cy="116" r="3.2" fill="${INK}"/></g></g>
        <path class="a-mouth" d="M63 127 Q70 133 77 127" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        ${hat ? HAT[hat] : ""}
      </g>
      <g class="p-arm-r"><g class="a-arm-r"><g transform="rotate(-14 90 156)">
        <rect x="84" y="152" width="12" height="46" rx="6" fill="${color}" stroke="${INK}" stroke-width="2"/>
        ${prop ? PROPS[prop] : ""}
        <circle cx="90" cy="201" r="7" fill="${PAPER}" stroke="${INK}" stroke-width="2"/></g></g></g>
    </g>
  </g>
  <g class="a-bar">
    <rect x="12" y="4" width="116" height="9" rx="4" fill="#c9a676" stroke="${INK}" stroke-width="1.5"/>
    <rect x="65" y="-6" width="10" height="28" rx="3" fill="#c9a676" stroke="${INK}" stroke-width="1.5"/>
    ${hand ? HAND : ""}
  </g>
</svg>`;
}

// gentle idle motion: the body sways under the bar, limbs dangle a little
export function idle(gsap, el, seed = 0) {
  const d = 2.4 + (seed % 3) * 0.35;
  const q = (s) => R(el, s);
  gsap.fromTo(q(".p-sway"), { r: -2.4 }, { r: 2.4, duration: d, ease: "sine.inOut", yoyo: true, repeat: -1, delay: -seed * 0.7 });
  gsap.to(q(".p-arm-l"), { r: 7, duration: d * 0.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(q(".p-arm-r"), { r: -7, duration: d * 0.9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 });
  gsap.to(q(".p-leg-l"), { r: 4, duration: d * 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(q(".p-leg-r"), { r: -4, duration: d * 0.75, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.2 });
  // blink now and then
  gsap.timeline({ repeat: -1, repeatDelay: 2.2 + seed * 0.9, delay: 1 + seed * 0.5 })
    .to(q(".p-blink"), { sy: 0.1, duration: 0.07, yoyo: true, repeat: 1 });
}

// the front row: heads and shoulders, plus one person who can stand up
export function audienceSVG() {
  const heads = [];
  for (let i = 0; i < 10; i++) {
    if (i === 7) continue;
    const x = 34 + i * 78;
    const y = 58 + ((i * 37) % 11);
    heads.push(`<path d="M${x - 44} 124 Q${x - 44} ${y + 26} ${x} ${y + 26} Q${x + 44} ${y + 26} ${x + 44} 124 Z"/><circle cx="${x}" cy="${y}" r="21"/>`);
  }
  return `<g fill="#0f0d0b">${heads.join("")}</g>
  <g class="r-human" fill="#3a302a">
    <g class="r-h-arm"><rect x="618" y="18" width="13" height="56" rx="6.5"/><circle cx="624.5" cy="18" r="9"/></g>
    <path d="M${580} 124 Q580 84 624 84 Q668 84 668 124 Z"/>
    <circle cx="624" cy="58" r="22"/>
  </g>`;
}
