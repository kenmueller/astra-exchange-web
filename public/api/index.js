!function(e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).exchange=e()}(function(){return function e(t,r,n){function o(i,a){if(!r[i]){if(!t[i]){var u="function"==typeof require&&require;if(!a&&u)return u(i,!0);if(s)return s(i,!0);var c=new Error("Cannot find module '"+i+"'");throw c.code="MODULE_NOT_FOUND",c}var f=r[i]={exports:{}};t[i][0].call(f.exports,function(e){return o(t[i][1][e]||e)},f,f.exports,e,t,r,n)}return r[i].exports}for(var s="function"==typeof require&&require,i=0;i<n.length;i++)o(n[i]);return o}({1:[function(e,t,r){function n(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function s(e){if(f===setTimeout)return setTimeout(e,0);if((f===n||!f)&&setTimeout)return f=setTimeout,setTimeout(e,0);try{return f(e,0)}catch(t){try{return f.call(null,e,0)}catch(t){return f.call(this,e,0)}}}function i(){m&&d&&(m=!1,d.length?h=d.concat(h):g=-1,h.length&&a())}function a(){if(!m){var e=s(i);m=!0;for(var t=h.length;t;){for(d=h,h=[];++g<t;)d&&d[g].run();g=-1,t=h.length}d=null,m=!1,function(e){if(l===clearTimeout)return clearTimeout(e);if((l===o||!l)&&clearTimeout)return l=clearTimeout,clearTimeout(e);try{l(e)}catch(t){try{return l.call(null,e)}catch(t){return l.call(this,e)}}}(e)}}function u(e,t){this.fun=e,this.array=t}function c(){}var f,l,p=t.exports={};!function(){try{f="function"==typeof setTimeout?setTimeout:n}catch(e){f=n}try{l="function"==typeof clearTimeout?clearTimeout:o}catch(e){l=o}}();var d,h=[],m=!1,g=-1;p.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];h.push(new u(e,t)),1!==h.length||m||s(a)},u.prototype.run=function(){this.fun.apply(null,this.array)},p.title="browser",p.browser=!0,p.env={},p.argv=[],p.version="",p.versions={},p.on=c,p.addListener=c,p.once=c,p.off=c,p.removeListener=c,p.removeAllListeners=c,p.emit=c,p.prependListener=c,p.prependOnceListener=c,p.listeners=function(e){return[]},p.binding=function(e){throw new Error("process.binding is not supported")},p.cwd=function(){return"/"},p.chdir=function(e){throw new Error("process.chdir is not supported")},p.umask=function(){return 0}},{}],2:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});class n{constructor(e,t){this.toJSON=(()=>({status:this.status,message:this.message})),this.toString=(()=>JSON.stringify(this.toJSON())),this.status=e,this.message=t}}r.default=n,n.fromJSON=(e=>{if("object"!=typeof e)return;const{status:t,message:r}=e;return void 0===t||void 0===r?void 0:new n(t,r)}),n.fromString=(e=>n.fromJSON(JSON.stringify(e)))},{}],3:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.checkPin=(e=>"string"==typeof e&&/^\d{4}$/.test(e)),r.cloudFunctionUrl=(e=>`https://us-central1-astra-exchange.cloudfunctions.net/${e}`)},{}],4:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const n=e(".");r.default=class{constructor(e,t,r,o){this.send=(e=>n.transactFromTransaction(this,e)),this.from=e,this.to=t,this.amount=r,this.message=o}}},{".":7}],5:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.default=class{constructor(e,t,r,n,o){this.from=e,this.to=t,this.amount=r,this.message=n,this.time=o}}},{}],6:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const n=e("."),o=e("./Helpers");r.default=class{constructor(e,t,r,s,i,a){this.transactions=(()=>this.pin?n.transactions(this.id,this.pin):Promise.resolve(void 0)),this.reload=(()=>n.userWithId(this.id,this.pin).then(e=>(this.name=e.name,this.email=e.email,this.balance=e.balance,this.reputation=e.reputation,this))),this.id=e,this.name=t,this.email=r,this.balance=s,this.reputation=i,this.pin=o.checkPin(a)&&a||void 0,this.hasPrivateData=void 0!==this.pin}}},{".":7,"./Helpers":3}],7:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const n=e("axios"),o=e("./ExchangeError");r.ExchangeError=o.default;const s=e("./TransactionRecord");r.TransactionRecord=s.default;const i=e("./User");r.User=i.default;const a=e("./Transaction");r.Transaction=a.default;const u=e("./Helpers");r.users=(()=>n.default.get(u.cloudFunctionUrl("users")).then(e=>e.data.map(e=>new i.default(e.id,e.name,e.email,e.balance,e.reputation,e.pin)))),r.transact=((e,t,r,i,a)=>u.checkPin(e)?n.default.get(u.cloudFunctionUrl(`transact?pin=${e}&from=${t}&to=${r}&amount=${i}${a?`&message=${a}`:""}`)).then(e=>{switch(e.status){case 200:return Promise.resolve(new s.default(t,r,i,a||"",new Date));case 400:return Promise.reject(new o.default(400,"Invalid parameters"));case 404:return Promise.reject(new o.default(404,"Invalid user ID"));case 403:return Promise.reject(new o.default(403,"Insufficient balance"));case 401:return Promise.reject(new o.default(401,"Invalid pin"));default:return Promise.reject(new o.default(500,"Unknown error. Please try again"))}}):Promise.reject(new o.default(400,"`pin` must be 4 characters long and be composed of only integers"))),r.transactFromTransaction=((e,t)=>r.transact(t,e.from,e.to,e.amount,e.message)),r.userWithId=((e,t)=>t&&!u.checkPin(t)?Promise.reject(new o.default(400,"`pin` must be 4 characters long and be composed of only integers")):n.default.get(u.cloudFunctionUrl(`user?id=${e}${t?`&pin=${t}`:""}`)).then(e=>{const{status:t,data:r}=e;switch(t){case 200:return new i.default(r.id,r.name,r.email,r.balance,r.reputation,r.pin);case 400:return Promise.reject(new o.default(400,"Invalid parameters"));case 404:return Promise.reject(new o.default(404,"Invalid user ID"));case 401:return Promise.reject(new o.default(401,"Invalid pin"));default:return Promise.reject(new o.default(500,"Unknown error. Please try again"))}})),r.userWithEmail=((e,t)=>t&&!u.checkPin(t)?Promise.reject(new o.default(400,"`pin` must be 4 characters long and be composed of only integers")):n.default.get(u.cloudFunctionUrl(`user?email=${e}${t?`&pin=${t}`:""}`)).then(e=>{const{status:t,data:r}=e;switch(t){case 200:return new i.default(r.id,r.name,r.email,r.balance,r.reputation,r.pin);case 400:return Promise.reject(new o.default(400,"Invalid parameters"));case 404:return Promise.reject(new o.default(404,"Invalid email"));case 401:return Promise.reject(new o.default(401,"Invalid pin"));default:return Promise.reject(new o.default(500,"Unknown error. Please try again"))}})),r.transactions=((e,t)=>u.checkPin(t)?n.default.get(u.cloudFunctionUrl(`transactions?id=${e}&pin=${t}`)).then(e=>{const{status:t,data:r}=e;switch(t){case 200:return r.map(e=>new s.default(e.from,e.to,e.amount,e.message,new Date(Date.parse(e.time))));case 400:return Promise.reject(new o.default(400,"Invalid parameters"));case 404:return Promise.reject(new o.default(404,"Invalid user ID"));case 401:return Promise.reject(new o.default(401,"Invalid pin"));default:return Promise.reject(new o.default(500,"Unknown error. Please try again"))}}):Promise.reject(new o.default(400,"`pin` must be 4 characters long and be composed of only integers")))},{"./ExchangeError":2,"./Helpers":3,"./Transaction":4,"./TransactionRecord":5,"./User":6,axios:8}],8:[function(e,t,r){t.exports=e("./lib/axios")},{"./lib/axios":10}],9:[function(e,t,r){"use strict";var n=e("./../utils"),o=e("./../core/settle"),s=e("./../helpers/buildURL"),i=e("./../helpers/parseHeaders"),a=e("./../helpers/isURLSameOrigin"),u=e("../core/createError");t.exports=function(t){return new Promise(function(r,c){var f=t.data,l=t.headers;n.isFormData(f)&&delete l["Content-Type"];var p=new XMLHttpRequest;if(t.auth){var d=t.auth.username||"",h=t.auth.password||"";l.Authorization="Basic "+btoa(d+":"+h)}if(p.open(t.method.toUpperCase(),s(t.url,t.params,t.paramsSerializer),!0),p.timeout=t.timeout,p.onreadystatechange=function(){if(p&&4===p.readyState&&(0!==p.status||p.responseURL&&0===p.responseURL.indexOf("file:"))){var e="getAllResponseHeaders"in p?i(p.getAllResponseHeaders()):null,n={data:t.responseType&&"text"!==t.responseType?p.response:p.responseText,status:p.status,statusText:p.statusText,headers:e,config:t,request:p};o(r,c,n),p=null}},p.onabort=function(){p&&(c(u("Request aborted",t,"ECONNABORTED",p)),p=null)},p.onerror=function(){c(u("Network Error",t,null,p)),p=null},p.ontimeout=function(){c(u("timeout of "+t.timeout+"ms exceeded",t,"ECONNABORTED",p)),p=null},n.isStandardBrowserEnv()){var m=e("./../helpers/cookies"),g=(t.withCredentials||a(t.url))&&t.xsrfCookieName?m.read(t.xsrfCookieName):void 0;g&&(l[t.xsrfHeaderName]=g)}if("setRequestHeader"in p&&n.forEach(l,function(e,t){void 0===f&&"content-type"===t.toLowerCase()?delete l[t]:p.setRequestHeader(t,e)}),t.withCredentials&&(p.withCredentials=!0),t.responseType)try{p.responseType=t.responseType}catch(e){if("json"!==t.responseType)throw e}"function"==typeof t.onDownloadProgress&&p.addEventListener("progress",t.onDownloadProgress),"function"==typeof t.onUploadProgress&&p.upload&&p.upload.addEventListener("progress",t.onUploadProgress),t.cancelToken&&t.cancelToken.promise.then(function(e){p&&(p.abort(),c(e),p=null)}),void 0===f&&(f=null),p.send(f)})}},{"../core/createError":16,"./../core/settle":20,"./../helpers/buildURL":24,"./../helpers/cookies":26,"./../helpers/isURLSameOrigin":28,"./../helpers/parseHeaders":30,"./../utils":32}],10:[function(e,t,r){"use strict";function n(e){var t=new i(e),r=s(i.prototype.request,t);return o.extend(r,i.prototype,t),o.extend(r,t),r}var o=e("./utils"),s=e("./helpers/bind"),i=e("./core/Axios"),a=e("./core/mergeConfig"),u=n(e("./defaults"));u.Axios=i,u.create=function(e){return n(a(u.defaults,e))},u.Cancel=e("./cancel/Cancel"),u.CancelToken=e("./cancel/CancelToken"),u.isCancel=e("./cancel/isCancel"),u.all=function(e){return Promise.all(e)},u.spread=e("./helpers/spread"),t.exports=u,t.exports.default=u},{"./cancel/Cancel":11,"./cancel/CancelToken":12,"./cancel/isCancel":13,"./core/Axios":14,"./core/mergeConfig":19,"./defaults":22,"./helpers/bind":23,"./helpers/spread":31,"./utils":32}],11:[function(e,t,r){"use strict";function n(e){this.message=e}n.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},n.prototype.__CANCEL__=!0,t.exports=n},{}],12:[function(e,t,r){"use strict";function n(e){if("function"!=typeof e)throw new TypeError("executor must be a function.");var t;this.promise=new Promise(function(e){t=e});var r=this;e(function(e){r.reason||(r.reason=new o(e),t(r.reason))})}var o=e("./Cancel");n.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},n.source=function(){var e;return{token:new n(function(t){e=t}),cancel:e}},t.exports=n},{"./Cancel":11}],13:[function(e,t,r){"use strict";t.exports=function(e){return!(!e||!e.__CANCEL__)}},{}],14:[function(e,t,r){"use strict";function n(e){this.defaults=e,this.interceptors={request:new i,response:new i}}var o=e("./../utils"),s=e("../helpers/buildURL"),i=e("./InterceptorManager"),a=e("./dispatchRequest"),u=e("./mergeConfig");n.prototype.request=function(e){"string"==typeof e?(e=arguments[1]||{}).url=arguments[0]:e=e||{},(e=u(this.defaults,e)).method=e.method?e.method.toLowerCase():"get";var t=[a,void 0],r=Promise.resolve(e);for(this.interceptors.request.forEach(function(e){t.unshift(e.fulfilled,e.rejected)}),this.interceptors.response.forEach(function(e){t.push(e.fulfilled,e.rejected)});t.length;)r=r.then(t.shift(),t.shift());return r},n.prototype.getUri=function(e){return e=u(this.defaults,e),s(e.url,e.params,e.paramsSerializer).replace(/^\?/,"")},o.forEach(["delete","get","head","options"],function(e){n.prototype[e]=function(t,r){return this.request(o.merge(r||{},{method:e,url:t}))}}),o.forEach(["post","put","patch"],function(e){n.prototype[e]=function(t,r,n){return this.request(o.merge(n||{},{method:e,url:t,data:r}))}}),t.exports=n},{"../helpers/buildURL":24,"./../utils":32,"./InterceptorManager":15,"./dispatchRequest":17,"./mergeConfig":19}],15:[function(e,t,r){"use strict";function n(){this.handlers=[]}var o=e("./../utils");n.prototype.use=function(e,t){return this.handlers.push({fulfilled:e,rejected:t}),this.handlers.length-1},n.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null)},n.prototype.forEach=function(e){o.forEach(this.handlers,function(t){null!==t&&e(t)})},t.exports=n},{"./../utils":32}],16:[function(e,t,r){"use strict";var n=e("./enhanceError");t.exports=function(e,t,r,o,s){var i=new Error(e);return n(i,t,r,o,s)}},{"./enhanceError":18}],17:[function(e,t,r){"use strict";function n(e){e.cancelToken&&e.cancelToken.throwIfRequested()}var o=e("./../utils"),s=e("./transformData"),i=e("../cancel/isCancel"),a=e("../defaults"),u=e("./../helpers/isAbsoluteURL"),c=e("./../helpers/combineURLs");t.exports=function(e){return n(e),e.baseURL&&!u(e.url)&&(e.url=c(e.baseURL,e.url)),e.headers=e.headers||{},e.data=s(e.data,e.headers,e.transformRequest),e.headers=o.merge(e.headers.common||{},e.headers[e.method]||{},e.headers||{}),o.forEach(["delete","get","head","post","put","patch","common"],function(t){delete e.headers[t]}),(e.adapter||a.adapter)(e).then(function(t){return n(e),t.data=s(t.data,t.headers,e.transformResponse),t},function(t){return i(t)||(n(e),t&&t.response&&(t.response.data=s(t.response.data,t.response.headers,e.transformResponse))),Promise.reject(t)})}},{"../cancel/isCancel":13,"../defaults":22,"./../helpers/combineURLs":25,"./../helpers/isAbsoluteURL":27,"./../utils":32,"./transformData":21}],18:[function(e,t,r){"use strict";t.exports=function(e,t,r,n,o){return e.config=t,r&&(e.code=r),e.request=n,e.response=o,e.isAxiosError=!0,e.toJSON=function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:this.config,code:this.code}},e}},{}],19:[function(e,t,r){"use strict";var n=e("../utils");t.exports=function(e,t){t=t||{};var r={};return n.forEach(["url","method","params","data"],function(e){void 0!==t[e]&&(r[e]=t[e])}),n.forEach(["headers","auth","proxy"],function(o){n.isObject(t[o])?r[o]=n.deepMerge(e[o],t[o]):void 0!==t[o]?r[o]=t[o]:n.isObject(e[o])?r[o]=n.deepMerge(e[o]):void 0!==e[o]&&(r[o]=e[o])}),n.forEach(["baseURL","transformRequest","transformResponse","paramsSerializer","timeout","withCredentials","adapter","responseType","xsrfCookieName","xsrfHeaderName","onUploadProgress","onDownloadProgress","maxContentLength","validateStatus","maxRedirects","httpAgent","httpsAgent","cancelToken","socketPath"],function(n){void 0!==t[n]?r[n]=t[n]:void 0!==e[n]&&(r[n]=e[n])}),r}},{"../utils":32}],20:[function(e,t,r){"use strict";var n=e("./createError");t.exports=function(e,t,r){var o=r.config.validateStatus;!o||o(r.status)?e(r):t(n("Request failed with status code "+r.status,r.config,null,r.request,r))}},{"./createError":16}],21:[function(e,t,r){"use strict";var n=e("./../utils");t.exports=function(e,t,r){return n.forEach(r,function(r){e=r(e,t)}),e}},{"./../utils":32}],22:[function(e,t,r){(function(r){"use strict";function n(e,t){!s.isUndefined(e)&&s.isUndefined(e["Content-Type"])&&(e["Content-Type"]=t)}var o,s=e("./utils"),i=e("./helpers/normalizeHeaderName"),a={"Content-Type":"application/x-www-form-urlencoded"},u={adapter:(void 0!==r&&"[object process]"===Object.prototype.toString.call(r)?o=e("./adapters/http"):"undefined"!=typeof XMLHttpRequest&&(o=e("./adapters/xhr")),o),transformRequest:[function(e,t){return i(t,"Accept"),i(t,"Content-Type"),s.isFormData(e)||s.isArrayBuffer(e)||s.isBuffer(e)||s.isStream(e)||s.isFile(e)||s.isBlob(e)?e:s.isArrayBufferView(e)?e.buffer:s.isURLSearchParams(e)?(n(t,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):s.isObject(e)?(n(t,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e)}catch(e){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:"application/json, text/plain, */*"}}};s.forEach(["delete","get","head"],function(e){u.headers[e]={}}),s.forEach(["post","put","patch"],function(e){u.headers[e]=s.merge(a)}),t.exports=u}).call(this,e("_process"))},{"./adapters/http":9,"./adapters/xhr":9,"./helpers/normalizeHeaderName":29,"./utils":32,_process:1}],23:[function(e,t,r){"use strict";t.exports=function(e,t){return function(){for(var r=new Array(arguments.length),n=0;n<r.length;n++)r[n]=arguments[n];return e.apply(t,r)}}},{}],24:[function(e,t,r){"use strict";function n(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var o=e("./../utils");t.exports=function(e,t,r){if(!t)return e;var s;if(r)s=r(t);else if(o.isURLSearchParams(t))s=t.toString();else{var i=[];o.forEach(t,function(e,t){null!=e&&(o.isArray(e)?t+="[]":e=[e],o.forEach(e,function(e){o.isDate(e)?e=e.toISOString():o.isObject(e)&&(e=JSON.stringify(e)),i.push(n(t)+"="+n(e))}))}),s=i.join("&")}if(s){var a=e.indexOf("#");-1!==a&&(e=e.slice(0,a)),e+=(-1===e.indexOf("?")?"?":"&")+s}return e}},{"./../utils":32}],25:[function(e,t,r){"use strict";t.exports=function(e,t){return t?e.replace(/\/+$/,"")+"/"+t.replace(/^\/+/,""):e}},{}],26:[function(e,t,r){"use strict";var n=e("./../utils");t.exports=n.isStandardBrowserEnv()?{write:function(e,t,r,o,s,i){var a=[];a.push(e+"="+encodeURIComponent(t)),n.isNumber(r)&&a.push("expires="+new Date(r).toGMTString()),n.isString(o)&&a.push("path="+o),n.isString(s)&&a.push("domain="+s),!0===i&&a.push("secure"),document.cookie=a.join("; ")},read:function(e){var t=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return t?decodeURIComponent(t[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5)}}:{write:function(){},read:function(){return null},remove:function(){}}},{"./../utils":32}],27:[function(e,t,r){"use strict";t.exports=function(e){return/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)}},{}],28:[function(e,t,r){"use strict";var n=e("./../utils");t.exports=n.isStandardBrowserEnv()?function(){function e(e){var t=e;return r&&(o.setAttribute("href",t),t=o.href),o.setAttribute("href",t),{href:o.href,protocol:o.protocol?o.protocol.replace(/:$/,""):"",host:o.host,search:o.search?o.search.replace(/^\?/,""):"",hash:o.hash?o.hash.replace(/^#/,""):"",hostname:o.hostname,port:o.port,pathname:"/"===o.pathname.charAt(0)?o.pathname:"/"+o.pathname}}var t,r=/(msie|trident)/i.test(navigator.userAgent),o=document.createElement("a");return t=e(window.location.href),function(r){var o=n.isString(r)?e(r):r;return o.protocol===t.protocol&&o.host===t.host}}():function(){return!0}},{"./../utils":32}],29:[function(e,t,r){"use strict";var n=e("../utils");t.exports=function(e,t){n.forEach(e,function(r,n){n!==t&&n.toUpperCase()===t.toUpperCase()&&(e[t]=r,delete e[n])})}},{"../utils":32}],30:[function(e,t,r){"use strict";var n=e("./../utils"),o=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"];t.exports=function(e){var t,r,s,i={};return e?(n.forEach(e.split("\n"),function(e){if(s=e.indexOf(":"),t=n.trim(e.substr(0,s)).toLowerCase(),r=n.trim(e.substr(s+1)),t){if(i[t]&&o.indexOf(t)>=0)return;i[t]="set-cookie"===t?(i[t]?i[t]:[]).concat([r]):i[t]?i[t]+", "+r:r}}),i):i}},{"./../utils":32}],31:[function(e,t,r){"use strict";t.exports=function(e){return function(t){return e.apply(null,t)}}},{}],32:[function(e,t,r){"use strict";function n(e){return"[object Array]"===c.call(e)}function o(e){return null!==e&&"object"==typeof e}function s(e){return"[object Function]"===c.call(e)}function i(e,t){if(null!=e)if("object"!=typeof e&&(e=[e]),n(e))for(var r=0,o=e.length;r<o;r++)t.call(null,e[r],r,e);else for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.call(null,e[s],s,e)}var a=e("./helpers/bind"),u=e("is-buffer"),c=Object.prototype.toString;t.exports={isArray:n,isArrayBuffer:function(e){return"[object ArrayBuffer]"===c.call(e)},isBuffer:u,isFormData:function(e){return"undefined"!=typeof FormData&&e instanceof FormData},isArrayBufferView:function(e){return"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&e.buffer instanceof ArrayBuffer},isString:function(e){return"string"==typeof e},isNumber:function(e){return"number"==typeof e},isObject:o,isUndefined:function(e){return void 0===e},isDate:function(e){return"[object Date]"===c.call(e)},isFile:function(e){return"[object File]"===c.call(e)},isBlob:function(e){return"[object Blob]"===c.call(e)},isFunction:s,isStream:function(e){return o(e)&&s(e.pipe)},isURLSearchParams:function(e){return"undefined"!=typeof URLSearchParams&&e instanceof URLSearchParams},isStandardBrowserEnv:function(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product&&"NativeScript"!==navigator.product&&"NS"!==navigator.product)&&"undefined"!=typeof window&&"undefined"!=typeof document},forEach:i,merge:function e(){function t(t,n){"object"==typeof r[n]&&"object"==typeof t?r[n]=e(r[n],t):r[n]=t}for(var r={},n=0,o=arguments.length;n<o;n++)i(arguments[n],t);return r},deepMerge:function e(){function t(t,n){"object"==typeof r[n]&&"object"==typeof t?r[n]=e(r[n],t):r[n]="object"==typeof t?e({},t):t}for(var r={},n=0,o=arguments.length;n<o;n++)i(arguments[n],t);return r},extend:function(e,t,r){return i(t,function(t,n){e[n]=r&&"function"==typeof t?a(t,r):t}),e},trim:function(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")}}},{"./helpers/bind":23,"is-buffer":33}],33:[function(e,t,r){t.exports=function(e){return null!=e&&null!=e.constructor&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)}},{}]},{},[7])(7)});