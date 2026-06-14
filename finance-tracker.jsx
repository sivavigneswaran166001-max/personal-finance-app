import { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const C = {
  bg:"#0F172A", panel:"#1E293B", border:"#334155",
  emerald:"#10B981", rose:"#F43F5E", amber:"#F59E0B",
  sky:"#38BDF8", violet:"#8B5CF6", text:"#F1F5F9", muted:"#94A3B8", card:"#243044"
};
const PIE_COLORS = ["#10B981","#38BDF8","#8B5CF6","#F59E0B","#F43F5E","#06B6D4","#EC4899","#84CC16"];
const EXPENSE_CATS = ["Food","Fuel","Shopping","Rent","Groceries","Entertainment","Medical","Travel","Utilities","Education","EMI Payment","Other"];
const INCOME_SRCS  = ["Salary","Freelance","Interest","Refund","Gift","Dividend","Rental","Business","Other"];
const ASSET_CATS   = ["Cash","Bank","Gold","Stocks","Mutual Funds","Property","Crypto","Vehicle","Other"];
const ACCT_TYPES   = ["Cash","Savings","Current","UPI","Wallet","Fixed Deposit"];
const TX_TYPES     = ["Income","Expense","Transfer","Loan Received","Loan Repayment","Debt Given","Debt Received","EMI Payment","Investment","Asset Purchase","Asset Sale"];
const PLAN_FREQ    = ["Monthly","Weekly","One-time"];

const fmt      = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n||0);
const fmtS     = n => { const a=Math.abs(n||0); if(a>=1e7) return `₹${(n/1e7).toFixed(2)}Cr`; if(a>=1e5) return `₹${(n/1e5).toFixed(2)}L`; if(a>=1e3) return `₹${(n/1e3).toFixed(1)}K`; return `₹${n||0}`; };
const today    = () => new Date().toISOString().slice(0,10);
const mkKey    = d => d?.slice(0,7);
const thisMo   = () => today().slice(0,7);
const daysLeft = d => Math.ceil((new Date(d)-new Date())/86400000);
const uid      = () => `${Date.now()}${Math.random().toString(36).slice(2,6)}`;
const isPos    = t => ["Income","Loan Received","Debt Received"].includes(t);
const isNeg    = t => ["Expense","EMI Payment","Loan Repayment","Debt Given","Investment","Asset Purchase"].includes(t);

// ─── DEMO DATA ───────────────────────────────────────────────────────────────
const DEMO = {
  accounts:[
    {id:"a1",name:"Cash Wallet",type:"Cash",balance:8500},
    {id:"a2",name:"SBI Savings",type:"Savings",balance:45000},
    {id:"a3",name:"HDFC Savings",type:"Savings",balance:82000},
    {id:"a4",name:"GPay/UPI",type:"UPI",balance:3200},
  ],
  transactions:[
    {id:"t1",date:"2026-06-01",account:"a2",type:"Income",category:"Salary",description:"June Salary – Chemplast Sanmar",amount:52000},
    {id:"t2",date:"2026-06-02",account:"a1",type:"Expense",category:"Groceries",description:"Big Bazaar monthly groceries",amount:3200},
    {id:"t3",date:"2026-06-03",account:"a4",type:"Expense",category:"Fuel",description:"Petrol for bike",amount:650},
    {id:"t4",date:"2026-06-05",account:"a2",type:"EMI Payment",category:"EMI Payment",description:"Two-wheeler loan EMI – HDFC",amount:3500},
    {id:"t5",date:"2026-06-07",account:"a3",type:"Expense",category:"Rent",description:"House rent June",amount:8000},
    {id:"t6",date:"2026-06-08",account:"a4",type:"Expense",category:"Food",description:"Swiggy dinner",amount:850},
    {id:"t7",date:"2026-06-10",account:"a1",type:"Income",category:"Freelance",description:"Process doc consulting fee",amount:5000},
    {id:"t8",date:"2026-06-11",account:"a4",type:"Expense",category:"Entertainment",description:"Amazon Prime renewal",amount:299},
    {id:"t9",date:"2026-06-12",account:"a4",type:"Expense",category:"Medical",description:"Pharmacy – protein & vitamins",amount:1200},
    {id:"t10",date:"2026-06-13",account:"a2",type:"Income",category:"Interest",description:"SBI savings interest",amount:380},
    {id:"t11",date:"2026-05-01",account:"a2",type:"Income",category:"Salary",description:"May Salary – Chemplast Sanmar",amount:52000},
    {id:"t12",date:"2026-05-05",account:"a2",type:"EMI Payment",category:"EMI Payment",description:"Two-wheeler loan EMI – HDFC",amount:3500},
    {id:"t13",date:"2026-05-10",account:"a1",type:"Expense",category:"Shopping",description:"New work clothes – Karaikal",amount:4500},
    {id:"t14",date:"2026-05-15",account:"a3",type:"Expense",category:"Rent",description:"House rent May",amount:8000},
    {id:"t15",date:"2026-05-20",account:"a4",type:"Expense",category:"Travel",description:"IRCTC – Tambaram–Karaikal",amount:890},
    {id:"t16",date:"2026-04-01",account:"a2",type:"Income",category:"Salary",description:"April Salary",amount:52000},
    {id:"t17",date:"2026-04-05",account:"a2",type:"EMI Payment",category:"EMI Payment",description:"Two-wheeler loan EMI",amount:3500},
    {id:"t18",date:"2026-04-12",account:"a1",type:"Expense",category:"Food",description:"Tirupati prasad & meals",amount:1800},
    {id:"t19",date:"2026-03-01",account:"a2",type:"Income",category:"Salary",description:"March Salary",amount:48000},
    {id:"t20",date:"2026-03-05",account:"a2",type:"EMI Payment",category:"EMI Payment",description:"Two-wheeler loan EMI",amount:3500},
  ],
  loans:[
    {id:"l1",name:"Two-wheeler Loan",lender:"HDFC Bank",originalAmount:85000,interestRate:10.5,emi:3500,dueDate:5,outstandingAmount:52000,startDate:"2024-01-05",endDate:"2027-01-05",status:"Active"},
    {id:"l2",name:"Personal Loan",lender:"IDFC First Bank",originalAmount:150000,interestRate:13.5,emi:6200,dueDate:15,outstandingAmount:98000,startDate:"2024-06-15",endDate:"2027-06-15",status:"Active"},
  ],
  debts:{
    iOwe:[{id:"d1",person:"Karthik (colleague)",amount:2000,dueDate:"2026-07-01",status:"Pending",notes:"Borrowed for grocery run"}],
    owedToMe:[
      {id:"d2",person:"Rajan Anna",amount:5000,dueDate:"2026-06-20",status:"Pending",notes:"Lent for wedding gift"},
      {id:"d3",person:"Muthu",amount:1500,dueDate:"2026-07-10",status:"Pending",notes:"Small help"},
    ]
  },
  assets:[
    {id:"as1",name:"SBI MF – Nifty 50",category:"Mutual Funds",currentValue:35000,purchaseValue:28000,purchaseDate:"2023-06-01",notes:"SIP ₹2000/month"},
    {id:"as2",name:"Gold (10g)",category:"Gold",currentValue:65000,purchaseValue:50000,purchaseDate:"2022-01-01",notes:"Stored at home"},
    {id:"as3",name:"TVS Apache (2022)",category:"Vehicle",currentValue:80000,purchaseValue:95000,purchaseDate:"2022-03-01",notes:"Daily commute"},
    {id:"as4",name:"Zerodha Stocks",category:"Stocks",currentValue:22000,purchaseValue:18000,purchaseDate:"2024-01-01",notes:"HDFC Bank, TCS"},
  ],
  // Planning module: expected incomes & expenses
  planning:{
    expectedIncome:[
      {id:"pi1",label:"Monthly Salary",amount:52000,frequency:"Monthly",category:"Salary",notes:"Chemplast Sanmar"},
      {id:"pi2",label:"SIP Interest",amount:400,frequency:"Monthly",category:"Interest",notes:"Estimated"},
    ],
    expectedExpense:[
      {id:"pe1",label:"House Rent",amount:8000,frequency:"Monthly",category:"Rent",notes:""},
      {id:"pe2",label:"Groceries",amount:3500,frequency:"Monthly",category:"Groceries",notes:""},
      {id:"pe3",label:"Fuel",amount:800,frequency:"Monthly",category:"Fuel",notes:"Bike petrol"},
      {id:"pe4",label:"Two-wheeler EMI",amount:3500,frequency:"Monthly",category:"EMI Payment",notes:"HDFC Bank"},
      {id:"pe5",label:"Personal Loan EMI",amount:6200,frequency:"Monthly",category:"EMI Payment",notes:"IDFC First Bank"},
    ]
  }
};

