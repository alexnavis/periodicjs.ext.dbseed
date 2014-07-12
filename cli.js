'use strict';

var path = require('path'),
	async = require('async'),
	fs = require('fs-extra'),
	merge = require('utils-merge'),
	appController = require('../../../../app/controller/application'),
	seedController,
	// Collection,
	mongoose,
	logger,
	appSettings,
	applicationController;

var extscript = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	seedController = require('./controller/dbseed')(resources);
	// Post = mongoose.model('Post');
	// Collection = mongoose.model('Collection');
	// node index.js --cli --extension seed --task sampledata
	var cli = function(argv){
		if(argv.task==='sampledata'){
			var datafile = path.resolve(__dirname,'./sampledata/sampledata.json');
			
			fs.readJson(datafile,function(err,seedjson){
			  if(err){
			    logger.error(err.stack);
			    logger.error(err);
					process.exit(0);
			  }
			  else{
			    console.time('Seeding Data Started');
			    seedController.seedDocuments(seedjson.data,function(err,seeds){
			    	console.timeEnd('Seeding Data Started');
			      if(err){
			        logger.error("err",err);
			      }
			      else{       	
			        logger.info("seeds",seeds);
			      }
						process.exit(0);
			    });
			  }
			});
		}
		else{	
			logger.silly("sample extension",argv);
			process.exit(0);
		}
	};

	return{
		cli:cli
	}
};

module.exports = extscript;