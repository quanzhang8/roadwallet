import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  set
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";



// ===============================
// Firebase Configuration
// ===============================


const firebaseConfig = {

  databaseURL:
  "https://roadwallet-73e92-default-rtdb.firebaseio.com"

};



const app = initializeApp(firebaseConfig);

const database = getDatabase(app);



const expensesRef =
ref(database, "expenses");


const travelersRef =
ref(database, "travelers");




// ===============================
// HTML Elements
// ===============================


const expenseForm =
document.getElementById("expense-form");


const expenseCategory =
document.getElementById("expense-category");


const expenseAmount =
document.getElementById("expense-amount");


const expensePayer =
document.getElementById("expense-payer");


const expenseList =
document.getElementById("expense-list");


const totalExpensesAmountElement =
document.getElementById("total-expenses-amount");



const travelersForm =
document.getElementById("travelers-form");


const travelerNameInput =
document.getElementById("traveler-name");


const travelersList =
document.getElementById("travelers-list");



const summaryBody =
document.getElementById("summary-body");



const settlementList =
document.getElementById("settlement-list");




// Modal

const modal =
document.getElementById("travelers-modal");


const openModalButton =
document.getElementById("open-modal-button");


const closeButton =
document.querySelector(".close-button");






// ===============================
// Data
// ===============================


let expenses = [];

let travelers = [];






// ===============================
// Modal Controls
// ===============================


openModalButton.onclick = () => {

  modal.classList.add(
    "display-modal"
  );

};



closeButton.onclick = () => {

  modal.classList.remove(
    "display-modal"
  );

};



window.onclick = (event)=>{

  if(event.target === modal){

    modal.classList.remove(
      "display-modal"
    );

  }

};








// ===============================
// Form Events
// ===============================


expenseForm.addEventListener(
"submit",
(event)=>{

event.preventDefault();

addExpense();

});





travelersForm.addEventListener(
"submit",
(event)=>{

event.preventDefault();

addTraveler();

});







// ===============================
// Add Traveler
// ===============================


function addTraveler(){


const name =
travelerNameInput.value.trim();



if(!name)
return;



const newTraveler =
push(travelersRef);



set(
newTraveler,
{

name:name

}

);



travelerNameInput.value="";


}







// ===============================
// Add Expense
// ===============================


function addExpense(){


const amount =
Number(
expenseAmount.value
);



const category =
expenseCategory.value;



const paidBy =
expensePayer.value;



if(!paidBy){

alert(
"Please select who paid."
);

return;

}



const newExpense =
push(expensesRef);



set(
newExpense,
{

category,

amount,

paidBy

}

);



expenseForm.reset();


}








// ===============================
// Firebase Listeners
// ===============================


onValue(
expensesRef,
(snapshot)=>{


expenses=[];


snapshot.forEach(
(child)=>{


expenses.push({

id:child.key,

...child.val()

});


});



refresh();


});







onValue(
travelersRef,
(snapshot)=>{


travelers=[];


snapshot.forEach(
(child)=>{


travelers.push({

id:child.key,

...child.val()

});


});



refresh();


});










// ===============================
// Refresh Everything
// ===============================


function refresh(){


updateTotalExpenses();


updateExpenseHistory();


updatePayerDropdown();


calculateBalances();


}









// ===============================
// Total Expense
// ===============================


function updateTotalExpenses(){


const total =
expenses.reduce(
(sum,item)=>
sum + Number(item.amount || 0),
0
);



totalExpensesAmountElement.textContent =

"$" + total.toFixed(2);


}








// ===============================
// Expense History
// ===============================


function updateExpenseHistory(){


expenseList.innerHTML="";



expenses.forEach(
(expense)=>{


const li =
document.createElement("li");



li.innerHTML = `

<div>

<strong>
${expense.category}
</strong>

<br>

$${Number(expense.amount).toFixed(2)}

<br>

Paid by:
${expense.paidBy || "Unknown"}

</div>

`;



li.appendChild(
createDeleteButton(
expense.id,
deleteExpense
)
);



expenseList.appendChild(li);



});


}








// ===============================
// Payer Dropdown
// ===============================


function updatePayerDropdown(){


expensePayer.innerHTML =

`
<option value="">
Select traveler
</option>
`;



travelers.forEach(
(person)=>{


const option =
document.createElement("option");


option.value =
person.name;


option.textContent =
person.name;



expensePayer.appendChild(option);



});


}








