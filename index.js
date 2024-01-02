const express = require("express")
let bodyParser = require('body-parser')
var app=express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const aws_router = require("./router/awsRouter")
app.use("/api/v1",aws_router)

const azure_router = require("./router/azureRouter")
app.use("/api/v1",azure_router)


const port = 8000
//server port 
app.listen(port,()=>{
    console.log("Server has started successfully")
})


