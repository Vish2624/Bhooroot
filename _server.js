const http=require('http'),fs=require('fs'),path=require('path');
const mime={'html':'text/html','css':'text/css','js':'application/javascript','svg':'image/svg+xml','png':'image/png','jpg':'image/jpeg','ico':'image/x-icon'};
http.createServer((req,res)=>{
  const url = req.url === '/' ? '/index.html' : req.url;
  const f = path.join('z:/Git/farmbasket/frontend', url.split('?')[0]);
  const ext = path.extname(f).slice(1);
  try {
    const data = fs.readFileSync(f);
    res.writeHead(200,{'Content-Type':mime[ext]||'text/plain'});
    res.end(data);
  } catch(e) { res.writeHead(404); res.end('not found'); }
}).listen(3000, ()=>process.stdout.write('READY\n'));