const EMPTY = {accounts:[],transactions:[],loans:[],debts:{iOwe:[],owedToMe:[]},assets:[],planning:{expectedIncome:[],expectedExpense:[]}};

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const LS_KEY = "financeOS_v2";
const load = () => { try { const r=localStorage.getItem(LS_KEY); if(r){ const d=JSON.parse(r); if(!d.planning) d.planning={expectedIncome:[],expectedExpense:[]}; return d; } } catch{} return DEMO; };
const save = d => { try { localStorage.setItem(LS_KEY,JSON.stringify(d)); } catch{} };

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Badge({children,color="emerald"}){
  const m={emerald:"bg-emerald-900/50 text-emerald-400",rose:"bg-rose-900/50 text-rose-400",amber:"bg-amber-900/50 text-amber-400",sky:"bg-sky-900/50 text-sky-400",violet:"bg-violet-900/50 text-violet-400",muted:"bg-slate-700 text-slate-400"};
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[color]||m.muted}`}>{children}</span>;
}

function StatCard({label,value,sub,color="text-slate-100",icon}){
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span style={{color:C.muted}} className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon&&<span className="text-xl">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
      {sub&&<div className="text-xs" style={{color:C.muted}}>{sub}</div>}
    </div>
  );
}

function Modal({title,onClose,children}){
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.75)"}}>
      <div style={{background:C.panel,border:`1px solid ${C.border}`,maxHeight:"90vh"}} className="rounded-2xl w-full max-w-lg overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b" style={{borderColor:C.border}}>
          <h3 className="font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Inp({label,...p}){
  return(
    <div className="flex flex-col gap-1">
      {label&&<label className="text-xs font-medium" style={{color:C.muted}}>{label}</label>}
      <input {...p} style={{background:C.bg,border:`1px solid ${C.border}`,color:C.text}} className="rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"/>
    </div>
  );
}

function Sel({label,children,...p}){
  return(
    <div className="flex flex-col gap-1">
      {label&&<label className="text-xs font-medium" style={{color:C.muted}}>{label}</label>}
      <select {...p} style={{background:C.bg,border:`1px solid ${C.border}`,color:C.text}} className="rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500">{children}</select>
    </div>
  );
}

function Btn({children,onClick,color="emerald",className="",disabled}){
  const m={emerald:"bg-emerald-600 hover:bg-emerald-500",rose:"bg-rose-600 hover:bg-rose-500",amber:"bg-amber-600 hover:bg-amber-500",sky:"bg-sky-600 hover:bg-sky-500",slate:"bg-slate-700 hover:bg-slate-600",violet:"bg-violet-600 hover:bg-violet-500"};
  return <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${m[color]||m.slate} ${disabled?"opacity-50 cursor-not-allowed":""} ${className}`}>{children}</button>;
}

// Inline delete confirmation — no confirm() dialog needed
function DeleteConfirm({onConfirm,onCancel}){
  return(
    <div className="flex items-center gap-2">
      <span className="text-xs text-rose-300">Sure?</span>
      <button onClick={onConfirm} className="px-2 py-1 rounded text-xs bg-rose-600 hover:bg-rose-500 text-white">Yes</button>
      <button onClick={onCancel} className="px-2 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 text-white">No</button>
    </div>
  );
}

