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
                sudo aws configure set aws_access_key_id AKIAXAPV36OBY2Z74DVZ
                sudo aws configure set aws_secret_access_key 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
                sudo aws configure set default.region ap-south-1
                sudo aws configure set default.output json
                aws ecr get-login-password --region ap-south-1 | sudo docker login --username AWS --password-stdin 482088842115.dkr.ecr.ap-south-1.amazonaws.com
                sudo apt install python3-pip -y
                sudo pip install git-remote-codecommit -q
                sleep 10
                git clone codecommit::ap-south-1://datayaan_website2.0
                echo cloning repo
                sleep 30
                cd /
                cd datayaan_website2.0
                cd datayaan_website2.0
                sudo docker build -t 482088842115.dkr.ecr.ap-south-1.amazonaws.com/datayaan_container_registry .
                sudo docker push 482088842115.dkr.ecr.ap-south-1.amazonaws.com/datayaan_container_registry:latest
                sudo docker run -d -p 9003:80 482088842115.dkr.ecr.ap-south-1.amazonaws.com/datayaan_container_registry:latest
                sudo docker pull 482088842115.dkr.ecr.ap-south-1.amazonaws.com/datayaan_container_registry:latest
                
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
        fs.writeFileSync(`${path.directory}/docker.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        // Run Terraform commands
        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.log('docker creation failed:', applyStderr);
                return res.status(400).json({ message: "docker creation failed" });
            } else {
                console.log('Terraform apply succeeded.');
                respounce.createMessage(req, res, message);
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

async function containerDeploy(req, res){
    try {
        let config = `
          resource "aws_ecs_cluster" "my_cluster" {
            name = "fargate-cluster"
          }
           
          resource "aws_ecs_task_definition" "app_task" {
            family                   = "app-task"
            container_definitions    = <<DEFINITION
            [
              {
                "name": "app-task",
                "image": "482088842115.dkr.ecr.ap-south-1.amazonaws.com/container_registry",
                "essential": true,
                "portMappings": [
                  {
                    "containerPort": 80,
                    "hostPort": 80
                  }
                ],
                "memory": 512,
                "cpu": 256
              }
            ]
            DEFINITION
            requires_compatibilities = ["FARGATE"]
            network_mode             = "awsvpc"    
            memory                   = 512        
            cpu                      = 256        
            execution_role_arn       = "arn:aws:iam::482088842115:role/ecsTaskExecutionRole"
          }
           
          resource "aws_default_vpc" "default_vpc" {
          }
           
           
          resource "aws_default_subnet" "default_subnet_a" {
            availability_zone = "ap-south-1a"
          }
           
          resource "aws_default_subnet" "default_subnet_b" {
            availability_zone = "ap-south-1b"
          }
           
          resource "aws_security_group" "load_balancer_security_group" {
            ingress {
              from_port   = 80
              to_port     = 80
              protocol    = "tcp"
              cidr_blocks = ["0.0.0.0/0"]
            }
           
            egress {
              from_port   = 0
              to_port     = 0
              protocol    = "-1"
              cidr_blocks = ["0.0.0.0/0"]
            }
          }

          resource "aws_alb" "application_load_balancer" {
            name               = "load-balancer-dev" #load balancer name
            load_balancer_type = "application"
            subnets = [
              "${aws_default_subnet.default_subnet_a.id}",
              "${aws_default_subnet.default_subnet_b.id}"
            ]
            # security group
            security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
          }

          resource "aws_security_group" "service_security_group" {
            ingress {
              from_port = 0
              to_port   = 0
              protocol  = "-1"
              # Only allowing traffic in from the load balancer security group
              security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
            }
           
            egress {
              from_port   = 0
              to_port     = 0
              protocol    = "-1"
              cidr_blocks = ["0.0.0.0/0"]
            }
          }
           
          resource "aws_lb_target_group" "target_group" {
            name        = "target-group"
            port        = 80
            protocol    = "HTTP"
            target_type = "ip"
            vpc_id      = "${aws_default_vpc.default_vpc.id}"
          }
           
          resource "aws_lb_listener" "listener" {
            load_balancer_arn = "${aws_alb.application_load_balancer.arn}"
            port              = "80"
            protocol          = "HTTP"
            default_action {
              type             = "forward"
              target_group_arn = "${aws_lb_target_group.target_group.arn}"
            }
          }
           
          resource "aws_ecs_service" "app_service" {
            name            = "app-first-service"    
            cluster         = "${aws_ecs_cluster.my_cluster.id}"  
            task_definition = "${aws_ecs_task_definition.app_task.arn}"
            launch_type     = "FARGATE"
            desired_count   = 2 # Set up the number of containers to 3
           
            load_balancer {
              target_group_arn = "${aws_lb_target_group.target_group.arn}"
              container_name   = "${aws_ecs_task_definition.app_task.family}"
              container_port   = 80
            }
           
            network_configuration {
              subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}"]
              assign_public_ip = true    
              security_groups  = ["${aws_security_group.service_security_group.id}"]
            }
          }
           
          
           
          output "app_url" {
            value = aws_alb.application_load_balancer.dns_name
          }
        `

        fs.writeFileSync(`${path.directory}/docker.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        // Run Terraform commands
        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.log('docker creation failed:', applyStderr);
                return res.status(400).json({ message: "docker creation failed" });
            } else {
                console.log('Terraform apply succeeded.');
                respounce.createMessage(req, res, message);
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

module.exports = { createDockerInstance, containerDeploy }