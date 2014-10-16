'use strict';

var async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger;

/**
 * User - Mongoose Model 'User'
 * UserObj - Seed Object for a 'User'
 * Users - Array Of User Object Seeds Documents from Seed File
 * Users_namehash - hash of {name:id} to look up Users by name and insert the object id into the document for population
 * Users_namehash_array - Array of username (or document names), to query mongoose to associate objectIds with later
 */
var UsersObj,
	User, // = mongoose.model('User')
	Users = [],
	Users_namehash = {},
	Users_namehash_array = [],
	ItemsObj,
	Item, // = mongoose.model('Item')
	Items = [],
	Items_namehash = {},
	Items_namehash_array = [],
	AssetsObj,
	Asset, //  = mongoose.model('Asset')
	Assets = [],
	Assets_namehash_array = [],
	Assets_namehash = {},
	ContenttypesObj,
	Contenttype, // = mongoose.model('Contenttype')
	Contenttypes = [],
	Contenttypes_namehash_array = [],
	Contenttypes_namehash = {},
	CategoriesObj,
	Category, // = mongoose.model('Category')
	Categories = [],
	Categories_namehash_array = [],
	Categories_namehash = {},
	TagsObj,
	Tag, // = mongoose.model('Tag')
	Tags = [],
	Tags_namehash_array = [],
	Tags_namehash = {},
	CollectionsObj,
	Collection, // = mongoose.model('Collection')
	Collections = [],
	Collections_namehash_array = [],
	Collections_namehash = {},
	UserprivilegesObj,
	Userprivilege, // = mongoose.model('Userprivilege')
	Userprivileges = [],
	Userprivileges_userprivilegeid_array = [],
	Userprivileges_namehash = {},
	UserrolesObj,
	Userrole, // = mongoose.model('Userrole')
	Userroles = [],
	Userroles_userroleid_array = [],
	Userroles_namehash = {},
	UsergroupsObj,
	Usergroup, // = mongoose.model('Usergroup')
	Usergroups = [],
	Usergroups_usergroupid_array = [],
	Usergroups_namehash = {},
	seedObjectArraysDocumentErrors = [],
	insertContentIntoDatabaseErrors = [],
	insertUACIntoDatabaseErrors = [],
	insertsetting,
	seedDocumentErrors,
	validDocuments,
	invalidDocuments;

/**
 * create seed {Userprivilege|Userrole|Usergroup} Object
 * @param  {object} options seeddocument
 * @return {object}         {doc-{Userprivilege|Userrole|Usergroup},docs_namehash - {Userprivilege|Userrole|Usergroup}.name,err}
 */
var seedUserGroupRolePrivilegeData = function (options) {
	var seeddocument = options.seeddocument,
		seeddocumenttype = options.seeddocumenttype,
		seed_uacid = null,
		errorObj = null;

	try {
		if (!seeddocument.title) {
			errorObj = new Error('User ' + seeddocumenttype + ' ' + seeddocument.title + ' is missing title');
		}
		else {
			switch (seeddocumenttype) {
			case 'group':
				if (!seeddocument.usergroupid) {
					errorObj = new Error('User ' + seeddocumenttype + ' ' + seeddocument.title + ' is usergroupid');
				}
				else {
					seed_uacid = seeddocument.usergroupid;
				}
				break;
			case 'role':
				if (!seeddocument.userroleid) {
					errorObj = new Error('User ' + seeddocumenttype + ' ' + seeddocument.title + ' is userroleid');
				}
				else {
					seed_uacid = seeddocument.userroleid;
				}
				break;
			case 'privilege':
				if (!seeddocument.userprivilegeid) {
					errorObj = new Error('User ' + seeddocumenttype + ' ' + seeddocument.title + ' is userprivilegeid');
				}
				else {
					seed_uacid = seeddocument.userprivilegeid;
				}
				break;
			default:
				errorObj = new Error('User ' + seeddocumenttype + ' ' + seeddocument.title + ' is missing uacid');
				break;
			}
		}
		if (!seeddocument.name) {
			seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
		}
	}
	catch (e) {
		errorObj = e;
	}

	return {
		doc: seeddocument,
		docs_uacid: seed_uacid,
		err: errorObj
	};
};
/**
 * create seed Item Object
 * @param  {object} options seeddocument
 * @return {object}         {doc-Item,docs_namehash - Item.name,err}
 */
var seedItemData = function (options) {
	// logger.silly('seedAssetData',options);
	var seeddocument = options.seeddocument,
		seed_namehash = null,
		errorObj = null;

	try {
		if (!seeddocument.title) {
			errorObj = new Error('Item ' + seeddocument.title + ' is missing title');
		}
		// if(!seeddocument.content){
		//   errorObj = new Error('Item '+seeddocument.title+' is missing content');
		// }
		if (!seeddocument.name) {
			seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
		}
	}
	catch (e) {
		errorObj = e;
	}

	return {
		doc: seeddocument,
		docs_namehash: seed_namehash,
		err: errorObj
	};
};

/**
 * create seed Collection Object
 * @param  {object} options seeddocument
 * @return {object}         {doc-Collection,docs_namehash - Collection.name,err}
 */
var seedCollectionData = function (options) {
	// logger.silly('seedAssetData',options);
	var seeddocument = options.seeddocument,
		seed_namehash = null,
		errorObj = null;

	try {
		if (!seeddocument.title) {
			errorObj = new Error('Collection ' + seeddocument.title + ' is missing title');
		}
		// if(!seeddocument.content){
		//   errorObj = new Error('Collection '+seeddocument.title+' is missing content');
		// }
		if (!seeddocument.name) {
			seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
		}
	}
	catch (e) {
		errorObj = e;
	}

	return {
		doc: seeddocument,
		docs_namehash: seed_namehash,
		err: errorObj
	};
};

/**
 * create seed User Object
 * @param  {object} options seeddocument
 * @return {object}         {doc-User,docs_namehash - User.name,err}
 */
