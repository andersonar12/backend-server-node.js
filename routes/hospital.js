/* Requires */
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


/* const SEED = require('../config/config').SEED;  */

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

/* Inicializar variables */
var Hospital = require('../models/hospital');


/* Rutas */

/* Obtener todos los hospitales */
app.get('/', (req, res, next) => {

    var desde = Number(req.query.desde || 0);
/* aqui se lee "busca todos los datos, solo los campos nombre email img role"  y luego el .exec es para ejecutar el query*/
Hospital.find({ })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
       .exec(
           (err, hospitales) => { 

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Hospital',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) =>{

                
                res.status(200).json({
                    ok: true,
                    mensaje: 'Hospitales',
                    hospitales: hospitales,
                    total: conteo
                });
             

            })


        }) 


});


/* Actualizar Hospital */
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

var id = req.params.id;
var body = req.body;

Hospital.findById( id, (err, hospital ) =>{
    
    if (err) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar hospital',
            errors: err
        });
    }

    if ( !hospital ){
        return res.status(400).json({
            ok: false,
            mensaje: `El hospital con el id: ${ id } no existe`,
            errors: { message: 'No existe un hospital con ese ID'}
        });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;
   

    hospital.save( (err, hospitalActualizar) => {
       
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar hospital',
                errors: err
            });
        }


        res.status(200).json({
            ok: true,
            hospital: hospitalActualizar, 
            mensaje: 'Hospital Actulizado correctamente'
        });


    } )

})

})

/* Crear un nuevo hospital */
app.post('/', mdAutenticacion.verificaToken ,(req , res) => {

var body = req.body;

/* Esto es del modelo de hospital */
var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
})

hospital.save( (err, hospitalGuardado) => {

    if (err) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear hospital',
            errors: err
        });
    }

    
    res.status(202).json({
        ok: true,
        hospital: hospitalGuardado, 
        hospitalToken: req.hospital,
        mensaje: 'Hospital Creado'
    });

});


})

/* Eliminar un hospital a partir del ID*/
app.delete('/:id', mdAutenticacion.verificaToken,(req , res ) => {

var id = req.params.id;

Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    
    if (err) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar hospital',
            errors: err
        });
    }

    if (hospitalBorrado == null) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Hospital no existe con ese ID'
        });
    }

    
    res.status(200).json({
        ok: true,
        hospital: hospitalBorrado, 
        mensaje: 'Hospital Borrado'
    });
})
})
/* Rutas */
module.exports = app;