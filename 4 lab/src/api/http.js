// Единый HTTP-клиент: JSON, ошибки API и однократное обновление JWT.
export const API_BASE_URL=import.meta.env.VITE_API_BASE_URL||'/api'
let refreshing
const tokens=()=>({accessToken:sessionStorage.getItem('accessToken'),refreshToken:sessionStorage.getItem('refreshToken')})
export function clearHttpSession(){sessionStorage.removeItem('accessToken');sessionStorage.removeItem('refreshToken')}
function error(status,data,message){const e=new Error(data?.error?.message||data?.message||message||'Ошибка запроса');e.status=status||null;e.code=data?.error?.code||'NETWORK_ERROR';e.details=data?.error?.details||{};return e}
async function send(path,options={},retry=true){
 const {method='GET',body,signal,auth=true}=options,headers=new Headers(options.headers||{}),t=tokens()
 if(body!==undefined)headers.set('Content-Type','application/json')
 if(auth&&t.accessToken)headers.set('Authorization','Bearer '+t.accessToken)
 let response
 try{response=await fetch(API_BASE_URL.replace(/\/$/,'')+'/'+path.replace(/^\//,''),{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal})}
 catch(e){if(e.name==='AbortError')throw e;throw error(null,null,'Сервер недоступен')}
 if(response.status===401&&auth&&retry&&!['auth/login','auth/register','auth/refresh','auth/logout'].includes(path.replace(/^\//,''))){
  try{await refresh();return send(path,options,false)}catch(e){clearHttpSession();throw e}
 }
 if(response.status===204)return undefined
 const raw=await response.text();let data=null;try{data=raw?JSON.parse(raw):null}catch{data={message:raw}}
 if(!response.ok)throw error(response.status,data)
 return data
}
async function refresh(){
 if(!refreshing)refreshing=(async()=>{const rt=tokens().refreshToken;if(!rt)throw error(401,null,'Сессия завершена')
 const r=await send('/auth/refresh',{method:'POST',body:{refreshToken:rt},auth:false},false)
 if(!r?.accessToken||!r?.refreshToken)throw error(401,null,'Некорректный ответ refresh')
 sessionStorage.setItem('accessToken',r.accessToken);sessionStorage.setItem('refreshToken',r.refreshToken)})().finally(()=>refreshing=null)
 return refreshing
}
export const request=(path,options={})=>send(path,options)
