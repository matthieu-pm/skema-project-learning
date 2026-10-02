import fs from 'node:fs';
import {rect,line,path,ellipse,label,check,person,bubble,plant,table,notebook} from './drawing-primitives.mjs';
const purple='#e9def4', blue='#deedf4', amber='#f4dfb4', paper='#fbf8ef';
const g=(x,y,s,content)=>`<g transform="translate(${x} ${y}) scale(${s})">${content}</g>`;
function actor(who,x,y,s=1,worry=false){
  if(who==='Gilbert') return person(x,y,s,true,worry);
  if(who==='Lucas')return g(x,y,s,path('M-3 203L3 132Q7 105 29 102L76 102Q99 105 103 132L110 203Z','#c4aa81')+rect(39,79,27,37,'#e8c8ae',10)+ellipse(52,50,37,44,'#e8c8ae')+path('M16 43Q8 4 44 5Q85-5 90 35L74 23Q49 42 16 30Z','#4c574f')+ellipse(37,50,2,2,'#34443f')+ellipse(68,50,2,2,'#34443f')+path('M53 52l-3 12 8 0','none',2)+path(worry?'M42 78q10-7 21 0':'M42 73q10 11 21 0','none',2)+line(20,143,22,202)+line(87,143,85,202));
  let p=person(x,y,s,false,worry);if(who==='Maya')p=p.replaceAll('#e8c8ae','#c79570').replaceAll('#555c50','#45423e');return p;
}
function screen(x,y,w,h,title,content,fill='#fff'){return rect(x,y,w,h,fill,14)+label(title,x+18,y+33,19)+line(x+16,y+49,x+w-16,y+49)+content;}
function phoneAt(x,y,title,rows,teacher=false){return rect(x,y,178,300,'#fff',22)+rect(x+61,y+10,57,7,'#34443f',4)+label(title,x+15,y+53,17)+rows.map((r,i)=>rect(x+14,y+76+i*54,150,42,i===0?(teacher?blue:purple):'#fff',8)+label(r,x+25,y+102+i*54,15)).join('')+rect(x+15,y+272,148,12,teacher?'#8eb6cb':'#b29bcf',5);}
const cup=(x,y)=>rect(x,y,39,34,'#fff',5)+path(`M${x+39} ${y+7}q25-4 22 10t-22 8`);
function calendar(x,y,title='This week',focus=false){return screen(x,y,245,230,title,[0,1,2].map(i=>[0,1,2,3].map(j=>rect(x+18+j*54,y+70+i*45,43,34,focus&&i===1&&j===2?purple:'#fff',5)).join('')).join(''));}
function audio(x,y,w=214,speed='Natural pace'){return rect(x,y,w,152,'#fff',14)+label(speed,x+18,y+34,18)+[18,34,14,43,22,38,14,29,40,17,28].map((h,i)=>line(x+18+i*17,y+82-h/2,x+18+i*17,y+82+h/2,'#7e6995',4)).join('')+path(`M${x+22} ${y+114}l0 20 19-10Z`,'#b29bcf')+line(x+65,y+124,x+w-20,y+124);}
function document(x,y,title,rows,fill='#fff'){return screen(x,y,243,244,title,rows.map((r,i)=>label(r,x+18,y+88+i*43,16)).join(''),fill);}
const S=[];const add=(id,s)=>S.push({id,svg:s});

// Student 1: a learning plateau, followed through Maya's perspective.
add('S1-1',actor('Maya',45,223,1.05,true)+screen(203,60,222,242,'Basics again',rect(222,130,182,48,purple,8)+label('Hello / goodbye',235,160,16)+rect(222,192,182,48,'#fff',8)+label('Hello / goodbye',235,222,16)+path('M410 258q-26 54-72 26')+path('M338 284l14-9m-14 9 16 3'))+bubble(29,59,138,62,'Still stuck…'));
add('S1-2',actor('Maya',34,233,1)+phoneAt(238,59,'My French goal',['At work','Explain a choice','Answer questions'])+bubble(24,64,179,61,'Make it useful')+path('M112 365q68 1 99-80','none',6));
add('S1-3',actor('Maya',53,220,1.08)+screen(230,73,201,192,'1:1 lesson',ellipse(330,173,29,31,'#e8c8ae')+path('M288 250q6-49 42-48t40 48',blue))+bubble(34,46,162,65,'Because…')+notebook(238,301,135)+label('Why this choice?',248,395,13));
add('S1-4',actor('Maya',31,247,.9)+document(182,68,'Same kind of task',['Earlier: needed help','Now: explains why','Next: follow-ups'],purple)+bubble(34,41,125,63,'I can tell')+check(307,353)+label('A useful comparison',185,414,18));

// Student 2: listening to authentic speech, through Lucas's perspective.
add('S2-1',actor('Lucas',46,240,1.04,true)+audio(216,78)+bubble(22,67,153,64,'Too fast…')+rect(214,256,219,88,'#fff',8)+label('I know these words.',227,289,16)+label('Where do they end?',227,321,16));
add('S2-2',actor('Lucas',28,243,.96)+phoneAt(238,55,'My listening goal',['Everyday life','A real example','Audio attached'])+bubble(22,61,179,64,'Listen to this')+path('M109 370q92-12 118-83','none',6));
add('S2-3',actor('Lucas',26,256,.88)+audio(192,50,239,'First, slowly')+audio(192,230,239,'Then, naturally')+bubble(24,72,133,66,'Once more?'));
add('S2-4',actor('Lucas',46,215,1.03)+audio(205,78,227,'A different speaker')+rect(206,279,227,99,purple,10)+label('What I understood',224,310,17)+check(226,333)+line(266,340,409,340)+bubble(27,59,144,65,'I caught that'));

