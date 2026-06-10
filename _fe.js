const http=require('http'),fs=require('fs'),path=require('path');
const mime={'html':'text/html','css':'text/css','js':'application/javascript','svg':'image/svg+xml','png':'image/png','jpg':'image/jpeg'};
http.createServer((req,res)=>{
  const url=req.url==='/'?'/index.html':req.url;
  const f=path.join('z:/Git/bhooroot/frontend',url.split('?')[0]);
  const ext=path.extname(f).slice(1);
  try{const d=fs.readFileSync(f);res.writeHead(200,{'Content-Type':mime[ext]||'text/plain'});res.end(d);}
  catch(e){res.writeHead(404);res.end('not found');}
}).listen(3000);
