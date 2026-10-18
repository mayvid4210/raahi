// Curated, illustrative content only. No live listings, eligibility checks or promises.
export const interestOptions = ['Teaching','Technology','Business','Design','Healthcare','Government Exams','Agriculture'];
const tagWords = {
  teaching: ['teach','teaching','teacher','tutor','tutoring','education','math','maths','mathematics','children','पढ़ा','बच्च','गणित'],
  technology: ['tech','technology','software','computer','coding','digital','कंप्यूटर'],
  business: ['business','entrepreneur','entrepreneurship','shop','retail','दुकान','व्यापार','apna kaam'],
  design: ['design','draw','drawing','art','creative','canva','चित्र'],
  healthcare: ['health','healthcare','nurse','nursing','care','helping people','स्वास्थ्य'],
  'government exams': ['government','exam','exams','stable job','सरकारी'],
  agriculture: ['farm','farming','farmer','agri','agriculture','garden','nature','खेती'],
};
export function profileTags(profile = {}, interests = []) {
  const text = [profile.education,...(profile.interests || []),...(profile.skills || []),...(profile.goals || []),...(profile.preferences || []),...(profile.experiences || []),profile.goal,...interests].join(' ').toLowerCase();
  return [...new Set([...Object.entries(tagWords).filter(([,words]) => words.some(word => /^[a-z ]+$/.test(word) ? new RegExp('\\b'+word+'\\b').test(text) : text.includes(word))).map(([tag]) => tag),...interests.map(x=>x.toLowerCase())])];
}
export function rankItems(items, profile, interests = []) {
  const tags = profileTags(profile, interests);
  return items.map((item,index) => ({item,index,score:item.tags.reduce((sum,tag)=>sum+(interests.filter(x=>x.toLowerCase()===tag).length ? interests.filter(x=>x.toLowerCase()===tag).length*4 : tags.includes(tag)?2:0),0)}))
    .sort((a,b)=>b.score-a.score || a.index-b.index).map(x=>x.item);
}
export const lessons = {
  communication:{title:'Clear communication',effort:'20 min',skill:'Communication',text:'Start by listening. Repeat the task in your own words, ask what a useful result looks like, and agree on one small next step.',practice:'Explain a familiar task to someone in three short sentences. Ask what was clear and what needs changing.'},
  teaching:{title:'Teaching basics',effort:'30 min',skill:'Explaining ideas',text:'Choose one idea, show a simple example, and let the learner try it. Their mistakes help you understand what to explain differently.',practice:'Make a five-minute explanation of fractions using objects at home. Invite a younger learner to try an example.'},
  canva:{title:'Canva Basics',effort:'30 min',skill:'Visual design',text:'A useful poster needs a clear heading, readable text and enough empty space. You can practise with paper first; no paid design tool is required.',practice:'Sketch a poster for a local shop. Use two colours, one heading, and a clear action. An optional free design tool can be used later.'},
  digital:{title:'Everyday digital skills',effort:'25 min',skill:'Digital confidence',text:'Name files clearly, keep a copy of your work and ask permission before using anyone’s photos or information.',practice:'Create a sample folder plan for a project, using fictional names and no personal information.'},
  numbers:{title:'Simple records & numbers',effort:'25 min',skill:'Record keeping',text:'A simple stock record can use item, quantity, date and notes. Consistent entries make it easier to spot mistakes.',practice:'Create a paper table for five imaginary products. Record a delivery and a sale, then check the remaining quantities.'},
  coding:{title:'Problem-solving with code',effort:'40 min',skill:'Logical thinking',text:'Before writing code, describe the input, the steps and the result. Test your idea with a small example.',practice:'Write plain-language instructions to find the largest of three numbers. Try equal numbers too.'},
  care:{title:'Listening & care awareness',effort:'25 min',skill:'Careful listening',text:'Respect privacy, listen without judging and know when to ask a qualified professional for help. This exercise is not clinical training.',practice:'Practise asking what support someone needs. List situations where a trained adult or professional should take over.'},
  business:{title:'Start with a small need',effort:'30 min',skill:'Understanding customers',text:'Observe a problem and talk to people about it. Test one small idea before spending money. A learning exercise does not require a loan or purchase.',practice:'Ask three people about a small everyday difficulty. Sketch a solution using resources you already have.'},
  project:{title:'Try a real-world project',effort:'1–2 short sessions',skill:'Practical teamwork',text:'Agree on a small task, get permission, use sample data and show an early draft. Ask for feedback before making changes.',practice:'Write a one-page plan: problem, person helped, materials already available, a small deliverable, and how to get feedback.'},
  portfolio:{title:'Build your first portfolio',effort:'30 min',skill:'Showing your work',text:'A portfolio can be a paper folder or an offline file. Show the problem, your work and what you learned. Get permission before sharing names or images.',practice:'Make a before-and-after page for one practice task. Add three sentences about what you learned.'},
  opportunity:{title:'Take a thoughtful next step',effort:'20 min',skill:'Opportunity readiness',text:'Discuss the role, supervision, time and any compensation with a trusted adult or facilitator. Never pay a registration fee for an unverified offer.',practice:'Prepare five questions to ask about a role. Save a relevant demo opportunity to practise comparing options.'},
};
export const careers = [
  {id:'teacher',title:'Teacher',tags:['teaching','government exams'],icon:'book',route:'Further study → an appropriate teaching qualification → supervised practice',duration:'Longer formal study; short practice projects can start sooner',cost:'Varies with institution and route',formal:'Formal school roles usually involve specified qualifications; verify the role',local:'Tutoring practice may start locally',relocation:'May be needed for study or a specific post',skills:['Communication','Subject knowledge','Patience'],environments:['Schools','Learning centres','Community learning'],alternatives:['Tutoring','Learning-content creation','College teaching'],lessons:['communication','teaching','project','portfolio','opportunity'],examIds:['ctet','cuet'],branches:[['School teaching','Further study','Teacher training','Explore school roles'],['College teaching','Subject study','Advanced study','Explore academic roles'],['Skills & tutoring','Choose a subject','Practise explaining','Small-group learning']]},
  {id:'healthcare',title:'Nurse / Healthcare Worker',tags:['healthcare'],icon:'people',route:'Explore the role → verify approved training → supervised learning',duration:'Formal training over several stages',cost:'Varies; compare recognized training options',formal:'Clinical roles require approved qualifications and applicable registration',local:'Community learning may be local; clinical work needs qualified supervision',relocation:'Training or placements may require travel',skills:['Careful listening','Observation','Teamwork'],environments:['Clinics','Hospitals','Community health teams'],alternatives:['Nursing routes','Allied health roles','Non-clinical community support'],lessons:['communication','care','project','portfolio','opportunity'],examIds:['neet'],branches:[['Nursing','Explore approved programmes','Supervised training','Verify role requirements'],['Allied health','Compare specialisms','Approved training','Supervised experience'],['Community support','Learn boundaries','Support awareness work','Explore local roles']]},
  {id:'designer',title:'Graphic Designer',tags:['design','technology'],icon:'sun',route:'Design basics → practice projects → portfolio → explore work',duration:'Short practice cycles; deeper study is optional',cost:'Can start with paper and free tools',formal:'Portfolio-led and formal study routes both exist',local:'Yes, small practice tasks can start locally',relocation:'Remote/local work may be possible; opportunities vary',skills:['Visual principles','Communication','Digital tools'],environments:['Local businesses','Studios','Freelance projects'],alternatives:['Design degree','Self-directed practice','Print/design apprenticeship'],lessons:['canva','communication','project','portfolio','opportunity'],examIds:['cuet'],branches:[['Formal study','Explore design study','Practice projects','Portfolio'],['Independent learning','Visual principles','Free-tool practice','Portfolio'],['Local practice','Observe design needs','Supervised small task','Feedback & portfolio']]},
  {id:'entrepreneur',title:'Entrepreneur',tags:['business','agriculture','design'],icon:'leaf',route:'Understand a need → test a small idea → learn from feedback',duration:'Small experiments with continuing learning',cost:'Start by testing with resources you already have',formal:'Rules and permissions depend on the activity; verify before trading',local:'Yes, explore needs close to home',relocation:'Often possible locally; varies with the idea',skills:['Communication','Simple records','Understanding customers'],environments:['Local retail','Digital services','Community enterprises'],alternatives:['Family-business learning','Freelancing','Small service experiments'],lessons:['business','communication','numbers','project','portfolio','opportunity'],examIds:[],branches:[['Local service','Listen to neighbours','Test a tiny service','Collect feedback'],['Digital service','Learn a useful tool','Make a sample','Build a portfolio'],['Local product','Understand a need','Test a small batch idea','Check rules & feedback']]},
  {id:'marketer',title:'Digital Marketer',tags:['business','design','technology'],icon:'compass',route:'Understand an audience → create useful content → reflect on results',duration:'Short projects followed by continued practice',cost:'Free practice is possible without buying ads',formal:'Different roles value different study and practical experience',local:'Try a permission-based local content project',relocation:'Local, remote and office settings vary',skills:['Writing','Visual communication','Basic analysis'],environments:['Small businesses','Agencies','Community organisations'],alternatives:['Content writing','Design support','Formal business/marketing study'],lessons:['communication','canva','business','portfolio','opportunity'],examIds:['cuet']},
  {id:'software',title:'Software Developer',tags:['technology'],icon:'book',route:'Logical thinking → coding practice → small projects → portfolio',duration:'Sustained practice; formal study routes vary',cost:'Free tools can support early practice',formal:'Degree, diploma and skills-led routes differ by employer',local:'Learning and small offline projects can start locally',relocation:'May be needed for study or some employers',skills:['Problem solving','Coding','Communication'],environments:['Software teams','Local digital services','Independent projects'],alternatives:['Degree','Diploma','Self-directed project learning'],lessons:['digital','coding','communication','project','portfolio','opportunity'],examIds:['jee','cuet'],branches:[['Degree route','Explore study options','Coding foundations','Team projects'],['Diploma route','Compare practical study','Build a small tool','Portfolio'],['Skills-led route','Learn the basics','Practise offline','Share a working project']]},

];
export const businesses = [
  ['retail','Local Retail','Help a shop organise a simple product list.','numbers','Use five fictional products to test your idea.'],
  ['services','Digital Services','Create useful catalogues or simple posters.','canva','Make one sample for a familiar local need.'],
  ['food','Food Business','Explore a food idea and learn about hygiene and local rules.','business','Sketch a menu and gather feedback before any spending.'],
  ['agri','Agriculture Enterprise','Explore record keeping or useful farm services.','numbers','Talk about one seasonal difficulty with permission.'],
  ['freelance','Freelancing','Offer one clearly defined practical skill.','communication','Make a sample brief and a portfolio page.'],
  ['creative','Creative Business','Explore illustrations, cards or design services.','canva','Try a paper prototype and ask for feedback.'],
  ['repair','Repair & Technical Services','Learn safe basic troubleshooting with a trained adult.','digital','Observe a supervised task; avoid electrical hazards.'],
].map(([id,title,text,lesson,start])=>({id:'biz_'+id,type:'enterprise',title,text,lesson,start,tags:['business',...(id==='agri'?['agriculture']:['technology'])]}));
export const exams = [
  ['cuet','CUET','Exploring participating university courses','Students exploring undergraduate study',['Language practice','Domain subjects','General aptitude'],['Explore course choices','Read the current bulletin','Build a subject plan','Practise and review'],['teaching','business','technology','design']],
  ['jee','JEE Main','Exploring engineering study pathways','Students considering engineering study',['Mathematics','Physics','Chemistry'],['Explore engineering routes','Check the current bulletin','Plan foundations','Practise topic questions'],['technology']],
  ['neet','NEET','Exploring relevant medical study pathways','Students considering medical study',['Biology','Physics','Chemistry'],['Explore healthcare roles','Check the current bulletin','Build subject foundations','Practise and reflect'],['healthcare']],
  ['ssc','SSC CHSL','Exploring selected government recruitment routes','Students exploring government recruitment',['Language','Reasoning','Quantitative aptitude','General awareness'],['Explore the roles','Read the notification','Practise foundations','Track official milestones'],['government exams','business']],
  ['upsc','UPSC Civil Services','Exploring civil service roles','Learners exploring public-service careers',['General studies','Aptitude','Writing','Optional subject exploration'],['Understand the work','Read the notification','Build a reading habit','Practise structured writing'],['government exams']],
  ['ctet','CTET','Understanding a teaching-related eligibility examination','Learners exploring school teaching routes',['Child development','Pedagogy','Languages','Subject areas'],['Explore teaching routes','Read the current bulletin','Study pedagogy','Practise and review'],['teaching','government exams']],
].map(([id,title,text,audience,syllabus,roadmap,tags])=>({id,type:'exam',title,text,audience,syllabus,roadmap,tags,milestones:['Check current notification','Verify application window','Check admit-card and examination notices'],dates:'Check official source — no live dates in this demo.'}));
export const opportunities = [
  ['opp_tutor','Tutor younger students','Neighbourhood learning group','local','2–4 hrs/week','paid',['teaching','communication'],'communication'],
  ['opp_catalogue','Local shop digital catalogue helper','Sample kirana shop','local','Weekend project','stipend',['business','design','technology'],'canva'],
  ['opp_social','Social media helper','Sample local business','hybrid','Weekend / 2 hrs','paid',['business','design'],'canva'],
  ['opp_data','Data entry support','Sample community organisation','remote','2 hrs/week','volunteer',['technology','business'],'numbers'],
  ['opp_poster','Poster/design helper','Sample learning centre','local','Weekend project','stipend',['design','teaching'],'canva'],
  ['opp_translate','Local-language content helper','Sample NGO','remote','2–3 hrs/week','volunteer',['teaching','communication'],'communication'],
  ['opp_event','Event assistance','Sample community group','local','Weekend session','paid',['business','communication'],'communication'],
  ['opp_computer','Basic computer help','Sample neighbourhood centre','hybrid','2 hrs/week','stipend',['technology'],'digital'],
  ['opp_volunteer','Digital Skills Volunteer','Sample NGO','remote','2 hrs/week','volunteer',['technology','teaching'],'digital'],
].map(([id,title,organisation,mode,time,compensation,tags,lesson])=>({id,type:'opportunity',title,organisation,mode,time,compensation,tags,lesson,level:'beginner',text:'A fictional role to practise exploring opportunities. No application or paid work is offered.',skills:[lessons[lesson].skill,'Communication']}));
export const projects = [
  ['project_shop','Help a local shop create a digital catalogue','Local Kirana Store',['canva','communication'],['business','design','technology'],'Use a sample list of five products and sketch a catalogue.'],
  ['project_farm','Create a simple digital inventory record','Farmer Cooperative',['numbers','digital'],['agriculture','business','technology'],'Create a sample stock sheet without real personal or financial data.'],
  ['project_hindi','Translate awareness material into Hindi','Local NGO',['communication','digital'],['teaching','communication'],'Translate a short fictional awareness message and ask a reader for feedback.'],
  ['project_posters','Create learning posters for children','Tuition Centre',['teaching','canva'],['teaching','design'],'Explain one maths idea using a clear, illustrated poster.'],
  ['project_artisan','Photograph and list sample products','Local Artisan',['canva','digital'],['business','design'],'Practise framing a photo of your own object and write a clear description.'],
].map(([id,title,organisation,lessonIds,tags,text])=>({id,type:'project',title,organisation,lessonIds,tags,text,skills:lessonIds.map(id=>lessons[id].skill),outcome:'Portfolio project',potential:'Could help you discuss future work; no paid follow-up is promised.'}));
export const stories = [
  ['story_teacher','3 things I wish I knew before becoming a teacher','Teacher Meena','3 min',['teaching'],'video','Start with listening. A simple explanation and a chance to practise can matter more than a long lecture.'],
  ['story_tutor','How I started tutoring while in college','A college student','2 min',['teaching','business'],'video','Try a small supervised learning session. Reflect on what the learner understood and what you could explain differently.'],
  ['story_bank','What working at a local bank is actually like','A bank employee','4 min',['business','government exams'],'video','Careful records, clear communication and respect for privacy are useful habits to explore.'],
  ['story_shop','From village shop to online business','A local entrepreneur','5 min',['business','technology'],'video','Listen to customers before choosing a digital tool. A useful catalogue starts with clear names and readable information.'],
  ['pod_teacher','My first year as a teacher','Raahi Stories · Meena','5 min',['teaching'],'podcast','A fictional story about learning to explain one idea at a time and asking for feedback.'],
  ['pod_exam','How I prepared for a government exam','Raahi Stories · Arun','6 min',['government exams'],'podcast','A fictional reflection on making a manageable study routine and checking official notifications.'],
  ['pod_business','Starting a small business from home','Raahi Stories · Sana','5 min',['business'],'podcast','A fictional reflection on observing a need and testing an idea without a large upfront spend.'],
  ['pod_choices',"Choosing a career when I didn’t know what I wanted",'Raahi Stories · Asha','4 min',['technology','design'],'podcast','A fictional story about trying small projects, asking questions and keeping more than one route open.'],
].map(([id,title,speaker,duration,tags,type,text])=>({id,title,speaker,duration,tags,type,text}));
export const mentors = [
  {id:'mentor_meena',type:'mentor',title:'Meena',role:'School teacher',languages:'Hindi, English',tags:['teaching'],text:'Lesson planning, explaining ideas and exploring teaching routes.',availability:'Demo availability'},
  {id:'mentor_sana',type:'mentor',title:'Sana',role:'Local entrepreneur',languages:'Hindi, English',tags:['business','design'],text:'Starting small, talking to customers and building a sample portfolio.',availability:'Demo availability'},
  {id:'mentor_arun',type:'mentor',title:'Arun',role:'Software developer',languages:'Hindi, English',tags:['technology'],text:'Coding foundations, practical projects and study choices.',availability:'Demo availability'},
];
export const posts = [
  {id:'post_cuet',type:'post',title:'Anyone preparing for CUET?',speaker:'A demo student',tags:['teaching','government exams'],text:'I am making a simple subject plan. What would you put in a weekly practice routine?'},
  {id:'post_canva',type:'post',title:'I completed my first Canva project!',speaker:'A demo student',tags:['design','business'],text:'I made a sample poster for a learning group. Using fewer words made it easier to read.'},
  {id:'post_ctet',type:'post',title:'How could I organise CTET resources?',speaker:'A demo student',tags:['teaching','government exams'],text:'I want to start by reading the current official bulletin and making a topic checklist.'},
];
const careerItems = careers.map(c=>({...c,type:'career',text:`Explore ${c.branches?.length || 3} possible routes, useful skills and alternatives.`}));
export const scholarships = [{id:'scholarship_demo',type:'scholarship',title:'Build your scholarship checklist',tags:['teaching','technology','healthcare'],text:'Demo guidance: gather a list of records you may need and discuss verified scholarship sources with a facilitator. This is not an open scholarship.'}];
export const allContent = [...careerItems,...opportunities,...projects,...exams,...stories,...scholarships,...mentors,...posts];
export const findContent = id => allContent.find(item=>item.id===id);
export const emptyStudent = {interests:[],savedIds:[],interestedIds:[],likedIds:[],mentorRequests:[],projectSkills:[],careerId:'',progress:[],pathChanged:false,legacySaved:[]};
export function resolveCareer(value) {const id=typeof value==='string'?value:value?.id;return careers.find(c=>c.id===id) || (id==='agri'?careers.find(c=>c.id==='entrepreneur'):null);}


