var fs   = require("fs");
var sys  = require("sys");
var exec = require("child_process").exec;

var halt = false;

function error(repoType, task, errorMsg, cb) {
	if (halt) return false;

	console.log("[Repo-Parser] An error occured while " + task + " in a " + repoType + " repository: " + errorMsg);
	halt = true;
  return cb("[Repo-Parser] An error occured while " + task + " in a " + repoType + " repository: " + errorMsg);
}

function checkReturn(dataArray, cb) {
	if (halt) {
		return false;
	}
	if (Object.keys(dataArray).length > 5) {
    Object.keys(dataArray).forEach(function(key) {
      if (typeof(dataArray[key]) === 'string') {
        dataArray[key] = dataArray[key].replace(/\n/g, '');
      }
    });
		cb(null, dataArray);
	}
};

function parseHg(folder, cb) {
	var data = {};

  data.type = 'mercurial';

	exec("cd '"+folder+"'; hg paths default", function(err, stdout, stderr) {
		if(err !== null) {
			error("mercurial", "fetching path", stderr, cb);
		}
		else {
			data.url = stdout;
			checkReturn(data, cb);
		}
	});
	exec("cd '"+folder+"'; hg log --limit 1", function(err, stdout, stderr) {
		if(err !== null) {
			error("mercurial", "fetching log", stderr, cb);
		}
		else {
			var changeset = stdout.match(/^changeset:\s+([^\n]+)$/m);
			//date = stdout.match(/^date:\s+:([^\n]+)$/m);
			var summary = stdout.match(/^summary:\s+([^\n]+)$/m);
			data.revision = changeset[1];
			data.comment = summary[1];
			//data.update_time = date;
			checkReturn(data, cb);
		}
	});
	exec("cd '"+folder+"'; hg branch", function(err, stdout, stderr) {
		if(err !== null) {
			error("mercurial", "fetching branch", stderr, cb);
		}
		else {
			data.branch = stdout;
			checkReturn(data, cb);
		}
	});
	fs.stat(folder+".hg", function(err, stats) {
		if(err !== null) {
			error("mercurial", "fetching stats", "no error available", cb);
		}
		else {
			data.update_time = stats.mtime;
			checkReturn(data, cb);
		}
	});
}

function parseGit(folder, cb) {
	var data = {};

  data.type = 'git';

	exec("cd '"+folder+"'; git config --get remote.origin.url", function(err, stdout, stderr) {
		if(err !== null) {
			error("git", "fetching path", stderr, cb);
		}
		else {
			data.url = stdout;
			checkReturn(data, cb);
		}
	});
	exec("cd '"+folder+"'; git show --quiet --format=%H%n%aD%n%s%n%B HEAD", function(err, stdout, stderr) {
		if(err !== null) {
			error("git", "fetching log", stderr, cb);
		}
		else {
			var lines = stdout.split("\n");
			var revision = lines.shift();
			var date = lines.shift();
			var subject = lines.shift();
			data.comment = subject;
			data.revision = revision;
			// data.message = lines.join("\n"); // the full commit message - includes the subject.
			data.update_time = date;
			checkReturn(data, cb);
		}
	});
	exec("cd '"+folder+"'; git rev-parse --abbrev-ref HEAD", function(err, stdout, stderr) {
		if(err !== null) {
			error("git", "fetching branch", stderr, cb);
		}
		else {
			data.branch = stdout;
			checkReturn(data, cb);
		}
	});
	fs.stat(folder+".git", function(err, stats) {
		if(err !== null) {
			error("git", "fetching stats", "no error available", cb);
		}
		else {
			data.update_time = stats.mtime;
			checkReturn(data, cb);
		}
	});
}

function parseSvn(folder, cb) {
	var data = {};

  data.type = 'svn';

	exec("cd '"+folder+"'; svn info | grep 'Repository Root' | awk '{print $NF}'", function(err, stdout, stderr) {
		if(err !== null) {
			error("subversion", "fetching path", stderr, cb);
		}
		else {
			data.url = stdout;
			checkReturn(data, cb);
		}
	});

	exec("cd '"+folder+"'; svn log -r COMMITTED", function(err, stdout, stderr) {
		if(err !== null) {
			error("subversion", "fetching log", stderr, cb);
		}
		else {
			var message = stdout.match(/^(r[0-9]+)\s\|/m);
			//date = stdout.match(/^date:\s+:([^\n]+)$/m);
			var summary = stdout.match(/lines?\s*\n((.|\n)*)\n-{72}\n$/);
			data.revision = message[1];
			data.comment = summary[1];
			//data.update_time = date;
			checkReturn(data, cb);
		}
	});
	exec("cd '"+folder+"'; svn info | sed -n \"/URL:/s/.*\\///p\"", function(err, stdout, stderr) {
		if(err !== null) {
			error("subversion", "fetching branch", stderr, cb);
		}
		else {
			data.branch = stdout;
			checkReturn(data, cb);
		}
	});
	fs.stat(folder+".svn", function(err, stats) {
		if(err !== null) {
			error("subversion", "fetching stats", "no error available", cb);
		}
		else {
			data.update_time = stats.mtime;
			checkReturn(data, cb);
		}
	});
}

function repo_parser(args, cb) {
	var folder = args.folder;

  if (folder[folder.length - 1] !== '/') {
    folder = folder + "/";
  }

  fs.exists(folder+".git", function(exists) {
		if (exists) {
			return parseGit(folder, cb);
		}
    fs.exists(folder+".svn", function(exists) {
		  if (exists) {
			  return parseSvn(folder, cb);
		  }
      fs.exists(folder+".hg", function(exists) {
		    if (exists) {
			    return parseHg(folder, cb);
		    }
        else {
          return cb({
            msg : 'No versionning system found',
            path : folder
          });
        }
	    });
      return false;
	  });
    return false;
	});
}

module.exports = repo_parser;
