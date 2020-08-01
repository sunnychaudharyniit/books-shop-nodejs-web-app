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
  getUserBookDetail:
    "SELECT * FROM [dbo].[cart_table] where user_id = @user_id and book_id= @book_id",
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
    "UPDATE [dbo].[cart_table] SET quantity = @quantity, total_price = @total_price  where book_id = @book_id and user_id = @user_id",
  userCartDetails:
    "select c.book_id, c.user_id, c.cart_id, c.quantity, c.price_per_item, c.total_price , b.description, b.image_url, b.title, b.publisher from books_table b inner join  cart_table c on b.book_id = c.book_id where c.user_id= @user_id",
  deleteBookOrder:
    "delete from cart_table where user_id = @user_id and book_id = @book_id",
};

const totalCartItems = async (User_Id) => {
  try {
    const userCart = await userCartItems(User_Id);
    var totalItems = 0;
    //console.log("totalCartItems func", userCartItems.recordset)
    if (userCart.recordset) {
      if (userCart.recordset.length > 0) {
        userCart.recordset.map((x) => {
          totalItems += x.quantity;
        });
      }
    }

    return totalItems;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  dbConfig,
  sqlQuery,
  totalCartItems,
  userCartItems,
  userCartDetails,
  deleteBookOrder,
};

async function userCartItems(User_Id) {
  try {
    await sqlInstance.connect(dbConfig);
    const userCartItems = await new sqlInstance.Request()
      .input("user_id", sqlInstance.Int, User_Id)
      .query(sqlQuery.getUserCartItems);
    sqlInstance.close();
    return userCartItems;
  } catch (error) {
    console.log(error);
  }
}

async function userCartDetails(User_Id) {
  try {
    await sqlInstance.connect(dbConfig);
    const userCartItems = await new sqlInstance.Request()
      .input("user_id", sqlInstance.Int, User_Id)
      .query(sqlQuery.userCartDetails);
    sqlInstance.close();
    return userCartItems;
  } catch (error) {
    console.log(error);
  }
}

async function deleteBookOrder(user_id, book_id) {
  try {
    await sqlInstance.connect(dbConfig);
    const deletedItem = await new sqlInstance.Request()
      .input("user_id", sqlInstance.Int, user_id)
      .input("book_id", sqlInstance.Int, book_id)
      .query(sqlQuery.deleteBookOrder);
    sqlInstance.close();
    return deletedItem;
  } catch (error) {
    console.log(error);
  }
}
