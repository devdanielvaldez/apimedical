const User = require('../models/users');
const UserGeneral = require('../models/usersGenerals');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const {
    config
} = require('dotenv');
const { authMiddleware } = require('../middleware/authMiddleware');
config();

const registerUser = async (req, res) => {
    const { username, pwd, firstName, lastName, phone } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

        const hashedPwd = await bcrypt.hash(pwd, 10);
        const userGeneral = new UserGeneral({ firstName, lastName, phone });
        await userGeneral.save();

        const user = new User({ username, pwd: hashedPwd, userGeneral: userGeneral._id });
        await user.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el usuario.', error });
    }
};

const loginUser = async (req, res) => {
    const { username, pwd } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Usuario y/o Contraseñas incorrectos' });
        }

        const isMatch = await bcrypt.compare(pwd, user.pwd);
        if (!isMatch) {
            return res.status(400).json({ message: 'Usuario y/o Contraseñas incorrectos' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al iniciar sesión.', error });
    }
};

const getUserData = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('userGeneral');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los datos del usuario.', error });
    }
};

const routes = express.Router();

routes.post('/register', registerUser);
routes.post('/login', loginUser);
routes.get('/me', authMiddleware, getUserData);

module.exports = routes;