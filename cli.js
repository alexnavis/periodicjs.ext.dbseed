'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	seedController,
	// Collection,
	mongoose,
	logger,
	appSettings;

/**
 * cli dbseed controller
 * @module cliDBSeedController
 * @{@link https://github.com/typesettin/periodicjs.ext.dbseed}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:path
 * @requires module:fs-extra
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           dbseed cli
 */
var extscript = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	seedController = require('./controller/dbseed')(resources);
	// Post = mongoose.model('Post');
	// Collection = mongoose.model('Collection');
	// node index.js --cli --extension seed --task sampledata
	var cli = function(argv){
		if(argv.task==='sampledata'){
			var datafile = path.resolve(__dirname,'./sampledata/sampledata.json');
			
			fs.readJson(datafile,function(err,seedjson){
			  if(err){
			    logger.error(err.stack.toString());
			    logger.error(err.toString());
					process.exit(0);
			  }
			  else{
			    console.time('Seeding Data Started');
			    seedController.seedDocuments(seedjson.data,function(err,seeds){
			    	console.timeEnd('Seeding Data Started');
			      if(err){
			    	logger.error(err.toString());
			      }
			      else{       	
			        logger.info('seeds',seeds);
			      }
						process.exit(0);
			    });
			  }
			});
		}
		else{	
			logger.silly('sample extension',argv);
			process.exit(0);
		}
	};

	return{
		cli:cli
	};
};

module.exports = extscript;