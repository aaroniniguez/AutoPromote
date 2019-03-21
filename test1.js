var fs = require("fs") 
var data = fs.readFileSync(process.argv[2]);
console.log(data.toString().split("\n"));
console.log(data.toString().split("\n").length -1)
