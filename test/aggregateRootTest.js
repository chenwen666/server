/**
 * Created by ThinkPad on 14-11-4.
 */

var AggregateRoot = require("../routes/lib/AggregateRoot");
var aggreateRoot = new AggregateRoot("u");
setTimeout(function(){
    aggreateRoot.add({u:"1011",s:1},function(){});
    aggreateRoot.add({u:"1008",s:1},function(){});
    aggreateRoot.add({u:"105",s:1},function(){});
    aggreateRoot.add({u:"1089",s:1},function(){});
    aggreateRoot.add({u:"1001",s:1},function(){});
    aggreateRoot.add({u:"1004",s:1},function(){});
    aggreateRoot.add({u:"1007",s:1},function(){});
    aggreateRoot.add({u:"1009",s:1},function(){});
    console.log(aggreateRoot.listSync());
});
setTimeout(function(){
    aggreateRoot.set("1009","s",2,function(){});
    console.log(aggreateRoot.listSync());
})
//console.log(aggreateRoot.get("1009","u"));

//aggreateRoot.remove("1004");

//console.log(aggreateRoot.list());





