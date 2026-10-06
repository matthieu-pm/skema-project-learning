const p=await figma.getNodeByIdAsync('149:248');await figma.setCurrentPageAsync(p);
for(const f of [{family:'Nunito',style:'Black'},{family:'Nunito',style:'ExtraBold'},{family:'Nunito',style:'Regular'},{family:'Fredoka',style:'Medium'}])await figma.loadFontAsync(f);
const ids=[];const track=n=>{ids.push(n.id);return n;};
const paint=h=>({type:'SOLID',color:{r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255}});
function box(parent,name,dir='VERTICAL',gap=0,bg){const n=track(figma.createAutoLayout(dir,{name,itemSpacing:gap,fills:bg?[paint(bg)]:[]}));if(parent)parent.appendChild(n);return n;}
function text(parent,s,size,style='Regular',color='#282331'){const n=track(figma.createText());n.fontName={family:'Nunito',style};n.characters=s;n.fontSize=size;n.lineHeight={unit:'PERCENT',value:130};n.fills=[paint(color)];parent.appendChild(n);return n;}
function pet(parent,h){const n=track(figma.createRectangle());n.name='Luma / original purple pet';n.resize(h*160/180,h);n.fills=[{type:'IMAGE',imageHash:'3797d875110fe627a57fa7bc47d565bddc69f231',scaleMode:'FIT'}];parent.appendChild(n);return n;}
function word(parent,size,color,friendly=false){const n=track(figma.createText());n.fontName=friendly?{family:'Fredoka',style:'Medium'}:{family:'Nunito',style:'Black'};n.characters='mimo';n.fontSize=size;n.letterSpacing={unit:'PERCENT',value:-4};n.lineHeight={unit:'PERCENT',value:100};n.fills=[paint(color)];parent.appendChild(n);return n;}
function logo(parent,kind,k,color,dark=false){
const n=box(parent,'Luma logo / '+kind,kind===0||kind===2?'HORIZONTAL':'VERTICAL',kind===1?-10*k:kind===3?-6*k:8*k);n.counterAxisAlignItems='CENTER';
if(kind===0){pet(n,160*k);word(n,110*k,color);}
if(kind===1){pet(n,170*k);word(n,89*k,color);}
if(kind===2){const badge=box(n,'Pet medallion','HORIZONTAL',0,dark?'#49375D':'#ECE0F7');badge.resize(136*k,136*k);badge.set({cornerRadius:68*k,primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER'});pet(badge,140*k);word(n,104*k,color);}
if(kind===3){const crop=track(figma.createFrame());n.appendChild(crop);crop.name='Luma peeking / crop';crop.resize(154*k,112*k);crop.fills=[];crop.clipsContent=true;const asset=pet(crop,190*k);asset.x=(154*k-asset.width)/2;asset.y=0;word(n,110*k,color,true);}
n.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:3}}];
return n;
}
const right=Math.max(...p.children.map(n=>n.x+n.width));
const board=box(p,'Mimo · Purple Luma logo variations','VERTICAL',28,'#F5F1EB');board.x=right+160;board.y=160;board.set({paddingTop:48,paddingBottom:40,paddingLeft:48,paddingRight:48});board.placeholder=true;
const header=box(board,'Introduction','VERTICAL',10);
text(header,'MIMO / PURPLE PET DIRECTION',12,'ExtraBold','#817487');
text(header,'A familiar face for Mimo.',42,'Black');
text(header,'The original purple Luma, paired with a warm, rounded wordmark.',18,'Regular','#786C80');
const names=['01 / Side by side','02 / Luma above','03 / Companion badge','04 / A little hello'];
const desc=['A full-body pet beside the wordmark.','A centered signature for covers and welcome screens.','A circular home for Luma, paired with the name.','Luma peeks over a softer, playful wordmark.'];
const cardIds=[],logoIds=[];
for(let row=0;row<2;row++){
const line=box(board,'Logo layouts / row '+row,'HORIZONTAL',24);
for(let j=0;j<2;j++){
const i=row*2+j;const card=box(line,names[i],'VERTICAL',20,'#FFFFFF');card.set({paddingTop:26,paddingBottom:26,paddingLeft:28,paddingRight:28,cornerRadius:22});cardIds.push(card.id);
const heading=box(card,'Direction','VERTICAL',5);text(heading,names[i],20,'ExtraBold');text(heading,desc[i],14,'Regular','#7D7385');
const main=box(card,'Primary logo','HORIZONTAL',0,i===3?'#F8F0E8':'#F6F0FB');main.resize(620,290);main.set({primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER',cornerRadius:14});logoIds.push(logo(main,i,1,i===1?'#342443':'#8148CD').id);
const samples=box(card,'Background variations','HORIZONTAL',12);
for(const dark of [false,true]){const sample=box(samples,dark?'Dark background':'Light background','HORIZONTAL',0,dark?'#2D213B':'#F5F4F6');sample.resize(304,126);sample.set({primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER',cornerRadius:10});logo(sample,i,i===1?.42:i===3?.46:.49,dark?'#FFFFFF':'#342443',dark);}
}
}
const footer=box(board,'Artwork note','HORIZONTAL',12);
text(footer,'ORIGINAL LUMA ARTWORK',11,'ExtraBold','#817487');text(footer,'Editable wordmarks and layout · pet retained as the original image',13,'Regular','#786C80');
board.placeholder=false;figma.currentPage.selection=[board];figma.viewport.scrollAndZoomIntoView([board]);
return {createdNodeIds:ids,boardId:board.id,pageId:p.id,cardIds,primaryLogoIds:logoIds,sourceImageHash:'3797d875110fe627a57fa7bc47d565bddc69f231',bounds:{width:board.width,height:board.height}};
