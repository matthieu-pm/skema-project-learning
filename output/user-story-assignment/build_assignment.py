from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).parent
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.27), Inches(11.69)
sec.top_margin = sec.bottom_margin = Inches(.7)
sec.left_margin = sec.right_margin = Inches(.8)
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3']:
    s=doc.styles[name]; s.font.name='Calibri'; s.font.color.rgb=RGBColor(0,0,0)
doc.styles['Normal'].font.size=Pt(11)
doc.styles['Normal'].paragraph_format.space_after=Pt(7)
doc.styles['Normal'].paragraph_format.line_spacing=1.08
doc.styles['Title'].font.size=Pt(28)
doc.styles['Heading 1'].font.size=Pt(20)
doc.styles['Heading 2'].font.size=Pt(13)
for s in doc.styles:
    for border in list(s.element.iter(qn('w:pBdr'))):
        border.getparent().remove(border)
footer=sec.footer.paragraphs[0]
footer.alignment=2
field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE')
footer._p.append(field)
doc.core_properties.title='Mimo User Story Writing'
doc.core_properties.author='Matthieu'
def p(t,style=None): return doc.add_paragraph(t,style)
def h(t): doc.add_heading(t,2)
def page(t): doc.add_page_break(); doc.add_heading(t,1)
def table(headers,rows,widths=None):
    t=doc.add_table(rows=1,cols=len(headers)); t.style='Light Shading Accent 1'
    for c,s in zip(t.rows[0].cells,headers): c.text=s
    trpr=t.rows[0]._tr.get_or_add_trPr(); repeat=OxmlElement('w:tblHeader'); trpr.append(repeat)
    for row in rows:
        for c,s in zip(t.add_row().cells,row):
            c.text=s
            for pp in c.paragraphs:
                pp.paragraph_format.space_after=Pt(4)
                for r in pp.runs:r.font.size=Pt(10)
    for row in t.rows:
        pr=row._tr.get_or_add_trPr(); el=OxmlElement('w:cantSplit');pr.append(el)
    return t

p('Mimo User Story Writing','Title')
p('From a product need to a testable specification and reusable AI skill','Subtitle')
p('Matthieu  |  MSc Product Management and UX Design  |  22 October 2026')
p('This assignment develops one Mimo story, explains the distinction between business rules, acceptance criteria and acceptance tests, critiques an AI-generated draft, and turns that learning into a reusable AI skill. The final story follows the course template on page 12. [1]')
h('Product context and chosen need')
p('Mimo supports one learner working with a teacher they choose. The teacher map describes Gilbert’s goal as spending less time preparing and more time teaching. The selected task is adapting an existing lesson to one learner’s level and practical goal. Short, editable preparation and preservation of the reusable original are explicit board directions. Reduced preparation time is a hypothesis, not a measured result. [2–4]')
p('The story sits under Lesson preparation → Adapt a lesson → Reusable lessons in the teacher-only map. That map places T03 in proposed R1. The combined backlog places US15 reuse in R2. I retain the teacher map as the local context and flag the release disagreement for refinement; this assignment does not resolve the roadmap. [3, 5]')
h('Three different specification layers')
table(['Layer','Purpose','Mimo example'],[
('Business rule','A domain constraint that can govern several stories.','Adapting a lesson must preserve its reusable original.'),
('Acceptance criterion','An observable condition this story must satisfy.','Editing the learner-specific copy leaves the original content unchanged.'),
('Acceptance test','A concrete example checking a criterion with explicit data and expected results.','Change block B1 in copy C1; reopening source L1 still shows its original B1 text.')])
p('Rules explain the constraints; criteria define acceptable behavior; tests demonstrate how to check it. Given–When–Then is a way to express examples, not evidence that a test has run. Criteria may also use BDD syntax; the distinction is their purpose and specificity.')
h('Source and implementation status')
p('The board describes proposed product behavior. Current source also contains a frontend adaptation function and fictional teacher-workspace data. Source inspection supports separate copies and a Draft state. Durable saving and enforced multi-user authorization remain proposed service requirements. The acceptance tests below are specifications, not executed product tests. [6]')

