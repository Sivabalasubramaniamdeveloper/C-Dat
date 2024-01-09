const awsController = require("../controller/awsController")
const router=require("express").Router();


router.post("/login",awsController.aws_login)
router.post("/s3_bucket",awsController.s3_bucket)
router.post("/queue_creation", awsController.create_queue)
router.post("/sns_topic", awsController.create_sns_topic)
router.get("/code_pull", awsController.code_pull)
router.post("/code_push", awsController.push_code)
router.post("/architecture",awsController.architecture)
router.post("/load_balancer", awsController.load_balancer)
router.post("/rosa",awsController.rosa)
router.get("/vpclist",awsController.vpc_list);
router.get("/SG_list",awsController.security_group_list)
router.get("/subnet_list",awsController.subnet_list)
router.get("/os_list",awsController.os_list)
router.delete("/account_delete",awsController.accountDestroy)
router.delete("/file_delete",awsController.serviceDestroy)

router.post("/mailsend",awsController.send_email)
router.post("/docker_instance",awsController.createDockerInstance)

module.exports=router