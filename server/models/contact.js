'use strict';

var Mongo  = require('mongodb'),
    _      = require('underscore'),
    fs     = require('fs'),
    path   = require('path');

function Contact(ownerId, fields, files){
  this.ownerId  = Mongo.ObjectID(ownerId);
  this.fname    = fields.fname[0];
  this.lname    = fields.lname[0];
  this.phone    = fields.phone[0];
  this.email    = fields.email[0];
  this.street   = fields.street[0];
  this.city     = fields.city[0];
  this.zip      = fields.zip[0];
  this.bday     = new Date(fields.bday[0]);
  this.photo    = this.stashPhoto(files[0], this._id);
}

Object.defineProperty(Contact, 'collection',{
  get: function(){return global.mongodb.collection('contacts');}
});

Contact.create = function(fields, files, cb){
  var c = new Contact(fields, files);
  Contact.collection.save(c,cb);
};

Contact.all = function(cb){
  Contact.collection.find().toArray(cb);
};

Contact.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Contact.collection.findOne({_id:_id}, function(err, obj){
    var contact = Object.create(Contact.prototype);
    contact = _.extend(contact, obj);
    cb(err, contact);
  });
};

Contact.prototype.save = function(fields, cb){
  var properties = Object.keys(fields),
    self       = this;

  properties.forEach(function(property){
    switch(property){
      case 'bday':
        self.bday = new Date(fields[property]);
        break;
      default:
        self[property] = fields[property];
    }
  });


  this._id = Mongo.ObjectID(this._id);
  Contact.collection.save(this, cb);
};

// HELPER FUNCTIONS

Contact.prototype.stashPhoto = function(file){

  if(!file.size){return;}

  var stashDir  = __dirname + '/../public/assets/img/',
      ext       = path.extname(file.path),
      name      = this._id + ext,
      stashPath = stashDir + name;

  fs.renameSync(file.path, stashPath);
  return stashPath;
};

module.exports = Contact;

