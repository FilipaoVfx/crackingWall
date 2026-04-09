function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTxt(frames: string[]) {
  const separator = '\n' + '='.repeat(frames[0]?.split('\n')[0]?.length ?? 40) + '\n';
  const text = frames.join(separator);
  download(new Blob([text], { type: 'text/plain' }), 'ascii-video.txt');
}

export function exportJson(frames: string[], fps: number) {
  const data = JSON.stringify({ fps, frameCount: frames.length, frames }, null, 2);
  download(new Blob([data], { type: 'application/json' }), 'ascii-video.json');
}

export function exportHtml(frames: string[], fps: number) {
  const escaped = JSON.stringify(frames);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ASCII Video — CrakingWall</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:monospace}
#screen{color:#39ff14;font-size:8px;line-height:1.1;white-space:pre;text-shadow:0 0 4px #39ff14;padding:24px;border:1px solid #39ff14;border-radius:4px;position:relative;overflow:hidden}
#screen::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px);pointer-events:none}
#controls{position:fixed;bottom:20px;display:flex;gap:12px}
button{background:transparent;color:#39ff14;border:1px solid #39ff14;padding:6px 16px;font-family:monospace;cursor:pointer;font-size:13px}
button:hover{background:#39ff14;color:#0a0a0f}
</style>
</head>
<body>
<pre id="screen"></pre>
<div id="controls">
<button onclick="toggle()" id="btn">PAUSE</button>
<button onclick="slower()">-SPD</button>
<button onclick="faster()">+SPD</button>
</div>
<script>
const F=${escaped},fps=${fps};
let i=0,playing=true,spd=1,iv;
const el=document.getElementById('screen'),btn=document.getElementById('btn');
function render(){el.textContent=F[i];i=(i+1)%F.length}
function start(){iv=setInterval(render,1000/(fps*spd))}
function toggle(){playing=!playing;if(playing){start();btn.textContent='PAUSE'}else{clearInterval(iv);btn.textContent='PLAY'}}
function slower(){spd=Math.max(.25,spd-.25);if(playing){clearInterval(iv);start()}}
function faster(){spd=Math.min(4,spd+.25);if(playing){clearInterval(iv);start()}}
start();
</script>
</body>
</html>`;
  download(new Blob([html], { type: 'text/html' }), 'ascii-video.html');
}
