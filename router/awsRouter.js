const awsController = require("../controller/awsController")
const middleware= require('../middleware/auth')
const router=require("express").Router();

// finish router
router.post("/signup", awsController.signUp);
router.post("/superAdmin_signup", middleware.authorization, middleware.authentication(['admin'],true), awsController.superAdminSignUp);
router.post("/organization_signup", middleware.authorization, middleware.authentication(['admin'],true), awsController.organizationSignUp);
router.post("/organization_login", middleware.authorization, middleware.authentication(['admin'],true), awsController.organizationLogin);
router.post("/user_signup", middleware.authorization, middleware.authentication(['admin'],true), awsController.userSignUp);
router.post("/user_login", middleware.authorization, middleware.authentication(['admin'],true), awsController.userLogin);
router.post("/s3_bucket", middleware.authorization, middleware.authentication(['admin'],true),awsController.s3_bucket)
router.get("/vpclist", middleware.authorization, middleware.authentication(['admin'],true),awsController.vpc_list);
router.get("/SG_list", middleware.authorization, middleware.authentication(['admin'],true),awsController.security_group_list)
router.get("/subnet_list", middleware.authorization, middleware.authentication(['admin'],true),awsController.subnet_list)
router.get("/os_list", middleware.authorization, middleware.authentication(['admin'],true),awsController.os_list)
router.post("/queue_creation", middleware.authorization, middleware.authentication(['admin'],true), awsController.create_queue)
router.post("/sns_topic", middleware.authorization, middleware.authentication(['admin'],true), awsController.create_sns_topic)
router.get("/code_pull", middleware.authorization, middleware.authentication(['admin'],true), awsController.code_pull)
router.post("/code_push", middleware.authorization, middleware.authentication(['admin'],true), awsController.push_code)
router.post("/load_balancer", middleware.authorization, middleware.authentication(['admin'],true), awsController.load_balancer)
router.post("/key_pair", middleware.authorization, middleware.authentication(['admin'],true), awsController.key_pair)
router.delete("/account_delete", middleware.authorization, middleware.authentication(['admin'],true),awsController.accountDestroy)
router.delete("/file_delete", middleware.authorization, middleware.authentication(['admin'],true),awsController.serviceDestroy)

//deploy process
router.post("/docker_instance", middleware.authorization, middleware.authentication(['admin'],true),awsController.createDockerInstance) //ECR
router.post("/container_deploy", middleware.authorization, middleware.authentication(['admin'],true),awsController.createContainerDeploy) //ECS
router.post("/cloud_app_runner", middleware.authorization, middleware.authentication(['admin'],true),awsController.appRunner) //App runner
router.post("/jenkins_pipeline", middleware.authorization, middleware.authentication(['admin'],true),awsController.jenkinsPipeline) //Jenkins
router.post("/ebs", middleware.authorization, middleware.authentication(['admin'],true),awsController.ebs) //EBS
router.post("/code_pipeline", middleware.authorization, middleware.authentication(['admin'],true),awsController.code_pipeline)

//process
router.post("/architecture", middleware.authorization, middleware.authentication(['admin'],true),awsController.architecture)

//Not using below router
router.post("/rosa", middleware.authorization, middleware.authentication(['admin'],true),awsController.rosa)

module.exports=router