'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	util = require('util'),
	async = require('async'),
	seedController,
	// Collection,
	mongoose,
	logger,
	datafile,
	appSettings,
	extJson,
errorie = require('errorie'),
	d = new Date(),
	defaultExportFileName = 'dbemptybackup' + '-' + d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate() + '-' + d.getTime() + '.json';

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
var extscript = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	try {
		extJson = fs.readJsonSync(path.join(__dirname, '/package.json'));
		// console.log('resources',resources);
		resources.app.locals = {dbseedExtJson : extJson};
	}
	catch (e) {
		throw new errorie({
			name: 'DBSeed',
			message: 'Config error - ' + e.message
		});
	}
	seedController = require('./controller/dbseed')(resources);
	// node index.js --cli --extension dbseed --task sampledata
	var cli = function (argv) {
		if (argv.task === 'sampledata') {
			datafile = path.resolve(__dirname, './config/sampledata/sampledata.json');

			fs.readJson(datafile, function (err, seedjson) {
				if (err) {
					logger.error(err.stack.toString());
					logger.error(err.toString());
					process.exit(0);
				}
				else {
					console.time('Seeding Data Started');
					seedController.importSeed({
						jsondata: seedjson,
						insertsetting: 'upsert'
					}, function (err, seeds) {
						console.timeEnd('Seeding Data Started');
						if (err) {
							logger.error(err.toString());
						}
						else {
							logger.info('seeds', seeds);
						}
						process.exit(0);
					});
				}
			});
		}
		else if (argv.task === 'import' || argv.task === 'seed') {
			datafile = path.resolve(argv.file);

			fs.readJson(datafile, function (err, seedjson) {
				if (err) {
					logger.error(err.stack.toString());
					logger.error(err.toString());
					process.exit(0);
				}
				else {
					console.time('Importing Seed Data');
					seedController.importSeed({
						jsondata: seedjson,
						insertsetting: 'upsert'
					}, function (err, status) {
						console.timeEnd('Importing Seed Data');
						if (err) {
							console.log(err);
							logger.error(err.toString());
						}
						else {
							console.info('Import status', util.inspect(status));
						}
						process.exit(0);
					});
				}
			});
		}
		else if (argv.task === 'export' || argv.task === 'download') {
			console.time('Exporting Seed Data');
			seedController.exportSeed({
				filepath: argv.file,
				limits: argv
			}, function (err, status) {
				console.timeEnd('Exporting Seed Data');
				if (err) {
					console.log(err);
					logger.error(err.toString());
				}
				else {
					console.info('Export status', util.inspect(status));
				}
				process.exit(0);
			});
		}
		else if (argv.task === 'empty' && argv.confirm) {
			async.series([
					function (cb) {
						console.time('Exporting Seed Data');
						seedController.exportSeed({
							filepath: 'content/files/dbseeds/' + defaultExportFileName,
							limits: argv
						}, function (err, status) {
							console.timeEnd('Exporting Seed Data');
							cb(err, status);
						});
					},
					function (cb) {
						console.time('Empty Database Data');
						seedController.emptyDB({
							filepath: argv.file,
							limits: argv
						}, function (err, status) {
							console.timeEnd('Empty Database Data');
							cb(err, status);
						});
					}
				],
				function (err, status) {
					if (err) {
						console.log(err);
						logger.error(err.toString());
					}
					else {
						console.info('Export status', util.inspect(status));
					}
					process.exit(0);
				});
		}
		else {
			logger.silly('invalid dbseed task', argv);
			process.exit(0);
		}
	};

	return {
		cli: cli
	};
};

module.exports = extscript;
