/**
 * ATOMUZ — ponto de entrada da Hero.
 *
 * Etapa 1 · layout estático (aprovado)
 * Etapa 2 · partículas (Three.js) e sistema atômico animados (aprovado)
 * Etapa 3 · circuitos/HUD animados e textura digital no logo (aprovado)
 * Etapa 4 · interatividade, sequência de entrada e transição ENTER  ← atual
 *
 * Tudo continua funcionando em camadas:
 *  - sem JS ................ Hero completa e estática (HTML/SVG);
 *  - sem WebGL/Three.js .... partículas estáticas em Canvas 2D;
 *  - sem GSAP .............. sem sequência de entrada; ENTER vira âncora comum;
 *  - movimento reduzido .... quadro inicial fixo, idêntico à referência.
 *
 * Próxima etapa (aguardando aprovação):
 *  5 · refinamento (responsividade, acessibilidade, performance)
 */
import { AnimationLoop } from './core/loop.js';
import { prefersReducedMotion, onMotionPreferenceChange } from './core/motion.js';
import { Interaction } from './core/interaction.js';
import { completeIntro, resetFx } from './core/state.js';
import { createLogoMatrix } from './modules/logo-matrix.js';
import { createLogoEnergy } from './modules/logo-energy.js';
import { createCircuitSystem } from './modules/circuit-system.js';
import { createHudSystem } from './modules/hud-system.js';
import { createDepthLayers } from './modules/depth-layers.js';
import { createWaveField, ParticleCanvas } from './modules/particle-field.js';
import { createAtomSystem } from './modules/atom-system.js';
import { playIntro } from './modules/intro-sequence.js';
import { setupEnterTransition } from './modules/enter-transition.js';
import { createSectionReveal } from './modules/section-reveal.js';
import { createAtomDiagram } from './modules/atom-diagram.js';
import { initBookingForm } from './modules/booking-form.js';

const hero = document.querySelector('.hero');
const stage = document.querySelector('[data-stage]');
const loop = new AnimationLoop(hero);
const interaction = new Interaction(hero, stage);
const getCanvas = () => document.querySelector('[data-particles]');

function debounce(fn, wait) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), wait);
  };
}

/* ---------- Densidade de partículas conforme o dispositivo ---------- */
function particleDensity() {
  if (window.matchMedia('(max-width: 768px)').matches) return 0.55;
  const cores = navigator.hardwareConcurrency || 8;
  return cores <= 4 ? 0.75 : 1;
}

function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Cria o renderizador de partículas: Three.js quando possível,
 * Canvas 2D estático como alternativa (CDN fora do ar, WebGL indisponível…).
 */
async function createParticles(canvas, field) {
  if (supportsWebGL()) {
    try {
      // Import dinâmico: o Three.js só é baixado se houver WebGL
      const { createParticleRenderer } = await import('./modules/particle-webgl.js');
      return { canvas, renderer: createParticleRenderer(canvas, stage, field, interaction) };
    } catch (error) {
      console.warn('[ATOMUZ] Three.js indisponível; usando partículas estáticas.', error);
      // Um canvas que já tentou WebGL não aceita contexto 2D: troca por um novo
      const fresh = canvas.cloneNode(false);
      canvas.replaceWith(fresh);
      canvas = fresh;
    }
  }
  return { canvas, renderer: new ParticleCanvas(canvas, stage, field) };
}

async function initParticles() {
  const initial = getCanvas();
  if (!initial || !stage) return;

  const field = createWaveField({ density: particleDensity() });
  const { canvas, renderer } = await createParticles(initial, field);

  renderer.resize();
  loop.add(renderer);
  requestAnimationFrame(() => canvas.classList.add('is-ready'));

  // Recalcula tamanho/posição quando a hero ou o palco mudam
  const onResize = debounce(() => renderer.resize(), 120);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);
    observer.observe(stage);
  } else {
    window.addEventListener('resize', onResize);
  }
  // As fontes podem alterar levemente a altura da área inferior
  document.fonts?.ready.then(() => renderer.resize());
}

