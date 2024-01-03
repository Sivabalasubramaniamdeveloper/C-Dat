// services
const userService = require('../service/userService')
const getService = require('../service/getService')
const messsageService = require('../service/messageService')
const gitService = require('../service/gitService')
const architectureService = require('../service/architectureService')
const destroyService = require('../service/destroyService')
const rosaService = require('../service/rosaService')
// const architecture_func = require('../resource')

// message 
let message = require('../responce/message')


//AWS LOGIN
async function aws_login(req, res ) {
  try {
    let login_message = message.login
    await userService.userLogin(req, res, login_message)
  }
  catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function vpc_list(req, res) {
  try {
    let vpc_list_message = message.getVpc
    const vpcList = await getService.vpcListGet(req, res, vpc_list_message)
  } catch (error) {
    console.log("get vpc_list is error :", error);
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
};

async function security_group_list(req, res) {
  try {
    let security_list_message = message.getSecurityGroup
    const securityGroup = await getService.securityGroupListGet(req, res, security_list_message)
  } catch (error) {
    console.log("security group list get error is : ", error);
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}
async function subnet_list(req, res) {
  try {
    let subnet_list_message = message.getSubnet
    const subnetList = await getService.subnetGetList(req, res, subnet_list_message)
  } catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
};


async function os_list(req, res) {
  try {
    let os_list_message = message.getOs
    const osList = await getService.osListGet(req, res, os_list_message)
  } catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

// To  create S3 bucket
async function s3_bucket(req, res) {
  try {
    let s3_bucket_message = message.s3Bucket
    const bucket_creation = await userService.s3_bucket_creation(req, res, s3_bucket_message)
  } catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}



async function accountDestroy(req, res) {
  try {
    let destroy_message = message.accountDestroy
    const destroy = await destroyService.accountDestroy(req, res, destroy_message)
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Something went wrong", result: error.message });
  }
}

async function serviceDestroy(req, res) {
  try {
    let destroy_message = message.serviceDestroy
    const destroy = await destroyService.serviceDestroy(req, res, destroy_message)
  } catch (error) {
    console.error("Error:", error);
    return res.status(400).json({ message: "Something went wrong", result: error.message });
  }
}


//To Create SQS-Queue
async function create_queue(req, res) {
  try {
    let queue_message = message.create_queue
    const queueMessage = await messsageService.queueCreate(req, res, queue_message)
  }
  catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: "Something went wrong", result: error.message });
  }
}


async function create_sns_topic(req, res) {
  try {
    let sns_create = message.snsCreate
    const snsMessage = await messsageService.createSnsTopic(req, res, sns_create)
  }
  catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

//API for code push to codeCommit
async function push_code(req, res) {
  try {
    let push_msg = message.codePush
    let codePush = await gitService.codePush(req, res, push_msg)
  } catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

//API for code pull from codeCommit
async function code_pull(req, res) {
  try {
    let pull_msg = message.codePull
    let codePull = await gitService.codePull(req, res, pull_msg)
  } catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

async function architecture(req, res) {
  try {
    let architecture_message = message.architecture
    let codeArchitecture = await architectureService.architecture(req, res, architecture_message)
  }
  catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: "something went wrong", result: error.message })
  }
}

async function load_balancer(req, res){
  try {
    let load_massage = message.createLoadBalancer
    let load_balancer = await architectureService.load_balancer(req, res, message)

  } catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: "something went wrong", result: error.message})
  }
}

async function rosa(req, res) {
  try {
    let rosa_create = message.rosaCreate
    let rosa = await rosaService.rosa(req, res, rosa_create)
  } catch (error) {
    console.log("error is: ", error);
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

module.exports = {
  aws_login, security_group_list, subnet_list, os_list, vpc_list, s3_bucket, accountDestroy,
  serviceDestroy, create_queue, create_sns_topic, code_pull, push_code, architecture, rosa,
  load_balancer
  // jenkin,
};