var seedUserData = function (options) {
	// logger.silly('seedAssetData',options);
	var seeddocument = options.seeddocument,
		seed_namehash = null,
		errorObj = null,
		User = mongoose.model('User'),
		salt,
		hash,
		bcrypt = require('bcrypt');

	try {
		if (!seeddocument.email) {
			errorObj = new Error('user is missing email');
		}
		else {
			if (seeddocument.password) {
				salt = bcrypt.genSaltSync(10);
				hash = bcrypt.hashSync(seeddocument.password, salt);
				seeddocument.password = hash;
			}
			seeddocument.apikey = User.generateRandomTokenStatic();
			if (seeddocument.username) {
				seed_namehash = seeddocument.username;
			}
		}
	}
	catch (e) {
		errorObj = e;
	}

	return {
		doc: seeddocument,
		docs_namehash: seed_namehash,
		err: errorObj
	};
};

/**
 * create seed Asset Object
 * @param  {object} options seeddocument
 * @return {object}         {doc-Asset,docs_namehash - Asset.name,err}
 */
var seedAssetData = function (options) {
	// logger.silly('seedAssetData',options);
	var seeddocument = options.seeddocument,
		seed_namehash = null,
		errorObj = null;
	try {
		if (seeddocument.locationtype === 'local') {
			if (!seeddocument.attributes) {
				errorObj = new Error('asset ' + seeddocument.name + ' is missing attributes');
			}
			else {
				if (!seeddocument.attributes.periodicFilename) {
					errorObj = new Error('asset ' + seeddocument.name + ' is missing periodicPath');
				}
				if (!seeddocument.attributes.periodicPath) {
					errorObj = new Error('asset ' + seeddocument.name + ' is missing periodicPath');
				}
				if (!seeddocument.attributes.periodicDirectory) {
					errorObj = new Error('asset ' + seeddocument.name + ' is missing periodicDirectory');
				}
			}
		}

		if (!seeddocument.fileurl) {
			errorObj = new Error('asset ' + seeddocument.name + ' is missing fileurl');
		}
		if (!seeddocument.assettype) {
			errorObj = new Error('asset ' + seeddocument.name + ' is missing assettype');
		}
		if (!seeddocument.name) {
			errorObj = new Error('asset ' + seeddocument.name + ' is missing title');
		}
		else {
			seed_namehash = seeddocument.name;
		}
	}
	catch (e) {
		errorObj = e;
	}

	return {
		doc: seeddocument,
		docs_namehash: seed_namehash,
		err: errorObj
	};
};

/**
 * create seed Contenttype Object
 * @param  {object} options seeddocument
 * @return {object}         {doc-Contenttype,docs_namehash - Contenttype.name,err}
 */
var seedContenttypeData = function (options) {
	var seeddocument = options.seeddocument,
		seed_namehash = null,
		errorObj = null;

	try {
		if (!seeddocument.title) {
			errorObj = new Error('contenttype ' + seeddocument.title + ' is missing title');
		}
		if (!seeddocument.name) {
			seeddocument.name = CoreUtilities.makeNiceAttribute(seeddocument.title);
		}
	}
	catch (e) {
		errorObj = e;
	}

	return {
		doc: seeddocument,
		docs_namehash: seed_namehash,
		err: errorObj
	};
};

/**
 * create seed Category Object
 * @param  {object} options seeddocument
 * @return {object}         {doc-category,docs_namehash - category.name,err}
 */
var seedCategoryData = function (options) {
	var seeddocument = options.seeddocument,
		seed_namehash = null,
		errorObj = null;

	try {
		if (!seeddocument.title) {
			errorObj = new Error('Category ' + seeddocument.title + ' is missing title');
		}
		if (!seeddocument.name) {
			seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
		}
	}
	catch (e) {
		errorObj = e;
	}

	return {
		doc: seeddocument,
		docs_namehash: seed_namehash,
		err: errorObj
	};
};

/**
 * create seed Tag Object
 * @param  {object} options seeddocument
 * @return {object}         {doc-tag,docs_namehash - tag.name,err}
 */
var seedTagData = function (options) {
	var seeddocument = options.seeddocument,
		seed_namehash = null,
		errorObj = null;

	try {
		if (!seeddocument.title) {
			errorObj = new Error('Tag ' + seeddocument.title + ' is missing title');
		}
		if (!seeddocument.name) {
			seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
		}
	}
	catch (e) {
		errorObj = e;
	}

	return {
		doc: seeddocument,
		docs_namehash: seed_namehash,
		err: errorObj
	};
};

var seedDocuments = function (documents, callback) {
	console.log(documents, callback);
	// http://stackoverflow.com/questions/15400029/mongoose-create-multiple-documents
};

/**
 * returns object that has error information
 * @param  {object} options - index,document,errormsg
 * @return {object} error object{docuemntindex,seed,error};
 */
var returnSeedDocumentObjectError = function (options) {
	var index = options.index,
		documentobj = options.seed,
		error = options.error;
	return {
		documentindex: index,
		seed_datatype: documentobj.datatype,
		seed_datadocument: documentobj.datadocument,
		error: error
	};
};

/**
 * set seed data object for looking up and inserting usergroups
 * @param {type} options index,seedobject
 */
var setSeedDataUsergroup = function (options) {
	var index = options.index,
		seedObject = options.seedobject;
	UsergroupsObj = seedUserGroupRolePrivilegeData({
		seeddocument: seedObject.datadocument,
		seeddocumenttype: 'group'
	});
	if (UsergroupsObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: UsergroupsObj.err
		}));
	}
	else {
		Usergroups.push(UsergroupsObj.doc);
		Usergroups_usergroupid_array.push(UsergroupsObj.docs_uacid);
		if (UsergroupsObj.doc.roles && UsergroupsObj.doc.roles.length > 0) {
			for (var z in UsergroupsObj.doc.roles) {
				Userroles_userroleid_array.push(UsergroupsObj.doc.roles[z]);
			}
		}
	}
};

/**
 * set seed data object for looking up and inserting userroless
 * @param {type} options index,seedobject
 */
var setSeedDataUserole = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	UserrolesObj = seedUserGroupRolePrivilegeData({
		seeddocument: seedObject.datadocument,
		seeddocumenttype: 'role'
	});
	if (UserrolesObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: UserrolesObj.err
		}));
	}
	else {
		Userroles.push(UserrolesObj.doc);
		Userroles_userroleid_array.push(UserrolesObj.docs_uacid);
		if (UserrolesObj.doc.privileges && UserrolesObj.doc.privileges.length > 0) {
			for (var za in UserrolesObj.doc.privileges) {
				Userprivileges_userprivilegeid_array.push(UserrolesObj.doc.privileges[za]);
			}
		}
	}
};

/**
 * set seed data object for looking up and inserting userprivileges
 * @param {type} options index,seedobject
 */
