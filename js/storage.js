// Everything the user earns lives in one localStorage entry.
const KFStore=(()=>{
  const KEY='keyflow.v1';
  const fresh=()=>({name:'Musician',goal:20,volume:0.7,seconds:0,notes:0,days:{},lessons:[],songs:[],best:{},streak:0,lastDay:'',lastLesson:null,achieved:[]});
  let s;
  try{s={...fresh(),...JSON.parse(localStorage.getItem(KEY))}}catch(e){s=fresh()}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
  return{get:()=>s,save,reset(){s=fresh();save()}};
})();
