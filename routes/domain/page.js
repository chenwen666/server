/**
 * 分页
 * @param opts
 * @constructor
 */

var SystemConfig = require('../../config/SystemConfig');
var DEFAULT_PAGENO = SystemConfig.DEFAULT_PAGENO;
var DEFAULT_PAGEENTRIES = SystemConfig.DEFAULT_PAGEENTRIES;

var Page = function(opts) {
    if(!!opts) {
        this.pageNo = opts.pageNo;    //当前页
        this.pageEntries = opts.pageEntries;              //一页显示记录数
	    if(opts.autoCount != null && opts.autoCount != undefined && opts.autoCount != '') {  //不为空且为true
		    this.autoCount = opts.autoCount;
	    }
	    this.fields = opts.fields;  //字段列表
    }
	if(!this.pageNo || this.pageNo < 1) {
		this.pageNo = DEFAULT_PAGENO;
	}
	if(!this.pageEntries || this.pageEntries < 1) {
		this.pageEntries = DEFAULT_PAGEENTRIES;
	}
	this.content = new Array();   //内容
	this.totalElements = 0;         //记录总数
	this.totalPages = 0;         //总页数
}

/**
 * Expose 'Entity' constructor
 */

module.exports = Page;

/**
 * 设置字段
 * @param opts
 */
Page.prototype.setField = function(fields) {
	this.fields = fields;
};

/**
 * 获取一页显示的记录数
 * @returns {*}
 */
Page.prototype.getPageEntries = function() {
    if(!this.pageEntries || this.pageEntries < 1) {
        return DEFAULT_PAGEENTRIES;
    }
    return this.pageEntries;
};

/**
 * 获取当前页码
 * @returns {*}
 */
Page.prototype.getPageNo = function() {
    if(!this.pageNo || this.pageNo  < 1) {
        this.pageNo  = DEFAULT_PAGENO;
    }
    var totalPages = this.totalPages;
    if(totalPages && this.pageNo  > totalPages) {
	    this.pageNo = totalPages;
    }
    return this.pageNo;
};

/**
 * 获取记录总数
 * @param totalElements
 */
Page.prototype.getTotalElements= function() {
    return this.totalElements;
}

/**
 * 设置记录总数
 * @param totalElements
 */
Page.prototype.setTotalElements= function(totalElements) {
    this.totalElements = totalElements;
	this.setTotalPages();
}

/**
 * 设置记录
 * @param content
 */
Page.prototype.setContent = function(content) {
    this.content = content;
}

/**
 * 设置总页数
 */
Page.prototype.setTotalPages= function() {
    var totalPages = 0;
    if(this.pageEntries) {
	    totalPages = this.pageEntries;
        if(totalPages < 0) {
	        totalPages = 0;
        } else if(totalPages > 0) {
	        totalPages = Math.ceil(this.totalElements/this.pageEntries);
        }
    }
    this.totalPages = totalPages;
}
