let p2pCache=null,p2pFlight=null,p2pFailure='not_checked',p2pRetryAt=0;
export async function checkP2pSource(){try{const r=await readP2pBuyRate();return {available:true,egpPerUsdt:r.egpPerUsdt,checkedAt:r.checkedAt,source:r.source||'Binance P2P BUY USDT/EGP'}}catch{return {available:false,reason:p2pFailure}}}
export async function readPublicP2pAds(){
 const r=await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({asset:'USDT',fiat:'EGP',tradeType:'BUY',page:1,rows:20,payTypes:['Vodafonecash','InstaPay'],publisherType:null}),redirect:'manual',signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error('ads_http_'+r.status);const q=await r.json();if(q.success!==true||q.code!=='000000'||!Array.isArray(q.data))throw Error('ads_invalid_response');
 const prices=q.data.filter(x=>{const a=x.adv,b=x.advertiser,p=Number(a?.price);return a?.asset==='USDT'&&a?.fiatUnit==='EGP'&&p>1&&p<1000&&Number(b?.monthOrderCount)>=50&&Number(b?.monthFinishRate)>=0.98&&Number(a.minSingleTransAmount)<=1000&&Number(a.dynamicMaxSingleTransAmount||a.maxSingleTransAmount)>=1000&&Number(a.tradableQuantity||a.surplusAmount)>=1000/p&&a.tradeMethods?.some(m=>['Vodafonecash','InstaPay'].includes(m.identifier))}).map(x=>Number(x.adv.price)).sort((a,b)=>a-b);
 if(prices.length<3)throw Error('ads_insufficient_eligible_offers');const mid=Math.floor(prices.length/2),price=prices.length%2?prices[mid]:(prices[mid-1]+prices[mid])/2;
 return {egpPerUsdt:price,checkedAt:Date.now(),source:'Binance P2P BUY median · Vodafone Cash/InstaPay · 1000 EGP reference',sampleSize:prices.length};
}
export async function readP2pBuyRate(){
 if(p2pCache&&Date.now()-p2pCache.checkedAt<60000)return p2pCache;
 if(p2pFlight)return p2pFlight;
 if(Date.now()<p2pRetryAt)throw Error('p2p_source_unavailable');
 p2pFlight=(async()=>{
  p2pFailure='connection_failed';
  const r=await fetch('https://www.binance.com/bapi/c2c/v1/public/c2c/agent/quote-price?fiat=EGP&asset=USDT&tradeType=BUY',{headers:{'User-Agent':'binance-wallet/1.0.0 (Skill)','Accept':'application/json'},redirect:'manual',signal:AbortSignal.timeout(8000)});
  p2pFailure='source_http_'+r.status;
  if(!r.ok){const detail=(await r.text()).slice(0,3000);if(/restricted location|not available in your (country|region)|prohibited jurisdiction/i.test(detail)){p2pFailure='restricted_location';throw Error('restricted_location')}throw Error('p2p_source_unavailable')}
  p2pFailure='invalid_json';
  const q=await r.json(),d=q?.data;
  p2pFailure='invalid_p2p_rate';
  if(q.success!==true||q.code!=='000000'||d?.asset!=='USDT'||d?.fiat!=='EGP'||!Number.isFinite(d.price)||d.price<=1||d.price>=1000)throw Error('invalid_p2p_rate');
  p2pFailure=null;p2pCache={egpPerUsdt:d.price,checkedAt:Date.now()};return p2pCache;
 })();try{const result=await p2pFlight;p2pRetryAt=0;return result}catch(e){if(p2pFailure!=='restricted_location')try{p2pCache=await readPublicP2pAds();p2pFailure=null;p2pRetryAt=0;return p2pCache}catch(adsError){p2pFailure=adsError.message}p2pRetryAt=Date.now()+60000;throw e}finally{p2pFlight=null}
}