export const routeDescriptions = {
  'Further study':'Build subject knowledge while comparing study options. Check the requirements of any specific teaching role before choosing a programme.',
  'Teacher training':'Explore how teachers plan lessons, support different learners and practise under supervision. Verify approved qualifications for your intended role.',
  'Explore school roles':'Compare different school roles and read their current official requirements with a facilitator.',
  'Subject study':'Explore a subject in depth and try explaining one small topic to someone else.',
  'Advanced study':'Explore deeper subject study, academic writing and research. Requirements differ across institutions and roles.',
  'Explore academic roles':'Learn about teaching, research and other academic work before comparing actual role requirements.',
  'Choose a subject':'Choose one familiar topic that you would enjoy helping someone understand.',
  'Practise explaining':'Use a short example, let a learner try it, and ask what they found confusing.',
  'Small-group learning':'Explore a supervised practice session with a small group and reflect on their feedback.',
  'Explore approved programmes':'Compare recognised training routes and read current official information with a trusted facilitator.',
  'Supervised training':'Understand what qualified supervision and practical learning involve. This demo does not provide clinical training.',
  'Verify role requirements':'Check current qualifications, registration and other requirements for the specific role.',
  'Compare specialisms':'Find out how different allied-health roles support people and what approved training each needs.',
  'Approved training':'Verify programme recognition and learn about supervised practical experience before making a choice.',
  'Supervised experience':'Ask a qualified professional about safe, appropriate ways to understand the work.',
  'Learn boundaries':'Learn to respect privacy and recognise when a qualified professional must take over.',
  'Support awareness work':'Explore non-clinical communication tasks using sample material and adult supervision.',
  'Explore local roles':'Discuss verified roles, supervision and qualifications; no work is offered by this demo.',
  'Explore study options':'Compare study routes, their learning approach and the work you could practise.',
  'Coding foundations':'Learn to break a problem into steps, practise with small inputs and check your results.',
  'Team projects':'Build a small project together, agree on responsibilities and document what you learned.',
  'Compare practical study':'Compare hands-on learning options and ask how supervised projects and feedback work.',
  'Build a small tool':'Start with one small problem. Make a sample solution and test it using fictional data.',
  'Portfolio':'Collect a small example of your work with a short explanation of the problem, process and learning.',
  'Learn the basics':'Explore a free introductory activity and practise one idea before moving to the next.',
  'Practise offline':'Use paper plans or locally available tools to practise without an internet connection.',
  'Share a working project':'Get permission before sharing a project and ask for specific, useful feedback.',
  'Listen to neighbours':'Ask about a small everyday difficulty without collecting private or financial information.',
  'Test a tiny service':'Sketch a low-cost practice solution using resources you already have; do not promise results.',
  'Collect feedback':'Ask what was useful and what could change. Use the feedback to improve a second draft.',
  'Learn a useful tool':'Practise one useful skill with a locally bundled activity or a free tool.',
  'Make a sample':'Make a fictional example that shows the skill without using anyone’s private information.',
  'Build a portfolio':'Show a small sample, the need it addresses and what you learned while making it.',
  'Understand a need':'Talk about a real problem before choosing a product or service idea.',
  'Test a small batch idea':'Start with a paper plan or prototype and gather feedback before spending money.',
  'Check rules & feedback':'Find out which rules and permissions apply to the activity, and reflect on the feedback.',
};
