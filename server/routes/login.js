const express = require('express');
const speakeasy = require('speakeasy');
const model = require('./../models/user');
const router = express.Router();

router.post('/login', (req, res) => {
    console.log(`DEBUG: Received login request`);

    if (model.userObject.uname && model.userObject.upass) {
        if (!model.userObject.tfa || !model.userObject.tfa.secret) {
            if (req.body.uname == model.userObject.uname && req.body.upass == model.userObject.upass) {
                console.log(`DEBUG: Login without TFA is successful`);

                return res.send({
                    "status": 200,
                    "message": "success"
                });
            }
            console.log(`ERROR: Login without TFA is not successful`);

            return res.send({
                "status": 403,
                "message": "Invalid username or password"
            });

        } else {
            if (req.body.uname != model.userObject.uname || req.body.upass != model.userObject.upass) {
                console.log(`ERROR: Login with TFA is not successful`);

                return res.send({
                    "status": 403,
                    "message": "Invalid username or password"
                });
            }
            if (!req.headers['x-tfa']) {
                console.log(`WARNING: Login was partial without TFA header`);

                return res.send({
                    "status": 206,
                    "message": "Please enter the Auth Code"
                });
            }
            let isVerified = speakeasy.totp.verify({
                secret: model.userObject.tfa.secret,
                encoding: 'base32',
                token: req.headers['x-tfa']
            });

            if (isVerified) {
                console.log(`DEBUG: Login with TFA is verified to be successful`);

                return res.send({
                    "status": 200,
                    "message": "success"
                });
            } else {
                console.log(`ERROR: Invalid AUTH code`);

                return res.send({
                    "status": 206,
                    "message": "Invalid Auth Code"
                });
            }
        }
    }

    return res.send({
        "status": 404,
        "message": "Please register to login"
    });
});

module.exports = router;