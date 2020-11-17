/* Requires */
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

var app = express();

/* Inicializar variables */
var Usuario = require('../models/usuario');

app.post('/', (req ,res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error logueando usuario',
                errors: err
            });
        }
        
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        /* la funcion "compareSync" devuelve un booleano al comparar la contraseña encriptado con el password enviado en el body del request */
        if( !bcrypt.compareSync( body.password, usuarioDB.password )){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        /* Crear token */
        usuarioDB.password = '...';

        var token = jwt.sign({ usuario: usuarioDB }, SEED,{ expiresIn: 14400/* <-- 4 horas  */ })
        

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    })


})

module.exports = app;