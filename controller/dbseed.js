'use strict';

var async = require('async'),
    Utilities = require('periodicjs.core.utilities'),
    ControllerHelper = require('periodicjs.core.controllerhelper'),
    CoreUtilities,
    CoreController,
    appSettings,
    mongoose,
    logger;

var seedUserGroupRolePrivilegeData = function(options){
  var seeddocument = options.seeddocument,
      seeddocumenttype = options.seeddocumenttype,
      seed_uacid = null,
      errorObj = null;

  try{
    if(!seeddocument.title){
      errorObj = new Error('User '+seeddocumenttype+' '+seeddocument.title+' is missing title');
    }
    else{
      switch(seeddocumenttype){
        case 'group':
          if(!seeddocument.usergroupid){
            errorObj = new Error('User '+seeddocumenttype+' '+seeddocument.title+' is usergroupid');
          }
          else{
            seed_uacid = seeddocument.usergroupid;
          }
          break;
        case 'role':
          if(!seeddocument.userroleid){
            errorObj = new Error('User '+seeddocumenttype+' '+seeddocument.title+' is userroleid');
          }
          else{
            seed_uacid = seeddocument.userroleid;
          }
          break;
        case 'privilege':
          if(!seeddocument.userprivilegeid){
            errorObj = new Error('User '+seeddocumenttype+' '+seeddocument.title+' is userprivilegeid');
          }
          else{
            seed_uacid = seeddocument.userprivilegeid;
          }
          break;
        default:
          errorObj = new Error('User '+seeddocumenttype+' '+seeddocument.title+' is missing uacid');
          break;
      }
    }
    if(!seeddocument.name){
      seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
    }
  }
  catch(e){
    errorObj = e;
  }

  return {
    doc: seeddocument,
    docs_uacid: seed_uacid,
    err:errorObj
  };
};

var seedItemData = function(options){
  // logger.silly('seedAssetData',options);
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;

  try{
    if(!seeddocument.title){
      errorObj = new Error('Item '+seeddocument.title+' is missing title');
    }
    if(!seeddocument.content){
      errorObj = new Error('Item '+seeddocument.title+' is missing content');
    }
    if(!seeddocument.name){
      seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
    }
  }
  catch(e){
    errorObj = e;
  }

  return {
    doc: seeddocument,
    docs_namehash: seed_namehash,
    err:errorObj
  };
};

var seedCollectionData = function(options){
  // logger.silly('seedAssetData',options);
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;

  try{
    if(!seeddocument.title){
      errorObj = new Error('Collection '+seeddocument.title+' is missing title');
    }
    if(!seeddocument.content){
      errorObj = new Error('Collection '+seeddocument.title+' is missing content');
    }
    if(!seeddocument.name){
      seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
    }
  }
  catch(e){
    errorObj = e;
  }

  return {
    doc: seeddocument,
    docs_namehash: seed_namehash,
    err:errorObj
  };
};

var seedUserData = function(options){
  // logger.silly('seedAssetData',options);
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null,
      User = mongoose.model('User'),
      salt,
      hash,
      bcrypt = require('bcrypt');

  try{
    if(!seeddocument.email){
      errorObj = new Error('user is missing email');
    }
    else{
      if(seeddocument.password){
        salt = bcrypt.genSaltSync(10);
        hash = bcrypt.hashSync(seeddocument.password, salt);
        seeddocument.password = hash;
      }
      seeddocument.apikey = User.generateRandomTokenStatic();
      if(seeddocument.username){
        seed_namehash = seeddocument.username;
      }
    }
  }
  catch(e){
    errorObj = e;
  }

  return {
    doc: seeddocument,
    docs_namehash: seed_namehash,
    err:errorObj
  };
};

