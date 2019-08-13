const express = require('express');
const model = require('./../models/user');
const router = express.Router();

router.post('/register', (req, res) => {
    console.log(`DEBUG: Received request to register user`);

    const result = req.body;

    if ((!result.uname && !result.upass) || (result.uname.trim() == "" || result.upass.trim() == "")) {
        return res.send({
            "status": 400,
            "message": "Username/ password is required"
        });
    }

    model.userObject.uname = result.uname;
    model.userObject.upass = result.upass;
    delete model.userObject.tfa;

    return res.send({
        "status": 200,
        "message": "User is successfully registered"
    });
});

module.exports = router;