// docs/doc.js
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('pre code').forEach((el) => {
    const html = el.innerHTML
    const lines = html.split('\n')
    const minSpaces = lines.filter((line) => line.trim() !== '').reduce((acc, line) => Math.min(line.search(/\S|$/), acc), Infinity)
    el.innerHTML = lines.map((line) => line.slice(minSpaces)).join('\n').trim()
  })
})

document.querySelectorAll('.example').forEach(element => {
  const exampleObj = {}

  console.log('.example %o', element)

  element.querySelectorAll('.example__json .editor').forEach(element => {
    const lang = element.getAttribute('data-lang')
    if (!lang) { return }
    exampleObj[lang] = JSON.parse(element.textContent || '')
  })

  element.addEventListener('input', handleInput.bind(null, element))
})

/** @param {EventTarget} target - target element */
const matchesTextEdit = (target) => target.matches('.text-edit')

const BIND_SELECTOR_ATTRIBUTE = 'data-bind-selector'
const ELEMENT_TAG_NAME = 'image-comparison'

/**
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 */
function handleInput (exampleElement, event) {
  const { target } = event
  if (matchesTextEdit(target)) {
    const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || ELEMENT_TAG_NAME
    const node = exampleElement.querySelector(selector)
    if (node) { node.textContent = event.target.textContent }
  } else if (target.matches('.example-attribute-edit')) {
    const attribute = target.getAttribute('data-attribute').trim()
    reflectAttributeOnElement(exampleElement, event, attribute)
  } else if (target.matches('.example-style-edit')) {
    const cssProperty = target.getAttribute('data-style').trim()
    reflectStyleOnElement(exampleElement, event, cssProperty)
  }
}

/**
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 * @param {string} attribute - reflecting attribute
 */
function reflectAttributeOnElement (exampleElement, event, attribute) {
  const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || ELEMENT_TAG_NAME
  const node = exampleElement.querySelector(selector)
  node && node.setAttribute(attribute, event.target.textContent)
}

/**
 *
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 * @param {string} styleProperty - reflecting css property
 */
function reflectStyleOnElement (exampleElement, event, styleProperty) {
  const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || ELEMENT_TAG_NAME
  const node = exampleElement.querySelector(selector)
  node && node.style.setProperty(styleProperty, event.target.textContent)
}

/**
 * @param {Event} event - 'input' event object
 */
function reactElementNameChange (event) {
  const componentName = event.target.closest('.component-name-edit')
  if (componentName == null) { return }
  const newText = componentName.textContent
  document.body.querySelectorAll('.component-name-edit').forEach(ref => { if (componentName !== ref) ref.textContent = newText })
  document.body.querySelectorAll('.component-name-ref').forEach(ref => { ref.textContent = newText })
}

document.body.addEventListener('input', (event) => { reactElementNameChange(event) })

document.body.addEventListener('datafetch', (event) => {
  if (event.target?.matches('[data-src="example-src-1"]')) {
    event.detail.respondWith([{
      value: '1',
      text: 'option 1'
    }, {
      value: '2',
      text: 'option 2'
    }])
    return
  }

  if (event.target?.matches('[data-src="example-src-2"]')) {
    const response = new Response(`value,text
1,option 1
2,option 2
3,option 3
`)
    response.headers.set('content-type', 'text/csv')
    event.detail.respondWith(response)
    return
  }

  if (event.target?.matches('[data-src="example-src-3"]')) {
    const response = Response.json([
      { value: '1', text: 'json option 1' },
      { value: '2', text: 'json option 2' },
      { value: '3', text: 'json option 3' },
      { value: '4', text: 'json option 4' }
    ])
    event.detail.respondWith(response)
  }

  if (event.target?.matches('[data-src="example-src-countries"]')) {
    const response = new Response(countriesCSV)
    response.headers.set('content-type', 'text/csv')
    event.detail.respondWith(response)
  }
})

