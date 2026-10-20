import {mkdir,writeFile} from 'node:fs/promises';
import {readP2pBuyRate} from './p2p-rate.mjs';
try {
 const rate=await readP2pBuyRate();
 if(!Number.isFinite(rate.egpPerUsdt)||rate.egpPerUsdt<=1||rate.egpPerUsdt>=1000)throw Error('Invalid market price');
 const output={asset:'USDT',fiat:'EGP',side:'BUY',egpPerUsdt:rate.egpPerUsdt,quotedAt:new Date(rate.checkedAt).toISOString(),source:rate.source||'Binance P2P BUY USDT/EGP',sampleSize:rate.sampleSize||null};
 await mkdir('data',{recursive:true});await writeFile('data/rate.json',JSON.stringify(output,null,2)+'\n');
 console.log('Fresh public USDT/EGP BUY reference recorded at '+output.quotedAt);
}catch{console.error('No valid fresh price. Previous data was left unchanged.');process.exitCode=1}
