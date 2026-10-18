import React,{useEffect,useRef,useState} from 'react';
import {Link,NavLink,Navigate,Route,Routes,useLocation,useNavigate} from 'react-router-dom';
import {read,save,saveMany,saveOnboarding,clearAllRaahiData} from './db';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import ForYou from './pages/ForYou';
import Explore from './pages/Explore';
import Learn from './pages/Learn';
import Earn from './pages/Earn';
import Community from './pages/Community';
import BottomNav,{studentTabs} from './components/BottomNav';
import {allContent,emptyStudent,interestOptions,resolveCareer} from './data/demoData';
export function Icon({name='arrow',size=24}){const paths={arrow:'M5 12h14m-6-6 6 6-6 6',compass:'m16 8-3 5-5 3 3-5 5-3M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',book:'M12 6v15m0-15C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2',sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',people:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3m20 0v-3a4 4 0 0 0-3-4M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m3-3a4 4 0 0 1 0 8',check:'m5 12 4 4L19 6',mic:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0zm-3 6v1a6 6 0 0 0 12 0v-1m-6 7v4m-3 0h6',leaf:'M20 3C9 2 2 9 6 16s16 0 14-13ZM5 20 15 9',wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0m-3 4h.01'};return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.arrow}/></svg>}
export default function App(){
  const [profile,setProfile]=useState(null),[ready,setReady]=useState(false),[error,setError]=useState('');
  const [online,setOnline]=useState(navigator.onLine),[reconnected,setReconnected]=useState(false),[language,setLanguage]=useState('en');
  const [student,setStudent]=useState(emptyStudent),[saving,setSaving]=useState(false),[notice,setNotice]=useState('');
  const saveLock=useRef(false),noticeTimer=useRef(null);
  const location=useLocation(),navigate=useNavigate();
  const resetRequested=location.pathname==='/onboarding'&&new URLSearchParams(location.search).get('reset')==='true';
  const studentPage=['/dashboard','/for-you','/explore','/learn','/earn','/community','/settings'].includes(location.pathname);
  useEffect(()=>{
    let active=true;setReady(false);
    async function load(){
      try{
        const [savedProfile,conversation,extra,career,progress,savedProjects,savedOpportunities]=await Promise.all([
          read('profile'),read('onboarding'),read('studentExperience',{}),read('selectedCareer'),read('learningProgress',[]),read('savedProjects',[]),read('savedOpportunities',[])]);
        if(resetRequested)await clearAllRaahiData();
        if(!active)return;
        setProfile(resetRequested?null:savedProfile);
        const oldSaves=[...savedProjects.map(item=>({...item,legacyKind:'project'})),...savedOpportunities.map(item=>({...item,legacyKind:'opportunity'}))];
        setStudent(resetRequested?emptyStudent:{...emptyStudent,...extra,careerId:resolveCareer(career)?.id||'',progress,
          savedIds:[...new Set([...(extra.savedIds||[]),...oldSaves.map(x=>x.id)])],legacySaved:oldSaves.filter(x=>!allContent.some(item=>item.id===x.id))});
        setLanguage(previous=>conversation?.language||savedProfile?.language||previous);setError('');
        if(resetRequested)navigate('/onboarding',{replace:true});
      }catch{if(active)setError('Device storage is unavailable. Please enable browser storage and reload to try again.');}
      finally{if(active)setReady(true);}
    }
    load();return()=>{active=false};
  },[resetRequested]);
  useEffect(()=>{const on=()=>{setOnline(true);setReconnected(true)},off=()=>{setOnline(false);setReconnected(false)};window.addEventListener('online',on);window.addEventListener('offline',off);return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);clearTimeout(noticeTimer.current)}},[]);
  useEffect(()=>{window.scrollTo(0,0);document.documentElement.lang=language},[location.pathname,language]);
  function showNotice(text){setNotice(text);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),5000)}
  function resetStudent(){setProfile(null);setStudent(emptyStudent);setNotice('');setError('');navigate('/onboarding',{replace:true});}
  async function updateProfile(value,conversation){if(conversation)await saveOnboarding(conversation);else await save('profile',value);setProfile(value)}
  async function updateStudent(patch,message='Saved on this device.'){
    if(saveLock.current)return false;
    saveLock.current=true;setSaving(true);
    try{
      const next={...student,...patch};
      const {careerId,progress,legacySaved,...extra}=next;
      const records={studentExperience:extra};
      if(Object.hasOwn(patch,'careerId'))records.selectedCareer=resolveCareer(careerId);
      if(Object.hasOwn(patch,'progress'))records.learningProgress=progress;
      if(Object.hasOwn(patch,'savedIds')){
        records.savedProjects=[...legacySaved.filter(x=>x.legacyKind==='project'),...allContent.filter(x=>x.type==='project'&&next.savedIds.includes(x.id))];
        records.savedOpportunities=[...legacySaved.filter(x=>x.legacyKind==='opportunity'),...allContent.filter(x=>x.type==='opportunity'&&next.savedIds.includes(x.id))];
      }
      await saveMany(records);setStudent(next);showNotice(message);return true;
    }catch{showNotice('Could not save that change. Please try again.');return false;}
    finally{saveLock.current=false;setSaving(false)}
  }
  const actions={
    update:updateStudent,
    addInterest:label=>updateStudent({interests:[...new Set([...student.interests,label])],pathChanged:true},'Your interests are saved. Your picks have been updated.'),
    saveItem:item=>updateStudent({savedIds:student.savedIds.includes(item.id)?student.savedIds.filter(id=>id!==item.id):[...student.savedIds,item.id]}),
    interest:item=>updateStudent({interestedIds:[...new Set([...student.interestedIds,item.id])],interests:[...new Set([...student.interests,...item.tags.map(tag=>interestOptions.find(label=>label.toLowerCase()===tag)||tag)])],pathChanged:true},"We’ll show you more opportunities like this."),
    like:item=>updateStudent({likedIds:student.likedIds.includes(item.id)?student.likedIds.filter(id=>id!==item.id):[...student.likedIds,item.id]}),
    selectCareer:career=>updateStudent({careerId:career.id,pathChanged:Boolean(student.careerId&&student.careerId!==career.id)},'Your direction is saved. Explore your learning path next.'),
    completeSkill:id=>updateStudent({progress:[...new Set([...student.progress,'skill:'+id])]},'One small step forward. Your progress is saved.'),
    learnProject:async item=>{if(await updateStudent({projectSkills:[...new Set([...student.projectSkills,...item.lessonIds])],savedIds:[...new Set([...student.savedIds,item.id])],pathChanged:true},'Project skills added to your learning path.'))navigate('/learn?project='+item.id)},
    requestMentor:item=>updateStudent({mentorRequests:[...new Set([...student.mentorRequests,item.id])]},'Demo request saved on this device. Nothing was sent to a mentor.'),
  };
  const shared={profile,student,actions,saving};
  const studentScreen=Component=>profile?<Component {...shared}/>:<main className="student-page"><h1>Your story starts here.</h1><p>Talk to Raahi to build your own starting point.</p><Link className="button" to="/onboarding">Start My Journey →</Link></main>;
  return <><header className={'header '+(studentPage?'student-header':'')}><Link className="brand" to={profile&&studentPage?'/dashboard':'/'} aria-label="Raahi home"><span className="brand-mark">r<span>✦</span></span>raahi<span className="brand-dot">.</span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{studentPage?studentTabs.map(([path,label])=><NavLink key={path} to={path}>{label}</NavLink>):<><NavLink to="/" end>Home</NavLink><NavLink to="/explore">Discover</NavLink><NavLink to="/learn">Learn</NavLink><NavLink to="/earn">Opportunities</NavLink></>}</nav>
    <div className="header-actions">{studentPage?<><span className="header-companion">Your journey companion</span><Link to="/settings" className="student-avatar" aria-label="Profile and settings">{profile?.name?.[0]?.toUpperCase()||'R'}</Link></>:<><div className="language" aria-label="Language"><button className={language==='en'?'selected':''} onClick={()=>setLanguage('en')}>EN</button><span>/</span><button className={language==='hi'?'selected':''} onClick={()=>setLanguage('hi')}>हिन्दी</button></div><Link className="header-start" to={profile?'/dashboard':'/onboarding'}>{profile?'My dashboard':'Get started'} <Icon size={16}/></Link></>}</div></header>
    <div className={'connection '+(!online?'offline':'')} role="status"><span className="status-dot"/>{online?(reconnected?'Back online • Ready to sync':'Online • Made for wherever you are'):studentPage?"You’re offline. Your saved journey is still available.":'Offline • Your progress is saved'}</div>
    {error&&<p role="alert" className="error">{error}</p>}
    {!ready||resetRequested?<main className="page">{error?'Could not open your journey. Please reload to try again.':'Opening your journey…'}</main>:<Routes>
      <Route path="/" element={<Landing profile={profile} language={language}/>}/>
      <Route path="/onboarding" element={<Onboarding profile={profile} onSave={updateProfile} language={language} setLanguage={setLanguage}/>}/>
      <Route path="/profile" element={<Onboarding profile={profile} onSave={updateProfile} language={language} setLanguage={setLanguage}/>}/>
      <Route path="/dashboard" element={studentScreen(ForYou)}/><Route path="/for-you" element={<Navigate replace to="/dashboard"/>}/>
      <Route path="/explore" element={studentScreen(Explore)}/><Route path="/learn" element={studentScreen(Learn)}/><Route path="/earn" element={studentScreen(Earn)}/><Route path="/community" element={studentScreen(Community)}/>
      <Route path="/settings" element={<Dashboard profile={profile} onReset={resetStudent}/>}/>
      <Route path="/future" element={<Navigate replace to="/explore"/>}/><Route path="/journey" element={<Navigate replace to="/learn"/>}/><Route path="/opportunities" element={<Navigate replace to="/earn"/>}/><Route path="/projects" element={<Navigate replace to="/earn"/>}/>
      <Route path="/facilitator" element={<Placeholder kind="facilitator" profile={profile} online={online}/>}/>
      <Route path="*" element={<main className="page"><h1>A new turn in the road.</h1><Link className="button" to={profile?'/dashboard':'/'}>Back to your journey <Icon/></Link></main>}/>
    </Routes>}
    {notice&&<div className="student-toast" role="status">{notice}</div>}
    <footer className={studentPage?'student-footer':''}><Link className="footer-brand" to="/">raahi.</Link><span>Small steps. Real possibilities.</span><span className="footer-note"><Icon name="leaf" size={15}/> Rooted in you. Ready for tomorrow.</span></footer>
    {studentPage&&<BottomNav/>}
  </>
}