page('1 Generate and critically review a draft')
p('Method: I used the installed phuryn user-stories skill as the starting framework: role–action–benefit, the 3 C’s, INVEST, design links, and acceptance criteria. The following draft was generated in this session using that framework. The critique and revision are AI-assisted work, not an independent human review. [7]')
h('Input to the starting skill')
p('Product: Mimo. Feature: adapt one reusable lesson for one learner. Design source: teacher story map T03, node 589:3860. Context: Gilbert wants to prepare without starting over; lessons remain editable and AI is optional. Produce a bounded story with acceptance criteria.')
h('Initial AI draft')
p('Title: Adapt a reusable lesson.\nAs a teacher, I want to adapt an existing lesson to a learner’s level and goal so that I can prepare without starting from scratch.')
for x in [
'D1. The teacher can select an existing lesson from the library.',
'D2. The adapted lesson reflects the learner’s level and goal.',
'D3. The teacher can edit the lesson activities.',
'D4. The teacher can save the adapted lesson.',
'D5. The original lesson remains unchanged.',
'D6. The adapted lesson is ready for teacher approval.']:p(x)
h('Critical evaluation and corrections')
table(['Finding in the draft','Why it matters','Correction'],[
('D2 says “reflects” the goal.','No observable meaning for personalization.','Show the selected learner’s language, level and goal; initialize the outcome from the goal.'),
('D4 only says “save”.','No success, recovery, or failure definition.','Define acknowledged persistence and failed-save behavior separately.'),
('D5 has no concrete example.','Shared objects could alter the source.','Test a copy edit and compare original block content.'),
('D6 says “ready for approval”.','Could imply adaptation grants approval.','Keep the result Draft and unshared; approval is another story.'),
('No rules, tests, or access boundary.','Incomplete against the course template; risks cross-teacher access.','Separate BR/AC/AT and specify authorized access.'),
('No planning or evidence status.','Proposal might be read as delivered scope.','Disclose the release conflict and prototype/service boundary.')])
p('Retain the clear teacher role, practical benefit, narrow adaptation goal, editing, and source-preservation intent. The original skill provides useful structure but does not require separate rules and tests, evidence status, or traceability. Its claim that stories can be developed in any order is too strong: user stories can still depend on learner context, storage and access services.')

page('2 Define the complete user story')
p('ID: MIMO-US-T03-A  |  Type: Functional user story\nTitle: Adapt one reusable lesson for a learner\nStatus: Proposed specification; some behavior exists as a frontend simulation.\nParent: Teacher map F04 Reusable lessons; refinement of T03, not a new Linear issue.\nRelease: Teacher map R1 proposal; combined-map reuse is R2 and remains unresolved.')
h('Description')
p('As a Mimo teacher preparing a lesson for a learner I teach, I want to create and edit a learner-specific copy of one reusable lesson, so that I can prepare for their level and goal without rewriting the original.')
h('Conversation and scope')
p('The teacher already has authorized access to a learner brief and a reusable lesson. The brief supplies language, level and goal. The flow creates a separate draft, allows manual editing, and saves that draft for later preparation. Approval, sharing, teaching, library search, resource upload and AI generation are separate stories. Successful adaptation does not demonstrate better learning or reduced preparation time.')
p('A1 — Proposed design decision: saving means durable retrieval after reopening, and a failed save keeps the current editor content available for retry. The board’s reliability lane supports this direction; the frontend prototype does not establish production persistence. [3]')
p('A2 — Proposed scope decision: incomplete lesson content may remain a draft. This story adds no approval-validation policy and no arbitrary minimum word count, activity count, or duration. Approval requirements belong to the adjacent approval story.')
h('Business rules')
for x in [
'BR-01 — Preserve the reusable original when adapting content for a learner. Source-backed planning rule: reusable lesson data model, node 602:4033. [3]',
'BR-02 — Keep the adaptation linked to the selected learner and reusable source. Source-backed planning rule: learner-linked brief access and reusable lesson data model. [3]',
'BR-03 — The teacher controls lesson content; preparation must remain possible without AI. Source-backed product direction: short editable content and optional assistance. [2, 3]',
'BR-04 — A new adaptation is an unapproved, unshared draft. Review and sharing require separate explicit actions. Source-backed planning rule, consistent with the frontend Draft reset. [3, 6]',
'BR-05 — Only an authorized teacher may read or change the relevant learner brief and draft. Source-backed proposed service rule: Authorization and isolation, node 602:4102; not proof of existing backend enforcement. [3]']:p(x)
h('Dependencies and boundaries')
p('Dependencies: accessible learner brief, reusable lesson storage, draft storage, and authorization. In the test harness these can be fixtures; a production service needs real implementations. Source deletion, concurrent edits, offline persistence and cross-device synchronization require separate refinement. They are not silently included in this story.')

