const fs = require('fs');
const path = require('../path');
const { exec } = require('child_process');



function createMessage(req, res, message, value) {
    let data = []
    data.push(value)
    if (data.length > 0) {
        return res.status(200).json({ message: `${message} successfully `, result: value });
    } else {
        return res.status(200).json({ message: `${message} successfully ` });
    }
}

async function architectureCreate(req, res, message, value) {
    try {
        if (value.length > 0) {
            await messageSend(req, res, value)
            return res.status(200).json({ message: `${message} successfully `, result: value });
        } else {
            return res.status(400).json({ message: `${message} data is empty` });
        }
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  

}


async function messageSend(req, res, data) {
    try {
        // const value = aws_sns_topic.example.arn
        console.log(12345);
        let tfConfig = `
        provider "aws" {
            access_key = "AKIAXAPV36OBZ4Q4EV6K"
            secret_key = "JGxXIQKIU334UHpF6ANF75PhoIpQ/Mjn4XqpCMxY"
            region     = "ap-south-1" # Set your desired AWS region
          }

        resource "aws_sns_topic" "example" {
            name = "my_sns_topic"
          }
          
          
          resource "aws_sns_topic_subscription" "example" {
            topic_arn = aws_sns_topic.example.arn
            protocol  = "email"
            endpoint  = "theenathayalan0497@gmail.com"
          }
          
          
          resource "null_resource" "publish_message" {
              
            provisioner "local-exec" {
              command = <<EOF
                aws sns publish --topic-arn "${aws_sns_topic.example.arn}" --message "welcome, theena and C-Dat Team! create ${data}"
              EOF
            }
          }
        `
        const fileName = `${path.directory}/message.tf`
        fs.writeFileSync(fileName, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);



        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            
            if (applyError) {
                // fs.unlinkSync(fileName)
                console.error('Terraform apply failed:', applyStderr);
                return ;
            } else {
                // fs.unlinkSync(fileName)
                const tfstateFileName = `${path.directory}/terraform.tfstate`;
                const tfstateContent = fs.readFileSync(tfstateFileName, 'utf8');
                const tfstateObj = JSON.parse(tfstateContent);
        
                // Function to remove an instance by name
                const removeInstanceByName = (resourceArray, instanceName) => {
                    return resourceArray.filter(resource => resource.name !== instanceName);
                };
        
                // Remove the instance with the specified name
                tfstateObj.resources = removeInstanceByName(tfstateObj.resources, 'publish_message');
        
                // Write the updated JSON back to the tfstate file
                fs.writeFileSync(tfstateFileName, JSON.stringify(tfstateObj, null, 2));
        
                console.log('Instance "publish_message" deleted from tfstate file.');
                console.log('message send succeeded.')
                return
            }
        });
    } catch (error) {
        console.log(error.message)
        // return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

module.exports = { createMessage, architectureCreate }