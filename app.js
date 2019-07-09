//BUDGET APP CONTROLLER
var budgetController = (function() {
	// Expenses constructor
	var Expenses = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	//Calculates percentages
	Expenses.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}else{
			this.percentage = -1;
		}
	};
	//Gets the calculated percentages(Returns)
	Expenses.prototype.getPercentage = function() {
		return this.percentage;
	};
	//Income constructor
	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};
	//calculate total private function
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum = sum + cur.value;
		});
		data.totals[type] = sum;
	};

	//budget data
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1 //None existent initially
	};

	return {
		addItem: function(type, des, val){
			var newItem, ID;
			//ID = last id + 1
			//Create new ID
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id +1;
			}else{
				ID = 0;
			}
			//Create new item based on 'inc' or 'exp' type
			if(type === 'exp'){
				newItem = new Expenses(ID, des, val);
			}else if(type === 'inc'){
				newItem = new Income(ID, des, val);
			}
			//Push it to the data structure
			data.allItems[type].push(newItem);
			//Return the new element
			return newItem;
		},
		//Delete item
		deleteItem: function(type, id){
			var ids, index;
			//id = 6
			//ids = [1,2,4,6,8]
			//data.allItems[type][id] not reliable
			//index = 3
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});
			index = ids.indexOf(id);
			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},
		//Calculats the budget
		calculateBudget: function() {
			//calculate the total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			//calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			//calculate the percentage of income spent 
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}else{
				data.percentage = -1;
			}
		},
		//Calculate percentages
		calculatePercentages: function() {
			/* asume, a=10, b=20, c=50
				total income = 100
				a=10/100 = 10%
				b=20/100 = 20%
				c=50/100 = 50% 
			*/
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},
		//Get percentages
		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},
		testing: function() {
			console.log(data);
		}
	};

})();

//UI APP CONTROLLER
var UIController = (function() {
	//private object
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	//Formating the values on UI
		var formatNumber = function(num, type) {
			var numSplit, int, dec, type;
			/* + or - before the value(amount)
				exactly 2 decimal points for each value
				a comma separating the values that are in thousands eg
				2310.456 -> + 2,310.46
			*/
			//Removes the sign of the value
			num = Math.abs(num);
			//Rounds the value to 2 decimal places
			num = num.toFixed(2);
			//Splits the value(string) with a dot
			numSplit = num.split('.');
			int = numSplit[0];
			//adding a comma
			if(int.length > 3){
				//if input = 2310, the output = 2,310
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
			}
			dec = numSplit[1];
			//Ternary operator
			//This
			/*type === 'exp' ? sign = '-': sign = '+';
			return type + ' ' + int + dec;*/ 
			//0r
			return (type === 'exp' ? '-': '+') + ' ' + int + '.' + dec;
		};
		var nodeListForEach = function(list, callback) {
			for (var i = 0; i < list.length; i++){
				callback(list[i], i);
			}
		};

	// Get input from the UI
	return {
		getInput: function() {
			//method to return 3 input data
			return {
				type: document.querySelector(DOMstrings.inputType).value, //either inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value, //item name
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)//item value
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element;
			//Create HTML string with placeholder text
			if(type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type === 'exp'){
				element = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			//Replace the placeholder text with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			//Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		//Delete item from UI
		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		//clear input fields
		clearFields: function(){
			var fields, fieldsArr;
			fields = document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputValue);
			//converts a list into an array
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});
			fieldsArr[0].focus();
		},
		//Display budget
		displayBudget: function(obj) {
			//ternary operator(same as if else statement)
			var type;
			obj.budget > 0 ? type = 'inc': type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = "---";
			}
		},
		//Display percentages
		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
	
			nodeListForEach(fields, function(current, index) {
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '---';
				}
			});
		},
		//Displays the month and year
		displayDate: function() {
			var now, year, months, month;
			now = new Date();
			//var christmas = new Date(2019, 11, 25);
			months = ['Janury', 'Februry', 'March', 'April', 'May', 'June', 'July',
					 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		//Changes the type color
		changedType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue
				);
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},
		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

	//event listeners
	var setupEventListeners = function() {
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		//Key press event listener
		document.addEventListener('keypress', function(event) {
		if(event.keyCode === 13 || event.which === 13){
			ctrlAddItem();
		}
	});
		document.querySelector(DOM.container).addEventListener('click', ctrlDelteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	var DOM = UICtrl.getDOMstrings();
	//Update budget
	var updateBudget = function() {
		//1. Calculate the budget
		budgetCtrl.calculateBudget();
		//2. Returns the budget
		var budget = budgetCtrl.getBudget();
		//3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};
	//Update percentages
	var updatePercentages = function() {
		//1. Calculate percentages
		budgetCtrl.calculatePercentages();
		//2. Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();
		//Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);

	}
	//control add function
	var ctrlAddItem = function() {
		var input, newItem;
		//1. Get the field input data
		input = UICtrl.getInput();
		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			//2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			//3. Add the item to the UI 
			UICtrl.addListItem(newItem, input.type);
			//4. Clear input fields
			UICtrl.clearFields(); 
			//5. Calculate and update budget
			updateBudget();
			//6. Calculate and Update percentages
			updatePercentages();
		}
	};

	var ctrlDelteItem = function(event){
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemID){
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			//1. Delete item from data structure
			budgetCtrl.deleteItem(type, ID);
			//2. Delete item from UI
			UICtrl.deleteListItem(itemID);
			//3. Update and display the new budget
			updateBudget();
			//4. Calculate and Update percentages
			updatePercentages();
		}
	}

return {
	init: function(){
		console.log('App started');
		UICtrl.displayDate();
		//3. Display the budget on the UI
		UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
		setupEventListeners();
	}
}

})(budgetController, UIController);

controller.init();