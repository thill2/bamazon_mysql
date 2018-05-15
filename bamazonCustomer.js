var prompt = require('prompt');
var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'iScribe$2014',
  database: 'bamazon_db'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id: " + connection.threadId);
});

function showInventory() {
  connection.query('SELECT * FROM products', function(err, inventory) {
    if (err) throw err;
    console.log("Bamazon's Inventory");
    for(var i = 0; i < inventory.length; i++) {2
      console.log("Item ID: " + inventory[i].item_id + " | Product: " + inventory[i].product_name + " | Department: " + inventory[i].department_name + " | Price: " +  inventory[i].price + " | Quantity: " + inventory[i].stock_quantity);
    }

    inquirer.prompt([
      {
        type: "input",
        message: "What is the id of the item you would like to buy?",
        name: "id"
      },
      {
        type: "input",
        message: "How many would you like to buy?",
        name: "quantity"
      }])

    .then(function (order) {
      var quantity = order.quantity;
      var itemId = order.id;
        // console.log("made it to this point before error");
      connection.query('SELECT * FROM products WHERE item_id=' + itemId, function(err, selectedItem) {
        if (err) throw err;
          // console.log("no error here");
        if (selectedItem[0].stock_quantity - quantity >= 0) {
          console.log("Bamazon has enough " + selectedItem[0].product_name + " inventory in stock.");
          console.log("Quantity in Stock: " + selectedItem[0].stock_quantity + " Order Quantity: " + quantity);
          console.log("You're total is: " + (order.quantity * selectedItem[0].price) +  " dollars.");
          // mysql NPM readme: connection.query('UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId], function(err, results) {});
          connection.query('UPDATE products SET stock_quantity=? WHERE item_id=?', [selectedItem[0].stock_quantity - quantity, itemId],
          function(err, inventory) {
            if (err) throw err;
              // go back to beginning to continue shopping
              showInventory();
          }); 
        }

        else {
          console.log("Bamazon has an insufficient quantity of this item! " + selectedItem[0].stock_quantity + " " + selectedItem[0].product_name + " in stock at this moment.");
          showInventory();
        }
      });
    });
  });
}

// call function to initiate code
showInventory();