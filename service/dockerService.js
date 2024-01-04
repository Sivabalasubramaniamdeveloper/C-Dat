const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../responce/responce')

async function createDockerInstance(req, res, message) {
    try {
        let instance_name = req.body.instanceTagName
        let ami = req.body.instanceTagName
        let instance_type = req.body.instanceType
        let subnet_id = req.body.subnetId
        let security_group_id = req.body.securityGroupId
        let public_ip = req.body.publicIp
        let key_name = req.body.keyName
        const tfConfig = ` 
            resource "aws_instance" "${instance_name}" {
            ami                         = "${ami}"
            instance_type               = "${instance_type}"              
            key_name                    = "${key_name}"        
            associate_public_ip_address = ${public_ip}
            subnet_id                   = "${subnet_id}"
            vpc_security_group_ids      = ["${security_group_id}"]
 
            user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              sudo apt install -y awscli docker.io
              sudo usermod -aG docker ubuntu
              echo 'sudo systemctl restart docker' | sudo tee -a /tmp/restart_docker.sh
              sudo chmod +x /tmp/restart_docker.sh
              sudo /tmp/restart_docker.sh
              newgrp docker  # Switch to the "docker" group
              sleep 10  # Wait for Docker to initialize
              aws configure set aws_access_key_id AKIAXAPV36OBUQYXR57G
              aws configure set aws_secret_access_key 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
              aws configure set default.region ap-south-1
              aws ecr get-login-password --region ap-south-1 | sudo docker login --username AWS --password-stdin 482088842115.dkr.ecr.ap-south-1.amazonaws.com
              sudo docker pull 482088842115.dkr.ecr.ap-south-1.amazonaws.com/container-registry:latest
              sudo docker run -d -p 9003:80 482088842115.dkr.ecr.ap-south-1.amazonaws.com/container-registry:latest
              EOF
 
            tags = {
            Name = "${instance_name}"
            }
 
            # Provisioner to wait for the instance to be ready before running commands
            provisioner "remote-exec" {
                inline = [
                "sleep 60"
                ]
    
                connection {
                type        = "ssh"
                user        = "ubuntu"
                host        = aws_instance.dockerServer.public_ip
                private_key = file("${path}/Jenkins.pem")
                agent       = false
                }
            }
        }
       
        `;

        // Write the Terraform configuration to a file
        fs.writeFileSync(`${path.directory}/sns_topic.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        // Run Terraform commands
        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.log('SNS topic creation failed:', applyStderr);
                return res.status(400).json({ message: "SNS topic creation failed" });
            } else {
                console.log('Terraform apply succeeded.');
                respounce.createMessage(req, res, message);
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

module.exports = { createDockerInstance }