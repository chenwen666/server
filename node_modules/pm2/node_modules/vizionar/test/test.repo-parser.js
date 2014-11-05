var assert = require("assert");
var repo_parser = require("./../parser.js");

/*
	To enable a sample test suite, remove the _disabled
	and fill in the strings.  One way to fetch these values is to
	create the sample directory, enter it as the directory,
	and then run this test suite (npm test).
	The test will return the expected value (a blank string),
	and the actual value, which can be then used as the string to
	test.
*/
var sample = {
	git: {
		directory: "test/fixtures/test_git/",
		url: "http://test.test/",
		revision: "532cd24cd714be3187677e49f2375a47901185f6",
		comment: "Initial commit.  Adding README.",
		branch: "master",
		update_time: "Mon Sep 15 2014 11:30:58 GMT-0400 (EDT)"
	},
	svn: {
		directory: "test/fixtures/test_svn/",
		url: "file:///Users/lenny/Downloads/repo-parser/test_svn_repo/svn",
		revision: "r1",
		comment: "Initial import of parent repository",
		branch: "trunk",
		update_time: "Mon Sep 15 2014 11:52:52 GMT-0400 (EDT)"
	},
	hg: {
		directory: "test/fixtures/test_hg/",
		url: "http://test.test/",
		revision: "0:239be58f1b71",
		comment: "First commit.  Adding README.",
		branch: "default",
		update_time: "Tue Sep 16 2014 13:22:22 GMT-0400 (EDT)"
	}
};

suite("repo_parser", function() {
	if(sample.git && sample.git.directory.length > 1) {
		test("Pulling from Git", function(done) {
			repo_parser({folder: sample.git.directory}, function(err, metadata) {
				assert.equal(err, null);
				assert.equal(metadata.url, sample.git.url);
				assert.equal(metadata.revision, sample.git.revision);
				assert.equal(metadata.comment, sample.git.comment);
				assert.equal(metadata.branch, sample.git.branch);
				//assert.equal(metadata.update_time, sample.git.update_time);
				done();
			});
		});
	}
	if(sample.svn && sample.svn.directory.length > 1) {
		test("Pulling from Subversion", function(done) {
			repo_parser({folder: sample.svn.directory}, function(err, metadata) {
				assert.equal(err, null);
				assert.equal(metadata.url, sample.svn.url);
				assert.equal(metadata.revision, sample.svn.revision);
				assert.equal(metadata.comment, sample.svn.comment);
				assert.equal(metadata.branch, sample.svn.branch+"\n");
				//assert.equal(""+metadata.update_time, sample.svn.update_time);
				done();
			});
		});
	}
	if(sample.hg && sample.hg.directory.length > 1) {
		test("Pulling from Mercurial", function(done) {
			repo_parser({folder: sample.hg.directory}, function(err, metadata) {
				assert.equal(err, null);
				assert.equal(metadata.url, sample.hg.url);
				assert.equal(metadata.revision, sample.hg.revision);
				assert.equal(metadata.comment, sample.hg.comment);
				assert.equal(metadata.branch, sample.hg.branch);
				//assert.equal(""+metadata.update_time, sample.hg.update_time);
				done();
			});
		});
	}
});
