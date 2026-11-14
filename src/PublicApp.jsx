import React,{useEffect,useState} from 'react';
import {Website} from './pages';
import {Modal} from './components';
import {createPublicDemo,demoEnabled} from './publicDemo';
export default function PublicApp(){
 const [data,setData]=useState(null),[error,setError]=useState(''),[article,setArticle]=useState(null),[demo,setDemo]=useState(()=>demoEnabled(location.search));
 useEffect(()=>{const controller=new AbortController();fetch('/api/public',{signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('वेबसाइट लोड हुन सकेन।');return r.json()}).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message)});return()=>controller.abort()},[]);
 useEffect(()=>{const sync=()=>{setDemo(demoEnabled(location.search));setArticle(null)};window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[]);
 function toggle(){const next=!demo,url=new URL(location.href);next?url.searchParams.set('demo','1'):url.searchParams.delete('demo');history.pushState({},'',url);setDemo(next);setArticle(null)}
 const shown=demo?createPublicDemo():data;
 return <><div className="demo-toolbar"><div><span className={'status-dot '+(demo?'on':'')}/><strong>{demo?'DEMO EXPERIENCE':'LIVE WEBSITE'}</strong><span>{demo?'काल्पनिक विवरण • वास्तविक डेटाबेस परिवर्तन हुँदैन':'समूहको प्रकाशित सामग्री'}</span></div><button className="demo-switch" role="switch" aria-label="Demo data" aria-checked={demo} onClick={toggle}><span className="switch-track"><i/></span>Demo {demo?'ON':'OFF'}</button></div>{shown?<Website data={shown} go={()=>location.assign('/admin/')} form={(_,item)=>setArticle(item)}/>:<div className="cloud-gate"><h1>जोरपाटी महिला समूह</h1><p>{error||'वेबसाइट खुल्दैछ…'}</p>{error&&<button onClick={()=>location.reload()}>पुनः प्रयास</button>}</div>}{article&&<Modal members={[]} modal={{kind:'article',item:article}} onClose={()=>setArticle(null)}/>}</>;
}