var seedAssetData = function(options){
  // logger.silly('seedAssetData',options);
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;
  try{
    if(seeddocument.locationtype ==='local'){
      if(!seeddocument.attributes){
        errorObj = new Error('asset '+seeddocument.name+' is missing attributes');
      }
      else{
        if(!seeddocument.attributes.periodicFilename){
          errorObj = new Error('asset '+seeddocument.name+' is missing periodicPath');
        }
        if(!seeddocument.attributes.periodicPath){
          errorObj = new Error('asset '+seeddocument.name+' is missing periodicPath');
        }
        if(!seeddocument.attributes.periodicDirectory){
          errorObj = new Error('asset '+seeddocument.name+' is missing periodicDirectory');
        }
      }
    }

    if(!seeddocument.fileurl){
      errorObj = new Error('asset '+seeddocument.name+' is missing fileurl');
    }
    if(!seeddocument.assettype){
      errorObj = new Error('asset '+seeddocument.name+' is missing assettype');
    }
    if(!seeddocument.name){
      errorObj = new Error('asset '+seeddocument.name+' is missing title');
    }
    else{
      seed_namehash = seeddocument.name;
    }
  }
  catch(e){
    errorObj = e;
  }

  return {
    doc: seeddocument,
    docs_namehash: seed_namehash,
    err:errorObj
  };
};

var seedContenttypeData = function(options){
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;

  try{
    if(!seeddocument.title){
      errorObj = new Error('contenttype '+seeddocument.title+' is missing title');
    }
    if(!seeddocument.name){
      seeddocument.name = CoreUtilities.makeNiceAttribute(seeddocument.title);
    }
  }
  catch(e){
    errorObj = e;
  }

  return {
    doc: seeddocument,
    docs_namehash: seed_namehash,
    err:errorObj
  };
};

var seedCategoryData = function(options){
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;

  try{
    if(!seeddocument.title){
      errorObj = new Error('Category '+seeddocument.title+' is missing title');
    }
    if(!seeddocument.name){
      seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
    }
  }
  catch(e){
    errorObj = e;
  }

  return {
    doc: seeddocument,
    docs_namehash: seed_namehash,
    err:errorObj
  };
};

var seedTagData = function(options){
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;

  try{
    if(!seeddocument.title){
      errorObj = new Error('Tag '+seeddocument.title+' is missing title');
    }
    if(!seeddocument.name){
      seeddocument.name = CoreUtilities.makeNiceName(seeddocument.title);
    }
  }
  catch(e){
    errorObj = e;
  }

  return {
    doc: seeddocument,
    docs_namehash: seed_namehash,
    err:errorObj
  };
};

