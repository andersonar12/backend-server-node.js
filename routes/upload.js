var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs')
var app = express();

var Usuario = require('../models/usuario')
var Medico = require('../models/medico')
var Hospital = require('../models/hospital')

// default options
app.use(fileUpload());

/* Rutas */
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    /* Tipos de coleccion */
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf( tipo ) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de Coleccion no es valida',
            errors: { message: 'Tipo de Coleccion no es valida'}
        });
    }

    if (!req.files) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No selecciono nada',
        errors: { message: 'Debe seleccionar una imagen'}
    });
    }

    /* Obtenere nombre del archivo */
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1]


    /* Extensiones solamente validas */
    var extensionesValidas = ['png','svg','gif','jpg','jpeg'];

    if( extensionesValidas.indexOf( extensionArchivo ) < 0){

        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ')}
        });
    }
    
    /* Nombre de archivo personalizado */
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo }`;

    /* Mover el archivo del temporal a un directorio cualquiera */
    var path = `uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err =>{

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err,
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

    })

    
  });



function subirPorTipo( tipo, id, nombreArchivo, res ) {
    
    if (tipo === 'usuarios') {
        
        Usuario.findById( id, (err, usuario) =>{

            if (err || !usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al guardar datos o usuario Inexistente',
                    errors: err
                });
            }

            var pathViejo = 'uploads/usuarios/' + usuario.img;

            
            /* Para comprobar que existe la imagene anterior y eliminarla */
            

            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado) => {

                usuarioActualizado.password = '...';

                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar datos',
                        errors: err
                    });
                }

                return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de usuario actualizada',
                usuario: usuarioActualizado
                });

            })

        });
    }

    if (tipo === 'medicos') {

        Medico.findById( id, (err, medico) =>{

            if (err || !medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al guardar datos o medico Inexistente',
                    errors: err
                });
            }

            var pathViejo = 'uploads/medicos/' + medico.img;

            
            /* Para comprobar que existe la imagene anterior y eliminarla */
            

            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save( (err, medicoActualizado) => {

                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar datos',
                        errors: err
                    });
                }

                return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de medico actualizada',
                medico: medicoActualizado
                });

            })

        });
    }

    if (tipo === 'hospitales') {
        
        Hospital.findById( id, (err, hospital) =>{

            if (err || !hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al guardar datos o hospital inexistente',
                    errors: err
                });
            }

            var pathViejo = 'uploads/hospitales/' + hospital.img;

            
            /* Para comprobar que existe la imagene anterior y eliminarla */
            

            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalActualizado) => {

                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar datos',
                        errors: err
                    });
                }

                return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de hospital actualizada',
                hospital: hospitalActualizado
                });

            })

        }); 
    }
}

module.exports = app;

/* var array = []; 

for (let index = 1; index <= 5 ; index++) {
    
    if(index % 2 == 0) {
        array.push('-');
        
      }
      else {
        array.push('+'); 
      }
}

console.log(array.join('')) */