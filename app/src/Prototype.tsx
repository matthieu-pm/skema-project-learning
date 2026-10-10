import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState, type ReactNode, type InputHTMLAttributes } from 'react';
import { ArrowLeftIcon, CheckIcon, UploadIcon } from '@radix-ui/react-icons';
import { createPortal } from 'react-dom';
const TeacherWorkspace = lazy(() => import('./teacher/TeacherWorkspace'));
import { FlowStack, MobileScroll, KeyboardInput, KeyboardTextarea, useFlow, useKeyboard, useKeyboardInsets, type FlowScreen } from './mobile';
import { initialAnswers, changeAccountMethod, sampleGoogleAccount, languageChoices, toggleLearningLanguage, needsGuardian, changeAge, clearedIdentity, verificationExit, levelChoices, formatDateOfBirth, dateOfBirthValid, nextStep, routeFor, stepIds, validStep, type Answers, type Step } from './onboarding';

const asset = (name: string) => `/assets/onboarding/${name}.png`;
const languages = languageChoices;
const flags = ['spanish','french','german','italian','english','japanese'];
const centered = new Set<Step>(['greeting','setup-intro','encouragement','teacher-intro']);
const endings = new Set<Step>(['learner-ready','verification-ready','teacher-draft']);
type Media = { name:string; url:string; type:string } | null;
type SetupContext = {
  answers:Answers; update:(patch:Partial<Answers>)=>void; resource:Media; setResource:(media:Media)=>void;
  photo:Media; setPhoto:(media:Media)=>void; error:string; setError:(s:string)=>void;
  resendAt:number; setResendAt:(n:number)=>void; reset:()=>void; openWorkspace:()=>void;
};
const Setup = createContext<SetupContext>(null!);
const useSetup = () => useContext(Setup);
function Mascot({className = ''}: {className?:string}) {
  const teacher=useSetup().answers.role==='teacher';
  return <img className={`mascot ${className}`} src={asset(teacher?'nori':'luma')} alt={teacher?'Nori, your fuzzy blue teaching companion':'Luma, your fuzzy purple learning companion'} draggable={false}/>;
}
function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20.4 20.4 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.5a12.3 12.3 0 0 1 0-7.8v-5.3H5.8a20.4 20.4 0 0 0 0 18.4l6.8-5.3Z"/><path fill="#EA4335" d="M24 11.3c3 0 5.6 1 7.7 3l5.8-5.8A19.6 19.6 0 0 0 24 3.2 20.4 20.4 0 0 0 5.8 14.4l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"/></svg>;
}
function Bubble({children}: {children:ReactNode}) { return <div className="speech">{children}</div>; }
function Choice({label,description,icon,selected,onClick,check=false}: {label:string;description?:string;icon?:string;selected:boolean;onClick:()=>void;check?:boolean}) {
  return <button className={`choice ${selected?'selected':''} ${description?'detailed':''}`} onClick={onClick} aria-pressed={selected}>
    {icon && <img className="choice-icon" src={asset(icon)} alt=""/>}
    <span className="choice-copy"><strong>{label}</strong>{description && <span>{description}</span>}</span>
    {check && <span className="checkbox" aria-hidden="true">{selected && <CheckIcon/>}</span>}
  </button>;
}
function Note({children}: {children:ReactNode}) { return <p className="setup-note">{children}</p>; }
function Field({label,multiline=false,...props}: InputHTMLAttributes<HTMLInputElement> & {label:string;multiline?:boolean}) {
  const keyboard=useKeyboard();
  return <label className="setup-field"><span>{label}</span>{multiline ?
    <KeyboardTextarea aria-label={label} placeholder={props.placeholder} value={props.value} maxLength={props.maxLength} onChange={e=>props.onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>)} onBlur={()=>keyboard.hide()} rows={4}/> :
    <KeyboardInput {...props} aria-label={label} onBlur={()=>keyboard.hide()}/>}
  </label>;
}
function Upload({kind}: {kind:'resource'|'photo'}) {
  const setup=useSetup(), keyboard=useKeyboard(), fileRef=useRef<HTMLInputElement>(null);
  const media=kind==='photo'?setup.photo:setup.resource;
  const setMedia=kind==='photo'?setup.setPhoto:setup.setResource;
  return <div className="upload-section">
    <input ref={fileRef} className="file-input" type="file" aria-label={kind==='photo'?'Choose a profile photo or video':'Choose a file or voice note'} accept={kind==='photo'?'image/*,video/*':'.pdf,.txt,.doc,.docx,image/*,audio/*'} onChange={e=>{
      const f=e.target.files?.[0]; if(!f)return;
      if(f.size>20*1024*1024){setup.setError('Choose a file smaller than 20 MB.');return;}
      setup.setError('');setMedia({name:f.name,url:URL.createObjectURL(f),type:f.type});e.target.value='';
    }}/>
    {media?.type.startsWith('image/') && <img className="upload-preview" src={media.url} alt={kind==='photo'?'Your profile photo':'Attached image'}/>}
    {media?.type.startsWith('video/') && <video className="upload-preview" src={media.url} controls/>}
    {media?.type.startsWith('audio/') && <audio className="audio-preview" src={media.url} controls/>}
    <button className="upload-target" onClick={()=>{keyboard.hide();fileRef.current?.click();}}><UploadIcon/><strong>{media?'Choose a different file':kind==='photo'?'Add a photo or short video':'Add a file or voice note'}</strong><span>{media?.name || 'Choose a file from your device'}</span></button>
    {media && <button className="text-button" onClick={()=>setMedia(null)}>Remove file</button>}
    <Note>{kind==='photo'?'Give learners a friendly first impression.':'A document, photo, or recorded voice note can help explain your goal.'} Files stay in this local preview. Up to 20 MB.</Note>
  </div>;
}
const headings: Partial<Record<Step,string>> = {
  account:'Create your account','google-connect':'Try Google sign-in',role:'What brings you here?', email:'First, a place to keep your progress.',age:'Which age range are you in?',guardian:'Let’s bring your parent or guardian in.',verify:'You’ve got mail.',
  language:'Which languages would you like to learn?',level:'Let’s find a comfortable starting point.',topic:'Make it about your life.',
  'personal-goal':'What’s one thing you’d love to do?','resource':'Want to share a little more?',
  format:'How do you like to meet?',city:'Where would you like to meet?',days:'Which days usually work for you?',time:'What time suits you best?',
  notifications:'Would you like to allow notifications?',widget:'I’ll cheer you on from your home screen!',benefits:'A real connection. Progress at your pace.',
  name:'What should your learners call you?',photo:'Let learners put a face to your name.','teaching-languages':'Which languages do you teach?','teaching-levels':'Which levels do you teach?',approach:'Your teaching. Your own style.',duration:'How long is a lesson?',rate:'What’s your price per lesson?',
  'persona-link':'Your Persona ID. A quicker hello.','teacher-review':'Here’s your teaching profile.','identity-intro':'A little trust goes a long way.','legal-name':'What’s your full legal name?','date-of-birth':'When were you born?',country:'Which country issued your ID?','document-type':'Which document would you use?',document:'Next, add your identity document.',selfie:'One last check: confirm it’s you.',
  'guardian-handoff':'It’s your parent or guardian’s turn.',
  'learner-ready':'Your learning setup is ready!','verification-ready':'Your profile is ready for the next step.','teacher-draft':'Your teaching profile is a draft.',
};
function Header({step}: {step:Step}) {
  const flow=useFlow(),{answers,setError}=useSetup(); const route=routeFor(answers);
  const percent=endings.has(step)?100:Math.max(5,Math.round((route.indexOf(step)-1)/(route.length-2)*100));
  return <nav className="onboarding-nav" aria-label="Onboarding"><button className="back" aria-label="Go back" onClick={()=>{setError('');flow.pop();}}><ArrowLeftIcon/></button>
    {!centered.has(step) && <div className="progress" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{width:`${percent}%`}}/></div>}
  </nav>;
}
function Footer({step}: {step:Step}) {
  const flow=useFlow(),keyboard=useKeyboard(),{answers:a,update,setError,setResendAt,setResource,setPhoto,reset,openWorkspace}=useSetup();
  const advance=(patch:Partial<Answers>={})=>{ keyboard.hide();setError('');const next=nextStep(step,{...a,...patch});update(patch);if(next)flow.push(screens[next]); };
  const submit=()=>{
    if(!validStep(step,a))return;
    if(endings.has(step)){if(a.role==='teacher')openWorkspace();else reset();return;}
    if(step==='verify' && a.code!=='481629'){setError('That code doesn’t match. Use 481629 in this preview.');keyboard.hide();return;}
    if(step==='age'||(step==='email'&&a.role==='teacher'))setResendAt(Date.now()+30000);
    advance(step==='google-connect'?sampleGoogleAccount:step==='verify'?{verified:true}:step==='guardian'?{guardianReady:true}:step==='notifications'?{notifications:true}:step==='widget'?{widget:true}:(step==='selfie'||step==='persona-link')?{identityPreviewComplete:true}:step==='identity-intro'?{identityMethod:'document',identityPreviewComplete:false}:{});
  };
  const optional:Partial<Record<Step,string>>={resource:'Skip for now',photo:'Skip for now',format:'I’ll choose later',city:'I’ll choose later',days:'I’ll choose later',time:'I’ll choose later',notifications:'Not now',widget:'Not now','identity-intro':'Finish this later','persona-link':'Use a document instead'};
  const label:Partial<Record<Step,string>>={welcome:'Get started','google-connect':'Continue with sample account',email:'Continue',guardian:'Continue','guardian-handoff':'I’m the parent or guardian',verify:'Verify & continue',notifications:'Allow notifications',widget:'Add widget','teacher-review':'Continue to verification','identity-intro':'Start verification preview','persona-link':'Link sample Persona ID',document:'Continue',selfie:'Finish verification preview','learner-ready':'Finish setup','verification-ready':'Finish setup','teacher-draft':'Back to welcome'};
  const endLabel=endings.has(step)?a.role==='teacher'?'Open teaching workspace':'Replay onboarding':undefined;
  const mainDisabled=!validStep(step,a) || (['format','city','days','time'].includes(step) && !({format:a.format,city:a.city.trim(),days:a.days.length,time:a.time} as Record<string,unknown>)[step]);
  if(step==='account')return <div className="actions two-actions account-actions">
    <button className="primary" onClick={()=>advance(changeAccountMethod(a,'email'))}>Continue with email</button>
    <span className="account-divider" aria-hidden="true">or</span>
    <button className="secondary google-button" onClick={()=>advance(changeAccountMethod(a,'google'))}><GoogleMark/>Continue with Google</button>
  </div>;
  return <div className={`actions ${optional[step]||step==='welcome'?'two-actions':''}`}>
    <button className="primary" disabled={mainDisabled} onClick={submit}>{endLabel || label[step] || 'Continue'}</button>
    {optional[step] && <button className="text-button" onClick={()=>{
      if(step==='persona-link'){keyboard.hide();setError('');update({identityMethod:'document',identityPreviewComplete:false});flow.replace(screens['legal-name']);return;}
      if(step==='identity-intro'){keyboard.hide();update({identityPreviewComplete:false});setError('');flow.push(screens[verificationExit(a)]);return;}
      if(step==='resource')setResource(null);
      if(step==='photo')setPhoto(null);
      const clears:Partial<Record<Step,Partial<Answers>>>={format:{format:'',city:''},city:{city:''},days:{days:[]},time:{time:''},notifications:{notifications:false},widget:{widget:false}};
      advance(clears[step]);
    }}>{optional[step]}</button>}
    {step==='welcome' && <button className="secondary" onClick={()=>flow.push(screens.role)}>I already have an account</button>}
  </div>;
}
function Screen({step}: {step:Step}) {
  const setup=useSetup(),{answers:a,update,error,setError,resendAt,setResendAt}=setup;
  const flow=useFlow(), keyboard=useKeyboard(),{isKeyboardVisible}=useKeyboardInsets();
  const active=flow.current.id===step;
  const guardian=needsGuardian(a);
  const isLevel=step==='level'||step.startsWith('level-');
  const levelLanguage=step.startsWith('level-')?step.slice(6):a.learningLanguages[0];
  const heading=isLevel?`How much ${levelLanguage} do you know?`:step==='identity-intro'&&guardian?'Let’s verify you, the parent or guardian.':headings[step];
  const [search,setSearch]=useState(''),[now,setNow]=useState(Date.now());
  useEffect(()=>{if(step!=='verify'||!active)return;const id=window.setInterval(()=>setNow(Date.now()),1000);return ()=>window.clearInterval(id);},[step,active]);
  const chooseRole=(role:Answers['role'])=>{if(a.role===role)return;setup.setResource(null);setup.setPhoto(null);setError('');update({...initialAnswers,role,email:a.accountMethod==='google'?'':a.email,age:a.age});};
  const toggle=(field:'days'|'teachingLanguages'|'teachingLevels',value:string)=>update({[field]:a[field].includes(value)?a[field].filter(v=>v!==value):[...a[field],value]});
  const single=(values:string[],field:keyof Answers,descriptions?:string[]) => <div className="options">{values.map((value,i)=><Choice key={value} label={value} description={descriptions?.[i]} selected={a[field]===value} onClick={()=>update(field==='age'?changeAge(a,value):{[field]:value,...(field==='format'&&value==='Online'?{city:''}:{})})}/>)}</div>;
  const mediaHeading=step==='photo'||step==='resource';
  return <MobileScroll className={`learning-scroll setup-scroll ${isKeyboardVisible?'keyboard-open':''}`}>
    <main inert={!active} aria-hidden={!active} className={`onboarding-content setup-content ${step==='welcome'?'setup-welcome':''}`} data-step={isLevel?'level':step} aria-label={heading||step}>
      {step==='welcome'?<div className="welcome"><Mascot/><h1>mimo</h1><p>A language. A real connection.</p></div>:
      step==='account'?<div className="account-intro"><Mascot/><h1>Create your account</h1><p>A language. A real connection.<br/>Choose how you’d like to get started.</p><p className="preview-note">Preview only. No account will be created.</p></div>:
      centered.has(step)?<div className="intro-scene"><Bubble>{step==='greeting'?`Hi there! I’m ${a.role==='teacher'?'Nori':'Luma'}!`:step==='setup-intro'?a.role==='teacher'?<>Let’s help learners<br/>get to know <b>you.</b></>:<>A few small steps to find<br/><b>your kind of teacher.</b></>:step==='teacher-intro'?<>Your language.<br/>Your way of teaching.</>:<>A goal that’s yours.<br/>A teacher to help you get there.</>}</Bubble><Mascot/></div>:
      <div className="guide"><Mascot/><Bubble>{heading}</Bubble></div>}
      {step==='role' && <div className="options role-options"><Choice label="I want to learn" description="Find a teacher. Make it personal." icon="conversation" selected={a.role==='learner'} onClick={()=>chooseRole('learner')}/><Choice label="I want to teach" description="Share your language, your way." icon="book" selected={a.role==='teacher'} onClick={()=>chooseRole('teacher')}/></div>}
      {step==='google-connect' && <><div className="google-preview"><GoogleMark/><h2>A sample account for this preview</h2><p>Try the next steps without signing in to Google.</p><div className="sample-account"><span aria-hidden="true">A</span><div><strong>Alex · Sample account</strong><span>{sampleGoogleAccount.email}</span></div></div></div><p className="preview-note">No Google account is connected and no data is shared. Go back to use email instead.</p></>}
      {step==='email' && <><Field label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={a.email} onChange={e=>update({email:e.target.value,code:'',verified:false})}/><Note>No password to remember. Just a sign-in code.</Note><p className="preview-note">Local preview: no email is sent and no account is created.</p></>}
      {step==='age' && <>{single(['18 or older','Under 18'],'age')}<Note>{a.age==='Under 18'?'We’ll include a parent or guardian before you continue.':'This helps us guide you to the right setup.'}</Note></>}
      {step==='guardian' && <><Field label="Parent or guardian’s email" type="email" placeholder="guardian@example.com" value={a.guardianEmail} onChange={e=>update({guardianEmail:e.target.value,guardianReady:false,...clearedIdentity})}/><Note>{a.accountMethod==='google'?'Next, we’ll ask your parent or guardian to try the identity check.':'Your parent or guardian will have their own identity check right after the email code step.'}</Note><p className="preview-note">This previews the handoff only. No message is sent or consent recorded.</p></>}
      {step==='verify' && <><p className="step-description">A code would be sent to <b>{a.email}</b>.</p><Field label="6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={a.code} onChange={e=>{setError('');update({code:e.target.value.replace(/\D/g,'').slice(0,6)});}}/><Note>For this preview, use <b>481629</b>.</Note><button className="inline-link" onClick={()=>{keyboard.hide();update({code:'',verified:false});setError('');flow.push(screens.email);}}>Change email address</button><button className="inline-link" disabled={now<resendAt} onClick={()=>{update({code:''});setError('');setResendAt(Date.now()+30000);setNow(Date.now());}}> {now<resendAt?`Resend code in ${Math.ceil((resendAt-now)/1000)}s`:'Resend preview code'}</button></>}
      {(step==='language'||step==='teaching-languages') && <>{step==='teaching-languages'?<Field label="Search languages" type="search" placeholder="Search by name" value={search} onChange={e=>setSearch(e.target.value)}/>:<p className="step-description">Choose one or more.</p>}<div className="options languages">{languages.filter(l=>step==='language'||l.toLowerCase().includes(search.toLowerCase())).map(language=><Choice key={language} label={language} icon={flags[languages.indexOf(language)]} check selected={step==='language'?a.learningLanguages.includes(language):a.teachingLanguages.includes(language)} onClick={()=>{keyboard.hide();step==='language'?update(toggleLearningLanguage(a,language)):toggle('teachingLanguages',language);}}/>)}</div>{step==='language'?<div className="languages-coming-soon"><div className="coming-soon-pet"><img className="mascot" src={asset('luma-coming-soon')} alt="Luma looking ahead to new languages" draggable={false}/></div><div><strong>More languages</strong><span>Coming soon!</span></div></div>:!languages.some(l=>l.toLowerCase().includes(search.toLowerCase()))&&<Note>No matching language. Try another name.</Note>}</>}
      {isLevel && <div className="options level-options">{levelChoices.map(([level,description])=><Choice key={level} label={level} description={description} selected={a.learningLevels[levelLanguage]===level} onClick={()=>update({learningLevels:{...a.learningLevels,[levelLanguage]:level}})}/>)}<Choice label="I’m not sure yet" description="My teacher can help me find out." icon="conversation" selected={a.learningLevels[levelLanguage]==='Not sure'} onClick={()=>update({learningLevels:{...a.learningLevels,[levelLanguage]:'Not sure'}})}/></div>}
      {step==='topic' && <div className="options topic-options">{[['Everyday life','Cafés, travel, and new conversations.','conversation'],['At work','Meetings, interviews, and ideas.','career'],['For my studies','Classes, exams, and presentations.','education']].map(([label,description,icon])=><Choice key={label} label={label} description={description} icon={icon} selected={a.topic===label} onClick={()=>update({topic:label})}/>)}</div>}
      {step==='personal-goal' && <><Field label="One thing I’d love to do" multiline maxLength={300} placeholder={`Order a meal confidently in ${a.learningLanguages[0] || 'French'}.`} value={a.personalGoal} onChange={e=>update({personalGoal:e.target.value})}/><Note>Your goal can be small and specific. You can change it later.</Note></>}
      {mediaHeading && <Upload kind={step==='photo'?'photo':'resource'}/>}
      {step==='format' && single(['In person','Online','Either'],'format')}
      {step==='city' && <><Field label="City or neighbourhood" placeholder="Paris, France" value={a.city} onChange={e=>update({city:e.target.value})}/><Note>No location permission needed. Just choose somewhere that works for you.</Note></>}
      {step==='days' && <><div className="options">{['Weekdays','Weekends'].map(day=><Choice key={day} label={day} check selected={a.days.includes(day)} onClick={()=>toggle('days',day)}/>)}</div><Note>Choose one or both. You’ll book an exact day later.</Note></>}
      {step==='time' && <>{single(['Morning','Afternoon','Evening'],'time')}<Note>These are preferences. You’ll choose an exact time when you book.</Note></>}
      {step==='notifications' && <><div className="notification-example" aria-hidden="true"><div className="permission-preview"><b>“Mimo” Would Like to<br/>Send You Notifications</b><p>Messages, lesson updates, and more.</p><div><span>Don’t Allow</span><span>Allow</span></div></div></div><p className="preview-note">Notification preference only. No notifications are sent in this preview.</p></>}
      {step==='widget' && <><div className="widget-illustration"><img className="widget-phone" src={asset('widget-phone')} alt="Mimo home screen widget preview"/><div className="mimo-widget"><span>You’ve got this!</span><Mascot/></div></div><p className="preview-note">A preview of your widget. Your home screen stays unchanged.</p></>}
      {step==='benefits' && <div className="benefits">{[['conversation','Conversations that matter','Learn with a teacher who gets you.'],['vocabulary','Your real-life goals','Build lessons around what you want to do.'],['habit','Lessons that fit your life','Choose a format and time that work for you.']].map(([icon,title,description])=><div className="benefit" key={icon}><img src={asset(icon)} alt=""/><div><strong>{title}</strong><p>{description}</p></div></div>)}</div>}
      {step==='name' && <Field label="Display name" autoComplete="given-name" placeholder="Maya" maxLength={60} value={a.name} onChange={e=>update({name:e.target.value})}/>}
      {step==='teaching-levels' && <><p className="step-description">Choose all the levels you’re comfortable teaching.</p><div className="options teaching-level-options">{levelChoices.map(([level],i)=><Choice key={level} label={level} description={['Beginner','Elementary','Intermediate','Upper intermediate','Advanced','Proficient'][i]} check selected={a.teachingLevels.includes(level)} onClick={()=>toggle('teachingLevels',level)}/>)}</div></>}
      {step==='approach' && <><Field label="Your approach, in a sentence" multiline maxLength={300} placeholder="Practical conversation, at your pace." value={a.approach} onChange={e=>update({approach:e.target.value})}/><Note>Help learners picture what a lesson with you feels like.</Note></>}
      {step==='duration' && single(['30 minutes','45 minutes','60 minutes'],'duration')}
      {step==='rate' && <><Field label={`Price in euros / ${a.duration}`} type="number" inputMode="decimal" min="1" max="1000" step="0.5" placeholder="30" value={a.rate} onChange={e=>update({rate:e.target.value})}/><Note>This stays editable in your teaching profile.</Note></>}
      {step==='teacher-review' && <div className="setup-summary">{setup.photo?.type.startsWith('image/')&&<img className="summary-photo" src={setup.photo.url} alt="Your profile"/>}<h2>{a.name}</h2><p>{a.teachingLanguages.join(', ')} · {a.teachingLevels.join(', ')}</p><blockquote>{a.approach}</blockquote><p>{a.format||'Format to decide'}{a.city?` · ${a.city}`:''}</p><strong>€{a.rate} / {a.duration}</strong><Note>Your profile remains a draft until you’re ready.</Note></div>}
      {step==='guardian-handoff' && <><div className="info-card"><strong>Hand over to your parent or guardian</strong><p>The next steps are for the adult helping you set up your account.</p><p>{a.guardianEmail}</p></div><Note>Parent or guardian: continue with your own details and ID, rather than the learner’s.</Note><p className="preview-note">Local handoff preview only. No invitation is sent or consent recorded.</p></>}
      {step==='identity-intro' && <><div className="options"><div className="info-card"><strong>{a.role==='teacher'?'Verify before accepting bookings':guardian?'A check for the adult supporting the learner':'Let’s build a little trust'}</strong><p>{guardian?'Use your own ID and selfie for this check. We won’t ask for the child’s ID.':'Your identity document won’t appear on your public profile.'}</p></div><div className="info-card"><strong>{a.role==='teacher'?'Identity, not qualifications':'Your ID, then a selfie'}</strong><p>{a.role==='teacher'?'This check confirms who you are, not your teaching qualifications.':'First, add your identity details. Then use a document and a selfie to confirm it’s you.'}</p></div></div><button className="choice persona-option" onClick={()=>{keyboard.hide();setError('');update({identityMethod:'persona',identityPreviewComplete:false});flow.push(screens['persona-link']);}}><img src={asset('persona')} alt=""/><span className="choice-copy"><strong>Link Persona ID</strong><span>Already have one? Verify instantly.</span></span><span className="persona-arrow" aria-hidden="true">→</span></button><p className="preview-note">Preview only. No ID, selfie, or Persona account is connected.</p></>}
      {step==='persona-link' && <><div className="persona-link-card"><img src={asset('persona')} alt="Persona"/><h2>Link your Persona ID</h2><p>{guardian?'Parent or guardian: use your own Persona ID to confirm your identity.':'Use your existing Persona ID to confirm your identity without repeating the document steps.'}</p></div><Note>This previews an instant verification. Continue with a sample ID to try it.</Note><p className="preview-note">No sign-in, personal details, or account access is requested. No real verification takes place.</p></>}
      {step==='legal-name' && <><Field label="Full legal name" placeholder="Maya Laurent" value={a.legalName} onChange={e=>update({legalName:e.target.value})}/><Note>{guardian?'Parent or guardian: use your own legal name. Use example details in this preview.':'Use example details while trying the preview.'}</Note></>}
      {step==='date-of-birth' && <><Field label="Date of birth" inputMode="numeric" autoComplete="off" placeholder="DD/MM/YYYY" maxLength={10} value={a.dateOfBirth} aria-describedby="birth-date-help" aria-invalid={a.dateOfBirth.length===10&&!dateOfBirthValid(a.dateOfBirth)} onChange={e=>update({dateOfBirth:formatDateOfBirth(e.target.value)})}/><p id="birth-date-help" className="step-description">Day / month / year, as shown on your ID.</p>{a.dateOfBirth.length===10&&!dateOfBirthValid(a.dateOfBirth)&&<p role="alert" className="field-error">Enter a real date that isn’t in the future.</p>}<Note>{guardian?'Enter the parent or guardian’s date of birth.':'Your date of birth helps confirm your identity.'} It won’t appear on a public profile.</Note><p className="preview-note">Use an example date in this preview. Nothing is sent for verification.</p></>}
      {step==='country' && <Field label="Document issuing country" placeholder="France" value={a.country} onChange={e=>update({country:e.target.value})}/>}
      {step==='document-type' && single(['Passport','National identity card','Driving licence'],'documentType')}
      {step==='document' && <><button className={`choice sample-action ${a.documentReady?'selected':''}`} aria-pressed={a.documentReady} onClick={()=>update({documentReady:!a.documentReady})}><span className="choice-copy"><strong>{a.documentReady?'Sample document added':'Use a sample document'}</strong><span>{a.documentType} · {a.country}</span></span>{a.documentReady&&<CheckIcon/>}</button><Note>In the full app, a secure provider would handle your document. This preview doesn’t collect identity documents.</Note></>}
      {step==='selfie' && <><div className="selfie-preview"><Mascot/></div><button className={`choice sample-action ${a.selfieReady?'selected':''}`} aria-pressed={a.selfieReady} onClick={()=>update({selfieReady:!a.selfieReady})}><span className="choice-copy"><strong>{a.selfieReady?'Sample check complete':'Try the sample check'}</strong><span>No camera access needed for this preview.</span></span>{a.selfieReady&&<CheckIcon/>}</button></>}
      {step==='learner-ready' && <><div className="setup-summary"><h2>Your languages</h2>{a.learningLanguages.map(language=><p key={language}><strong>{language}</strong> · {a.learningLevels[language]==='Not sure'?'Level to explore':a.learningLevels[language]}</p>)}<blockquote>{a.personalGoal}</blockquote><p>{a.topic}</p><p>{a.format||'Flexible format'}{a.city?` · ${a.city}`:''}</p><p>{a.days.join(' & ')||'Flexible days'} · {a.time||'Flexible time'}</p>{setup.resource&&<p>Attached: {setup.resource.name}</p>}<p>{guardian?'Parent or guardian verification':'Identity verification'}: {a.identityPreviewComplete?(a.identityMethod==='persona'?'Persona preview complete':'preview complete'):'to finish later'}.</p></div><Note>No identity verification was submitted. Next comes teacher discovery. You’ve reached the end of this onboarding preview.</Note></>}
      {(step==='verification-ready'||step==='teacher-draft') && <><div className="setup-summary"><h2>{a.name || 'Your profile'}</h2><p>{a.teachingLanguages.join(', ')} · €{a.rate} / {a.duration}</p><p>{step==='teacher-draft'?'You can finish verification later.':a.identityMethod==='persona'?'You’ve tried the instant Persona verification preview.':'You’ve walked through the verification preview.'}</p></div><Note>No verification was submitted. Your profile stays a local draft. Next, explore your teaching workspace with sample learners and sessions.</Note></>}
      {error && active && <p role="alert" className="field-error">{error}</p>}
    </main>
  </MobileScroll>;
}
const screens = Object.fromEntries([...new Set(stepIds)].map(step=>[step,{
  id:step,header:step==='welcome'?undefined:()=> <Header step={step}/>,headerHeight:54,
  footer:()=> <Footer step={step}/>,footerHeight:step==='account'?167:['welcome','resource','photo','format','city','days','time','notifications','widget','identity-intro','persona-link'].includes(step)?139:82,
  render:()=> <Screen step={step}/>,
} satisfies FlowScreen])) as unknown as Record<Step,FlowScreen>;
export default function Prototype() {
  const [answers,setAnswers]=useState<Answers>(initialAnswers),[resource,setResource]=useState<Media>(null),[photo,setPhoto]=useState<Media>(null);
  const [error,setError]=useState(''),[resendAt,setResendAt]=useState(0),[run,setRun]=useState(0);
  const [workspaceOpen,setWorkspaceOpen]=useState(()=>new URLSearchParams(window.location.search).get('teacher')==='1');
  const web=new URLSearchParams(window.location.search).get('view')==='web';
  const keyboard=useKeyboard();
  useEffect(()=>()=>{if(resource)URL.revokeObjectURL(resource.url);},[resource]);
  useEffect(()=>()=>{if(photo)URL.revokeObjectURL(photo.url);},[photo]);
  const reset=()=>{keyboard.hide();setAnswers({...initialAnswers});setResource(null);setPhoto(null);setError('');setRun(r=>r+1);};
  if(workspaceOpen){const workspace=<Suspense fallback={<div role="status" className="teacher-loading">Opening your teaching workspace…</div>}><TeacherWorkspace mobile={!web} answers={answers.role==='teacher'?answers:undefined}/></Suspense>;return web?createPortal(workspace,document.body):workspace;}
  return <Setup.Provider value={{answers,update:patch=>setAnswers(a=>({...a,...patch})),resource,setResource,photo,setPhoto,error,setError,resendAt,setResendAt,reset,openWorkspace:()=>{keyboard.hide();setWorkspaceOpen(true);}}}>
    <div className={`learning-app updated-onboarding ${answers.role==='teacher'?'teacher-theme':''}`}><FlowStack key={run} initial={screens.welcome}/></div>
  </Setup.Provider>;
}
