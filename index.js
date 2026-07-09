import { initializeApp } 
from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";


import { 
getDatabase,
ref,
push,
set,
remove,
onValue
}

from 
"https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";



// Firebase Config

const firebaseConfig = {

databaseURL:
"https://roadwallet-73e92-default-rtdb.firebaseio.com"

};



const app = initializeApp(firebaseConfig);

const database = getDatabase(app);



const expensesRef =
ref(database,"expenses");


const travelersRef =
ref(database,"travelers");



let expenses=[];

let travelers=[];




// Elements

const expenseForm =
document.getElementById("expense-form");


const travelersForm =
document.getElementById("travelers-form");


const expenseList =
document.getElementById("expense-list");


const travelersList =
document.getElementById("travelers-list");


const settlementList =
document.getElementById("settlement-list");


const paidByDropdown =
document.getElementById("expense-paid-by");


const totalDisplay =
document.getElementById("total-expenses-amount");






// Add Expense


expenseForm.addEventListener(
"submit",
(e)=>{

e.preventDefault();


const category =
document.getElementById("expense-category").value;


const amount =
Number(
document.getElementById("expense-amount").value
);



const paidBy =
paidByDropdown.value;



if(!paidBy){

alert("Please select who paid");

return;

}



const expenseRef=push(expensesRef);


set(expenseRef,{

category,
amount,
paidBy

});


expenseForm.reset();


});






// Add Traveler


travelersForm.addEventListener(
"submit",
(e)=>{


e.preventDefault();


const name =
document.getElementById("traveler-name").value.trim();



if(name){


const travelerRef=
push(travelersRef);


set(travelerRef,{

name

});


}


});







// Firebase listeners


onValue(expensesRef,(snapshot)=>{


expenses=[];


snapshot.forEach(child=>{


expenses.push({

id:child.key,

...child.val()

});


});


update();


});






onValue(travelersRef,(snapshot)=>{


travelers=[];


snapshot.forEach(child=>{


travelers.push({

id:child.key,

...child.val()

});


});


update();


});







function update(){


calculateBalances();

updateExpenses();

updateTravelers();

updateDropdown();

updateSettlement();

calculateTotal();


}






// Total expenses


function calculateTotal(){


let total =
expenses.reduce(
(sum,e)=>sum+e.amount,
0
);


totalDisplay.textContent =
"$"+total.toFixed(2);


}







// Calculate balances


function calculateBalances(){


if(travelers.length===0)
return;


const total =
expenses.reduce(
(sum,e)=>sum+e.amount,
0
);



const share =
total/travelers.length;



travelers.forEach(t=>{


const paid =
expenses

.filter(e=>e.paidBy===t.id)

.reduce(
(sum,e)=>sum+e.amount,
0
);



t.paid=paid;

t.share=share;

t.balance=
paid-share;


});


}








// Expense display


function updateExpenses(){


expenseList.innerHTML="";


expenses.forEach(e=>{


const li=document.createElement("li");


const payer =
travelers.find(
(t)=>t.id===e.paidBy
);



li.innerHTML=

`${e.category}
$${e.amount}
(Paid by ${payer?.name})`;



const btn=
deleteButton(
e.id,
"expenses"
);


li.appendChild(btn);


expenseList.appendChild(li);



});


}







// Traveler display


function updateTravelers(){


travelersList.innerHTML="";


travelers.forEach(t=>{


const div=document.createElement("div");


div.className="traveler-item";


div.innerHTML=`

<b>${t.name}</b><br>

Paid:
$${(t.paid||0).toFixed(2)}

<br>

Share:
$${(t.share||0).toFixed(2)}

<br>

Balance:

<span class="
${t.balance>=0?
'balance-positive':
'balance-negative'}
">

${t.balance>=0?"+":"-"}
$${Math.abs(t.balance||0).toFixed(2)}

</span>

`;



const btn=
deleteButton(
t.id,
"travelers"
);


div.appendChild(btn);


travelersList.appendChild(div);


});


}







// Dropdown


function updateDropdown(){


paidByDropdown.innerHTML=
"<option value=''>Paid By</option>";



travelers.forEach(t=>{


let option=
document.createElement("option");


option.value=t.id;

option.textContent=t.name;


paidByDropdown.appendChild(option);


});


}









// Settlement calculation


function updateSettlement(){


settlementList.innerHTML="";


let creditors=[];

let debtors=[];



travelers.forEach(t=>{


if(t.balance>0.01)

creditors.push({

name:t.name,

amount:t.balance

});


else if(t.balance<-0.01)

debtors.push({

name:t.name,

amount:-t.balance

});


});



let i=0;
let j=0;



while(i<debtors.length &&
j<creditors.length){


let amount=Math.min(

debtors[i].amount,

creditors[j].amount

);



let li=document.createElement("li");


li.textContent=

`${debtors[i].name} pays 
${creditors[j].name} 
$${amount.toFixed(2)}`;



settlementList.appendChild(li);



debtors[i].amount-=amount;

creditors[j].amount-=amount;



if(debtors[i].amount<0.01)
i++;


if(creditors[j].amount<0.01)
j++;


}



}







// Delete


function deleteButton(id,type){


const btn=document.createElement("button");


btn.className="delete";


btn.innerHTML="🗑";


btn.onclick=()=>{


remove(
ref(database,`${type}/${id}`)
);


};


return btn;


}