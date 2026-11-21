/* CODEHUB v2 — frontend MVP. Do not put secret keys in this file. */
const CATEGORIES = [
  {id:"c", name:"C Programming", symbol:"C", description:"Variables, loops and core C concepts.", premium:false},
  {id:"java", name:"Java", symbol:"J", description:"OOP, syntax and Java fundamentals.", premium:false},
  {id:"python", name:"Python", symbol:"Py", description:"Python basics and data structures.", premium:false},
  {id:"dbms", name:"DBMS", symbol:"DB", description:"SQL, keys and database concepts.", premium:false},
  {id:"aptitude", name:"Aptitude", symbol:"∑", description:"Number series, logic and arithmetic.", premium:false},
  {id:"premium", name:"Premium Challenge", symbol:"★", description:"Advanced practice pack for members.", premium:true}
];

const QUESTION_BANK = {
 c:[
  q("Which function is the starting point of a C program?",["start()","main()","run()","init()"],1,"Execution of a standard hosted C program begins at main()."),
  q("Which header is needed for printf()?",["stdlib.h","string.h","stdio.h","math.h"],2,"stdio.h declares standard input/output functions such as printf() and scanf()."),
  q("Which operator checks equality?",["=","==","!=","<="],1,"The == operator compares two values. A single = assigns a value."),
  q("Which loop executes its body at least once?",["for","while","do-while","none"],2,"A do-while loop checks its condition after executing the body."),
  q("What is the index of the first element in a C array?",["0","1","-1","Depends"],0,"C arrays use zero-based indexing, so the first element is at index 0.")
 ],
 java:[
  q("Which keyword is used to create a class in Java?",["function","class","define","struct"],1,"The class keyword declares a class in Java."),
  q("Which method is the usual Java application entry point?",["start()","run()","main()","init()"],2,"A standard Java application starts from public static void main(String[] args)."),
  q("Which concept allows one class to acquire another class's properties?",["Encapsulation","Inheritance","Compilation","Casting"],1,"Inheritance lets a subclass reuse and extend a superclass."),
  q("Which keyword creates an object?",["new","this","super","void"],0,"The new operator allocates an object and invokes its constructor."),
  q("Which type stores true or false?",["int","char","boolean","String"],2,"The primitive boolean type stores either true or false.")
 ],
 python:[
  q("Which symbol starts a single-line comment in Python?",["//","#","<!--","/*"],1,"A hash symbol (#) begins a single-line comment in Python."),
  q("Which keyword defines a function?",["func","define","def","function"],2,"Python uses def followed by a function name and parentheses."),
  q("What does len([2,4,6]) return?",["2","3","6","12"],1,"The list contains three elements, so len() returns 3."),
  q("Which data type stores key-value pairs?",["list","tuple","dictionary","set"],2,"A dictionary maps unique keys to values."),
  q("Which keyword is used for a conditional branch?",["if","when","case","check"],0,"The if statement runs a block when its condition is true.")
 ],
 dbms:[
  q("What does DBMS stand for?",["Data Backup Management System","Database Management System","Digital Base Memory System","Data Binary Management Service"],1,"DBMS means Database Management System: software used to define, store and manage databases."),
  q("Which SQL command retrieves rows?",["GET","OPEN","SELECT","FETCHALL"],2,"SELECT retrieves data from one or more database tables."),
  q("What is a primary key?",["A key that may repeat","A unique, non-null row identifier","A password","A duplicate column"],1,"A primary key uniquely identifies each row and cannot contain NULL."),
  q("Which normal form removes partial dependency on a candidate key?",["1NF","2NF","3NF","BCNF"],1,"Second Normal Form requires 1NF and no partial dependency of non-prime attributes on a candidate key."),
  q("Which SQL clause filters grouped results?",["WHERE","ORDER BY","HAVING","FROM"],2,"HAVING filters groups after GROUP BY; WHERE filters rows before grouping.")
 ],
 aptitude:[
  q("What is 15% of 200?",["15","20","30","35"],2,"10% of 200 is 20 and 5% is 10; together 15% is 30."),
  q("Find the next number: 2, 4, 8, 16, ...",["18","24","30","32"],3,"Each term is multiplied by 2, so the next number is 32."),
  q("A train travels 120 km in 2 hours. What is its average speed?",["40 km/h","50 km/h","60 km/h","80 km/h"],2,"Average speed = distance ÷ time = 120 ÷ 2 = 60 km/h."),
  q("If 5 pens cost ₹50, what is the cost of 8 pens at the same rate?",["₹60","₹70","₹80","₹100"],2,"One pen costs ₹10, so eight pens cost ₹80."),
  q("Choose the odd one out.",["2","3","5","9"],3,"2, 3 and 5 are prime numbers. 9 is composite.")
 ],
 premium:[
  q("Which C storage class gives a local variable static storage duration?",["auto","register","static","extern"],2,"A local static variable retains its value between function calls."),
  q("In Java, which interface is the root of the collection hierarchy?",["Map","Collection","Iterable only","Serializable"],1,"Collection is the root interface for List, Set and Queue; Map is a separate hierarchy."),
  q("Which SQL operation combines rows from two query results and removes duplicates by default?",["UNION","JOIN","CROSS JOIN","INTERSECT ALL"],0,"UNION combines compatible result sets and removes duplicate rows unless UNION ALL is used.")
 ]
};
function q(question, options, answer, explanation){return {question,options,answer,explanation};}

