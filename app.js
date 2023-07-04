const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

//accept json data
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//get list Players API 1
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  let sqlQuery;
  if (status != "" && priority != "") {
    sqlQuery = `SELECT * FROM todo where status='${status}' or priority='${priority}';`;
  } else if (status != "") {
    sqlQuery = `SELECT * FROM todo where status='${status}';`;
  } else if (priority != "") {
    sqlQuery = `SELECT * FROM todo where priority='${priority}';`;
  } else {
    sqlQuery = `SELECT * FROM todo where todo LIKE '%${search_q}%';`;
  }
  const listResponse = await db.all(sqlQuery);
  response.send(listResponse);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `SELECT * FROM todo where id='${todoId}';`;
  const listResponse = await db.get(sqlQuery);
  response.send(listResponse);
});

//API 3
app.post("/todos/", async (request, response) => {
  const requestDetails = request.body;
  const { id, todo, priority, status } = requestDetails;
  const insertQuery = `INSERT into todo(id,todo,priority,status) values
   (
       '${id}','${todo}','${priority}','${status}'
   );`;
  const dbResponse = await db.run(insertQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const requestDetails = request.body;
  const { todoId } = request.params;
  const { status = "", priority = "", todo = "" } = requestDetails;
  if (status != "") {
    const updateQuery = `update todo set status='${status}' where id='${todoId}'`;
    const dbResponse = await db.run(updateQuery);
    response.send("Status Updated");
  } else if (priority != "") {
    const updateQuery = `update todo set priority='${priority}' where id='${todoId}'`;
    const dbResponse = await db.run(updateQuery);
    response.send("Priority Updated");
  } else if (todo != "") {
    const updateQuery = `update todo set todo='${todo}' where id='${todoId}'`;
    const dbResponse = await db.run(updateQuery);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo where id='${todoId}';`;
  const teamMates = await db.exec(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
