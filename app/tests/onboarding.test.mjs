import test from 'node:test';
import assert from 'node:assert/strict';
import { initialAnswers, toggleLearningLanguage, identitySteps, needsGuardian, changeAge, verificationExit, routeFor, nextStep, validStep, stepIds, dateOfBirthValid, formatDateOfBirth } from '../src/onboarding.ts';
const answers = patch => ({...initialAnswers,...patch});
test('learner route isolates each input and ends at teacher discovery handoff',()=>{
 const route=routeFor(answers({role:'learner',age:'18 or older',format:'In person'}));
 for(const step of ['email','age','verify','language','level','topic','personal-goal','resource','format','city','days','time']) assert.ok(route.includes(step),step);
 assert.equal(new Set(route).size,route.length);assert.equal(route.at(-1),'learner-ready');assert.ok(!route.includes('rate'));
});
test('teacher route isolates profile, price, duration and every verification action',()=>{
 const route=routeFor(answers({role:'teacher',age:'18 or older',format:'In person'}));
 for(const step of ['name','photo','teaching-languages','teaching-levels','approach','duration','rate','legal-name','country','document-type','document','selfie'])assert.ok(route.includes(step),step);
 assert.equal(new Set(route).size,route.length);assert.equal(route.at(-1),'verification-ready');assert.ok(!route.includes('daily-goal'));
});
test('online learners skip city; in-person and undecided learners can set it',()=>{
 assert.equal(nextStep('format',answers({role:'learner',format:'Online'})),'days');
 for(const format of ['In person','Either',''])assert.equal(nextStep('format',answers({role:'learner',format})),'city');
 assert.equal(nextStep('format',answers({role:'teacher',format:'Online'})),'duration');
});
test('under-18 route includes a separate guardian handoff before code verification',()=>{
 const a=answers({role:'learner',age:'Under 18'});assert.equal(nextStep('age',a),'guardian');assert.equal(nextStep('guardian',a),'verify');
 assert.ok(!validStep('guardian',answers({email:'same@example.com',guardianEmail:'SAME@example.com'})));
 assert.ok(validStep('guardian',answers({email:'learner@example.com',guardianEmail:'parent@example.com'})));
});
test('required selections, email, code and numeric price cannot advance empty or malformed',()=>{
 for(const step of ['role','email','age','verify','language','level','topic','personal-goal','name','teaching-languages','teaching-levels','approach','duration','rate','legal-name','country','document-type','document','selfie']) assert.equal(validStep(step,initialAnswers),false,step);
 assert.equal(validStep('email',answers({email:'bad@'})),false);
 assert.equal(validStep('verify',answers({code:'abcdef'})),false);
 assert.equal(validStep('verify',answers({code:'481629'})),true);
 for(const rate of ['0','-1','NaN','1001'])assert.equal(validStep('rate',answers({rate})),false);
 assert.equal(validStep('rate',answers({rate:'30.5'})),true);
});
test('all reachable steps exist and endpoint does not run into unrelated branches',()=>{
 for(const role of ['learner','teacher'])for(const age of ['18 or older','Under 18'])for(const format of ['Online','In person']){
 const a=answers({role,age,format}),route=routeFor(a);route.forEach(step=>assert.ok(stepIds.includes(step)));assert.equal(nextStep(route.at(-1),a),null);
 }
});

test('teachers provide date of birth only in verification, while learner age routing stays intact',()=>{
 const teacher=answers({role:'teacher',age:'Under 18'}),route=routeFor(teacher);
 assert.equal(nextStep('email',teacher),'verify');
 assert.ok(!route.includes('age'));assert.ok(!route.includes('guardian'));
 assert.equal(nextStep('legal-name',teacher),'date-of-birth');
 assert.equal(nextStep('date-of-birth',teacher),'country');
 assert.equal(route.filter(s=>s==='date-of-birth').length,1);
 assert.ok(routeFor(answers({role:'learner'})).includes('date-of-birth'));
});
test('date of birth validates real calendar dates and rejects future or incomplete input',()=>{
 const today=new Date(2026,9,1);
 for(const date of ['','1/1/2000','31/04/2000','29/02/1900','29/02/2001','00/01/2000','01/13/2000','02/10/2026','01/01/2027']) assert.equal(dateOfBirthValid(date,today),false,date);
 for(const date of ['29/02/2000','29/02/2024','01/10/2026','15/06/1995']) assert.equal(dateOfBirthValid(date,today),true,date);
 assert.equal(validStep('date-of-birth',initialAnswers),false);
 assert.equal(validStep('date-of-birth',answers({dateOfBirth:'15/06/1995'})),true);
 assert.equal(formatDateOfBirth('15061995'),'15/06/1995');
 assert.equal(formatDateOfBirth('15/06/199'),'15/06/199');
});

