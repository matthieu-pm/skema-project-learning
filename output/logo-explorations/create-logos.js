const fonts=[{family:'Nunito',style:'Black'},{family:'Nunito',style:'ExtraBold'},{family:'Nunito',style:'Regular'},{family:'Fredoka',style:'Medium'},{family:'Nunito',style:'Bold'}];
for(const f of fonts) await figma.loadFontAsync(f);
const page=figma.createPage();page.name='08 · Logo explorations';await figma.setCurrentPageAsync(page);
const ids=[page.id]; const remember=n=>{ids.push(n.id);return n};
const paint=h=>({type:'SOLID',color:{r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255}});
function auto(parent,name,dir,gap,fill){const n=remember(figma.createAutoLayout(dir,{name,itemSpacing:gap,fills:fill?[paint(fill)]:[]}));if(parent)parent.appendChild(n);return n;}
function txt(parent,s,size=16,style='Regular',color='#242331',width){const n=remember(figma.createText());n.fontName={family:'Nunito',style};n.characters=s;n.fontSize=size;n.lineHeight={unit:'PERCENT',value:135};n.fills=[paint(color)];parent.appendChild(n);if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);}return n;}
function svg(parent,name,body,size=80){const n=figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 100 100">'+body+'</svg>');n.name=name;parent.appendChild(n);ids.push(n.id,...n.findAll().map(x=>x.id));return n;}
function mark(parent,i,size,a,b,reverse=false){
let body='';
if(i===0)body='<path d="M26 12H74Q92 12 92 30V60Q92 78 74 78H48L26 94V78Q8 78 8 60V30Q8 12 26 12Z" fill="'+a+'"/><path d="M29 59V41Q29 30 40 30Q50 30 50 41V57M50 41Q50 30 61 30Q72 30 72 41V59" fill="none" stroke="'+(reverse?'#242331':'#FFFFFF')+'" stroke-width="9" stroke-linecap="round"/>';
if(i===1)body='<path d="M14 80V52C14 25 50 25 50 52V80" fill="none" stroke="'+a+'" stroke-width="17" stroke-linecap="round"/><path d="M50 80V52C50 25 86 25 86 52V80" fill="none" stroke="'+b+'" stroke-width="17" stroke-linecap="round"/><circle cx="32" cy="13" r="8.5" fill="'+a+'"/><circle cx="68" cy="13" r="8.5" fill="'+b+'"/>';
if(i===2)body='<path d="M7 73C7 55 16 48 23 30C28 15 35 8 44 10C51 11 52 20 58 23C64 27 71 23 78 32C89 45 96 63 92 78C88 91 76 91 67 80C60 72 61 68 50 68C40 68 40 80 31 86C20 94 7 87 7 73Z" fill="'+a+'"/><ellipse cx="43" cy="41" rx="4.5" ry="6" fill="'+(reverse?'#242331':'#FFFFFF')+'"/><ellipse cx="60" cy="41" rx="4.5" ry="6" fill="'+(reverse?'#242331':'#FFFFFF')+'"/>';
if(i===3)body='<path d="M12 74V45Q12 26 31 26Q50 26 50 45V74M50 45Q50 26 69 26Q88 26 88 45V66Q88 77 76 80L65 89V75" fill="none" stroke="'+a+'" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>';
if(i===4)body='<path d="M11 22Q33 18 46 32V84Q31 70 11 73Z" fill="'+a+'"/><path d="M54 32Q67 18 89 22V73Q69 70 54 84Z" fill="'+b+'"/><path d="M25 38Q34 39 36 42M25 51Q32 52 36 55M66 42Q71 38 77 38M66 55Q71 51 77 51" fill="none" stroke="'+(reverse?'#242331':'#FFFFFF')+'" stroke-width="4.5" stroke-linecap="round"/>';
if(i===5)body='<path d="M9 31Q9 10 30 10H43Q62 10 62 29V39Q62 58 43 58H31L15 71V55Q9 49 9 40Z" fill="'+a+'"/><path d="M62 38H73Q93 38 93 58V67Q93 85 75 85V98L60 85H53Q36 85 36 68V66H45Q67 65 67 42Z" fill="'+b+'"/>';
return svg(parent,'Symbol / '+(i+1),body,size);
}
function word(parent,i,color,size){const n=remember(figma.createText());n.fontName=i===2||i===5?{family:'Fredoka',style:'Medium'}:{family:'Nunito',style:i===4?'Bold':i===1?'ExtraBold':'Black'};n.characters=i===4?'Mimo':'mimo';n.fontSize=size;n.letterSpacing={unit:'PERCENT',value:-4};n.lineHeight={unit:'PERCENT',value:100};n.fills=[paint(color)];parent.appendChild(n);return n;}
function lockup(parent,i,size,a,b,reverse=false){const n=auto(parent,'Logo / '+(i+1),'HORIZONTAL',size*.16);n.counterAxisAlignItems='CENTER';mark(n,i,size,a,b,reverse);word(n,i,a,size*.92);n.exportSettings=[{format:'SVG'}];return n;}
const board=auto(page,'Mimo · Six logo directions','VERTICAL',32,'#F4F1EB');board.x=160;board.y=160;board.set({paddingTop:56,paddingBottom:40,paddingLeft:56,paddingRight:56});board.placeholder=true;
const head=auto(board,'Introduction','VERTICAL',12);
txt(head,'MIMO  /  IDENTITY EXPLORATIONS  /  06 OCT 2026',12,'ExtraBold','#756E83');
txt(head,'Good conversations start here.',44,'Black','#242331');
txt(head,'Six directions for a language brand built around two people. Choose a shape, then refine it.',18,'Regular','#696474');
const concepts=[
{title:'01  /  Say hello',desc:'A conversation bubble with a soft m at its heart.',a:'#8148CD',b:'#8148CD',bg:'#F0E7FC',tag:'Conversation first'},
{title:'02  /  One to one',desc:'Two people meet to form one unmistakable m.',a:'#8148CD',b:'#2498CD',bg:'#ECECFB',tag:'Human connection'},
{title:'03  /  Little companion',desc:'A friendly silhouette, inspired by Mimo’s pets.',a:'#8148CD',b:'#8148CD',bg:'#EEE5FA',tag:'Warm and playful'},
{title:'04  /  Open dialogue',desc:'An open, flowing m with a conversational finish.',a:'#2A7CA3',b:'#2A7CA3',bg:'#E3F1F6',tag:'Simple and expressive'},
{title:'05  /  Shared chapter',desc:'Two pages, two perspectives, one useful lesson.',a:'#277564',b:'#60A38A',bg:'#E5EFE5',tag:'Calm and thoughtful'},
{title:'06  /  Back and forth',desc:'Paired speech marks make room for both voices.',a:'#8148CD',b:'#2498CD',bg:'#F7EDE0',tag:'An exchange of ideas'}
];
const cards=[];const primaries=[];
for(let row=0;row<2;row++){
 const r=auto(board,'Directions '+(row*3+1)+'–'+(row*3+3),'HORIZONTAL',24);
 for(let j=0;j<3;j++){
 const i=row*3+j,c=concepts[i];
 const card=auto(r,c.title,'VERTICAL',24,'#FFFFFF');card.resize(560,514);card.set({paddingLeft:28,paddingRight:28,paddingTop:26,paddingBottom:26,cornerRadius:22});card.primaryAxisSizingMode='AUTO';card.counterAxisSizingMode='FIXED';cards.push(card);
 const labels=auto(card,'Direction','VERTICAL',7);
 txt(labels,c.title,20,'ExtraBold');txt(labels,c.desc,14,'Regular','#777180',504);
 const stage=auto(card,'Primary color logo','HORIZONTAL',0,c.bg);stage.resize(504,212);stage.set({cornerRadius:14,primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER'});
 const logo=lockup(stage,i,98,c.a,c.b);primaries.push(logo.id);
 const previews=auto(card,'Monochrome and reverse','HORIZONTAL',12);
 const mono=auto(previews,'One color','HORIZONTAL',0,'#F5F4F6');mono.resize(246,90);mono.set({cornerRadius:10,primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER'});lockup(mono,i,43,'#242331','#242331');
 const rev=auto(previews,'Reversed','HORIZONTAL',0,'#242331');rev.resize(246,90);rev.set({cornerRadius:10,primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER'});lockup(rev,i,43,'#FFFFFF','#FFFFFF',true);
 const foot=auto(card,'Application samples','HORIZONTAL',16);foot.counterAxisAlignItems='CENTER';
 const icon=auto(foot,'App icon preview','HORIZONTAL',0,c.a);icon.resize(56,56);icon.set({cornerRadius:14,primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER'});mark(icon,i,36,'#FFFFFF','#FFFFFF',true);icon.exportSettings=[{format:'SVG'}];
 const caption=auto(foot,'Positioning','VERTICAL',2);txt(caption,c.tag,13,'ExtraBold');txt(caption,'APP ICON  ·  24 PX SYMBOL',10,'ExtraBold','#89828F');
 mark(foot,i,24,c.a,c.b);
 }
}
const end=auto(board,'Review note','HORIZONTAL',16);
txt(end,'EXPLORATION, NOT A SELECTED IDENTITY',11,'ExtraBold','#756E83');
txt(end,'Editable vector symbols + editable wordmarks. Color, one-color, reverse and small-size studies.',13,'Regular','#696474');
board.placeholder=false;figma.currentPage.selection=[board];figma.viewport.scrollAndZoomIntoView([board]);
return {createdNodeIds:ids,pageId:page.id,boardId:board.id,primaryLogoIds:primaries,cards:cards.map(n=>({id:n.id,name:n.name,width:n.width,height:n.height})),board:{width:board.width,height:board.height},textCount:board.query('TEXT').length};
