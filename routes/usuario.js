/* Requires */
    var express = require('express');
    var bcrypt = require('bcryptjs');
    var jwt = require('jsonwebtoken');
  

/* const SEED = require('../config/config').SEED;  */

var mdAutenticacion = require('../middlewares/autenticacion');

 var app = express();

/* Inicializar variables */
    var Usuario = require('../models/usuario');


/* Rutas */

/* Obtener todos los usuarios */
app.get('/', (req, res, next) => {

    var desde = Number(req.query.desde || 0);

    /* aqui se lee "busca todos los datos, solo los campos nombre email img role"  y luego el .exec es para ejecutar el query*/
    Usuario.find({ }, 'nombre email img role')
            .skip(desde)
            .limit(5)
           .exec(
               (err, usuarios) => { 

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuario',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) =>{

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Usuarios',
                        usuarios: usuarios,
                        total: conteo
                    });


                })

            }) 


});


/* Actualizar Usuario */
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, (err, usuario ) =>{
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if ( !usuario ){
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id: ${ id } no existe`,
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role= body.role.toUpperCase();

        usuario.save( (err, usuarioActualizar) => {
           
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioActualizar.password = '...';

            res.status(200).json({
                ok: true,
                usuario: usuarioActualizar, 
                mensaje: 'Usuario Actulizado correctamente'
            });
    

        } )

    })

})

/* Crear un nuevo usuario */
app.post('/', mdAutenticacion.verificaToken ,(req , res) => {

    var body = req.body;

    /* Esto es del modelo de usuario */
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password ,10),
        img:body.img,
        role: body.role.toUpperCase()
    })

    usuario.save( (err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        
        res.status(202).json({
            ok: true,
            usuario: usuarioGuardado, 
            usuarioToken: req.usuario,
            mensaje: 'Usuario Creado'
        });

    });


})

/* Eliminar un usuario */
app.delete('/:id', mdAutenticacion.verificaToken,(req , res ) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (usuarioBorrado == null) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario no existe'
            });
        }

        
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado, 
            mensaje: 'Usuario Borrado'
        });
    })
})
/* Rutas */
module.exports = app;