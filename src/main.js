import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { puppetSVG, idle, audienceSVG, STRINGS, R } from "./puppet.js";

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) {
  body.classList.add("plain");
  body.classList.remove("is-loading");
} else {
  document.fonts.ready.then(start);
}

/* ---------- text splitting ---------- */

function splitWords(el) {
  const nodes = [...el.childNodes];
  el.textContent = "";
  for (const n of nodes) {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return el.append(" ");
        wrapWord(el, document.createTextNode(part));
      });
    } else wrapWord(el, n);
  }
}
function wrapWord(parent, node) {
  const w = document.createElement("span");
  w.className = "w";
  const i = document.createElement("span");
  i.className = "wi";
  i.append(node);
  w.append(i);
  parent.append(w);
}
function splitChars(el) {
  const text = el.textContent;
  el.textContent = "";
  return [...text].map((c) => {
    const s = document.createElement("span");
    s.textContent = c;
    s.style.opacity = 0;
    el.append(s);
    return s;
  });
}

/* ---------- build the cast ---------- */

function buildCast() {
  $$(".pup").forEach((el, i) => {
    el.innerHTML = puppetSVG({ color: el.dataset.color, hat: el.dataset.hat, prop: el.dataset.prop, hand: el.dataset.hand === "1" });
    if (el.dataset.idle !== "0") idle(gsap, el, i);
  });
  $(".r-aud").innerHTML = audienceSVG();

  // the job: name each string where it hangs
  const tags = $(".j-tags");
  const at = (k, t) => {
    const [x1, y1, x2, y2] = STRINGS[k];
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
  };
  const place = [
    ["tools", ...at("handL", 0.3), -1],
    ["memory", ...at("kneeL", 0.62), -1],
    ["middleware", ...at("head", 0.45), 0],
    ["sandboxes", ...at("handR", 0.3), 1],
    ["evals", ...at("kneeR", 0.62), 1],
    ["people", 92, -60, 1],
  ];
  for (const [name, x, y, side] of place) {
    const s = document.createElement("span");
    s.className = "j-tag" + (name === "people" ? " j-tag--people" : "");
    s.textContent = name;
    s.style.left = `${(x / 140) * 100}%`;
    s.style.top = `${(y / 320) * 100}%`;
    s.style.transform = side < 0 ? "translate(calc(-100% - 16px), -50%)" : side > 0 ? "translate(16px, -50%)" : "translate(-50%, -50%)";
    tags.append(s);
  }
}

/* ---------- the show ---------- */

