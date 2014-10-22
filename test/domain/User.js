/**
 * Created by chenwen on 14-10-22.
 */
var User = require("../../routes/domain/User");

console.log(User.GENDER_VALUE);

console.log(User.GENDER_VALUE.MAN);

User.GENDER_VALUE.MAN = 10;

console.log(User.GENDER_VALUE.MAN);

User.GENDER_VALUE = {a:1}

console.log("111:%j",User.GENDER_VALUE);

User.GENDER_VALUE.SEX = 10

console.log("gaibianhou:"+JSON.stringify(User.GENDER_VALUE));