function ActionBtns({onEdit, onDelete}){
  const [confirming,setConfirming] = useState(false);
  return confirming
    ? <DeleteConfirm onConfirm={onDelete} onCancel={()=>setConfirming(false)}/>
    : <div className="flex items-center gap-2">
        <button onClick={onEdit} style={{background:C.panel,border:`1px solid ${C.border}`}} className="px-2 py-1 rounded text-xs text-sky-400 hover:text-sky-300 transition-colors">✏️</button>
        <button onClick={()=>setConfirming(true)} style={{background:C.panel,border:`1px solid ${C.border}`}} className="px-2 py-1 rounded text-xs text-rose-400 hover:text-rose-300 transition-colors">🗑</button>
      </div>;
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function TT({active,payload,label}){
  if(!active||!payload?.length) return null;
  return <div style={{background:C.panel,border:`1px solid ${C.border}`,padding:"10px",borderRadius:8}}>
    <p style={{color:C.muted,fontSize:12,marginBottom:4}}>{label}</p>
    {payload.map(p=><p key={p.name} style={{color:p.color,fontSize:13}}>{p.name}: {fmt(p.value)}</p>)}
  </div>;
}

// ─── TRANSACTION FORM ────────────────────────────────────────────────────────
function TxForm({data,onSave,onClose,defaultType,existing}){
  const isEdit=!!existing;
  const [f,setF]=useState(existing
    ?{...existing,amount:String(existing.amount)}
    :{date:today(),account:data.accounts[0]?.id||"",type:defaultType||"Expense",category:"Food",description:"",amount:""});

  const cats = ["Expense","EMI Payment"].includes(f.type)?EXPENSE_CATS:f.type==="Income"?INCOME_SRCS:ASSET_CATS;

  const doSave=()=>{
    if(!f.amount||!f.description) return;
    const amt=parseFloat(f.amount)||0;
    if(isEdit){
      const oldAmt=existing.amount, oldAcc=existing.account, newAcc=f.account;
      const accounts=data.accounts.map(a=>{
        let b=a.balance;
        if(a.id===oldAcc){ if(isPos(existing.type)) b-=oldAmt; else if(isNeg(existing.type)) b+=oldAmt; }
        if(a.id===newAcc){ if(isPos(f.type)) b+=amt; else if(isNeg(f.type)) b-=amt; }
        return {...a,balance:b};
      });
      onSave({...data,accounts,transactions:data.transactions.map(t=>t.id===existing.id?{...f,id:existing.id,amount:amt}:t)});
    } else {
      const tx={...f,id:uid(),amount:amt};
      const accounts=data.accounts.map(a=>{
        if(a.id!==f.account) return a;
        if(isPos(f.type)) return {...a,balance:a.balance+amt};
        if(isNeg(f.type)) return {...a,balance:a.balance-amt};
        return a;
      });
      onSave({...data,accounts,transactions:[...data.transactions,tx]});
    }
  };

  return(
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Inp label="Date" type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/>
        <Sel label="Account" value={f.account} onChange={e=>setF({...f,account:e.target.value})}>
          {data.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </Sel>
      </div>
      <Sel label="Type" value={f.type} onChange={e=>setF({...f,type:e.target.value,category:""})}>
        {TX_TYPES.map(t=><option key={t}>{t}</option>)}
      </Sel>
      <Sel label="Category" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
        {cats.map(c=><option key={c}>{c}</option>)}
      </Sel>
      <Inp label="Description" value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="What was this for?"/>
      <Inp label="Amount (₹)" type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} placeholder="0"/>
      <div className="flex gap-2 justify-end">
        <Btn color="slate" onClick={onClose}>Cancel</Btn>
        <Btn onClick={doSave} color={f.type==="Income"?"emerald":"rose"}>{isEdit?"Save Changes":"Add Transaction"}</Btn>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({data}){
  const {accounts,transactions,loans,debts,assets,planning}=data;
  const totalCash=accounts.reduce((s,a)=>s+a.balance,0);
  const totalAssets=assets.reduce((s,a)=>s+a.currentValue,0)+totalCash;
  const totalLoans=loans.reduce((s,l)=>s+l.outstandingAmount,0);
  const totalIOwe=debts.iOwe.filter(d=>d.status==="Pending").reduce((s,d)=>s+d.amount,0);
  const totalOwedMe=debts.owedToMe.filter(d=>d.status==="Pending").reduce((s,d)=>s+d.amount,0);
  const netWorth=totalAssets+totalOwedMe-totalLoans-totalIOwe;

  const cm=thisMo();
  const cmTx=transactions.filter(t=>mkKey(t.date)===cm);
  const monthIncome=cmTx.filter(t=>t.type==="Income").reduce((s,t)=>s+t.amount,0);
  const monthExpense=cmTx.filter(t=>["Expense","EMI Payment"].includes(t.type)).reduce((s,t)=>s+t.amount,0);
  const monthEMI=loans.filter(l=>l.status==="Active").reduce((s,l)=>s+l.emi,0);

  // Planning totals
  const expIncome=planning?.expectedIncome?.reduce((s,p)=>s+p.amount,0)||0;
  const expExpense=planning?.expectedExpense?.reduce((s,p)=>s+p.amount,0)||0;
  const expSavings=expIncome-expExpense;

  const months=[];
  for(let i=5;i>=0;i--){
    const d=new Date(); d.setMonth(d.getMonth()-i);
    const mk=d.toISOString().slice(0,7);
    const lbl=d.toLocaleString("en-IN",{month:"short"});
    const inc=transactions.filter(t=>mkKey(t.date)===mk&&t.type==="Income").reduce((s,t)=>s+t.amount,0);
    const exp=transactions.filter(t=>mkKey(t.date)===mk&&["Expense","EMI Payment"].includes(t.type)).reduce((s,t)=>s+t.amount,0);
    months.push({month:lbl,Income:inc,Expense:exp,Savings:Math.max(0,inc-exp)});
  }

  const catSpend={};
  cmTx.filter(t=>t.type==="Expense").forEach(t=>{catSpend[t.category]=(catSpend[t.category]||0)+t.amount;});
  const catData=Object.entries(catSpend).map(([n,v])=>({name:n,value:v}));

  const allocData=Object.entries(
    [...assets.map(a=>({cat:a.category,v:a.currentValue})),...accounts.map(a=>({cat:a.type,v:a.balance}))]
      .reduce((o,{cat,v})=>({...o,[cat]:(o[cat]||0)+v}),{})
  ).map(([name,value])=>({name,value}));

  const alerts=[];
  loans.filter(l=>l.status==="Active").forEach(l=>{
    const d=new Date(); d.setDate(l.dueDate);
    const dl=daysLeft(d.toISOString().slice(0,10));
    if(dl<=7) alerts.push({type:"warning",msg:`${l.name} EMI of ${fmt(l.emi)} due in ${dl} days`});
  });
  debts.iOwe.filter(d=>d.status==="Pending"&&daysLeft(d.dueDate)<=7).forEach(d=>{
    alerts.push({type:"danger",msg:`You owe ${d.person} ${fmt(d.amount)} — due in ${daysLeft(d.dueDate)} days`});
  });
  accounts.filter(a=>a.balance<2000).forEach(a=>{
    alerts.push({type:"warning",msg:`Low balance in ${a.name}: ${fmt(a.balance)}`});
  });

  return(
    <div className="space-y-6">
      {alerts.length>0&&<div className="space-y-2">
        {alerts.map((a,i)=>(
          <div key={i} className={`rounded-lg px-4 py-3 text-sm flex items-center gap-3 ${a.type==="danger"?"bg-rose-900/40 text-rose-300 border border-rose-800":"bg-amber-900/40 text-amber-300 border border-amber-800"}`}>
            {a.type==="danger"?"🚨":"⚠️"} {a.msg}
          </div>
        ))}
      </div>}

      <div style={{background:"linear-gradient(135deg,#0f2a1a 0%,#0F172A 50%,#1a1030 100%)",border:`1px solid ${C.border}`}} className="rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span style={{color:C.muted}} className="text-xs uppercase tracking-widest font-medium">Net Worth</span>
        </div>
        <div className="text-4xl font-bold text-emerald-400 tabular-nums">{fmt(netWorth)}</div>
        <div className="mt-3 flex gap-6 text-sm">
          <span style={{color:C.muted}}>Assets <span className="text-emerald-400 font-semibold">{fmtS(totalAssets+totalOwedMe)}</span></span>
          <span style={{color:C.muted}}>Liabilities <span className="text-rose-400 font-semibold">{fmtS(totalLoans+totalIOwe)}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Cash & Bank" value={fmtS(totalCash)} sub={`${accounts.length} accounts`} color="text-sky-400" icon="🏦"/>
        <StatCard label="Total Assets" value={fmtS(totalAssets)} sub="Incl. investments" color="text-violet-400" icon="📈"/>
        <StatCard label="Liabilities" value={fmtS(totalLoans+totalIOwe)} sub={`${loans.filter(l=>l.status==="Active").length} active loans`} color="text-rose-400" icon="💳"/>
        <StatCard label="This Month Income" value={fmtS(monthIncome)} sub="Actual received" color="text-emerald-400" icon="💰"/>
        <StatCard label="This Month Expense" value={fmtS(monthExpense)} sub="Actual spent" color="text-rose-400" icon="🛒"/>
        <StatCard label="EMI This Month" value={fmtS(monthEMI)} sub="Total obligation" color="text-amber-400" icon="📅"/>
      </div>

      {/* Monthly Plan vs Actual */}
      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">This Month — Plan vs Actual</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {label:"Expected Income",plan:expIncome,actual:monthIncome,color:"text-emerald-400",good:v=>v>=0},
            {label:"Expected Expense",plan:expExpense,actual:monthExpense,color:"text-rose-400",good:v=>v<=0},
            {label:"Expected Savings",plan:expSavings,actual:monthIncome-monthExpense,color:"text-sky-400",good:v=>v>=0},
          ].map(({label,plan,actual,color,good})=>{
            const diff=actual-plan;
            return(
              <div key={label} className="flex flex-col gap-1">
                <div className="text-xs" style={{color:C.muted}}>{label}</div>
                <div className={`text-lg font-bold tabular-nums ${color}`}>{fmt(actual)}</div>
                <div className="text-xs" style={{color:C.muted}}>Plan: {fmt(plan)}</div>
                <div className={`text-xs font-medium ${good(diff)?"text-emerald-400":"text-rose-400"}`}>
                  {diff>=0?"+":""}{fmt(diff)} vs plan
                </div>
                <div className="h-1.5 rounded-full mt-1" style={{background:C.border}}>
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{width:`${Math.min(100,(actual/Math.max(plan,1))*100).toFixed(0)}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">6-Month Cash Flow</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={months} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtS}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="Income" fill={C.emerald} radius={[4,4,0,0]}/>
              <Bar dataKey="Expense" fill={C.rose} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={allocData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                {allocData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8}}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11,color:C.muted}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {catData.length>0&&<div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Spending by Category — This Month</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={catData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
            <XAxis type="number" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtS}/>
            <YAxis dataKey="name" type="category" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} width={90}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8}}/>
            <Bar dataKey="value" radius={[0,4,4,0]}>{catData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}

      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {[...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(t=>(
            <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{borderColor:C.border}}>
              <div className="flex items-center gap-3">
                <div style={{background:C.panel}} className="w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  {t.type==="Income"?"💰":t.type==="Expense"?"🛒":t.type==="EMI Payment"?"📅":"🔄"}
                </div>
                <div>
                  <div className="text-sm text-slate-200">{t.description}</div>
                  <div className="text-xs" style={{color:C.muted}}>{t.date} • {t.category}</div>
                </div>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${isPos(t.type)?"text-emerald-400":"text-rose-400"}`}>
                {isPos(t.type)?"+":"-"}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
function AccountsView({data,setData}){
  const [showAdd,setShowAdd]=useState(false);
  const [editAcc,setEditAcc]=useState(null);
  const [showTransfer,setShowTransfer]=useState(false);
  const BLANK={name:"",type:"Savings",balance:""};
  const [f,setF]=useState(BLANK);
  const [tf,setTf]=useState({from:"",to:"",amount:""});

  const addAcc=()=>{
    if(!f.name) return;
    const nd={...data,accounts:[...data.accounts,{...f,id:uid(),balance:parseFloat(f.balance)||0}]};
    setData(nd);save(nd);setShowAdd(false);setF(BLANK);
  };
  const openEdit=a=>{ setEditAcc(a); setF({name:a.name,type:a.type,balance:String(a.balance)}); };
  const saveEdit=()=>{
    const nd={...data,accounts:data.accounts.map(a=>a.id===editAcc.id?{...a,name:f.name,type:f.type,balance:parseFloat(f.balance)||0}:a)};
    setData(nd);save(nd);setEditAcc(null);setF(BLANK);
  };
  const delAcc=id=>{
    const nd={...data,accounts:data.accounts.filter(a=>a.id!==id)};
    setData(nd);save(nd);
  };
  const doTransfer=()=>{
    const amt=parseFloat(tf.amount)||0;
    if(!amt||!tf.from||!tf.to||tf.from===tf.to) return;
    const toName=data.accounts.find(a=>a.id===tf.to)?.name||"";
    const frName=data.accounts.find(a=>a.id===tf.from)?.name||"";
    const accounts=data.accounts.map(a=>a.id===tf.from?{...a,balance:a.balance-amt}:a.id===tf.to?{...a,balance:a.balance+amt}:a);
    const t1={id:uid(),date:today(),account:tf.from,type:"Transfer",category:"Transfer",description:`Transfer to ${toName}`,amount:amt};
    const t2={id:uid(),date:today(),account:tf.to,type:"Transfer",category:"Transfer",description:`Transfer from ${frName}`,amount:amt};
    const nd={...data,accounts,transactions:[...data.transactions,t1,t2]};
    setData(nd);save(nd);setShowTransfer(false);setTf({from:"",to:"",amount:""});
  };

  const total=data.accounts.reduce((s,a)=>s+a.balance,0);

  const AccForm=({onSave,onCancel,lbl})=>(
    <div className="space-y-4">
      <Inp label="Account Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="e.g. SBI Savings"/>
      <Sel label="Type" value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{ACCT_TYPES.map(t=><option key={t}>{t}</option>)}</Sel>
      <Inp label="Balance (₹)" type="number" value={f.balance} onChange={e=>setF({...f,balance:e.target.value})} placeholder="0"/>
      <div className="flex gap-2 justify-end"><Btn color="slate" onClick={onCancel}>Cancel</Btn><Btn onClick={onSave}>{lbl}</Btn></div>
    </div>
  );

  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-slate-100">Accounts</h2>
          <p style={{color:C.muted}} className="text-sm">Total: <span className="text-sky-400 font-semibold">{fmt(total)}</span></p></div>
        <div className="flex gap-2">
          <Btn color="slate" onClick={()=>setShowTransfer(true)}>Transfer</Btn>
          <Btn onClick={()=>{setF(BLANK);setShowAdd(true);}}>+ Add Account</Btn>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {data.accounts.map(a=>(
          <div key={a.id} style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div><div className="font-semibold text-slate-200">{a.name}</div><Badge color="sky">{a.type}</Badge></div>
              <ActionBtns onEdit={()=>openEdit(a)} onDelete={()=>delAcc(a.id)}/>
            </div>
            <div className="text-2xl font-bold text-sky-400 tabular-nums">{fmt(a.balance)}</div>
          </div>
        ))}
        {data.accounts.length===0&&<div className="col-span-2 text-center py-10" style={{color:C.muted}}>No accounts yet. Add one to get started.</div>}
      </div>

      {showAdd&&<Modal title="Add Account" onClose={()=>setShowAdd(false)}><AccForm onSave={addAcc} onCancel={()=>setShowAdd(false)} lbl="Add Account"/></Modal>}
      {editAcc&&<Modal title={`Edit – ${editAcc.name}`} onClose={()=>setEditAcc(null)}><AccForm onSave={saveEdit} onCancel={()=>setEditAcc(null)} lbl="Save Changes"/></Modal>}
      {showTransfer&&<Modal title="Transfer Between Accounts" onClose={()=>setShowTransfer(false)}>
        <div className="space-y-4">
          <Sel label="From" value={tf.from} onChange={e=>setTf({...tf,from:e.target.value})}>
            <option value="">Select account</option>{data.accounts.map(a=><option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}
          </Sel>
          <Sel label="To" value={tf.to} onChange={e=>setTf({...tf,to:e.target.value})}>
            <option value="">Select account</option>{data.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </Sel>
          <Inp label="Amount" type="number" value={tf.amount} onChange={e=>setTf({...tf,amount:e.target.value})} placeholder="0"/>
          <div className="flex gap-2 justify-end"><Btn color="slate" onClick={()=>setShowTransfer(false)}>Cancel</Btn><Btn onClick={doTransfer}>Transfer</Btn></div>
        </div>
      </Modal>}
    </div>
  );
}

// ─── LEDGER ───────────────────────────────────────────────────────────────────
function LedgerView({data,setData}){
  const [showAdd,setShowAdd]=useState(false);
  const [editTx,setEditTx]=useState(null);
  const [filter,setFilter]=useState({type:"",category:"",search:"",month:thisMo()});

  const txList=[...data.transactions]
    .sort((a,b)=>b.date.localeCompare(a.date))
    .filter(t=>{
      if(filter.type&&t.type!==filter.type) return false;
      if(filter.category&&t.category!==filter.category) return false;
      if(filter.month&&!t.date.startsWith(filter.month)) return false;
      if(filter.search&&!t.description.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });

  const delTx=id=>{
    const nd={...data,transactions:data.transactions.filter(t=>t.id!==id)};
    setData(nd);save(nd);
  };

  const handleSave=nd=>{ setData(nd);save(nd);setShowAdd(false);setEditTx(null); };

  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Transaction Ledger</h2>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Transaction</Btn>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-4 grid sm:grid-cols-4 gap-3">
        <Inp placeholder="Search description..." value={filter.search} onChange={e=>setFilter({...filter,search:e.target.value})}/>
        <Sel value={filter.type} onChange={e=>setFilter({...filter,type:e.target.value})}>
          <option value="">All Types</option>{TX_TYPES.map(t=><option key={t}>{t}</option>)}
        </Sel>
        <Sel value={filter.category} onChange={e=>setFilter({...filter,category:e.target.value})}>
          <option value="">All Categories</option>{[...EXPENSE_CATS,...INCOME_SRCS].map(c=><option key={c}>{c}</option>)}
        </Sel>
        <Inp type="month" value={filter.month} onChange={e=>setFilter({...filter,month:e.target.value})}/>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`,background:C.panel}}>
                {["Date","Account","Type","Category","Description","Amount","Actions"].map(h=>
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{color:C.muted}}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {txList.length===0&&<tr><td colSpan={7} className="text-center py-10" style={{color:C.muted}}>No transactions found</td></tr>}
              {txList.map(t=>{
                const acc=data.accounts.find(a=>a.id===t.account);
                const pos=isPos(t.type);
                return(
                  <tr key={t.id} className="border-b hover:bg-slate-800/30 transition-colors" style={{borderColor:C.border}}>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{color:C.muted}}>{acc?.name||"–"}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><Badge color={pos?"emerald":"rose"}>{t.type}</Badge></td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{t.category}</td>
                    <td className="px-4 py-3 text-slate-200 max-w-xs truncate">{t.description}</td>
                    <td className={`px-4 py-3 font-semibold tabular-nums whitespace-nowrap ${pos?"text-emerald-400":"text-rose-400"}`}>
                      {pos?"+":"–"}{fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ActionBtns onEdit={()=>setEditTx(t)} onDelete={()=>delTx(t.id)}/>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd&&<Modal title="Add Transaction" onClose={()=>setShowAdd(false)}>
        <TxForm data={data} onClose={()=>setShowAdd(false)} onSave={handleSave}/>
      </Modal>}
      {editTx&&<Modal title="Edit Transaction" onClose={()=>setEditTx(null)}>
        <TxForm data={data} onClose={()=>setEditTx(null)} onSave={handleSave} existing={editTx}/>
      </Modal>}
    </div>
  );
}

// ─── PLANNING VIEW ────────────────────────────────────────────────────────────
function PlanningView({data,setData}){
  const planning=data.planning||{expectedIncome:[],expectedExpense:[]};
  const [showInc,setShowInc]=useState(false);
  const [showExp,setShowExp]=useState(false);
  const [editItem,setEditItem]=useState(null); // {type:'income'|'expense', item}
  const BLANK_I={label:"",amount:"",frequency:"Monthly",category:"Salary",notes:""};
  const BLANK_E={label:"",amount:"",frequency:"Monthly",category:"Rent",notes:""};
  const [fi,setFi]=useState(BLANK_I);
  const [fe,setFe]=useState(BLANK_E);

  // Actual this month
  const cm=thisMo();
  const cmTx=data.transactions.filter(t=>mkKey(t.date)===cm);
  const actualIncome=cmTx.filter(t=>t.type==="Income").reduce((s,t)=>s+t.amount,0);
  const actualExpense=cmTx.filter(t=>["Expense","EMI Payment"].includes(t.type)).reduce((s,t)=>s+t.amount,0);

  const totalExpInc=planning.expectedIncome.reduce((s,p)=>s+p.amount,0);
  const totalExpExp=planning.expectedExpense.reduce((s,p)=>s+p.amount,0);
  const projSavings=totalExpInc-totalExpExp;
  const actualSavings=actualIncome-actualExpense;

  const updPlan=p=>{ const nd={...data,planning:p}; setData(nd);save(nd); };

  const addInc=()=>{
    if(!fi.label||!fi.amount) return;
    const item={...fi,id:uid(),amount:parseFloat(fi.amount)||0};
    updPlan({...planning,expectedIncome:[...planning.expectedIncome,item]});
    setShowInc(false);setFi(BLANK_I);
  };
  const addExp=()=>{
    if(!fe.label||!fe.amount) return;
    const item={...fe,id:uid(),amount:parseFloat(fe.amount)||0};
    updPlan({...planning,expectedExpense:[...planning.expectedExpense,item]});
    setShowExp(false);setFe(BLANK_E);
  };
  const saveEdit=()=>{
    if(!editItem) return;
    if(editItem.type==="income"){
      const amt=parseFloat(fi.amount)||0;
      updPlan({...planning,expectedIncome:planning.expectedIncome.map(p=>p.id===editItem.item.id?{...fi,id:p.id,amount:amt}:p)});
    } else {
      const amt=parseFloat(fe.amount)||0;
      updPlan({...planning,expectedExpense:planning.expectedExpense.map(p=>p.id===editItem.item.id?{...fe,id:p.id,amount:amt}:p)});
    }
    setEditItem(null);
  };
  const delInc=id=>updPlan({...planning,expectedIncome:planning.expectedIncome.filter(p=>p.id!==id)});
  const delExp=id=>updPlan({...planning,expectedExpense:planning.expectedExpense.filter(p=>p.id!==id)});

  const openEditInc=item=>{setEditItem({type:"income",item});setFi({label:item.label,amount:String(item.amount),frequency:item.frequency,category:item.category,notes:item.notes||""});};
  const openEditExp=item=>{setEditItem({type:"expense",item});setFe({label:item.label,amount:String(item.amount),frequency:item.frequency,category:item.category,notes:item.notes||""});};

  const IncForm=({onSave,onCancel,lbl})=>(
    <div className="space-y-4">
      <Inp label="Label" value={fi.label} onChange={e=>setFi({...fi,label:e.target.value})} placeholder="e.g. Monthly Salary"/>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Amount (₹)" type="number" value={fi.amount} onChange={e=>setFi({...fi,amount:e.target.value})} placeholder="0"/>
        <Sel label="Frequency" value={fi.frequency} onChange={e=>setFi({...fi,frequency:e.target.value})}>{PLAN_FREQ.map(f=><option key={f}>{f}</option>)}</Sel>
      </div>
      <Sel label="Category" value={fi.category} onChange={e=>setFi({...fi,category:e.target.value})}>{INCOME_SRCS.map(c=><option key={c}>{c}</option>)}</Sel>
      <Inp label="Notes" value={fi.notes} onChange={e=>setFi({...fi,notes:e.target.value})} placeholder="Optional"/>
      <div className="flex gap-2 justify-end"><Btn color="slate" onClick={onCancel}>Cancel</Btn><Btn color="emerald" onClick={onSave}>{lbl}</Btn></div>
    </div>
  );

  const ExpForm=({onSave,onCancel,lbl})=>(
    <div className="space-y-4">
      <Inp label="Label" value={fe.label} onChange={e=>setFe({...fe,label:e.target.value})} placeholder="e.g. House Rent"/>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Amount (₹)" type="number" value={fe.amount} onChange={e=>setFe({...fe,amount:e.target.value})} placeholder="0"/>
        <Sel label="Frequency" value={fe.frequency} onChange={e=>setFe({...fe,frequency:e.target.value})}>{PLAN_FREQ.map(f=><option key={f}>{f}</option>)}</Sel>
      </div>
      <Sel label="Category" value={fe.category} onChange={e=>setFe({...fe,category:e.target.value})}>{EXPENSE_CATS.map(c=><option key={c}>{c}</option>)}</Sel>
      <Inp label="Notes" value={fe.notes} onChange={e=>setFe({...fe,notes:e.target.value})} placeholder="Optional"/>
      <div className="flex gap-2 justify-end"><Btn color="slate" onClick={onCancel}>Cancel</Btn><Btn color="rose" onClick={onSave}>{lbl}</Btn></div>
    </div>
  );

  return(
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-100">Monthly Planning</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Expected Income" value={fmt(totalExpInc)} color="text-emerald-400" icon="📥" sub="Per month planned"/>
        <StatCard label="Expected Expense" value={fmt(totalExpExp)} color="text-rose-400" icon="📤" sub="Per month planned"/>
        <StatCard label="Projected Savings" value={fmt(projSavings)} color={projSavings>=0?"text-sky-400":"text-rose-400"} icon="💡" sub="Income – Expense"/>
      </div>

      {/* Plan vs Actual */}
      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">This Month — Plan vs Actual</h3>
        <div className="space-y-4">
          {[
            {label:"Income",plan:totalExpInc,actual:actualIncome,color:C.emerald,barColor:"bg-emerald-500"},
            {label:"Expense",plan:totalExpExp,actual:actualExpense,color:C.rose,barColor:"bg-rose-500"},
            {label:"Savings",plan:projSavings,actual:actualSavings,color:C.sky,barColor:"bg-sky-500"},
          ].map(({label,plan,actual,color,barColor})=>{
            const pct=Math.min(100,plan>0?(actual/plan)*100:0).toFixed(0);
            return(
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{label}</span>
                  <span style={{color}} className="font-semibold tabular-nums">{fmt(actual)} <span style={{color:C.muted}} className="font-normal">/ {fmt(plan)}</span></span>
                </div>
                <div className="h-2.5 rounded-full" style={{background:C.border}}>
                  <div className={`h-2.5 rounded-full transition-all ${barColor}`} style={{width:`${pct}%`}}/>
                </div>
                <div className="text-xs mt-1" style={{color:C.muted}}>{pct}% of plan</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expected Income list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-emerald-400">Expected Income Sources</h3>
            <p className="text-xs mt-0.5" style={{color:C.muted}}>Regular and one-time income you expect each month</p>
          </div>
          <Btn color="emerald" onClick={()=>setShowInc(true)} className="text-xs">+ Add</Btn>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`,background:C.panel}}>
                {["Label","Category","Frequency","Amount","Notes","Actions"].map(h=>
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{color:C.muted}}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {planning.expectedIncome.length===0&&<tr><td colSpan={6} className="text-center py-8" style={{color:C.muted}}>No expected income added yet</td></tr>}
              {planning.expectedIncome.map(p=>(
                <tr key={p.id} className="border-b hover:bg-slate-800/20 transition-colors" style={{borderColor:C.border}}>
                  <td className="px-4 py-3 font-medium text-slate-200">{p.label}</td>
                  <td className="px-4 py-3"><Badge color="emerald">{p.category}</Badge></td>
                  <td className="px-4 py-3 text-slate-400">{p.frequency}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold tabular-nums">{fmt(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.notes||"–"}</td>
                  <td className="px-4 py-3"><ActionBtns onEdit={()=>openEditInc(p)} onDelete={()=>delInc(p.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          {planning.expectedIncome.length>0&&(
            <div className="px-4 py-3 border-t flex justify-between items-center" style={{borderColor:C.border,background:C.panel}}>
              <span className="text-xs font-medium" style={{color:C.muted}}>Total Expected Income</span>
              <span className="text-emerald-400 font-bold tabular-nums">{fmt(totalExpInc)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expected Expense list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-rose-400">Expected Expenses</h3>
            <p className="text-xs mt-0.5" style={{color:C.muted}}>Fixed and variable expenses you plan for each month</p>
          </div>
          <Btn color="rose" onClick={()=>setShowExp(true)} className="text-xs">+ Add</Btn>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`,background:C.panel}}>
                {["Label","Category","Frequency","Amount","Notes","Actions"].map(h=>
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{color:C.muted}}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {planning.expectedExpense.length===0&&<tr><td colSpan={6} className="text-center py-8" style={{color:C.muted}}>No expected expenses added yet</td></tr>}
              {planning.expectedExpense.map(p=>(
                <tr key={p.id} className="border-b hover:bg-slate-800/20 transition-colors" style={{borderColor:C.border}}>
                  <td className="px-4 py-3 font-medium text-slate-200">{p.label}</td>
                  <td className="px-4 py-3"><Badge color="rose">{p.category}</Badge></td>
                  <td className="px-4 py-3 text-slate-400">{p.frequency}</td>
                  <td className="px-4 py-3 text-rose-400 font-semibold tabular-nums">{fmt(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.notes||"–"}</td>
                  <td className="px-4 py-3"><ActionBtns onEdit={()=>openEditExp(p)} onDelete={()=>delExp(p.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          {planning.expectedExpense.length>0&&(
            <div className="px-4 py-3 border-t flex justify-between items-center" style={{borderColor:C.border,background:C.panel}}>
              <span className="text-xs font-medium" style={{color:C.muted}}>Total Expected Expense</span>
              <span className="text-rose-400 font-bold tabular-nums">{fmt(totalExpExp)}</span>
            </div>
          )}
        </div>
      </div>

      {showInc&&<Modal title="Add Expected Income" onClose={()=>setShowInc(false)}><IncForm onSave={addInc} onCancel={()=>setShowInc(false)} lbl="Add Income"/></Modal>}
      {showExp&&<Modal title="Add Expected Expense" onClose={()=>setShowExp(false)}><ExpForm onSave={addExp} onCancel={()=>setShowExp(false)} lbl="Add Expense"/></Modal>}
      {editItem&&<Modal title={`Edit – ${editItem.item.label}`} onClose={()=>setEditItem(null)}>
        {editItem.type==="income"
          ?<IncForm onSave={saveEdit} onCancel={()=>setEditItem(null)} lbl="Save Changes"/>
          :<ExpForm onSave={saveEdit} onCancel={()=>setEditItem(null)} lbl="Save Changes"/>}
      </Modal>}
    </div>
  );
}

// ─── EXPENSE VIEW ─────────────────────────────────────────────────────────────
function ExpenseView({data,setData}){
  const [showAdd,setShowAdd]=useState(false);
  const [editTx,setEditTx]=useState(null);
  const weekStart=new Date(); weekStart.setDate(weekStart.getDate()-weekStart.getDay());
  const todaySpend=data.transactions.filter(t=>t.date===today()&&t.type==="Expense").reduce((s,t)=>s+t.amount,0);
  const weekSpend=data.transactions.filter(t=>new Date(t.date)>=weekStart&&t.type==="Expense").reduce((s,t)=>s+t.amount,0);
  const monthSpend=data.transactions.filter(t=>mkKey(t.date)===thisMo()&&["Expense","EMI Payment"].includes(t.type)).reduce((s,t)=>s+t.amount,0);
  const expList=[...data.transactions].filter(t=>["Expense","EMI Payment"].includes(t.type)).sort((a,b)=>b.date.localeCompare(a.date));
  const delTx=id=>{ const nd={...data,transactions:data.transactions.filter(t=>t.id!==id)}; setData(nd);save(nd); };
  const handleSave=nd=>{ setData(nd);save(nd);setShowAdd(false);setEditTx(null); };
  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Daily Expenses</h2>
        <Btn color="rose" onClick={()=>setShowAdd(true)}>+ Add Expense</Btn>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Today" value={fmt(todaySpend)} color="text-rose-400" icon="📅"/>
        <StatCard label="This Week" value={fmt(weekSpend)} color="text-amber-400" icon="📆"/>
        <StatCard label="This Month" value={fmt(monthSpend)} color="text-rose-400" icon="📊"/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`,background:C.panel}}>
              {["Date","Category","Description","Amount","Actions"].map(h=>
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{color:C.muted}}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {expList.length===0&&<tr><td colSpan={5} className="text-center py-8" style={{color:C.muted}}>No expenses yet</td></tr>}
            {expList.slice(0,30).map(t=>(
              <tr key={t.id} className="border-b hover:bg-slate-800/20 transition-colors" style={{borderColor:C.border}}>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{t.date}</td>
                <td className="px-4 py-3 whitespace-nowrap"><Badge color="rose">{t.category}</Badge></td>
                <td className="px-4 py-3 text-slate-200">{t.description}</td>
                <td className="px-4 py-3 text-rose-400 font-semibold tabular-nums whitespace-nowrap">–{fmt(t.amount)}</td>
                <td className="px-4 py-3 whitespace-nowrap"><ActionBtns onEdit={()=>setEditTx(t)} onDelete={()=>delTx(t.id)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd&&<Modal title="Add Expense" onClose={()=>setShowAdd(false)}><TxForm data={data} defaultType="Expense" onClose={()=>setShowAdd(false)} onSave={handleSave}/></Modal>}
      {editTx&&<Modal title="Edit Expense" onClose={()=>setEditTx(null)}><TxForm data={data} onClose={()=>setEditTx(null)} onSave={handleSave} existing={editTx}/></Modal>}
    </div>
  );
}

// ─── INCOME VIEW ──────────────────────────────────────────────────────────────
function IncomeView({data,setData}){
  const [showAdd,setShowAdd]=useState(false);
  const [editTx,setEditTx]=useState(null);
  const incList=[...data.transactions].filter(t=>t.type==="Income").sort((a,b)=>b.date.localeCompare(a.date));
  const monthIncome=incList.filter(t=>mkKey(t.date)===thisMo()).reduce((s,t)=>s+t.amount,0);
  const yearIncome=incList.filter(t=>t.date.startsWith("2026")).reduce((s,t)=>s+t.amount,0);
  const delTx=id=>{ const nd={...data,transactions:data.transactions.filter(t=>t.id!==id)}; setData(nd);save(nd); };
  const handleSave=nd=>{ setData(nd);save(nd);setShowAdd(false);setEditTx(null); };
  const months=[];
  for(let i=5;i>=0;i--){
    const d=new Date(); d.setMonth(d.getMonth()-i);
    const mk=d.toISOString().slice(0,7);
    months.push({month:d.toLocaleString("en-IN",{month:"short"}),Income:incList.filter(t=>mkKey(t.date)===mk).reduce((s,t)=>s+t.amount,0)});
  }
  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Income Tracker</h2>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Income</Btn>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="This Month" value={fmt(monthIncome)} color="text-emerald-400" icon="💰"/>
        <StatCard label="This Year (2026)" value={fmtS(yearIncome)} color="text-emerald-400" icon="📈"/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Income Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={months}>
            <defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.emerald} stopOpacity={0.3}/><stop offset="95%" stopColor={C.emerald} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtS}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8}}/>
            <Area type="monotone" dataKey="Income" stroke={C.emerald} fill="url(#ig)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`,background:C.panel}}>
              {["Date","Source","Description","Amount","Actions"].map(h=>
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{color:C.muted}}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {incList.length===0&&<tr><td colSpan={5} className="text-center py-8" style={{color:C.muted}}>No income entries yet</td></tr>}
            {incList.slice(0,30).map(t=>(
              <tr key={t.id} className="border-b hover:bg-slate-800/20 transition-colors" style={{borderColor:C.border}}>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{t.date}</td>
                <td className="px-4 py-3 whitespace-nowrap"><Badge color="emerald">{t.category}</Badge></td>
                <td className="px-4 py-3 text-slate-200">{t.description}</td>
                <td className="px-4 py-3 text-emerald-400 font-semibold tabular-nums whitespace-nowrap">+{fmt(t.amount)}</td>
                <td className="px-4 py-3 whitespace-nowrap"><ActionBtns onEdit={()=>setEditTx(t)} onDelete={()=>delTx(t.id)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd&&<Modal title="Add Income" onClose={()=>setShowAdd(false)}><TxForm data={data} defaultType="Income" onClose={()=>setShowAdd(false)} onSave={handleSave}/></Modal>}
      {editTx&&<Modal title="Edit Income" onClose={()=>setEditTx(null)}><TxForm data={data} onClose={()=>setEditTx(null)} onSave={handleSave} existing={editTx}/></Modal>}
    </div>
  );
}

// ─── LOANS ────────────────────────────────────────────────────────────────────
function LoansView({data,setData}){
  const [showAdd,setShowAdd]=useState(false);
  const [editLoan,setEditLoan]=useState(null);
  const BLANK={name:"",lender:"",originalAmount:"",interestRate:"",emi:"",dueDate:"",outstandingAmount:"",startDate:"",endDate:"",status:"Active"};
  const [f,setF]=useState(BLANK);
  const totalOut=data.loans.filter(l=>l.status==="Active").reduce((s,l)=>s+l.outstandingAmount,0);
  const totalEMI=data.loans.filter(l=>l.status==="Active").reduce((s,l)=>s+l.emi,0);
  const saveLoan=()=>{
    if(!f.name) return;
    const item={...f,id:uid(),originalAmount:parseFloat(f.originalAmount)||0,interestRate:parseFloat(f.interestRate)||0,emi:parseFloat(f.emi)||0,dueDate:parseInt(f.dueDate)||1,outstandingAmount:parseFloat(f.outstandingAmount)||0};
    const nd={...data,loans:editLoan?data.loans.map(l=>l.id===editLoan.id?{...item,id:editLoan.id}:l):[...data.loans,item]};
    setData(nd);save(nd);setShowAdd(false);setEditLoan(null);setF(BLANK);
  };
  const openEdit=l=>{ setEditLoan(l); setF({name:l.name,lender:l.lender,originalAmount:String(l.originalAmount),interestRate:String(l.interestRate),emi:String(l.emi),dueDate:String(l.dueDate),outstandingAmount:String(l.outstandingAmount),startDate:l.startDate||"",endDate:l.endDate||"",status:l.status}); };
  const delLoan=id=>{ const nd={...data,loans:data.loans.filter(l=>l.id!==id)}; setData(nd);save(nd); };

  const LoanForm=({onSave,onCancel,lbl})=>(
    <div className="space-y-4">
      <Inp label="Loan Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="e.g. Home Loan"/>
      <Inp label="Lender" value={f.lender} onChange={e=>setF({...f,lender:e.target.value})} placeholder="Bank/NBFC"/>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Original Amount" type="number" value={f.originalAmount} onChange={e=>setF({...f,originalAmount:e.target.value})}/>
        <Inp label="Outstanding" type="number" value={f.outstandingAmount} onChange={e=>setF({...f,outstandingAmount:e.target.value})}/>
        <Inp label="Interest Rate (%)" type="number" value={f.interestRate} onChange={e=>setF({...f,interestRate:e.target.value})}/>
        <Inp label="Monthly EMI" type="number" value={f.emi} onChange={e=>setF({...f,emi:e.target.value})}/>
        <Inp label="Due Date (day)" type="number" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})} placeholder="1-31"/>
        <Sel label="Status" value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option>Active</option><option>Closed</option><option>Paused</option></Sel>
        <Inp label="Start Date" type="date" value={f.startDate} onChange={e=>setF({...f,startDate:e.target.value})}/>
        <Inp label="End Date" type="date" value={f.endDate} onChange={e=>setF({...f,endDate:e.target.value})}/>
      </div>
      <div className="flex gap-2 justify-end"><Btn color="slate" onClick={onCancel}>Cancel</Btn><Btn color="amber" onClick={onSave}>{lbl}</Btn></div>
    </div>
  );

  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Loans & EMI</h2>
        <Btn color="amber" onClick={()=>{setF(BLANK);setShowAdd(true);}}>+ Add Loan</Btn>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Outstanding" value={fmt(totalOut)} color="text-rose-400" icon="🏦"/>
        <StatCard label="Monthly EMI Total" value={fmt(totalEMI)} color="text-amber-400" icon="📅"/>
      </div>
      <div className="space-y-3">
        {data.loans.map(l=>{
          const pct=Math.min(100,((l.originalAmount-l.outstandingAmount)/Math.max(l.originalAmount,1)*100)).toFixed(1);
          const d=new Date(); d.setDate(l.dueDate);
          const dl=daysLeft(d.toISOString().slice(0,10));
          return(
            <div key={l.id} style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div><div className="font-semibold text-slate-200">{l.name}</div><div className="text-sm" style={{color:C.muted}}>{l.lender} • {l.interestRate}% p.a.</div></div>
                <div className="flex items-center gap-3">
                  <Badge color={l.status==="Active"?"emerald":"muted"}>{l.status}</Badge>
                  <ActionBtns onEdit={()=>openEdit(l)} onDelete={()=>delLoan(l.id)}/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div><div className="text-xs mb-1" style={{color:C.muted}}>Outstanding</div><div className="text-rose-400 font-semibold">{fmt(l.outstandingAmount)}</div></div>
                <div><div className="text-xs mb-1" style={{color:C.muted}}>Monthly EMI</div><div className="text-amber-400 font-semibold">{fmt(l.emi)}</div></div>
                <div><div className="text-xs mb-1" style={{color:C.muted}}>Due Date</div><div className={`font-semibold ${dl<=0?"text-rose-400":dl<=7?"text-amber-400":"text-emerald-400"}`}>{l.dueDate}th • {dl>0?`${dl}d left`:"Today!"}</div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1" style={{color:C.muted}}><span>Repaid</span><span>{pct}%</span></div>
                <div className="h-2 rounded-full" style={{background:C.border}}><div className="h-2 rounded-full bg-emerald-500" style={{width:`${pct}%`}}/></div>
              </div>
            </div>
          );
        })}
        {data.loans.length===0&&<div className="text-center py-10" style={{color:C.muted}}>No loans added yet.</div>}
      </div>
      {showAdd&&<Modal title="Add Loan" onClose={()=>setShowAdd(false)}><LoanForm onSave={saveLoan} onCancel={()=>setShowAdd(false)} lbl="Add Loan"/></Modal>}
      {editLoan&&<Modal title={`Edit – ${editLoan.name}`} onClose={()=>setEditLoan(null)}><LoanForm onSave={saveLoan} onCancel={()=>setEditLoan(null)} lbl="Save Changes"/></Modal>}
    </div>
  );
}

// ─── DEBTS ────────────────────────────────────────────────────────────────────
function DebtView({data,setData}){
  const [showAdd,setShowAdd]=useState(null);
  const [editItem,setEditItem]=useState(null);
  const BLANK={person:"",amount:"",dueDate:"",notes:""};
  const [f,setF]=useState(BLANK);
  const updDebts=debts=>{ const nd={...data,debts}; setData(nd);save(nd); };
  const addDebt=type=>{
    if(!f.person||!f.amount) return;
    const item={...f,id:uid(),amount:parseFloat(f.amount)||0,status:"Pending"};
    updDebts(type==="iOwe"?{...data.debts,iOwe:[...data.debts.iOwe,item]}:{...data.debts,owedToMe:[...data.debts.owedToMe,item]});
    setShowAdd(null);setF(BLANK);
  };
  const saveEdit=()=>{
    if(!editItem) return;
    const item={...editItem.item,...f,amount:parseFloat(f.amount)||0};
    if(editItem.type==="iOwe") updDebts({...data.debts,iOwe:data.debts.iOwe.map(d=>d.id===item.id?item:d)});
    else updDebts({...data.debts,owedToMe:data.debts.owedToMe.map(d=>d.id===item.id?item:d)});
    setEditItem(null);setF(BLANK);
  };
  const openEdit=(type,item)=>{ setEditItem({type,item}); setF({person:item.person,amount:String(item.amount),dueDate:item.dueDate||"",notes:item.notes||""}); };
  const settle=(type,id)=>{
    if(type==="iOwe") updDebts({...data.debts,iOwe:data.debts.iOwe.map(d=>d.id===id?{...d,status:"Settled"}:d)});
    else updDebts({...data.debts,owedToMe:data.debts.owedToMe.map(d=>d.id===id?{...d,status:"Settled"}:d)});
  };
  const del=(type,id)=>{
    if(type==="iOwe") updDebts({...data.debts,iOwe:data.debts.iOwe.filter(d=>d.id!==id)});
    else updDebts({...data.debts,owedToMe:data.debts.owedToMe.filter(d=>d.id!==id)});
  };
  const totalOwe=data.debts.iOwe.filter(d=>d.status==="Pending").reduce((s,d)=>s+d.amount,0);
  const totalOwed=data.debts.owedToMe.filter(d=>d.status==="Pending").reduce((s,d)=>s+d.amount,0);
  const DebtForm=({onSave,onCancel,lbl})=>(
    <div className="space-y-4">
      <Inp label="Person / Institution" value={f.person} onChange={e=>setF({...f,person:e.target.value})} placeholder="Name"/>
      <Inp label="Amount (₹)" type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} placeholder="0"/>
      <Inp label="Due Date" type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})}/>
      <Inp label="Notes" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="Optional"/>
      <div className="flex gap-2 justify-end"><Btn color="slate" onClick={onCancel}>Cancel</Btn><Btn onClick={onSave}>{lbl}</Btn></div>
    </div>
  );
  const DebtCard=({item,type})=>(
    <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-4 flex items-center justify-between">
      <div><div className="font-medium text-slate-200">{item.person}</div>
        <div className="text-xs mt-1" style={{color:C.muted}}>{item.notes} {item.dueDate&&`• Due: ${item.dueDate}`}</div></div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`font-bold tabular-nums ${type==="iOwe"?"text-rose-400":"text-emerald-400"}`}>{fmt(item.amount)}</div>
          <Badge color={item.status==="Pending"?"amber":"muted"}>{item.status}</Badge>
        </div>
        {item.status==="Pending"&&<button onClick={()=>settle(type,item.id)} style={{background:C.panel,border:`1px solid ${C.border}`}} className="px-2 py-1 rounded text-xs text-emerald-400 hover:text-emerald-300 transition-colors">✓ Settle</button>}
        <ActionBtns onEdit={()=>openEdit(type,item)} onDelete={()=>del(type,item.id)}/>
      </div>
    </div>
  );
  return(
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-100">Debt Management</h2>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="I Owe Others" value={fmt(totalOwe)} color="text-rose-400" icon="💸"/>
        <StatCard label="Others Owe Me" value={fmt(totalOwed)} color="text-emerald-400" icon="🤝"/>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-rose-400">Money I Owe</h3><Btn color="rose" onClick={()=>{setF(BLANK);setShowAdd("iOwe");}} className="text-xs">+ Add</Btn></div>
        <div className="space-y-2">{data.debts.iOwe.map(d=><DebtCard key={d.id} item={d} type="iOwe"/>)}{data.debts.iOwe.length===0&&<div className="text-sm text-center py-4" style={{color:C.muted}}>No debts 🎉</div>}</div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-emerald-400">Money Owed to Me</h3><Btn onClick={()=>{setF(BLANK);setShowAdd("owedToMe");}} className="text-xs">+ Add</Btn></div>
        <div className="space-y-2">{data.debts.owedToMe.map(d=><DebtCard key={d.id} item={d} type="owedToMe"/>)}</div>
      </div>
      {showAdd&&<Modal title={showAdd==="iOwe"?"Money I Owe":"Money Owed to Me"} onClose={()=>setShowAdd(null)}><DebtForm onSave={()=>addDebt(showAdd)} onCancel={()=>setShowAdd(null)} lbl="Save"/></Modal>}
      {editItem&&<Modal title={`Edit – ${editItem.item.person}`} onClose={()=>setEditItem(null)}><DebtForm onSave={saveEdit} onCancel={()=>setEditItem(null)} lbl="Save Changes"/></Modal>}
    </div>
  );
}

// ─── ASSETS ───────────────────────────────────────────────────────────────────
function AssetsView({data,setData}){
  const [showAdd,setShowAdd]=useState(false);
  const [editAsset,setEditAsset]=useState(null);
  const BLANK={name:"",category:"Gold",currentValue:"",purchaseValue:"",purchaseDate:"",notes:""};
  const [f,setF]=useState(BLANK);
  const saveAsset=()=>{
    if(!f.name) return;
    const item={...f,id:uid(),currentValue:parseFloat(f.currentValue)||0,purchaseValue:parseFloat(f.purchaseValue)||0};
    const nd={...data,assets:editAsset?data.assets.map(a=>a.id===editAsset.id?{...item,id:editAsset.id}:a):[...data.assets,item]};
    setData(nd);save(nd);setShowAdd(false);setEditAsset(null);setF(BLANK);
  };
  const openEdit=a=>{ setEditAsset(a); setF({name:a.name,category:a.category,currentValue:String(a.currentValue),purchaseValue:String(a.purchaseValue),purchaseDate:a.purchaseDate||"",notes:a.notes||""}); };
  const delAsset=id=>{ const nd={...data,assets:data.assets.filter(a=>a.id!==id)}; setData(nd);save(nd); };
  const total=data.assets.reduce((s,a)=>s+a.currentValue,0);
  const totalP=data.assets.reduce((s,a)=>s+a.purchaseValue,0);
  const gain=total-totalP;
  const allocData=Object.entries(data.assets.reduce((o,a)=>({...o,[a.category]:(o[a.category]||0)+a.currentValue}),{})).map(([name,value])=>({name,value}));
  const AssetForm=({onSave,onCancel,lbl})=>(
    <div className="space-y-4">
      <Inp label="Asset Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
      <Sel label="Category" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{ASSET_CATS.map(c=><option key={c}>{c}</option>)}</Sel>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Current Value" type="number" value={f.currentValue} onChange={e=>setF({...f,currentValue:e.target.value})}/>
        <Inp label="Purchase Value" type="number" value={f.purchaseValue} onChange={e=>setF({...f,purchaseValue:e.target.value})}/>
      </div>
      <Inp label="Purchase Date" type="date" value={f.purchaseDate} onChange={e=>setF({...f,purchaseDate:e.target.value})}/>
      <Inp label="Notes" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/>
      <div className="flex gap-2 justify-end"><Btn color="slate" onClick={onCancel}>Cancel</Btn><Btn color="violet" onClick={onSave}>{lbl}</Btn></div>
    </div>
  );
  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-100">Asset Tracker</h2><Btn color="violet" onClick={()=>{setF(BLANK);setShowAdd(true);}}>+ Add Asset</Btn></div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Value" value={fmtS(total)} color="text-violet-400" icon="💎"/>
        <StatCard label="Total Cost" value={fmtS(totalP)} color="text-slate-300" icon="🏷️"/>
        <StatCard label="Unrealised P&L" value={fmtS(gain)} color={gain>=0?"text-emerald-400":"text-rose-400"} icon={gain>=0?"📈":"📉"}/>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={allocData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>{allocData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8}}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11,color:C.muted}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.assets.map(a=>{
            const g=a.currentValue-a.purchaseValue;
            const p=((g/Math.max(a.purchaseValue,1))*100).toFixed(1);
            return(
              <div key={a.id} style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div><div className="font-medium text-slate-200 text-sm">{a.name}</div><Badge color="violet">{a.category}</Badge></div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-violet-400 tabular-nums">{fmt(a.currentValue)}</div>
                      <div className={`text-xs font-medium ${g>=0?"text-emerald-400":"text-rose-400"}`}>{g>=0?"+":""}{p}%</div>
                    </div>
                    <ActionBtns onEdit={()=>openEdit(a)} onDelete={()=>delAsset(a.id)}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showAdd&&<Modal title="Add Asset" onClose={()=>setShowAdd(false)}><AssetForm onSave={saveAsset} onCancel={()=>setShowAdd(false)} lbl="Add Asset"/></Modal>}
      {editAsset&&<Modal title={`Edit – ${editAsset.name}`} onClose={()=>setEditAsset(null)}><AssetForm onSave={saveAsset} onCancel={()=>setEditAsset(null)} lbl="Save Changes"/></Modal>}
    </div>
  );
}

// ─── NET WORTH ────────────────────────────────────────────────────────────────
function NetWorthView({data}){
  const totalCash=data.accounts.reduce((s,a)=>s+a.balance,0);
  const totalAssets=data.assets.reduce((s,a)=>s+a.currentValue,0)+totalCash;
  const totalLoans=data.loans.reduce((s,l)=>s+l.outstandingAmount,0);
  const totalIOwe=data.debts.iOwe.filter(d=>d.status==="Pending").reduce((s,d)=>s+d.amount,0);
  const totalOwedMe=data.debts.owedToMe.filter(d=>d.status==="Pending").reduce((s,d)=>s+d.amount,0);
  const nw=totalAssets+totalOwedMe-totalLoans-totalIOwe;
  const breakdown=[
    {label:"Cash & Bank",value:totalCash,color:"text-sky-400",icon:"🏦"},
    {label:"Investments & Assets",value:data.assets.reduce((s,a)=>s+a.currentValue,0),color:"text-violet-400",icon:"📈"},
    {label:"Money Owed to Me",value:totalOwedMe,color:"text-emerald-400",icon:"🤝"},
    {label:"Loans Outstanding",value:-totalLoans,color:"text-rose-400",icon:"🏦"},
    {label:"Debts I Owe",value:-totalIOwe,color:"text-rose-400",icon:"💸"},
  ];
  const hist=[];
  for(let i=5;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); hist.push({month:d.toLocaleString("en-IN",{month:"short"}),NetWorth:nw*(0.85+i*0.03)}); }
  return(
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-100">Net Worth</h2>
      <div style={{background:"linear-gradient(135deg,#0f2a1a 0%,#0F172A 50%,#1a1030 100%)",border:`1px solid ${C.border}`}} className="rounded-2xl p-8 text-center">
        <div className="text-sm font-medium mb-2" style={{color:C.muted}}>Current Net Worth</div>
        <div className="text-5xl font-bold text-emerald-400 tabular-nums">{fmt(nw)}</div>
      </div>
      <div className="space-y-3">
        {breakdown.map(b=>(
          <div key={b.label} style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="text-xl">{b.icon}</span><span className="text-sm text-slate-300">{b.label}</span></div>
            <span className={`font-semibold tabular-nums ${b.color}`}>{b.value>=0?"+":""}{fmt(b.value)}</span>
          </div>
        ))}
        <div style={{background:C.panel,border:`2px solid ${C.emerald}`}} className="rounded-xl p-4 flex items-center justify-between">
          <span className="font-semibold text-slate-100">= Net Worth</span>
          <span className="text-xl font-bold text-emerald-400 tabular-nums">{fmt(nw)}</span>
        </div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Net Worth Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={hist}>
            <defs><linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.emerald} stopOpacity={0.3}/><stop offset="95%" stopColor={C.emerald} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtS}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8}}/>
            <Area type="monotone" dataKey="NetWorth" stroke={C.emerald} fill="url(#nwg)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
function TimelineView({data}){
  const tx=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,40);
  const byDate={};
  tx.forEach(t=>{ if(!byDate[t.date]) byDate[t.date]=[]; byDate[t.date].push(t); });
  return(
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Financial Timeline</h2>
      {Object.entries(byDate).map(([date,txs])=>(
        <div key={date} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div style={{background:C.panel,border:`2px solid ${C.border}`}} className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">{new Date(date).getDate()}</div>
            <div style={{background:C.border}} className="w-0.5 flex-1 mt-2"/>
          </div>
          <div className="flex-1 pb-4">
            <div className="text-xs font-medium mb-2" style={{color:C.muted}}>{new Date(date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"})}</div>
            <div className="space-y-2">
              {txs.map(t=>(
                <div key={t.id} style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-3 flex items-center justify-between">
                  <div><div className="text-sm text-slate-200">{t.description}</div><div className="text-xs mt-0.5" style={{color:C.muted}}>{t.type} • {t.category}</div></div>
                  <span className={`font-semibold tabular-nums text-sm ${isPos(t.type)?"text-emerald-400":"text-rose-400"}`}>{isPos(t.type)?"+":"–"}{fmt(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {Object.keys(byDate).length===0&&<div className="text-center py-10" style={{color:C.muted}}>No transactions to show.</div>}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function ReportsView({data}){
  const months=[];
  for(let i=5;i>=0;i--){
    const d=new Date(); d.setMonth(d.getMonth()-i);
    const mk=d.toISOString().slice(0,7);
    const inc=data.transactions.filter(t=>mkKey(t.date)===mk&&t.type==="Income").reduce((s,t)=>s+t.amount,0);
    const exp=data.transactions.filter(t=>mkKey(t.date)===mk&&["Expense","EMI Payment"].includes(t.type)).reduce((s,t)=>s+t.amount,0);
    months.push({month:d.toLocaleString("en-IN",{month:"short",year:"2-digit"}),Income:inc,Expense:exp,Savings:Math.max(0,inc-exp)});
  }
  return(
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-100">Reports</h2>
      <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Income vs Expense – 6 Months</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={months}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtS}/>
            <Tooltip content={<TT/>}/>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11,color:C.muted}}/>
            <Bar dataKey="Income" fill={C.emerald} radius={[4,4,0,0]}/>
            <Bar dataKey="Expense" fill={C.rose} radius={[4,4,0,0]}/>
            <Bar dataKey="Savings" fill={C.sky} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Loan Summary</h3>
          {data.loans.map(l=>(
            <div key={l.id} className="flex justify-between py-2 border-b last:border-0 text-sm" style={{borderColor:C.border}}>
              <span className="text-slate-300">{l.name}</span>
              <div className="text-right"><div className="text-rose-400 font-semibold">{fmt(l.outstandingAmount)}</div><div style={{color:C.muted}} className="text-xs">EMI: {fmt(l.emi)}</div></div>
            </div>
          ))}
          {data.loans.length===0&&<div className="text-center py-4" style={{color:C.muted}}>No loans</div>}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Asset Summary</h3>
          {data.assets.map(a=>(
            <div key={a.id} className="flex justify-between py-2 border-b last:border-0 text-sm" style={{borderColor:C.border}}>
              <span className="text-slate-300">{a.name}</span>
              <div className="text-right"><div className="text-violet-400 font-semibold">{fmt(a.currentValue)}</div><div style={{color:C.muted}} className="text-xs">{a.category}</div></div>
            </div>
          ))}
          {data.assets.length===0&&<div className="text-center py-4" style={{color:C.muted}}>No assets</div>}
        </div>
      </div>
    </div>
  );
}

// ─── BACKUP ───────────────────────────────────────────────────────────────────
function BackupView({data,setData}){
  const [confirmClear,setConfirmClear]=useState(false);
  const exp=()=>{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`financeOS_${today()}.json`;a.click();
  };
  const imp=e=>{
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=ev=>{ try{ const d=JSON.parse(ev.target.result); if(!d.planning) d.planning={expectedIncome:[],expectedExpense:[]}; setData(d);save(d); alert("✅ Restored!"); }catch{ alert("❌ Invalid file"); } };
    r.readAsText(file);
  };
  const clearAll=()=>{ setData(EMPTY);save(EMPTY);setConfirmClear(false); };
  const resetDemo=()=>{ setData(DEMO);save(DEMO); };
  return(
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Backup & Restore</h2>
      <div style={{background:"linear-gradient(135deg,#0f2a1a,#0F172A)",border:`2px solid ${C.emerald}`}} className="rounded-xl p-5">
        <div className="font-semibold text-emerald-400 mb-1">🚀 Start Fresh — Clear All Data</div>
        <div className="text-sm text-slate-400 mb-4">Wipes everything so you can enter only your real data.</div>
        {!confirmClear?<Btn color="emerald" onClick={()=>setConfirmClear(true)}>Clear All & Start Fresh</Btn>
          :<div style={{background:"#052e16",border:"1px solid #166534"}} className="rounded-lg p-4">
            <div className="text-sm text-emerald-300 mb-3 font-medium">⚠️ This cannot be undone. Are you sure?</div>
            <div className="flex gap-2"><Btn color="rose" onClick={clearAll}>Yes, Delete Everything</Btn><Btn color="slate" onClick={()=>setConfirmClear(false)}>Cancel</Btn></div>
          </div>}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-6 flex flex-col gap-4">
          <div><div className="font-semibold text-slate-200 mb-1">📤 Export Data</div><div className="text-sm" style={{color:C.muted}}>Download JSON backup of all your data.</div></div>
          <Btn onClick={exp}>Download Backup</Btn>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`}} className="rounded-xl p-6 flex flex-col gap-4">
          <div><div className="font-semibold text-slate-200 mb-1">📥 Import Data</div><div className="text-sm" style={{color:C.muted}}>Restore from a previously exported backup.</div></div>
          <label style={{background:"#1d4ed8",borderRadius:8}} className="px-4 py-2 text-sm font-medium text-white cursor-pointer text-center hover:bg-blue-500 transition-colors">
            Choose Backup File<input type="file" accept=".json" onChange={imp} className="hidden"/>
          </label>
        </div>
      </div>
      <div style={{background:"#1c0a0a",border:"1px solid #7f1d1d"}} className="rounded-xl p-5">
        <div className="font-semibold text-rose-400 mb-1">🔄 Reset to Demo Data</div>
        <div className="text-sm text-rose-300/70 mb-4">Restore original demo records.</div>
        <Btn color="rose" onClick={resetDemo}>Reset to Demo</Btn>
      </div>
    </div>
  );
}

// ─── NAV & APP ────────────────────────────────────────────────────────────────
const NAV=[
  {id:"dashboard",label:"Dashboard",icon:"🏠"},
  {id:"planning",label:"Monthly Planning",icon:"🎯"},
  {id:"accounts",label:"Accounts",icon:"🏦"},
  {id:"ledger",label:"Ledger",icon:"📒"},
  {id:"expenses",label:"Expenses",icon:"🛒"},
  {id:"income",label:"Income",icon:"💰"},
  {id:"loans",label:"Loans & EMI",icon:"📋"},
  {id:"debts",label:"Debts",icon:"🤝"},
  {id:"assets",label:"Assets",icon:"💎"},
  {id:"networth",label:"Net Worth",icon:"📈"},
  {id:"timeline",label:"Timeline",icon:"⏱️"},
  {id:"reports",label:"Reports",icon:"📊"},
  {id:"backup",label:"Backup",icon:"💾"},
];

export default function App(){
  const [data,setData]=useState(load);
  const [view,setView]=useState("dashboard");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const nav=NAV.find(n=>n.id===view);
  const totalCash=data.accounts.reduce((s,a)=>s+a.balance,0);
  const totalAssets=data.assets.reduce((s,a)=>s+a.currentValue,0)+totalCash;
  const totalLoans=data.loans.reduce((s,l)=>s+l.outstandingAmount,0);
  const totalIOwe=data.debts.iOwe.filter(d=>d.status==="Pending").reduce((s,d)=>s+d.amount,0);
  const totalOwedMe=data.debts.owedToMe.filter(d=>d.status==="Pending").reduce((s,d)=>s+d.amount,0);
  const nw=totalAssets+totalOwedMe-totalLoans-totalIOwe;

  const VIEWS={
    dashboard:<Dashboard data={data}/>,
    planning:<PlanningView data={data} setData={setData}/>,
    accounts:<AccountsView data={data} setData={setData}/>,
    ledger:<LedgerView data={data} setData={setData}/>,
    expenses:<ExpenseView data={data} setData={setData}/>,
    income:<IncomeView data={data} setData={setData}/>,
    loans:<LoansView data={data} setData={setData}/>,
    debts:<DebtView data={data} setData={setData}/>,
    assets:<AssetsView data={data} setData={setData}/>,
    networth:<NetWorthView data={data}/>,
    timeline:<TimelineView data={data}/>,
    reports:<ReportsView data={data}/>,
    backup:<BackupView data={data} setData={setData}/>,
  };

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:C.text}}>
      {sidebarOpen&&<div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <aside style={{background:C.panel,borderRight:`1px solid ${C.border}`,width:240}}
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transform transition-transform duration-200 ${sidebarOpen?"translate-x-0":"-translate-x-full"} md:translate-x-0`}>
        <div className="p-5 border-b" style={{borderColor:C.border}}>
          <div className="font-bold text-lg text-white">₹ FinanceOS</div>
          <div className="text-xs mt-1" style={{color:C.muted}}>Net Worth: <span className="text-emerald-400 font-semibold">{fmtS(nw)}</span></div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>{setView(n.id);setSidebarOpen(false);}}
              style={{background:view===n.id?C.bg:"transparent",color:view===n.id?C.text:C.muted,borderRadius:10}}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium mb-0.5 hover:bg-slate-800 transition-colors text-left">
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="md:ml-60">
        <header style={{background:C.panel,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:30}} className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={()=>setSidebarOpen(true)}>
              <svg width={20} height={20} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/></svg>
            </button>
            <h1 className="font-semibold text-slate-200">{nav?.icon} {nav?.label}</h1>
          </div>
          <div className="text-xs" style={{color:C.muted}}>{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>
        </header>
        <main className="p-4 md:p-6 max-w-5xl">{VIEWS[view]}</main>
      </div>
    </div>
  );
}
