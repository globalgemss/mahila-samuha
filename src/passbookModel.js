import {uid} from './model.js';
export const savingsKinds={deposit:'बचत जम्मा',withdrawal:'निकासा'};
export const savingsStatus={pending:'स्वीकृति बाँकी',approved:'स्वीकृत',rejected:'अस्वीकृत'};
export function todayAD(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kathmandu',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-')}
export function toPaisa(value){const s=String(value).trim();if(!/^\d+(\.\d{1,2})?$/.test(s))throw Error('रकम बढीमा दुई दशमलवसम्म राख्नुहोस्।');const n=Math.round(Number(s)*100);if(!Number.isSafeInteger(n)||n<=0||n>100000000000)throw Error('सही धनात्मक रकम राख्नुहोस् (अधिकतम रु. १ अर्ब)।');return n}
export function migrateSavings(data){return {...data,savingsTransactions:data.savingsTransactions??[]}}
export function savingsLedger(data,memberId){let balancePaisa=0,totalIn=0,totalOut=0;const all=(data.savingsTransactions||[]).filter(t=>t.memberId===memberId);const rows=all.filter(t=>t.status==='approved').sort((a,b)=>a.sequence-b.sequence).map(t=>{if(t.kind==='deposit'){balancePaisa+=t.amountPaisa;totalIn+=t.amountPaisa}else{balancePaisa-=t.amountPaisa;totalOut+=t.amountPaisa}return {...t,balancePaisa}});return {rows,balancePaisa,totalIn,totalOut,pending:all.filter(t=>t.status==='pending'),rejected:all.filter(t=>t.status==='rejected')}}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!Number.isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s&&s<=todayAD()}
function reserveCheck(d,t){if(t.kind!=='withdrawal')return;const s=savingsLedger(d,t.memberId),reserved=s.pending.filter(x=>x.kind==='withdrawal'&&x.id!==t.id).reduce((sum,x)=>sum+x.amountPaisa,0);if(t.amountPaisa>s.balancePaisa-reserved)throw Error('उपलब्ध मौज्दातभन्दा बढी निकासा गर्न मिल्दैन। बाँकी निकासा अनुरोध पनि जाँच्नुहोस्।')}
export function applySavings(data,action){const d=structuredClone(migrateSavings(data)),stamp=new Date().toISOString();let t,log;
 if(action.type==='savings/request'){
  if(!d.members.some(m=>m.id===action.memberId))throw Error('सदस्य भेटिएन।');if(!savingsKinds[action.kind])throw Error('कारोबारको प्रकार मिलेन।');if(!validDate(action.date))throw Error('सही मिति (AD) राख्नुहोस्; भविष्यको मिति मान्य छैन।');if(!action.description?.trim())throw Error('कारोबारको विवरण लेख्नुहोस्।');
  t={id:uid(),memberId:action.memberId,amountPaisa:toPaisa(action.amount),kind:action.kind,date:action.date,description:action.description.trim().slice(0,180),method:action.method==='बैंक'?'बैंक':'नगद',status:'pending',createdAt:stamp,createdBy:'Demo प्रशासक'};reserveCheck(d,t);d.savingsTransactions.push(t);log='बचत कारोबार स्वीकृतिका लागि दर्ता';
 }else{
  t=d.savingsTransactions.find(x=>x.id===action.id);if(!t)throw Error('कारोबार भेटिएन।');
  if(action.type==='savings/reverse'){
   if(t.status!=='approved'||t.reversalOf)throw Error('मूल स्वीकृत कारोबार मात्र उल्ट्याउन सकिन्छ।');if(!action.reason?.trim())throw Error('सुधारको कारण लेख्नुहोस्।');if(d.savingsTransactions.some(x=>x.reversalOf===t.id&&x.status!=='rejected'))throw Error('यस कारोबारको सुधार अनुरोध बनिसकेको छ।');
   const correction={id:uid(),memberId:t.memberId,amountPaisa:t.amountPaisa,kind:t.kind==='deposit'?'withdrawal':'deposit',date:todayAD(),description:'सुधार: '+action.reason.trim().slice(0,150),method:t.method,status:'pending',reversalOf:t.id,createdAt:stamp,createdBy:'Demo प्रशासक'};reserveCheck(d,correction);d.savingsTransactions.push(correction);t=correction;log='उल्टो प्रविष्टि स्वीकृतिका लागि दर्ता';
  }else if(action.type==='savings/approve'){
   if(t.status!=='pending')throw Error('यो कारोबार पहिले नै समीक्षा भएको छ।');if(!d.members.some(m=>m.id===t.memberId))throw Error('सदस्य भेटिएन।');if(t.reversalOf){const original=d.savingsTransactions.find(x=>x.id===t.reversalOf);if(!original||original.status!=='approved'||d.savingsTransactions.some(x=>x.id!==t.id&&x.reversalOf===t.reversalOf&&x.status==='approved'))throw Error('सुधारको मूल कारोबार मिलेन।')}
   const balance=savingsLedger(d,t.memberId).balancePaisa;if(t.kind==='withdrawal'&&t.amountPaisa>balance)throw Error('स्वीकृत मौज्दात पर्याप्त छैन।');if(t.kind==='deposit'&&!Number.isSafeInteger(balance+t.amountPaisa))throw Error('मौज्दातको सीमा नाघ्यो।');
   t.sequence=d.savingsTransactions.reduce((max,x)=>Math.max(max,x.sequence||0),0)+1;t.receipt='PB-'+String(t.sequence).padStart(6,'0');t.status='approved';t.approvedAt=stamp;t.approvedBy='Demo प्रशासक';log='बचत कारोबार स्वीकृत: '+t.receipt;
  }else if(action.type==='savings/reject'){
   if(t.status!=='pending')throw Error('यो कारोबार पहिले नै समीक्षा भएको छ।');if(!action.reason?.trim())throw Error('अस्वीकृत गर्नुको कारण लेख्नुहोस्।');t.status='rejected';t.reason=action.reason.trim().slice(0,180);t.reviewedAt=stamp;log='बचत कारोबार अस्वीकृत';
  }else throw Error('कार्य पहिचान भएन।');
 }
 d.audit??=[];d.audit.unshift({id:uid(),action:log,entityId:t.id,memberId:t.memberId,time:new Date().toLocaleString('ne-NP'),actor:'Demo प्रशासक'});return d;
}