test('learners choose a personal goal and notifications without daily practice steps',()=>{
 const a=answers({role:'learner'}),route=routeFor(a);
 for(const step of ['routine','daily-goal','commitment','reminders'])assert.ok(!route.includes(step));
 assert.equal(nextStep('encouragement',a),'format');
 assert.equal(nextStep('time',a),'notifications');
 assert.equal(nextStep('notifications',a),'widget');
 assert.ok(route.includes('personal-goal'));
 assert.ok(!('dailyGoal' in initialAnswers));
});


test('guardian verification follows email code and resumes learner preferences',()=>{
 for(const age of ['18 or older','Under 18']) {
  const a=answers({role:'learner',age}),route=routeFor(a);
  for(const step of identitySteps)assert.equal(route.filter(s=>s===step).length,1,step);
  assert.equal(nextStep('benefits',a),age==='Under 18'?'learner-ready':'identity-intro');
  assert.equal(route.includes('guardian-handoff'),age==='Under 18');
  assert.equal(needsGuardian(a),age==='Under 18');
  assert.equal(nextStep('selfie',a),age==='Under 18'?'language':'learner-ready');
  assert.equal(nextStep('verify',a),age==='Under 18'?'guardian-handoff':'language');
  if(age==='Under 18')assert.deepEqual(route.slice(route.indexOf('verify')+1,route.indexOf('language')),['guardian-handoff',...identitySteps]);
  assert.equal(verificationExit(a),age==='Under 18'?'language':'learner-ready');
 }
 const teacher=answers({role:'teacher',age:'Under 18'});
 assert.equal(needsGuardian(teacher),false);
 assert.equal(verificationExit(teacher),'teacher-draft');
 assert.equal(nextStep('selfie',teacher),'verification-ready');
});
test('switching learner age clears identity details and guardian handoff state',()=>{
 const a=answers({age:'18 or older',legalName:'Example Adult',dateOfBirth:'15/06/1995',country:'France',documentType:'Passport',documentReady:true,selfieReady:true,identityPreviewComplete:true,guardianEmail:'parent@example.com',guardianReady:true});
 assert.deepEqual(changeAge(a,a.age),{age:a.age});
 for(const age of ['Under 18','18 or older']) {
  const changed={...a,...changeAge({...a,age:age==='Under 18'?'18 or older':'Under 18'},age)};
  for(const step of identitySteps.filter(s=>s!=='identity-intro'))assert.equal(validStep(step,changed),false,step);
  assert.equal(changed.identityPreviewComplete,false);
  assert.equal(changed.guardianReady,false);
  assert.equal(changed.guardianEmail,'');
 }
});


test('learners select multiple languages with independent levels and no stale removed level',()=>{
 let a=answers({role:'learner'});
 assert.equal(validStep('language',a),false);
 a={...a,...toggleLearningLanguage(a,'French')};
 a={...a,...toggleLearningLanguage(a,'Spanish')};
 assert.deepEqual(a.learningLanguages,['French','Spanish']);
 assert.equal(validStep('language',a),true);
 assert.equal(nextStep('language',a),'level-French');
 assert.equal(nextStep('level-French',a),'level-Spanish');
 assert.equal(nextStep('level-Spanish',a),'topic');
 assert.equal(validStep('level-French',a),false);
 a={...a,learningLevels:{French:'A1',Spanish:'B2'}};
 assert.equal(validStep('level-French',a),true);
 assert.equal(validStep('level-Spanish',a),true);
 assert.ok(routeFor(a).every(step=>stepIds.includes(step)));
 a={...a,...toggleLearningLanguage(a,'French')};
 assert.deepEqual(a.learningLanguages,['Spanish']);
 assert.deepEqual(a.learningLevels,{Spanish:'B2'});
 assert.equal(nextStep('language',a),'level-Spanish');
 assert.ok(!routeFor(a).includes('level-French'));
 a={...a,...toggleLearningLanguage(a,'Spanish')};
 assert.equal(validStep('language',a),false);
});


test('Persona shortcut skips document steps and resumes the right branch',()=>{
 for(const [role,age,end] of [['teacher','18 or older','verification-ready'],['learner','18 or older','learner-ready'],['learner','Under 18','language']]){
  const a=answers({role,age,identityMethod:'persona'}),route=routeFor(a);
  assert.equal(nextStep('identity-intro',a),'persona-link');
  assert.equal(nextStep('persona-link',a),end);
  assert.equal(route.filter(s=>s==='persona-link').length,1);
  for(const step of identitySteps.filter(s=>s!=='identity-intro'))assert.ok(!route.includes(step));
  assert.ok(route.every(step=>stepIds.includes(step)));
  const document={...a,identityMethod:'document'};
  assert.equal(nextStep('identity-intro',document),'legal-name');
  assert.ok(!routeFor(document).includes('persona-link'));
 }
});
