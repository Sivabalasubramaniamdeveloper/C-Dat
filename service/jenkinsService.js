const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')


async function jenkinsData(req, res, message) {
    try {
        const tfConfig = `
        terraform {
            required_providers {
              jenkins = {
                source  = "overmike/jenkins"
                version = "0.6.1"
              }
            }
          }
          
          provider "jenkins" {
            server_url = "http://3.109.181.119:8080/"  # Specify the correct Jenkins server URL
            username   = "root"
            password   = "root"
          }
          
          resource "jenkins_job" "dys_jenkins" {
            name     = "dys_jenkins"
            template = file("job.xml")
          }`

        fs.writeFileSync(`${path.directory}/service/jenkins_pip.tf`, tfConfig);
        const configPath = `${path.directory}/service`;
        process.chdir(configPath);

        let findValue = {}
        findValue.AWS_DEFAULT_REGION = 'ap-south-1'
        findValue.AWS_ACCOUNT_ID = '482088842115'
        findValue.CODECOMMIT_REPO_URL = 'https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/datayaan_website2.0'
        findValue.ECR_REPO_NAME = 'sample-repo'
        findValue.DOCKER_IMAGE_NAME = 'sample-repo'
        findValue.DOCKER_HOST_IP = '13.233.110.194'
        findValue.DOCKER_HOST_PORT = '80'
        findValue.YOUR_CONTAINER = '482088842115.dkr.ecr.ap-south-1.amazonaws.com/sample-repo'
        // AWS_CREDENTIALS= credentials('aws_provider'),// Use the ID you set in Jenkins credentials
        findValue.IMAGE_TAG = "sample-repo"



        module.exports = {
            findValue
        }
        exec('terraform init -upgrade', (error, initStdout, initStderr) => {
            if (error) {
                console.error('Terraform login initialization failed:', initStderr);
                res.status(400).send("Terraform login initialization failed");
            } else {
                // console.log(3);
                console.log('Terraform login initialization succeeded.');
                exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
                    if (applyError) {
                        console.error('Terraform login failed:', applyStderr);
                        res.status(400).send("Terraform login failed");
                    } else {
                        console.log('Jenkins  succeeded.');
                        respounce.createMessage(req, res, message)
                    }
                });
            }
        })
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

module.exports = {
    jenkinsData
}