var setSeedDataUserprivilege = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	UserprivilegesObj = seedUserGroupRolePrivilegeData({
		seeddocument: seedObject.datadocument,
		seeddocumenttype: 'privilege'
	});
	if (UserprivilegesObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: UserprivilegesObj.err
		}));
	}
	else {
		Userprivileges.push(UserprivilegesObj.doc);
		Userprivileges_userprivilegeid_array.push(UserprivilegesObj.docs_uacid);
	}
};

/**
 * set seed data object for looking up and inserting assets
 * @param {type} options index,seedobject
 */
var setSeedDataAsset = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	AssetsObj = seedAssetData({
		seeddocument: seedObject.datadocument
	});
	if (AssetsObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: AssetsObj.err
		}));
	}
	else {
		Assets.push(AssetsObj.doc);
		Assets_namehash_array.push(AssetsObj.docs_namehash);
	}
};

/**
 * set seed data object for looking up and inserting users
 * @param {type} options index,seedobject
 */
var setSeedDataUser = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	UsersObj = seedUserData({
		seeddocument: seedObject.datadocument
	});
	if (UsersObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: UsersObj.err
		}));
	}
	else {
		Users.push(UsersObj.doc);
		Users_namehash_array.push(UsersObj.docs_namehash);
		if (UsersObj.doc.userroles && UsersObj.doc.userroles.length > 0) {
			for (var q in UsersObj.doc.userroles) {
				Userroles_userroleid_array.push(UsersObj.doc.userroles[q]);
			}
		}
	}
};

/**
 * set seed data object for looking up and inserting contentypes
 * @param {type} options index,seedobject
 */
var setSeedDataContentype = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	ContenttypesObj = seedContenttypeData({
		seeddocument: seedObject.datadocument
	});
	if (ContenttypesObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: ContenttypesObj.err
		}));
	}
	else {
		Contenttypes.push(ContenttypesObj.doc);
		Contenttypes_namehash_array.push(ContenttypesObj.docs_namehash);
		if (ContenttypesObj.doc.author) {
			Users_namehash_array.push(ContenttypesObj.doc.author);
		}
	}
};

/**
 * set seed data object for looking up and inserting categories
 * @param {type} options index,seedobject
 */
var setSeedDataCategory = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	CategoriesObj = seedCategoryData({
		seeddocument: seedObject.datadocument
	});
	if (CategoriesObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: CategoriesObj.err
		}));
	}
	else {
		Categories.push(CategoriesObj.doc);
		Categories_namehash_array.push(CategoriesObj.docs_namehash);
		if (CategoriesObj.doc.author) {
			Users_namehash_array.push(CategoriesObj.doc.author);
		}
	}
};

/**
 * set seed data object for looking up and inserting tags
 * @param {type} options index,seedobject
 */
var setSeedDataTag = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	TagsObj = seedTagData({
		seeddocument: seedObject.datadocument
	});
	if (TagsObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: TagsObj.err
		}));
	}
	else {
		Tags.push(TagsObj.doc);
		Tags_namehash_array.push(TagsObj.docs_namehash);
		if (TagsObj.doc.author) {
			Users_namehash_array.push(TagsObj.doc.author);
		}
	}
};

/**
 * set seed data object for looking up and inserting items
 * @param {type} options index,seedobject
 */
var setSeedDataItem = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	ItemsObj = seedItemData({
		seeddocument: seedObject.datadocument
	});
	if (ItemsObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: ItemsObj.err
		}));
	}
	else {
		Items.push(ItemsObj.doc);
		Items_namehash_array.push(ItemsObj.docs_namehash);
	}
};

/**
 * set seed data object for looking up and inserting collections
 * @param {type} options index,seedobject
 */
var setSeedDataCollection = function (options) {
	var index = options.index,
		seedObject = options.seedobject;

	ItemsObj = seedItemData({
		seeddocument: seedObject.datadocument
	});
	if (ItemsObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: ItemsObj.err
		}));
	}
	else {
		Items.push(ItemsObj.doc);
		Items_namehash_array.push(ItemsObj.docs_namehash);
	}


	CollectionsObj = seedCollectionData({
		seeddocument: seedObject.datadocument
	});
	if (CollectionsObj.err) {
		seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
			index: index,
			seed: seedObject,
			error: CollectionsObj.err
		}));
	}
	else {
		Collections.push(CollectionsObj.doc);
		Collections_namehash_array.push(CollectionsObj.docs_namehash);
	}
};

/**
 * iterates through seed documents and set up arrays for inserting into database and creates name hashes to look up the values later
 * @param  {object} options - documents,jsondata
 * @param  {object} callback
 * @return {Function} async callback (err,results);
 */
