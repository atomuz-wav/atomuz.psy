import { intro, fx } from '../core/state.js';

/* =========================================================================
   SISTEMA ORBITAL ATÔMICO (SVG animado)
   -------------------------------------------------------------------------
   Cada órbita é tratada como um CÍRCULO 3D visto de frente: inclinar o
   plano da órbita muda a altura (ry) da elipse, e girá-lo no plano da tela
   muda o ângulo. Animando os dois devagar, com ritmos diferentes, as órbitas
   parecem girar em eixos distintos.

   As oscilações acontecem em torno da geometria da referência e valem zero
   em t = 0: o quadro inicial (e o modo de movimento reduzido) é idêntico
   ao layout aprovado na Etapa 1.

   Etapa 4: o átomo tem um "relógio" próprio que pode acelerar (clique no
   ENTER), as órbitas são desenhadas na entrada e o núcleo reage ao cursor.
   ========================================================================= */

const TAU = Math.PI * 2;

/** Ritmo de cada órbita (mesma ordem dos <ellipse data-orbit> no HTML). */
const ORBIT_MOTION = [
  { tiltAmp: 0.18, tiltSpeed: 0.19, spinAmp: 7, spinSpeed: 0.12, glowSpeed: 0.5 },
  { tiltAmp: 0.22, tiltSpeed: 0.15, spinAmp: -9, spinSpeed: 0.1, glowSpeed: 0.37 },
];

const RIPPLE_PERIOD = 3.6;  // s — ondas de energia do núcleo
const RIPPLE_MAX = 75;      // raio máximo (unidades da referência)
const BOOST_SPEED = 2.2;    // aceleração extra das órbitas no clique do ENTER

export function createAtomSystem(svg, interaction) {
  const orbits = [...svg.querySelectorAll('[data-orbit]')].map((el, i) => {
    // pathLength="1" permite desenhar a órbita com dasharray em frações (0…1)
    el.setAttribute('pathLength', '1');
    return {
      el,
      cx: +el.getAttribute('cx'),
      cy: +el.getAttribute('cy'),
      rx: +el.getAttribute('rx'),
      ry0: +el.getAttribute('ry'),
      rot0: +el.dataset.rotate,
      motion: ORBIT_MOTION[i] ?? ORBIT_MOTION[0],
      // estado atual (atualizado a cada quadro, lido pelos elétrons)
      ry: +el.getAttribute('ry'),
      rot: +el.dataset.rotate,
    };
  });

  const axes = [...svg.querySelectorAll('#orbit-lines .axis, .axis-needle')];

  const electrons = [...svg.querySelectorAll('[data-electron]')].map((el) => ({
    el,
    orbit: orbits[+el.dataset.orbitIndex],
    speed: +el.dataset.speed,
    start: +el.dataset.start,
  }));

  const nucleus = svg.querySelector('[data-nucleus]');
  const halo = nucleus?.querySelector('[data-halo]');
  const core = nucleus?.querySelector('[data-core]');
  const field = nucleus?.querySelector('[data-field]');
  const ripples = nucleus ? [...nucleus.querySelectorAll('[data-ripple]')] : [];
  const nx = +(core?.getAttribute('cx') ?? 0);
  const ny = +(core?.getAttribute('cy') ?? 0);
  const haloR = +(halo?.getAttribute('r') ?? 70);
  const coreR = +(core?.getAttribute('r') ?? 9);

  let clock = 0;          // tempo do átomo (acelera com fx.orbitBoost)
  let drawing = false;    // órbitas em processo de desenho (entrada)

  function updateOrbits(t) {
    for (const o of orbits) {
      const m = o.motion;
      o.ry = o.ry0 * (1 + m.tiltAmp * Math.sin(t * m.tiltSpeed * TAU / 2));
      o.rot = o.rot0 + m.spinAmp * Math.sin(t * m.spinSpeed * TAU / 2);
      // Opacidade varia discretamente (1 em t = 0, mínimo 0,7)
      const glow = 1 - 0.3 * (0.5 - 0.5 * Math.cos(t * m.glowSpeed * TAU / 2));
      o.el.setAttribute('ry', o.ry.toFixed(2));
      o.el.setAttribute('transform', `rotate(${o.rot.toFixed(3)} ${o.cx} ${o.cy})`);
      o.el.style.strokeOpacity = glow.toFixed(3);
    }
  }

  /** Entrada: órbitas desenhadas como um traço que se fecha; eixos surgem. */
  function updateDraw() {
    const p = intro.orbits;
    if (p < 1) {
      drawing = true;
      for (const o of orbits) {
        o.el.style.strokeDasharray = '1 1';
        o.el.style.strokeDashoffset = (1 - p).toFixed(4);
      }
      for (const a of axes) a.style.opacity = p.toFixed(3);
    } else if (drawing) {
      drawing = false;
      clearDraw();
    }
  }

  function clearDraw() {
    for (const o of orbits) {
      o.el.style.strokeDasharray = '';
      o.el.style.strokeDashoffset = '';
    }
    for (const a of axes) a.style.opacity = '';
  }

  function updateElectrons(t) {
    for (const e of electrons) {
      const { orbit: o } = e;
      const u = e.start + t * e.speed;
      const a = (o.rot * Math.PI) / 180;
      const lx = o.rx * Math.cos(u);
      const ly = o.ry * Math.sin(u);
      const x = o.cx + lx * Math.cos(a) - ly * Math.sin(a);
      const y = o.cy + lx * Math.sin(a) + ly * Math.cos(a);
      // "frente" da órbita: elétron maior e mais brilhante
      const depth = 0.5 + 0.5 * Math.sin(u);
      const scale = 0.75 + 0.45 * depth;
      e.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`);
      e.el.style.opacity = ((0.55 + 0.45 * depth) * intro.orbits).toFixed(3);
    }
  }

  function updateNucleus(t) {
    if (!nucleus) return;
    // Pulsação suave (≈ 3 s por ciclo) + reação ao cursor + brilho do ENTER
    const beat = Math.sin(t * 2.1);
    const near = interaction?.nucleus ?? 0;
    const energy = 1 + 0.35 * near + 0.9 * fx.coreBoost;
    halo?.setAttribute('r', (haloR * (1 + 0.1 * beat) * energy).toFixed(2));
    halo?.style.setProperty('opacity', Math.min(1, 0.9 + 0.1 * beat + 0.3 * near).toFixed(3));
    core?.setAttribute('r', (coreR * (1 + 0.12 * beat) * (1 + 0.5 * fx.coreBoost)).toFixed(2));

    // Ondas de energia que se expandem e somem
    ripples.forEach((ring, i) => {
      const p = ((t + (i * RIPPLE_PERIOD) / ripples.length) % RIPPLE_PERIOD) / RIPPLE_PERIOD;
      ring.setAttribute('r', (coreR + p * RIPPLE_MAX).toFixed(2));
      ring.style.opacity = (0.5 * (1 - p) ** 1.6 * (1 + near)).toFixed(3);
    });

    // Anel tracejado girando devagar
    field?.setAttribute('transform', `rotate(${((t * 12) % 360).toFixed(2)} ${nx} ${ny})`);
  }

  function render(time) {
    updateOrbits(clock);
    updateDraw();
    updateElectrons(clock);
    updateNucleus(time);
  }

  return {
    update(time, delta = 0) {
      clock = time === 0 ? 0 : clock + delta * (1 + BOOST_SPEED * fx.orbitBoost);
      render(time);
    },

    reset() {
      clock = 0;
      drawing = false;
      clearDraw();
      render(0);
    },
  };
}
