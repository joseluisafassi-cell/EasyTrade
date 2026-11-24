// Genera assets/minifig/preview.html leyendo name/role/avatar de agents/*.yaml (sin dependencias).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const agents = readdirSync(join(root, 'agents')).filter((f) => f.endsWith('.yaml')).map((f) => {
  const t = readFileSync(join(root, 'agents', f), 'utf8');
  const get = (k) => (t.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1]?.trim();
  const av = (get('avatar') || '{}').replace(/^\{|\}$/g, '').trim();
  const avatar = Object.fromEntries(av.split(',').map((p) => p.split(':').map((s) => s.trim().replace(/^['"]|['"]$/g, ''))).filter((p) => p[0]));
  return { id: get('id'), name: get('name'), role: get('role'), department: get('department'), avatar };
});
const lib = readFileSync(join(root, 'assets/minifig/minifig.js'), 'utf8').replace('export function', 'function');
writeFileSync(join(root, 'assets/minifig/preview.html'), `<!doctype html><html lang="es"><meta charset="utf-8"><title>Minifiguras</title>
<style>body{font:15px system-ui;background:#eef1f6;margin:0;padding:24px}h1{margin:0 0 16px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px}
.c{background:#fff;border-radius:14px;padding:14px;text-align:center;box-shadow:0 1px 4px #0002}
.c b{display:block;margin-top:6px}.c span{color:#667;font-size:13px}
@media(prefers-color-scheme:dark){body{background:#14171d;color:#eee}.c{background:#1f242d}.c span{color:#9aa}}</style>
<h1>Trading Floor AI — empleados LEGO</h1><div class="g" id="g"></div>
<script>${lib}
const agents=${JSON.stringify(agents)};
const states=['idle','working','waiting','blocked'];
document.getElementById('g').innerHTML=agents.map((a,i)=>'<div class="c">'+renderMinifig(a.avatar,{size:120,state:states[i%4],label:a.name})+'<b>'+a.name+'</b><span>'+a.role+'<br>'+a.department+'</span></div>').join('');
</script></html>`);
console.log(`preview.html con ${agents.length} agentes`);
