const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
} = require("graphql");

// init sqlite db
var fs = require("fs");
var dbFile = "./db/time_tracker.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFile);

// if ./db/time_tracker.db does not exist, create it, otherwise print records to console
db.serialize(function () {
  if (!exists) {
    const projects_query = `
        CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY NOT NULL,
        project_name STRING NOT NULL,
        project_description STRING NOT NULL,
        project_date_created STRING NOT NULL)`;

    db.run(projects_query);
  } else {
    console.log('Database "time-tracker" ready to go!');
  }
});

// Project Type
const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLInt },
    project_name: { type: GraphQLString },
    project_description: { type: GraphQLString },
    project_date_created: { type: GraphQLString },
    project_is_active: { type: GraphQLInt },
  }),
});

// Log Type
const LogType = new GraphQLObjectType({
  name: "Log",
  fields: () => ({
    id: { type: GraphQLInt },
    log_description: { type: GraphQLString },
    amount: { type: GraphQLInt },
    project: { type: GraphQLInt },
  }),
});

// after creating schema, we need to create a Root Query where we'll have endpoints with Resolvers
// Resolvers resolve data

// Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // get all projects
    projects: {
      type: new GraphQLList(ProjectType),
      resolve: (root, args, context, info) => {
        return new Promise((resolve, reject) => {
          // raw SQLite query to select from table
          db.all("SELECT * FROM projects;", function (err, rows) {
            if (err) {
              reject([]);
            }
            resolve(rows);
          });
        });
      },
    },

    // get one specific project
    project: {
      type: ProjectType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (root, { id }, context, info) => {
        return new Promise((resolve, reject) => {
          db.all("SELECT * FROM projects WHERE id = (?);", [id], function (
            err,
            rows
          ) {
            if (err) {
              reject(null);
            }
            resolve(rows[0]);
          });
        });
      },
    },

    // get all log registers
    logs: {
      type: new GraphQLList(LogType),
      resolve: (root, args, context, info) => {
        return new Promise((resolve, reject) => {
          // raw SQLite query to select from table
          db.all("SELECT * FROM logs;", function (err, rows) {
            if (err) {
              reject([]);
            }
            resolve(rows);
          });
        });
      },
    },

    // get one specific log register
    log: {
      type: LogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (root, { id }, context, info) => {
        return new Promise((resolve, reject) => {
          db.all("SELECT * FROM logs WHERE id = (?);", [id], function (
            err,
            rows
          ) {
            if (err) {
              reject(null);
            }
            resolve(rows[0]);
          });
        });
      },
    },

    // get all log registers by project
    logByProject: {
      type: new GraphQLList(LogType),
      args: {
        project: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (root, { project }, context, info) => {
        return new Promise((resolve, reject) => {
          db.all(
            "SELECT * FROM logs WHERE project = (?);",
            [project],
            function (err, rows) {
              if (err) {
                reject(null);
              }
              resolve(rows);
            }
          );
        });
      },
    },
  },
});

