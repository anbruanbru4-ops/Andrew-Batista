// Dependency-free preview for the included production build. Node.js 22+.
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const root=fileURLToPath(new URL('./dist/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.json':'application/json'};
try{await stat(resolve(root,'index.html'));}catch{console.error('Falta dist/index.html. Ejecute npm.cmd run build primero.');process.exit(1);}
const server=http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
  try{
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(path==='/'?'/index.html':path));
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403).end();return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Content-Length':data.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404).end('No encontrado');}
});
server.on('error',(error)=>{console.error('No se pudo iniciar la vista previa:',error.message);process.exitCode=1;});
// An available local port avoids conflicts with Remotion or other projects.
server.listen(0,'127.0.0.1',()=>{
  const url=`http://127.0.0.1:${server.address().port}`;
  console.log(`\nVELIUX AGENCY — Vista previa\n\n${url}\n\nMantenga esta ventana abierta. Ctrl+C para cerrar.\n`);
  if(process.platform==='win32'){
    const child=spawn('cmd.exe',['/c','start','',url],{stdio:'ignore'});
    child.on('error',()=>console.log('Abra la dirección anterior en su navegador.'));
  }
});
