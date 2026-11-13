import React,{useEffect,useState} from 'react';
import {Website} from './pages';
import {Modal} from './components';
export default function PublicApp(){
 const [data,setData]=useState(null),[error,setError]=useState(''),[article,setArticle]=useState(null);
 useEffect(()=>{const controller=new AbortController();fetch('/api/public',{signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('वेबसाइट लोड हुन सकेन।');return r.json()}).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message)});return()=>controller.abort()},[]);
 if(!data)return <div className="cloud-gate"><h1>जोरपाटी महिला समूह</h1><p>{error||'वेबसाइट खुल्दैछ…'}</p>{error&&<button onClick={()=>location.reload()}>पुनः प्रयास</button>}</div>;
 return <><Website data={data} go={()=>location.assign('/admin/')} form={(_,item)=>setArticle(item)}/>{article&&<Modal members={[]} modal={{kind:'article',item:article}} onClose={()=>setArticle(null)}/>}</>;
}
