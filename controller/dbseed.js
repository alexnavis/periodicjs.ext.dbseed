'use strict';

var path = require('path'),
    appController = require(path.resolve(__dirname,'../../../../../app/controller/application')),
    fs = require('fs-extra'),
    async = require('async'),
    UserHelper,
    applicationController,
    appSettings,
    mongoose,
    logger;

var seedPostData = function(options){
  // logger.silly("seedAssetData",options);
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;

  try{
    if(!seeddocument.title){
      errorObj = new Error("Post "+seeddocument.title+" is missing title");
    }
    if(!seeddocument.content){
      errorObj = new Error("Post "+seeddocument.title+" is missing content");
    }
    if(!seeddocument.name){
      seeddocument.name = applicationController.makeNiceName(seeddocument.title);
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
  // logger.silly("seedAssetData",options);
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;

  try{
    if(!seeddocument.title){
      errorObj = new Error("Collection "+seeddocument.title+" is missing title");
    }
    if(!seeddocument.content){
      errorObj = new Error("Collection "+seeddocument.title+" is missing content");
    }
    if(!seeddocument.name){
      seeddocument.name = applicationController.makeNiceName(seeddocument.title);
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
  // logger.silly("seedAssetData",options);
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null,
      User = mongoose.model('User'),
      salt,
      hash,
      bcrypt = require('bcrypt');

  try{
    if(!seeddocument.email){
      errorObj = new Error("user is missing email");
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
  // logger.silly("seedAssetData",options);
  var seeddocument = options.seeddocument,
      seed_namehash = null,
      errorObj = null;
  try{
    if(seeddocument.locationtype ==='local'){
      if(!seeddocument.attributes){
        errorObj = new Error("asset "+seeddocument.name+" is missing attributes");
      }
      else{
        if(!seeddocument.attributes.periodicFilename){
          errorObj = new Error("asset "+seeddocument.name+" is missing periodicPath");
        }
        if(!seeddocument.attributes.periodicPath){
          errorObj = new Error("asset "+seeddocument.name+" is missing periodicPath");
        }
        if(!seeddocument.attributes.periodicDirectory){
          errorObj = new Error("asset "+seeddocument.name+" is missing periodicDirectory");
        }
      }
    }

    if(!seeddocument.fileurl){
      errorObj = new Error("asset "+seeddocument.name+" is missing fileurl");
    }
    if(!seeddocument.assettype){
      errorObj = new Error("asset "+seeddocument.name+" is missing assettype");
    }
    if(!seeddocument.name){
      errorObj = new Error("asset "+seeddocument.name+" is missing title");
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
      errorObj = new Error("contenttype "+seeddocument.title+" is missing title");
    }
    if(!seeddocument.name){
      seeddocument.name = applicationController.makeNiceAttribute(seeddocument.title);
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
      errorObj = new Error("Category "+seeddocument.title+" is missing title");
    }
    if(!seeddocument.name){
      seeddocument.name = applicationController.makeNiceName(seeddocument.title);
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
      errorObj = new Error("Tag "+seeddocument.title+" is missing title");
    }
    if(!seeddocument.name){
      seeddocument.name = applicationController.makeNiceName(seeddocument.title);
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
  var asyncTasks = {},
      afterUsersCreatedAsyncTasks = {},
      UsersObj,
      User = mongoose.model('User'),
      Users = [],
      Users_namehash = {},
      Users_namehash_array = [],
      PostsObj,
      Post = mongoose.model('Post'),
      Posts =[],
      Posts_namehash = {},
      Posts_namehash_array = [],
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
      Collections_namehash = {};

    for(var x in documents){
    if(!documents[x].datatype){
      callback(new Error("new document is missing datatype"),null);
    }
    else if(!documents[x].datadocument){
      callback(new Error("new document is data"),null);
    }
    else{
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
        UsersObj = seedUserData({
          seeddocument:documents[x].datadocument
        });
        if(UsersObj.err){
          callback(UsersObj.err,null);
        }
        else{
          Users.push(UsersObj.doc);
          Users_namehash_array.push(UsersObj.docs_namehash);
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
      if(documents[x].datatype==='post'){
        PostsObj = seedPostData({
          seeddocument:documents[x].datadocument
        });
        if(PostsObj.err){
          callback(PostsObj.err,null);
        }
        else{
          Posts.push(PostsObj.doc);
          Posts_namehash_array.push(PostsObj.docs_namehash);
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
    var CollectionPosts =[];
    for(var y in Collections){
      if(Collections[y].posts){
        CollectionPosts = Collections[y].posts;
        Collections[y].posts=[];
        for(var z in CollectionPosts){
          if(Posts_namehash[CollectionPosts[z].post]){
            CollectionPosts[z].post = Posts_namehash[CollectionPosts[z].post];
            Collections[y].posts.push(CollectionPosts[z]);
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
              // logger.silly("arguments[x]",x,arguments[x]);
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
        //logger.silly(results);
        //logger.silly(Collections_namehash);
        callback(null,{
          numberofdocuments:documents.length,
          collections:Collections_namehash,
          posts:Posts_namehash,
          tags:Tags_namehash,
          categories:Categories_namehash,
          contenttypes:Contenttypes_namehash,
          users:Users_namehash,
          assets:Assets_namehash
        });
      }
    });
  };

  var getPostIdsFromPostArray = function(callback){
    async.waterfall([
      function(callback){
        Post.create(Posts,function(err){
          if(err){
            callback(err,null);
          }
          else{
            if(!arguments['0']){
              delete arguments['0'];
            }
            for(var x in arguments){
              // logger.silly("arguments[x]",x,arguments[x]);
              Posts_namehash[arguments[x].name]=arguments[x]._id;
            }
            callback(null,arguments);
          }
        });
      },
      function(NewPosts,callback){
        Post.find({
            'name':{
              $in:Posts_namehash_array
            }
          },
          '_id name',
          function(err,postdata){
            if(err){
              callback(err,null,null);
            }
            else{
              for(var x in postdata){
                Posts_namehash[postdata[x].name]=postdata[x]._id;
              }
              callback(null,{newcategories:NewPosts,queriedposts:postdata});
            }
        });
      }
    ],function(err,results){
      if(err){
        callback(err,null);
      }
      else{
        //logger.silly(Posts_namehash);
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
          //logger.silly("getTaxonomyIdsFromTaxonomiesArrays results",results);
          async.parallel({
            Posts:function(callback){
              try{
                var PostTags=[],PostContenttypes=[],PostCategories=[],PostAssets=[],PostAuthors=[];
                for(var y in Posts){
                  if(Posts[y].tags){
                    PostTags = Posts[y].tags;
                    Posts[y].tags=[];
                    for(var z in PostTags){
                      if(Tags_namehash[PostTags[z]]){
                        Posts[y].tags.push(Tags_namehash[PostTags[z]]);
                      }
                    }
                  }
                  if(Posts[y].categories){
                    PostCategories = Posts[y].categories;
                    Posts[y].categories=[];
                    for(var zc in PostCategories){
                      if(Categories_namehash[PostCategories[zc]]){
                        Posts[y].categories.push(Categories_namehash[PostCategories[zc]]);
                      }
                    }
                  }
                  if(Posts[y].contenttypes){
                    PostContenttypes = Posts[y].contenttypes;
                    Posts[y].contenttypes=[];
                    for(var zct in PostContenttypes){
                      if(Contenttypes_namehash[PostContenttypes[zct]]){
                        Posts[y].contenttypes.push(Contenttypes_namehash[PostContenttypes[zct]]);
                      }
                    }
                  }
                  if(Posts[y].assets){
                    PostAssets = Posts[y].assets;
                    Posts[y].assets=[];
                    for(var za in PostAssets){
                      if(Assets_namehash[PostAssets[za]]){
                        Posts[y].assets.push(Assets_namehash[PostAssets[za]]);
                      }
                    }
                  }
                  if(Posts[y].primaryasset){
                    if(Assets_namehash[Posts[y].primaryasset]){
                      Posts[y].primaryasset = Assets_namehash[Posts[y].primaryasset];
                    }
                    else{
                      delete Posts[y].primaryasset;
                    }
                  }
                  if(Posts[y].authors){
                    PostAuthors = Posts[y].authors;
                    Posts[y].authors=[];
                    for(var zu in PostAuthors){
                      if(Users_namehash[PostAuthors[zu]]){
                        Posts[y].authors.push(Users_namehash[PostAuthors[zu]]);
                      }
                    }
                  }
                  if(Posts[y].primaryauthor){
                    if(Users_namehash[Posts[y].primaryauthor]){
                      Posts[y].primaryauthor = Users_namehash[Posts[y].primaryauthor];
                    }
                    else{
                      delete Posts[y].primaryauthor;
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
              //logger.silly('setting meta for posts and collections',results);
              getPostIdsFromPostArray(callback);
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
              // logger.silly("arguments[x]",x,arguments[x]);
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
              // logger.silly("arguments[x]",x,arguments[x]);
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
              // //logger.silly("arguments[x]",x,arguments[x]);
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
              // logger.silly("arguments[x]",x,arguments[x]);
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
        //logger.silly("getUsersIdsFromUserNameArray results",results);
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
        //logger.silly("Assets_namehash",Assets_namehash);
        getUsersIdsFromUserNameArray(callback);
      }
    });
  };

  /*
  Assets
    |
    -> Users
        |
        -> Contenttypes
        -> Categories
        -> Tags
            |
            -> Posts
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
        getAssetIdsFromAssetNameArray(callback);
      }
    });
  }
  else{
    getAssetIdsFromAssetNameArray(callback);
  }
};

var index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/dbseed/index',
    pluginname:'periodicjs.ext.seed',
    themepath:appSettings.themepath,
    themefileext:appSettings.templatefileextension,
    callback:function(templatepath){
        applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'Seed Admin',
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                  version: appSettings.version
                },
                user:req.user
            }
        });
    }});
};

var grow = function(req, res ,next) {
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
  var userSchema = require(path.resolve(__dirname,'../../../../../app/model/user.js'));
  resources.User = mongoose.model('User',userSchema);
  UserHelper = require(path.resolve(__dirname,'../../../../../app/controller/helpers/user'))(resources);

  return{
    index:index,
    // status:status,
		grow:grow,
    seedDocuments:seedDocuments
	};
};

module.exports = controller;