page('3 Specify observable acceptance criteria')
p('These criteria define the proposed target behavior. “Saved” means acknowledged storage, not merely a visible button press. Concrete tests on the next pages provide the pass/fail observations.')
criteria=[
('AC-01','Select the right context','Before creating a copy, the teacher can identify the selected source lesson and learner by name or title and see that learner’s language, level and goal. If the source or authorized learner brief is unavailable, no copy is created and the missing context is identified.','BR-02, BR-05'),
('AC-02','Create a separate private draft','Creating the adaptation produces a separate lesson linked to the selected source and learner. The source activities are copied, the copy has Draft status, and the action neither grants approval nor shares material with a learner.','BR-01, BR-02, BR-04'),
('AC-03','Edit the copy manually','The copy uses the selected learner’s language and level and initially uses their goal as its outcome. The teacher can change title, outcome and activity content without invoking AI. Those changes do not change the source lesson or another learner’s copy.','BR-01, BR-02, BR-03'),
('AC-04','Recover an acknowledged save','After storage confirms a successful save, reopening the draft restores its latest acknowledged title, outcome, activity content and learner/source links, with Draft status. Incomplete content remains saveable as a draft under A2.','BR-02, BR-04; A1, A2'),
('AC-05','Handle save failure truthfully','If storage rejects a save, the teacher sees that the changes were not saved; the editor retains those changes for retry and does not display a success result. Reopening from storage still returns the last acknowledged version.','A1'),
('AC-06','Retry without creating extra lessons','After the failed save, retrying the retained edits updates the same draft when storage succeeds. Reopening that draft restores the retried content; the retry creates no additional adaptation.','BR-02; A1'),
('AC-07','Enforce authorized access','A teacher without access to the learner/source cannot create that adaptation. A teacher without access to an existing draft cannot read or alter it, including through a direct request. Denial discloses no private lesson or learner content and leaves existing data unchanged.','BR-05')]
for code,title,body,refs in criteria:
    h(code+' '+title);p(body+' ('+refs+')')
p('Testability limit: these criteria specify storage and authorization outcomes for a future service. A frontend-only demonstration cannot establish those guarantees. They are explicit dependencies for implementation, rather than claims about the current app.')

page('4 Write concrete acceptance tests')
p('All people, IDs and lesson text below are fictional fixtures. These scenarios are written test specifications and have not been run against Mimo.')
h('Shared fixture')
p('Teacher G is authorized for learner L and reusable lesson R. L has language English, level B1 and goal “Handle a hotel check-in”. R is titled “At the café”, has outcome “Order a drink”, and activity B1 contains “Ask for a coffee”. R has a baseline snapshot. Learner M has another existing copy C2 containing “Ask for tea”. Teacher X has no access to L, R or G’s drafts. Storage can explicitly succeed or reject a save.')
tests=[
('AT-01 Context and creation','AC-01, AC-02','G has access to R and L, and no adaptation has been created','G selects R and L and creates an adaptation','the context shows At the café, learner L, English, B1 and Handle a hotel check-in; a separate draft C1 references R and L, contains the copied activity, and is neither approved nor shared'),
('AT-02 Manual personalization and isolation','AC-03','C1 exists from AT-01 and AI is unavailable','G changes C1’s title to Hotel check-in and B1 content to Ask whether breakfast is included','C1 initially uses English, B1 and L’s goal as outcome, accepts the edits manually, R still contains Ask for a coffee and its original title/outcome, and C2 still contains Ask for tea'),
('AT-03 Save and reopen','AC-04','C1 contains the AT-02 edits and storage is available','G saves, receives a success acknowledgement, closes the editor and reopens C1','C1 restores Hotel check-in, Handle a hotel check-in and Ask whether breakfast is included, retains links to R and L, and remains Draft'),
('AT-04 Incomplete draft boundary','AC-04','G is editing C1 and the latest stored version has its previous outcome','G empties the outcome, saves successfully and reopens C1','the empty outcome is restored as a Draft; saving has not approved or shared it')]
for title,refs,g,w,t in tests:
    h(title+'  '+refs);p('Given '+g+'.\nWhen '+w+'.\nThen '+t+'.')
