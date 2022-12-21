const userModel = require('../models/userModel');
const validateBody = require('../validation/validation');
const jwt = require("jsonwebtoken");
const e = require('express');

const exportFunc = {
    userRegistration: async (req, res) => {
        try {
            const userDataBody = req.body
            const { title, name, phone, email, password, address } = userDataBody;

            if (!validateBody.isValidRequestBody(userDataBody)) {
                return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
            }
            if (!validateBody.isValid(title)) {
                return res.status(400).send({ status: false, message: "Please provide tittle or title field" });
            }
            if (!validateBody.isValid(name)) {
                return res.status(400).send({ status: false, message: "Please provide name or name field" });
            }
            if (!validateBody.alphabetTestOfString(name)) {
                return res.status(400).send({ status: false, message: "You can't use special character or number in name" });
            }
            if (!validateBody.isValid(phone)) {
                return res.status(400).send({ status: false, message: "Please provide phone number or phone field" });
            }
            if (!validateBody.isValidMobileNum(phone)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid phone number.' })
            }
            if (!validateBody.isValid(email)) {
                return res.status(400).send({ status: false, message: "Please provide Email id or email field" });;
            }
            if (!validateBody.isValidSyntaxOfEmail(email)) {
                return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
            }
            if (!validateBody.isValid(password)) {
                return res.status(400).send({ status: false, message: "Please provide password or password field" });;
            }
            let size = Object.keys(password.trim()).length
            if (size < 8 || size > 15) {
                return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 15 characters" });;
            }
            let isDBexists = await userModel.find();
            let dbLen = isDBexists.length
            if (dbLen != 0) {
                const DuplicateEmail = await userModel.find({ email: email });
                const emailFound = DuplicateEmail.length;
                if (emailFound != 0) {
                    return res.status(400).send({ status: false, message: "This email Id already exists with another user" });
                }
                const duplicatePhone = await userModel.findOne({ phone: phone })
                if (duplicatePhone) {
                    return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
                }
            }
            let registration = { title, name, phone, email, password, address }
            const userData = await userModel.create(registration);
            return res.status(201).send({ status: true, message: 'Success', data: userData });
        }
        catch (err) {
            return res.status(500).send({ status: false, message: err.message });
        }
    },


    userLogin: async (req, res) => {
        try {
            const userDataBody = req.body
            const { email, password } = userDataBody
            if (!validateBody.isValidRequestBody(userDataBody)) {
                return res.status(400).send({ status: false, message: "Please provide data for successful login" });
            }
            if (!validateBody.isValid(email)) {
                return res.status(400).send({ status: false, message: "Please provide Email id or email field" });;
            }
            if (!validateBody.isValidSyntaxOfEmail(email)) {
                return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
            }
            if (!validateBody.isValid(password)) {
                return res.status(400).send({ status: false, message: "Please provide password or password field" });;
            }
            let user = await userModel.findOne({ email: email, password: password });
            if (user) {
                const { _id, name, phone } = user
                let payload = { userId: _id, email: email, phone: phone };
                const generatedToken = jwt.sign(payload, "subha", { expiresIn: '30m' });
                res.header('user-login-key', generatedToken);
                return res.status(200).send({
                    Message: name + " you have logged in Succesfully",
                    userId: user._id,
                    token: generatedToken,
                });
            } else {
                return res.status(400).send({ status: false, message: "Oops...Invalid credentials" });
            }
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message });
        }
    }

}

module.exports = exportFunc