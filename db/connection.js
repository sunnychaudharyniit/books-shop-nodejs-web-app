const sqlInstance = require("mssql");

const dbConfig = {
  server: "SUNNY\\MSSQLSERVER01",
  database: "VidlyDb",
  user: "sunny",
  password: "admin",
  port: 1432,
};

const sqlQuery = {
  getUserCartItems: "SELECT * FROM [dbo].[cart_table] where user_id = @user_id",
  getAllBooks: "SELECT * FROM [dbo].[books_table]",
  getFilteredBooks: "SELECT * FROM [dbo].[books_table] Where cat_id= @cat_id",
  getAllCategory: "SELECT * FROM [dbo].[category_table]",
  addNewBooks:
    "INSERT INTO [dbo].[books_table] (title,publisher,description,image_url,cat_id,price) VALUES (@title,@publisher,@description,@image_url,@cat_id,@price) ",
  addNewUser:
    "INSERT INTO [dbo].[Login_Table] (name,email,password) VALUES (@name,@email,@password) ",
  deleteUser: "DELETE FROM [dbo].[books_table] WHERE name = @userName",
  updateUserDetails:
    "UPDATE [dbo].[books_table] SET password = @newPassword WHERE name = @userName",
  getUserDetail: "SELECT * FROM [dbo].[Login_Table] WHERE EMAIL = @email ",
  addItemToCart:
    "INSERT INTO [dbo].[cart_table] (book_id,quantity,price_per_item,total_price,user_id)  VALUES (@book_id,@quantity,@price_per_item,@total_price,@user_id) ",
    updateItemToCart:
    "UPDATE [dbo].[cart_table] SET quantity = @quantity, total_price = @total_price  where book_id = @book_id"
};

const totalCartItems = async (User_Id) => {
  await sqlInstance.connect(dbConfig); 
  const userCartItems = await new sqlInstance.Request()
        .input("user_id", sqlInstance.Int, User_Id)
        .query(sqlQuery.getUserCartItems);        
  sqlInstance.close();
  var totalItems = 0;
  //console.log("totalCartItems func", userCartItems.recordset)
  if(userCartItems.recordset){
    if(userCartItems.recordset.length>0){
      userCartItems.recordset.map(x=>{
        totalItems += x.quantity;
      });
    }  
  }

  return totalItems;
};

module.exports = {
  dbConfig,
  sqlQuery,
  totalCartItems,
};
