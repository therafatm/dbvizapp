CREATE TABLE projects(
    id serial PRIMARY KEY,
    name VARCHAR (50) NOT NULL,
    username VARCHAR (50) NOT NULL,
    database VARCHAR (50) NOT NULL,
    host VARCHAR (50) NOT NULL,
    port INTEGER NOT NULL,
    password VARCHAR (50) NOT NULL,
    sourcepath VARCHAR (50)
);

CREATE TABLE abstractions(
    aid serial PRIMARY KEY,
    model JSON,
    projectid Integer REFERENCES projects(id),
    modelid VARCHAR (50) NOT NULL
);