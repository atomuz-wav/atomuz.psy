# ATOMUZ — Site oficial

Site oficial do **ATOMUZ**, projeto de progressive psytrance e zenonesque (**psytrance • science • technology**).

- **No ar:** https://atomuz.vercel.app
- **Código:** repositório `atomuz-wav/atomuz.psy` no GitHub (a Vercel publica a branch `main` sozinha)

A Hero foi construída a partir da imagem `assets/referencia-hero.jpeg` e do `BRIEFING.md`. As seções seguintes usam a mesma identidade visual.

HTML, CSS e JavaScript puros, **sem etapa de build**. Three.js (partículas) e GSAP (sequências) vêm de CDN e são **opcionais**: se não carregarem, a página continua completa.

---

## Ordem da página

**Hero** → 01 PROJETO → 02 LANÇAMENTO → 03 MÚSICA → 04 CONECTE → 05 AO VIVO → 06 MÍDIA → 07 ÁTOMO → 08 BOOKING → rodapé

| # | Seção | `id` | Conteúdo |
|---|---|---|---|
| — | Hero | `#inicio` | Logo, partículas, órbitas, circuitos, manifesto e botão ENTER |
| 01 | PROJETO | `#project` | Texto de apresentação do projeto |
| 02 | LANÇAMENTO | `#release` | Último lançamento (capa e informações) |
| 03 | MÚSICA | `#music` | Players do Spotify e do SoundCloud |
| 04 | CONECTE | `#connect` | Cartões das redes sociais |
| 05 | AO VIVO | `#live` | Próximas datas (com janelinha de ingressos) e sets ao vivo |
| 06 | MÍDIA | `#media` | Galeria de fotos em loop, com visualizador em tela cheia |
| 07 | ÁTOMO | `#atom` | Diagrama interativo da identidade visual |
| 08 | BOOKING | `#booking` | Formulário de contato, e-mails e agência |

A navbar (SOBRE, MÚSICA, AO VIVO, MÍDIA, BOOKING) leva às seções. O contêiner de todas elas é `#explorar`, destino do ENTER e do atalho "Pular introdução".

---

## Como rodar localmente

O JavaScript usa módulos ES, que **não funcionam abrindo o arquivo com duplo clique** (`file://`). É preciso um servidor local. Use o `serve.py` do projeto, que desliga o cache (toda alteração aparece ao recarregar):

```bash
cd /caminho/para/Atomuz
python3 serve.py
```

Depois abra **http://localhost:5500** no navegador.

### Testar no celular

1. Celular e computador conectados no **mesmo Wi-Fi**.
2. No computador, rode o servidor no modo rede (aqui na porta 8080):
   ```bash
   python3 serve.py --rede 8080
   ```
3. O terminal mostra o endereço para o celular, por exemplo `http://192.168.15.5:8080`. Digite-o no navegador do celular.

Se o macOS perguntar se o Python pode aceitar conexões de entrada, clique em **Permitir**. O IP muda quando você troca de rede, e o terminal sempre mostra o atual.

Para só simular o celular no Mac: no Safari, **Option + Command + R** (Modo de Design Responsivo).

---

## Estrutura