/* ---------- GSAP (sequência de entrada e transição do ENTER) ---------- */
async function loadGsap() {
  try {
    const { gsap } = await import('gsap');
    return gsap;
  } catch (error) {
    console.warn('[ATOMUZ] GSAP indisponível; Hero sem sequência de entrada.', error);
    return null;
  }
}

let introSequence = null;

async function initSequences() {
  const gsap = await loadGsap();
  const booting = document.documentElement.classList.contains('is-booting');

  // A entrada só roda se a Hero ainda estiver escondida (a trava de 3 s não
  // disparou) e o usuário não pediu movimento reduzido
  if (gsap && booting && !motionOff()) {
    introSequence = playIntro(gsap, hero);
  } else {
    document.documentElement.classList.remove('is-booting');
  }

  setupEnterTransition({
    gsap,
    link: document.querySelector('.enter'),
    frame: document.querySelector('.hero__frame'),
    canvas: getCanvas,
    isMotionOff: motionOff,
  });
}

/* ---------- Movimento ---------- */

// Pausa manual (botão "Pausar animações"), lembrada entre visitas
const MOTION_KEY = 'atomuz:motion';
const motionToggle = document.querySelector('.motion-toggle');
let userPaused = readPaused();

function readPaused() {
  try { return localStorage.getItem(MOTION_KEY) === 'paused'; } catch { return false; }
}
function savePaused(paused) {
  try {
    if (paused) localStorage.setItem(MOTION_KEY, 'paused');
    else localStorage.removeItem(MOTION_KEY);
  } catch { /* armazenamento bloqueado: a escolha vale só nesta visita */ }
}

/** Movimento desligado pelo sistema OU pelo botão de pausa. */
const motionOff = () => prefersReducedMotion() || userPaused;

function syncMotionToggle() {
  if (!motionToggle) return;
  // Com "movimento reduzido" no sistema a Hero já é estática: o botão some
  motionToggle.hidden = prefersReducedMotion();
  motionToggle.setAttribute('aria-pressed', String(userPaused));
}

motionToggle?.addEventListener('click', () => {
  userPaused = !userPaused;
  savePaused(userPaused);
  applyMotionPreference(motionOff());
  syncMotionToggle();
});

// Seções após a Hero: revelação suave ao rolar (segue a mesma regra de movimento)
const sectionReveal = createSectionReveal(document.querySelector('.site-sections') || document);
const atomDiagram = createAtomDiagram(document.querySelector('[data-atom-diagram]'));
initBookingForm(document.querySelector('[data-booking-form]'));

function applyMotionPreference(reduce) {
  if (reduce) {
    sectionReveal.disable();
    atomDiagram.disable();
  } else {
    sectionReveal.enable();
    atomDiagram.enable();
  }

  if (reduce) {
    introSequence?.finish();
    completeIntro();
    resetFx();
    interaction.reset();
    loop.stop();
    loop.reset();                       // volta ao quadro da referência
    hero.classList.remove('is-animated');
  } else {
    hero.classList.add('is-animated');
    loop.start();
  }
}

/* ---------- Inicialização ---------- */

// A interação vem primeiro: os demais sistemas leem os valores já suavizados
loop.add(interaction);

const matrixGroup = document.querySelector('[data-logo-matrix]');
if (matrixGroup) loop.add(createLogoMatrix(matrixGroup));

if (stage) {
  loop.add(createDepthLayers(stage, interaction));
  loop.add(createAtomSystem(stage, interaction));
  loop.add(createLogoEnergy(stage, interaction));
  loop.add(createCircuitSystem(stage, interaction));
}
loop.add(createHudSystem(hero));

applyMotionPreference(motionOff());
syncMotionToggle();
onMotionPreferenceChange(() => {
  applyMotionPreference(motionOff());
  syncMotionToggle();
});

initParticles();
initSequences();
