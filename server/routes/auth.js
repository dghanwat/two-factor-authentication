const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const model = require('./../models/user');
const router = express.Router();

router.post('/auth/enable', (req, res) => {
    console.log(`DEBUG: Received TFA enable request`);

    const secret = speakeasy.generateSecret({
        length: 10,
        name: model.userObject.uname,
        issuer: 'com.dghanwat'
    });
    var url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: model.userObject.uname,
        issuer: 'com.dghanwat',
        encoding: 'base32'
    });
    QRCode.toDataURL(url, (err, dataURL) => {
        model.userObject.tfa = {
            secret: '',
            tempSecret: secret.base32,
            dataURL,
            tfaURL: url
        };
        return res.json({
            message: 'TFA Auth needs to be verified',
            tempSecret: secret.base32,
            dataURL,
            tfaURL: secret.otpauth_url
        });
    });
});

router.get('/auth/enable', (req, res) => {
    console.log(`DEBUG: Received FETCH TFA request`);

    res.json(model.userObject.tfa ? model.userObject.tfa : null);
});

router.delete('/auth/setup', (req, res) => {
    console.log(`DEBUG: Received DELETE TFA request`);

    delete model.userObject.tfa;
    res.send({
        "status": 200,
        "message": "success"
    });
});

router.post('/auth/verify', (req, res) => {
    console.log(`DEBUG: Received TFA Verify request`);

    let isVerified = speakeasy.totp.verify({
        secret: model.userObject.tfa.tempSecret,
        encoding: 'base32',
        token: req.body.token
    });

    if (isVerified) {
        console.log(`DEBUG: TFA is verified to be enabled`);

        model.userObject.tfa.secret = model.userObject.tfa.tempSecret;
        return res.send({
            "status": 200,
            "message": "Two-factor Auth is enabled successfully"
        });
    }

    console.log(`ERROR: TFA is verified to be wrong`);

    return res.send({
        "status": 403,
        "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
    });
});

module.exports = router;