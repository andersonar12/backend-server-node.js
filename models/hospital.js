var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var hospitalSchema = new Schema({
    
        nombre : {type:String, required:[true, 'El nombre es necesario'] }, 
        usuario : {type:Schema.Types.ObjectId, ref:'Usuario' },
        img : {type:String, required:false },
      
}, {collection: 'hospitales'});


module.exports = mongoose.model('Hospital', hospitalSchema);