var seedDocuments = function(documents,callback){
  var UsersObj,
      User = mongoose.model('User'),
      Users = [],
      Users_namehash = {},
      Users_namehash_array = [],
      ItemsObj,
      Item = mongoose.model('Item'),
      Items =[],
      Items_namehash = {},
      Items_namehash_array = [],
      AssetsObj,
      Asset = mongoose.model('Asset'),
      Assets =[],
      Assets_namehash_array = [],
      Assets_namehash = {},
      ContenttypesObj,
      Contenttype = mongoose.model('Contenttype'),
      Contenttypes =[],
      Contenttypes_namehash_array = [],
      Contenttypes_namehash = {},
      CategoriesObj,
      Category = mongoose.model('Category'),
      Categories =[],
      Categories_namehash_array = [],
      Categories_namehash = {},
      TagsObj,
      Tag = mongoose.model('Tag'),
      Tags =[],
      Tags_namehash_array = [],
      Tags_namehash = {},
      CollectionsObj,
      Collection = mongoose.model('Collection'),
      Collections =[],
      Collections_namehash_array = [],
      Collections_namehash = {},
      UserprivilegesObj,
      Userprivilege = mongoose.model('Userprivilege'),
      Userprivileges =[],
      Userprivileges_userprivilegeid_array = [],
      Userprivileges_namehash = {},
      UserrolesObj,
      Userrole = mongoose.model('Userrole'),
      Userroles =[],
      Userroles_userroleid_array = [],
      Userroles_namehash = {},
      UsergroupsObj,
      Usergroup = mongoose.model('Usergroup'),
      Usergroups =[],
      Usergroups_usergroupid_array = [],
      Usergroups_namehash = {};

      console.log('documents.length',documents.length);
  for(var x in documents){
    if(!documents[x].datatype){
      callback(new Error('new document is missing datatype'),null);
    }
    else if(!documents[x].datadocument){
      callback(new Error('new document is data'),null);
    }
    else{
      if(documents[x].datatype==='usergroup'){
        UsergroupsObj = seedUserGroupRolePrivilegeData({
          seeddocument:documents[x].datadocument,
          seeddocumenttype:'group'
        });
        if(UsergroupsObj.err){
          callback(UsergroupsObj.err,null);
        }
        else{
          Usergroups.push(UsergroupsObj.doc);
          Usergroups_usergroupid_array.push(UsergroupsObj.docs_uacid);
          if(UsergroupsObj.doc.roles && UsergroupsObj.doc.roles.length>0){
            for(var z in UsergroupsObj.doc.roles){
              Userroles_userroleid_array.push(UsergroupsObj.doc.roles[z]);
            }
          }
        }
      }
      if(documents[x].datatype==='userrole'){
        UserrolesObj = seedUserGroupRolePrivilegeData({
          seeddocument:documents[x].datadocument,
          seeddocumenttype:'role'
        });
        if(UserrolesObj.err){
          callback(UserrolesObj.err,null);
        }
        else{
          Userroles.push(UserrolesObj.doc);
          Userroles_userroleid_array.push(UserrolesObj.docs_uacid);
          if(UserrolesObj.doc.privileges && UserrolesObj.doc.privileges.length>0){
            for(var za in UserrolesObj.doc.privileges){
              Userprivileges_userprivilegeid_array.push(UserrolesObj.doc.privileges[za]);
            }
          }
        }
      }
      if(documents[x].datatype==='userprivilege'){
        UserprivilegesObj = seedUserGroupRolePrivilegeData({
          seeddocument:documents[x].datadocument,
          seeddocumenttype:'privilege'
        });
        if(UserprivilegesObj.err){
          callback(UserprivilegesObj.err,null);
        }
        else{
          Userprivileges.push(UserprivilegesObj.doc);
          Userprivileges_userprivilegeid_array.push(UserprivilegesObj.docs_uacid);
        }
      }
      if(documents[x].datatype==='asset'){
        AssetsObj = seedAssetData({
          seeddocument:documents[x].datadocument
        });
        if(AssetsObj.err){
          callback(AssetsObj.err,null);
        }
        else{
          Assets.push(AssetsObj.doc);
          Assets_namehash_array.push(AssetsObj.docs_namehash);
        }
      }
      if(documents[x].datatype==='user'){
        console.log(x,'documents[x]',documents[x],'Users',Users);

        UsersObj = seedUserData({
          seeddocument:documents[x].datadocument
        });
        if(UsersObj.err){
          callback(UsersObj.err,null);
        }
        else{
          Users.push(UsersObj.doc);
          Users_namehash_array.push(UsersObj.docs_namehash);
          if(UsersObj.doc.userroles && UsersObj.doc.userroles.length>0){
            for(var q in UsersObj.doc.userroles){
              Userroles_userroleid_array.push(UsersObj.doc.userroles[q]);
            }
          }
        }
      }
      if(documents[x].datatype==='contenttype'){
        ContenttypesObj = seedContenttypeData({
          seeddocument:documents[x].datadocument
        });
        if(ContenttypesObj.err){
          callback(ContenttypesObj.err,null);
        }
        else{
          Contenttypes.push(ContenttypesObj.doc);
          Contenttypes_namehash_array.push(ContenttypesObj.docs_namehash);
          if(ContenttypesObj.doc.author){
            Users_namehash_array.push(ContenttypesObj.doc.author);
          }
        }
      }
      if(documents[x].datatype==='category'){
        CategoriesObj = seedCategoryData({
          seeddocument:documents[x].datadocument
        });
        if(CategoriesObj.err){
          callback(CategoriesObj.err,null);
        }
        else{
          Categories.push(CategoriesObj.doc);
          Categories_namehash_array.push(CategoriesObj.docs_namehash);
          if(CategoriesObj.doc.author){
            Users_namehash_array.push(CategoriesObj.doc.author);
          }
        }
      }
      if(documents[x].datatype==='tag'){
        TagsObj = seedTagData({
          seeddocument:documents[x].datadocument
        });
        if(TagsObj.err){
          callback(TagsObj.err,null);
        }
        else{
          Tags.push(TagsObj.doc);
          Tags_namehash_array.push(TagsObj.docs_namehash);
          if(TagsObj.doc.author){
            Users_namehash_array.push(TagsObj.doc.author);
          }
        }
      }
      if(documents[x].datatype==='item'){
        ItemsObj = seedItemData({
          seeddocument:documents[x].datadocument
        });
        if(ItemsObj.err){
          callback(ItemsObj.err,null);
        }
        else{
          Items.push(ItemsObj.doc);
          Items_namehash_array.push(ItemsObj.docs_namehash);
        }
      }
      if(documents[x].datatype==='collection'){
        CollectionsObj = seedCollectionData({
          seeddocument:documents[x].datadocument
        });
        if(CollectionsObj.err){
          callback(CollectionsObj.err,null);
        }
        else{
          Collections.push(CollectionsObj.doc);
          Collections_namehash_array.push(CollectionsObj.docs_namehash);
        }
      }
    }
  }
  // http://stackoverflow.com/questions/15400029/mongoose-create-multiple-documents
  var getCollectionIdsFromCollectionArray = function(callback){
    var CollectionItems =[];
    for(var y in Collections){
      if(Collections[y].items){
        CollectionItems = Collections[y].items;
        Collections[y].items=[];
        for(var z in CollectionItems){
          if(Items_namehash[CollectionItems[z].item]){
            CollectionItems[z].item = Items_namehash[CollectionItems[z].item];
            Collections[y].items.push(CollectionItems[z]);
          }
        }
      }
    }
    async.waterfall([
      function(callback){
        Collection.create(Collections,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              // logger.silly('arguments[x]',x,arguments[x]);
              Collections_namehash[arguments[x].name]=arguments[x]._id;
            }
            callback(null,arguments);
          }
        });
      },
      function(NewCollections,callback){
        Collection.find({
            'name':{
              $in:Collections_namehash_array
            }
          },
          '_id name',
          function(err,collectiondata){
            if(err){
              callback(err,null,null);
            }
            else{
              for(var x in collectiondata){
                Collections_namehash[collectiondata[x].name]=collectiondata[x]._id;
              }
              callback(null,{newcollections:NewCollections,queriedcollections:collectiondata});
            }
        });
      }
    ],function(err,results){
      if(err){
        callback(err,null);
      }
      else{
        logger.silly(results);
        //logger.silly(Collections_namehash);
        callback(null,{
          numberofdocuments:documents.length,
          collections:Collections_namehash,
          items:Items_namehash,
          tags:Tags_namehash,
          categories:Categories_namehash,
          contenttypes:Contenttypes_namehash,
          users:Users_namehash,
          assets:Assets_namehash
        });
      }
    });
  };

  var getItemIdsFromItemArray = function(callback){
    async.waterfall([
      function(callback){
        Item.create(Items,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              // logger.silly('arguments[x]',x,arguments[x]);
              Items_namehash[arguments[x].name]=arguments[x]._id;
            }
            callback(null,arguments);
          }
        });
      },
      function(NewItems,callback){
        Item.find({
            'name':{
              $in:Items_namehash_array
            }
          },
          '_id name',
          function(err,itemdata){
            if(err){
              callback(err,null,null);
            }
            else{
              for(var x in itemdata){
                Items_namehash[itemdata[x].name]=itemdata[x]._id;
              }
              callback(null,{newcategories:NewItems,querieditems:itemdata});
            }
        });
      }
    ],function(err,results){
      if(err){
        callback(err,null);
      }
      else{
        logger.silly('Items_namehash',results);
        getCollectionIdsFromCollectionArray(callback);
      }
    });
  };

  var getTaxonomyIdsFromTaxonomiesArrays = function(callback){
    async.parallel({
        contenttypes:function(callback){
          getContenttypeIdsFromContenttypeArray(callback);
        },
        categories:function(callback){
          getCategoryIdsFromCategoryArray(callback);
        },
        tags:function(callback){
          getTagIdsFromTagArray(callback);
        }
      },
      function(err,results){
        if(err){
          callback(err,null);
        }
        else{
          logger.silly('getTaxonomyIdsFromTaxonomiesArrays results',results);
          async.parallel({
            Items:function(callback){
              try{
                var ItemTags=[],ItemContenttypes=[],ItemCategories=[],ItemAssets=[],ItemAuthors=[];
                for(var y in Items){
                  if(Items[y].tags){
                    ItemTags = Items[y].tags;
                    Items[y].tags=[];
                    for(var z in ItemTags){
                      if(Tags_namehash[ItemTags[z]]){
                        Items[y].tags.push(Tags_namehash[ItemTags[z]]);
                      }
                    }
                  }
                  if(Items[y].categories){
                    ItemCategories = Items[y].categories;
                    Items[y].categories=[];
                    for(var zc in ItemCategories){
                      if(Categories_namehash[ItemCategories[zc]]){
                        Items[y].categories.push(Categories_namehash[ItemCategories[zc]]);
                      }
                    }
                  }
                  if(Items[y].contenttypes){
                    ItemContenttypes = Items[y].contenttypes;
                    Items[y].contenttypes=[];
                    for(var zct in ItemContenttypes){
                      if(Contenttypes_namehash[ItemContenttypes[zct]]){
                        Items[y].contenttypes.push(Contenttypes_namehash[ItemContenttypes[zct]]);
                      }
                    }
                  }
                  if(Items[y].assets){
                    ItemAssets = Items[y].assets;
                    Items[y].assets=[];
                    for(var za in ItemAssets){
                      if(Assets_namehash[ItemAssets[za]]){
                        Items[y].assets.push(Assets_namehash[ItemAssets[za]]);
                      }
                    }
                  }
                  if(Items[y].primaryasset){
                    if(Assets_namehash[Items[y].primaryasset]){
                      Items[y].primaryasset = Assets_namehash[Items[y].primaryasset];
                    }
                    else{
                      delete Items[y].primaryasset;
                    }
                  }
                  if(Items[y].authors){
                    ItemAuthors = Items[y].authors;
                    Items[y].authors=[];
                    for(var zu in ItemAuthors){
                      if(Users_namehash[ItemAuthors[zu]]){
                        Items[y].authors.push(Users_namehash[ItemAuthors[zu]]);
                      }
                    }
                  }
                  if(Items[y].primaryauthor){
                    if(Users_namehash[Items[y].primaryauthor]){
                      Items[y].primaryauthor = Users_namehash[Items[y].primaryauthor];
                    }
                    else{
                      delete Items[y].primaryauthor;
                    }
                  }
                }
                callback(null,'set post meta');
              }
              catch(e){
                callback(e,null);
              }
            },
            Collections:function(callback){
              try{
                var CollectionTags=[],CollectionContenttypes=[],CollectionCategories=[],CollectionAssets=[],CollectionAuthors=[];
                for(var y in Collections){
                  if(Collections[y].tags){
                    CollectionTags = Collections[y].tags;
                    Collections[y].tags=[];
                    for(var z in CollectionTags){
                      if(Tags_namehash[CollectionTags[z]]){
                        Collections[y].tags.push(Tags_namehash[CollectionTags[z]]);
                      }
                    }
                  }
                  if(Collections[y].categories){
                    CollectionCategories = Collections[y].categories;
                    Collections[y].categories=[];
                    for(var zc in CollectionCategories){
                      if(Categories_namehash[CollectionCategories[zc]]){
                        Collections[y].categories.push(Categories_namehash[CollectionCategories[zc]]);
                      }
                    }
                  }
                  if(Collections[y].contenttypes){
                    CollectionContenttypes = Collections[y].contenttypes;
                    Collections[y].contenttypes=[];
                    for(var zct in CollectionContenttypes){
                      if(Contenttypes_namehash[CollectionContenttypes[zct]]){
                        Collections[y].contenttypes.push(Contenttypes_namehash[CollectionContenttypes[zct]]);
                      }
                    }
                  }
                  if(Collections[y].assets){
                    CollectionAssets = Collections[y].assets;
                    Collections[y].assets=[];
                    for(var za in CollectionAssets){
                      if(Assets_namehash[CollectionAssets[za]]){
                        Collections[y].assets.push(Assets_namehash[CollectionAssets[za]]);
                      }
                    }
                  }
                  if(Collections[y].primaryasset){
                    if(Assets_namehash[Collections[y].primaryasset]){
                      Collections[y].primaryasset = Assets_namehash[Collections[y].primaryasset];
                    }
                    else{
                      delete Collections[y].primaryasset;
                    }
                  }
                  if(Collections[y].authors){
                    CollectionAuthors = Collections[y].authors;
                    Collections[y].authors=[];
                    for(var zu in CollectionAuthors){
                      if(Users_namehash[CollectionAuthors[zu]]){
                        Collections[y].authors.push(Users_namehash[CollectionAuthors[zu]]);
                      }
                    }
                  }
                  if(Collections[y].primaryauthor){
                    if(Users_namehash[Collections[y].primaryauthor]){
                      Collections[y].primaryauthor = Users_namehash[Collections[y].primaryauthor];
                    }
                    else{
                      delete Collections[y].primaryauthor;
                    }
                  }
                }
                callback(null,'set collection meta');
              }
              catch(e){
                callback(e,null);
              }
            }
          },function(err,results){
            if(err){
              callback(err,null);
            }
            else{
              logger.silly('setting meta for items and collections',results);
              getItemIdsFromItemArray(callback);
            }
          });
        }
    });
  };

  var getTagIdsFromTagArray = function(callback){
    async.waterfall([
      function(callback){
        for(var y in Tags){
          if(Tags[y].author){
            if(Users_namehash[Tags[y].author]){
              Tags[y].author = Users_namehash[Tags[y].author];
            }
            else{
              delete Tags[y].author;
            }
          }
        }
        Tag.create(Tags,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              // logger.silly('arguments[x]',x,arguments[x]);
              Tags_namehash[arguments[x].name]=arguments[x]._id;
            }
            callback(null,arguments);
          }
        });
      },
      function(NewTags,callback){
        Tag.find({
            'name':{
              $in:Tags_namehash_array
            }
          },
          '_id name',
          function(err,tagdata){
            if(err){
              callback(err,null,null);
            }
            else{
              for(var x in tagdata){
                Tags_namehash[tagdata[x].name]=tagdata[x]._id;
              }
              callback(null,{newcategories:NewTags,queriedtags:tagdata});
            }
        });
      }
    ],function(err,results){
      if(err){
        callback(err,null);
      }
      else{
        //logger.silly(Tags_namehash);
        callback(null,results);
      }
    });
  };

  var getCategoryIdsFromCategoryArray = function(callback){
    async.waterfall([
      function(callback){
        for(var y in Categories){
          if(Categories[y].author){
            if(Users_namehash[Categories[y].author]){
              Categories[y].author = Users_namehash[Categories[y].author];
            }
            else{
              delete Categories[y].author;
            }
          }
        }
        Category.create(Categories,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              // logger.silly('arguments[x]',x,arguments[x]);
              Categories_namehash[arguments[x].name]=arguments[x]._id;
            }
            callback(null,arguments);
          }
        });
      },
      function(NewCategories,callback){
        Category.find({
            'name':{
              $in:Categories_namehash_array
            }
          },
          '_id name',
          function(err,categorydata){
            if(err){
              callback(err,null,null);
            }
            else{
              for(var x in categorydata){
                Categories_namehash[categorydata[x].name]=categorydata[x]._id;
              }
              callback(null,{newcategories:NewCategories,queriedcategories:categorydata});
            }
        });
      }
    ],function(err,results){
      if(err){
        callback(err,null);
      }
      else{
        //logger.silly(Categories_namehash);
        callback(null,results);
      }
    });
  };

  var getContenttypeIdsFromContenttypeArray = function(callback){
    async.waterfall([
      function(callback){
        for(var y in Contenttypes){
          if(Contenttypes[y].author){
            if(Users_namehash[Contenttypes[y].author]){
              Contenttypes[y].author = Users_namehash[Contenttypes[y].author];
            }
            else{
              delete Contenttypes[y].author;
            }
          }
        }
        Contenttype.create(Contenttypes,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              // //logger.silly('arguments[x]',x,arguments[x]);
              Contenttypes_namehash[arguments[x].name]=arguments[x]._id;
            }
            callback(null,arguments);
          }
        });
      },
      function(NewContenttypes,callback){
        Contenttype.find({
            'name':{
              $in:Contenttypes_namehash_array
            }
          },
          '_id name',
          function(err,contenttypedata){
            if(err){
              callback(err,null,null);
            }
            else{
              for(var x in contenttypedata){
                Contenttypes_namehash[contenttypedata[x].name]=contenttypedata[x]._id;
              }
              callback(null,{newcontenttypes:NewContenttypes,queriedcontenttypes:contenttypedata});
            }
        });
      }
    ],function(err,results){
      if(err){
        callback(err,null);
      }
      else{
        //logger.silly(Contenttypes_namehash);
        callback(null,results);
      }
    });
  };

  var getUsersIdsFromUserNameArray = function(callback){
    // console.log('Users in getting ids',Users);
    async.waterfall([
      function(callback){
        User.create(Users,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              // logger.silly('arguments[x]',x,arguments[x]);
              Users_namehash[arguments[x].username]=arguments[x]._id;
            }
            callback(null,arguments);
          }
        });
      },
      function(NewUsers,callback){
        User.find({
            'username':{
              $in:Users_namehash_array
            }
          },
          '_id username',
          function(err,userdata){
            if(err){
              callback(err,null,null);
            }
            else{
              for(var x in userdata){
                Users_namehash[userdata[x].username]=userdata[x]._id;
              }
              callback(null,{newusers:NewUsers,queriedusers:userdata});
            }
        });
      }
    ],function(err,results){
      if(err){
        callback(err,null);
      }
      else{
        //logger.silly(Users_namehash);
        logger.silly('getUsersIdsFromUserNameArray results',results);
        getTaxonomyIdsFromTaxonomiesArrays(callback);
      }
    });
  };

  var getAssetIdsFromAssetNameArray = function(callback){
    Asset.find({
      'name':{
        $in:Assets_namehash_array
      }
    },'_id name',function(err,assetdata){
      if(err){
        callback(err,null);
      }
      else{
        for(var x in assetdata){
          Assets_namehash[assetdata[x].name]=assetdata[x]._id;
        }
        for(var y in Users){
          if(Users[y].userasset){
            if(Assets_namehash[Users[y].userasset]){
              Users[y].userasset = Assets_namehash[Users[y].userasset];
            }
            else{
              delete Users[y].userasset;
            }
          }
          if(Users[y].coverimage){
            if(Assets_namehash[Users[y].coverimage]){
              Users[y].coverimage = Assets_namehash[Users[y].coverimage];
            }
            else{
              delete Users[y].coverimage;
            }
          }
        }
        //logger.silly('Assets_namehash',Assets_namehash);
        getUsersIdsFromUserNameArray(callback);
      }
    });
  };

  var getUsergroupsIdsFromUsergroupsIdArray = function(callback){
    //replace ids with _ids of privileges
    for(var x in Usergroups){
      if(Usergroups[x].roles){
        var Usergrouproles= Usergroups[x].roles;
        Usergroups[x].roles=[];
        for(var y in Usergrouproles){
          if(Userroles_namehash[Usergrouproles[y]]){
            Usergroups[x].roles.push(Userroles_namehash[Usergrouproles[y]]);
          }
        }
      }
    }
    var newgroup={};
    async.series({
      createusergroups:function(callback){ 
        Usergroup.create(Usergroups,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              newgroup = arguments[x];
              Usergroups_namehash[newgroup.usergroupid]=newgroup._id;
            }
            callback(null,'created new user groups');
          }
        });
      },
      findexistingusergroups:function(callback){
        Usergroup.find({
            'usergroupid':{
              $in:Usergroups_usergroupid_array
            }
          },'_id usergroupid name',function(err,ugdata){
            if(err){
              callback(err,null);
            }
            else{
              for(var x in ugdata){
                Usergroups_namehash[ugdata[x].usergroupid]=ugdata[x]._id;
              }
              callback(null,'got usergroups name hash updated');
              //logger.silly('Assets_namehash',Assets_namehash);
            }
          });
      }
    },function(err,results){
        if(err){
          callback(err,null);
        }
        else{
          for(var x in Users){
            if(Users[x].usergroups){
              var UsersObjgroups= Users[x].usergroups;
              Users[x].usergroups=[];
              for(var y in UsersObjgroups){
                if(Usergroups_namehash[UsersObjgroups[y]]){
                  Users[x].usergroups.push(Usergroups_namehash[UsersObjgroups[y]]);
                }
              }
            }
          }
          logger.silly('Users',results);
          callback(null,'got usergroups ready from name hash');
        }
    });
  };

  var getUserroleIdsFromUserroleIdArray = function(callback){
    //replace ids with _ids of privileges
    console.log('getUserroleIdsFromUserroleIdArray');
    for(var x in Userroles){
      if(Userroles[x].privileges){
        var Userroleprivileges= Userroles[x].privileges;
        Userroles[x].privileges=[];
        for(var y in Userroleprivileges){
          if(Userprivileges_namehash[Userroleprivileges[y]]){
            Userroles[x].privileges.push(Userprivileges_namehash[Userroleprivileges[y]]);
          }
        }
      }
    }
    var newrole={};
    async.series({
      createuserroles:function(callback){ 
        Userrole.create(Userroles,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              newrole = arguments[x];
              Userroles_namehash[newrole.userroleid]=newrole._id;
            }
            callback(null,'created new user roles');
          }
        });
      },
      findexistinguserroles:function(callback){
        Userrole.find({
            'userroleid':{
              $in:Userroles_userroleid_array
            }
          },'_id userroleid name',function(err,urdata){
            if(err){
              callback(err,null);
            }
            else{
              for(var x in urdata){
                Userroles_namehash[urdata[x].name]=urdata[x]._id;
              }

              for(var xx in Users){
                if(Users[xx].userroles){
                  var UsersObjroles= Users[xx].userroles;
                  Users[xx].userroles=[];
                  for(var y in UsersObjroles){
                    if(Userroles_namehash[UsersObjroles[y]]){
                      Users[xx].userroles.push(Userroles_namehash[UsersObjroles[y]]);
                    }
                  }
                }
              }
              callback(null,'got userroles name hash updated');
              //logger.silly('Assets_namehash',Assets_namehash);
            }
          });
      }
    },function(err,results){
        if(err){
          callback(err,null);
        }
        else{
          callback(null,results);
        }
    });
  };

  var getUserprivilegeIdsFromUserPrivilegeIdArray = function(callback){
    var newprivilege={};
    if(Userprivileges.length>0){
      Userprivilege.create(Userprivileges,function(err){
        if(err){
          callback(err,null);
        }
        else{
          if(!arguments['0']){
            delete arguments['0'];
          }
          for(var x in arguments){

            newprivilege = arguments[x];
            Userprivileges_namehash[newprivilege.userprivilegeid]=newprivilege._id;
            // Assets_namehash[arguments[x].name]=arguments[x]._id;
          }
          console.log('Userprivileges_namehash',Userprivileges_namehash);
          callback(null,'created privilges');
        }
      });
    }
    else{
      callback(null,'no privilges to create');
    }
  };

  async.parallel({
    seedFunctionForContentSeeds:function(callback){
      /*
      Assets
        |
        -> Users
            |
            -> Contenttypes
            -> Categories
            -> Tags
                |
                -> Items
                    |
                    ->Collections
      */
      if(Assets.length>0){
        for(var y in Assets){
          if(Assets[y].author){
            if(Users_namehash[Assets[y].author]){
              Assets[y].author = Users_namehash[Assets[y].author];
            }
            else{
              delete Assets[y].author;
            }
          }
        }
        Asset.create(Assets,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              Assets_namehash[arguments[x].name]=arguments[x]._id;
            }
            callback(null,'created new assets');
          }
        });
      }
      else{
        callback(null,'no new assets');
      }
    },
    seedUserAccessControl:function(callback){
      /*
      privileges
        |
        -> roles
            |
            -> groups
      */
      async.series({
        createprivileges:function(callback){
          getUserprivilegeIdsFromUserPrivilegeIdArray(callback);
        },
        createroles:function(callback){
          getUserroleIdsFromUserroleIdArray(callback);
        },
        creategroups:function(callback){
          getUsergroupsIdsFromUsergroupsIdArray(callback);
        }
      },
      function(err,results){
        callback(err,results);
      });
      
    }
  },function(err,results){
    if(err){
      callback(err,null);
    }
    else{
      console.log('results for creating permissions and groups',results);
      getAssetIdsFromAssetNameArray(callback);
    }
  });

};

var index = function(req, res) {
  CoreController.getPluginViewDefaultTemplate(
    {
      viewname:'p-admin/dbseed/index',
      themefileext:appSettings.templatefileextension,
      extname:'periodicjs.ext.seed'
    },
    function(err,templatepath){
        CoreController.handleDocumentQueryRender({
            res:res,
            req:req,
            err:err,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'Seed Admin',
                    extensions:CoreUtilities.getAdminMenu()
                },
                periodic:{
                  version: appSettings.version
                },
                user:req.user
            }
        });
    });
};

var controller = function(resources){
  logger = resources.logger;
  mongoose = resources.mongoose;
  appSettings = resources.settings;
  CoreController = new ControllerHelper(resources);
  CoreUtilities = new Utilities(resources);

  return{
    index:index,
    seedDocuments:seedDocuments
  };
};

module.exports = controller;