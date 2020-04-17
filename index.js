var express = require('express')
var admin = require('firebase-admin')
var credentials = require('./credentials.json')
var app = express()
var port = process.env.PORT || 3000

admin.initializeApp({
    credential: admin.credential.cert(credentials),
    databaseURL: "https://ardhouseapp.firebaseio.com"
})

app.get('/:id', function(req, res){
    var message = {
        notification: {
            title: 'ATENÇÃO ALARME DISPAROU',
            body: 'Alguém tentou entrar em sua casa com o alarme ligado.'
        },
        token: req.params.id
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
})

app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`);
});