```
serve.py                     Servidor local sem cache (desenvolvimento)
tools/versionar.py           Carimba CSS/JS com ?v= no index.html (fura o cache do Safari)
index.html                   Estrutura de todo o site (HTML semântico + SVG em camadas)
css/style.css                Paleta, temas, escala, layout, hover e responsividade
js/
  script.js                  Ponto de entrada: liga os sistemas, os fallbacks e o movimento
  config.js                  Constantes (coordenadas de design, cores)
  core/
    loop.js                  Loop único de animação (pausa sozinho com a aba oculta)
    motion.js                Preferência "movimento reduzido" do sistema
    interaction.js           Cursor em coordenadas da referência, com suavização
    state.js                 Estado compartilhado (entrada e transição do ENTER)
  modules/
    — Hero —
    particle-field.js        Gera o campo de partículas (+ fallback Canvas 2D)
    particle-webgl.js        Partículas em Three.js (shader comentado)
    atom-system.js           Órbitas, elétrons e núcleo
    logo-matrix.js           Chuva de caracteres dentro das letras
    logo-energy.js           Pulsos no contorno, brilho, faíscas, faixa de luz
    circuit-system.js        Desenho, pulsos de dados e terminais dos circuitos
    hud-system.js            Indicadores, segmentos e retículas
    depth-layers.js          Parallax por camadas
    intro-sequence.js        Sequência de entrada (GSAP)
    enter-transition.js      Transição do botão ENTER (GSAP)
    — Seções —
    section-reveal.js        Revelação suave das seções ao rolar
    section-orbs.js          Orbs animados nos cabeçalhos (thinking-orbs)
    section-spectrum.js      Equalizador animado nos cabeçalhos e na navbar do celular
    code-field.js            Grade de caracteres no fundo das seções e onda ao clicar/rolar
    atom-diagram.js          Seção ÁTOMO: elétrons, parallax e partículas
    media-viewer.js          MÍDIA: visualizador de fotos em tela cheia
    image-wave.js            Onda líquida no hover das fotos (só no computador)
    lazy-embeds.js           Players do Spotify/SoundCloud carregados sob demanda
    ticket-picker.js         AO VIVO: janelinha de ingressos (WhatsApp ou Sympla)
    booking-form.js          Envio do formulário de booking (FormSubmit)
    i18n.js                  Idioma português ⇄ inglês (dicionário de traduções)
  utils/                     Aleatório com semente, ajudantes de SVG
  vendor/thinking-orbs.js    Motor dos orbs (biblioteca MIT, licença ao lado)
assets/
  ATOMUZ-.png, SpaceAge.ttf  Logo oficial e fonte de referência
  icons/                     Favicon e ícone do iPhone
  og/                        Imagem de prévia ao compartilhar o link
  media/                     Fotos da MÍDIA (AVIF, WebP e JPG, em dois tamanhos)
  releases/                  Capa do lançamento (AVIF, WebP e JPG)
  agencia/                   Logo da agência de booking
  referencia-hero.jpeg       Imagem de referência (não é usada na página)
```

---

## Onde ajustar

| O quê | Onde |
|---|---|
| Cores da identidade | variáveis no topo de `css/style.css` (`--c-neon`, `--c-tech`…) e `PALETTE` em `js/config.js` |
| Tema escuro / claro | tokens `--c-bg`, `--c-fg`, `--c-surface`… em `:root[data-theme="dark"]` (`css/style.css`); lógica no script embutido no `<head>` do `index.html` |
| Textos em inglês | dicionário `EN` em `js/modules/i18n.js` (linha `'português': 'english'`) |
| Logotipo | atributo `d` de `#wm-path` em `index.html` (já é o logo oficial vetorizado) |
| Manifesto | `<p class="manifesto">` em `index.html` |
| Links das redes | `nav__social` (navbar) e seção `#connect` em `index.html` |
| Datas e ingressos | seção `#live` e `<dialog id="tickets-dialog">` em `index.html` |
| Lançamento | seção `#release` em `index.html` e imagens em `assets/releases/` |
| Ritmo das órbitas | `ORBIT_MOTION` em `js/modules/atom-system.js` |
| Formato das ondas de partículas | `RIBBONS` em `js/modules/particle-field.js` |
| Tempos da entrada | linha do tempo em `js/modules/intro-sequence.js` |
| Prévia do link (WhatsApp, Instagram…) | metas `og:` e JSON-LD no `<head>` do `index.html` (URLs absolutas) |

**Sistema de escala:** `--u` = 1 pixel da imagem de referência (2048 px). Por isso as coordenadas do SVG e do CSS batem com as medidas da imagem.

---

## Comportamento em camadas (fallbacks)

| Situação | Resultado |
|---|---|
| Tudo carregado | Entrada animada, partículas WebGL, interação com o cursor |
| Sem GSAP (CDN fora) | Sem sequência de entrada; ENTER vira link comum |
| Sem WebGL / Three.js | Partículas estáticas em Canvas 2D; resto animado |
| Movimento reduzido no sistema ou botão "Pausar animações" | Hero parada no quadro da referência; orbs, equalizadores e grade param |
| Sem JavaScript | Site completo e estático (HTML/SVG); formulário envia pelo `action` |

### Desempenho

- Animações só rodam com o elemento na tela e a aba visível.
- **Celular e tablet:** sem a grade de caracteres em repouso; só a onda ao tocar na Hero e ao rolar as seções. Partículas e filtros mais leves.
- **Computadores fracos (até 4 núcleos):** densidade reduzida.
- Players do Spotify/SoundCloud só carregam perto da tela; GSAP e Three.js são pré-carregados.
- Fotos em AVIF/WebP, com JPG de reserva.

