
var pg = require('pg');

var connectionString = "postgres://userName:password@serverName/ip:port/nameOfDatabase";

var pgClient = new pg.Client(connectionString);