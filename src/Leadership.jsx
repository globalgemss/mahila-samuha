import React, {useState} from 'react';
import {Flower2, Users, NotebookPen, Wallet, Quote} from 'lucide-react';
import {Button, Panel} from './components';
const roles = [
 {id:'president',role:'अध्यक्ष',name:'सीता श्रेष्ठ',responsibility:'समूहको नेतृत्व, सहकार्य र साझा उद्देश्यतर्फ मार्गदर्शन।',Icon:Flower2},
 {id:'secretary',role:'सचिव',name:'माया तामाङ',responsibility:'बैठक, निर्णय र कार्यक्रमको समन्वय तथा अभिलेख।',Icon:NotebookPen},
 {id:'treasurer',role:'कोषाध्यक्ष',name:'राधा अधिकारी',responsibility:'समूहको आर्थिक अभिलेख र आय–व्यय प्रतिवेदन।',Icon:Wallet}
];
const sampleMessage='हरेक सदस्यको सीप, विचार र सहभागिता हाम्रो समूहको शक्ति हो। एकअर्कालाई साथ दिँदै सिकाइ, उद्यम र आत्मनिर्भरताको यात्रामा सँगै अघि बढौँ।';
function profiles(settings){return roles.map(({Icon,...r})=>({...r,photo:'',term:'',visible:true,...settings.leadership?.[r.id]}));}
function Portrait({person,demo}){
 const safePhoto=/^data:image\/(png|jpeg|webp);base64,/.test(person.photo||'');
 if(demo)return <div className="leader-portrait"><div className={`demo-leader-photo demo-leader-${person.id}`} role="img" aria-label={`${person.role}को AI निर्मित नमुना फोटो`}/></div>;
 return <div className="leader-portrait">{safePhoto?<img src={person.photo} alt={person.name}/>:<div className="leader-monogram" aria-label="फोटो राख्न बाँकी"><Flower2 aria-hidden="true"/><span>{person.name?.slice(0,1)||'✿'}</span><small>फोटो राख्न बाँकी</small></div>}</div>;
}
export function LeadershipSection({settings,demo=false}){
 const people=profiles(settings),president=people.find(p=>p.id==='president'&&p.visible);
 if(!people.some(p=>p.visible))return null;
 return <section className="leadership-section" id="leadership" aria-labelledby="leadership-title">
  <div className="leadership-heading"><span className="eyebrow">साझा सोच • समर्पित नेतृत्व</span><h2 id="leadership-title">हाम्रो नेतृत्व</h2><p>समूहलाई अघि बढाउने साथ, विश्वास र जिम्मेवारी।</p><div className="leadership-rule"><span/><Flower2 size={22}/><span/></div></div>
  <div className="leadership-grid">{people.filter(p=>p.visible).map(p=>{const Icon=roles.find(r=>r.id===p.id).Icon;return <article key={p.id} className={'leader-card leader-'+p.id}>
   <div className="leader-top"><Icon size={20}/><span>{p.role}</span></div><Portrait person={p} demo={demo}/><div className="leader-info">{demo&&<small className="demo-portrait-label">AI नमुना फोटो</small>}<span className="leader-role">{p.role}</span><h3>{p.name||'नाम राख्न बाँकी'}</h3>{p.term&&<span className="leader-term">कार्यकाल: {p.term}</span>}<div className="leader-divider"/><p>{p.responsibility}</p></div>
  </article>})}</div>
  {president&&(settings.presidentMessage??sampleMessage)&&<div className="president-message"><div className="message-label"><Quote size={34} aria-hidden="true"/><span>अध्यक्षको सन्देश</span><strong>साथबाट सम्भावनातर्फ</strong></div><div><blockquote>{settings.presidentMessage??sampleMessage}</blockquote><p className="message-signature">{president.name}<span>अध्यक्ष • {settings.name}</span></p></div></div>}
  <div className="leadership-community"><Users size={22}/><p>हरेक सदस्यको सहभागिता, हाम्रो समूहको शक्ति।</p></div>
 </section>;
}
export function LeadershipEditor({settings,saveSettings}){
 const [people,setPeople]=useState(()=>profiles(settings)),[message,setMessage]=useState(settings.presidentMessage??sampleMessage),[error,setError]=useState(''),[uploading,setUploading]=useState(false);
 const update=(id,key,value)=>setPeople(prev=>prev.map(p=>p.id===id?{...p,[key]:value}:p));
 function upload(file,id){if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>400000){setError('PNG, JPG वा WebP फोटो ४०० KB भित्र छान्नुहोस्।');return}setError('');setUploading(true);const reader=new FileReader();reader.onload=()=>{update(id,'photo',reader.result);setUploading(false)};reader.onerror=()=>{setError('फोटो पढ्न सकिएन। फेरि छान्नुहोस्।');setUploading(false)};reader.readAsDataURL(file)}
 return <Panel title="वेबसाइटको नेतृत्व परिचय"><form className="form padded" onSubmit={e=>{e.preventDefault();saveSettings({leadership:Object.fromEntries(people.map(p=>[p.id,{name:p.name.trim(),photo:p.photo,term:p.term,responsibility:p.responsibility,visible:p.visible}])),presidentMessage:message});setError('')}}><p>सार्वजनिक परिचयका लागि स्वीकृत नाम र फोटो मात्र राख्नुहोस्। सदस्यको निजी KYC विवरण यहाँबाट प्रकाशित हुँदैन।</p><div className="leadership-editor-grid">{people.map(p=><fieldset key={p.id}><legend>{p.role}</legend><label>नाम<input maxLength={65} value={p.name} onChange={e=>update(p.id,'name',e.target.value)} required={p.visible}/></label><label>कार्यकाल (ऐच्छिक)<input maxLength={50} placeholder="जस्तै: २०८३–२०८५" value={p.term} onChange={e=>update(p.id,'term',e.target.value)}/></label><label>जिम्मेवारी / छोटो परिचय<textarea maxLength={180} value={p.responsibility} onChange={e=>update(p.id,'responsibility',e.target.value)}/></label><label>फोटो (४०० KB सम्म)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={e=>upload(e.target.files?.[0],p.id)}/></label>{p.photo&&<div className="leader-upload-preview"><img src={p.photo} alt={p.name+' को छानिएको फोटो'}/><button type="button" onClick={()=>update(p.id,'photo','')}>फोटो हटाउनुहोस्</button></div>}<label className="leader-check"><input type="checkbox" checked={p.visible} onChange={e=>update(p.id,'visible',e.target.checked)}/> वेबसाइटमा परिचय देखाउनुहोस्</label></fieldset>)}</div><label>अध्यक्षको सन्देश<textarea rows={4} maxLength={600} value={message} onChange={e=>setMessage(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<Button type="submit" disabled={uploading}>नेतृत्व परिचय सुरक्षित गर्नुहोस्</Button></form></Panel>;
}
