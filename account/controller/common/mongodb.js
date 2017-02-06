/**
 * Created by Administrator on 2016/11/23.
 */
var mongodb = require("mongodb");
var server = new mongodb.Server("localhost",27017,{safe: true});

function oprationDB(callback) {
    var DB = new mongodb.Db('zp',server,{});
    DB.open(function(error, client) {
        if (error) {
            throw error;
        }
        console.log("client" + client);
        client.collection("test", {
            safe: true
        },function (err, collection) {
            if (err) {
                throw err;
            }
            collection.find({name: "zp"}).toArray(function (e, doc) {
                console.log(doc);
            });
        });
    } );
}
    //var collection = new mongodb.Collection(client, 'test');
    //console.log("collection"+ collection);
    //collection.find(function(error, cursor){
    //    cursor.each(function(error, doc){
    //        if(doc){
    //            console.log("name:" + doc.name + "age:" +doc.age);
    //        }
    //    });