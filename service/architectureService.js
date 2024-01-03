const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../responce/responce')
const createArchitecture = require('../architecture/architecture')

async function architecture(req, res, message) {
    try {
        let config = []
        let vpc = req.body.vpc.vpcTittle
        let subnet = req.body.subnet.subnetTittle
        let internetGateWay = req.body.internetGateWay.internetGateWayTittle
        let routeTable = req.body.routeTable.routeTableTittle
        let securityGroup = req.body.securityGroup.securityGroupTittle
        let ec2Instance = req.body.ec2Instance.ec2InstanceTittle
        if (vpc == 'vpc') {
            let vpcDetail = await createArchitecture.createVpc(req, res)
            config += vpcDetail
        }

        if (subnet == 'subnet') {
            let subnetDetail = await createArchitecture.createSubnet(req, res)
            config += subnetDetail
        }
        if (internetGateWay == 'internetGateWay') {
            let internetGateWayDetail = await createArchitecture.createInternetGateWay(req, res)
            config += internetGateWayDetail
        }
        if (routeTable == 'routeTable') {
            let routeTableDetail = await createArchitecture.createRouteTable(req, res)
            config += routeTableDetail
        }
        if (securityGroup == 'securityGroup') {
            let securityGroupDetail = await createArchitecture.createSecurityGroup(req, res)
            config += securityGroupDetail
        }
        if (ec2Instance == 'ec2Instance') {
            let ec2InstanceDetail = await createArchitecture.createEc2Instance(req, res)
            config += ec2InstanceDetail
        }
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-');

        const fileName = `${path.directory}/aws_vpc_${formattedDate}.tf`;
        fs.writeFileSync(fileName, config);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        
        let configData = [`${JSON.stringify(req.body)}`]
        const jsonData = JSON.parse(configData[0]);
<<<<<<< HEAD
        console.log("config data is : ",configData);
=======
        // console.log("the data is : ",jsonData)
>>>>>>> main
        let serviceDetail = [];
        for (const category in jsonData) {
            const title = jsonData[category][`${category}Tittle`];
            const tagName = jsonData[category][`${category}TagName`];
            if (title) {
                let perticulerService = {
                    service_tittle: `${title}`,
                    tag_name: `${tagName}`
                }
                serviceDetail.push(perticulerService)
            }
        }
        // console.log("valide : ",valide);
        exec("terraform apply -auto-approve -parallelism=10", (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.error("Terraform Architecture created failed:", applyStderr);
                fs.unlinkSync(fileName)
                // return res.status(400).send("Terraform Architecture created failed");
            } else {
                console.log(" Terraform Architecture created successfully ");
                fs.unlinkSync(fileName)
                respounce.architectureCreate(req, res, message, serviceDetail)
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "something went wrong", result: error.message })
    }
}



module.exports = { architecture }