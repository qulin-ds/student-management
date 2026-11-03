// RxJS-поиск студентов с debounce, отменой запросов и обработкой ошибок.
import {Observable,Subject,EMPTY} from 'rxjs'
import {debounceTime,distinctUntilChanged,switchMap,catchError,finalize} from 'rxjs/operators'
import {onUnmounted,ref} from 'vue'
export function useStudentSearch(searchFn){
 const query=ref({}),pending=ref(false),error=ref(null),results=ref(null),changes=new Subject()
 const sub=changes.pipe(debounceTime(300),distinctUntilChanged((a,b)=>JSON.stringify(a)===JSON.stringify(b)),switchMap(filters=>new Observable(observer=>{
  const controller=new AbortController();pending.value=true;error.value=null
  Promise.resolve(searchFn(filters,controller.signal)).then(v=>{observer.next(v);observer.complete()}).catch(e=>{if(e.name==='AbortError')observer.complete();else observer.error(e)})
  return()=>controller.abort()
 }).pipe(catchError(e=>{error.value=e;return EMPTY}),finalize(()=>{pending.value=false})))).subscribe(v=>{results.value=v})
 function setQuery(value){query.value={...value};changes.next(query.value)}
 onUnmounted(()=>{sub.unsubscribe();changes.complete()})
 return{query,pending,error,results,setQuery}
}
