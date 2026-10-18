import React,{useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {Icon} from '../App';
import ContentCard from '../components/ContentCard';
import {allContent,interestOptions,profileTags,rankItems,careers} from '../data/demoData';
export default function ForYou({profile,student,actions,saving}){
  const tags=profileTags(profile,student.interests);const [focus,setFocus]=useState(''),[savedOnly,setSavedOnly]=useState(false);const add=useRef(null);
  const ranked=rankItems(allContent,profile,[...student.interests,...(focus?[focus]:[])]);
  const types=['career','opportunity','exam','project','video','scholarship','podcast'];
  const feed=savedOnly?ranked.filter(x=>student.savedIds.includes(x.id)):types.map(type=>ranked.find(x=>x.type===type)).filter(Boolean);
  const career=careers.find(c=>c.id===student.careerId);
  return <main className="student-page for-you"><div className="student-welcome"><div><div className="eyebrow">YOUR NEXT CHAPTER</div><h1>Namaste, {profile.name}<span className="welcome-sun">✦</span></h1><p>Where do you want to go next?</p></div><span className="welcome-leaf"><Icon name="leaf" size={38}/></span></div>
    <div className="mini-journey" aria-label="Your journey">{['Discover ✓','Explore','Learn','Experience','Opportunity'].map((x,i)=><span className={i===0?'done':''} key={x}>{x}{i<4&&<b>›</b>}</span>)}</div>
    <section className="next-step-banner"><div><span className="content-type">SMALL STEPS, REAL POSSIBILITIES</span><h2>{career?'Keep growing as a '+career.title.toLowerCase():'A future that feels like you.'}</h2><p>{career?'Your saved learning path is ready when you are.':'Try a path. Learn something. See what opens up.'}</p></div><Link className="button" to={career?'/learn':'/explore'}>{career?'Continue learning':'Explore my future'}<Icon size={18}/></Link></section>
    <div className="feed-heading"><div><h2>Picked for your journey</h2><p>Based on your interests, experience and goals.</p></div><button className="chip" aria-pressed={savedOnly} onClick={()=>setSavedOnly(!savedOnly)}>{savedOnly?'Show all':'Saved ('+student.savedIds.length+')'}</button></div>
    <div className="interest-scroll" aria-label="Interest topics">{interestOptions.map(label=><button key={label} className={'interest-chip '+(focus===label?'active':tags.includes(label.toLowerCase())?'relevant':'')} aria-pressed={focus===label} onClick={()=>setFocus(focus===label?'':label)}>{tags.includes(label.toLowerCase())&&<span>✓ </span>}{label}</button>)}<button className="interest-chip add-interest" onClick={()=>add.current.showModal()}>＋ Add interest</button></div>
    <p className="small-note">Curated demo content · Recommendations and your actions work offline.</p>
    <div className="content-grid">{feed.map(item=><ContentCard key={item.id} {...{item,student,actions,saving}}/>)}</div>{!feed.length&&<div className="empty-state"><Icon name="book" size={30}/><h3>Your saved opportunities will appear here.</h3><p>Tap Save on a card to keep it for later.</p></div>}
    <Link className="text-button reset-demo settings-link" to="/settings">Profile & demo settings</Link>
    <dialog ref={add} className="detail-dialog" aria-labelledby="add-interest-title"><button className="dialog-close" aria-label="Close interests" onClick={()=>add.current.close()}>✕</button><span className="content-type">MAKE THIS JOURNEY YOURS</span><h2 id="add-interest-title">What else are you curious about?</h2><p>Choose an interest. Your picks stay on this device.</p><div className="interest-options">{interestOptions.map(label=><button className="chip" key={label} disabled={saving} aria-pressed={student.interests.includes(label)} onClick={async()=>{if(await actions.addInterest(label)){setFocus(label);add.current.close()}}}>{student.interests.includes(label)?'✓ ': '＋ '}{label}</button>)}</div></dialog>
  </main>
}
