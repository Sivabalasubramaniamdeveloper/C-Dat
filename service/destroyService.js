const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../responce/responce')

async function accountDestroy(req, res, message) {
    try {
        const configPath = `${path.directory}`; // Path to the directory containing your Terraform configuration file
        
        if (!fs.existsSync(configPath)) {
            console.error(`Directory does not exist: ${configPath}`);
            return res.status(400).json({ message: "Directory does not exist", result: null });
        }
        process.chdir(configPath);

        exec('terraform destroy --auto-approve ', (destroyError, destroyStdout, destroyStderr) => {
            if (destroyError) {
                console.error('Terraform destroy failed:', destroyStderr);
                return res.status(400).json({ message: 'Terraform destroy failed', result: destroyStderr });
            } else {
                console.log("destroyStdout: ", destroyStdout);
                respounce.createMessage(req, res, message)

            }
        });
    } catch (error) {
        return res.status(400).json({ message: "Something went wrong", result: error.message });
    }
}

async function serviceDestroy(req, res, message) {
    try {
        let service = req.body.service;
        let deleteFileName = req.body.deleteFileName;
        const configPath = `${path.directory}`; // Path to the directory containing your Terraform configuration file

        if (!fs.existsSync(configPath)) {
            console.error(`Directory does not exist: ${configPath}`);
            return res.status(400).json({ message: "Directory does not exist", result: null });
        }
        process.chdir(configPath);

        exec(`terraform destroy --target=${service}.${deleteFileName}` , (destroyError, destroyStdout, destroyStderr) => {
            if (destroyError) {
                console.error('Terraform destroy failed:', destroyStderr);
                return res.status(400).json({ message: 'Terraform destroy failed', result: destroyStderr });
            } else {
                console.log("destroyStdout: ", destroyStdout);
                respounce.createMessage(req, res, message)

            }
        });
    } catch (error) {
        return res.status(400).json({ message: "Something went wrong", result: error.message });
    }
}

module.exports = { accountDestroy, serviceDestroy }