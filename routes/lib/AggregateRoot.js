/**
 * Created by ThinkPad on 14-11-3.
 */
var inherits = require("util").inherits;
var User = require("../domain/User");
var EventEmitter = require("events").EventEmitter;
var AggregateRoot = function(key){
    if(!key) throw Error("construction must specify the parameters in key");
    EventEmitter.call(this);
    this.key = key;
    this._list = [];
    this.readLock = true;  //读锁
    this.writeLock = true;  //写锁
};

inherits(AggregateRoot, EventEmitter);

Object.defineProperties(AggregateRoot.prototype,{
    add : {
        writable : false,
        value:function(obj, cb){
            if(this.writeLock){ //如果写锁开启
                var self = this;
                if(!obj[this.key]){
                    throw Error("The sort key does not exist in the object");
                    return;
                }

                self.get(obj[self.key],function(err,data){
                    this.readLock = false; //读关闭
                    if(!!data){
                        data[0].lt = new Date().getTime();
                        self._list[+data[1]] = data[0];
                    } else{
                        self._list.push(obj);
                    }
                    this.readLock = true; //读开启
                    cb();
                });
            }else{
                setImmediate(function(){
                    self.add(obj,cb)
                });
            }
        }
    },
    get :{
        value : function(data, cb){
            var self = this;
            if(this.readLock){
                this.writeLock = false;  //写关闭
                for(var i= 0,l=this._list.length;i<l;i++){
                    if(this._list[i][this.key] == data){
                        this.writeLock = true;  //写开启
                        var array = [this._list[i],i];
                         return cb(null,array);
                    }
                }
                this.writeLock = true;
                cb(null)
            }else{
                setImmediate(function(){
                    self.get(data,cb);
                });
            }
        }
    },
    listSync : {
        writable : false,
        value : function(){
            return this._list;
        }
    },
    findByNames : {
        writable:false,
        value : function(names, cb){
            var self = this;
            if(this.readLock){
                if(!(names instanceof Array)){
                    cb(new Error("Parameter must be a Array"));
                }
                if(names.length == 0) cb(null,[]);
                var flag = false;
                if(typeof names[i] == "object") flag = true;
                this.writeLock = false;
                for(var i= 0,l=names.length;i<l;i++){
                    var j =0;
                    for(t=this._list.length;j<t;j++){
                        if(flag){
                            if(names[i][this.key] == this._list[j][this.key]){
                                inherits(names[i],this._list[j]);
                                break;
                            }
                        }else{
                            if(names[i] == this._list[j][this.key]){
                                names[i] = {u:names[i],s:this._list[j].s};
                                break;
                            }

                        }
                    }
                    if(j == t){
                        names[i] = {u:names[i],s:User.OFF_LINE}
                    }
                }
                this.writeLock = true;
                cb(null, names);
            }else{
                setImmediate(function(){
                    self.findByNames(names,cb)
                });
            }
        }
    },
    remove : {
        writable:false,
        value : function(key, cb){
            var self = this;
            if(this.writeLock){
                this.readLock = false;
                var data = this.get(key);
                if(!!data){
                    this._list.splice(data[1],1);
                    this.readLock = true;
                    return cb(null, 1);
                }
                this.readLock = true;
                cb(null, 0);
            }else{
                setImmediate(function(){
                    self.remove(key,cb);
                });
            }
        }
    },
    set : {
        writable: false,
        value : function(key,propertyName,value,cb){
            var self = this;
            if(this.readLock){
                this.writeLock = false;
                for(var i= 0,l=self._list.length;i<l;i++){
                    if(self._list[i].u == key){
                        self._list[i][propertyName] = value;
                    }
                }
                this.writeLock = true;
                cb(null);
            }else{
                setImmediate(function(){
                    self.set(key,propertyName, value, cb);
                });
            }
        }
    }
})

module.exports = AggregateRoot;