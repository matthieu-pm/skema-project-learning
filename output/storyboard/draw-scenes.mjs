import fs from 'node:fs';
const ink='#34443f', paper='#fbf8ef', green='#91ad80', blue='#8eb6cb', skin='#e8c8ae';
const rect=(x,y,w,h,fill=paper,r=14)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${ink}" stroke-width="3"/>`;
const line=(x1,y1,x2,y2,c=ink,sw=3)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
const path=(d,fill='none',sw=3)=>`<path d="${d}" fill="${fill}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ellipse=(cx,cy,rx,ry,fill)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${ink}" stroke-width="3"/>`;
const label=(t,x,y,size=17)=>`<text x="${x}" y="${y}" font-family="Inter,Arial,sans-serif" font-size="${size}" font-weight="600" fill="${ink}">${t}</text>`;
const check=(x,y)=>path(`M${x} ${y+7}l8 8 17-22`);
function person(x,y,s=1,teacher=false,worried=false){return `<g transform="translate(${x} ${y}) scale(${s})">`+
  (teacher?'':path('M15 76Q-6 21 22 9Q64-14 88 19Q104 45 89 96L13 96Z','#555c50'))+
  path('M-3 203L3 132Q7 105 29 102L76 102Q99 105 103 132L110 203Z',teacher?blue:green)+
  rect(39,79,27,37,skin,10)+ellipse(52,50,37,44,skin)+
  (teacher?path('M16 43Q8 4 44 5Q85-5 90 35L74 23Q49 42 16 30Z','#4c574f'):path('M15 47Q8 13 39 7Q81-7 88 32Q54 14 36 41L17 54Z','#555c50'))+
  (teacher?ellipse(35,50,14,11,'none')+ellipse(70,50,14,11,'none')+line(49,50,56,50):'')+
  ellipse(37,50,1.7,2.1,ink)+ellipse(68,50,1.7,2.1,ink)+
  path('M53 52l-3 12 8 0', 'none',2)+path(worried?'M42 78q10-7 21 0':'M42 73q10 11 21 0','none',2)+
  line(20,143,22,202)+line(87,143,85,202)+'</g>';}
function bubble(x,y,w,h,text){return rect(x,y,w,h,'#fff',16)+path(`M${x+25} ${y+h}l-12 17 33-17`,'#fff')+(text?label(text,x+18,y+34,19):'');}
function phone(x,y,s=1,teacher=false,content='profile'){let ui='';
  if(content==='role')ui=ellipse(70,85,24,28,teacher?blue:green)+ellipse(63,80,2,2,ink)+ellipse(78,80,2,2,ink)+rect(17,130,106,37,teacher?'#fff':'#e4efd9',8)+label('Learn',45,154,14)+rect(17,178,106,37,teacher?'#ffe4bd':'#fff',8)+label('Teach',45,202,14);
  if(content==='goal')ui=label('French',20,70,18)+rect(17,87,106,35,'#e5efdc',8)+label('A2',28,110,15)+label('Everyday life',17,155,13)+rect(17,170,106,71,'#fff',8)+label('Order a meal',24,195,12)+label('confidently',24,215,12);
  if(content==='profile'||content==='booking')ui=ellipse(70,78,24,26,teacher?blue:green)+label(teacher?'Gilbert':'My goal',43,122,14)+line(20,143,118,143)+line(20,161,102,161)+line(20,179,118,179)+rect(17,201,106,41,'#e9f0ed',8)+label(content==='booking'?'Book a lesson':'Review',content==='booking'?24:45,227,content==='booking'?12:14);
  if(content==='calendar')ui=label('My preferences',17,60,13)+rect(17,81,106,102,'#fff',8)+line(17,108,123,108)+[0,1,2].map(i=>[0,1,2,3].map(j=>rect(27+j*23,122+i*17,9,9,i===1&&j===2?green:'#e8e9e1',2)).join('')).join('')+rect(17,204,106,37,'#e5efdc',8)+label('In person',34,228,13);
  if(content==='verify')ui=path('M70 58l39 16v44q-6 26-39 42-33-16-39-42V74Z','#e0edf1')+check(57,102)+label('Private',45,186,15)+rect(17,207,106,32,'#dbeaf0',8);
  if(content==='recap')ui=label('Your next step',17,62,13)+check(30,91)+line(65,100,120,100)+line(20,140,119,140)+line(20,160,106,160)+rect(17,192,106,47,'#e5efdc',8)+label('Private review',23,222,12);
  return `<g transform="translate(${x} ${y}) scale(${s})">${rect(0,0,140,280,'#fff',22)}${rect(46,10,48,7,ink,3)}${ui}${rect(17,253,106,12,teacher?blue:green,5)}</g>`;}
