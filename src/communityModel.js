export const nextAttendanceStatus=s=>({present:'absent',absent:'late',late:'present',pending:'present'}[s]||'present');
import {uid} from './model.js';
export const attendanceOptions=[['present','उपस्थित','Present'],['absent','अनुपस्थित','Absent'],['late','ढिलो','Late']];
export function migrateCommunity(data){
 const d=structuredClone(data);
 d.savingsTransactions??=[];d.fees??=[];d.decisions??=[];d.audit??=[];
 d.meetings=d.meetings.map(m=>({...m,participantIds:m.participantIds??d.members.map(x=>x.id),attendanceRecords:m.attendanceRecords??Object.fromEntries((m.attendance||[]).map(id=>[id,{status:'present',arrival:'',note:''}])),attendanceClosed:!!m.attendanceClosed,attendanceHistory:m.attendanceHistory??[],minutesApproved:m.minutesApproved??m.status==='स्वीकृत'}));
 d.programs=d.programs.map(p=>({...p,memberIds:p.memberIds??[...new Set(p.attendance||[])]}));
 return d;
}
export function attendanceCounts(m){const c={present:0,absent:0,late:0,pending:0};for(const id of m.participantIds||[]){const s=m.attendanceRecords?.[id]?.status;c[attendanceOptions.some(([v])=>v===s)?s:'pending']++}return c;}
export function quorumStatus(m){const c=attendanceCounts(m),required=Number(m.quorumRequired),total=m.participantIds.length,attending=c.present+c.late;const configured=Number.isInteger(required)&&required>=1&&required<=total;return {required,attending,total,configured,met:configured&&attending>=required,ready:configured&&attending>=required&&m.attendanceClosed&&c.pending===0};}
export function memberFees(d,id){return(d.fees||[]).filter(f=>f.memberId===id).map(f=>{const entries=d.transactions.filter(t=>t.feeId===f.id),paidPaisa=entries.filter(t=>t.status==='स्वीकृत').reduce((s,t)=>s+(t.type==='खर्च'?-1:1)*Math.round(Number(t.amount)*100),0),pendingPaisa=entries.filter(t=>t.type==='आम्दानी'&&t.status==='स्वीकृति बाँकी').reduce((s,t)=>s+Math.round(Number(t.amount)*100),0);return {...f,paid:paidPaisa/100,pending:pendingPaisa/100,balance:Math.max(0,Math.round(f.amount*100)-paidPaisa)/100}})}
export function noticesFor(d,m){return d.notices.filter(n=>n.status==='पठाइएको'&&(Array.isArray(n.memberIds)?n.memberIds.includes(m.id):n.audience==='सबै सदस्य'||(n.audience==='कार्यसमिति'&&['अध्यक्ष','सचिव','कोषाध्यक्ष'].includes(m.role))))}
export function applyCommunity(d,action){
 const next=structuredClone(d),stamp=new Date().toISOString();const m=next.meetings.find(x=>x.id===action.meetingId);let log='';
 const requireMeeting=()=>{if(!m)throw Error('बैठक भेटिएन।')};
 if(action.type==='quorum'){
  requireMeeting();const required=Number(action.required);if(!Number.isInteger(required)||required<1||required>m.participantIds.length)throw Error('गणपूरक संख्या १ देखि सहभागी संख्याबीच पूर्ण अंक राख्नुहोस्।');if(!action.reason?.trim()||action.reason.trim().length<5)throw Error('गणपूरक संख्या तय गर्ने नियम / आधार लेख्नुहोस्।');m.quorumRequired=required;m.quorumReason=action.reason.trim().slice(0,500);m.minutesApproved=false;log='गणपूरक संख्या: '+required+' • '+m.quorumReason;
 }else if(action.type==='attendance'){
  requireMeeting();if(m.attendanceClosed)throw Error('हाजिरी बन्द छ। सच्याउन पहिले पुनः खोल्नुहोस्।');
  if(!m.participantIds.includes(action.memberId))throw Error('सदस्य यस बैठकका सहभागी होइनन्।');
  if(!attendanceOptions.some(([s])=>s===action.value.status)&&action.value.status!=='pending')throw Error('हाजिरी अवस्था मिलेन।');
  m.attendanceRecords[action.memberId]={...action.value,updatedAt:stamp};log='बैठक हाजिरी अद्यावधिक';
 }else if(action.type==='markAll'||action.type==='resetAttendance'){
  requireMeeting();if(m.attendanceClosed)throw Error('हाजिरी बन्द छ।');
  const status=action.type==='resetAttendance'?'pending':action.status;
  if(!['pending','present','absent','late'].includes(status))throw Error('हाजिरी अवस्था मिलेन।');
  for(const id of m.participantIds)m.attendanceRecords[id]={...m.attendanceRecords[id],status,arrival:'',updatedAt:stamp};
  log=action.type==='resetAttendance'?'सबै हाजिरी Reset':'Mark All: '+status;
 }else if(action.type==='allPresent'){
  requireMeeting();if(m.attendanceClosed)throw Error('हाजिरी बन्द छ।');for(const id of m.participantIds)m.attendanceRecords[id]={...m.attendanceRecords[id],status:'present',arrival:'',updatedAt:stamp};log='सबै सहभागी उपस्थित';
 }else if(action.type==='roster'){
  requireMeeting();if(m.attendanceClosed)throw Error('हाजिरी बन्द भएपछि सहभागी परिवर्तन गर्न पुनः खोल्नुहोस्।');
  const ids=[...new Set(action.ids)];if(ids.some(id=>!next.members.some(x=>x.id===id)))throw Error('सदस्य भेटिएन।');m.participantIds=ids;log='बैठक सहभागी सूची परिवर्तन';
 }else if(action.type==='closeAttendance'){
  requireMeeting();if(m.attendanceClosed)throw Error('हाजिरी पहिले नै बन्द छ।');if(!m.participantIds.length||attendanceCounts(m).pending)throw Error('सबै सहभागीको हाजिरी लगाएपछि बन्द गर्नुहोस्।');m.attendanceClosed=true;m.attendanceHistory.push({at:stamp,action:'बन्द गरिएको',reason:''});log='बैठक हाजिरी बन्द';
 }else if(action.type==='reopenAttendance'){
  requireMeeting();if(!m.attendanceClosed)throw Error('हाजिरी खुला छ।');if(!action.reason?.trim())throw Error('पुनः खोल्नुको कारण लेख्नुहोस्।');m.attendanceClosed=false;m.attendanceHistory.push({at:stamp,action:'पुनः खोलिएको',reason:action.reason.trim()});log='हाजिरी पुनः खोलियो: '+action.reason.trim();
 }else if(action.type==='minutes'){
  requireMeeting();m.minutes=action.text;m.minutesApproved=false;log='माइन्युट सम्पादन; पुनः स्वीकृति बाँकी';
 }else if(action.type==='approveMinutes'){
  requireMeeting();const q=quorumStatus(m);if(!q.configured||!q.met)throw Error('गणपूरक संख्या तय गर्नुहोस् र आवश्यक उपस्थिति पुगेको जाँच्नुहोस्।');if(!q.ready)throw Error('सबै हाजिरी पूरा गरी बन्द गरेपछि माइन्युट स्वीकृत गर्नुहोस्।');if(!m.minutes?.trim())throw Error('पहिले माइन्युट लेख्नुहोस्।');m.minutesApproved=true;log='बैठक माइन्युट स्वीकृत';
 }else if(action.type==='decision'){
  requireMeeting();if(!action.text?.trim())throw Error('निर्णय लेख्नुहोस्।');m.minutesApproved=false;next.decisions.push({id:uid(),meetingId:m.id,text:action.text.trim(),createdAt:stamp});log='बैठक निर्णय थपियो';
 }else if(action.type==='assignDecision'){
  const dec=next.decisions.find(x=>x.id===action.decisionId),owner=next.members.find(x=>x.id===action.ownerId);
  if(!dec||!owner||!action.due)throw Error('निर्णय, जिम्मेवार सदस्य र समयसीमा आवश्यक छ।');
  if(!next.meetings.find(x=>x.id===dec.meetingId)?.minutesApproved)throw Error('पहिले बैठकको माइन्युट र निर्णय स्वीकृत गर्नुहोस्।');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(action.due)||Number.isNaN(Date.parse(action.due)))throw Error('सही समयसीमा (AD) राख्नुहोस्।');
  if(next.tasks.some(t=>t.decisionId===dec.id))throw Error('यस निर्णयबाट जिम्मेवारी बनिसकेको छ।');
  next.tasks.push({id:uid(),title:dec.text,owner:owner.name,ownerId:owner.id,due:action.due,status:'गर्न बाँकी',note:'',meetingId:dec.meetingId,decisionId:dec.id});log='निर्णयबाट जिम्मेवारी सिर्जना';
 }else if(action.type==='enrollment'){
  const p=next.programs.find(p=>p.id===action.programId);if(!p||action.ids.some(id=>!next.members.some(m=>m.id===id)))throw Error('सहभागी विवरण मिलेन।');p.memberIds=[...new Set(action.ids)];p.participants=p.memberIds.length;p.attendance=(p.attendance||[]).filter(id=>p.memberIds.includes(id));log='तालिम सहभागी अद्यावधिक';
 }else if(action.type==='fee'){
  if(!next.members.some(x=>x.id===action.memberId)||!action.title?.trim()||!Number.isFinite(action.amount)||action.amount<=0)throw Error('सदस्य, शुल्क विवरण र सही रकम राख्नुहोस्।');
  next.fees.push({id:uid(),memberId:action.memberId,title:action.title.trim(),amount:action.amount,due:action.due||'',createdAt:stamp});log='सदस्य शुल्क दर्ता';
 }else if(action.type==='payment'){
  const f=next.fees.find(x=>x.id===action.feeId);if(!f)throw Error('शुल्क भेटिएन।');const summary=memberFees(next,f.memberId).find(x=>x.id===f.id);
  if(!Number.isFinite(action.amount)||action.amount<=0||Math.round(action.amount*100)>Math.round(summary.balance*100)-Math.round(summary.pending*100))throw Error('रकम बाँकी शुल्कभन्दा बढी वा गलत छ।');
  next.transactions.push({id:uid(),feeId:f.id,memberId:f.memberId,title:f.title,type:'आम्दानी',amount:action.amount,method:action.method||'नगद',status:'स्वीकृति बाँकी',date:stamp.slice(0,10)});log='सदस्य शुल्क भुक्तानी स्वीकृतिका लागि दर्ता';
 }else throw Error('कार्य पहिचान भएन।');
 if(m&&['attendance','markAll','resetAttendance','allPresent','roster','reopenAttendance'].includes(action.type))m.minutesApproved=false;
 next.audit.unshift({id:uid(),action:log,entityId:action.meetingId||action.decisionId||action.feeId||action.memberId||action.programId,time:new Date().toLocaleString('ne-NP'),actor:'Demo प्रशासक'});return next;
}
