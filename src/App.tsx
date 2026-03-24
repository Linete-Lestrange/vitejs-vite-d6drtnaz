import { useState, useEffect, useMemo } from "react";

const ICONS = {
  Vacaciones: "🏖️",
  Educación:"📚",
  Skyncare: "💄",
  Bebidas: "🏠",
  Articulos_para_la_casa: "🏠",
  Comida: "🥗",
  Transporte: "🚗",
  Salud: "🏥",
  Entretenimiento: "🎮",
  Deuda: "💳",
  Diversión: "🎢",
  Regalos: "🎁",
  Ropa: "👗",
  Accesorios: "🕶️",
  Calzado: "👟",
  Higiene_personal: "🧴",
  Antojos: "🍕",
  Crixus: "🐶",
  Otros: "📦"
};

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function App() {

  const [screen, setScreen] = useState(1);

  const [salary, setSalary] = useState(() => Number(localStorage.getItem("salary")) || 0);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem("expenses") || "[]"));
  const [destinations, setDestinations] = useState(() => JSON.parse(localStorage.getItem("destinations") || "[]"));

  const [paid, setPaid] = useState(() => JSON.parse(localStorage.getItem("paid") || "{}"));

  const [newDestination, setNewDestination] = useState({ name: "", account: "" });

  const [newExpense, setNewExpense] = useState({
    name: "",
    target: "",
    amount: "",
    icon: "otros",
    frequency: "mensual",
    months: 1,
    startMonth: new Date().getMonth(),
  });

  useEffect(()=>localStorage.setItem("expenses",JSON.stringify(expenses)),[expenses]);
  useEffect(()=>localStorage.setItem("salary",salary),[salary]);
  useEffect(()=>localStorage.setItem("destinations",JSON.stringify(destinations)),[destinations]);
  useEffect(()=>localStorage.setItem("paid",JSON.stringify(paid)),[paid]);

  // AGRUPAR
  const grouped = useMemo(()=>{
    const map:any = {};

    expenses.forEach(e=>{
      let amount = Number(e.amount);
      if(e.frequency==="mensual") amount/=2;
      if(e.frequency==="anual") amount/=24;

      if(!map[e.target]) map[e.target]={total:0, icon:e.icon};
      map[e.target].total += amount;
    });

    return Object.entries(map);
  },[expenses]);

  // SALDO
  const totalPagado = grouped.reduce((acc,[t,data]:any)=>{
    return paid[t] ? acc + data.total : acc;
  },0);

  const balance = salary/2 - totalPagado;

  // 📊 GRÁFICAS
  const monthlyData = useMemo(()=>{
    const data = Array(12).fill(0);

    expenses.forEach(e=>{
      let val = Number(e.amount);

      for(let i=0;i<Number(e.months);i++){
        const m = (e.startMonth + i) % 12;

        if(e.frequency==="quincenal") val = val * 2;
        if(e.frequency==="anual") val = val / 12;

        data[m] += val;
      }
    });

    return data;
  },[expenses]);

  // 📅 CALENDARIO
  const calendarDays = useMemo(()=>{
    const days:any = {};
    DAYS.forEach(d=>days[d]=[]);

    expenses.forEach(e=>{
      const randomDay = Math.floor(Math.random()*30)+1;
      days[randomDay].push(e);
    });

    return days;
  },[expenses]);

  // FUNCIONES
  const addExpense=()=>{
    if(!newExpense.name) return;

    setExpenses([...expenses,{...newExpense,id:Date.now()}]);

    alert("✅ Gasto registrado");

    setNewExpense({
      name:"",
      target:"",
      amount:"",
      icon:"otros",
      frequency:"mensual",
      months:1,
      startMonth:new Date().getMonth(),
    });
  };

  const addDestination=()=>{
    if(!newDestination.name) return;
    setDestinations([...destinations,{...newDestination,id:Date.now()}]);
    setNewDestination({name:"",account:""});
  };

  const deleteExpense=(id:number)=>setExpenses(expenses.filter(e=>e.id!==id));
  const deleteDestination=(id:number)=>setDestinations(destinations.filter(d=>d.id!==id));

  return (
    <div style={styles.app}>

      <div style={styles.header}><h2>Gastos Linete</h2></div>

      {/* HOME */}
      {screen===1 && (
        <div style={styles.screen}>
          <div style={styles.balanceCard}>
            <h1>${balance.toFixed(0)}</h1>
            <p>Saldo quincenal</p>
          </div>

          <h3>Pagos</h3>
          {grouped.map(([t,data]:any,i)=>{

            const isPaid = paid[t];

            return (
              <div key={i} style={{
                ...styles.item,
                opacity: isPaid ? 0.5 : 1,
                textDecoration: isPaid ? "line-through" : "none",
                color: isPaid ? "#9ca3af" : "#374151"
              }}>
                <span>{ICONS[data.icon]} {t}</span>
                <span>${data.total.toFixed(0)}</span>

                <input 
                  type="checkbox"
                  checked={!!paid[t]}
                  onChange={()=>{
                    const copy:any = {...paid};
                    if(copy[t]) delete copy[t];
                    else copy[t]=true;
                    setPaid(copy);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* GASTOS */}
      {screen===2 && (
        <div style={styles.screen}>
          <h2>Gastos</h2>
          {expenses.map((e:any)=>(
            <div key={e.id} style={styles.card}>
              <div>{ICONS[e.icon]} {e.name}</div>
              <input type="number" value={e.amount}
                onChange={(ev)=>{
                  setExpenses(expenses.map(x=>x.id===e.id?{...x,amount:ev.target.value}:x))
                }}/>
              <button onClick={()=>deleteExpense(e.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {/* CONFIG */}
      {screen===3 && (
        <div style={styles.screen}>
          <h2>Configuración</h2>

          <div style={styles.card}>
            <p>Salario</p>
            <input type="number" value={salary}
              onChange={(e)=>setSalary(Number(e.target.value))}/>
          </div>

          <div style={styles.card}>
            <h3>Destinos</h3>
            {destinations.map((d:any)=>(
              <div key={d.id} style={styles.item}>
                <span>{d.name}</span>
                <span>{d.account}</span>
                <button onClick={()=>deleteDestination(d.id)}>❌</button>
              </div>
            ))}

            <input placeholder="Destino"
              value={newDestination.name}
              onChange={(e)=>setNewDestination({...newDestination,name:e.target.value})}/>

            <input placeholder="Cuenta"
              value={newDestination.account}
              onChange={(e)=>setNewDestination({...newDestination,account:e.target.value})}/>

            <button onClick={addDestination}>Agregar</button>
          </div>

          <div style={styles.card}>
            <h4>Nuevo gasto</h4>

            <input placeholder="Concepto"
              value={newExpense.name}
              onChange={(e)=>setNewExpense({...newExpense,name:e.target.value})}/>

            <select value={newExpense.target}
              onChange={(e)=>setNewExpense({...newExpense,target:e.target.value})}>
              <option value="">Seleccionar destino</option>
              {destinations.map((d:any)=>(<option key={d.id}>{d.name}</option>))}
            </select>

            <input type="number" placeholder="Monto"
              value={newExpense.amount}
              onChange={(e)=>setNewExpense({...newExpense,amount:e.target.value})}/>

            <select value={newExpense.frequency}
              onChange={(e)=>setNewExpense({...newExpense,frequency:e.target.value})}>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>

            <input type="number" placeholder="Duración"
              value={newExpense.months}
              onChange={(e)=>setNewExpense({...newExpense,months:e.target.value})}/>

            <select value={newExpense.startMonth}
              onChange={(e)=>setNewExpense({...newExpense,startMonth:Number(e.target.value)})}>
              {MONTHS.map((m,i)=>(<option key={i} value={i}>{m}</option>))}
            </select>

            <select value={newExpense.icon}
              onChange={(e)=>setNewExpense({...newExpense,icon:e.target.value})}>
              {Object.keys(ICONS).map(k=>(<option key={k}>{ICONS[k]} {k}</option>))}
            </select>

            <button onClick={addExpense}>Agregar</button>
          </div>
        </div>
      )}

      {/* 📊 GRAFICAS */}
      {screen===4 && (
        <div style={styles.screen}>
          <h2>Gráficas</h2>
          {monthlyData.map((v,i)=>(
            <div key={i} style={styles.barRow}>
              <span>{MONTHS[i]}</span>
              <div style={{...styles.bar, width:v/5}} />
            </div>
          ))}
        </div>
      )}

      {/* 📅 CALENDARIO */}
      {screen===5 && (
        <div style={styles.screen}>
          <h2>Calendario</h2>
          <div style={styles.grid}>
            {DAYS.map(d=>(
              <div key={d} style={styles.day}>
                <strong>{d}</strong>
                {calendarDays[d].map((e:any,i)=>(
                  <div key={i}>{ICONS[e.icon]} {e.amount}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAV */}
      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={()=>setScreen(1)}>🏠</button>
        <button style={styles.navBtn} onClick={()=>setScreen(2)}>💸</button>
        <button style={styles.navBtn} onClick={()=>setScreen(3)}>⚙️</button>
        <button style={styles.navBtn} onClick={()=>setScreen(4)}>📊</button>
        <button style={styles.navBtn} onClick={()=>setScreen(5)}>📅</button>
      </div>

    </div>
  );
}

const styles={
  app:{ minHeight:"100vh", background:"#FAF1E8"},
  header:{ background:"#C3CDCF", padding:16, textAlign:"center"},
  screen:{ padding:16, marginBottom:80},
  balanceCard:{ background:"#E6CDB9", padding:20, borderRadius:20},
  card:{ background:"#F6E6D7", padding:12, borderRadius:16, marginBottom:10},
  item:{ display:"flex", justifyContent:"space-between", alignItems:"center"},
  nav:{ position:"fixed", bottom:0, width:"100%", display:"flex", justifyContent:"space-around", background:"#E2E1DD"},
  navBtn:{ fontSize:20, background:"transparent", border:"none" },
  grid:{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8},
  day:{ background:"#F6E6D7", padding:6, borderRadius:10, minHeight:70},
  barRow:{ display:"flex", alignItems:"center", gap:10},
  bar:{ height:10, background:"#C3CDCF", borderRadius:10}
};