export const kycSections=[
['व्यक्तिगत विवरण',[['name','पूरा नाम *'],['englishName','अंग्रेजी नाम'],['dob','जन्ममिति (AD)','date'],['gender','लिङ्ग',['महिला','पुरुष','अन्य','खुलाउन नचाहने']],['maritalStatus','वैवाहिक अवस्था',['','अविवाहित','विवाहित','एकल','अन्य']],['phone','मोबाइल नम्बर','tel'],['email','इमेल','email'],['education','शिक्षा'],['occupation','पेशा'],['skill','सीप / तालिम']]],
['स्थायी ठेगाना',[['province','प्रदेश'],['district','जिल्ला'],['municipality','पालिका'],['ward','वडा नम्बर','number'],['tole','टोल'],['houseNumber','घर नम्बर'],['landmark','नजिकको चिनारी']]],
['हालको बसोबास र location',[['currentProvince','हालको प्रदेश'],['currentDistrict','हालको जिल्ला'],['currentMunicipality','हालको पालिका'],['currentWard','हालको वडा','number'],['currentTole','हालको टोल'],['currentHouse','हालको घर नम्बर'],['latitude','अक्षांश (Latitude)','number'],['longitude','देशान्तर (Longitude)','number']]],
['परिवार र आपतकालीन सम्पर्क',[['fatherName','बुबाको नाम'],['motherName','आमाको नाम'],['spouseName','पति / पत्नीको नाम'],['householdId','परिवार संकेत नम्बर'],['emergencyName','आपतकालीन सम्पर्क व्यक्ति'],['emergencyRelation','नाता'],['emergencyPhone','आपतकालीन मोबाइल','tel']]],
['परिचयपत्र र मतदाता विवरण (ऐच्छिक)',[['citizenshipNumber','नागरिकता नम्बर'],['citizenshipDistrict','नागरिकता जारी जिल्ला'],['citizenshipDate','जारी मिति (AD)','date'],['nationalId','राष्ट्रिय परिचयपत्र नम्बर'],['voterId','मतदाता परिचयपत्र नम्बर'],['voterMunicipality','मतदाता नामावलीको पालिका'],['voterWard','मतदाता वडा','number'],['pollingStation','मतदान केन्द्र']]],
['सदस्यता र अभिलेख',[['role','पद',['सदस्य','अध्यक्ष','सचिव','कोषाध्यक्ष']],['status','सदस्यता अवस्था',['सक्रिय','नवीकरण बाँकी']],['joinedDate','सदस्यता मिति (AD)','date'],['renewalDate','नवीकरण मिति (AD)','date'],['documentNote','कागजात सम्बन्धी टिप्पणी','textarea'],['notes','अन्य आवश्यक विवरण','textarea']]]
];
export function validateKyc(v){
 if(!v.name?.trim())return 'पूरा नाम लेख्नुहोस्।';
 for(const k of ['phone','emergencyPhone'])if(v[k]&&!/^\d{10}$/.test(v[k]))return 'मोबाइल नम्बर १० अंकको हुनुपर्छ।';
 for(const k of ['ward','currentWard','voterWard'])if(v[k]&&(!Number.isInteger(Number(v[k]))||Number(v[k])<1||Number(v[k])>99))return 'वडा नम्बर १–९९ बीचको पूर्ण अंक हुनुपर्छ।';
 for(const [k,max]of [['latitude',90],['longitude',180]])if(v[k]!==''&&v[k]!=null&&(!Number.isFinite(Number(v[k]))||Math.abs(Number(v[k]))>max))return 'Location को अक्षांश / देशान्तर मिलाउनुहोस्।';
 if(Boolean(v.latitude)!==Boolean(v.longitude))return 'अक्षांश र देशान्तर दुवै राख्नुहोस्।';
 if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))return 'इमेल ठेगाना मिलाउनुहोस्।';
 if(v.family?.some(f=>f.phone&&!/^\d{10}$/.test(f.phone)))return 'परिवार सदस्यको मोबाइल १० अंकको हुनुपर्छ।';
 if(v.dob&&v.dob>new Date().toISOString().slice(0,10))return 'जन्ममिति भविष्यको हुन सक्दैन।';
 if(v.family?.some(f=>!f.name?.trim()||!f.relation?.trim()))return 'परिवारका प्रत्येक व्यक्तिको नाम र नाता राख्नुहोस्।';
 return null;
}

export const normalizeIdentity=value=>String(value??'').normalize('NFKC').replace(/[०-९]/g,c=>String('०१२३४५६७८९'.indexOf(c))).trim().replace(/\s+/g,' ').toLowerCase();
export function identityChanged(old,values){return !old||['name','phone','nationalId','citizenshipNumber','citizenshipDistrict','voterId'].some(k=>normalizeIdentity(old[k])!==normalizeIdentity(values[k]));}
export function duplicateCandidates(members,values,excludeId){return members.filter(m=>m.id!==excludeId).flatMap(m=>{const equal=k=>!!normalizeIdentity(values[k])&&normalizeIdentity(values[k])===normalizeIdentity(m[k]);const reasons=[];if(equal('name'))reasons.push('नाम मिलेको');if(equal('phone'))reasons.push('मोबाइल मिलेको');const strong=equal('nationalId')||(equal('citizenshipNumber')&&equal('citizenshipDistrict'));if(strong)reasons.push('परिचयपत्र मिलेको');return reasons.length?[{id:m.id,name:m.name,reasons,strong}]:[]});}