p('Each scenario should run with a clean fixture. AT-02 and AT-03 explicitly reproduce the preceding setup rather than depending on test execution order. Assertions on source snapshots check data isolation, not just the visible copied title.')

page('5 Cover failures and trace the requirements')
tests=[
('AT-05 Missing preparation context','AC-01','G can select R but L’s brief is unavailable','G attempts to create an adaptation for L','no adaptation is created and G is told that the learner brief is unavailable'),
('AT-06 Rejected save','AC-05','C1’s last acknowledged activity text is Ask whether breakfast is included, and G has changed it to Ask for a late check-out','storage rejects G’s save','the editor keeps Ask for a late check-out, reports unsaved changes without success, and a separate retrieval of C1 still returns Ask whether breakfast is included'),
('AT-07 Successful retry','AC-06','the failed-save state of AT-06 exists and storage is now available','G retries saving C1 and reopens it after acknowledgement','C1 contains Ask for a late check-out, has the same ID and links, and the adaptation count is unchanged'),
('AT-08 Unauthorized creation','AC-07','X has no access to L or R','X directly requests an adaptation of R for L','access is denied without private content, no adaptation is created, and R is unchanged'),
('AT-09 Unauthorized read and edit','AC-07','C1 exists and X has no access to it','X directly requests its contents and attempts to change its title','both requests are denied without private content and G’s stored C1 remains unchanged')]
for title,refs,g,w,t in tests:
    h(title+'  '+refs);p('Given '+g+'.\nWhen '+w+'.\nThen '+t+'.')
h('Coverage matrix')
table(['Rule or decision','Acceptance criteria','Acceptance tests'],[
('BR-01 Preserve originals','AC-02, AC-03','AT-01, AT-02'),
('BR-02 Correct linkage','AC-01–04, AC-06','AT-01–04, AT-07'),
('BR-03 Manual control','AC-03','AT-02'),
('BR-04 Draft boundary','AC-02, AC-04','AT-01, AT-03, AT-04'),
('BR-05 Authorization','AC-01, AC-07','AT-01, AT-08, AT-09'),
('A1 Save and recovery','AC-04–06','AT-03, AT-06, AT-07'),
('A2 Incomplete drafts','AC-04','AT-04')])

page('6 Design the reusable AI skill')
p('The new skill is named testable-user-stories. It is derived from the installed user-stories skill but is self-contained. Its full executable instruction file, template, Mimo reference and evaluation cases are supplied with this assignment. The upstream license and source record are retained. [7]')
h('What is retained and what changes')
table(['Starting skill','Assignment-specific extension'],[
('Role–action–benefit and the 3 C’s','Retain the story card, conversation and confirmation.'),
('INVEST and design references','Retain them; disclose dependencies, evidence status and release conflicts.'),
('One acceptance-criteria list','Add distinct BR, AC and concrete Given–When–Then AT sections.'),
('Four to six criteria as a default','Use enough criteria to cover the bounded behavior; avoid quota-driven duplication.'),
('General story-generation process','Preserve the actual draft, critique material defects, revise and map AC to AT.'),
('Stories developed in any order','Check dependencies and team capacity before calling a story independent or sprint-sized.')])
h('Reusable inputs and output contract')
p('Inputs: product, actor, practical goal, feature boundary, source material, known rules, implementation status, optional AI draft, and required course format. Missing policy becomes an explicit question or labeled proposal. The output contains ID/title/type, description, context, rules, criteria, tests, traceability, INVEST review and open decisions. A coursework request additionally includes draft critique and a rationale for the skill.')
p('The main SKILL.md contains the workflow. assets/story-template.md provides the reusable structure. references/mimo.md routes Mimo requests to the board and project context; it is loaded only for Mimo. references/evaluation-cases.md defines behavioral checks. agents/openai.yaml makes the skill discoverable in Codex. Another product uses its own sources and rules.')
h('Demonstration prompt')
p('Use $testable-user-stories to refine Mimo T03 Adapt one reusable lesson from the teacher story map. Follow page 12 of Story Mapping.pdf. Separate business rules, acceptance criteria and Given–When–Then tests. Preserve originals, keep the manual path and Draft boundary, label proposed persistence, disclose the release conflict, critique the initial AI draft, and show test coverage.')
h('Observed use and evaluation limits')
p('I applied the new workflow to the revised story on pages 3–6: each criterion has concrete test coverage, domain rules remain separate, and unsupported persistence and policy decisions carry labels. This is a same-session worked application and self-review. It is not evidence of independent reliability, stakeholder agreement or successful software execution.')
p('The packaged evaluation cases cover Mimo adaptation, absent cancellation policy, a scope-conflicting AI draft, confused BR/AC/AT labels, a different product and an inaccessible board. These are future evaluation inputs with expected invariants. They must not be reported as passed behavioral tests merely because the skill file validates.')

