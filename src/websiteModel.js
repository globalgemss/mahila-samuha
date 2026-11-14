export const websiteTypes={about:'परिचय / सार्वजनिक विवरण',achievement:'प्रमाणित उपलब्धि',program:'कार्यक्रम / आवेदन',story:'सफलताका कथा',product:'उत्पादन तथा सेवा',gallery:'फोटो / भिडियो',notice:'सार्वजनिक सूचना',report:'सार्वजनिक प्रतिवेदन',partner:'सहकार्य गर्ने संस्था',contact:'सम्पर्क / कार्यालय समय',committee:'थप कार्यसमिति सदस्य'};
export const siteImages=['hero','training','exhibition','cleanup','story','products'];
export function safeWebUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
export function cleanWebsiteEntry(v){
 if(!v||!Object.hasOwn(websiteTypes,v.kind))throw Error('सामग्रीको प्रकार छान्नुहोस्।');
 const x={};for(const [k,max] of Object.entries({id:80,kind:30,title:120,body:3000,image:30,date:10,deadline:10,location:180,eligibility:350,price:80,url:1000,category:80,value:40,evidence:500,photo:500000}))x[k]=typeof v[k]==='string'?v[k].trim().slice(0,max):'';
 if(!x.title)throw Error('शीर्षक आवश्यक छ।');if(x.url&&!safeWebUrl(x.url))throw Error('लिङ्क https:// बाट सुरु हुनुपर्छ।');
 if(x.photo&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(x.photo))throw Error('फोटोको ढाँचा मिलेन।');
 if(x.image&&!siteImages.includes(x.image))throw Error('तस्बिर छान्नुहोस्।');
 for(const k of ['date','deadline'])if(x[k]&&!/^\d{4}-\d{2}-\d{2}$/.test(x[k]))throw Error('मिति मिलाउनुहोस्।');
 x.status=['draft','review','published'].includes(v.status)?v.status:'draft';x.consent=v.consent===true;x.open=v.open===true;
 if(x.status==='published'&&!x.consent)throw Error('सार्वजनिक प्रकाशनको अनुमति पुष्टि गर्नुहोस्।');
 if(x.status==='published'&&x.kind==='achievement'&&!x.evidence)throw Error('उपलब्धिको प्रमाण / स्रोत उल्लेख गर्नुहोस्।');
 if(x.status==='published'&&x.kind==='report'&&!x.url)throw Error('प्रतिवेदनको सार्वजनिक PDF लिङ्क राख्नुहोस्।');
 if(x.kind==='program'&&!['आगामी','सञ्चालनमा','सम्पन्न'].includes(x.category))throw Error('कार्यक्रम अवस्था आगामी / सञ्चालनमा / सम्पन्न राख्नुहोस्।');
 if(x.open&&x.kind==='program'&&(!x.date||!x.deadline||!x.location||!x.eligibility))throw Error('आवेदन खोल्न मिति, अन्तिम मिति, स्थान र योग्यता भर्नुहोस्।');
 if(x.open&&x.kind==='program'&&x.category==='सम्पन्न')throw Error('सम्पन्न कार्यक्रमको आवेदन बन्द गर्नुहोस्।');
 if(x.date&&x.deadline&&x.deadline>x.date)throw Error('आवेदनको अन्तिम मिति कार्यक्रमपछि हुन सक्दैन।');return x;
}
export function publishedWebsite(settings){return (settings.siteContent||[]).filter(x=>x.status==='published'&&x.consent===true).map(x=>{const v=cleanWebsiteEntry(x);delete v.evidence;return v})}
export function applyWebsite(d,a,u){d.settings.siteContent??=[];const list=d.settings.siteContent;
 if(a.type==='website/save'){const old=list.find(x=>x.id===a.entry?.id),entry=cleanWebsiteEntry(a.entry);if(entry.status==='published'&&!['owner','president'].includes(u.role))throw Error('प्रकाशन अध्यक्ष / प्रशासकले स्वीकृत गर्नुपर्छ।');entry.id=old?.id||crypto.randomUUID();entry.updatedAt=new Date().toISOString();entry.updatedBy=u.userId;if(old)Object.assign(old,entry);else {if(list.length>=300)throw Error('सामग्री सीमा पुग्यो।');list.push(entry)}}
 else if(a.type==='website/unpublish'){const old=list.find(x=>x.id===a.id);if(!old)throw Error('सामग्री भेटिएन।');old.status='draft'}return d;
}
export function applicationOpen(p,today=new Date().toISOString().slice(0,10)){return p?.kind==='program'&&p.status==='published'&&p.consent&&p.open&&p.category!=='सम्पन्न'&&(!p.deadline||p.deadline>=today)}
