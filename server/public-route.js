// Exact allowlist: private API and admin documents never bypass Access.
export function isPublicRequest(request){
 const p=new URL(request.url).pathname;
 if(p==='/api/public/apply')return request.method==='POST';
 return ['GET','HEAD'].includes(request.method)&&(p==='/'||p==='/api/public'||p.startsWith('/assets/')||p.startsWith('/images/'));
}
