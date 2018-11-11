const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

let connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_DB"
});

function validateInput(value) {
	let integer = Number.isInteger(parseFloat(value));
	let sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
}


function displayInventory() {
    connection.query("SELECT * FROM products", function(err, res) {

        console.log("Welcome to ABC Store")
        console.log("These are the items we have on sale")
		// disply the data from the table into terminal
		console.log(res)
        console.table(res)

        // prompt purchase
        promptUserPurchase()
    });
}


function promptUserPurchase() {

	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Please please enter the ID of the item you would like to buy.',
			validate: validateInput,
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many do you need?',
			validate: validateInput,
			filter: Number
		}
	]).then(function(input) {
		let item = input.item_id;
		let quantity = input.quantity;

		connection.query('SELECT * FROM products WHERE ?', {item_id: item}, function(err, data) {

			if (data.length === 0) {
				console.log('Invalid ID. Please select a valid ID.');
				displayInventory();
			} else {
                let productData = data[0]
                
				if (quantity <= productData.stock_quantity) {
                    console.log('The product you requested is in stock. Your order will be place.');
                    
					connection.query('UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item, function(err, data) {

						console.log('Your total will be $' + productData.price * quantity)
                        console.log('Thank you and come again.')
                        
						connection.end();
					})
				} else {
					console.log('Sorry, there is not enough in stock, your order can not be placed.');
					console.log('Please change your order.')
					displayInventory()
				}
			}
		})
	})
}


displayInventory()