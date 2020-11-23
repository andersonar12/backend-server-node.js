/* Requires */
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


/* const SEED = require('../config/config').SEED;  */

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

/* Inicializar variables */
var Medico = require('../models/medico');


/* Rutas */

/* Obtener todos los medicos */
app.get('/', (req, res, next) => {

    var desde = Number(req.query.desde || 0);
/* aqui se lee "busca todos los datos, solo los campos nombre email img role"  y luego el .exec es para ejecutar el query*/
Medico.find({ }).skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email').populate('hospital')
       .exec(
           (err, medicos) => { 

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Medico',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) =>{

                res.status(200).json({
                    ok: true,
                    mensaje: 'Medicos',
                    medicos: medicos,
                    total: conteo
                });
             

            })



        }) 


});


/* Actualizar Medico */
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

var id = req.params.id;
var body = req.body;

Medico.findById( id, (err, medico ) =>{
    
    if (err) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar medico',
            errors: err
        });
    }

    if ( !medico ){
        return res.status(400).json({
            ok: false,
            mensaje: `El medico con el id: ${ id } no existe`,
            errors: { message: 'No existe un medico con ese ID'}
        });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;
   

    medico.save( (err, medicoActualizar) => {
       
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar medico',
                errors: err
            });
        }


        res.status(200).json({
            ok: true,
            medico: medicoActualizar, 
            mensaje: 'Medico Actulizado correctamente'
        });


    } )

})

})

/* Crear un nuevo medico */
app.post('/', mdAutenticacion.verificaToken ,(req , res) => {

var body = req.body;

/* Esto es del modelo de medico */
var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
})

medico.save( (err, hospitalGuardado) => {

    if (err) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear medico',
            errors: err
        });
    }

    
    res.status(202).json({
        ok: true,
        medico: hospitalGuardado, 
        hospitalToken: req.medico,
        mensaje: 'Medico Creado'
    });

});


})

/* Eliminar un medico a partir del ID*/
app.delete('/:id', mdAutenticacion.verificaToken,(req , res ) => {

var id = req.params.id;

Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    
    if (err) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar medico',
            errors: err
        });
    }

    if (medicoBorrado == null) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Medico no existe con ese ID'
        });
    }

    
    res.status(200).json({
        ok: true,
        medico: medicoBorrado, 
        mensaje: 'Medico Borrado'
    });
})
})
/* Rutas */
module.exports = app;