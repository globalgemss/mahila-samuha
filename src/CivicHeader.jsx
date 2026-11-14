import React from 'react';
import {Flower2} from 'lucide-react';
export default function CivicHeader({settings}){
 return <section className="civic-header" aria-label="स्थानीय जनप्रतिनिधि परिचयको नमुना">
  <div className="civic-person"><div className="civic-frame"><div className="civic-portrait civic-mayor" role="img" aria-label="नगरप्रमुख स्थानका लागि काल्पनिक AI नमुना फोटो"/></div><span className="civic-role">नगरप्रमुख</span><span className="civic-office">गोकर्णेश्वर नगरपालिका</span><small>AI नमुना फोटो</small></div>
  <div className="civic-identity"><span className="civic-kicker">सहकार्य • सम्मान • सामुदायिक विकास</span><span className="civic-emblem"><Flower2 aria-hidden="true"/></span><h2>{settings.name}</h2><p>{settings.address}</p><div className="civic-rule"><span/>सीप, सहकार्य र आत्मनिर्भरता<span/></div><small className="civic-disclaimer">Demo प्रस्तुति • यी वास्तविक जनप्रतिनिधिका फोटो होइनन्।</small></div>
  <div className="civic-person"><div className="civic-frame"><div className="civic-portrait civic-ward" role="img" aria-label="वडा अध्यक्ष स्थानका लागि काल्पनिक AI नमुना फोटो"/></div><span className="civic-role">वडा अध्यक्ष</span><span className="civic-office">वडा नं. ५</span><small>AI नमुना फोटो</small></div>
 </section>;
}
