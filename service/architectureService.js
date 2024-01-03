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
        console.log("config data is : ",configData);
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

function myFunction(value) {
    let result = [];
    let data;
    for (let i = 0; i < value.length; i++) {
        switch (value[i]) {
            case 'Amazon Linux 2023 kernel-6.1':
                data = "ami-02a2af70a66af6dfb";
                result.push(data)
                break;
            case 'Amazon Linux 2 Kernel-5.10':
                data = "ami-0d92749d46e71c34c";
                result.push(data)
                break;
            case 'Ubuntu focal 20.04 LTS':
                data = "ami-0a7cf821b91bcccbc";
                result.push(data)
                break;
            case 'Ubuntu jammy 22.04 LTS':
                data = "ami-0287a05f0ef0e9d9a";
                result.push(data)
                break;
            case 'Windows server core base-2022':
                data = "ami-08ac34653a1e1b4b9";
                result.push(data)
                break;
            case 'Windows server core base-2019':
                data = "ami-0b33299742a1b79e0";
                result.push(data)
                break;
            case 'Windows server core base-2016':
                data = "ami-06d692ce72530031b";
                result.push(data)
                break;
            case 'Windows with SQL server-2022 Standard':
                data = "ami-0798b918496671569";
                result.push(data)
                break;
            case 'Red Had Enterprise Linux 9':
                data = "ami-0645cf88151eb2007";
                result.push(data)
                break;
            default:
                data = 'Value is not recognized';
        }
    }


    return result;
}

module.exports = { architecture, myFunction }