'use strict';
function validateAIReview(review,messages,redact=x=>String(x||'')){
  const ai=messages.filter(m=>m.sender_type==='User'&&Number(m.sender_id)===2&&m.message_type===1&&!m.private);
  const ids=new Set(ai.map(m=>Number(m.id)));
  const covered=new Set(review.covered_message_ids);
  if(covered.size!==ids.size||review.covered_message_ids.length!==ids.size||[...covered].some(id=>!ids.has(id)))throw Error('INVALID_AI_COVERAGE');
  if((!ids.size&&(review.status!=='no_ai_replies'||review.issues.length))||(ids.size&&review.status==='no_ai_replies'))throw Error('INVALID_AI_STATUS');
  for(const issue of review.issues){
    if(!ids.has(issue.ai_message_id)||!issue.evidence.some(e=>e.message_id===issue.ai_message_id&&e.quote.trim()))throw Error('INVALID_AI_ATTRIBUTION');
    for(const e of issue.evidence){const m=messages.find(m=>Number(m.id)===e.message_id);if(!m||!e.quote.trim()||!redact(m.content).includes(e.quote))throw Error('INVALID_AI_EVIDENCE')}
  }
  return true;
}
module.exports={validateAIReview};