var setSeedObjectArrays = function (options, callback) {
	var documents = options.documents;

	for (var x in documents) {
		if (!documents[x].datatype) {
			seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
				index: x,
				seed: documents[x],
				error: new Error('new document is missing datatype')
			}));
		}
		else if (!documents[x].datadocument) {
			seedObjectArraysDocumentErrors.push(returnSeedDocumentObjectError({
				index: x,
				seed: documents[x],
				error: new Error('new document is missing data')
			}));
		}
		else {
			switch (documents[x].datatype) {
			case 'usergroup':
				setSeedDataUsergroup({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'userrole':
				setSeedDataUserole({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'userprivilege':
				setSeedDataUserprivilege({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'asset':
				setSeedDataAsset({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'user':
				setSeedDataUser({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'contenttype':
				setSeedDataContentype({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'category':
				setSeedDataCategory({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'tag':
				setSeedDataTag({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'item':
				setSeedDataItem({
					index: x,
					seedobject: documents[x]
				});
				break;
			case 'collection':
				setSeedDataCollection({
					index: x,
					seedobject: documents[x]
				});
				break;
			default:
				seedObjectArraysDocumentErrors.push(
					returnSeedDocumentObjectError({
						index: x,
						seed: documents[x],
						error: new Error('Invalid seed datatype')
					})
				);
				break;
			}
		}
	}
	seedDocumentErrors = seedObjectArraysDocumentErrors;
	validDocuments = (documents.length - seedObjectArraysDocumentErrors.length);
	invalidDocuments = (seedObjectArraysDocumentErrors.length);
	callback(null, 'processed seed file');
};

/**
 * insert collections into database, update Collections_namehash array, also update author in collection
 * @param  {Function} getCollectionIdsFromCollectionArrayAsyncCallBack
 * @return {Function} async callback getCollectionIdsFromCollectionArrayAsyncCallBack(err,results);
 */
var getCollectionIdsFromCollectionArray = function (getCollectionIdsFromCollectionArrayAsyncCallBack) {
	var CollectionItems = [];
	for (var y in Collections) {
		if (Collections[y].items) {
			CollectionItems = Collections[y].items;
			Collections[y].items = [];
			for (var z in CollectionItems) {
				if (Items_namehash[CollectionItems[z].item]) {
					CollectionItems[z].item = Items_namehash[CollectionItems[z].item];
					Collections[y].items.push(CollectionItems[z]);
				}
			}
		}
	}
	async.waterfall([
		function (callback) {
			Collection.create(Collections, function (err) {
				if (err) {
					// callback(err, null);
					insertContentIntoDatabaseErrors.push({
						createCollectionsError: err.toString()
					});
				}
				if (!arguments['0']) {
					delete arguments['0'];
				}
				for (var x in arguments) {
					// logger.silly('arguments[x]',x,arguments[x]);
					if(arguments[x]._id){
						Collections_namehash[arguments[x].name] = arguments[x]._id;
					}
				}
				callback(null, 'updated Collections_namehash');
			});
		},
		function (NewCollections, callback) {
			Collection.find({
					'name': {
						$in: Collections_namehash_array
					}
				},
				'_id name',
				function (err, collectiondata) {
					if (err) {
						// callback(err, null, null);
						insertContentIntoDatabaseErrors.push({
							searchforCollectionsError: err.toString()
						});
					}
					else {
						for (var x in collectiondata) {
							Collections_namehash[collectiondata[x].name] = collectiondata[x]._id;
						}
						callback(null, {
							newcollections: NewCollections,
							queriedcollections: collectiondata
						});
					}
				});
		}
	], function (err/*, results*/) {
			getCollectionIdsFromCollectionArrayAsyncCallBack(err, Collections_namehash);
	});
};

/**
 * insert items into database, update Items_namehash array, also update author in item
 * @param  {Function} getItemIdsFromItemArrayAsyncCallBack
 * @return {Function} async callback getItemIdsFromItemArrayAsyncCallBack(err,results);
 */
var getItemIdsFromItemArray = function (getItemIdsFromItemArrayAsyncCallBack) {
	async.waterfall([
		function (callback) {
			Item.create(Items, function (err) {
				if (err) {
					// callback(err, null);
					insertContentIntoDatabaseErrors.push({
						createItemsError: err.toString()
					});
				}

				if (!arguments['0']) {
					delete arguments['0'];
				}
				for (var x in arguments) {
					// logger.silly('arguments[x]',x,arguments[x]);
					if(arguments[x]._id){
						Items_namehash[arguments[x].name] = arguments[x]._id;
					}
				}
				callback(null, 'updated Items_namehash');
			});
		},
		function (NewItems, callback) {
			Item.find({
					'name': {
						$in: Items_namehash_array
					}
				},
				'_id name',
				function (err, itemdata) {
					if (err) {
						// callback(err, null, null);
						insertContentIntoDatabaseErrors.push({
							searchforItemsError: err.toString()
						});
					}
					else {
						for (var x in itemdata) {
							Items_namehash[itemdata[x].name] = itemdata[x]._id;
						}
						callback(null, {
							newcategories: NewItems,
							querieditems: itemdata
						});
					}
				});
		}
	], function (err/*, results*/) {
		getItemIdsFromItemArrayAsyncCallBack(err, Items_namehash);
	});
};

/**
 * insert tags into database, update Tags_namehash array, also update author in tag
 * @param  {Function} getTagIdsFromTagArrayAsyncCallBack
 * @return {Function} async callback getTagIdsFromTagArrayAsyncCallBack(err,results);
 */
var getTagIdsFromTagArray = function (getTagIdsFromTagArrayAsyncCallBack) {
	async.waterfall([
		function (callback) {
			for (var y in Tags) {
				if (Tags[y].author) {
					if (Users_namehash[Tags[y].author]) {
						Tags[y].author = Users_namehash[Tags[y].author];
					}
					else {
						delete Tags[y].author;
					}
				}
			}
			Tag.create(Tags, function (err) {
				if (err) {
					// callback(err, null);
					insertContentIntoDatabaseErrors.push({
						createTagsError: err.toString()
					});
				}

				if (!arguments['0']) {
					delete arguments['0'];
				}
				for (var x in arguments) {
					// logger.silly('arguments[x]',x,arguments[x]);
					if(arguments[x]._id){
						Tags_namehash[arguments[x].name] = arguments[x]._id;
					}
				}
				callback(null, 'updated Tags_namehash');
			});
		},
		function (NewTags, callback) {
			Tag.find({
					'name': {
						$in: Tags_namehash_array
					}
				},
				'_id name',
				function (err, tagdata) {
					if (err) {
						// callback(err, null, null);
						insertContentIntoDatabaseErrors.push({
							searchforTagsError: err.toString()
						});
					}
					else {
						for (var x in tagdata) {
							Tags_namehash[tagdata[x].name] = tagdata[x]._id;
						}
						callback(null, {
							newcategories: NewTags,
							queriedtags: tagdata
						});
					}
				});
		}
	], function (err/*, results*/) {
		getTagIdsFromTagArrayAsyncCallBack(err, Tags_namehash);
	});
};

/**
 * insert categories into database, update Categories_namehash array, also update author in category
 * @param  {Function} getCategoryIdsFromCategoryArrayAsyncCallBack
 * @return {Function} async callback getCategoryIdsFromCategoryArrayAsyncCallBack(err,results);
 */
var getCategoryIdsFromCategoryArray = function (getCategoryIdsFromCategoryArrayAsyncCallBack) {
	async.waterfall([
		function (callback) {
			for (var y in Categories) {
				if (Categories[y].author) {
					if (Users_namehash[Categories[y].author]) {
						Categories[y].author = Users_namehash[Categories[y].author];
					}
					else {
						insertContentIntoDatabaseErrors.push({
							invalidCategoryAuthor: Contenttypes[y].author
						});
						delete Categories[y].author;
					}
				}
			}
			Category.create(Categories, function (err) {
				if (err) {
					// callback(err, null);
					insertContentIntoDatabaseErrors.push({
						createCategoryError: err.toString()
					});
				}
				if (!arguments['0']) {
					delete arguments['0'];
				}
				for (var x in arguments) {
					// logger.silly('arguments[x]',x,arguments[x]);
					if(arguments[x]._id){
						Categories_namehash[arguments[x].name] = arguments[x]._id;
					}
				}
				callback(null, 'updated Categories_namehash');
			});
		},
		function (NewCategories, callback) {
			Category.find({
					'name': {
						$in: Categories_namehash_array
					}
				},
				'_id name',
				function (err, categorydata) {
					if (err) {
						// callback(err, null, null);
						insertContentIntoDatabaseErrors.push({
							searchforCategoriesError: err.toString()
						});
					}
					else {
						for (var x in categorydata) {
							Categories_namehash[categorydata[x].name] = categorydata[x]._id;
						}
						callback(null, {
							newcategories: NewCategories,
							queriedcategories: categorydata
						});
					}
				});
		}
	], function (err/*, results*/) {
		getCategoryIdsFromCategoryArrayAsyncCallBack(err,Categories_namehash);
	});
};

/**
 * insert contentypes into database, update Contenttypes_namehash array, also update author in contenttype
 * @param  {Function} getContenttypeIdsFromContenttypeArrayAsyncCallBack
 * @return {Function} async callback getContenttypeIdsFromContenttypeArrayAsyncCallBack(err,results);
 */
var getContenttypeIdsFromContenttypeArray = function (getContenttypeIdsFromContenttypeArrayAsyncCallBack) {
	async.waterfall([
		function (callback) {
			for (var y in Contenttypes) {
				if (Contenttypes[y].author) {
					if (Users_namehash[Contenttypes[y].author]) {
						Contenttypes[y].author = Users_namehash[Contenttypes[y].author];
					}
					else {
						insertContentIntoDatabaseErrors.push({
							invalidContenttypeAuthor: Contenttypes[y].author
						});
						delete Contenttypes[y].author;
					}
				}
			}
			Contenttype.create(Contenttypes, function (err) {
				if (err) {
					// callback(err, null);
					insertContentIntoDatabaseErrors.push({
						createContentypesError: err.toString()
					});
				}
				if (!arguments['0']) {
					delete arguments['0'];
				}
				for (var x in arguments) {
					// //logger.silly('arguments[x]',x,arguments[x]);
					if(arguments[x]._id){
						Contenttypes_namehash[arguments[x].name] = arguments[x]._id;						
					}
				}
				callback(null, 'updated Contenttypes_namehash');
			});
		},
		function (NewContenttypes, callback) {
			Contenttype.find({
					'name': {
						$in: Contenttypes_namehash_array
					}
				},
				'_id name',
				function (err, contenttypedata) {
					if (err) {
						// callback(err, null, null);
						insertContentIntoDatabaseErrors.push({
							searchforContentypesError: err.toString()
						});
					}
					for (var x in contenttypedata) {
						Contenttypes_namehash[contenttypedata[x].name] = contenttypedata[x]._id;
					}
					callback(null, {
						newcontenttypes: NewContenttypes,
						queriedcontenttypes: contenttypedata
					});
				});
		}
	], function (err /*, results*/) {
		getContenttypeIdsFromContenttypeArrayAsyncCallBack(err, Contenttypes_namehash);
	});
};

/**
 * insert tags,categories,contentypes into database, update hash arrays
 * @param  {Function} getTaxonomyIdsFromTaxonomiesArraysAsyncCallBack
 * @return {Function} async callback getTaxonomyIdsFromTaxonomiesArraysAsyncCallBack(err,results);
 */
var getTaxonomyIdsFromTaxonomiesArrays = function (getTaxonomyIdsFromTaxonomiesArraysAsyncCallBack) {
	async.parallel({
		contenttypes: getContenttypeIdsFromContenttypeArray,
		categories: getCategoryIdsFromCategoryArray,
		tags: getTagIdsFromTagArray
	},
	function (err , createdtagscatstype ) {
		if (err) {
			insertContentIntoDatabaseErrors.push({
				createTaxonomiesError: err.toString()
			});
		}
		// console.log('getTaxonomyIdsFromTaxonomiesArrays results', results);
		async.parallel({
			Items: function (callback) {
				try {
					var ItemTags = [],
						ItemContenttypes = [],
						ItemCategories = [],
						ItemAssets = [],
						ItemAuthors = [];
					for (var y in Items) {
						if (Items[y].tags) {
							ItemTags = Items[y].tags;
							Items[y].tags = [];
							for (var z in ItemTags) {
								if (Tags_namehash[ItemTags[z]]) {
									Items[y].tags.push(Tags_namehash[ItemTags[z]]);
								}
							}
						}
						if (Items[y].categories) {
							ItemCategories = Items[y].categories;
							Items[y].categories = [];
							for (var zc in ItemCategories) {
								if (Categories_namehash[ItemCategories[zc]]) {
									Items[y].categories.push(Categories_namehash[ItemCategories[zc]]);
								}
							}
						}
						if (Items[y].contenttypes) {
							ItemContenttypes = Items[y].contenttypes;
							Items[y].contenttypes = [];
							for (var zct in ItemContenttypes) {
								if (Contenttypes_namehash[ItemContenttypes[zct]]) {
									Items[y].contenttypes.push(Contenttypes_namehash[ItemContenttypes[zct]]);
								}
							}
						}
						if (Items[y].assets) {
							ItemAssets = Items[y].assets;
							Items[y].assets = [];
							for (var za in ItemAssets) {
								if (Assets_namehash[ItemAssets[za]]) {
									Items[y].assets.push(Assets_namehash[ItemAssets[za]]);
								}
							}
						}
						if (Items[y].primaryasset) {
							if (Assets_namehash[Items[y].primaryasset]) {
								Items[y].primaryasset = Assets_namehash[Items[y].primaryasset];
							}
							else {
								delete Items[y].primaryasset;
							}
						}
						if (Items[y].authors) {
							ItemAuthors = Items[y].authors;
							Items[y].authors = [];
							for (var zu in ItemAuthors) {
								if (Users_namehash[ItemAuthors[zu]]) {
									Items[y].authors.push(Users_namehash[ItemAuthors[zu]]);
								}
							}
						}
						if (Items[y].primaryauthor) {
							if (Users_namehash[Items[y].primaryauthor]) {
								Items[y].primaryauthor = Users_namehash[Items[y].primaryauthor];
							}
							else {
								delete Items[y].primaryauthor;
							}
						}
					}
					callback(null, 'set post meta');
				}
				catch (e) {
					callback(e, null);
				}
			},
			Collections: function (callback) {
				try {
					var CollectionTags = [],
						CollectionContenttypes = [],
						CollectionCategories = [],
						CollectionAssets = [],
						CollectionAuthors = [];
					for (var y in Collections) {
						if (Collections[y].tags) {
							CollectionTags = Collections[y].tags;
							Collections[y].tags = [];
							for (var z in CollectionTags) {
								if (Tags_namehash[CollectionTags[z]]) {
									Collections[y].tags.push(Tags_namehash[CollectionTags[z]]);
								}
							}
						}
						if (Collections[y].categories) {
							CollectionCategories = Collections[y].categories;
							Collections[y].categories = [];
							for (var zc in CollectionCategories) {
								if (Categories_namehash[CollectionCategories[zc]]) {
									Collections[y].categories.push(Categories_namehash[CollectionCategories[zc]]);
								}
							}
						}
						if (Collections[y].contenttypes) {
							CollectionContenttypes = Collections[y].contenttypes;
							Collections[y].contenttypes = [];
							for (var zct in CollectionContenttypes) {
								if (Contenttypes_namehash[CollectionContenttypes[zct]]) {
									Collections[y].contenttypes.push(Contenttypes_namehash[CollectionContenttypes[zct]]);
								}
							}
						}
						if (Collections[y].assets) {
							CollectionAssets = Collections[y].assets;
							Collections[y].assets = [];
							for (var za in CollectionAssets) {
								if (Assets_namehash[CollectionAssets[za]]) {
									Collections[y].assets.push(Assets_namehash[CollectionAssets[za]]);
								}
							}
						}
						if (Collections[y].primaryasset) {
							if (Assets_namehash[Collections[y].primaryasset]) {
								Collections[y].primaryasset = Assets_namehash[Collections[y].primaryasset];
							}
							else {
								delete Collections[y].primaryasset;
							}
						}
						if (Collections[y].authors) {
							CollectionAuthors = Collections[y].authors;
							Collections[y].authors = [];
							for (var zu in CollectionAuthors) {
								if (Users_namehash[CollectionAuthors[zu]]) {
									Collections[y].authors.push(Users_namehash[CollectionAuthors[zu]]);
								}
							}
						}
						if (Collections[y].primaryauthor) {
							if (Users_namehash[Collections[y].primaryauthor]) {
								Collections[y].primaryauthor = Users_namehash[Collections[y].primaryauthor];
							}
							else {
								delete Collections[y].primaryauthor;
							}
						}
					}
					callback(null, 'set collection meta');
				}
				catch (e) {
					callback(e, null);
				}
			}
		}, function (err, updatedItemsCollections) {

				// getItemIdsFromItemArray(callback);
			getTaxonomyIdsFromTaxonomiesArraysAsyncCallBack(
				err,{
					updatedItemsCollections:updatedItemsCollections,
					contenttypes:createdtagscatstype.contenttypes,
					categories:createdtagscatstype.categories,
					tags:createdtagscatstype.tags
			});
		});

	});
};

/**
 * insert users into the database, then put users with hashes in Users_namehash, put the authors in the
 * @param  {Function} getUsersIdsFromUserNameArrayAsyncCallBack
 * @return {Function} async callback getUsersIdsFromUserNameArrayAsyncCallBack(err,results);
 */
var getUsersIdsFromUserNameArray = function (getUsersIdsFromUserNameArrayAsyncCallBack) {
	// console.log('Users in getting ids',Users);
	async.waterfall([
		function (callback) {
			/**
			 * create new users from Users array
			 * @param  {error} err mongoose error
			 * @return {function}     callback(err,users)
			 */
			User.create(Users, function (err) {
				if (err) {
					insertContentIntoDatabaseErrors.push({
						createUsersError: err.toString()
					});
				}
				if (!arguments['0']) {
					delete arguments['0'];
				}
				for (var x in arguments) {
					/**
					 * add new users to name nash array
					 */
					if(arguments[x]._id){
						Users_namehash[arguments[x].username] = arguments[x]._id;	
					}
				}
				callback(null, arguments);
			});
		},
		function (NewUsers, callback) {
			/**
			 * update username hash array
			 * @param  {object} query
			 * @param  {string} selection
			 * @param {function} callback
			 * @return {Function} callback(err,results)
			 */
			User.find({
					'username': {
						$in: Users_namehash_array
					}
				},
				'_id username',
				function (err, userdata) {
					if (err) {
						insertContentIntoDatabaseErrors.push({
							usernameHashSearchError: err.toString()
						});
					}
					for (var x in userdata) {
						Users_namehash[userdata[x].username] = userdata[x]._id;
					}
					callback(null, {
						newusers: NewUsers,
						queriedusers: userdata
					});
				});
		}
	], function (err /*, results*/) {
		// getTaxonomyIdsFromTaxonomiesArrays(callback);
		getUsersIdsFromUserNameArrayAsyncCallBack(err,Users_namehash);
	});
};

/**
 * insert asset items into the database, if there are assets, put the authors in the
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var getAssetIdsFromAssetNameArray = function (asyncCallBack) {
	Asset.find({
		'name': {
			$in: Assets_namehash_array
		}
	}, '_id name', function (err, assetdata) {
		if (err) {
			insertContentIntoDatabaseErrors.push({
				getAssetFromNameArrayError: err.toString()
			});
		}
		for (var x in assetdata) {
			Assets_namehash[assetdata[x].name] = assetdata[x]._id;
		}
		for (var y in Users) {
			if (Users[y].userasset) {
				if (Assets_namehash[Users[y].userasset]) {
					Users[y].userasset = Assets_namehash[Users[y].userasset];
				}
				else {
					insertContentIntoDatabaseErrors.push({
						invalidAssetInUserasset: Users[y].userasset
					});
					delete Users[y].userasset;
				}
			}
			if (Users[y].coverimage) {
				if (Assets_namehash[Users[y].coverimage]) {
					Users[y].coverimage = Assets_namehash[Users[y].coverimage];
				}
				else {
					insertContentIntoDatabaseErrors.push({
						invalidAssetInUsercoverimage: Users[y].coverimage
					});
					delete Users[y].coverimage;
				}
			}
		}
		//logger.silly('Assets_namehash',Assets_namehash);
		// getUsersIdsFromUserNameArray(callback);
		asyncCallBack(null,Assets_namehash);
	});
};

/**
 * insert uac items into the database
 * Assets
 *      |
 *      -> Users
 *          |
 *          -> Contenttypes
 *          -> Categories
 *          -> Tags
 *              |
 *              -> Items
 *                  |
 *                  ->Collections
 * @param  {Function} insertContentIntoDatabaseAsyncCallBack
 * @return {Function} async callback insertContentIntoDatabaseAsyncCallBack(err,results);
 */
var insertContentIntoDatabase = function (insertContentIntoDatabaseAsyncCallBack) {
	async.series({
				createassets:getAssetIdsFromAssetNameArray,
				createusers:getUsersIdsFromUserNameArray,
				createtaxonomies:getTaxonomyIdsFromTaxonomiesArrays,
				createitems:getItemIdsFromItemArray,
				createcollections:getCollectionIdsFromCollectionArray
			},function(err,results){
			insertContentIntoDatabaseAsyncCallBack(err,results);
	});
	// getAssetIdsFromAssetNameArray(cb);
	// cb(null, 'insetintocontent');
};

/**
 * insert asset items into the database, if there are assets, put the authors in the
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var insertAssetsIntoDatabase = function (asyncCallBack) {
	if (Assets.length > 0) {
		for (var y in Assets) {
			if (Assets[y].author) {
				if (Users_namehash[Assets[y].author]) {
					Assets[y].author = Users_namehash[Assets[y].author];
				}
				else {
					insertContentIntoDatabaseErrors.push({
						invalidAuthorInAsset: Assets[y].author
					});
					delete Assets[y].author;
				}
			}
		}
		Asset.create(Assets, function (err) {
			if (err) {
				insertContentIntoDatabaseErrors.push({
					creatingAssetsError: err.toString()
				});
			}
			if (!arguments['0']) {
				delete arguments['0'];
			}
			for (var x in arguments) {
				Assets_namehash[arguments[x].name] = arguments[x]._id;
			}
			asyncCallBack(null, 'created new assets');
		});
	}
	else {
		asyncCallBack(null, 'no new assets');
	}
};

/**
 * create user groups and add roles from Userroles_namehash
 * @param  {Function} getUsergroupsIdsFromUsergroupsIdArrayasyncCallBack
 * @return {Function} async callback getUsergroupsIdsFromUsergroupsIdArrayasyncCallBack(err,results);
 */
var getUsergroupsIdsFromUsergroupsIdArray = function (getUsergroupsIdsFromUsergroupsIdArrayasyncCallBack) {
	/**
	 * replace ids with _ids of privileges
	 * grab  userroles in usergroups, add userrole names to Userroles_namehash, add known {name:_id} _id's to user role
	 */
	for (var x in Usergroups) {
		if (Usergroups[x].roles) {
			var Usergrouproles = Usergroups[x].roles;
			Usergroups[x].roles = [];
			for (var y in Usergrouproles) {
				if (Userroles_namehash[Usergrouproles[y]]) {
					Usergroups[x].roles.push(Userroles_namehash[Usergrouproles[y]]);
				}
			}
		}
	}
	var newgroup = {};
	async.series({
		createusergroups: function (callback) {
			Usergroup.create(Usergroups, function (err) {
				if (err) {
					insertUACIntoDatabaseErrors.push({
						creatingUsergroupsError: err.toString()
					});
				}
				if (!arguments['0']) {
					delete arguments['0'];
				}
				for (var x in arguments) {
					newgroup = arguments[x];
					Usergroups_namehash[newgroup.usergroupid] = newgroup._id;
				}
				callback(null, 'created new user groups');
			});
		},
		findexistingusergroups: function (callback) {
			Usergroup.find({
				'usergroupid': {
					$in: Usergroups_usergroupid_array
				}
			}, '_id usergroupid name', function (err, ugdata) {
				if (err) {
					insertUACIntoDatabaseErrors.push({
						findexistingUsergroupsError: err.toString()
					});
				}
				for (var x in ugdata) {
					Usergroups_namehash[ugdata[x].usergroupid] = ugdata[x]._id;
				}
				callback(null, 'got usergroups name hash updated');
				//logger.silly('Assets_namehash',Assets_namehash);
			});
		}
	}, function (err /*, results */ ) {

		/**
		 * add usergroup names from Users in seedfile to Usergroups_namehash {name:_id}
		 */
		for (var x in Users) {
			if (Users[x].usergroups) {
				var UsersObjgroups = Users[x].usergroups;
				Users[x].usergroups = [];
				for (var y in UsersObjgroups) {
					if (Usergroups_namehash[UsersObjgroups[y]]) {
						Users[x].usergroups.push(Usergroups_namehash[UsersObjgroups[y]]);
					}
				}
			}
		}
		// console.log('Users', results);
		getUsergroupsIdsFromUsergroupsIdArrayasyncCallBack(err, Usergroups_namehash);
	});
};

/**
 * create user roles and add privileges from Userprivileges_namehash
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var getUserroleIdsFromUserroleIdArray = function (asyncCallBack) {
	/**
	 *grab user privileges in userroles, add userprivelegeids to Userprivileges_namehash, add known {userprilvegeid:_id} _id's to user role
	 */
	for (var x in Userroles) {
		if (Userroles[x].privileges) {
			var Userroleprivileges = Userroles[x].privileges;
			Userroles[x].privileges = [];
			for (var y in Userroleprivileges) {
				if (Userprivileges_namehash[Userroleprivileges[y]]) {
					Userroles[x].privileges.push(Userprivileges_namehash[Userroleprivileges[y]]);
				}
			}
		}
	}
	var newrole = {};
	async.series({
		createuserroles: function (callback) {
			Userrole.create(Userroles, function (err) {
				if (err) {
					insertUACIntoDatabaseErrors.push({
						creatingUserrolesError: err.toString()
					});
				}
				if (!arguments['0']) {
					delete arguments['0'];
				}
				for (var x in arguments) {
					newrole = arguments[x];
					Userroles_namehash[newrole.userroleid] = newrole._id;
				}
				callback(null, 'created new user roles');
			});
		},
		findexistinguserroles: function (callback) {
			Userrole.find({
				'userroleid': {
					$in: Userroles_userroleid_array
				}
			}, '_id userroleid name', function (err, urdata) {
				if (err) {
					insertUACIntoDatabaseErrors.push({
						findexistingUserrolesError: err.toString()
					});
				}
				/**
				 * add userrole names from findexistinguserroles to Userroles_namehash {name:_id}
				 */
				for (var x in urdata) {
					Userroles_namehash[urdata[x].name] = urdata[x]._id;
				}

				/**
				 * add userrole names from Users in seedfile to Userroles_namehash {name:_id}
				 */
				for (var xx in Users) {
					if (Users[xx].userroles) {
						var UsersObjroles = Users[xx].userroles;
						Users[xx].userroles = [];
						for (var y in UsersObjroles) {
							if (Userroles_namehash[UsersObjroles[y]]) {
								Users[xx].userroles.push(Userroles_namehash[UsersObjroles[y]]);
							}
						}
					}
				}
				callback(null, 'got userroles name hash updated');
			});
		}
	}, function (err /*, results */) {
		asyncCallBack(err, Userroles_namehash);
	});
};

/**
 * insert user privileges into database and add new privileges into the Userprivileges_namehash { userprivilegeid : _id }
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var getUserprivilegeIdsFromUserPrivilegeIdArray = function (asyncCallBack) {
	var newprivilege = {};
	if (Userprivileges.length > 0) {
		Userprivilege.create(Userprivileges, function (err) {
			if (err) {
				insertUACIntoDatabaseErrors.push({
					creatingUserprivilegesError: err.toString()
				});
			}
			if (!arguments['0']) {
				delete arguments['0'];
			}
			for (var x in arguments) {

				newprivilege = arguments[x];
				Userprivileges_namehash[newprivilege.userprivilegeid] = newprivilege._id;
				// Assets_namehash[arguments[x].name]=arguments[x]._id;
			}
			// console.log('Userprivileges_namehash', Userprivileges_namehash);
			asyncCallBack(null, Userprivileges_namehash);
		});
	}
	else {
		asyncCallBack(null, 'no privilges to create');
	}
};

/**
 * insert uac items into the database
 * privileges
 *       |
 *       -> roles
 *           |
 *           -> groups
 * @param  {Function} asyncCallBack
 * @return {Function} async callback asyncCallBack(err,results);
 */
var insertUACIntoDatabase = function (asyncCallBack) {
	async.series({
			createprivileges: function (callback) {
				getUserprivilegeIdsFromUserPrivilegeIdArray(callback);
			},
			createroles: function (callback) {
				getUserroleIdsFromUserroleIdArray(callback);
			},
			creategroups: function (callback) {
				getUsergroupsIdsFromUsergroupsIdArray(callback);
			}
		},
		function (err, results) {
			asyncCallBack(err, results);
		});
};

/**
 * insert content and uac items into the database
 * @param  {object} seedObjectsArrayStatus - async result of seedObjectArray Function
 * @param  {object} insertDataIntoDatabaseCallback
 * @return {Function} async callback insertDataIntoDatabaseCallback(err,results);
 */
var insertDataIntoDatabase = function (seedObjectsArrayStatus, insertDataIntoDatabaseCallback) {
	async.parallel({
			insertAssetsIntoDatabase: insertAssetsIntoDatabase,
			insertUACIntoDatabase: insertUACIntoDatabase
		},
		function (err, insertDataIntoDatabaseResults) {
			insertContentIntoDatabase(function (err, insertContentIntoDatabaseStatus) {
				insertDataIntoDatabaseCallback(null, {
					insertDataIntoDatabaseERROR: err,
					insertDataIntoDatabaseResults: insertDataIntoDatabaseResults,
					insertContentIntoDatabaseStatus: insertContentIntoDatabaseStatus,
					insertContentIntoDatabaseErrors: insertContentIntoDatabaseErrors,
					insertUACIntoDatabaseErrors: insertUACIntoDatabaseErrors,
					seedObjectsArrayStatus: seedObjectsArrayStatus,
					seedDocumentErrors: seedDocumentErrors,
					validDocuments: validDocuments,
					invalidDocuments: invalidDocuments
				});

			});
		});
};

/**
 * checks for valid seed json document
 * @param  {object} options - jsondata
 * @return {object} errors;
 */
var isValidSeedJSONSync = function (options) {
	var seedjsondata = options.jsondata,
		errorObj;

	if (!seedjsondata || !seedjsondata.data) {
		errorObj = new Error('Seed Document is missing data array of seed datadocuments');
	}

	return errorObj;
};

/**
 * imports seed data into the database
 * @param  {object} options - upsert,jsondata
 * @param  {object} importSeedCallback
 * @return {Function} async callback importSeedCallback(err,results);
 */
var importSeed = function (options, importSeedCallback) {
	insertsetting = options.insertsetting;
	var seedjsondata = options.jsondata,
		statusResults = {},
		seedDataValidationError = isValidSeedJSONSync({
			jsondata: seedjsondata
		}),
		startSeed = function (startSeedCallback) {
			var dataForSetSeedObjectArrays = {
				documents: seedjsondata.data
			};
			startSeedCallback(null, dataForSetSeedObjectArrays);
		};

	if (seedDataValidationError) {
		importSeedCallback(seedDataValidationError, null);
	}
	else {
		statusResults.numberofdocuments = seedjsondata.data.length;
		async.waterfall([
				startSeed,
				setSeedObjectArrays,
				insertDataIntoDatabase
			],
			function (err, importseedresult) {
				importSeedCallback(null, importseedresult);
			});
	}
};

/**
 * importseed module 
 * @module importseed
 * @{@link https://github.com/typesettin/periodicjs.ext.dbseed}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:async
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}           dbseed
 */
var importSeedModule = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	User = mongoose.model('User');
	Item = mongoose.model('Item');
	Asset = mongoose.model('Asset');
	Contenttype = mongoose.model('Contenttype');
	Category = mongoose.model('Category');
	Tag = mongoose.model('Tag');
	Collection = mongoose.model('Collection');
	Userprivilege = mongoose.model('Userprivilege');
	Userrole = mongoose.model('Userrole');
	Usergroup = mongoose.model('Usergroup');

	return {
		seedDocuments: seedDocuments,
		importSeed: importSeed,
		isValidSeedJSONSync: isValidSeedJSONSync
	};
};

module.exports = importSeedModule;