function plant(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})">${path('M24 80V9')}${path('M23 39Q-5 25 2 7q29 0 21 32Z','#acbd93')}${path('M24 58Q58 37 49 21q-27 5-25 37Z','#acbd93')}${path('M4 78h39l-7 47H12Z','#e2c7ad')}</g>`;}
const table=(y=350)=>rect(36,y,400,16,'#d9c7a9',5)+line(65,y+16,65,455)+line(407,y+16,407,455);
const window=()=>rect(278,36,145,133,'#e7eef0',4)+line(349,36,349,169)+line(278,102,423,102);
const notebook=(x,y,w=94)=>rect(x,y,w,106,'#fffdf5',4)+line(x+15,y+20,x+w-15,y+20)+line(x+15,y+40,x+w-15,y+40)+line(x+15,y+60,x+w-28,y+60);
const scenes=[];
scenes.push(window()+person(52,156,1.15,false,true)+table(374)+notebook(245,249,126)+label('MENU',271,242,24)+bubble(57,53,160,64,'Bonjour…')+plant(387,286,.7));
scenes.push(person(26,220,.98)+phone(245,95,1.08,false,'role')+bubble(31,87,169,60,'A real teacher')+path('M103 363q42 7 119-73','none',8));
scenes.push(phone(169,62,1.27,false,'goal')+notebook(29,226,90)+label('My goal',29,208,17)+plant(381,261,.9)+line(23,427,449,427));
scenes.push(person(23,214,1)+phone(249,58,1.05,false,'calendar')+table(411)+bubble(31,51,173,64,'At my pace')+path('M88 357q79 21 124-63','none',8));
scenes.push(person(154,101,1.15,true,true)+table(353)+notebook(29,251,85)+notebook(351,216,85)+rect(141,293,167,101,'#edf0eb',7)+line(124,398,327,398)+bubble(36,31,197,53,'Another late night…'));
scenes.push(person(30,212,1,true)+phone(258,81,1.06,true,'profile')+bubble(32,59,182,57,'My way to teach')+path('M111 354q83 17 121-65','none',8));
scenes.push(phone(42,63,1.18,true,'profile')+rect(252,95,172,199,'#fff',14)+label('45 minutes',276,138,19)+label('€30 / lesson',271,179,19)+line(270,201,405,201)+label('In person',278,236,18)+label('Paris',296,270,18)+check(305,347));
scenes.push(person(30,210,1,true)+phone(270,56,1.03,true,'verify')+rect(160,276,99,70,'#fff',7)+ellipse(183,299,9,10,blue)+line(204,298,245,298)+line(175,327,246,327)+bubble(22,61,190,64,'Sample check only')+path('M107 357q14-31 53-30','none',8));
scenes.push(person(25,226,1)+phone(245,59,1.14,true,'booking')+bubble(29,65,163,60,'My choice')+path('M107 366q84 4 141-71','none',8));
scenes.push(person(24,172,.82,true)+rect(152,75,279,271,'#fff',12)+label('Léa’s café lesson',171,111,22)+[0,1,2].map((i)=>rect(171,137+i*62,242,49,i===1?'#e4eedb':'#edf3f5',8)+label(['Useful words','One grammar point','Order together'][i],190,168+i*62,17)).join('')+table(383)+path('M95 304q32 4 66-86','none',7)+line(163,218,195,182));
scenes.push(window()+person(50,166,.97)+person(320,162,.97,true)+table(349)+notebook(187,294,91)+bubble(42,57,182,62,'Un café, merci !')+bubble(243,210,80,48,'Oui !'));
scenes.push(person(229,112,1.12)+rect(171,343,282,24,'#d8c3a6',4)+rect(172,367,281,97,'#e4d6bd',3)+phone(32,229,.69,false,'recap')+bubble(166,33,261,59,'Un café, s’il vous plaît.')+rect(356,302,47,41,'#fff',5)+path('M404 310q28-5 25 12t-25 9'));
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1888" height="1416" viewBox="0 0 1888 1416">${scenes.map((s,i)=>`<g id="scene-${String(i+1).padStart(2,'0')}" transform="translate(${i%4*472} ${Math.floor(i/4)*472})"><rect width="472" height="472" fill="${paper}"/>${s}</g>`).join('')}</svg>`;
fs.writeFileSync(new URL('./editable-scenes.svg',import.meta.url),svg);
