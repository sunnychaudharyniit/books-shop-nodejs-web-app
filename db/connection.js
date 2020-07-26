const dbConfig = {
  server: "SUNNY\\MSSQLSERVER01",
  database: "VidlyDb",
  user: "sunny",
  password: "admin",
  port: 1432,
};

const query = {
  getAllData: "SELECT TOP(5) * FROM [dbo].[books_table]",
  addNewBooks:
    "INSERT INTO [dbo].[books_table] (title,publisher,description,image_url) VALUES (@title,@publisher,@description,@image_url) ",
    addNewUser:
    "INSERT INTO [dbo].[Login_Table] (name,email,password) VALUES (@name,@email,@password) ",
  deleteUser: "DELETE FROM [dbo].[books_table] WHERE name = @userName",
  updateUserDetails:
    "UPDATE [dbo].[books_table] SET password = @newPassword WHERE name = @userName",
    getUserDetail:"SELECT * FROM [dbo].[Login_Table] WHERE EMAIL = @email "
};

module.exports = {
  dbConfig,
  query,
};