const $ = id => document.getElementById(id);
const cfg = window.CODEHUB_CONFIG || {};
const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.startsWith("PASTE_") &&
  cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.startsWith("PASTE_");
let sb = null, currentUser = null, authMode = "login", currentQuiz = null, questionIndex = 0, score = 0, answered = false;

function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3000);}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function renderCards(){
 $("quiz-grid").innerHTML=CATEGORIES.map(cat=>`
  <article class="quiz-card">
   <div class="quiz-symbol">${escapeHtml(cat.symbol)}</div>
   <h3>${escapeHtml(cat.name)}</h3><p>${escapeHtml(cat.description)}</p>
   <button class="btn ${cat.premium?"btn-dark":""}" data-quiz="${cat.id}">${cat.premium?"Unlock / Start":"Start quiz"}</button>
  </article>`).join("");
 document.querySelectorAll("[data-quiz]").forEach(btn=>btn.addEventListener("click",()=>startQuiz(btn.dataset.quiz)));
}
function startQuiz(id){
 if(id==="premium" && !currentUser){toast("Login first to check Premium access.");$("auth-dialog").showModal();return;}
 if(id==="premium" && !window._isPremium){toast("Premium access is not active on this account yet.");$("premium-status").textContent="Premium is not active. Contact the site owner after verified payment.";return;}
 currentQuiz=id;questionIndex=0;score=0;answered=false;
 $("result-panel").classList.add("hidden");$("quiz-panel").classList.remove("hidden");
 $("quiz-panel").scrollIntoView({behavior:"smooth",block:"start"});renderQuestion();
}
function renderQuestion(){
 const questions=QUESTION_BANK[currentQuiz], item=questions[questionIndex];answered=false;
 $("quiz-category").textContent=CATEGORIES.find(c=>c.id===currentQuiz).name;
 $("quiz-progress").textContent=`Question ${questionIndex+1} of ${questions.length}`;
 $("progress-fill").style.width=`${(questionIndex/questions.length)*100}%`;
 $("question-text").textContent=item.question;
 $("answer-options").innerHTML=item.options.map((opt,i)=>`<button class="answer-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${escapeHtml(opt)}</button>`).join("");
 $("explanation").classList.add("hidden");$("explanation").textContent="";
 $("next-btn").disabled=true;$("next-btn").textContent=questionIndex===questions.length-1?"Finish quiz":"Next question →";
 document.querySelectorAll("[data-answer]").forEach(btn=>btn.addEventListener("click",()=>chooseAnswer(Number(btn.dataset.answer))));
}
function chooseAnswer(index){
 if(answered)return;answered=true;const item=QUESTION_BANK[currentQuiz][questionIndex];
 if(index===item.answer)score++;
 document.querySelectorAll("[data-answer]").forEach((btn,i)=>{btn.disabled=true;if(i===item.answer)btn.classList.add("correct");else if(i===index)btn.classList.add("wrong");});
 $("explanation").innerHTML=`<strong>${index===item.answer?"Correct!":"Not quite."}</strong> ${escapeHtml(item.explanation)}`;
 $("explanation").classList.remove("hidden");$("next-btn").disabled=false;
}
$("next-btn").addEventListener("click",async()=>{
 if(!answered)return;
 if(questionIndex<QUESTION_BANK[currentQuiz].length-1){questionIndex++;renderQuestion();}
 else await finishQuiz();
});
$("quit-btn").addEventListener("click",()=>{$("quiz-panel").classList.add("hidden");});
$("retry-btn").addEventListener("click",()=>{$("result-panel").classList.add("hidden");$("quizzes").scrollIntoView({behavior:"smooth"});});
async function finishQuiz(){
 const total=QUESTION_BANK[currentQuiz].length, percent=Math.round(score/total*100);
 $("quiz-panel").classList.add("hidden");$("result-panel").classList.remove("hidden");
 $("result-title").textContent=percent>=80?"Excellent work!":percent>=50?"Good effort!":"Keep practising!";
 $("result-score").textContent=`${score} / ${total}`;
 $("result-message").textContent=`You scored ${percent}%. Review the explanations and try again.`;
 $("progress-fill").style.width="100%";$("result-panel").scrollIntoView({behavior:"smooth"});
 if(sb && currentUser){
   const {error}=await sb.from("scores").insert({user_id:currentUser.id,category:currentQuiz,score,total});
   if(error)toast("Score shown, but leaderboard save failed. Check Supabase setup.");
   else loadLeaderboard();
 } else toast("Sign in to save your score to the leaderboard.");
}

