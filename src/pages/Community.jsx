import React,{useState} from 'react';
import ContentCard from '../components/ContentCard';
import {stories,mentors,posts,rankItems} from '../data/demoData';
export default function Community({profile,student,actions,saving}){
  const [tab,setTab]=useState('people');
  const items=tab==='people'?stories.filter(x=>x.type==='video'):tab==='students'?posts:tab==='mentors'?mentors:stories.filter(x=>x.type==='podcast');
  return <main className="student-page"><div className="eyebrow">YOU DON’T HAVE TO FIGURE IT OUT ALONE</div><h1>A little guidance goes a long way.</h1><p>Learn from different journeys. Find a little of yourself in them.</p><div className="section-tabs" role="group" aria-label="Community sections">{[['people','Learn from people'],['students','Student community'],['mentors','Mentors'],['stories','Raahi Stories']].map(([id,title])=><button className={tab===id?'active':''} key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{title}</button>)}</div>
    <div className="section-intro"><h2>{tab==='people'?'Small stories. New perspectives.':tab==='students'?'A shared starting point.':tab==='mentors'?'Someone to help you think it through.':'Raahi Stories'}</h2><p>{tab==='mentors'?'Demo mentors only. Guidance requests are saved locally and never sent.':tab==='students'?'A curated demo feed. Likes and saves stay with you; no public posts or accounts.':'Fictional learning stories with demo players and readable notes. No video or audio is hosted.'}</p></div>
    <div className={'content-grid '+(tab==='people'?'stories-grid':'')}>{rankItems(items,profile,student.interests).map(item=><ContentCard key={item.id} {...{item,student,actions,saving}}/>)}</div>
  </main>
}
