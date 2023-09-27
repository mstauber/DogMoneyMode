(()=>{"use strict";class e{static USD="usd";static EUR="eur";static CNY="cny";static JPY="jpy";static GBP="gbp";static INR="inr";static RUB="rub";static getCurrencyBySymbol(e){return e.includes("$")?"usd":e.includes("€")?"eur":e.includes("元")?"cny":e.includes("円")?"jpy":e.includes("£")?"gbp":e.includes("₹")?"inr":!!e.includes("₽")&&"rub"}static getCurrencyRegex(e){let t=null,r=null;switch(e){case"usd":t="$";break;case"eur":t="€";break;case"gbp":t="£";break;case"inr":t="₹";break;case"rub":t="₽";break;case"cny":return t="元".replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),r=`(\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?|\\d*(?:\\.\\d*)?)(${t}\\s*)`,new RegExp(r);case"jpy":return t="円".replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),r=`(\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?|\\d*(?:\\.\\d*)?)(${t}\\s*)`,new RegExp(r);default:return null}return r=`(?<!\\S)(\\${t}\\s*\\d*(?:,\\d{3})*(?:\\.\\d*)?(?!\\S))`,new RegExp(r)}}let t=[];t.push(new class{constructor(){}replace(t,r,n){if(/^(www\.)?amazon\.[a-z\.]{2,5}$/.test(t.location.hostname)){let t=r.querySelectorAll(".a-price"),o=!1;t.forEach((function(t){if(!t.textContent.includes("Ð")){let r=t.querySelector(".a-price-symbol"),a=r?r.textContent:null,c=t.querySelector(".a-offscreen"),i=c?c.textContent:null;if(a&&!o){let t=e.getCurrencyBySymbol(a||i);t&&(o=t)}let l=t.querySelectorAll(".a-price-whole, .a-price-fraction");if(c&&l.length>0){let e=c.textContent.replace(a,"").replace(/,/g,""),t=(parseFloat(e)/parseFloat(n[o])).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2});c.textContent="Ð"+t,r&&(r.textContent="Ð");let[i,s]=t.split(".");l[0].textContent=i+l[0].querySelector(".a-price-decimal").textContent,l[1].textContent=s}}}))}}}),t.push(new class{replace(e,t,r){let n=r.usd;if(/^(www\.)?newegg\.[a-z\.]{2,5}$/.test(e.location.hostname)){let e=t.querySelectorAll(".price-current"),r=t.querySelectorAll(".goods-price-current");e.forEach((function(e){if(!e.textContent.includes("Ð")){let t=e.querySelector("strong"),r=e.querySelector("sup"),o=Array.from(e.childNodes).findIndex((e=>3===e.nodeType&&e.nodeValue.includes("$")));if(t&&r&&o>-1){let a=t.textContent.replace(/,/g,"")+"."+r.textContent.replace(/,/g,""),c=(parseFloat(a)/parseFloat(n)).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}),[i,l]=c.split(".");t.textContent=i,r.textContent=l;let s=e.childNodes[o];s.nodeValue=s.nodeValue.replace(fiat_currency_symbol,"Ð")}}})),r.forEach((function(e){if(!e.textContent.includes("Ð")){let t=e.querySelector(".goods-price-value strong"),r=e.querySelector(".goods-price-value sup"),o=e.querySelector(".goods-price-symbol");if(t&&r){let e=t.textContent.replace(/,/g,"")+"."+r.textContent.replace(/,/g,""),a=(parseFloat(e)/parseFloat(n)).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}),[c,i]=a.split(".");t.textContent=c,r.textContent=i,o&&(o.textContent="Ð")}}}))}}}),t.push(new class{constructor(){this.exchangeRates=null}replace(e,t,r){if(this.exchangeRates=r,!(t.tagName&&"input"===t.tagName.toLowerCase()||t.isContentEditable))if(t.childNodes&&t.childNodes.length>0)Array.from(t.childNodes).forEach((t=>this.replace(e,t,r)));else{let e=this.processMatches(t.textContent,r);e.replaced&&(t.textContent=e.text)}}processMatches(t,r){let n=!1;if(!t)return{text:t,replaced:n};let o=e.getCurrencyBySymbol(t),a=e.getCurrencyRegex(o);if(!o||!a)return{text:t,replaced:n};for(;;){var c=t.match(a,"g");if(!c)break;console.log(a),console.log(t);var i=c.reduce((function(e,t){return e.length>t.length?e:t}));if(1===i.length)break;var l=this.convertToDogecoin(o,i,a,r);if(null!==l){var s={};l<1?(s.minimumFractionDigits=3,s.maximumFractionDigits=3):l<100?(s.minimumFractionDigits=2,s.maximumFractionDigits=2):(s.minimumFractionDigits=0,s.maximumFractionDigits=0);let e=t.indexOf(i);t=e>0&&"-"===t.charAt(e-1)?t.replace(i,` Ð${l.toLocaleString("en-US",s)}`):t.replace(i,`Ð${l.toLocaleString("en-US",s)}`),n=!0}}return{text:t,replaced:n}}convertToDogecoin(t,r,n,o){const a=new RegExp(n.source,n.flags).exec(r);if(!a)return null;let c=0;return[e.CNY,e.JPY].indexOf(t)>-1&&(c=1),parseFloat(a[c].replace(/[^\d.]/g,""))/o[t]}});const r=new class{constructor(){this.localStorageKey="dmm-app-state"}async setAppState(e){const t={};return t[this.localStorageKey]=e,new Promise(((e,r)=>{chrome.storage.local.set(t,(()=>{if(chrome.runtime.lastError)return r(chrome.runtime.lastError);e()}))}))}async getAppState(){return new Promise(((e,t)=>{chrome.storage.local.get(this.localStorageKey,(r=>{if(chrome.runtime.lastError)return t(chrome.runtime.lastError);e(r[this.localStorageKey]||{dogMoneyModeEnabled:!1,comicSansModeEnabled:!1})}))}))}},n=new class{constructor(){this.localStorageKey="dmm-exchange-rates",this.timeToLive=12e4}async _fetchRates(){const e=await fetch("https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=USD,EUR,CNY,JPY,GBP,INR,RUB"),t=(await e.json()).dogecoin,r={updatedOn:Date.now(),rates:t};return new Promise(((e,t)=>{chrome.storage.local.set({[this.localStorageKey]:r},(()=>{if(chrome.runtime.lastError)return t(chrome.runtime.lastError);e(r)}))}))}async getRates(){return new Promise(((e,t)=>{chrome.storage.local.get(this.localStorageKey,(async r=>{let n=r[this.localStorageKey];if(!n||Date.now()-n.updatedOn>this.timeToLive)try{n=await this._fetchRates()}catch(e){return t(e)}e(n.rates)}))}))}};let o=r.getAppState(),a=n.getRates(),c=null;!async function e(){try{clearInterval(c);let i=o;o=await r.getAppState(),o.dogMoneyModeEnabled?(a=await n.getRates(),t.forEach((e=>{e.replace(window,document.body,a)}))):i.dogMoneyModeEnabled&&location.reload(),c=setInterval(e,500)}catch(e){console.error(e)}}()})();