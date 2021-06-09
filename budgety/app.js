//Alireza Shiasi - Shevina
// Data (Budget) Controller
var budgetController = (function () {

    // Calculate and control data
    // for constructor function we usually use CAPITAL LEtter to distinguish them
    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;// when smt is not defined we use -1
    };
    // we use prototype to add smt to expenses (a function)
    Expenses.prototype.calcPercentages = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        };
    };
    // a prototype to return the percentages from expenses
    Expenses.prototype.getPercentages = function () {
        return this.percentage;

    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Data Structure
    // First stupid method perhaps comes into our mind

    // var allExpenses = [];
    // var allIncomes = [];
    // var totalExpenses = 0.0;

    // Second a better way
    // var data1 = {
    //     allExpenses: [],
    //     allIncomes: [],
    // };

    // Third a better way 
    var data = {
        // allItems is on OBJ
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percent: -1, // caz it mean there is no data for % when no expenses is applied?:/
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
            // sum += cur.value;

        });
        // now we add it to data structure
        data.totals[type] = sum;

    };

    // We return a public obj or func so that we can 
    // get data from another modules and store them in to our data structure
    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // ID should be the last index in the array (not the numbers) - remember the array starts from 0
            // first solution ID = data.allItems[type][data.allItems[type].length - 1]
            // Create New ID
            if ((data.allItems[type].length - 1) > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1];

            } else {
                ID = 0;
            }

            // Create New Item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expenses(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push it in to our data structure
            data.allItems[type].push(newItem);
            // whya not this?
            // data.allItems.exp.push(newItem);

            // then we return the newItem so that other module can use it as well (to add to UI for user)
            return newItem;
        },

        deleteItem: function (type, id) {
            // problem is when we use id number it wont delete that number
            // but will delete the index id
            /* exp: del 3
            [1 5 3 6 11]
            [0 1 2 3  4]
            it will not delete 3 but will delete the index 3 (counts from 0), 
            so we will have:
            [1 5 3 11]
            */
            // data.allItems[type][id];
            // so we use map method
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of spent income
            // if cond to avoid dividing a number by ZERO which will become infinity
            if (data.totals.inc > 0) {
                data.percent = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percent = -1;
            }


        },

        getBudget: function () {
            /* OBJ where we store these and pass it to controller to change lables on UI */
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percent
            }
        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentages(data.totals.inc);
            });

        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentages();
            });
            return allPerc;
        },

        testing: function () {
            console.log(data);
        }
    }

})();


