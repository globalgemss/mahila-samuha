export const invitationTemplates=[{id:'rose',label:'गुलाबी पुष्प',use:'उत्सव तथा विशेष निमन्त्रणा'},{id:'gold',label:'मरुन–सुनौलो',use:'साधारणसभा तथा सम्मान'},{id:'teal',label:'सरल हरियो',use:'बैठक तथा तालिम'}];
export const themes={rose:['#70143f','#fff7f9','#ba748d'],teal:['#125950','#f1fbf7','#55a091'],gold:['#604525','#fffaf0','#b79457']};
export function cardMessage(v){return `${v.org}\n${v.title}\n${v.recipient?`आदरणीय ${v.recipient}ज्यू,\n`:''}${v.message}\nमिति: ${v.date||'तय हुन बाँकी'} • समय: ${v.time||'तय हुन बाँकी'}\nस्थान: ${v.venue||'तय हुन बाँकी'}\n${v.contact?'सम्पर्क: '+v.contact:''}`;}
const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src});
export async function renderCard(v,kind,side='front'){
 await document.fonts.ready;const c=document.createElement('canvas');c.width=1080;c.height=kind==='invite'?1350:680;const x=c.getContext('2d');const [ink,bg,accent]=themes[v.theme]||themes.rose;
 x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.strokeStyle=accent;x.lineWidth=3;x.strokeRect(28,28,1024,c.height-56);x.strokeRect(40,40,1000,c.height-80);
 x.fillStyle=ink;x.fillRect(40,40,1000,kind==='invite'?16:125);
 function text(t,y,size=30,color=ink,width=900){x.fillStyle=color;x.font=`${size}px 'Noto Sans Devanagari', sans-serif`;x.textAlign='center';const words=String(t||'').split(/\s+/);let line='',lines=[];for(const w of words){if(x.measureText(line+' '+w).width>width&&line){lines.push(line);line=w}else line+=(line?' ':'')+w}lines.push(line);for(const l of lines){x.fillText(l,540,y);y+=size*1.55}return y;}
 async function photo(src,px,py,w,h){if(!src)return;const im=await load(src);x.save();x.beginPath();x.roundRect(px,py,w,h,12);x.clip();const scale=Math.max(w/im.width,h/im.height);x.drawImage(im,px+(w-im.width*scale)/2,py+(h-im.height*scale)/2,im.width*scale,im.height*scale);x.restore();}
 if(kind==='invite'){
  const formal=v.theme==='gold',minimal=v.theme==='teal';
  const paper=formal?'#521b30':minimal?'#fafbf5':'#fff9f6';
  const color=formal?'#fff3d9':minimal?'#164f46':'#752b4a';
  const trim=formal?'#d9b675':minimal?'#6f9281':'#bb936b';
  x.fillStyle=paper;x.fillRect(0,0,1080,1350);
  function line(ax,ay,bx,by){x.strokeStyle=trim;x.lineWidth=2;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke()}
  function leaf(px,py,angle,scale=1){x.save();x.translate(px,py);x.rotate(angle);x.fillStyle=formal?'#b99560':'#8aa38a';x.globalAlpha=.65;x.beginPath();x.ellipse(0,0,13*scale,36*scale,0,0,Math.PI*2);x.fill();x.restore()}
  function branch(px,py,flip=1){x.save();x.translate(px,py);x.scale(flip,flip);line(0,0,145,180);for(let i=0;i<5;i++){leaf(i*28,30+i*31,-.8);leaf(35+i*25,20+i*31,.9)}x.restore()}
  function rose(px,py,size){x.save();x.translate(px,py);for(let ring=3;ring>0;ring--){for(let i=0;i<7;i++){x.save();x.rotate(i*Math.PI*2/7+ring*.4);x.fillStyle=['#b96081','#da92a8','#edb9c8','#f2d2da'][ring];x.beginPath();x.ellipse(0,size*.22*ring,size*.36,size*.46,0,0,Math.PI*2);x.fill();x.restore()}}x.fillStyle='#b66d88';x.beginPath();x.arc(0,0,size*.15,0,Math.PI*2);x.fill();x.restore()}
  if(formal){
   x.strokeStyle=trim;x.lineWidth=3;x.strokeRect(38,38,1004,1274);x.lineWidth=1;x.strokeRect(54,54,972,1242);
   for(const [px,py,rotation] of [[80,80,0],[1000,80,Math.PI/2],[1000,1270,Math.PI],[80,1270,-Math.PI/2]]){x.save();x.translate(px,py);x.rotate(rotation);for(let i=0;i<4;i++){x.strokeStyle=trim;x.beginPath();x.ellipse(40+i*19,40,19,40,i*.3,0,Math.PI*2);x.stroke()}x.restore()}
   line(320,376,760,376);line(320,550,760,550);
  }else if(minimal){
   x.fillStyle='#e9f0e6';x.fillRect(0,0,26,1350);branch(845,90);line(110,350,310,350);
  }else{
   x.strokeStyle=trim;x.lineWidth=2;x.strokeRect(48,48,984,1254);
   branch(80,55);branch(1000,1295,-1);
   for(const [px,py,z] of [[95,90,65],[190,85,42],[85,200,44],[980,1260,65],[890,1270,42],[995,1150,44]])rose(px,py,z);
  }
  await photo(v.logo,490,95,100,100);
  text(v.org,v.logo?235:205,30,color,850);
  text(v.address,322,21,trim,870);
  text('सादर निमन्त्रणा',430,60,color,880);
  let y=text(v.title,530,32,color,880);
  y=text(v.recipient?`आदरणीय ${v.recipient}ज्यू,`:'आदरणीय सदस्य तथा शुभेच्छुकज्यूहरू,',y+22,25,color,900);
  y=text(v.message,y+12,24,color,900);
  const boxY=Math.max(875,y+16);
  x.fillStyle=formal?'#642a3e':minimal?'#e9f0e6':'#f8e9ec';x.beginPath();x.roundRect(115,boxY,850,220,18);x.fill();
  text('मिति: '+(v.date||'तय हुन बाँकी'),boxY+52,29,color,790);
  text('समय: '+(v.time||'तय हुन बाँकी'),boxY+103,28,color,790);
  text('स्थान: '+(v.venue||'तय हुन बाँकी'),boxY+152,27,color,790);
  text('आयोजक: '+v.org,Math.max(1190,boxY+265),25,color,820);
  if(v.contact)text('सम्पर्क: '+v.contact,Math.max(1240,boxY+310),23,trim,800);
 }else{
  text(v.org,110,35,'white');text(side==='front'?'सदस्य परिचयपत्र':'सदस्यता विवरण',207,30);
  if(side==='front'){await photo(v.photo,100,245,180,210);if(!v.photo){x.fillStyle=accent;x.fillRect(100,245,180,210);x.fillStyle='white';x.font='28px sans-serif';x.textAlign='center';x.fillText('फोटो',190,355)}text(v.name||'सदस्यको नाम',300,38,ink,450);text(v.role||'सदस्य',360,29);text('सदस्य नं.: '+(v.memberNumber||'—'),425,25);text('वैधता: '+(v.expiry||'—'),490,24);text('समूहको सदस्य परिचयपत्र • सरकारी परिचयपत्र होइन',590,22,accent)}else{text(v.address,290,29);text('जारी मिति: '+(v.issued||'—'),365,28);text('सम्पर्क: '+(v.contact||'—'),430,28);text(v.signatory||'अधिकृत हस्ताक्षर',515,26);text('हराएमा समूहको कार्यालयमा जानकारी दिनुहोस्।',590,23,accent)}
 }
 return c.toDataURL('image/png');
}
