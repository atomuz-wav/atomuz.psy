import { mulberry32 } from '../utils/random.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Caracteres usados na textura digital (predominam números, como na referência). */
const GLYPHS = '0123456789013689013689BEZ';

/**
 * TEXTURA DIGITAL DO LOGOTIPO ("chuva" Matrix)
 *
 * Preenche o grupo SVG com colunas de caracteres. O grupo já está recortado
 * pelo contorno do logotipo (clip-path no HTML), então os caracteres só
 * aparecem dentro das letras.
 *
 * Cada coluna é UM único <text> com listas de posições x/y (um glifo por
 * posição) — muito mais leve que um elemento por caractere.
 *
 * Como a chuva é contínua sem "pulos": o padrão de cada coluna tem altura P
 * e é desenhado DUAS vezes, uma acima da outra. A coluna desce de 0 até P e
 * volta a 0 — nesse instante a cópia de cima ocupa exatamente o lugar da de
 * baixo, então o recomeço é invisível. Em t = 0 a textura é igual à estática.
 *
 * @param {SVGGElement} group
 * @param {object} [options]
 */
export function createLogoMatrix(group, {
  seed = 7,
  bounds = { x0: 186, x1: 1862, y0: 894, y1: 1130 },
  colStep = 15,
  rowStep = 15,
} = {}) {
  const rand = mulberry32(seed);
  const rows = Math.ceil((bounds.y1 - bounds.y0) / rowStep) + 1;
  const period = rows * rowStep;
  const fragment = document.createDocumentFragment();
  const columns = [];

  for (let x = bounds.x0 + colStep / 2; x < bounds.x1; x += colStep) {
    // Padrão da coluna: trechos "ligados" e "desligados" criam falhas
    const pattern = [];
    let on = rand() < 0.65;
    let remaining = runLength(on, rand);
    for (let r = 0; r < rows; r++) {
      if (remaining-- <= 0) {
        on = !on;
        remaining = runLength(on, rand);
      }
      pattern.push(on ? GLYPHS[Math.floor(rand() * GLYPHS.length)] : null);
    }

    const offset = rand() * rowStep;
    const xs = [];
    const ys = [];
    let chars = '';
    for (const copy of [-1, 0]) {
      pattern.forEach((glyph, r) => {
        if (!glyph) return;
        xs.push(x.toFixed(1));
        ys.push((bounds.y0 + offset + r * rowStep + copy * period).toFixed(1));
        chars += glyph;
      });
    }

    const opacity = (0.6 + rand() * 0.4).toFixed(2);
    const speed = 9 + rand() * 15;              // unidades/s (≈ 0,6 a 1,6 linha por segundo)
    if (!chars) continue;

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', xs.join(' '));
    text.setAttribute('y', ys.join(' '));
    text.setAttribute('opacity', opacity);
    text.textContent = chars;
    fragment.appendChild(text);

    columns.push({ el: text, speed, original: chars, chars: [...chars] });
  }

  group.replaceChildren(fragment);

  // Troca ocasional de caracteres (dá vida à textura). Aleatório "de verdade"
  // aqui não importa: não afeta a composição estática.
  let nextMutation = 0;

  function mutate(time) {
    if (time < nextMutation) return;
    nextMutation = time + 0.09;
    const col = columns[Math.floor(Math.random() * columns.length)];
    const half = col.chars.length / 2;          // as duas cópias têm o mesmo tamanho
    const i = Math.floor(Math.random() * half);
    const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    col.chars[i] = glyph;
    col.chars[i + half] = glyph;                // mantém as cópias idênticas
    col.el.textContent = col.chars.join('');
  }

  return {
    update(time) {
      for (const col of columns) {
        const y = (time * col.speed) % period;
        col.el.setAttribute('transform', `translate(0 ${y.toFixed(2)})`);
      }
      if (time > 0) mutate(time);
    },

    reset() {
      nextMutation = 0;
      for (const col of columns) {
        col.el.removeAttribute('transform');
        col.chars = [...col.original];
        col.el.textContent = col.original;
      }
    },
  };
}

function runLength(on, rand) {
  return on ? 3 + Math.floor(rand() * 9) : 1 + Math.floor(rand() * 2);
}
