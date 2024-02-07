const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')
require('dotenv').config()

const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.accountSid, process.env.authToken)

// const access_key = process.env.access_key
// const secret_key = process.env.secret_key

//database
let database = require('../Connections/postgres')
let user = database.users
let organization = database.organizations
let service = database.Services

let otp;

async function signUp(req, res) {
  try {
    // console.log(1);
    let register = {}
    let name = req.body.user_name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber

    


    register.name = name
    register.password = password
    register.email = email
    register.phonenumber = phonenumber

    // console.log("user register : ", register);
    let data = await user.findOne({
      where: { phonenumber: phonenumber }
    })
    if (data) {
      return res.status(400).json({ message: "already phone number registered" })
    } else {
      // let userRegister = await user.create(register)
      return res.status(201).json({ message: "user register successfully" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function superAdminSignUp(req, res, message) {
  try {
    // console.log(1);
    let register = {}
    let name = req.body.name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber
    let role = req.body.role
    register.name = name
    register.password = password
    register.email = email
    register.phonenumber = phonenumber
    register.role = role
    let data = await user.findOne({
      where: { phonenumber: phonenumber }
    })
    if (data) {
      return res.status(400).json({ message: "already phone number registered" })
    } else {
      let organizationRegister = await user.create(register)
      return res.status(201).json({ message: "super admin register successfully" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function organizationSignUp(req, res, message) {
  try {
    // console.log(1);
    let register = {}
    let name = req.body.name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber

    register.name = name
    register.password = password
    register.email = email
    register.phonenumber = phonenumber
    register.createdby = req.id

      let organizationRegister = await organization.create(register)
      return res.status(201).json({ message: "organization register successfully" })
    

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function organizationLogin(req, res, message) {
  try {
    let phonenumber = req.body.phonenumber
    if (!phonenumber) {
      return res.status(400).json({ message: "phone number required" })
    }
    let password = req.body.password
    if (!password) {
      return res.status(400).json({ message: "password required" })
    }
    // console.log(1);
    let organizationData = await user.findOne({
      where: { phonenumber: phonenumber }
    })
    if (!organizationData) {
      return res.status(404).json({ message: "organization not found" })
    }
    if (organizationData.phonenumber == phonenumber) {
      if (organizationData.password == password) {
        return res.status(201).json({ message: "log in successfully" })
      } else {
        return res.status(400).json({ message: "user phone number and password incorrect" })
      }
    } else {
      return res.status(400).json({ message: "user phone number and password incorrect" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function userSignUp(req, res, message) {
  try {
    // console.log(1);
    let register = {}
    let name = req.body.user_name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber
    let role = req.body.role
    if (req.role == 'superAdmin') {
      register.role = role
    } else if (req.role == 'admin') {
      register.role = role
    } else {

      await respounce.otpMessage("number", "send success")
    }

    register.name = name
    register.password = password
    register.email = email
    register.phonenumber = `+91${phonenumber}`

    console.log("user register : ", register);
    let data = await user.findOne({
      where: { phonenumber: phonenumber }
    })
    if (data) {
      return res.status(400).json({ message: "already phone number registered" })
    } else {
      // let userRegister = await user.create(register)
      return res.status(201).json({ message: "user register successfully" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function userLogin(req, res, message) {
  try {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let phonenumber = req.body.phonenumber
    if (!phonenumber) {
      return res.status(400).json({ message: "phone number required" })
    }
    let password = req.body.password
    if (!password) {
      return res.status(400).json({ message: "password required" })
    }
    // console.log(1);
    let data = await user.findOne({
      where: { phonenumber: phonenumber }
    })
    if (!data) {
      return res.status(404).json({ message: "user not found" })
    }
    if (data.phonenumber == phonenumber) {
      if (data.password == password) {
        let user = {
          uuid: data.uuid,
          role: data.role,
          organization_id: data.organization_id
        }
        const token = jwt.sign(user, jwtSecretKey, {
          expiresIn: '365d' // expires in 365 days
     });
        return res.status(201).json({ message: "log in successfully", result: token })
      } else {
        return res.status(400).json({ message: "user phone number and password incorrect" })
      }
    } else {
      return res.status(400).json({ message: "user phone number and password incorrect" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function getService(req, res) {
  try {
    let data = req.body
    data.isActive = true
    data.isDelete = false

    let serviceDetails = await service.findOne(data)
    if (serviceDetails) {
      return res.status(200).json({ message: "get service detail successfully" })
    } else {
      return res.status(404).json({ message: "service not found" })
    }
  } catch (error) {
    return res.status(400).json({ message: "something went wrong", result: error.message })
  }
}

async function s3_bucket_creation(req, res, message) {
  try {
    const bucketname = req.body.bucket_name;
    if (!bucketname) {
      return res.status(400).json({ message: "Bucket name is required" });
    }
    const tfConfigPath = `${path.directory}/s3_bucket.tf`;

    const tfConfig = `
      resource "aws_s3_bucket" "${req.body.bucket_name}" {
          bucket =  "${req.body.bucket_name}"
          lifecycle {
                  prevent_destroy = true
                } 
        }`;
    // Write the Terraform configuration to a file
    fs.writeFileSync(`${path.directory}/s3_bucket.tf`, tfConfig);
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        console.error('Terraform S3 Bucket creation failed:', applyStderr);
        return res.status(400).json({ message: "Terraform S3 Bucket creation failed" });
      } else {
        console.log('Terraform apply succeeded.');
        respounce.createMessage(req, res, message)
      }
    });
  }
  catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

async function forgetPasswordOtpSend(req, res) {
  try {
    let forgetPassword ={
      email : req.params.email,
      uuid : req.id
    } 
 
    let data = await user.findOne({
      where: forgetPassword
    })
    if(!data){
      return res.status(404).json({ message: "email not found"})
    }

    otp = otpGenerator.generate(4, { 
      lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false 
    });

    setTimeout(() => {
      otp = undefined

    }, 30000)
    console.log(" generate : ", otp);
    const transporter = nodemailer.createTransport({
      port: 465,               // true for 465, false for other ports
      host: "smtp.gmail.com",
      auth: {
          user: process.env.step-email,
          pass: process.env.step-pass,
      },
      secure: true,
  });

  const mailData = {
      from: process.env.step-email ,  // sender address
      to: data.email,   // list of receivers
      subject: 'change the password',
      text: 'That was easy!',
      html: `<b>forget password </b><br> OTP - ${otp}<br/>`,
  };

  transporter.sendMail(mailData, function (err, info) {
      if (err)
          console.log(err)
      else
      return res.status(200).json({ message: "OTP mail send successfully", message_id: info})
  });
  } catch (error) {
    return res.status(400).json({ message: "something went wrong", result: error.message })
  }
}

async function passwordOtpVerify(req, res){
  try {
    let userOtp = req.body.otp 
    if (userOtp == otp) {
      return res.status(200).json({ message: 'OTP verifyed successfully' })
    }else{
      return res.status(400).json({ message: 'Please check the OTP' })
    }
  } catch (error) {
    return res.status(400).json({ message: 'something went wrong', result: error.message })
  }
}

async function changePassword(req, res) {
  try {
    let newPassword = req.body.newPassword
    let changePassword = req.body.changePassword
    if(newPassword == changePassword){
      let data = await user.findOne({
        where: { uuid: req.id }
      })
      data.password = changePassword
      let passwordUpdate = await user.update(data, {
        where: { uuid: req.id }
      })
      return res.status(200).json({ message: 'Password change successfully' })
    }else{
      return res.status(400).json({ message: 'Please check the new password and change password'})
    }
     
  } catch (error) {
    return res.status(400).json({ message: 'something went wrong', result: error.message })
  }
}

module.exports = {
  signUp, superAdminSignUp, organizationSignUp, userSignUp, organizationLogin,
  userLogin, s3_bucket_creation, getService, forgetPasswordOtpSend, changePassword, 
  passwordOtpVerify
};