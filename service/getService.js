const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const simpleGit = require('simple-git');
const respounce = require('../responce/responce')


// Get list of AWS services

async function vpcListGet(req, res, message) {
    try {
        const tfConfig = `data "aws_vpcs" "foo" {
        }
        output "foo" {
          value = data.aws_vpcs.foo.ids
        }`;

        fs.writeFileSync(`${path.directory}/vpc_list.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);
        exec('terraform init', (error, initStdout, initStderr) => {
            if (error) {
                console.error('Terraform login initialization failed:', initStderr);
                res.status(400).send("Terraform login initialization failed");
            } else {
                // console.log(3);
                console.log('Terraform login initialization succeeded.');
                exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
                    if (applyError) {
                        console.error('Terraform get vpc list failed:', applyStderr);
                        return res.status(400).json({ message: "Terraform get vpc list failed", result: applyStderr });
                    } else {
                        console.log('Terraform get vpc list succeeded.');
                        const vpcIdRegex = /"vpc-\w+"/g;
                        const matchArray = applyStdout.match(vpcIdRegex);
                        const vpcIds = matchArray.map(match => match.replace(/"/g, ''));
                        function findDuplicates(array) {
                            let duplicateIds = [];
                            let seen = {};

                            for (let id of array) {
                                if (seen.hasOwnProperty(id)) {
                                    duplicateIds.push(id);
                                } else {
                                    seen[id] = true;
                                }
                            }

                            return duplicateIds;
                        }
                        let duplicateIds = findDuplicates(vpcIds);
                        if(duplicateIds.length > 0){
                            respounce.createMessage(req, res, message, duplicateIds)
                        }else{
                            respounce.createMessage(req, res, message, vpcIds)
                        }
                    }
                });
            }
        });
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

async function securityGroupListGet(req, res) {
    try {
        const tfConfig = `
        data "aws_security_groups" "dys-sg" {
        }
        output "dys-sg" {
           value = data.aws_security_groups.dys-sg.ids
        }`;

        fs.writeFileSync(`${path.directory}/security_group_list.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.error('Terraform security group list get failed:', applyStderr);
                return res.status(400).json({ message: "Terraform security group list get failed" });
            } else {
                console.log('Terraform security group list get succeeded.');
                const securityGroupIdRegex = /"sg-\w+"/g;
                const matchArray = applyStdout.match(securityGroupIdRegex);
                const securityGroupIds = matchArray.map(match => match.replace(/"/g, ''));
                respounce.createMessage(req, res, message, securityGroupIds)
                // return securityGroupIds;
            }
        });
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

async function subnetGetList(req, res, message) {
    try {
        const tfConfig = `data "aws_subnets" "sn" {
        }
        
        output "sn" {
          value = data.aws_subnets.sn.ids
        }`;

        // Write the Terraform configuration to a file
        fs.writeFileSync(`${path.directory}/subnet_list.tf`, tfConfig);


        // Define the relative path to the Terraform configuration directory
        const configPath = `${path.directory}`;

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        // Run Terraform commands

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.error('Terraform apply failed:', applyStderr);
                res.send("Terraform apply failed");
            } else {
                console.log('Terraform apply succeeded.');
                console.log(applyStdout);
                const subnetIdRegex = /"subnet-\w+"/g;
                const matchArray = applyStdout.match(subnetIdRegex);
                const subnetIds = matchArray.map(match => match.replace(/"/g, ''));
                respounce.createMessage(req, res, message, subnetIds)
            }
        });

    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

async function osListGet(req, res) {
    try {
        const os_list = [
            "Amazon Linux 2023 kernel-6.1",
            "Amazon Linux 2 Kernel-5.10",
            "Ubuntu focal 20.04 LTS",
            "Ubuntu jammy 22.04 LTS",
            "Windows server core base-2022",
            "Windows server core base-2019",
            "Windows server core base-2016",
            "Windows with SQL server-2022 Standard",
            "Red Had Enterprise Linux 9"
        ]
        return os_list;
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

async function instanceGetList(req, res, message) {
    try {
        const tfConfig = `data "aws_instances" "ins" {
        }
        
        output "ins" {
          value = data.aws_instances.ins.ids
        }`;

        // Write the Terraform configuration to a file
        fs.writeFileSync(`${path.directory}/subnet_list.tf`, tfConfig);


        // Define the relative path to the Terraform configuration directory
        const configPath = `${path.directory}`;

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.error('Terraform apply failed:', applyStderr);
                res.send("Terraform apply failed");
            } else {
                console.log('Terraform apply succeeded.');
                console.log(applyStdout);
                const subnetIdRegex = /"subnet-\w+"/g;
                const matchArray = applyStdout.match(subnetIdRegex);
                const subnetIds = matchArray.map(match => match.replace(/"/g, ''));
                respounce.createMessage(req, res, message, subnetIds)
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}




module.exports = {
    vpcListGet, securityGroupListGet,
    subnetGetList, osListGet, instanceGetList
};