// ===============================
// Balance Calculation
// ===============================


function calculateBalances(){


if(travelers.length === 0){

travelersList.innerHTML="";

summaryBody.innerHTML="";

return;

}



let balances={};



travelers.forEach(
(person)=>{


balances[person.name]={

paid:0,

share:0,

balance:0

};


});





expenses.forEach(
(expense)=>{


if(
balances[expense.paidBy]
){

balances[expense.paidBy].paid +=

Number(expense.amount);

}


});





const total =

expenses.reduce(
(sum,item)=>
sum + Number(item.amount || 0),
0
);



const share =

total / travelers.length;





travelers.forEach(
(person)=>{


balances[person.name].share =
share;



balances[person.name].balance =

balances[person.name].paid-share;



});





displaySummaryTable(
balances
);



displayBalances(
balances
);



createSettlement(
balances
);


}









// ===============================
// Summary Table
// ===============================


function displaySummaryTable(balances){


summaryBody.innerHTML="";



travelers.forEach(
(person)=>{


const data =
balances[person.name];



const row =
document.createElement("tr");



let net;



if(data.balance > 0){

net =
"+$" + data.balance.toFixed(2);

}

else if(data.balance < 0){

net =
"-$" + Math.abs(data.balance).toFixed(2);

}

else{

net="$0.00";

}





row.innerHTML=

`

<td>
${person.name}
</td>


<td>
$${data.paid.toFixed(2)}
</td>


<td>
$${data.share.toFixed(2)}
</td>


<td>
${net}
</td>

`;



summaryBody.appendChild(row);


});


}







// ===============================
// Traveler Balance Cards
// ===============================


function displayBalances(balances){


travelersList.innerHTML="";



travelers.forEach(
(person)=>{


const data =
balances[person.name];


const div =
document.createElement("div");


div.className =
"traveler-item";



let status;



if(data.balance > 0){

status =
`Receives $${data.balance.toFixed(2)}`;

div.classList.add(
"receive"
);

}


else if(data.balance < 0){

status =
`Owes $${Math.abs(data.balance).toFixed(2)}`;

div.classList.add(
"owe"
);

}

else{

status="Settled";

}




div.innerHTML=

`

<div>

<strong>
${person.name}
</strong>

<br>

Paid:
$${data.paid.toFixed(2)}

<br>

${status}

</div>

`;



div.appendChild(

createDeleteButton(

person.id,

deleteTraveler

)

);



travelersList.appendChild(div);



});


}








// ===============================
// Settlement Optimization
// ===============================


function createSettlement(balances){


let debtors=[];

let creditors=[];



Object.keys(balances)
.forEach(
(name)=>{


const amount =

Number(
balances[name].balance.toFixed(2)
);



if(amount < 0){

debtors.push({

name,

amount:
Math.abs(amount)

});

}



if(amount > 0){

creditors.push({

name,

amount

});

}



});





let transactions=[];


let d=0;

let c=0;



while(

d < debtors.length &&

c < creditors.length

){



const payment =

Math.min(

debtors[d].amount,

creditors[c].amount

);




transactions.push({

from:
debtors[d].name,

to:
creditors[c].name,

amount:
payment

});




debtors[d].amount -= payment;


creditors[c].amount -= payment;



if(debtors[d].amount < .01)

d++;



if(creditors[c].amount < .01)

c++;



}




displaySettlement(
transactions
);


}







// ===============================
// Settlement Display
// ===============================


function displaySettlement(transactions){


settlementList.innerHTML="";



if(transactions.length===0){

settlementList.innerHTML=

"All expenses are settled.";

return;

}



transactions.forEach(
(item)=>{


const div =
document.createElement("div");



div.className =
"settlement-item";



div.textContent =

`${item.from} pays ${item.to} $${item.amount.toFixed(2)}`;



settlementList.appendChild(div);



});


}








// ===============================
// Delete Functions
// ===============================


function deleteExpense(id){

remove(

ref(
database,
`expenses/${id}`
)

);

}





function deleteTraveler(id){

remove(

ref(
database,
`travelers/${id}`
)

);

}








// ===============================
// Delete Button
// ===============================


function createDeleteButton(
id,
callback
){


const button =
document.createElement("button");



button.innerHTML =

"<i class='fas fa-trash-alt'></i>";



button.addEventListener(
"click",
()=>{

callback(id);

}

);



return button;


}