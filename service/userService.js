const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../responce/responce')
require('dotenv').config()

const access_key = process.env.access_key
const secret_key = process.env.secret_key

async function userLogin(req, res, message) {
  try {
    // console.log(1);
    if (`${req.body.username}` === "demo" && `${req.body.password}` === "demo@123") {
      const tfConfig = `
                  provider "aws" {
                    access_key = "${access_key}"
                    secret_key = "${secret_key}"
                      region     = "ap-south-1"
                    }`;

                    
      // Write the Terraform configuration to a file
      fs.writeFileSync(`${path.directory}/main.tf`, tfConfig);
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
              console.error('Terraform login failed:', applyStderr);
              res.status(400).send("Terraform login failed");
            } else {
              console.log('Terraform login succeeded.');
              respounce.createMessage(req, res, message)
            }
          });
        }
      });
    }
    //  Run Terraform commands

  // }
          else {
    res.status(404).send("Invalid user name and password")
  }
} catch (error) {
  return res.status(400).json({ message: " something went wrong ", result: error.message })
}
}

async function s3_bucket_creation(req, res) {
  try {
    const bucketname = req.body.bucket_name;
    if (!bucketname) {
      return res.status(400).json({ message: "Bucket name is required" });
    }
    const tfConfigPath = `${path.directory}/s3_bucket.tf`;

    // Check if the Terraform configuration file exists, and create it if not
    if (!fs.existsSync(tfConfigPath)) {
      fs.writeFileSync(tfConfigPath, ''); // Create an empty file
    }
    const tfContent = fs.readFileSync(tfConfigPath, 'utf8');
    if (tfContent.includes(`"${bucketname}"`)) {
      console.log(`S3 with the name "${bucketname}" already exists in the configuration.`);
      return res.status(400).send(`S3 with the name "${bucketname}" already exists in the configuration.`)
    } else {
      const tfConfig = `
      resource "aws_s3_bucket" "${req.body.bucket_name}" {
          bucket =  "${req.body.bucket_name}"
          lifecycle {
                  prevent_destroy = true
                } 
        }`;
      // Write the Terraform configuration to a file
      fs.writeFileSync(`${path.directory}/s3_bucket.tf`, tfConfig);
    }
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        console.error('Terraform S3 Bucket creation failed:', applyStderr);
        return res.status(400).json({ message: "Terraform S3 Bucket creation failed" });
      } else {
        return true;
      }
    });
  }
  catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

module.exports = { userLogin, s3_bucket_creation };