import React,{useRef} from 'react';
import {Link} from 'react-router-dom';
import {Icon} from '../App';
import {careers,lessons} from '../data/demoData';
const labels={career:'Career · Demo guidance',opportunity:'Demo opportunity',project:'Demo community project',exam:'Exam · Demo guidance',video:'Video · Demo story',podcast:'Podcast · Demo episode',mentor:'Demo mentor',post:'Demo student post',scholarship:'Scholarship · Demo guidance'};
export default function ContentCard({item,student,actions,saving}){
  const modal=useRef(null);const saved=student.savedIds.includes(item.id),interested=student.interestedIds.includes(item.id);
  const open=()=>modal.current.showModal();
  const isMedia=['video','podcast'].includes(item.type);
  return <article className={'content-card type-'+item.type} data-content-id={item.id}>
    {isMedia&&<button className="media-placeholder" onClick={open} aria-label={'Open demo '+item.type+': '+item.title}><span className="media-orbit"/><span className="play-symbol">{item.type==='podcast'?'♫':'▷'}</span><span className="media-caption">{item.type==='podcast'?'RAAHI STORIES':'A DIFFERENT KIND OF CLASSROOM'}<small>Demo preview · {item.duration}</small></span></button>}
    <div className="content-body"><span className="content-type">{labels[item.type]}</span><h3>{item.title}</h3><p>{item.text}</p>
      {item.organisation&&<p className="card-meta">{item.organisation} · Fictional</p>}
      {item.mode&&<div className="meta-pills"><span>{item.mode==='local'?'Near your area':item.mode}</span><span>{item.time}</span><span>{item.compensation}</span><span>Beginner</span></div>}
      {isMedia&&<p className="card-meta">{item.speaker} · {item.duration}</p>}
      {item.type==='mentor'&&<p className="card-meta">{item.role} · {item.languages}<br/>{item.availability}</p>}
      {item.type==='project'&&<p className="card-meta">Learn: {item.skills.join(' · ')}<br/>Outcome: {item.outcome}</p>}
      {item.type==='exam'&&<p className="card-meta">Check official source · View roadmap</p>}
      <div className="content-actions"><button className="text-button" onClick={open}>View details <span aria-hidden="true">↗</span></button><button disabled={saving} aria-label={(saved?'Unsave ':'Save ')+item.title} aria-pressed={saved} onClick={()=>actions.saveItem(item)}>{saved?'✓ Saved':'＋ Save'}</button></div>
      <div className="card-secondary">{item.type==='post'?<button disabled={saving} aria-pressed={student.likedIds.includes(item.id)} onClick={()=>actions.like(item)}>{student.likedIds.includes(item.id)?'♥ Liked':'♡ Like'}</button>:<button disabled={saving} aria-pressed={interested} onClick={()=>actions.interest(item)}>{interested?'✓ Interested':item.type==='project'?"I'm interested":'Interested'}</button>}
      {item.type==='project'&&<><button onClick={open}>Skills needed</button><button disabled={saving} onClick={()=>actions.learnProject(item)}>Start learning →</button></>}
      {item.type==='career'&&<Link to={'/explore?career='+item.id}>See routes →</Link>}
      {item.type==='mentor'&&<button disabled={saving} onClick={()=>actions.requestMentor(item)}>{student.mentorRequests.includes(item.id)?'✓ Demo request saved':'Ask for guidance'}</button>}</div>
    </div>
    <dialog ref={modal} className="detail-dialog" aria-labelledby={'detail-'+item.id}><button className="dialog-close" aria-label="Close details" onClick={()=>modal.current.close()}>✕</button><span className="content-type">{labels[item.type]}</span><h2 id={'detail-'+item.id}>{item.title}</h2><p>{item.text}</p>
      {item.type==='exam'?<><h3>Overview</h3><p>{item.audience}. This is a broad exploration prompt, not eligibility advice.</p><h3>Eligibility</h3><p>Check the current official notification for age, education and other conditions. Raahi does not decide eligibility.</p><h3>Syllabus areas · Illustrative</h3><ul>{item.syllabus.map(x=><li key={x}>{x}</li>)}</ul><h3>Preparation roadmap</h3><ol>{item.roadmap.map(x=><li key={x}>{x}</li>)}</ol><h3>Important dates</h3><p>{item.dates}</p><ul>{item.milestones.map(x=><li key={x}>{x}</li>)}</ul><h3>Related careers</h3><p>{careers.filter(c=>c.examIds.includes(item.id)).map(c=>c.title).join(' · ')||'Explore public-service and study routes in Explore.'}</p><h3>Reservation & admission guidance</h3><p>Demo category labels: General, SC, ST, OBC-NCL, EWS and PwD. These labels are not a statement of applicable categories, percentages or eligibility.</p><p>Rules vary by exam, institution, state and year. Always verify the official notification.</p><button className="chip" disabled>Official source · Verify current notification</button><p className="small-note">No verified official URL is included in this demo.</p></>:null}
      {item.type==='project'&&<><h3>Skills needed</h3><ul>{item.lessonIds.map(id=><li key={id}>{lessons[id].title}</li>)}</ul><h3>What you could make</h3><p>{item.outcome}. {item.potential}</p><button className="button" disabled={saving} onClick={()=>{modal.current.close();actions.learnProject(item)}}>Start learning <Icon size={18}/></button></>}
      {item.type==='opportunity'&&<><h3>Explore the role</h3><p>{item.organisation} · Fictional demo organisation<br/>{item.mode} · {item.time} · {item.compensation}<br/>Skills: {item.skills.join(', ')}</p><p>No live application exists. For a real role, verify supervision, age-related rules and compensation with a trusted adult or facilitator.</p><Link className="button" to={'/learn?skill='+item.lesson} onClick={()=>modal.current.close()}>Practise a useful skill <Icon size={18}/></Link></>}
      {isMedia&&<><div className="demo-player"><span>{item.type==='podcast'?'♫':'▷'}</span><strong>Demo {item.type} player</strong><small>{item.duration} · {item.speaker}</small></div><h3>Story notes</h3><p>{item.text}</p><p>No media file is hosted or played. These are fictional learning prompts.</p><Link className="inline-link" to="/learn" onClick={()=>modal.current.close()}>Try a learning activity →</Link></>}
      {item.type==='career'&&<Link className="button" to={'/explore?career='+item.id} onClick={()=>modal.current.close()}>Compare career routes <Icon size={18}/></Link>}
      {item.type==='mentor'&&<><p>{item.languages} · {item.availability}</p><button className="button" disabled={saving} onClick={()=>actions.requestMentor(item)}>{student.mentorRequests.includes(item.id)?'Demo request saved':'Ask for guidance'}</button><p className="small-note">Prototype only. Your interest stays on this device; no request is sent and no booking is made.</p></>}
      {item.type==='scholarship'&&<p>Ask a facilitator to help find a verified notice and check the official application process. There are no dates or awards promised here.</p>}
      {item.type==='post'&&<p>Curated demo discussion. Likes and saves stay on this device; there are no real accounts or messages.</p>}
    </dialog>
  </article>
}