// Student 3: learning amid an unpredictable schedule, through Lea's perspective.
add('S3-1',actor('Léa',31,244,.99,true)+calendar(190,49,'A busy week')+path('M211 128l29 23m-29 0 29-23')+path('M319 172l29 23m-29 0 29-23')+bubble(190,331,217,63,'Not another routine'));
add('S3-2',actor('Léa',27,240,.97)+phoneAt(237,55,'What might work',['Online','Evenings','Choose later'])+bubble(26,58,173,61,'Some flexibility')+path('M109 366q70 7 109-79','none',6));
add('S3-3',actor('Léa',29,258,.89)+screen(199,65,240,273,'Choose one lesson',rect(217,137,203,55,purple,9)+label('Thursday · 18:30',235,171,19)+label('Online · 45 minutes',220,229,17)+rect(217,270,203,46,'#fff',8)+label('Confirm this lesson',235,299,16))+bubble(25,66,137,63,'This works'));
add('S3-4',actor('Léa',213,116,1.25)+table(384)+cup(365,346)+g(36,157,.73,phoneAt(0,0,'From my teacher',['Useful phrases','Try when ready']))+bubble(202,35,223,58,'When it helps me'));

// Teacher 1: adapt resources for separate individual lessons.
add('T1-1',actor('Gilbert',41,235,.99,true)+document(209,49,'One useful article',['Beginner: support','Later learner: stretch','Two separate lessons'])+bubble(28,61,145,65,'Rebuild both?'));
add('T1-2',actor('Gilbert',27,244,.95)+document(189,63,'Reusable lesson',['Warm-up conversation','Useful language','Practical task'],blue)+bubble(27,59,125,64,'A head start')+path('M112 369q69-10 88-104','none',6));
add('T1-3',actor('Gilbert',21,278,.76)+screen(171,38,268,172,'Beginner version',label('Simple words + prompts',187,121,16)+line(188,143,403,143))+screen(171,238,268,169,'More challenge',label('Explain + defend a view',188,322,16)+line(188,345,405,345))+path('M96 380q61-11 105-47','none',6));
add('T1-4',actor('Gilbert',42,226,.99)+document(200,61,'Preview for this learner',['Goal is visible','Examples fit the level','Ready for one person'],blue)+check(294,345)+bubble(24,62,137,63,'Still my plan'));

// Teacher 2: an attendance exception, without inventing commercial policies.
add('T2-1',actor('Gilbert',43,240,1,true)+screen(209,65,229,221,'Online lesson',ellipse(323,167,29,31,'#e8e8e1')+path('M285 244q7-43 38-43t37 43','#e8e8e1'))+label('Waiting for learner',231,328,18)+ellipse(91,110,45,45,'#fff')+line(91,110,91,83)+line(91,110,112,126));
add('T2-2',actor('Gilbert',30,245,.95)+phoneAt(237,63,'Session details',['Agreed time','Contact learner','Not completed'],true)+bubble(25,61,175,65,'Are you joining?')+path('M109 376q81-7 112-72','none',6));
add('T2-3',actor('Gilbert',24,253,.89)+screen(188,58,248,300,'Private conversation',rect(204,123,180,61,'#f2ecdf',8)+label('I missed the session.',217,160,15)+rect(221,205,198,63,blue,8)+label('Shall we find a time?',234,243,15)+label('Review next steps',213,323,17)));
add('T2-4',actor('Gilbert',34,245,.96)+screen(204,63,231,278,'Session status',rect(220,128,199,59,'#f2ecdf',8)+label('Original: missed',235,164,18)+rect(220,222,199,69,blue,8)+label('New time accepted',233,252,16)+label('Confirmed',255,278,16))+bubble(24,65,139,60,'Clear again'));

// Teacher 3: AI suggestions remain unshared until human review.
add('T3-1',actor('Gilbert',30,254,.93,true)+document(193,60,'AI suggestion',['Grammar exercise','Explanation + examples','Unshared draft'],blue)+bubble(26,57,130,65,'Check first'));
add('T3-2',actor('Gilbert',26,267,.85,true)+screen(172,41,268,309,'Review the draft',rect(189,109,233,64,amber,8)+label('Misleading rule',208,149,20)+rect(189,195,233,61,amber,8)+label('Vocabulary too hard',202,231,18)+label('Keep unshared',215,296,18))+path('M99 384q59-13 107-148','none',6));
add('T3-3',actor('Gilbert',28,270,.85)+screen(178,43,264,316,'Teacher edits',label('Rewrite explanation',196,124,18)+line(195,147,419,147)+label('Adjust examples',196,195,18)+line(195,219,411,219)+label('Check answer key',196,267,18)+rect(195,299,227,39,'#fff',8)+label('Or use my own material',205,324,14))+path('M99 384q67-11 103-98','none',6));
add('T3-4',actor('Gilbert',33,243,.97)+screen(201,58,238,293,'Reviewed exercise',check(226,145)+line(268,151,416,151)+check(226,201)+line(268,207,401,207)+rect(219,267,201,53,blue,9)+label('Share this version',238,299,17))+bubble(23,61,143,64,'I approve this'));

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1888" height="2832" viewBox="0 0 1888 2832">${S.map((s,i)=>`<g id="${s.id}" transform="translate(${i%4*472} ${Math.floor(i/4)*472})"><rect width="472" height="472" fill="${paper}"/>${s.svg}</g>`).join('')}</svg>`;
fs.writeFileSync(new URL('./role-scenes.svg',import.meta.url),svg);
console.log(JSON.stringify({scenes:S.length,ids:S.map(s=>s.id),bytes:Buffer.byteLength(svg)}));