// UI Controller
var UIController = (function () {

    // Controll the UI and Keypress events
    // object for DOM strings -- prevent from hardcoding strings into the app
    var DOMstr = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        // add anothers to use in DOM maniplation for adding inc exp to UI
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        // define labels to use them
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumbers = function (num, type) {
        var numSplit, int, dec, type;
        /* 
        + or - before numbers
        exaclty 2 decimal points
        comma seperating the thousands
        */
        // we need absoulute numbers form num, so we take from num above then abs it and storeit in its self
        num = Math.abs(num);
        // use prototype then for 2 decimals and also, know that by using this js change the primitive to object
        // returns strings though
        num = num.toFixed(2);
        // strings returned so we can use string methods on them
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // SHit
        }
        dec = numSplit[1];

        // type === 'exp' ? sign = '-' : sign = '+';
        // return type + ' ' + int + dec;
        // better way
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);

        }

    };


    // returns a method/an object (a blue print I assume) with values I want to read/get from input fields
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstr.inputType).value, //either returns inc (income) or exp (expenses)
                description: document.querySelector(DOMstr.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstr.inputValue).value), // make it float - from string.
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml;


            // Creat HTML strings with placeholders text

            if (type === 'inc') {
                // element for htmladjecent
                elm = DOMstr.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                elm = DOMstr.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            // newHtml = newHtml.replace('%value%', obj.value);
            newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type));

            // Insert html into the DOM
            document.querySelector(elm).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function (selectorID) {
            // in js we cannot delete and element we only can delete a child
            // so we have to move up to parent and then delete the child we want
            /* description (el): as above we have to first address where is the element we want
            then we say ok get its parent
            then we say the parent to remove the child we first selected
            thats why "el" is repeated! weird but its the way it is. */
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },
        // the function to clear fileds after adding the exp/inc.
        clearFields: function () {
            var fields, fieldsArr;
            // select all the filed we want to clead in this case description and value fileds (in HTML)
            // we use ', ' because we are selecting CSS, 
            fileds = document.querySelectorAll(DOMstr.inputDesc + ', ' + DOMstr.inputValue);

            // Array blueprint or constructor or whatever, to use slice (yet I dont know)
            fieldsArr = Array.prototype.slice.call(fileds);

            // use foreach method to clear all fileds
            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });

            // after that we send the current position of cursor to description field
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            // obj is the object where we stored all data about budget calculation in IT, so that we can use it here
            // document.querySelector(DOMstr.budgetLabel).textContent = obj.budget;

            // document.querySelector(DOMstr.incomeLabel).textContent = obj.totalInc;
            // document.querySelector(DOMstr.expensesLabel).textContent = obj.totalExp;
            // document.querySelector(DOMstr.percentageLabel).textContent = obj.percentage;
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstr.budgetLabel).textContent = formatNumbers(obj.budget, type);
            document.querySelector(DOMstr.incomeLabel).textContent = formatNumbers(obj.totalInc, 'inc'); // always positive
            document.querySelector(DOMstr.expensesLabel).textContent = formatNumbers(obj.totalExp, 'exp'); // always negative
            // document.querySelector(DOMstr.percentageLabel).textContent = obj.percentage;
            // check to show % sign and number, also hide -1 from user
            if (obj.percentage > 0) {
                document.querySelector(DOMstr.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstr.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function (percentages) {
            // this returns a nodeslist: consider it as every element in html is a node
            var fileds = document.querySelectorAll(DOMstr.expensesPercLabel);

            /* As we dont have foreach method fot nodes so we create it as function for ourself*/
            // var nodeListForEach = function (list, callback) {
            //     for (var i = 0; i < list.length; i++) {
            //         callback(list[i], i);

            //     };

            // };


            nodeListForEach(fileds, function (current, index) {
                // Do stuff

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function () {
            var now, month, year, months;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstr.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function () {
            // we use css again to change style
            var fields = document.querySelectorAll(
                DOMstr.inputType, + ',' +
            DOMstr.inputDesc, + ',' +
            DOMstr.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');

            });

        },

        getDOMstrg: function () {
            return DOMstr; // with this we public the DOMstr object, we make it public for other modules.

        },
    };
})();


// Event Controller (App Controller)
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        // get the publicized DOMstr from UIcontrol as DOM.
        var DOM = UICtrl.getDOMstrg();

        // document.getElementsByClassName('add__btn').addEvent; wont work
        // click on the add button do smt
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // when enter key is pressed Do smt
        document.addEventListener('keypress', function (kilid) {
            if (kilid.keyCode === 13 || kilid.which === 13) {
                // console.log('Enter is pressed!');
                ctrlAddItem();
            };

        });
        /* we want to delete an Item: in html the id related to Items are expenses-0 and income-0
       but this is not the way caz we have to write code for both of them. so we find the parent div with id
       which is containing both of them. The way we use is by parent node.
       remmeber the delegation in DOM. (from inner to outter.)
        */
        document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);

        // document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };
    var updateBudget = function () {
        // 1. Calc the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 5. Display the budget on UI
        // console.log(budget);
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function () {
        // 1. Calc the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read the percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with new percentages
        // console.log(percentages);
        UICtrl.displayPercentages(percentages);
    };

    function ctrlAddItem() {
        var input, newItem;

        // TO-DOs
        // 1. Get the data from the input field
        input = UICtrl.getInput();
        // Check if description and value is NOT empty or NaN (not a number) and also is NOT 0
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to data budget - data controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add item to UI
            UICtrl.addListItem(newItem, input.type);
            // 3.1 Clear the fields
            UICtrl.clearFields();
            // 4. Calc the budget and Display the bidget on UI
            updateBudget();
            console.log('Item Added');
            // 5. Calc percentages  and updates UI
            updatePercentages();
        } else {
            console.log('Arse and holes!');

        }


    };

    var ctrlDelItem = function (event) {
        /* The way we use is by parent node.
       remmeber the delegation in DOM. (from inner to outter.)
       DOM traversing.
        */
        var itemID, splitID, type, ID;

        // console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // split => inc-a-s-2 ==> "inc" "a" "s" "2" an array start from 0
            // inx-1 => inc 1
            splitID = itemID.split('-');
            type = splitID[0];
            // ID = splitID[1]; // it returns string so we have to make it number (int)
            ID = parseInt(splitID[1]);

            // 1. delete from data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. del from UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the budget
            updateBudget();
            // 4. Calc percentages  and updates UI
            updatePercentages();
        }

    };

    return {
        init: function () {
            console.log('App has started!');
            // Zere the Heroes:) zero the labels
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
            setupEventListeners();
        }
    }


})(budgetController, UIController);

controller.init();
