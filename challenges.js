const AUTO=[
{t:"Gennaio · Acqua e ripartenza",k:["Bevi acqua durante la giornata (almeno 1,5 litri)","Una tisana o un tè non zuccherato al posto di una bevanda zuccherata","Prepara in anticipo i pasti di domani"]},
{t:"Febbraio · Colori nel piatto",k:["Almeno due colori di verdura al pasto","Una frutta di stagione","Verdura anche a cena"]},
{t:"Marzo · Primavera in movimento",k:["Cammina almeno 20 minuti","Scegli le scale quando puoi","5 minuti di stretching"]},
{t:"Aprile · Mangio con calma",k:["Pasto senza telefono né TV","Mastica lentamente e posa le posate tra un boccone e l'altro","Fermati quando senti di essere sazio"]},
{t:"Maggio · Fibre amiche",k:["Legumi o cereali integrali in un pasto","Una manciata di frutta secca","Verdura cruda al pasto"]},
{t:"Giugno · Estate fresca",k:["Acqua aromatizzata con limone o menta","Frutta di stagione come spuntino","Un piatto freddo completo (cereale, proteina, verdura)"]},
{t:"Luglio · Spuntini furbi",k:["Spuntino di frutta o yogurt al posto di uno snack confezionato","Porta con te una borraccia","Leggi l'etichetta di un prodotto che compri"]},
{t:"Agosto · Relax e sonno",k:["Vai a letto sempre alla stessa ora","10 minuti di respirazione o relax","Niente schermi 30 minuti prima di dormire"]},
{t:"Settembre · Si riparte",k:["Colazione completa","Pianifica la spesa e i pasti della settimana","30 minuti di movimento"]},
{t:"Ottobre · Sapori d'autunno",k:["Verdura di stagione (zucca, cavolo, funghi…)","Una zuppa o un piatto caldo con legumi","Una passeggiata all'aria aperta"]},
{t:"Novembre · Energia d'autunno",k:["Frutta di stagione (mele, pere, arance, cachi)","10 minuti di luce naturale all'aperto","Una tisana calda alla sera"]},
{t:"Dicembre · Feste in equilibrio",k:["Una passeggiata dopo i pasti delle feste","Porzioni consapevoli: assaggia tutto con calma","Un bicchiere d'acqua tra un brindisi e l'altro"]}];
function challengeFor(data,d=new Date()){const m=d.toISOString().slice(0,7),c=data&&data.challenge;
 if(c&&c.month===m&&c.title&&c.tasks&&c.tasks.length)return c;
 const a=AUTO[d.getMonth()];return{month:m,title:a.t,tasks:a.k,target:20,auto:true}}
