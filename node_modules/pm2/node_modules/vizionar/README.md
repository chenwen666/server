
# Repo parser

Git/SVN/Mercurial repository parser to grab metadata

## How to

```javascript
var rpk = require('vizionar');

rpk({
  folder : '/home/tknew/keymetrics/pm2/'
}, function(err, meta) {
  console.log(arguments);
});
```

## Result

```javascript
{
  type: 'git',
  update_time: Wed Sep 17 2014 17:33:28 GMT+0200 (CEST),
  comment: '0.10.8',
  revision: '94688fba797d0dae717ca811254ff98e6e6619a2',
  url: 'git@github.com:Unitech/PM2.git',
  branch: 'master'
}
```