---

## Tema claro / escuro

O site abre **no tema escuro** (decisão do artista). A chave sol/lua na navbar ativa o tema claro (fiel à referência). A escolha fica salva no navegador e é aplicada antes da página aparecer.

## Idioma

O HTML é escrito em português. A bandeira na navbar troca para inglês (e de volta), e a escolha fica salva no navegador. Para traduzir um texto novo, acrescente a linha correspondente no dicionário de `js/modules/i18n.js`.

---

## Acessibilidade

- `<h1>`, `<main>`, títulos `<h2>` por seção e navegações com rótulos.
- Atalho **"Pular introdução"** (primeiro Tab da página).
- Botão **"Pausar animações"**: fica escondido e só aparece quando recebe foco pelo teclado, no canto inferior esquerdo da Hero. A escolha é lembrada.
  - No Safari, o Tab só passa por botões com **Option + Tab** (ou ativando em Ajustes → Avançado → "Pressionar Tab para destacar cada item").
- Respeita `prefers-reduced-motion`, `prefers-contrast: more` e o modo de alto contraste do Windows.
- Foco visível em todos os controles; hover só em dispositivos com mouse.
- Janelas (fotos e ingressos) usam `<dialog>`: Esc fecha e o foco fica preso dentro delas.

---

## Limitações conhecidas

- O verde da identidade (`#00CC22`) sobre branco tem contraste de **2,2:1**, abaixo do mínimo WCAG para texto (4,5:1). **Decisão do projeto:** manter o verde da identidade. Usuários que pedem mais contraste no sistema (`prefers-contrast: more`) recebem `#007A14` (5,5:1).
- O botão "Pausar animações" é difícil de encontrar para quem usa só mouse ou toque. Tornar o botão visível na navbar foi testado e não aprovado, porque poluía a navbar no celular.
- Testado principalmente no Chromium (navegador interno do Claude) e no Safari do usuário; Firefox recebe verificações pontuais.

---

## Fotos da seção MÍDIA

- O site usa só as versões otimizadas em `assets/media/` (`media-XX` com 1600 px e `media-XX-sm` com 800 px, em AVIF, WebP e JPG), **sem metadados** (GPS, câmera e data foram removidos).
- A pasta `assets/media/originais/` guarda os arquivos originais (~250 MB, um deles com localização GPS). Ela está no `.gitignore` e **nunca deve ser publicada**.
- Para trocar ou acrescentar fotos: coloque a original em `originais/`, gere as versões otimizadas e acrescente o `<li class="media-item">` na fileira desejada da seção `#media` (`index.html`). As cópias do loop contínuo são criadas pelo JavaScript.

---

## Formulário de BOOKING

- Envia pelo [FormSubmit](https://formsubmit.co) para **atomuz.audio@gmail.com** (o destino está no `action` do formulário, em `index.html`).
- **Ativação (uma vez):** envie uma solicitação de teste pelo site e clique em *Activate Form* no e-mail que o FormSubmit mandar. Antes disso, nada é entregue.
- Depois de ativado, dá para trocar o e-mail no `action` pelo código aleatório que o FormSubmit fornece (protege o endereço contra robôs).

---

## Fazer alterações e publicar

1. Abra esta pasta no Claude Code e peça a alteração, uma por vez.
2. Teste localmente (`python3 serve.py` → http://localhost:5500) e no celular, se for o caso.
3. Depois de aprovar, rode:
   ```bash
   python3 tools/versionar.py
   ```
   Ele atualiza os carimbos `?v=` dos arquivos alterados, para nenhum navegador (Safari incluído) usar cópia antiga.
4. Faça o commit da alteração.
5. A pasta `../ATOMUZ-PUBLICAR` é gerada a partir do último commit (sem `assets/media/originais/` e sem `.gitignore`). Envie o conteúdo dela para o repositório `atomuz-wav/atomuz.psy` no GitHub.
6. A **Vercel** publica a branch `main` sozinha em 1–2 minutos, em https://atomuz.vercel.app.

Cada commit é uma versão salva: dá para ver o histórico e desfazer qualquer alteração.

> Se o site ganhar domínio próprio, atualize `canonical`, `og:url`, `og:image` e o JSON-LD no `<head>` do `index.html`.
