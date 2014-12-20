'use strict';
var path = require('path');
/**
 * An extension to import json seeds into periodic mongodb.
 * @{@link https://github.com/typesettin/periodicjs.ext.dbseed}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @exports periodicjs.ext.dbseed
 * @param  {object} periodic variable injection of resources from current periodic instance
 */
module.exports = function (periodic) {
	// express,app,logger,config,db,mongoose
	periodic.app.controller.extension.dbseed = {
		seed: require('./controller/dbseed')(periodic)
	};

	var seedRouter = periodic.express.Router(),
		seedController = periodic.app.controller.extension.dbseed.seed,
		assetController = periodic.app.controller.native.asset;

	for (var x in periodic.settings.extconf.extensions) {
		if (periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.admin') {
			seedRouter.post('/uploadseed', seedController.import_upload);
			seedRouter.post('/downloadseed', seedController.export_download);
			seedRouter.post('/customseed', seedController.import_customseed);
			seedRouter.get('/', seedController.index);
		}
	}
	periodic.app.post('/localasset/new', assetController.upload, assetController.createassetfile);
	periodic.app.use('/p-admin/dbseed', seedRouter);
	return periodic;
};
