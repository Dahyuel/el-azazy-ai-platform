'use strict';
const weights={requirements:30,accuracy:25,follow_through:20,communication:15,closure:10};
function scoreHuman(human){
  let applicable=0,assessed=0,total=0;const seen=new Set();
  for(const d of human.dimensions){if(!Object.hasOwn(weights,d.dimension)||seen.has(d.dimension))throw Error('INVALID_DIMENSIONS');seen.add(d.dimension);const w=weights[d.dimension];if(d.assessment==='not_applicable')continue;applicable+=w;if(d.assessment==='assessed'){if(!Number.isInteger(d.rating)||d.rating<0||d.rating>4||!d.evidence.length)throw Error('INVALID_RATING');assessed+=w;total+=w*d.rating/4}else if(d.rating!==null)throw Error('UNSUPPORTED_RATING')}
  const coverage=applicable?assessed/applicable:0;
  return {agent_id:human.agent_id,score:coverage>=.6&&assessed?Math.round(total/assessed*100):null,coverage,weights_version:'draft-v1'};
}
module.exports={scoreHuman};
