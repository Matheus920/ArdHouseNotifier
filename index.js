require('dotenv').config()
var express = require('express')
var admin = require('firebase-admin')
var credentials = require('./credentials.json')
var mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose)
var app = express()
var port = process.env.PORT || 3000
var mongoURL = process.env.MONGODB_URI || 'mongodb://localhost/test';

const mongoOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    family: 4 
};

app.use(express.json())
mongoose.connect(mongoURL, mongoOptions);

var Schema = mongoose.Schema;

var deviceSchema = new Schema({
    name: {type: String, required: true}
})

deviceSchema.plugin(AutoIncrement, {inc_field: 'id'})

var devices = mongoose.model('devices', deviceSchema)

admin.initializeApp({
    credential: admin.credential.cert(credentials),
    databaseURL: "https://ardhouseapp.firebaseio.com"
})

app.get('/:id', function(req, res){
    devices.findOne({id: req.params.id}, function(err, device){
        if(err) res.status(500).send(err)

        if(device){
            var message = {
                notification: {
                    title: 'ATENÇÃO ALARME DISPAROU',
                    body: 'Alguém tentou entrar em sua casa com o alarme ligado.'
                },
                token: device.name
            }
        
            admin.messaging().send(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
                res.status(200).send('Mensagem enviada')
            })
            .catch((err) => {
                console.log('Something went wrong: ', err);
                res.status(500).send('Algo deu errado')
            })
        }
    })
})

app.post('/saveId', function(req, res){
    if(req.body.id){
        devices.findOne({name: req.body.id}, (err, result) => {
            if(err) res.status(500).send(err)
            
            if(result){
                res.status(200).send({id: result.id})
            }
            else{
                devices.create({name: req.body.id}, (err, result) =>{
                    if(err) res.status(500).send(err)

                    res.status(200).send({id: result.id})
                })
            }
        })
    }
})

app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`);
});