function start() {
  buildCast();
  $$(".split").forEach(splitWords);
  $$(".h-title > span").forEach((s) => {
    const t = s.textContent;
    s.textContent = "";
    [...t].forEach((c) => {
      const ch = document.createElement("span");
      ch.className = "ch";
      ch.textContent = c;
      s.append(ch);
    });
  });
  const homeType = $$(".r-home .type").map(splitChars);
  const bubbleType = splitChars($(".rb-t .type"));

  body.classList.remove("is-loading");

  const stage = $("#stage");
  const dot = $("#dot");
  const dotI = $("#dot i");
  const dotB = $("#dot b");
  gsap.set(dot, { xPercent: -50, yPercent: -100, transformOrigin: "50% 100%" });
  gsap.set(".h-card, .x-card, .r-report", { xPercent: -50 });
  gsap.set(".x-card", { yPercent: -46 });

  // a point on an element, relative to its room at rest (so room slides don't skew it)
  const spot = (el, ax = 0.5, ay = 0) => {
    if (typeof el === "string") el = $(el);
    const room = el.closest(".room") || stage;
    const r = el.getBoundingClientRect();
    const rr = room.getBoundingClientRect();
    return { x: r.left - rr.left + r.width * ax, y: r.top - rr.top + r.height * ay };
  };
  const dotScaleFor = (el) => el.getBoundingClientRect().width / dot.offsetWidth;

  /* smooth scroll */
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* opening, on load */
  const home = spot(".h-slot", 0.5, 1);
  gsap.set(dot, { x: home.x, y: -60, scale: dotScaleFor($(".h-slot")) });
  const intro = gsap.timeline({ delay: 0.2, onComplete: () => lenis.start() });
  intro
    .from(".h-safi .ch", { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" })
    .from(".h-md .ch", { opacity: 0, x: -10, duration: 0.4, stagger: 0.05 }, "-=.3")
    .to(dot, { y: home.y, duration: 0.9, ease: "bounce.out" }, "-=.5")
    .fromTo(dotI, { scaleY: 1 }, { scaleY: 0.7, scaleX: 1.3, duration: 0.06, yoyo: true, repeat: 1 }, "-=.62")
    .from(".r-home .meta, .hud", { opacity: 0, duration: 0.5 }, "<")
    .from(".h-card", { y: "-80vh", rotation: -4, duration: 0.9, ease: "back.out(1.2)" }, "-=.3");
  homeType.forEach((chars, i) => intro.to(chars, { opacity: 1, duration: 0.01, stagger: 0.012 }, i === 0 ? "-=.2" : ">+.05"));
  intro.from(".r-home .hint", { opacity: 0, y: 10, duration: 0.5 });

  /* ---------- the scroll timeline ---------- */
  const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });
  const rooms = Object.fromEntries($$(".room").map((r) => [r.dataset.label, r]));
  const order = ["home", "job", "run", "crew", "eval", "bench", "trail", "kit", "end"];
  const labels = [];
  const mark = (id) => {
    tl.addLabel(id);
    labels.push({ id, name: rooms[id].dataset.name });
  };
  const hold = (d = 0.6) => tl.to({}, { duration: d });

  // set a start state now, animate to the natural state (reliable with staggers)
  const NATURAL = { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 };
  const TIMING = ["duration", "stagger", "ease"];
  const from = (t, vars, at) => {
    const s = {}, e = {};
    for (const [k, v] of Object.entries(vars)) {
      if (TIMING.includes(k)) e[k] = v;
      else if (k in NATURAL) { s[k] = v; e[k] = NATURAL[k]; }
      else { s[k] = v; e[k] = v; }
    }
    gsap.set(t, s);
    return tl.to(t, e, at);
  };
  const rise = (sel, at) => from(sel, { yPercent: 110, duration: 0.45, stagger: 0.06, ease: "power2.out" }, at);

  /* the dot's moves */
  const squash = (k = 1) => {
    tl.to(dotI, { scaleX: 1 + 0.5 * k, scaleY: 1 - 0.4 * k, duration: 0.05, ease: "power1.out" });
    tl.to(dotI, { scaleX: 1, scaleY: 1, duration: 0.28, ease: "elastic.out(1, .35)" });
  };
  // arc from wherever the dot is to a point on an element; lands with a squash
  const hop = (target, { ax = 0.5, ay = 0, h = 120, d = 0.6, at, land = true, spin = 0 } = {}) => {
    const P = () => spot(target, ax, ay);
    tl.to(dot, { x: () => P().x, duration: d, ease: "power1.inOut" }, at);
    if (spin) tl.to(dotB, { rotation: `+=${spin}`, duration: d }, "<");
    tl.to(dot, { y: () => Math.min(gsap.getProperty(dot, "y"), P().y) - h, duration: d * 0.45, ease: "power2.out" }, "<");
    tl.to(dot, { y: () => P().y, duration: d * 0.55, ease: "power2.in" });
    if (land) squash();
  };
  // little decaying bounces in place
  const bounce = (n = 2, h = 36) => {
    for (let i = 0; i < n; i++, h *= 0.45) {
      tl.to(dot, { y: `-=${h}`, duration: 0.11, ease: "power2.out" });
      tl.to(dot, { y: `+=${h}`, duration: 0.11, ease: "power2.in" });
      squash(0.6);
    }
  };
  const sideW = () => getComputedStyle(document.documentElement).getPropertyValue("--side").trim();

  /* 0 · home → the curtains open */
  mark("home");
  hold(0.4);
  tl.to(".r-home .hint", { opacity: 0, duration: 0.2 }, 0);
  tl.set(rooms.job, { visibility: "visible" });
  tl.to(".h-card", { y: "-110vh", duration: 0.9, ease: "power2.in" });
  tl.to(".h-title", { y: "-60vh", duration: 1, ease: "power2.in" }, "<.1");
  tl.to(".r-home .meta", { opacity: 0, duration: 0.3 }, "<");
  tl.to(dot, { scale: 1, duration: 0.5 }, "<");
  tl.to(".curtain", { width: sideW, duration: 1.3, ease: "power2.inOut" }, "<.2");
  tl.set(rooms.home, { visibility: "hidden" });

  /* 1 · the job: a puppet on the floor gets its strings */
  const job = rooms.job;
  const jq = (s) => job.querySelector(s);
  gsap.set(R(job, ".a-bar"), { y: -420 });
  gsap.set(jq(".a-strings .str"), { strokeDashoffset: 1 });
  gsap.set(R(job, ".a-body"), { r: -82, x: 6 });
  gsap.set(R(job, ".a-arm-l"), { r: 70 });
  gsap.set(R(job, ".a-arm-r"), { r: -40 });
  gsap.set(R(job, ".a-leg-r"), { r: 24 });
  gsap.set(R(job, ".a-eyes"), { sy: 0.12 });
  gsap.set(R(job, ".a-head"), { r: 18 });

  mark("job");
  from(".r-job .head", { opacity: 0, y: 20, duration: 0.3 }, "<-.6");
  // the dot drops off the title onto the stage floor, next to the puppet
  hop(".j-art", { ax: 1.6, ay: 1, h: 60, d: 0.8, at: "<" });
  bounce(2, 40);
  rise(".j-l1 .wi");
  hold(0.3);
  rise(".j-l2 .wi");
  hop(".j-slot2", { ay: 1, h: 160, d: 0.7 });
  hold(0.3);
  // the hand brings the bar down, the strings drop, the puppet stands
  tl.to(R(job, ".a-bar"), { y: 0, duration: 0.9, ease: "power2.out" });
  tl.to(jq(".a-strings .str"), { strokeDashoffset: 0, duration: 0.5, stagger: 0.08 }, "-=.3");
  $$(".j-tag").forEach((t, i) => from(t, { opacity: 0, scale: 0.6, duration: 0.25, ease: "back.out(2)" }, i ? "<.08" : "<.2"));
  tl.to(R(job, ".a-body"), { r: 0, x: 0, duration: 0.8, ease: "back.out(1.4)" }, "-=.2");
  tl.to(R(job, ".a-arm-l"), { r: 0, duration: 0.5 }, "<.2");
  tl.to(R(job, ".a-arm-r"), { r: 0, duration: 0.5 }, "<");
  tl.to(R(job, ".a-leg-r"), { r: 0, duration: 0.5 }, "<");
  tl.to(R(job, ".a-head"), { r: 0, duration: 0.4 }, "<");
  tl.to(R(job, ".a-eyes"), { sy: 1, duration: 0.15 }, "<.3");
  // the dot hops onto its head, it waves
  hop(".pup--job", { ay: 94 / 320, h: 150, d: 0.6 });
  tl.to(R(job, ".a-arm-r"), { r: -150, duration: 0.3, ease: "power2.out" });
  tl.to(R(job, ".a-arm-r"), { r: -120, duration: 0.15, yoyo: true, repeat: 3 });
  tl.to(R(job, ".a-arm-r"), { r: 0, duration: 0.3 });
  tl.to(".j-say", { opacity: 0.3, duration: 0.3 }, "<");
  rise(".j-l3 .wi", "<");
  hop(".j-slot3", { ay: 1, h: 120, d: 0.7 });
  bounce(1, 26);
  hold(0.8);

  // set change: the next room comes up from below
  const change = (from_, to) => {
    tl.set(rooms[to], { visibility: "visible", yPercent: 100 });
    tl.to(rooms[to], { yPercent: 0, duration: 0.9, ease: "power2.inOut" });
    tl.to(rooms[from_], { yPercent: -20, duration: 0.9, ease: "power2.inOut" }, "<");
    tl.set(rooms[from_], { visibility: "hidden" });
  };
  change("job", "run");

  /* 2 · a run */
  const caps = $$(".r-cap");
  const cap = (i, at) => {
    if (i > 0) tl.to(caps[i - 1], { opacity: 0, y: -24, duration: 0.25 }, at);
    tl.fromTo(caps[i], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, i > 0 ? "<.1" : at);
  };
  const lead = $(".r-lead");
  const w = [$(".r-w1"), $(".r-w2"), $(".r-w3")];
  mark("run");
  from(".r-run .head, .r-role, .r-stack", { opacity: 0, y: 16, duration: 0.3, stagger: 0.08 }, "<-.4");
  from(".r-p", { y: "-70vh", duration: 0.7, stagger: 0.1, ease: "back.out(1.1)" }, "<");
  from(".r-name", { opacity: 0, duration: 0.3, stagger: 0.05 }, "<.4");
  // 01 · a task comes down
  cap(0);
  from(".r-task", { y: "-70vh", duration: 0.7, ease: "power2.out" }, "<");
  tl.to(".st--run", { opacity: 1, duration: 0.2 }, "<");
  hop(lead, { ay: 74 / 320, h: 140, d: 0.7 });
  hold(0.3);
  // 02 · the lead splits it
  cap(1);
  tl.to(R(lead, ".a-arm-r"), { r: -95, duration: 0.3, ease: "power2.out" }, "<");
  $$(".r-slip").forEach((s, i) => {
    tl.fromTo(s, { opacity: 1, left: "8%", top: "34%", rotation: 0 },
      { left: `${41 + i * 21}%`, top: "29%", rotation: 300 + i * 40, duration: 0.5, ease: "power1.inOut", immediateRender: false }, i ? "<.15" : ">");
    tl.to(R(w[i], ".a-arm-l"), { r: 30, duration: 0.12, yoyo: true, repeat: 3 }, ">-.05");
  });
  tl.to(".r-slip", { opacity: 0, duration: 0.2 });
  tl.to(R(lead, ".a-arm-r"), { r: 0, duration: 0.3 }, "<");
  hold(0.2);
  // 03 · one worker stops
  cap(2);
  tl.to(R(w[0], ".a-head"), { r: -16, duration: 0.3 }, "<");
  hop(w[0], { ay: 94 / 320, h: 120, d: 0.7 });
  tl.to(R(w[0], ".a-eyes"), { sy: 1.6, duration: 0.1 }, "<");
  from(".r-q", { opacity: 0, scale: 0, duration: 0.3, ease: "back.out(3)" });
  hop(".r-q", { h: 70, d: 0.45 });
  hold(0.2);
  // 04 · pause, checkpoint, ask a person
  cap(3);
  tl.to(".st--run", { opacity: 0, duration: 0.15 }, "<");
  tl.to(".st--pause", { opacity: 1, duration: 0.15 });
  tl.to(".r-dim", { opacity: 0.55, duration: 0.4 }, "<");
  tl.to(".r-human", { y: -26, duration: 0.35, ease: "back.out(2)" });
  tl.fromTo(R(document, ".r-h-arm"), { r: 180 }, { r: 0, duration: 0.35, ease: "back.out(2)" }, "<.1");
  hold(0.3);
  // 05 · the answer comes back
  cap(4);
  from(".r-bubble", { opacity: 0, y: 20, scale: 0.8, duration: 0.3, ease: "back.out(2)" }, "<");
  tl.to(bubbleType, { opacity: 1, duration: 0.01, stagger: 0.025 });
  tl.to(".st--pause", { opacity: 0, duration: 0.15 });
  tl.to(".st--resume", { opacity: 1, duration: 0.15 });
  tl.to(".r-dim", { opacity: 0, duration: 0.4 }, "<");
  tl.to(".r-q", { y: 60, opacity: 0, rotation: 30, duration: 0.4, ease: "power2.in" }, "<");
  hop(w[0], { ay: 94 / 320, h: 50, d: 0.4, at: "<" });
  tl.to(R(w[0], ".a-head"), { r: 0, duration: 0.3 });
  tl.to(R(w[0], ".a-eyes"), { sy: 1, duration: 0.1 }, "<");
  w.forEach((p, i) => tl.to(R(p, ".a-arm-r"), { r: -40, duration: 0.12, yoyo: true, repeat: 3 }, i ? "<.05" : ">"));
  tl.to(".r-human", { y: 0, duration: 0.3 }, "<");
  tl.to(".r-bubble", { opacity: 0, duration: 0.3 }, "<");
  hold(0.3);
  // 06 · the report comes down
  cap(5);
  tl.to(".st--resume", { opacity: 0, duration: 0.15 }, "<");
  tl.to(".st--done", { opacity: 1, duration: 0.15 });
  tl.fromTo(".r-report", { opacity: 1, y: "-80vh" }, { y: 0, duration: 0.7, ease: "bounce.out" }, "<");
  from(".rp-row", { opacity: 0, x: -10, duration: 0.15, stagger: 0.07 });
  hop(".r-report", { ax: 0.86, h: 140, d: 0.7 });
  bounce(2, 30);
  hold(0.8);
  change("run", "crew");

  /* 3 · the crew: the dot visits each job, each one does its thing */
  mark("crew");
  from(".r-crew .head", { opacity: 0, y: 16, duration: 0.3 }, "<-.3");
  rise(".c-say .wi");
  from(".c-p", { y: "-80vh", duration: 0.7, stagger: 0.08, ease: "back.out(1.1)" }, "<.1");
  from(".c-role", { opacity: 0, duration: 0.3, stagger: 0.05 });
  const crew = $$(".c-p");
  const cards = $$(".c-card");
  const lit = (i) => spot(crew[i], 0.5, 1);
  tl.set(".c-spot", { x: () => lit(0).x, y: () => lit(0).y });
  crew.forEach((p, i) => {
    hop(p, { ay: 94 / 320, h: i ? 90 : 160, d: i ? 0.55 : 0.7 });
    tl.to(".c-spot", { opacity: 1, x: () => lit(i).x, duration: 0.3 }, "<-.2");
    if (i) tl.to(cards[i - 1], { opacity: 0, y: -16, duration: 0.2 }, "<");
    tl.fromTo(cards[i], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25, immediateRender: false }, "<.1");
    if (i) tl.to(R(crew[i - 1], ".a-arm-r"), { r: 0, duration: 0.25 }, "<");
    // the bit: a little jump with the prop held up
    tl.to(R(p, ".a-body"), { y: -14, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" });
    tl.to(R(p, ".a-arm-r"), { r: -130, duration: 0.3, ease: "back.out(2)" }, "<");
    tl.to(R(p, ".a-head"), { r: i % 2 ? 10 : -10, duration: 0.15, yoyo: true, repeat: 1 }, "<");
    hold(0.55);
  });
  tl.to(R(crew[4], ".a-arm-r"), { r: 0, duration: 0.25 });
  tl.to(".c-spot", { opacity: 0, duration: 0.3 }, "<");
  hold(0.4);
  change("crew", "eval");

  /* 4 · found, missed, invented */
  mark("eval");
  from(".r-eval .head", { opacity: 0, y: 16, duration: 0.3 }, "<-.3");
  rise(".e-say .wi");
  from(".bin__box", { yPercent: 120, opacity: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.5)" });
  $$(".chip").forEach((c, i) => from(c, { y: "-60vh", rotation: gsap.utils.random(-14, 14), opacity: 0, duration: 0.45, ease: "bounce.out" }, i ? "<.16" : ">"));
  const boxes = $$(".bin__box");
  hop(boxes[0], { ax: 0.88, h: 160, d: 0.7 });
  bounce(1, 24);
  hop(boxes[1], { ax: 0.88, h: 110, d: 0.55 });
  bounce(1, 24);
  hop(".chip--bad", { ax: 0.5, h: 130, d: 0.55 });
  tl.to(".chip s", { scaleX: 1, duration: 0.25, ease: "power2.out" }, "<");
  tl.to(".chip--bad", { rotation: 9, y: 8, opacity: 0.75, duration: 0.25 }, "<");
  hop(boxes[2], { ax: 0.88, h: 60, d: 0.45 });
  from(".e-note", { opacity: 0, y: 16, duration: 0.4 });
  hold(0.8);
  change("eval", "bench");

  /* 4 · other shows: walk past the posters, the dot rolls along the floor */
  mark("bench");
  from(".r-bench .head", { opacity: 0, y: 16, duration: 0.3 }, "<-.3");
  from(".card", { y: "40vh", duration: 0.6, stagger: 0.1, ease: "power2.out" }, "<");
  hop(".b-floor", { ax: 0.12, ay: 0, h: 120, d: 0.7 });
  const track = $(".b-track");
  const travel = () => -(track.scrollWidth - window.innerWidth);
  tl.to(track, { x: travel, duration: 4.5 });
  tl.to(dot, { x: () => spot(".b-floor", 0.82, 0).x, duration: 4.5, ease: "sine.inOut" }, "<");
  tl.to(dotB, { rotation: "+=1440", duration: 4.5, ease: "sine.inOut" }, "<");
  hold(0.4);
  change("bench", "trail");

  /* 5 · the trail */
  mark("trail");
  from(".r-trail .head, .t-cmd", { opacity: 0, y: 14, duration: 0.3, stagger: 0.1 }, "<-.3");
  $$(".t-row").forEach((r) => {
    from(r, { opacity: 0, duration: 0.01 });
    from(r.children, { opacity: 0, x: -12, duration: 0.2, stagger: 0.05 }, "<");
    tl.to({}, { duration: 0.15 });
  });
  hop(".t-here", { ax: 1.06, ay: 0.85, h: 140, d: 0.7 });
  bounce(1, 20);
  from(".t-cur", { opacity: 0, duration: 0.01 });
  hop(".t-caret", { ax: 2.4, ay: 1, h: 60, d: 0.5 });
  hold(0.8);
  change("trail", "kit");

  /* 6 · the kit: the dot hops down the rails, the tags swing */
  mark("kit");
  from(".r-kit .head", { opacity: 0, y: 16, duration: 0.3 }, "<-.3");
  from(".rail__k", { x: -30, opacity: 0, duration: 0.3, stagger: 0.06 }, "<");
  from(".rail__tags span", { y: -30, opacity: 0, rotation: () => gsap.utils.random(-25, 25), duration: 0.35, stagger: 0.008, ease: "back.out(2)" }, "<.2");
  $$(".rail").forEach((r, i) => {
    hop(r.querySelector(".rail__k"), { ax: 0.75, h: i ? 50 : 140, d: i ? 0.4 : 0.6 });
    tl.fromTo(r.querySelectorAll(".rail__tags span"), { rotation: (k) => (k % 2 ? 9 : -9) },
      { rotation: 0, duration: 0.5, stagger: 0.015, ease: "elastic.out(1, .3)" }, "<");
  });
  hold(0.8);

  /* 7 · curtain call: the curtains close, the card comes down */
  tl.set(rooms.end, { visibility: "visible" });
  tl.to(".curtain", { width: "50.5%", duration: 1.2, ease: "power2.inOut" });
  tl.set(rooms.kit, { visibility: "hidden" });
  mark("end");
  from(".x-card", { y: "-110vh", rotation: 3, duration: 0.9, ease: "back.out(1.1)" }, "<.3");
  hop(".x-slot", { ay: 1, h: 120, d: 0.7 });
  bounce(2, 30);
  // a bow
  tl.to(dotI, { scaleY: 0.55, scaleX: 1.25, duration: 0.3, ease: "power2.inOut", yoyo: true, repeat: 1 });
  hold(0.6);

  /* tie the timeline to the scroll */
  const UNIT = 40; // vh of scroll per second of timeline
  const scrollEl = $("#scroll");
  scrollEl.style.height = `calc(${Math.round(tl.duration() * UNIT)}vh + 100vh)`;
  const progBar = $(".progress i");
  labels.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const hereAt = (t) => {
    let cur = labels[0].id;
    for (const l of labels) if (tl.labels[l.id] <= t + 0.3) cur = l.id;
    return cur;
  };

  const trig = ScrollTrigger.create({
    trigger: scrollEl,
    start: "top top",
    end: "bottom bottom",
    animation: tl,
    scrub: 0.6,
    invalidateOnRefresh: true,
    onUpdate(self) {
      progBar.style.transform = `scaleX(${self.progress})`;
    },
  });

  const scrollToLabel = (id, immediate = false) => {
    const t = tl.labels[id] ?? 0;
    const lead = id === "home" ? 0 : 0.8;
    const p = Math.min(1, (t + lead) / tl.duration());
    lenis.scrollTo(trig.start + (trig.end - trig.start) * p, { immediate, duration: 1.6 });
  };

  /* index */
  const list = $(".index__list");
  labels.forEach((l, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<button data-go="${l.id}" tabindex="-1"><span>${String(i).padStart(2, "0")}</span>${l.name}</button>`;
    list.append(li);
  });
  const nav = $(".index");
  const navBtn = $(".hud-index");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    navBtn.classList.toggle("is-open", open);
    if (open) {
      const cur = hereAt(tl.time());
      $$(".index__list button").forEach((b) => b.classList.toggle("is-here", b.dataset.go === cur));
    }
    open ? lenis.stop() : lenis.start();
  };
  navBtn.addEventListener("click", () => {
    if (body.classList.contains("reading")) return leaveReading();
    setNav(!nav.classList.contains("is-open"));
  });
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    setNav(false);
    scrollToLabel(b.dataset.go);
  });
  $(".hud-mark").addEventListener("click", () => scrollToLabel("home"));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) setNav(false);
  });

  /* plain-text reading mode */
  let savedY = 0;
  const enterReading = (e) => {
    e?.preventDefault();
    savedY = window.scrollY;
    setNav(false);
    lenis.stop();
    body.classList.add("reading");
    window.scrollTo(0, 0);
  };
  const leaveReading = () => {
    body.classList.remove("reading");
    lenis.start();
    ScrollTrigger.refresh();
    window.scrollTo(0, savedY);
    lenis.scrollTo(savedY, { immediate: true });
  };
  $$(".index__plain, .x-plain").forEach((a) => a.addEventListener("click", enterReading));

  ScrollTrigger.refresh();
  if (import.meta.env.DEV) window.__film = { tl, trig, lenis, scrollToLabel };
}