function setAuthUI(user){
 currentUser=user||null;
 $("user-label").textContent=user?(user.user_metadata?.display_name||user.email):"Guest mode";
 $("auth-open").classList.toggle("hidden",!!user);$("logout-btn").classList.toggle("hidden",!user);
 if(user) checkPremium(); else {window._isPremium=false;$("premium-status").textContent="Sign in to check your access.";}
}
$("auth-open").addEventListener("click",()=>{$("auth-dialog").showModal();});
$("logout-btn").addEventListener("click",async()=>{if(sb)await sb.auth.signOut();setAuthUI(null);toast("Logged out.");});
$("login-tab").addEventListener("click",()=>setAuthMode("login"));
$("signup-tab").addEventListener("click",()=>setAuthMode("signup"));
function setAuthMode(mode){authMode=mode;$("login-tab").classList.toggle("active",mode==="login");$("signup-tab").classList.toggle("active",mode==="signup");$("display-name").classList.toggle("hidden",mode!=="signup");$("auth-title").textContent=mode==="login"?"Welcome back":"Create your account";$("auth-submit").textContent=mode==="login"?"Login":"Create account";$("auth-message").textContent="";}
$("auth-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!sb){$("auth-message").textContent="Add Supabase URL and publishable key in config.js first.";return;}
 const email=$("email").value.trim(),password=$("password").value,displayName=$("display-name").value.trim();
 $("auth-submit").disabled=true;$("auth-message").textContent="Please wait…";
 try{
  if(authMode==="signup"){
   const {data,error}=await sb.auth.signUp({email,password,options:{data:{display_name:displayName||email.split("@")[0]},emailRedirectTo:location.href}});
   if(error)throw error;
   if(data.session){setAuthUI(data.user);$("auth-dialog").close();toast("Account created.");}
   else $("auth-message").textContent="Check your email and click the confirmation link, then log in.";
  }else{
   const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;
   setAuthUI(data.user);$("auth-dialog").close();toast("Welcome to CODEHUB!");
  }
 }catch(err){$("auth-message").textContent=err.message||"Authentication failed.";}
 finally{$("auth-submit").disabled=false;}
});
async function checkPremium(){
 window._isPremium=false;
 if(!sb||!currentUser)return;
 const {data,error}=await sb.from("profiles").select("is_premium").eq("id",currentUser.id).maybeSingle();
 if(!error && data)window._isPremium=!!data.is_premium;
 $("premium-status").textContent=window._isPremium?"Premium is active on your account.":"Premium is not active. Contact the site owner after verified payment.";
}
$("premium-btn").addEventListener("click",async()=>{
 if(!currentUser){$("auth-dialog").showModal();return;}
 await checkPremium();toast(window._isPremium?"Premium access active. Choose Premium Challenge above.":"Premium access is not active yet.");
 if(window._isPremium)startQuiz("premium");
});
async function loadLeaderboard(){
 const body=$("leaderboard-body");
 if(!sb){body.innerHTML='<tr><td colspan="4">Connect Supabase to enable the live leaderboard.</td></tr>';return;}
 const {data,error}=await sb.from("leaderboard").select("display_name,category,score,total,created_at").limit(20);
 if(error){body.innerHTML='<tr><td colspan="4">Leaderboard unavailable. Check the SQL setup and RLS policies.</td></tr>';return;}
 if(!data?.length){body.innerHTML='<tr><td colspan="4">No scores yet. Be the first to complete a quiz!</td></tr>';return;}
 body.innerHTML=data.map((row,i)=>`<tr><td>#${i+1}</td><td>${escapeHtml(row.display_name||"Student")}</td><td>${escapeHtml(row.category.toUpperCase())}</td><td>${row.score}/${row.total}</td></tr>`).join("");
}
function init(){
 $("year").textContent=new Date().getFullYear();renderCards();setAuthMode("login");
 if(!configured || !window.supabase){loadLeaderboard();$("premium-status").textContent="Connect Supabase to enable Premium accounts.";return;}
 sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 sb.auth.getSession().then(({data})=>setAuthUI(data.session?.user||null));
 sb.auth.onAuthStateChange((_event,session)=>setAuthUI(session?.user||null));
 loadLeaderboard();
}
init();