page('7 Review readiness and sources')
h('INVEST assessment')
table(['Dimension','Assessment of this story'],[
('Independent','A usable adaptation outcome; depends on existing brief, source, access and storage. Approval and AI stay separate.'),
('Negotiable','Outcome and invariants are explicit; the team can negotiate UI, storage approach and A1/A2.'),
('Valuable','Gives a teacher an editable starting point for one learner. Time savings remain a hypothesis.'),
('Estimable','Enough behavior for discussion, but service scope and persistence choices need technical refinement; no estimate is invented.'),
('Small','One source, one learner, one editable draft. Team capacity must confirm size; no one-sprint guarantee.'),
('Testable','Seven observable criteria map to nine concrete success, boundary, failure and access scenarios.')])
h('Proposed three amigos discussion')
p('Product/business: confirm the learner-specific outcome, draft privacy and incomplete-draft decision; reconcile R1 versus R2 reuse placement. Development: agree storage acknowledgement, authorization enforcement, stable draft IDs and retry behavior. Testing: agree deterministic fixtures, direct access checks and how storage failure is injected. These are proposed discussion topics; no workshop or stakeholder validation is claimed.')
p('The story is a complete proposed specification for the bounded assignment. Before development commitment, the team must confirm A1/A2 and service dependencies. Concurrent editing, offline recovery and other excluded capabilities should receive separate refinement if required.')
h('Sources')
sources=[
'[1] SKEMA Business School. Story Mapping.pdf, supplied course, 14 pages. Pages 5–10: incremental value, journey backbone, releases and MMF diagrams; page 11: role–goal–benefit; page 12: explicit story template, 3 amigos and BDD. BR/AC/AT explanations here elaborate the template for this assignment. The supplied brief gives the four learning objectives.',
'[2] Mimo FigJam. Scope do’s, node 156:2022; scope don’ts, node 156:2005. Read live on 22 October 2026. https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=156-2022',
'[3] Mimo FigJam. Teacher story mapping, node 568:4173, including T03 node 589:3860, source-preservation enabler 602:4033, and reliability/access lanes. Read live on 22 October 2026. https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=568-4173',
'[4] Mimo project context.md. Product scope, teacher research synthesis and implementation boundary. Read 22 October 2026. Research synthesis supports a need; it does not prove impact.',
'[5] Mimo output/linear-story-map/story-map.md. US15 reuse placed in R2; local planning artifact read 22 October 2026. Compared with live teacher map; no current Linear workspace audit is claimed.',
'[6] Mimo app/src/teacher/model.ts, adaptLesson; app/tests/teacher-workspace.test.mjs. Source inspected 22 October 2026. Existing tests were read, not run in this assignment; no new hosted app verification was performed.',
'[7] phuryn. pm-skills, pm-execution/skills/user-stories/SKILL.md. Installed 22 October 2026; snapshot, SHA-256, upstream commit and MIT license retained in the submission package. https://github.com/phuryn/pm-skills/tree/main/pm-execution/skills/user-stories'
]
for s in sources:
    pp=p(s); pp.paragraph_format.space_after=Pt(5)
    for r in pp.runs:r.font.size=Pt(9)
doc.save(ROOT/'Mimo User Story Writing.docx')
print(ROOT/'Mimo User Story Writing.docx')