const countriesCSV = `text,value,ISO3,Top Level Domain,FIPS,ISO Numeric,GeoNameID,E164,Phone Code,Continent,Capital,Time Zone in Capital,Currency,Language Codes
Afghanistan,AF,AFG,af,AF,4,1149361,93,93,Asia,Kabul,Asia/Kabul,Afghani,"fa-AF,ps,uz-AF,tk"
Albania,AL,ALB,al,AL,8,783754,355,355,Europe,Tirana,Europe/Tirane,Lek,"sq,el"
Algeria,DZ,DZA,dz,AG,12,2589581,213,213,Africa,Algiers,Africa/Algiers,Dinar,ar-DZ
American Samoa,AS,ASM,as,AQ,16,5880801,1,1-684,Oceania,Pago Pago,Pacific/Pago_Pago,Dollar,"en-AS,sm,to"
Andorra,AD,AND,ad,AN,20,3041565,376,376,Europe,Andorra la Vella,Europe/Andorra,Euro,ca
Angola,AO,AGO,ao,AO,24,3351879,244,244,Africa,Luanda,Africa/Lagos,Kwanza,pt-AO
Anguilla,AI,AIA,ai,AV,660,3573511,1,1-264,North America,The Valley,America/Port_of_Spain,Dollar,en-AI
Antarctica,AQ,ATA,aq,AY,10,6697173,672,672,Antarctica,,Antarctica/Troll,,
Antigua and Barbuda,AG,ATG,ag,AC,28,3576396,1,1-268,North America,St. John's,America/Antigua,Dollar,en-AG
Argentina,AR,ARG,ar,AR,32,3865483,54,54,South America,Buenos Aires,America/Argentina/Buenos_Aires,Peso,"es-AR,en,it,de,fr,gn"
Armenia,AM,ARM,am,AM,51,174982,374,374,Asia,Yerevan,Asia/Yerevan,Dram,hy
Aruba,AW,ABW,aw,AA,533,3577279,297,297,North America,Oranjestad,America/Curacao,Guilder,"nl-AW,es,en"
Australia,AU,AUS,au,AS,36,2077456,61,61,Oceania,Canberra,Australia/Sydney,Dollar,en-AU
Austria,AT,AUT,at,AU,40,2782113,43,43,Europe,Vienna,Europe/Vienna,Euro,"de-AT,hr,hu,sl"
Azerbaijan,AZ,AZE,az,AJ,31,587116,994,994,Asia,Baku,Asia/Baku,Manat,"az,ru,hy"
Bahamas,BS,BHS,bs,BF,44,3572887,1,1-242,North America,Nassau,America/Nassau,Dollar,en-BS
Bahrain,BH,BHR,bh,BA,48,290291,973,973,Asia,Manama,Asia/Bahrain,Dinar,"ar-BH,en,fa,ur"
Bangladesh,BD,BGD,bd,BG,50,1210997,880,880,Asia,Dhaka,Asia/Dhaka,Taka,"bn-BD,en"
Barbados,BB,BRB,bb,BB,52,3374084,1,1-246,North America,Bridgetown,America/Barbados,Dollar,en-BB
Belarus,BY,BLR,by,BO,112,630336,375,375,Europe,Minsk,Europe/Minsk,Ruble,"be,ru"
Belgium,BE,BEL,be,BE,56,2802361,32,32,Europe,Brussels,Europe/Brussels,Euro,"nl-BE,fr-BE,de-BE"
Belize,BZ,BLZ,bz,BH,84,3582678,501,501,North America,Belmopan,America/Belize,Dollar,"en-BZ,es"
Benin,BJ,BEN,bj,BN,204,2395170,229,229,Africa,Porto-Novo,Africa/Lagos,Franc,fr-BJ
Bermuda,BM,BMU,bm,BD,60,3573345,1,1-441,North America,Hamilton,Atlantic/Bermuda,Dollar,"en-BM,pt"
Bhutan,BT,BTN,bt,BT,64,1252634,975,975,Asia,Thimphu,Asia/Thimphu,Ngultrum,dz
Bolivia,BO,BOL,bo,BL,68,3923057,591,591,South America,Sucre,America/La_Paz,Boliviano,"es-BO,qu,ay"
Bosnia and Herzegovina,BA,BIH,ba,BK,70,3277605,387,387,Europe,Sarajevo,Europe/Belgrade,Marka,"bs,hr-BA,sr-BA"
Botswana,BW,BWA,bw,BC,72,933860,267,267,Africa,Gaborone,Africa/Maputo,Pula,"en-BW,tn-BW"
Brazil,BR,BRA,br,BR,76,3469034,55,55,South America,Brasilia,America/Sao_Paulo,Real,"pt-BR,es,en,fr"
British Indian Ocean Territory,IO,IOT,io,IO,86,1282588,246,246,Asia,Diego Garcia,Indian/Chagos,Dollar,en-IO
British Virgin Islands,VG,VGB,vg,VI,92,3577718,1,1-284,North America,Road Town,America/Port_of_Spain,Dollar,en-VG
Brunei,BN,BRN,bn,BX,96,1820814,673,673,Asia,Bandar Seri Begawan,Asia/Brunei,Dollar,"ms-BN,en-BN"
Bulgaria,BG,BGR,bg,BU,100,732800,359,359,Europe,Sofia,Europe/Sofia,Lev,"bg,tr-BG"
Burkina Faso,BF,BFA,bf,UV,854,2361809,226,226,Africa,Ouagadougou,Africa/Abidjan,Franc,fr-BF
Burundi,BI,BDI,bi,BY,108,433561,257,257,Africa,Bujumbura,Africa/Maputo,Franc,"fr-BI,rn"
Cambodia,KH,KHM,kh,CB,116,1831722,855,855,Asia,Phnom Penh,Asia/Phnom_Penh,Riels,"km,fr,en"
Cameroon,CM,CMR,cm,CM,120,2233387,237,237,Africa,Yaounde,Africa/Lagos,Franc,"en-CM,fr-CM"
Canada,CA,CAN,ca,CA,124,6251999,1,1,North America,Ottawa,America/Toronto,Dollar,"en-CA,fr-CA,iu"
Cape Verde,CV,CPV,cv,CV,132,3374766,238,238,Africa,Praia,Atlantic/Cape_Verde,Escudo,pt-CV
Cayman Islands,KY,CYM,ky,CJ,136,3580718,1,1-345,North America,George Town,America/Cayman,Dollar,en-KY
Central African Republic,CF,CAF,cf,CT,140,239880,236,236,Africa,Bangui,Africa/Lagos,Franc,"fr-CF,sg,ln,kg"
Chad,TD,TCD,td,CD,148,2434508,235,235,Africa,N'Djamena,Africa/Ndjamena,Franc,"fr-TD,ar-TD,sre"
Chile,CL,CHL,cl,CI,152,3895114,56,56,South America,Santiago,America/Santiago,Peso,es-CL
China,CN,CHN,cn,CH,156,1814991,86,86,Asia,Beijing,Asia/Shanghai,Yuan Renminbi,"zh-CN,yue,wuu,dta,ug,za"
Christmas Island,CX,CXR,cx,KT,162,2078138,61,61,Asia,Flying Fish Cove,Indian/Christmas,Dollar,"en,zh,ms-CC"
Cocos Islands,CC,CCK,cc,CK,166,1547376,61,61,Asia,West Island,Indian/Cocos,Dollar,"ms-CC,en"
Colombia,CO,COL,co,CO,170,3686110,57,57,South America,Bogota,America/Bogota,Peso,es-CO
Comoros,KM,COM,km,CN,174,921929,269,269,Africa,Moroni,Indian/Comoro,Franc,"ar,fr-KM"
Cook Islands,CK,COK,ck,CW,184,1899402,682,682,Oceania,Avarua,Pacific/Rarotonga,Dollar,"en-CK,mi"
Costa Rica,CR,CRI,cr,CS,188,3624060,506,506,North America,San Jose,America/Costa_Rica,Colon,"es-CR,en"
Croatia,HR,HRV,hr,HR,191,3202326,385,385,Europe,Zagreb,Europe/Belgrade,Kuna,"hr-HR,sr"
Cuba,CU,CUB,cu,CU,192,3562981,53,53,North America,Havana,America/Havana,Peso,es-CU
Curacao,CW,CUW,cw,UC,531,7626836,599,599,North America,Willemstad,America/Curacao,Guilder,"nl,pap"
Cyprus,CY,CYP,cy,CY,196,146669,357,357,Europe,Nicosia,Asia/Nicosia,Euro,"el-CY,tr-CY,en"
Czech Republic,CZ,CZE,cz,EZ,203,3077311,420,420,Europe,Prague,Europe/Prague,Koruna,"cs,sk"
Democratic Republic of the Congo,CD,COD,cd,CG,180,203312,243,243,Africa,Kinshasa,Africa/Lagos,Franc,"fr-CD,ln,kg"
Denmark,DK,DNK,dk,DA,208,2623032,45,45,Europe,Copenhagen,Europe/Copenhagen,Krone,"da-DK,en,fo,de-DK"
Djibouti,DJ,DJI,dj,DJ,262,223816,253,253,Africa,Djibouti,Africa/Djibouti,Franc,"fr-DJ,ar,so-DJ,aa"
Dominica,DM,DMA,dm,DO,212,3575830,1,1-767,North America,Roseau,America/Port_of_Spain,Dollar,en-DM
Dominican Republic,DO,DOM,do,DR,214,3508796,1,"1-809, 1-829, 1-849",North America,Santo Domingo,America/Santo_Domingo,Peso,es-DO
East Timor,TL,TLS,tl,TT,626,1966436,670,670,Oceania,Dili,Asia/Dili,Dollar,"tet,pt-TL,id,en"
Ecuador,EC,ECU,ec,EC,218,3658394,593,593,South America,Quito,America/Guayaquil,Dollar,es-EC
Egypt,EG,EGY,eg,EG,818,357994,20,20,Africa,Cairo,Africa/Cairo,Pound,"ar-EG,en,fr"
El Salvador,SV,SLV,sv,ES,222,3585968,503,503,North America,San Salvador,America/El_Salvador,Dollar,es-SV
Equatorial Guinea,GQ,GNQ,gq,EK,226,2309096,240,240,Africa,Malabo,Africa/Lagos,Franc,"es-GQ,fr"
Eritrea,ER,ERI,er,ER,232,338010,291,291,Africa,Asmara,Africa/Asmara,Nakfa,"aa-ER,ar,tig,kun,ti-ER"
Estonia,EE,EST,ee,EN,233,453733,372,372,Europe,Tallinn,Europe/Tallinn,Euro,"et,ru"
Ethiopia,ET,ETH,et,ET,231,337996,251,251,Africa,Addis Ababa,Africa/Addis_Ababa,Birr,"am,en-ET,om-ET,ti-ET,so-ET,sid"
Falkland Islands,FK,FLK,fk,FK,238,3474414,500,500,South America,Stanley,Atlantic/Stanley,Pound,en-FK
Faroe Islands,FO,FRO,fo,FO,234,2622320,298,298,Europe,Torshavn,Atlantic/Faroe,Krone,"fo,da-FO"
Fiji,FJ,FJI,fj,FJ,242,2205218,679,679,Oceania,Suva,Pacific/Fiji,Dollar,"en-FJ,fj"
Finland,FI,FIN,fi,FI,246,660013,358,358,Europe,Helsinki,Europe/Helsinki,Euro,"fi-FI,sv-FI,smn"
France,FR,FRA,fr,FR,250,3017382,33,33,Europe,Paris,Europe/Paris,Euro,"fr-FR,frp,br,co,ca,eu,oc"
French Polynesia,PF,PYF,pf,FP,258,4030656,689,689,Oceania,Papeete,Pacific/Tahiti,Franc,"fr-PF,ty"
Gabon,GA,GAB,ga,GB,266,2400553,241,241,Africa,Libreville,Africa/Lagos,Franc,fr-GA
Gambia,GM,GMB,gm,GA,270,2413451,220,220,Africa,Banjul,Africa/Abidjan,Dalasi,"en-GM,mnk,wof,wo,ff"
Georgia,GE,GEO,ge,GG,268,614540,995,995,Asia,Tbilisi,Asia/Tbilisi,Lari,"ka,ru,hy,az"
Germany,DE,DEU,de,GM,276,2921044,49,49,Europe,Berlin,Europe/Berlin,Euro,de
Ghana,GH,GHA,gh,GH,288,2300660,233,233,Africa,Accra,Africa/Accra,Cedi,"en-GH,ak,ee,tw"
Gibraltar,GI,GIB,gi,GI,292,2411586,350,350,Europe,Gibraltar,Europe/Gibraltar,Pound,"en-GI,es,it,pt"
Greece,GR,GRC,gr,GR,300,390903,30,30,Europe,Athens,Europe/Athens,Euro,"el-GR,en,fr"
Greenland,GL,GRL,gl,GL,304,3425505,299,299,North America,Nuuk,America/Godthab,Krone,"kl,da-GL,en"
Grenada,GD,GRD,gd,GJ,308,3580239,1,1-473,North America,St. George's,America/Port_of_Spain,Dollar,en-GD
Guam,GU,GUM,gu,GQ,316,4043988,1,1-671,Oceania,Hagatna,Pacific/Guam,Dollar,"en-GU,ch-GU"
Guatemala,GT,GTM,gt,GT,320,3595528,502,502,North America,Guatemala City,America/Guatemala,Quetzal,es-GT
Guernsey,GG,GGY,gg,GK,831,3042362,44,44-1481,Europe,St Peter Port,Europe/London,Pound,"en,fr"
Guinea,GN,GIN,gn,GV,324,2420477,224,224,Africa,Conakry,Africa/Abidjan,Franc,fr-GN
Guinea-Bissau,GW,GNB,gw,PU,624,2372248,245,245,Africa,Bissau,Africa/Bissau,Franc,"pt-GW,pov"
Guyana,GY,GUY,gy,GY,328,3378535,592,592,South America,Georgetown,America/Guyana,Dollar,en-GY
Haiti,HT,HTI,ht,HA,332,3723988,509,509,North America,Port-au-Prince,America/Port-au-Prince,Gourde,"ht,fr-HT"
Honduras,HN,HND,hn,HO,340,3608932,504,504,North America,Tegucigalpa,America/Tegucigalpa,Lempira,es-HN
Hong Kong,HK,HKG,hk,HK,344,1819730,852,852,Asia,Hong Kong,Asia/Hong_Kong,Dollar,"zh-HK,yue,zh,en"
Hungary,HU,HUN,hu,HU,348,719819,36,36,Europe,Budapest,Europe/Budapest,Forint,hu-HU
Iceland,IS,ISL,is,IC,352,2629691,354,354,Europe,Reykjavik,Atlantic/Reykjavik,Krona,"is,en,de,da,sv,no"
India,IN,IND,in,IN,356,1269750,91,91,Asia,New Delhi,Asia/Kolkata,Rupee,"en-IN,hi,bn,te,mr,ta,ur,gu,kn,ml,or,pa,as,bh,sat,ks,ne,sd,kok,doi,mni,sit,sa,fr,lus,inc"
Indonesia,ID,IDN,id,ID,360,1643084,62,62,Asia,Jakarta,Asia/Jakarta,Rupiah,"id,en,nl,jv"
Iran,IR,IRN,ir,IR,364,130758,98,98,Asia,Tehran,Asia/Tehran,Rial,"fa-IR,ku"
Iraq,IQ,IRQ,iq,IZ,368,99237,964,964,Asia,Baghdad,Asia/Baghdad,Dinar,"ar-IQ,ku,hy"
Ireland,IE,IRL,ie,EI,372,2963597,353,353,Europe,Dublin,Europe/Dublin,Euro,"en-IE,ga-IE"
Isle of Man,IM,IMN,im,IM,833,3042225,44,44-1624,Europe,"Douglas, Isle of Man",Europe/London,Pound,"en,gv"
Israel,IL,ISR,il,IS,376,294640,972,972,Asia,Jerusalem,Asia/Jerusalem,Shekel,"he,ar-IL,en-IL,"
Italy,IT,ITA,it,IT,380,3175395,39,39,Europe,Rome,Europe/Rome,Euro,"it-IT,de-IT,fr-IT,sc,ca,co,sl"
Ivory Coast,CI,CIV,ci,IV,384,2287781,225,225,Africa,Yamoussoukro,Africa/Abidjan,Franc,fr-CI
Jamaica,JM,JAM,jm,JM,388,3489940,1,1-876,North America,Kingston,America/Jamaica,Dollar,en-JM
Japan,JP,JPN,jp,JA,392,1861060,81,81,Asia,Tokyo,Asia/Tokyo,Yen,ja
Jersey,JE,JEY,je,JE,832,3042142,44,44-1534,Europe,Saint Helier,Europe/London,Pound,"en,pt"
Jordan,JO,JOR,jo,JO,400,248816,962,962,Asia,Amman,Asia/Amman,Dinar,"ar-JO,en"
Kazakhstan,KZ,KAZ,kz,KZ,398,1522867,7,7,Asia,Astana,Asia/Almaty,Tenge,"kk,ru"
Kenya,KE,KEN,ke,KE,404,192950,254,254,Africa,Nairobi,Africa/Nairobi,Shilling,"en-KE,sw-KE"
Kiribati,KI,KIR,ki,KR,296,4030945,686,686,Oceania,Tarawa,Pacific/Tarawa,Dollar,"en-KI,gil"
Kosovo,XK,XKX,,KV,0,831053,383,383,Europe,Pristina,Europe/Belgrade,Euro,"sq,sr"
Kuwait,KW,KWT,kw,KU,414,285570,965,965,Asia,Kuwait City,Asia/Kuwait,Dinar,"ar-KW,en"
Kyrgyzstan,KG,KGZ,kg,KG,417,1527747,996,996,Asia,Bishkek,Asia/Bishkek,Som,"ky,uz,ru"
Laos,LA,LAO,la,LA,418,1655842,856,856,Asia,Vientiane,Asia/Vientiane,Kip,"lo,fr,en"
Latvia,LV,LVA,lv,LG,428,458258,371,371,Europe,Riga,Europe/Riga,Euro,"lv,ru,lt"
Lebanon,LB,LBN,lb,LE,422,272103,961,961,Asia,Beirut,Asia/Beirut,Pound,"ar-LB,fr-LB,en,hy"
Lesotho,LS,LSO,ls,LT,426,932692,266,266,Africa,Maseru,Africa/Johannesburg,Loti,"en-LS,st,zu,xh"
Liberia,LR,LBR,lr,LI,430,2275384,231,231,Africa,Monrovia,Africa/Monrovia,Dollar,en-LR
Libya,LY,LBY,ly,LY,434,2215636,218,218,Africa,Tripolis,Africa/Tripoli,Dinar,"ar-LY,it,en"
Liechtenstein,LI,LIE,li,LS,438,3042058,423,423,Europe,Vaduz,Europe/Zurich,Franc,de-LI
Lithuania,LT,LTU,lt,LH,440,597427,370,370,Europe,Vilnius,Europe/Vilnius,Euro,"lt,ru,pl"
Luxembourg,LU,LUX,lu,LU,442,2960313,352,352,Europe,Luxembourg,Europe/Luxembourg,Euro,"lb,de-LU,fr-LU"
Macau,MO,MAC,mo,MC,446,1821275,853,853,Asia,Macao,Asia/Macau,Pataca,"zh,zh-MO,pt"
Macedonia,MK,MKD,mk,MK,807,718075,389,389,Europe,Skopje,Europe/Belgrade,Denar,"mk,sq,tr,rmm,sr"
Madagascar,MG,MDG,mg,MA,450,1062947,261,261,Africa,Antananarivo,Indian/Antananarivo,Ariary,"fr-MG,mg"
Malawi,MW,MWI,mw,MI,454,927384,265,265,Africa,Lilongwe,Africa/Maputo,Kwacha,"ny,yao,tum,swk"
Malaysia,MY,MYS,my,MY,458,1733045,60,60,Asia,Kuala Lumpur,Asia/Kuala_Lumpur,Ringgit,"ms-MY,en,zh,ta,te,ml,pa,th"
Maldives,MV,MDV,mv,MV,462,1282028,960,960,Asia,Male,Indian/Maldives,Rufiyaa,"dv,en"
Mali,ML,MLI,ml,ML,466,2453866,223,223,Africa,Bamako,Africa/Abidjan,Franc,"fr-ML,bm"
Malta,MT,MLT,mt,MT,470,2562770,356,356,Europe,Valletta,Europe/Malta,Euro,"mt,en-MT"
Marshall Islands,MH,MHL,mh,RM,584,2080185,692,692,Oceania,Majuro,Pacific/Majuro,Dollar,"mh,en-MH"
Mauritania,MR,MRT,mr,MR,478,2378080,222,222,Africa,Nouakchott,Africa/Abidjan,Ouguiya,"ar-MR,fuc,snk,fr,mey,wo"
Mauritius,MU,MUS,mu,MP,480,934292,230,230,Africa,Port Louis,Indian/Mauritius,Rupee,"en-MU,bho,fr"
Mayotte,YT,MYT,yt,MF,175,1024031,262,262,Africa,Mamoudzou,Indian/Mayotte,Euro,fr-YT
Mexico,MX,MEX,mx,MX,484,3996063,52,52,North America,Mexico City,America/Mexico_City,Peso,es-MX
Micronesia,FM,FSM,fm,FM,583,2081918,691,691,Oceania,Palikir,Pacific/Pohnpei,Dollar,"en-FM,chk,pon,yap,kos,uli,woe,nkr,kpg"
Moldova,MD,MDA,md,MD,498,617790,373,373,Europe,Chisinau,Europe/Chisinau,Leu,"ro,ru,gag,tr"
Monaco,MC,MCO,mc,MN,492,2993457,377,377,Europe,Monaco,Europe/Monaco,Euro,"fr-MC,en,it"
Mongolia,MN,MNG,mn,MG,496,2029969,976,976,Asia,Ulan Bator,Asia/Ulaanbaatar,Tugrik,"mn,ru"
Montenegro,ME,MNE,me,MJ,499,3194884,382,382,Europe,Podgorica,Europe/Belgrade,Euro,"sr,hu,bs,sq,hr,rom"
Montserrat,MS,MSR,ms,MH,500,3578097,1,1-664,North America,Plymouth,America/Port_of_Spain,Dollar,en-MS
Morocco,MA,MAR,ma,MO,504,2542007,212,212,Africa,Rabat,Africa/Casablanca,Dirham,"ar-MA,fr"
Mozambique,MZ,MOZ,mz,MZ,508,1036973,258,258,Africa,Maputo,Africa/Maputo,Metical,"pt-MZ,vmw"
Myanmar,MM,MMR,mm,BM,104,1327865,95,95,Asia,Nay Pyi Taw,Asia/Rangoon,Kyat,my
Namibia,NA,NAM,na,WA,516,3355338,264,264,Africa,Windhoek,Africa/Windhoek,Dollar,"en-NA,af,de,hz,naq"
Nauru,NR,NRU,nr,NR,520,2110425,674,674,Oceania,Yaren,Pacific/Nauru,Dollar,"na,en-NR"
Nepal,NP,NPL,np,NP,524,1282988,977,977,Asia,Kathmandu,Asia/Kathmandu,Rupee,"ne,en"
Netherlands,NL,NLD,nl,NL,528,2750405,31,31,Europe,Amsterdam,Europe/Amsterdam,Euro,"nl-NL,fy-NL"
Netherlands Antilles,AN,ANT,an,NT,530,,599,599,North America,Willemstad,America/Curacao,Guilder,"nl-AN,en,es"
New Caledonia,NC,NCL,nc,NC,540,2139685,687,687,Oceania,Noumea,Pacific/Noumea,Franc,fr-NC
New Zealand,NZ,NZL,nz,NZ,554,2186224,64,64,Oceania,Wellington,Pacific/Auckland,Dollar,"en-NZ,mi"
Nicaragua,NI,NIC,ni,NU,558,3617476,505,505,North America,Managua,America/Managua,Cordoba,"es-NI,en"
Niger,NE,NER,ne,NG,562,2440476,227,227,Africa,Niamey,Africa/Lagos,Franc,"fr-NE,ha,kr,dje"
Nigeria,NG,NGA,ng,NI,566,2328926,234,234,Africa,Abuja,Africa/Lagos,Naira,"en-NG,ha,yo,ig,ff"
Niue,NU,NIU,nu,NE,570,4036232,683,683,Oceania,Alofi,Pacific/Niue,Dollar,"niu,en-NU"
North Korea,KP,PRK,kp,KN,408,1873107,850,850,Asia,Pyongyang,Asia/Pyongyang,Won,ko-KP
Northern Mariana Islands,MP,MNP,mp,CQ,580,4041468,1,1-670,Oceania,Saipan,Pacific/Saipan,Dollar,"fil,tl,zh,ch-MP,en-MP"
Norway,NO,NOR,no,NO,578,3144096,47,47,Europe,Oslo,Europe/Oslo,Krone,"no,nb,nn,se,fi"
Oman,OM,OMN,om,MU,512,286963,968,968,Asia,Muscat,Asia/Muscat,Rial,"ar-OM,en,bal,ur"
Pakistan,PK,PAK,pk,PK,586,1168579,92,92,Asia,Islamabad,Asia/Karachi,Rupee,"ur-PK,en-PK,pa,sd,ps,brh"
Palau,PW,PLW,pw,PS,585,1559582,680,680,Oceania,Melekeok,Pacific/Palau,Dollar,"pau,sov,en-PW,tox,ja,fil,zh"
Palestine,PS,PSE,ps,WE,275,6254930,970,970,Asia,East Jerusalem,Asia/Hebron,Shekel,ar-PS
Panama,PA,PAN,pa,PM,591,3703430,507,507,North America,Panama City,America/Panama,Balboa,"es-PA,en"
Papua New Guinea,PG,PNG,pg,PP,598,2088628,675,675,Oceania,Port Moresby,Pacific/Port_Moresby,Kina,"en-PG,ho,meu,tpi"
Paraguay,PY,PRY,py,PA,600,3437598,595,595,South America,Asuncion,America/Asuncion,Guarani,"es-PY,gn"
Peru,PE,PER,pe,PE,604,3932488,51,51,South America,Lima,America/Lima,Sol,"es-PE,qu,ay"
Philippines,PH,PHL,ph,RP,608,1694008,63,63,Asia,Manila,Asia/Manila,Peso,"tl,en-PH,fil"
Pitcairn,PN,PCN,pn,PC,612,4030699,64,64,Oceania,Adamstown,Pacific/Pitcairn,Dollar,en-PN
Poland,PL,POL,pl,PL,616,798544,48,48,Europe,Warsaw,Europe/Warsaw,Zloty,pl
Portugal,PT,PRT,pt,PO,620,2264397,351,351,Europe,Lisbon,Europe/Lisbon,Euro,"pt-PT,mwl"
Puerto Rico,PR,PRI,pr,RQ,630,4566966,1,"1-787, 1-939",North America,San Juan,America/Puerto_Rico,Dollar,"en-PR,es-PR"
Qatar,QA,QAT,qa,QA,634,289688,974,974,Asia,Doha,Asia/Qatar,Rial,"ar-QA,es"
Republic of the Congo,CG,COG,cg,CF,178,2260494,242,242,Africa,Brazzaville,Africa/Lagos,Franc,"fr-CG,kg,ln-CG"
Reunion,RE,REU,re,RE,638,935317,262,262,Africa,Saint-Denis,Indian/Reunion,Euro,fr-RE
Romania,RO,ROU,ro,RO,642,798549,40,40,Europe,Bucharest,Europe/Bucharest,Leu,"ro,hu,rom"
Russia,RU,RUS,ru,RS,643,2017370,7,7,Europe,Moscow,Europe/Moscow,Ruble,"ru,tt,xal,cau,ady,kv,ce,tyv,cv,udm,tut,mns,bua,myv,mdf,chm,ba,inh,tut,kbd,krc,ava,sah,nog"
Rwanda,RW,RWA,rw,RW,646,49518,250,250,Africa,Kigali,Africa/Maputo,Franc,"rw,en-RW,fr-RW,sw"
Saint Barthelemy,BL,BLM,gp,TB,652,3578476,590,590,North America,Gustavia,America/Port_of_Spain,Euro,fr
Saint Helena,SH,SHN,sh,SH,654,3370751,290,290,Africa,Jamestown,Africa/Abidjan,Pound,en-SH
Saint Kitts and Nevis,KN,KNA,kn,SC,659,3575174,1,1-869,North America,Basseterre,America/Port_of_Spain,Dollar,en-KN
Saint Lucia,LC,LCA,lc,ST,662,3576468,1,1-758,North America,Castries,America/Port_of_Spain,Dollar,en-LC
Saint Martin,MF,MAF,gp,RN,663,3578421,1,590,North America,Marigot,America/Port_of_Spain,Euro,fr
Saint Pierre and Miquelon,PM,SPM,pm,SB,666,3424932,508,508,North America,Saint-Pierre,America/Miquelon,Euro,fr-PM
Saint Vincent and the Grenadines,VC,VCT,vc,VC,670,3577815,1,1-784,North America,Kingstown,America/Port_of_Spain,Dollar,"en-VC,fr"
Samoa,WS,WSM,ws,WS,882,4034894,685,685,Oceania,Apia,Pacific/Apia,Tala,"sm,en-WS"
San Marino,SM,SMR,sm,SM,674,3168068,378,378,Europe,San Marino,Europe/Rome,Euro,it-SM
Sao Tome and Principe,ST,STP,st,TP,678,2410758,239,239,Africa,Sao Tome,Africa/Abidjan,Dobra,pt-ST
Saudi Arabia,SA,SAU,sa,SA,682,102358,966,966,Asia,Riyadh,Asia/Riyadh,Rial,ar-SA
Senegal,SN,SEN,sn,SG,686,2245662,221,221,Africa,Dakar,Africa/Abidjan,Franc,"fr-SN,wo,fuc,mnk"
Serbia,RS,SRB,rs,RI,688,6290252,381,381,Europe,Belgrade,Europe/Belgrade,Dinar,"sr,hu,bs,rom"
Seychelles,SC,SYC,sc,SE,690,241170,248,248,Africa,Victoria,Indian/Mahe,Rupee,"en-SC,fr-SC"
Sierra Leone,SL,SLE,sl,SL,694,2403846,232,232,Africa,Freetown,Africa/Abidjan,Leone,"en-SL,men,tem"
Singapore,SG,SGP,sg,SN,702,1880251,65,65,Asia,Singapore,Asia/Singapore,Dollar,"cmn,en-SG,ms-SG,ta-SG,zh-SG"
Sint Maarten,SX,SXM,sx,NN,534,7609695,1,1-721,North America,Philipsburg,America/Curacao,Guilder,"nl,en"
Slovakia,SK,SVK,sk,LO,703,3057568,421,421,Europe,Bratislava,Europe/Prague,Euro,"sk,hu"
Slovenia,SI,SVN,si,SI,705,3190538,386,386,Europe,Ljubljana,Europe/Belgrade,Euro,"sl,sh"
Solomon Islands,SB,SLB,sb,BP,90,2103350,677,677,Oceania,Honiara,Pacific/Guadalcanal,Dollar,"en-SB,tpi"
Somalia,SO,SOM,so,SO,706,51537,252,252,Africa,Mogadishu,Africa/Mogadishu,Shilling,"so-SO,ar-SO,it,en-SO"
South Africa,ZA,ZAF,za,SF,710,953987,27,27,Africa,Pretoria,Africa/Johannesburg,Rand,"zu,xh,af,nso,en-ZA,tn,st,ts,ss,ve,nr"
South Korea,KR,KOR,kr,KS,410,1835841,82,82,Asia,Seoul,Asia/Seoul,Won,"ko-KR,en"
South Sudan,SS,SSD,ss,OD,728,7909807,211,211,Africa,Juba,Africa/Khartoum,Pound,en
Spain,ES,ESP,es,SP,724,2510769,34,34,Europe,Madrid,Europe/Madrid,Euro,"es-ES,ca,gl,eu,oc"
Sri Lanka,LK,LKA,lk,CE,144,1227603,94,94,Asia,Colombo,Asia/Colombo,Rupee,"si,ta,en"
Sudan,SD,SDN,sd,SU,729,366755,249,249,Africa,Khartoum,Africa/Khartoum,Pound,"ar-SD,en,fia"
Suriname,SR,SUR,sr,NS,740,3382998,597,597,South America,Paramaribo,America/Paramaribo,Dollar,"nl-SR,en,srn,hns,jv"
Svalbard and Jan Mayen,SJ,SJM,sj,SV,744,607072,47,47,Europe,Longyearbyen,Europe/Oslo,Krone,"no,ru"
Swaziland,SZ,SWZ,sz,WZ,748,934841,268,268,Africa,Mbabane,Africa/Johannesburg,Lilangeni,"en-SZ,ss-SZ"
Sweden,SE,SWE,se,SW,752,2661886,46,46,Europe,Stockholm,Europe/Stockholm,Krona,"sv-SE,se,sma,fi-SE"
Switzerland,CH,CHE,ch,SZ,756,2658434,41,41,Europe,Berne,Europe/Zurich,Franc,"de-CH,fr-CH,it-CH,rm"
Syria,SY,SYR,sy,SY,760,163843,963,963,Asia,Damascus,Asia/Damascus,Pound,"ar-SY,ku,hy,arc,fr,en"
Taiwan,TW,TWN,tw,TW,158,1668284,886,886,Asia,Taipei,Asia/Taipei,Dollar,"zh-TW,zh,nan,hak"
Tajikistan,TJ,TJK,tj,TI,762,1220409,992,992,Asia,Dushanbe,Asia/Dushanbe,Somoni,"tg,ru"
Tanzania,TZ,TZA,tz,TZ,834,149590,255,255,Africa,Dodoma,Africa/Dar_es_Salaam,Shilling,"sw-TZ,en,ar"
Thailand,TH,THA,th,TH,764,1605651,66,66,Asia,Bangkok,Asia/Bangkok,Baht,"th,en"
Togo,TG,TGO,tg,TO,768,2363686,228,228,Africa,Lome,Africa/Abidjan,Franc,"fr-TG,ee,hna,kbp,dag,ha"
Tokelau,TK,TKL,tk,TL,772,4031074,690,690,Oceania,,Pacific/Fakaofo,Dollar,"tkl,en-TK"
Tonga,TO,TON,to,TN,776,4032283,676,676,Oceania,Nuku'alofa,Pacific/Tongatapu,Pa'anga,"to,en-TO"
Trinidad and Tobago,TT,TTO,tt,TD,780,3573591,1,1-868,North America,Port of Spain,America/Port_of_Spain,Dollar,"en-TT,hns,fr,es,zh"
Tunisia,TN,TUN,tn,TS,788,2464461,216,216,Africa,Tunis,Africa/Tunis,Dinar,"ar-TN,fr"
Turkey,TR,TUR,tr,TU,792,298795,90,90,Asia,Ankara,Europe/Istanbul,Lira,"tr-TR,ku,diq,az,av"
Turkmenistan,TM,TKM,tm,TX,795,1218197,993,993,Asia,Ashgabat,Asia/Ashgabat,Manat,"tk,ru,uz"
Turks and Caicos Islands,TC,TCA,tc,TK,796,3576916,1,1-649,North America,Cockburn Town,America/Grand_Turk,Dollar,en-TC
Tuvalu,TV,TUV,tv,TV,798,2110297,688,688,Oceania,Funafuti,Pacific/Funafuti,Dollar,"tvl,en,sm,gil"
U.S. Virgin Islands,VI,VIR,vi,VQ,850,4796775,1,1-340,North America,Charlotte Amalie,America/Port_of_Spain,Dollar,en-VI
Uganda,UG,UGA,ug,UG,800,226074,256,256,Africa,Kampala,Africa/Kampala,Shilling,"en-UG,lg,sw,ar"
Ukraine,UA,UKR,ua,UP,804,690791,380,380,Europe,Kiev,Europe/Kiev,Hryvnia,"uk,ru-UA,rom,pl,hu"
United Arab Emirates,AE,ARE,ae,AE,784,290557,971,971,Asia,Abu Dhabi,Asia/Dubai,Dirham,"ar-AE,fa,en,hi,ur"
United Kingdom,GB,GBR,uk,UK,826,2635167,44,44,Europe,London,Europe/London,Pound,"en-GB,cy-GB,gd"
United States,US,USA,us,US,840,6252001,1,1,North America,Washington,America/New_York,Dollar,"en-US,es-US,haw,fr"
Uruguay,UY,URY,uy,UY,858,3439705,598,598,South America,Montevideo,America/Montevideo,Peso,es-UY
Uzbekistan,UZ,UZB,uz,UZ,860,1512440,998,998,Asia,Tashkent,Asia/Tashkent,Som,"uz,ru,tg"
Vanuatu,VU,VUT,vu,NH,548,2134431,678,678,Oceania,Port Vila,Pacific/Efate,Vatu,"bi,en-VU,fr-VU"
Vatican,VA,VAT,va,VT,336,3164670,39,379,Europe,Vatican City,Europe/Rome,Euro,"la,it,fr"
Venezuela,VE,VEN,ve,VE,862,3625428,58,58,South America,Caracas,America/Caracas,Bolivar,es-VE
Vietnam,VN,VNM,vn,VM,704,1562822,84,84,Asia,Hanoi,Asia/Ho_Chi_Minh,Dong,"vi,en,fr,zh,km"
Wallis and Futuna,WF,WLF,wf,WF,876,4034749,681,681,Oceania,Mata Utu,Pacific/Wallis,Franc,"wls,fud,fr-WF"
Western Sahara,EH,ESH,eh,WI,732,2461445,212,212,Africa,El-Aaiun,Africa/El_Aaiun,Dirham,"ar,mey"
Yemen,YE,YEM,ye,YM,887,69543,967,967,Asia,Sanaa,Asia/Aden,Rial,ar-YE
Zambia,ZM,ZMB,zm,ZA,894,895949,260,260,Africa,Lusaka,Africa/Maputo,Kwacha,"en-ZM,bem,loz,lun,lue,ny,toi"
Zimbabwe,ZW,ZWE,zw,ZI,716,878675,263,263,Africa,Harare,Africa/Maputo,Dollar,"en-ZW,sn,nr,nd"`
