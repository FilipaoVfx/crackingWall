/**
 * Generates editable .excalidraw scene files for the CrackingWall architecture
 * diagrams. Source element arrays mirror what was drawn via the Excalidraw MCP;
 * this expands the `label` shorthand into bound text elements and fills the
 * fields Excalidraw expects, so the files open directly at https://excalidraw.com.
 *
 * Run:  node docs/architecture/gen.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const rid = () => Math.random().toString(36).slice(2, 10);
const rnd = () => Math.floor(Math.random() * 2 ** 31);

function convert(elements) {
  const out = [];
  for (const el of elements) {
    if (['cameraUpdate', 'delete', 'restoreCheckpoint'].includes(el.type)) continue;
    const base = {
      id: el.id || rid(), type: el.type, x: el.x, y: el.y,
      width: el.width || 0, height: el.height || 0, angle: 0,
      strokeColor: el.strokeColor || '#1e1e1e',
      backgroundColor: el.backgroundColor || 'transparent',
      fillStyle: el.fillStyle || 'solid',
      strokeWidth: el.strokeWidth || 2,
      strokeStyle: el.strokeStyle || 'solid',
      roughness: el.roughness ?? 1, opacity: el.opacity ?? 100,
      groupIds: [], frameId: null, roundness: el.roundness || null,
      seed: rnd(), version: 1, versionNonce: rnd(),
      isDeleted: false, boundElements: [], updated: Date.now(), link: null, locked: false,
    };
    if (el.type === 'text') Object.assign(base, {
      text: el.text || '', fontSize: el.fontSize || 16, fontFamily: 1,
      textAlign: 'left', verticalAlign: 'top', containerId: null,
      originalText: el.text || '', lineHeight: 1.25, autoResize: true,
    });
    if (el.type === 'arrow' || el.type === 'line') Object.assign(base, {
      points: el.points || [[0, 0], [el.width || 0, el.height || 0]],
      lastCommittedPoint: null, startBinding: el.startBinding || null,
      endBinding: el.endBinding || null, startArrowhead: el.startArrowhead ?? null,
      endArrowhead: el.type === 'arrow' ? (el.endArrowhead ?? 'arrow') : (el.endArrowhead ?? null),
    });
    out.push(base);
    if (el.label && el.label.text) {
      const tid = rid();
      base.boundElements.push({ type: 'text', id: tid });
      const fs = el.label.fontSize || 16;
      out.push({
        id: tid, type: 'text', x: base.x + 8, y: base.y + 8,
        width: Math.max(20, el.label.text.length * fs * 0.5), height: fs * 1.25, angle: 0,
        strokeColor: el.label.strokeColor || '#1e1e1e', backgroundColor: 'transparent',
        fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100,
        groupIds: [], frameId: null, roundness: null, seed: rnd(), version: 1, versionNonce: rnd(),
        isDeleted: false, boundElements: [], updated: Date.now(), link: null, locked: false,
        text: el.label.text, fontSize: fs, fontFamily: 1, textAlign: 'center',
        verticalAlign: 'middle', containerId: base.id, originalText: el.label.text,
        lineHeight: 1.25, autoResize: true,
      });
    }
  }
  return out;
}

function write(name, elements) {
  const scene = {
    type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
    elements: convert(elements),
    appState: { viewBackgroundColor: '#ffffff', gridSize: null },
    files: {},
  };
  const file = resolve(DIR, `${name}.excalidraw`);
  writeFileSync(file, JSON.stringify(scene, null, 2));
  console.log(`wrote ${name}.excalidraw (${scene.elements.length} elements)`);
}

// ------------------------------------------------------------------ diagrams
const runtime = [
{"type":"text","id":"t1","x":150,"y":24,"text":"CrackingWall — Runtime Architecture","fontSize":24,"strokeColor":"#1e1e1e"},
{"type":"text","id":"t1s","x":210,"y":56,"text":"request flow · app · islands · services","fontSize":15,"strokeColor":"#757575"},
{"type":"ellipse","id":"vh","x":270,"y":78,"width":24,"height":24,"backgroundColor":"#a5d8ff","fillStyle":"solid","strokeColor":"#4a9eed","strokeWidth":2},
{"type":"rectangle","id":"vb","x":266,"y":102,"width":32,"height":30,"roundness":{"type":3},"backgroundColor":"#a5d8ff","fillStyle":"solid","strokeColor":"#4a9eed","strokeWidth":2},
{"type":"text","id":"vt","x":256,"y":136,"text":"Visitor","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"arrow","id":"a0","x":282,"y":160,"width":-24,"height":22,"points":[[0,0],[-24,22]],"strokeColor":"#2563eb","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"ellipse","id":"cl1","x":188,"y":178,"width":66,"height":50,"backgroundColor":"#ffd8a8","fillStyle":"solid","strokeColor":"#f59e0b","strokeWidth":2},
{"type":"ellipse","id":"cl3","x":262,"y":182,"width":60,"height":46,"backgroundColor":"#ffd8a8","fillStyle":"solid","strokeColor":"#f59e0b","strokeWidth":2},
{"type":"ellipse","id":"cl2","x":222,"y":160,"width":74,"height":62,"backgroundColor":"#ffd8a8","fillStyle":"solid","strokeColor":"#f59e0b","strokeWidth":2},
{"type":"text","id":"clt","x":176,"y":234,"text":"Cloudflare — Edge (301) + Worker","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"text","id":"cls","x":186,"y":256,"text":"Middleware CSP · ASSETS · Workers Logs","fontSize":13,"strokeColor":"#757575"},
{"type":"arrow","id":"a1","x":258,"y":222,"width":32,"height":68,"points":[[0,0],[32,68]],"strokeColor":"#2563eb","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"astro","x":150,"y":290,"width":280,"height":60,"roundness":{"type":3},"backgroundColor":"#d0bfff","fillStyle":"solid","strokeColor":"#8b5cf6","label":{"text":"Astro · Prerender + SSR + SEO","fontSize":16}},
{"type":"arrow","id":"a2","x":290,"y":350,"width":0,"height":30,"points":[[0,0],[0,30]],"strokeColor":"#2563eb","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"shell","x":150,"y":380,"width":280,"height":56,"roundness":{"type":3},"backgroundColor":"#a5d8ff","fillStyle":"solid","strokeColor":"#4a9eed","label":{"text":"AppLayout · Consent Mode v2","fontSize":16}},
{"type":"arrow","id":"a3","x":290,"y":436,"width":0,"height":30,"points":[[0,0],[0,30]],"strokeColor":"#2563eb","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"pages","x":150,"y":466,"width":280,"height":56,"roundness":{"type":3},"backgroundColor":"#a5d8ff","fillStyle":"solid","strokeColor":"#4a9eed","label":{"text":"Pages · Home/Tools/Gallery/Blog","fontSize":15}},
{"type":"arrow","id":"a4","x":290,"y":522,"width":0,"height":30,"points":[[0,0],[0,30]],"strokeColor":"#2563eb","strokeWidth":2,"endArrowhead":"arrow","label":{"text":"hydrate","fontSize":13}},
{"type":"rectangle","id":"isl","x":150,"y":552,"width":280,"height":56,"roundness":{"type":3},"backgroundColor":"#c3fae8","fillStyle":"solid","strokeColor":"#06b6d4","label":{"text":"React islands · 3D/ASCII/VP/Wall/Auth","fontSize":14}},
{"type":"text","id":"isn","x":150,"y":616,"text":"3D Lab -> @filipaovfx/svg3d -> 3dsvg (WebGL)","fontSize":13,"strokeColor":"#0e7490"},
{"type":"text","id":"ext","x":700,"y":96,"text":"EXTERNAL SERVICES","fontSize":14,"strokeColor":"#757575"},
{"type":"rectangle","id":"dbbody","x":705,"y":140,"width":80,"height":62,"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#15803d","strokeWidth":2},
{"type":"ellipse","id":"dbbot","x":705,"y":188,"width":80,"height":26,"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#15803d","strokeWidth":2},
{"type":"ellipse","id":"dbmid","x":705,"y":163,"width":80,"height":22,"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#15803d","strokeWidth":1},
{"type":"ellipse","id":"dbtop","x":705,"y":127,"width":80,"height":26,"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#15803d","strokeWidth":2},
{"type":"text","id":"dbt","x":800,"y":150,"text":"Supabase","fontSize":16,"strokeColor":"#1e1e1e"},
{"type":"text","id":"dbs","x":800,"y":172,"text":"Postgres · Storage · Auth","fontSize":13,"strokeColor":"#757575"},
{"type":"rectangle","id":"chip","x":716,"y":268,"width":64,"height":48,"roundness":{"type":3},"backgroundColor":"#ffd8a8","fillStyle":"solid","strokeColor":"#d97706","strokeWidth":2},
{"type":"rectangle","id":"p1","x":708,"y":278,"width":8,"height":8,"backgroundColor":"#d97706","fillStyle":"solid","strokeColor":"#d97706"},
{"type":"rectangle","id":"p2","x":708,"y":298,"width":8,"height":8,"backgroundColor":"#d97706","fillStyle":"solid","strokeColor":"#d97706"},
{"type":"rectangle","id":"p3","x":780,"y":278,"width":8,"height":8,"backgroundColor":"#d97706","fillStyle":"solid","strokeColor":"#d97706"},
{"type":"rectangle","id":"p4","x":780,"y":298,"width":8,"height":8,"backgroundColor":"#d97706","fillStyle":"solid","strokeColor":"#d97706"},
{"type":"text","id":"llmt","x":798,"y":284,"text":"OpenRouter (LLM)","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"rectangle","id":"adbox","x":712,"y":344,"width":60,"height":42,"roundness":{"type":3},"backgroundColor":"#a5d8ff","fillStyle":"solid","strokeColor":"#2563eb","label":{"text":"Ad$","fontSize":16}},
{"type":"text","id":"adt","x":782,"y":358,"text":"Google AdSense","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"rectangle","id":"ms1","x":714,"y":410,"width":16,"height":16,"backgroundColor":"#ef4444","fillStyle":"solid","strokeColor":"#ef4444"},
{"type":"rectangle","id":"ms2","x":732,"y":410,"width":16,"height":16,"backgroundColor":"#22c55e","fillStyle":"solid","strokeColor":"#22c55e"},
{"type":"rectangle","id":"ms3","x":714,"y":428,"width":16,"height":16,"backgroundColor":"#4a9eed","fillStyle":"solid","strokeColor":"#4a9eed"},
{"type":"rectangle","id":"ms4","x":732,"y":428,"width":16,"height":16,"backgroundColor":"#f59e0b","fillStyle":"solid","strokeColor":"#f59e0b"},
{"type":"text","id":"clt2","x":758,"y":420,"text":"Microsoft Clarity","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"ellipse","id":"mg","x":712,"y":474,"width":34,"height":34,"backgroundColor":"transparent","strokeColor":"#757575","strokeWidth":3},
{"type":"line","id":"mgh","x":740,"y":502,"width":16,"height":16,"points":[[0,0],[16,16]],"strokeColor":"#757575","strokeWidth":3,"endArrowhead":null},
{"type":"text","id":"sct","x":762,"y":484,"text":"Search Console","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"arrow","id":"x1","x":430,"y":312,"width":275,"height":-140,"points":[[0,0],[275,-140]],"strokeColor":"#0891b2","strokeWidth":1.6,"strokeStyle":"dashed","endArrowhead":"arrow","label":{"text":"build fetch","fontSize":13}},
{"type":"arrow","id":"x2","x":430,"y":344,"width":282,"height":150,"points":[[0,0],[282,150]],"strokeColor":"#0891b2","strokeWidth":1.6,"strokeStyle":"dashed","endArrowhead":"arrow","label":{"text":"sitemap","fontSize":13}},
{"type":"arrow","id":"x3","x":430,"y":404,"width":282,"height":-38,"points":[[0,0],[282,-38]],"strokeColor":"#d97706","strokeWidth":1.6,"strokeStyle":"dashed","endArrowhead":"arrow","label":{"text":"on Accept","fontSize":13}},
{"type":"arrow","id":"x4","x":430,"y":418,"width":282,"height":18,"points":[[0,0],[282,18]],"strokeColor":"#d97706","strokeWidth":1.6,"strokeStyle":"dashed","endArrowhead":"arrow"},
{"type":"arrow","id":"x5","x":430,"y":576,"width":286,"height":-280,"points":[[0,0],[286,-280]],"strokeColor":"#0891b2","strokeWidth":1.6,"strokeStyle":"dashed","endArrowhead":"arrow","label":{"text":"/api/decode","fontSize":13}},
{"type":"arrow","id":"x6","x":430,"y":588,"width":275,"height":-380,"points":[[0,0],[275,-380]],"strokeColor":"#0891b2","strokeWidth":1.6,"strokeStyle":"dashed","endArrowhead":"arrow","label":{"text":"likes/auth","fontSize":13}},
{"type":"text","id":"lg","x":150,"y":666,"text":"LEGEND","fontSize":13,"strokeColor":"#757575"},
{"type":"arrow","id":"la","x":230,"y":672,"width":40,"height":0,"points":[[0,0],[40,0]],"strokeColor":"#2563eb","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"text","id":"lat","x":276,"y":664,"text":"request","fontSize":13,"strokeColor":"#757575"},
{"type":"arrow","id":"lb","x":360,"y":672,"width":40,"height":0,"points":[[0,0],[40,0]],"strokeColor":"#0891b2","strokeWidth":2,"strokeStyle":"dashed","endArrowhead":"arrow"},
{"type":"text","id":"lbt","x":406,"y":664,"text":"data / build","fontSize":13,"strokeColor":"#757575"},
{"type":"arrow","id":"lc","x":520,"y":672,"width":40,"height":0,"points":[[0,0],[40,0]],"strokeColor":"#d97706","strokeWidth":2,"strokeStyle":"dashed","endArrowhead":"arrow"},
{"type":"text","id":"lct","x":566,"y":664,"text":"consent-gated","fontSize":13,"strokeColor":"#757575"}
];

const deploy = [
{"type":"text","id":"t","x":150,"y":30,"text":"CrackingWall — Deploy / CI Pipeline","fontSize":24,"strokeColor":"#1e1e1e"},
{"type":"ellipse","id":"gh","x":70,"y":150,"width":90,"height":90,"backgroundColor":"#e5dbff","fillStyle":"solid","strokeColor":"#6b46c1","strokeWidth":2,"label":{"text":"GH","fontSize":20}},
{"type":"text","id":"ght","x":66,"y":248,"text":"GitHub · main","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"arrow","id":"a1","x":164,"y":195,"width":86,"height":0,"points":[[0,0],[86,0]],"strokeColor":"#2563eb","strokeWidth":2,"endArrowhead":"arrow","label":{"text":"push","fontSize":14}},
{"type":"ellipse","id":"cb1","x":256,"y":166,"width":60,"height":46,"backgroundColor":"#ffd8a8","fillStyle":"solid","strokeColor":"#f59e0b","strokeWidth":2},
{"type":"ellipse","id":"cb3","x":324,"y":168,"width":54,"height":42,"backgroundColor":"#ffd8a8","fillStyle":"solid","strokeColor":"#f59e0b","strokeWidth":2},
{"type":"ellipse","id":"cb2","x":288,"y":150,"width":68,"height":58,"backgroundColor":"#ffd8a8","fillStyle":"solid","strokeColor":"#f59e0b","strokeWidth":2},
{"type":"text","id":"cbt","x":262,"y":216,"text":"Cloudflare Build","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"text","id":"cbs","x":250,"y":236,"text":"npm ci && npm run build","fontSize":13,"strokeColor":"#757575"},
{"type":"arrow","id":"a2","x":388,"y":195,"width":86,"height":0,"points":[[0,0],[86,0]],"strokeColor":"#d97706","strokeWidth":2,"strokeStyle":"dashed","endArrowhead":"arrow","label":{"text":"deploy","fontSize":14}},
{"type":"rectangle","id":"w1","x":492,"y":158,"width":132,"height":28,"backgroundColor":"#a5d8ff","fillStyle":"solid","strokeColor":"#4a9eed","strokeWidth":2},
{"type":"ellipse","id":"led1","x":500,"y":167,"width":9,"height":9,"backgroundColor":"#22c55e","fillStyle":"solid","strokeColor":"#22c55e"},
{"type":"rectangle","id":"w2","x":492,"y":190,"width":132,"height":28,"backgroundColor":"#a5d8ff","fillStyle":"solid","strokeColor":"#4a9eed","strokeWidth":2},
{"type":"ellipse","id":"led2","x":500,"y":199,"width":9,"height":9,"backgroundColor":"#22c55e","fillStyle":"solid","strokeColor":"#22c55e"},
{"type":"rectangle","id":"w3","x":492,"y":222,"width":132,"height":28,"backgroundColor":"#a5d8ff","fillStyle":"solid","strokeColor":"#4a9eed","strokeWidth":2},
{"type":"ellipse","id":"led3","x":500,"y":231,"width":9,"height":9,"backgroundColor":"#22c55e","fillStyle":"solid","strokeColor":"#22c55e"},
{"type":"text","id":"wt","x":486,"y":258,"text":"Worker · crackingwall","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"arrow","id":"a3","x":636,"y":205,"width":80,"height":0,"points":[[0,0],[80,0]],"strokeColor":"#2563eb","strokeWidth":2,"endArrowhead":"arrow","label":{"text":"200","fontSize":14}},
{"type":"ellipse","id":"globe","x":724,"y":160,"width":84,"height":84,"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#15803d","strokeWidth":2},
{"type":"ellipse","id":"merid","x":748,"y":160,"width":36,"height":84,"backgroundColor":"transparent","strokeColor":"#15803d","strokeWidth":1.5},
{"type":"line","id":"eq","x":724,"y":202,"width":84,"height":0,"points":[[0,0],[84,0]],"strokeColor":"#15803d","strokeWidth":1.5,"endArrowhead":null},
{"type":"text","id":"gt","x":700,"y":252,"text":"Live · pixelatmos.com","fontSize":15,"strokeColor":"#1e1e1e"},
{"type":"rectangle","id":"assets","x":470,"y":300,"width":96,"height":40,"roundness":{"type":3},"backgroundColor":"#dbe4ff","fillStyle":"solid","strokeColor":"#4a9eed","label":{"text":"ASSETS /dist","fontSize":13}},
{"type":"rectangle","id":"logs","x":576,"y":300,"width":96,"height":40,"roundness":{"type":3},"backgroundColor":"#dbe4ff","fillStyle":"solid","strokeColor":"#4a9eed","label":{"text":"Workers Logs","fontSize":13}},
{"type":"arrow","id":"a4","x":528,"y":252,"width":-6,"height":48,"points":[[0,0],[-6,48]],"strokeColor":"#4a9eed","strokeWidth":1.5,"endArrowhead":"arrow"},
{"type":"arrow","id":"a5","x":600,"y":252,"width":18,"height":48,"points":[[0,0],[18,48]],"strokeColor":"#4a9eed","strokeWidth":1.5,"endArrowhead":"arrow"},
{"type":"rectangle","id":"cav","x":120,"y":380,"width":600,"height":46,"roundness":{"type":3},"backgroundColor":"#fff3bf","fillStyle":"solid","strokeColor":"#d97706","strokeWidth":1.5,"label":{"text":"Builds run per push to main, queued sequentially -> a few min lag","fontSize":14}},
{"type":"text","id":"dn","x":128,"y":440,"text":"Build prerenders 29 pages + bakes Supabase data (fallback: local wallpapers.json)","fontSize":13,"strokeColor":"#757575"}
];

const tools = [
{"type":"text","id":"t","x":150,"y":26,"text":"Creative Tools — Internal Flow","fontSize":24,"strokeColor":"#1e1e1e"},
{"type":"rectangle","id":"h1","x":30,"y":86,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#06b6d4","fillStyle":"solid","strokeColor":"#0e7490","label":{"text":"3D Lab","fontSize":18}},
{"type":"diamond","id":"cubetop","x":232,"y":92,"width":30,"height":16,"backgroundColor":"#c3fae8","fillStyle":"solid","strokeColor":"#0e7490","strokeWidth":1.5},
{"type":"rectangle","id":"s1a","x":30,"y":156,"width":240,"height":56,"roundness":{"type":3},"backgroundColor":"#c3fae8","fillStyle":"solid","strokeColor":"#06b6d4","label":{"text":"Input: Text (<=6) or SVG","fontSize":15}},
{"type":"arrow","id":"a1a","x":150,"y":212,"width":0,"height":20,"points":[[0,0],[0,20]],"strokeColor":"#0e7490","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s2a","x":30,"y":232,"width":240,"height":56,"roundness":{"type":3},"backgroundColor":"#c3fae8","fillStyle":"solid","strokeColor":"#06b6d4","label":{"text":"analyzeSvg (SVG Intelligence)","fontSize":14}},
{"type":"text","id":"s2as","x":40,"y":290,"text":"segment shapes · color · painter z-order","fontSize":12,"strokeColor":"#0e7490"},
{"type":"arrow","id":"a2a","x":150,"y":308,"width":0,"height":18,"points":[[0,0],[0,18]],"strokeColor":"#0e7490","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s3a","x":30,"y":326,"width":240,"height":56,"roundness":{"type":3},"backgroundColor":"#c3fae8","fillStyle":"solid","strokeColor":"#06b6d4","label":{"text":"@filipaovfx/svg3d","fontSize":15}},
{"type":"text","id":"s3as","x":40,"y":384,"text":"LayeredSvg3D · relief · materials","fontSize":12,"strokeColor":"#0e7490"},
{"type":"arrow","id":"a3a","x":150,"y":402,"width":0,"height":18,"points":[[0,0],[0,18]],"strokeColor":"#0e7490","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s4a","x":30,"y":420,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#c3fae8","fillStyle":"solid","strokeColor":"#06b6d4","label":{"text":"Three.js / R3F · WebGL","fontSize":14}},
{"type":"arrow","id":"a4a","x":150,"y":472,"width":0,"height":18,"points":[[0,0],[0,18]],"strokeColor":"#0e7490","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s5a","x":30,"y":490,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#c3fae8","fillStyle":"solid","strokeColor":"#06b6d4","label":{"text":"Layer Explorer — sculpt live","fontSize":14}},
{"type":"arrow","id":"a5a","x":150,"y":542,"width":0,"height":18,"points":[[0,0],[0,18]],"strokeColor":"#0e7490","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s6a","x":30,"y":560,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#22c55e","label":{"text":"Export PNG / GLB","fontSize":15}},
{"type":"text","id":"n1","x":34,"y":620,"text":"wraps 3dsvg · 100% client-side","fontSize":13,"strokeColor":"#0e7490"},
{"type":"rectangle","id":"h2","x":300,"y":86,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#22c55e","fillStyle":"solid","strokeColor":"#15803d","label":{"text":"ASCII Lab","fontSize":18}},
{"type":"text","id":"asciiico","x":505,"y":96,"text":"@#.","fontSize":22,"strokeColor":"#15803d"},
{"type":"rectangle","id":"s1b","x":300,"y":156,"width":240,"height":56,"roundness":{"type":3},"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#22c55e","label":{"text":"Input: Image / Video","fontSize":15}},
{"type":"arrow","id":"a1b","x":420,"y":212,"width":0,"height":20,"points":[[0,0],[0,20]],"strokeColor":"#15803d","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s2b","x":300,"y":232,"width":240,"height":56,"roundness":{"type":3},"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#22c55e","label":{"text":"Sample grid -> luminance","fontSize":14}},
{"type":"text","id":"s2bs","x":312,"y":290,"text":"0.2126R + 0.7152G + 0.0722B","fontSize":12,"strokeColor":"#15803d"},
{"type":"arrow","id":"a2b","x":420,"y":308,"width":0,"height":18,"points":[[0,0],[0,18]],"strokeColor":"#15803d","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s3b","x":300,"y":326,"width":240,"height":56,"roundness":{"type":3},"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#22c55e","label":{"text":"Map to character ramp","fontSize":14}},
{"type":"text","id":"s3bs","x":312,"y":384,"text":"charset · contrast · aspect fix","fontSize":12,"strokeColor":"#15803d"},
{"type":"arrow","id":"a3b","x":420,"y":402,"width":0,"height":18,"points":[[0,0],[0,18]],"strokeColor":"#15803d","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s4b","x":300,"y":420,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#22c55e","label":{"text":"Real-time preview","fontSize":15}},
{"type":"arrow","id":"a4b","x":420,"y":472,"width":0,"height":18,"points":[[0,0],[0,18]],"strokeColor":"#15803d","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s5b","x":300,"y":490,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#b2f2bb","fillStyle":"solid","strokeColor":"#22c55e","label":{"text":"Export GIF / MP4 / HTML","fontSize":14}},
{"type":"text","id":"n2","x":304,"y":552,"text":"100% client-side","fontSize":13,"strokeColor":"#15803d"},
{"type":"rectangle","id":"h3","x":570,"y":86,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#ec4899","fillStyle":"solid","strokeColor":"#a21caf","label":{"text":"Visual Protocol","fontSize":18}},
{"type":"ellipse","id":"eye","x":775,"y":98,"width":34,"height":20,"backgroundColor":"#eebefa","fillStyle":"solid","strokeColor":"#a21caf","strokeWidth":1.5},
{"type":"ellipse","id":"pupil","x":786,"y":102,"width":12,"height":12,"backgroundColor":"#a21caf","fillStyle":"solid","strokeColor":"#a21caf"},
{"type":"rectangle","id":"s1c","x":570,"y":156,"width":240,"height":56,"roundness":{"type":3},"backgroundColor":"#eebefa","fillStyle":"solid","strokeColor":"#ec4899","label":{"text":"Input: Image","fontSize":15}},
{"type":"arrow","id":"a1c","x":690,"y":212,"width":0,"height":20,"points":[[0,0],[0,20]],"strokeColor":"#a21caf","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s2c","x":570,"y":232,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#eebefa","fillStyle":"solid","strokeColor":"#ec4899","label":{"text":"/api/decode  (SSR)","fontSize":14}},
{"type":"arrow","id":"a2c","x":690,"y":284,"width":0,"height":22,"points":[[0,0],[0,22]],"strokeColor":"#d97706","strokeWidth":2,"strokeStyle":"dashed","endArrowhead":"arrow","label":{"text":"server","fontSize":12}},
{"type":"rectangle","id":"s3c","x":570,"y":306,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#ffd8a8","fillStyle":"solid","strokeColor":"#f59e0b","label":{"text":"OpenRouter — vision LLM","fontSize":13}},
{"type":"arrow","id":"a3c","x":690,"y":358,"width":0,"height":22,"points":[[0,0],[0,22]],"strokeColor":"#a21caf","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s4c","x":570,"y":380,"width":240,"height":56,"roundness":{"type":3},"backgroundColor":"#eebefa","fillStyle":"solid","strokeColor":"#ec4899","label":{"text":"Structured brief","fontSize":14}},
{"type":"text","id":"s4cs","x":580,"y":438,"text":"palette · mood · composition · style","fontSize":12,"strokeColor":"#a21caf"},
{"type":"arrow","id":"a4c","x":690,"y":456,"width":0,"height":18,"points":[[0,0],[0,18]],"strokeColor":"#a21caf","strokeWidth":2,"endArrowhead":"arrow"},
{"type":"rectangle","id":"s5c","x":570,"y":474,"width":240,"height":52,"roundness":{"type":3},"backgroundColor":"#eebefa","fillStyle":"solid","strokeColor":"#ec4899","label":{"text":"Creative direction (display)","fontSize":13}},
{"type":"text","id":"n3","x":574,"y":536,"text":"server-assisted (not local)","fontSize":13,"strokeColor":"#a21caf"},
{"type":"rectangle","id":"banner","x":30,"y":660,"width":780,"height":44,"roundness":{"type":3},"backgroundColor":"#fff3bf","fillStyle":"solid","strokeColor":"#f59e0b","label":{"text":"Philosophy: Analyze visuals -> Generate ideas -> Build experiences","fontSize":15}},
{"type":"text","id":"leg","x":34,"y":716,"text":"teal & green = 100% in-browser · pink = server-assisted (OpenRouter)","fontSize":13,"strokeColor":"#757575"}
];

write('runtime', runtime);
write('deploy', deploy);
write('tools', tools);