//mutation type is a type of object to modify data (INSERT,DELETE,UPDATE)
var Mutations = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    //mutation for create a project
    createProject: {
      //type of object to return after create in SQLite
      type: new GraphQLList(ProjectType),
      //argument of mutation createProject to get from request
      args: {
        project_name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        project_description: {
          type: new GraphQLNonNull(GraphQLString),
        },
        project_date_created: {
          type: new GraphQLNonNull(GraphQLString),
        },
        project_is_active: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (
        parent,
        {
          project_name,
          project_description,
          project_date_created,
          project_is_active,
        }
      ) => {
        return new Promise((resolve, reject) => {
          //raw SQLite to insert a new project in projects table
          db.run(
            "INSERT INTO projects (project_name, project_description, project_date_created, project_is_active) VALUES (?,?,?,?);",
            [
              project_name,
              project_description,
              project_date_created,
              project_is_active,
            ],
            (err) => {
              if (err) {
                reject(null);
                console.log(err);
              }
              db.get("SELECT last_insert_rowid() as id", (err, row) => {
                resolve([
                  {
                    id: row["id"],
                    project_name: project_name,
                    project_description: project_description,
                    project_date_created: project_date_created,
                    project_is_active: project_is_active,
                  },
                ]);
              });
            }
          );
        });
      },
    },

    //mutation for update a project
    updateProject: {
      //type of object to return afater update in SQLite
      type: GraphQLString,
      //argument of mutation updateProject to get from request
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        project_name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        project_description: {
          type: new GraphQLNonNull(GraphQLString),
        },
        project_is_active: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (
        parent,
        { id, project_name, project_description, project_is_active }
      ) => {
        return new Promise((resolve, reject) => {
          //raw SQLite to update a project in project table
          db.run(
            "UPDATE projects SET project_name = (?), project_description = (?),  project_is_active = (?) WHERE id = (?);",
            [project_name, project_description, project_is_active, id],
            (err) => {
              if (err) {
                reject(err);
              }
              resolve(`Project #${id} updated`);
            }
          );
        });
      },
    },

    //mutation for delete a project
    deleteProject: {
      //type of object resturn after delete in SQLite
      type: GraphQLString,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, { id }) => {
        return new Promise((resolve, reject) => {
          //raw query to delete from project table by id
          db.run("DELETE from projects WHERE id =(?);", [id], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`Project #${id} deleted`);
          });

          db.run("DELETE from logs WHERE project =(?);", [id], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`Project #${id} time registers deleted`);
          });
        });
      },
    },

    //mutation for create a log
    createLog: {
      //type of object to returned after create in SQLite
      type: new GraphQLList(LogType),
      //argument of mutation createProject to get from request
      args: {
        log_description: {
          type: new GraphQLNonNull(GraphQLString),
        },
        amount: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        project: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, { log_description, amount, project }) => {
        return new Promise((resolve, reject) => {
          //raw SQLite to insert a new post in post table
          db.run(
            "INSERT INTO logs (log_description, amount, project) VALUES (?,?,?);",
            [log_description, amount, project],
            (err) => {
              if (err) {
                reject(null);
              }
              db.get("SELECT last_insert_rowid() as id", (err, row) => {
                resolve([
                  {
                    id: row["id"],
                    log_description: log_description,
                    amount: amount,
                    project: project,
                  },
                ]);
              });
            }
          );
        });
      },
    },

    //mutation for update a log
    updateLog: {
      //type of object to returned afater update in SQLite
      type: GraphQLString,
      //argument of mutation update a log to get from request
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        log_description: {
          type: new GraphQLNonNull(GraphQLString),
        },
        amount: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        project: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, { log_description, amount, project, id }) => {
        return new Promise((resolve, reject) => {
          //raw SQLite to update a post in post table
          db.run(
            "UPDATE logs SET log_description = (?), amount = (?), project = (?) WHERE id = (?);",
            [log_description, amount, project, id],
            (err) => {
              if (err) {
                reject(err);
              }
              resolve(`Log register #${id} updated`);
            }
          );
        });
      },
    },

    //mutation for delete a log
    deleteLog: {
      //type of object returned after delete in SQLite
      type: GraphQLString,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, { id }) => {
        return new Promise((resolve, reject) => {
          //raw query to delete one specific log
          db.run("DELETE from logs WHERE id =(?);", [id], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`Log register #${id} deleted`);
          });
        });
      },
    },

    //mutation for delete all logs by project
    deleteLogByProject: {
      //type of object returned after delete in SQLite
      type: GraphQLString,
      args: {
        project: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, { project }) => {
        return new Promise((resolve, reject) => {
          //raw query to delete all logs by project id
          db.run("DELETE from logs WHERE project =(?);", [project], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`Log register of project #${id} deleted`);
          });
        });
      },
    },
  },
});

//define schema with queries and mutation
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
});
