/*******************************************************************************
 *
 *  Copyright (c)  2011 Toura, LLC.	All Rights Reserved.
 *  http://toura.com
 *
 *  LICENSE: https://github.com/Toura/mulberry/blob/master/LICENSE.txt
 *
 *******************************************************************************/
dojo.provide("mulberry.base");
if(!dojo._hasResource['mulberry.app.Config']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.Config'] = true;
dojo.provide('mulberry.app.Config');

(function(d, undef) {

var privateConfig = {};

mulberry.app.Config = {
  get : function(key) {
    return privateConfig[key];
  },

  set : function(key, val) {
    privateConfig = privateConfig || {};
    privateConfig[key] = val;
  },

  registerConfig : function(config) {
    privateConfig = config || {};
  }
};

if (mulberry._Config) {
  mulberry.app.Config.registerConfig(mulberry._Config);
}

}(dojo));

}

if(!dojo._hasResource['mulberry.Device']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.Device'] = true;
dojo.provide('mulberry.Device');



mulberry._loadDeviceConfig = function() {

  function getDeviceType() {
    var body = dojo.body(),
        minDim = Math.min(body.offsetWidth, body.offsetHeight);

    return minDim > 640 ? 'tablet' : 'phone';
  }

  mulberry.Device = mulberry.app.Config.get('device') || {
    type : getDeviceType(),
    os : 'browser'
  };

};

mulberry._loadDeviceConfig();

}

if(!dojo._hasResource['mulberry._Logging']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry._Logging'] = true;
dojo.provide('mulberry._Logging');

(function(d, w, c) {

var lastSection,
    sep = '=====',
    lastTime;

function getTimeElapsed(ts) {
  var str = '';

  if (!lastTime) {
    lastTime = ts;
  } else {
    str = ' (' + (ts - lastTime) + 'ms since last log) ';
    lastTime = ts;
  }

  return str;
}

d.mixin(mulberry,{
  log : function() {
        var msg = [].slice.call(arguments);

    if (w.device) {
      console.log('\n\n ' + new Date().getTime() + ' ' + msg.join(' ') + '\n\n');
    } else {
      c.log.apply(c, msg);
    }
      },

  logSection : function(sectionName) {
        var ts = new Date().getTime();
    console.log((w.device ? '\n' : '') + sep + '\n' + ts + '   START ' + sectionName +
      getTimeElapsed(ts) +
    '\n' + sep);
      },

  endLogSection : function(sectionName) {
        var ts = new Date().getTime();
    console.log((w.device ? '\n' : '') + sep + '\n' + ts + '   END   ' + sectionName +
      getTimeElapsed(ts) +
    '\n' + sep);
      }
});

}(dojo, window, console));

}

if(!dojo._hasResource['mulberry._PageDef']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry._PageDef'] = true;
dojo.provide('mulberry._PageDef');

mulberry.pageDefs = mulberry.pageDefs || {};

dojo.declare('mulberry._PageDef', null, {
  constructor : function(config) {
    if (!config.screens || !config.screens.length) {
      throw 'Page definition must include at least one screen';
    }

    dojo.forEach(config.screens, function(screen) {
      if (!screen.regions || !screen.regions.length) {
        throw 'Page definition must include at least one region per screen';
      }
    });

    dojo.mixin(this, config);
  }
});

mulberry.pageDef = function(name, config) {
  mulberry.pageDefs[name] = new mulberry._PageDef(config);
};

}

if(!dojo._hasResource["dojo.store.util.QueryResults"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.store.util.QueryResults"] = true;
dojo.provide("dojo.store.util.QueryResults");

dojo.getObject("store.util", true, dojo);

dojo.store.util.QueryResults = function(results){
	// summary:
	//		A function that wraps the results of a store query with additional
	//		methods.
	//
	// description:
	//		QueryResults is a basic wrapper that allows for array-like iteration
	//		over any kind of returned data from a query.  While the simplest store
	//		will return a plain array of data, other stores may return deferreds or
	//		promises; this wrapper makes sure that *all* results can be treated
	//		the same.
	//
	//		Additional methods include `forEach`, `filter` and `map`.
	//
	// returns: Object
	//		An array-like object that can be used for iterating over.
	//
	// example:
	//		Query a store and iterate over the results.
	//
	//	|	store.query({ prime: true }).forEach(function(item){
	//	|		//	do something
	//	|	});
	
	if(!results){
		return results;
	}
	// if it is a promise it may be frozen
	if(results.then){
		results = dojo.delegate(results);
	}
	function addIterativeMethod(method){
		if(!results[method]){
			results[method] = function(){
				var args = arguments;
				return dojo.when(results, function(results){
					Array.prototype.unshift.call(args, results);
					return dojo.store.util.QueryResults(dojo[method].apply(dojo, args));
				});
			};
		}
	}
	addIterativeMethod("forEach");
	addIterativeMethod("filter");
	addIterativeMethod("map");
	if(!results.total){
		results.total = dojo.when(results, function(results){
			return results.length;
		});
	}
	return results;
};

}

if(!dojo._hasResource["dojo.store.util.SimpleQueryEngine"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.store.util.SimpleQueryEngine"] = true;
dojo.provide("dojo.store.util.SimpleQueryEngine");

dojo.getObject("store.util", true, dojo);

/*=====
dojo.store.util.SimpleQueryEngine.__sortInformation = function(attribute, descending){
	// summary:
	//		An object describing what attribute to sort on, and the direction of the sort.
	// attribute: String
	//		The name of the attribute to sort on.
	// descending: Boolean
	//		The direction of the sort.  Default is false.
	this.attribute = attribute;
	this.descending = descending;
};

dojo.store.util.SimpleQueryEngine.__queryOptions = function(sort, start, count){
	// summary:
	//		Optional object with additional parameters for query results.
	// sort: dojo.store.util.SimpleQueryEngine.__sortInformation[]?
	//		A list of attributes to sort on, as well as direction
	// start: Number?
	//		The first result to begin iteration on
	// count: Number?
	//		The number of how many results should be returned.
	this.sort = sort;
	this.start = start;
	this.count = count;
};
=====*/

dojo.store.util.SimpleQueryEngine = function(query, options){
	// summary:
	//		Simple query engine that matches using filter functions, named filter
	//		functions or objects by name-value on a query object hash
	//
	// description:
	//		The SimpleQueryEngine provides a way of getting a QueryResults through
	//		the use of a simple object hash as a filter.  The hash will be used to
	//		match properties on data objects with the corresponding value given. In
	//		other words, only exact matches will be returned.
	//
	//		This function can be used as a template for more complex query engines;
	//		for example, an engine can be created that accepts an object hash that
	//		contains filtering functions, or a string that gets evaluated, etc.
	//
	//		When creating a new dojo.store, simply set the store's queryEngine
	//		field as a reference to this function.
	//
	// query: Object
	//		An object hash with fields that may match fields of items in the store.
	//		Values in the hash will be compared by normal == operator, but regular expressions
	//		or any object that provides a test() method are also supported and can be
	// 		used to match strings by more complex expressions
	// 		(and then the regex's or object's test() method will be used to match values).
	//
	// options: dojo.store.util.SimpleQueryEngine.__queryOptions?
	//		An object that contains optional information such as sort, start, and count.
	//
	// returns: Function
	//		A function that caches the passed query under the field "matches".  See any
	//		of the "query" methods on dojo.stores.
	//
	// example:
	//		Define a store with a reference to this engine, and set up a query method.
	//
	//	|	var myStore = function(options){
	//	|		//	...more properties here
	//	|		this.queryEngine = dojo.store.util.SimpleQueryEngine;
	//	|		//	define our query method
	//	|		this.query = function(query, options){
	//	|			return dojo.store.util.QueryResults(this.queryEngine(query, options)(this.data));
	//	|		};
	//	|	};

	// create our matching query function
	switch(typeof query){
		default:
			throw new Error("Can not query with a " + typeof query);
		case "object": case "undefined":
			var queryObject = query;
			query = function(object){
				for(var key in queryObject){
					var required = queryObject[key];
					if(required && required.test){
						if(!required.test(object[key])){
							return false;
						}
					}else if(required != object[key]){
						return false;
					}
				}
				return true;
			};
			break;
		case "string":
			// named query
			if(!this[query]){
				throw new Error("No filter function " + query + " was found in store");
			}
			query = this[query];
			// fall through
		case "function":
			// fall through
	}
	function execute(array){
		// execute the whole query, first we filter
		var results = dojo.filter(array, query);
		// next we sort
		if(options && options.sort){
			results.sort(function(a, b){
				for(var sort, i=0; sort = options.sort[i]; i++){
					var aValue = a[sort.attribute];
					var bValue = b[sort.attribute];
					if (aValue != bValue) {
						return !!sort.descending == aValue > bValue ? -1 : 1;
					}
				}
				return 0;
			});
		}
		// now we paginate
		if(options && (options.start || options.count)){
			var total = results.length;
			results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
			results.total = total;
		}
		return results;
	}
	execute.matches = query;
	return execute;
};

}

if(!dojo._hasResource["dojo.store.Memory"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.store.Memory"] = true;
dojo.provide("dojo.store.Memory");




dojo.declare("dojo.store.Memory", null, {
	constructor: function(/*dojo.store.Memory*/ options){
		// summary:
		//		This is a basic in-memory object store.
		// options:
		//		This provides any configuration information that will be mixed into the store.
		// 		This should generally include the data property to provide the starting set of data.
		this.index = {};
		dojo.mixin(this, options);
		this.setData(this.data || []);
	},
	// data: Array
	//		The array of all the objects in the memory store
	data:null,

	// idProperty: String
	//		Indicates the property to use as the identity property. The values of this
	//		property should be unique.
	idProperty: "id",

	// index: Object
	//		An index of data by id
	index:null,

	// queryEngine: Function
	//		Defines the query engine to use for querying the data store
	queryEngine: dojo.store.util.SimpleQueryEngine,
	get: function(id){
		//	summary:
		//		Retrieves an object by its identity
		//	id: Number
		//		The identity to use to lookup the object
		//	returns: Object
		//		The object in the store that matches the given id.
		return this.index[id];
	},
	getIdentity: function(object){
		// 	summary:
		//		Returns an object's identity
		// 	object: Object
		//		The object to get the identity from
		//	returns: Number
		return object[this.idProperty];
	},
	put: function(object, options){
		// 	summary:
		//		Stores an object
		// 	object: Object
		//		The object to store.
		// 	options: Object?
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		//	returns: Number
		var id = options && options.id || object[this.idProperty] || Math.random();
		this.index[id] = object;
		var data = this.data,
			idProperty = this.idProperty;
		for(var i = 0, l = data.length; i < l; i++){
			if(data[i][idProperty] == id){
				data[i] = object;
				return id;
			}
		}
		this.data.push(object);
		return id;
	},
	add: function(object, options){
		// 	summary:
		//		Creates an object, throws an error if the object already exists
		// 	object: Object
		//		The object to store.
		// 	options: Object?
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		//	returns: Number
		if(this.index[options && options.id || object[this.idProperty]]){
			throw new Error("Object already exists");
		}
		return this.put(object, options);
	},
	remove: function(id){
		// 	summary:
		//		Deletes an object by its identity
		// 	id: Number
		//		The identity to use to delete the object
		delete this.index[id];
		var data = this.data,
			idProperty = this.idProperty;
		for(var i = 0, l = data.length; i < l; i++){
			if(data[i][idProperty] == id){
				data.splice(i, 1);
				return;
			}
		}
	},
	query: function(query, options){
		// 	summary:
		//		Queries the store for objects.
		// 	query: Object
		//		The query to use for retrieving objects from the store.
		//	options: dojo.store.util.SimpleQueryEngine.__queryOptions?
		//		The optional arguments to apply to the resultset.
		//	returns: dojo.store.util.QueryResults
		//		The results of the query, extended with iterative methods.
		//
		// 	example:
		// 		Given the following store:
		//
		// 	|	var store = new dojo.store.Memory({
		// 	|		data: [
		// 	|			{id: 1, name: "one", prime: false },
		//	|			{id: 2, name: "two", even: true, prime: true},
		//	|			{id: 3, name: "three", prime: true},
		//	|			{id: 4, name: "four", even: true, prime: false},
		//	|			{id: 5, name: "five", prime: true}
		//	|		]
		//	|	});
		//
		//	...find all items where "prime" is true:
		//
		//	|	var results = store.query({ prime: true });
		//
		//	...or find all items where "even" is true:
		//
		//	|	var results = store.query({ even: true });
		return dojo.store.util.QueryResults(this.queryEngine(query, options)(this.data));
	},
	setData: function(data){
		// 	summary:
		//		Sets the given data as the source for this store, and indexes it
		//	data: Object[]
		//		An array of objects to use as the source of data.
		if(data.items){
			// just for convenience with the data format IFRS expects
			this.idProperty = data.identifier;
			data = this.data = data.items;
		}else{
			this.data = data;
		}

		for(var i = 0, l = data.length; i < l; i++){
			var object = data[i];
			this.index[object[this.idProperty]] = object;
		}
	}
});

}

if(!dojo._hasResource['mulberry._Store']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry._Store'] = true;
dojo.provide('mulberry._Store');



dojo.declare('mulberry._Store', dojo.store.Memory, {
  add : function(item) {
    item = this._createModel(item);
    this.put(item);
  },

  get : function(id) {
    var item = this.inherited(arguments);
    return this._createModel(item);
  },

  put : function(item) {
    this.inherited(arguments);
    this._save();
  },

  remove : function(id) {
    this.inherited(arguments);
    this._save();
  },

  query : function(query, opts) {
    var results = query ? this.inherited(arguments) : dojo.store.util.QueryResults(this.data);
    return results.map(dojo.hitch(this, '_createModel'));
  },

  setData : function(data) {
    this.inherited(arguments);
    this._save();
  },

  prepareData : function(data) {
    return data;
  },

  process : function(data) {
    data = this.prepareData(data);

    if (this.model && client.models[this.model]) {
      data = this._createModels(data);
    }

    return data;
  },

  invoke : function(ids, fn) {
    ids = dojo.isArray(ids) ? ids : [ ids ];

    var models = dojo.map(ids, function(id) {
      var item = this.get(id);

      dojo.hitch(item, fn)(item);

      this.put(item);

      return item;
    }, this);

    return dojo.store.util.QueryResults(models);
  },

  _createModel : function(item) {
    if (this.model && client.models[this.model]) {
      item = new client.models[this.model](item);
      item.format();
    } else {
      console.warn('No model for ' + this.declaredClass);
    }

    if (!item.id) {
      item.id = this._createId();
    }

    return item;
  },

  _createModels : function(data) {
    return dojo.map(data, dojo.hitch(this, '_createModel'));
  },

  _save : function() {
    mulberry.app.DeviceStorage.set(this.key, this.data);
  },

  _createId : function() {
    return (((1+Math.random())*0x10000)).toString(16).substring(1);
  }
});

mulberry.store = function(name, proto) {
  dojo.declare(
    'client.stores.' + name,
    mulberry._Store,
    dojo.mixin({
      key : name,
      data : mulberry.app.DeviceStorage.get(name)
    }, proto)
  );

  client.stores[name] = new client.stores[name]();
};

}

if(!dojo._hasResource['mulberry._Model']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry._Model'] = true;
dojo.provide('mulberry._Model');



dojo.declare('mulberry._Model', dojo.Stateful, {
  format : function() {}
});

mulberry.model = function(name, proto) {
  dojo.declare(
    'client.models.' + name,
    mulberry._Model,
    proto
  );
};

}

if(!dojo._hasResource['mulberry._Capability']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry._Capability'] = true;
dojo.provide('mulberry._Capability');

/**
 * @class
 */
dojo.declare('mulberry._Capability', null, {
  /**
   * An object defining the required components for the capability. The
   * object's keys are the property names that will be used to refer to the
   * component; the corresponding value is the name of the component that is
   * required.
   *
   * @example
   * For example:
   *
   *   {
   *     'imageGallery' : 'ImageGallery'
   *   }
   */
  requirements : {},

  /**
   * An array containing zero or more arrays specifying the connections that
   * the capability should set up.
   *
   * @example
   * For example:
   *
   *   [
   *     [ 'imageGallery', 'onScrollEnd', '_setCaption ]
   *   ]
   *
   * The first item in the array refers to the property name that was defined
   * in the requirements object for the component we want to listen to.
   *
   * The second item in the array is the method or event that we want to listen
   * to on the component.
   *
   * The third item in the array is the capability method that we want to run
   * when the event/method occurs.
   */
  connects : [],

  /**
   * @param {Object} config
   * - page: the page that the capability is associated with
   * - components: the components that are involved, specified as
   *   <screenName>:<componentName>
   */
  constructor : function(config) {
    dojo.mixin(this, config);

    this.domNode = this.page.domNode;
    this.node = this.page.node;

    this.involved = this._loadInvolvedComponents();

    if (!this._checkRequirements()) {
      console.error('Did not find required components for capability', this.declaredClass);
      console.error('These are the components I know about', this.involved);
      throw("Did not find required components for capability " + this.declaredClass);
    }

    this._doLookups();
    this._doConnects();

    this.init();
  },

  /**
   * @public
   * This method can be implemented by individual capabilities, and will be run
   * once all capability setup is complete.
   */
  init : function() {
    // stub for implementation
  },

  /**
   * @private
   * Iterates over the components array provided in the config and populates
   * the `this.involved` object with references to the components.
   *
   * @returns {Object} An object where the property names are the name of the
   * component, and the values are the component associated with that name.
   */
  _loadInvolvedComponents : function() {
    var involved = {};

    dojo.forEach(this.components || [], function(c) {
      var tmp = c.split(':'),
          screenName = tmp[0],
          componentName = tmp[1],

          screen = this.page.getScreen(screenName),
          component = screen.getComponent(componentName);

      if (!component) {
        console.error('Capability', this.declaredClass, 'did not find component for', componentName, 'on the', screenName, 'screen');
      }

      involved[componentName] = component;
    }, this);

    return involved;
  },

  /**
   * @private
   * Checks whether the components that are specified as required in the
   * capability definition are present
   *
   * @returns {Boolean} A boolean value indicating whether the requirements of
   * the capability have been met.
   */
  _checkRequirements : function() {
    var requirementsMet = true;

    dojo.forIn(this.requirements, function(propName, requiredComponentName) {
      var foundComponent = !!this.involved[requiredComponentName] || this.page.getComponent(requiredComponentName);
      requirementsMet = requirementsMet && foundComponent;

      if (!foundComponent) {
        console.warn('did not find', requiredComponentName);
      }
    }, this);

    return requirementsMet;
  },

  /**
   * @private
   * Associates the components specified by the page definition with the appropriate
   * property names, so that the capability can refer to the components in a
   * predictable manner.
   */
  _doLookups : function() {
    dojo.forIn(this.requirements, function(propName, componentName) {
      this[propName] = this.involved[componentName] || this.page.getComponent(componentName);
    }, this);
  },

  /**
   * @private
   * Sets up method/event listeners and interactions between components.
   */
  _doConnects : function() {
    dojo.forEach(this.connects, function(c) {
      this.connect.apply(this, c);
    }, this);
  },

  /**
   * Registers a connection with the capability's page, allowing for automatic
   * connection teardown when the page is destroyed.
   */
  connect : function(obj, method, fn) {
    if (dojo.isString(obj)) { obj = this[obj]; }
    this.page.connect(obj, method, dojo.hitch(this, fn));
  }
});

mulberry.capability = function(name, proto) {
  dojo.declare(
    'mulberry.capabilities.' +  name,
    mulberry._Capability,
    proto
  );
};

}

if(!dojo._hasResource['mulberry.Utilities']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.Utilities'] = true;
dojo.provide('mulberry.Utilities');

// You should have a very, very good reason to put something in this file.

dojo.forIn = function(obj, fn, scope) {
  var k;
  for (k in obj) {
    if (obj.hasOwnProperty(k)) {
      dojo.hitch(scope || window, fn)(k, obj[k]);
    }
  }
};

mulberry.util = {
  truncate : function(text, len) {
    var oldText;

    len = len || 200;

    text = text
      .replace('<\/p>',' ')
      .replace('<br>',' ')
      .replace(/(<\/.>)|(<.>)|(<[^b][^r]?[^>]*>)/g, '');

    oldText = text = dojo.trim(text);

    text = text.substr(0, len);

    if (text && oldText.length > len) {
      text = text + ' &hellip;';
    }

    return text;
  },

  copyStyles : function(fromEl, toEl, styles) {
    var fromStyles = window.getComputedStyle(fromEl);

    // TODO: Filter this, then call dojo.style once?
    dojo.forEach(styles, function(style) {
      dojo.style(toEl, style,
        fromStyles[style]
      );
    });
  }

};

mulberry.tmpl = function(str, data) {
  return dojo.string.substitute(str, data);
};

mulberry.haml = Haml;

mulberry.jsonp = function(url, config) {
  config = dojo.isObject(url) ? url : (config || {});
  config.callbackParamName = config.callback || config.callbackParamName || 'callback';
  url = dojo.isString(url) ? url : config.url;

  if (!url) { return; }

  return dojo.io.script.get(dojo.delegate(config, { url : url }));
};

mulberry.page = function(route, config, isDefault) {
  mulberry.route(route, function(params) {
    mulberry.showPage(mulberry.createPage(dojo.mixin(config, { params : params })));
  }, isDefault);
};

}

if(!dojo._hasResource['mulberry.app.URL']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.URL'] = true;
dojo.provide('mulberry.app.URL');

mulberry.app.URL = {
  protocol : function() {
    return (/^https/).test(document.location.protocol) ? 'https' : 'http';
  },

  tel : function(tel) {
    return 'tel:' + tel.replace(/\W/g, '');
  },

  googleMapAddress : function(address) {
    var url = 'http://maps.google.com/maps?',
        params = { q : address };

    return url + dojo.objectToQuery(params);
  }
};

}

if(!dojo._hasResource['mulberry.app.PhoneGap.notification']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.notification'] = true;
dojo.provide('mulberry.app.PhoneGap.notification');

mulberry.app.PhoneGap.notification = function(pg, device) {
  return {
    alert : function(msg) {
      if (pg) {
        navigator.notification.alert(msg);
      } else {
        alert(msg);
      }
    }
  };
};

}

if(!dojo._hasResource['mulberry.app.PhoneGap.device']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.device'] = true;
dojo.provide('mulberry.app.PhoneGap.device');

(function() {

  function parseVersion(ua) {
    if (!ua) {
      return 'unknown';
    }

    if (!dojo.isString(ua)) {
      return 'unknown';
    }

    if (!dojo.trim(ua)) {
      return 'unknown';
    }

    var v;

    if (ua.match('Android')) {
      v = dojo.trim(
            ua.split('Android')[1].split(';')[0]
          ).split('-')[0].split('.');

      return assembleVersion(v);
    }

    if (ua.indexOf('AppleWebKit') > -1 &&
      (ua.indexOf('iPhone') + ua.indexOf('iPad') + ua.indexOf('iPod')) >= 0
    ) {
      // let's cross this bridge another day
      return 'unknown-ios-webkit';
    }

    // SOL
    return 'unknown';
  }

  function assembleVersion(version) {
    return [ version[0], version[1] || '0' ].join('-');
  }

  mulberry.app.PhoneGap.device = function(pg, device) {
    return {
      version : (function() {
        // http://www.zytrax.com/tech/web/mobile_ids.html
        if (pg) {
          return assembleVersion(window.device.version.split('-')[0].split('.'));
        }

        return parseVersion(window.navigator.userAgent);
      }()),

      _parseVersion : parseVersion
    };
  };

}());

}

if(!dojo._hasResource['mulberry.app.PhoneGap.network']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.network'] = true;
dojo.provide('mulberry.app.PhoneGap.network');

mulberry.app.PhoneGap.network = function(pg, device) {
  var n = navigator,
      interval = 5 * 60 * 1000,
      state,
      checked,
      reachable;

  return {
    /**
     * @public
     *
     * Whether the network is currently in a reachable state. If the method
     * reports that the network is not currently reachable, then it will cache
     * that status for 5 minutes before checking again.
     *
     * @returns {Promise} A promise that, when resolved, will resolve with a
     * boolean, with `true` indicating the network is reachable.
     */
    isReachable : function() {

      console.log('mulberry.app.PhoneGap.network::isReachable()');

      var dfd = new dojo.Deferred(),
          now = new Date().getTime();

      if (
        // we have checked for reachability before
        checked &&

        // last time we checked, it was not reachable
        !reachable &&

        // it has not been long enough since we last checked that we should
        // bother checking again
        (now - checked < interval)
      ) {
        // decide that the network is not reachable and be done with it
        dfd.resolve(reachable);
        return dfd;
      }

      checked = now;

      if (navigator.network && navigator.network.connection) {
        state = navigator.network.connection.type;

        if (state === Connection.UNKNOWN || state === Connection.NONE) {
          reachable = false;
        } else {
          reachable = true;
        }
      } else {
        reachable = true;
      }

      dfd.resolve(reachable);

      return dfd.promise;
    },

    state : function() {
      var states = {},
          type;

      if (navigator.network && navigator.network.connection) {
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.NONE]     = 'No network connection';

        type = navigator.network.connection.type;

        return {
          state : type,
          description : states[type]
        };
      } else {
        return {
          state : -1,
          description : 'Unknown connection'
        };
      }
    }
  };
};

}

if(!dojo._hasResource['mulberry.app.PhoneGap.audio']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.audio'] = true;
dojo.provide('mulberry.app.PhoneGap.audio');

mulberry.app.PhoneGap.audio = function(pg, device) {
  var audio,
      audioSuccess = function() { },
      audioError = function(err) { };

  return {
    play : function(url) {
      console.log('mulberry.app.PhoneGap.audio::play()');

      if (!pg) { return; }

      url = /^http/.test(url) ? url : ('/android_asset/www/' + url);
      audio = new Media(url, audioSuccess, audioError);
      audio.play();
    },

    stop : function() {
      console.log('mulberry.app.PhoneGap.audio::stop()');

      if (!pg || !audio) { return; }

      audio.pause();
    },

    destroy : function() {
      if (!audio) { return; }

      audio.stop();
      audio.release();

      audio = null;
    }
  };
};

}

if(!dojo._hasResource['vendor.urbanairship.push']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['vendor.urbanairship.push'] = true;
dojo.provide('vendor.urbanairship.push');

vendor.urbanairship.push = function() {
  var PushNotification = function() {

  }

  // call this to register for push notifications
  PushNotification.prototype.register = function(success, fail, options) {
      PhoneGap.exec(success, fail, "PushNotification", "registerAPN", options);
  };

  // call this to notify the plugin that the device is ready
  PushNotification.prototype.startNotify = function(notificationCallback) {
      PhoneGap.exec(null, null, "PushNotification", "startNotify", []/* BUG - dies on null */);
  };

  // use this to log from JS to the Xcode console - useful!
  PushNotification.prototype.log = function(message) {
      PhoneGap.exec(null, null, "PushNotification", "log", [{"msg":message}]);
  };

  PhoneGap.addConstructor(function()
  {
    if(!window.plugins)
    {
      window.plugins = {};
    }
    window.plugins.pushNotification = new PushNotification();
  });
};

}

if(!dojo._hasResource['mulberry.app.PhoneGap.push']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.push'] = true;
dojo.provide('mulberry.app.PhoneGap.push');



mulberry.app.PhoneGap.push = function(pg, device) {
  if (!pg) { return; }
  vendor.urbanairship.push();
};

}

if(!dojo._hasResource['mulberry.app.PhoneGap.browser']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.browser'] = true;
dojo.provide('mulberry.app.PhoneGap.browser');

// This is adapted from code that is
// MIT licensed
// (c) 2010 Jesse MacFadyen, Nitobi
// https://github.com/purplecabbage/phonegap-plugins

mulberry.app.PhoneGap.browser = function(pg, device){
  function ChildBrowser() { }
  window.ChildBrowser = ChildBrowser;

  var os = device.os,
      init = {
        ios : function() {
          // Callback when the location of the page changes
          // called from native
          ChildBrowser._onLocationChange = function(newLoc) {
            window.plugins.childBrowser.onLocationChange(newLoc);
          };

          // Callback when the user chooses the 'Done' button
          // called from native
          ChildBrowser._onClose = function() {
            window.plugins.childBrowser.onClose();
          };

          // Callback when the user chooses the 'open in Safari' button
          // called from native
          ChildBrowser._onOpenExternal = function() {
            window.plugins.childBrowser.onOpenExternal();
          };

          // Pages loaded into the ChildBrowser can execute callback scripts, so be careful to
          // check location, and make sure it is a location you trust.
          // Warning ... don't exec arbitrary code, it's risky and could fuck up your app.
          // called from native
          ChildBrowser._onJSCallback = function(js,loc) {
            // Not Implemented
            //window.plugins.childBrowser.onJSCallback(js,loc);
          };

          /* The interface that you will use to access functionality */

          // Show a webpage, will result in a callback to onLocationChange
          ChildBrowser.prototype.showWebPage = function(loc) {
            PhoneGap.exec("ChildBrowserCommand.showWebPage", loc);
          };

          // close the browser, will NOT result in close callback
          ChildBrowser.prototype.close = function() {
            PhoneGap.exec("ChildBrowserCommand.close");
          };

          // Not Implemented
          ChildBrowser.prototype.jsExec = function(jsString) {
            // Not Implemented!!
            //PhoneGap.exec("ChildBrowserCommand.jsExec",jsString);
          };

          // Note: this plugin does NOT install itself, call this method some time after deviceready to install it
          // it will be returned, and also available globally from window.plugins.childBrowser
          ChildBrowser.install = function() {
            if(!window.plugins) {
              window.plugins = {};
            }

            window.plugins.childBrowser = new ChildBrowser();
            return window.plugins.childBrowser;
          };

          ChildBrowser.install();
        },

        android : function() {
          /*
           * Copyright (c) 2005-2010, Nitobi Software Inc.
           * Copyright (c) 2010, IBM Corporation
           */

          ChildBrowser.prototype.showWebPage = function(url, usePhoneGap) {
            PhoneGap.exec(null, null, "ChildBrowser", "showWebPage", [url, usePhoneGap]);
          };

          PhoneGap.addConstructor(function() {
            PhoneGap.addPlugin("childBrowser", new ChildBrowser());
            PluginManager.addService("ChildBrowser", "com.phonegap.plugins.childBrowser.ChildBrowser");
          });
        }
      };

  if (pg && init[os]) {
    init[os]();
  }

  return {
    url : function(url) {
      if (pg) {
        if (os === 'android') {
          PhoneGap.exec(null, null, 'ChildBrowser', 'showWebPage', [url, false]);
        } else {
          window.plugins.childBrowser.showWebPage(url);
        }
        return;
      }

      window.location = url;
    },

    getBrowser : function() {
      if (!window.plugins.childBrowser) {
        throw new Error("Can't find childBrowser plugin");
      }

      return window.plugins.childBrowser;
    }
  };

};


}

if(!dojo._hasResource['mulberry.app.PhoneGap.camera']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.camera'] = true;
dojo.provide('mulberry.app.PhoneGap.camera');

mulberry.app.PhoneGap.camera = function(pg, device) {
  var noop = function() {};

  return {
    getPicture : function(success, error, opts) {
      if (!dojo.isFunction(success)) {
        opts = success;
        success = false;
        error = false;
      }

      var dfd = new dojo.Deferred(),

          win = function(data) {
            (success || noop)(data);
            dfd.resolve(data);
          },

          fail = function(msg) {
            (error || noop)(msg);
            dfd.reject(msg);
          };

      if (pg && navigator && navigator.camera) {
        navigator.camera.getPicture(win, fail, opts);
      } else {
        dfd.resolve();
      }

      return dfd.promise;
    }
  };
};

}

if(!dojo._hasResource['mulberry.app.PhoneGap.geolocation']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.geolocation'] = true;
dojo.provide('mulberry.app.PhoneGap.geolocation');

mulberry.app.PhoneGap.geolocation = function(pg, device) {
  var noop = function(){};

  return {
    getCurrentPosition : function(success, error, opts) {
      if (!dojo.isFunction(success)) {
        opts = success;
        success = false;
        error = false;
      }

      var dfd = new dojo.Deferred(),

          win = function(data) {
            (success || noop)(data);
            dfd.resolve(data);
          },

          fail = function(msg) {
            (error || noop)(msg);
            dfd.reject(msg);
          },

          failMsg = 'Geolocation API not available';

      if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition(win, fail, opts);
      } else {
        fail(failMsg);
      }

      return dfd.promise;
    },

    watchPosition : function(success, error, opts) {
      if (navigator.geolocation && navigator.geolocation.watchPosition) {
        return navigator.geolocation.watchPosition(success, error, opts);
      }

      return false;
    },

    clearWatch : function(watch) {
      if (watch && navigator.geolocation && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watch);
      }
    }
  };
};

}

if(!dojo._hasResource['mulberry.app.PhoneGap.accelerometer']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap.accelerometer'] = true;
dojo.provide('mulberry.app.PhoneGap.accelerometer');

mulberry.app.PhoneGap.accelerometer = function(pg, device) {
  var noop = function(){};

  return {
    getCurrentAcceleration : function(success, error) {
      var dfd = new dojo.Deferred(),

          win = function(data) {
            (success || noop)(data);
            dfd.resolve(data);
          },

          fail = function(msg) {
            (error || noop)(msg);
            dfd.reject(msg);
          },

          failMsg = 'Accelerometer API not available';

      if (navigator.accelerometer && navigator.accelerometer.getCurrentAcceleration) {
        navigator.accelerometer.getCurrentAcceleration(win, fail);
      } else {
        fail(failMsg);
      }

      return dfd.promise;
    },

    watchAcceleration : function(success, error) {
      if (navigator.accelerometer && navigator.accelerometer.watchAcceleration) {
        return navigator.accelerometer.watchAcceleration(success, error);
      } else {
        return false;
      }
    },

    clearWatch : function(watch) {
      var watchId = watch.watchId || watch;

      if (navigator.accelerometer && navigator.accelerometer.clearWatch && watchId) {
        navigator.accelerometer.clearWatch(watchId);
      }
    }
  };
};

}

if(!dojo._hasResource['mulberry.app.PhoneGap']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PhoneGap'] = true;
dojo.provide('mulberry.app.PhoneGap');












(function() {

  mulberry.app.PhoneGap.registerAPI = function(name, module) {
    var s = dojo.subscribe('/app/deviceready', function() {
      var device = mulberry.Device,
          phonegapPresent = mulberry.app.PhoneGap.present = window.device && window.device.phonegap;

      console.log('NAME', name);
      mulberry.app.PhoneGap[name] = module(phonegapPresent, device);
      dojo.unsubscribe(s);
    });
  };

  var builtInAPIs = [
    'notification',
    'device',
    'network',
    'audio',
    'push',
    'browser',
    'camera',
    'geolocation',
    'accelerometer'
  ];

  dojo.forEach(builtInAPIs, function(apiName) {
    mulberry.app.PhoneGap.registerAPI(apiName, mulberry.app.PhoneGap[apiName]);
  });
}());

}

if(!dojo._hasResource['mulberry.app.DeviceStorage']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.DeviceStorage'] = true;
dojo.provide('mulberry.app.DeviceStorage');



/**
 * Provides an API for interacting with the SQLite databse
 */
mulberry.app.DeviceStorage = (function(){
  var storeInSQL = {
    'tour' : {
      tableName : 'items',
      fields : [ 'id text', 'json text' ],
      insertStatement : function(tableName, item) {
        return [
          "INSERT INTO " + tableName + "( id, json ) VALUES ( ?, ? )",
          [ item.id, JSON.stringify(item) ]
        ];
      },
      processSelecton : function(result) {
        var items = [],
            len = result.rows.length,
            rowData, i;

        for (i = 0; i < len; i++) {
          rowData = result.rows.item(i).json;
          items.push(rowData ? JSON.parse(rowData) : {});
        }

        return items;
      }
    }
  };

  return {
    init : function(appId) {
      this.appId = appId;

      if (!window.localStorage) {
        throw new Error('Local storage interface is not defined. Cannot create database. Aborting.');
      }

      if (!window.openDatabase) {
        throw new Error('SQLite database interface is not defined. Cannot create database. Aborting.');
      }

      var db = this._db = openDatabase(
        // short db name
        appId + '-' + mulberry.version,

        // sqlite version
        "1.0",

        // long db name
        appId + ' Database',

        // database size
        5 * 1024 *1024
      );

      if (!db) {
        console.log('No database. This will end badly.');
      }

      this._sql = function(queries, formatter) {
        var dfd = new dojo.Deferred(),
            len;

        queries = dojo.isArray(queries) ? queries : [ queries ];
        len = queries.length;

        db.transaction(function(t) {

          dojo.forEach(queries, function(q, i) {
            var last = i + 1 === len,
                cb, eb, params = [];

            if (last) {
              cb = dojo.isFunction(formatter) ?
                    function(t, data) {
                      dfd.callback(formatter(data));
                    } :
                    dfd.callback;

              eb = dfd.errback;
            } else {
              cb = eb = function() {};
            }

            if (dojo.isArray(q)) {
              params = q[1];
              q = q[0];
            }

            t.executeSql(q, params, cb, eb);
          });

        });

        return dfd;
      };

      // don't let database be initialized again
      return this._db;
    },

    drop : function() {
      var queries = [];

      dojo.forIn(storeInSQL, function(propName, settings) {
        queries.push("DROP TABLE IF EXISTS " + settings.tableName);
      });

      window.localStorage.clear();
      return this._sql && this._sql(queries);
    },

    set : function(k, v) {
      var sql = storeInSQL[k],
          queries;

      if (sql) {
        queries = [
          "DROP TABLE IF EXISTS " + sql.tableName,
          "CREATE TABLE " + sql.tableName + "(" + sql.fields.join(',') + ")"
        ];

        dojo.forEach(v, function(item) {
          queries.push(sql.insertStatement(sql.tableName, item));
        });

        return this._sql(queries);
      }

      window.localStorage.setItem(k, JSON.stringify(v));
      return true;
    },

    get : function(k) {
      var sql = storeInSQL[k];

      if (sql) {
        return this._sql("SELECT * FROM " + sql.tableName, sql.processSelecton);
      }

      var ret = window.localStorage.getItem(k);
      if (ret === 'undefined') { ret = null; }
      ret = ret && JSON.parse(ret);
      return ret;
    }
  };
}());

}

if(!dojo._hasResource['mulberry._Nls']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry._Nls'] = true;
dojo.provide('mulberry._Nls');





dojo.declare('mulberry._Nls', null, {
  /* http://www.ibm.com/developerworks/web/library/wa-dojo/ */
  data: {
    __initialized : false
  },

  constructor : function() {
    if (!this.data.__initialized) {
      this.data.nlsStrings = dojo.i18n.getLocalization("mulberry", "mulberry", mulberry.app.Config.get("locale"));
      this.data.__initialized = true;
    }
  },

  /**
  *
  * @param {String} key - the name of the key in the translation file
  * @param {Object or Array?} substitutes - in cases where the translated
  *   string is a template for string substitution, this parameter
  *   holds the values to be used by dojo.string.substitute on that
  *   template
  */
  getString : function(/*String*/ key, /*Object or Array?*/ substitutes) {
    var str = this.data.nlsStrings[key];
    return (substitutes) ? dojo.string.substitute(str,substitutes) : str;
  },

  postMixInProperties : function() {
    this.inherited('postMixInProperties', arguments);
    this.initializeStrings();
  },

  initializeStrings : function(){
    // stub for subclasses
  }
});

}

if(!dojo._hasResource['vendor.iscroll']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['vendor.iscroll'] = true;
dojo.provide('vendor.iscroll');

/**
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * iScroll v4.0 Beta 4
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Copyright (c) 2010 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 *
 * Last updated: 2011.03.10
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 */

(function(){
function iScroll (el, options) {
	var that = this, doc = document, div, i;

	that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
	that.wrapper.style.overflow = 'hidden';
	that.scroller = that.wrapper.children[0];

	// Default options
	that.options = {
		HWTransition: true,		// Experimental, internal use only
		HWCompositing: true,	// Experimental, internal use only
		hScroll: true,
		vScroll: true,
		hScrollbar: true,
		vScrollbar: true,
		fixedScrollbar: isAndroid,
		fadeScrollbar: (isIDevice && has3d) || !hasTouch,
		hideScrollbar: isIDevice || !hasTouch,
		scrollbarClass: '',
		bounce: has3d,
		bounceLock: false,
		momentum: has3d,
		lockDirection: true,
		zoom: false,
		zoomMin: 1,
		zoomMax: 4,
		snap: false,
		pullToRefresh: false,
		pullDownLabel: ['Pull down to refresh...', 'Release to refresh...', 'Loading...'],
		pullUpLabel: ['Pull up to refresh...', 'Release to refresh...', 'Loading...'],
		onPullDown: function () {},
		onPullUp: function () {},
		onScrollStart: null,
		onScrollEnd: null,
		onZoomStart: null,
		onZoomEnd: null,
		checkDOMChange: false		// Experimental
	};

	// User defined options
	for (i in options) {
		that.options[i] = options[i];
	}

	that.options.HWCompositing = that.options.HWCompositing && hasCompositing;
	that.options.HWTransition = that.options.HWTransition && hasCompositing;

	if (that.options.HWCompositing) {
		that.scroller.style.cssText += '-webkit-transition-property:-webkit-transform;-webkit-transform-origin:0 0;-webkit-transform:' + trnOpen + '0,0' + trnClose;
	} else {
		that.scroller.style.cssText += '-webkit-transition-property:top,left;-webkit-transform-origin:0 0;top:0;left:0';
	}

	if (that.options.HWTransition) {
		that.scroller.style.cssText += '-webkit-transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);-webkit-transition-duration:0;';
	}

	that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
	that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;

	that.pullDownToRefresh = that.options.pullToRefresh == 'down' || that.options.pullToRefresh == 'both';
	that.pullUpToRefresh = that.options.pullToRefresh == 'up' || that.options.pullToRefresh == 'both';

	if (that.pullDownToRefresh) {
		div = doc.createElement('div');
		div.className = 'iScrollPullDown';
		div.innerHTML = '<span class="iScrollPullDownIcon"></span><span class="iScrollPullDownLabel">' + that.options.pullDownLabel[0] + '</span>\n';
		that.scroller.insertBefore(div, that.scroller.children[0]);
		that.options.bounce = true;
		that.pullDownEl = div;
		that.pullDownLabel = div.getElementsByTagName('span')[1];
	}

	if (that.pullUpToRefresh) {
		div = doc.createElement('div');
		div.className = 'iScrollPullUp';
		div.innerHTML = '<span class="iScrollPullUpIcon"></span><span class="iScrollPullUpLabel">' + that.options.pullUpLabel[0] + '</span>\n';
		that.scroller.appendChild(div);
		that.options.bounce = true;
		that.pullUpEl = div;
		that.pullUpLabel = div.getElementsByTagName('span')[1];
	}

	that.refresh();

	that._bind(RESIZE_EV, window);
	that._bind(START_EV);
/*	that._bind(MOVE_EV);
	that._bind(END_EV);
	that._bind(CANCEL_EV);*/

	if (hasGesture && that.options.zoom) {
		that._bind('gesturestart');
		that.scroller.style.webkitTransform = that.scroller.style.webkitTransform + ' scale(1)';
	}

	if (!hasTouch) {
		that._bind('mousewheel');
	}

	if (that.options.checkDOMChange) {
		that.DOMChangeInterval = setInterval(function () { that._checkSize(); }, 250);
	}
}

iScroll.prototype = {
	x: 0, y: 0,
	currPageX: 0, currPageY: 0,
	pagesX: [], pagesY: [],
	offsetBottom: 0,
	offsetTop: 0,
	scale: 1, lastScale: 1,
	contentReady: true,

	handleEvent: function (e) {
		var that = this;

		switch(e.type) {
			case START_EV: that._start(e); break;
			case MOVE_EV: that._move(e); break;
			case END_EV:
			case CANCEL_EV: that._end(e); break;
			case 'webkitTransitionEnd': that._transitionEnd(e); break;
			case RESIZE_EV: that._resize(); break;
			case 'gesturestart': that._gestStart(e); break;
			case 'gesturechange': that._gestChange(e); break;
			case 'gestureend':
			case 'gesturecancel': that._gestEnd(e); break;
			case 'mousewheel': that._wheel(e); break;
		}
	},

	_scrollbar: function (dir) {
		var that = this,
			doc = document,
			bar;

		if (!that[dir + 'Scrollbar']) {
			if (that[dir + 'ScrollbarWrapper']) {
				that[dir + 'ScrollbarIndicator'].style.webkitTransform = '';	// Should free some mem
				that[dir + 'ScrollbarWrapper'].parentNode.removeChild(that[dir + 'ScrollbarWrapper']);
				that[dir + 'ScrollbarWrapper'] = null;
				that[dir + 'ScrollbarIndicator'] = null;
			}

			return;
		}

		if (!that[dir + 'ScrollbarWrapper']) {
			// Create the scrollbar wrapper
			bar = doc.createElement('div');
			if (that.options.scrollbarClass) {
				bar.className = that.options.scrollbarClass + dir.toUpperCase();
			} else {
				bar.style.cssText = 'position:absolute;z-index:100;' + (dir == 'h' ? 'height:7px;bottom:1px;left:2px;right:7px' : 'width:7px;bottom:7px;top:2px;right:1px');
			}
			bar.style.cssText += 'pointer-events:none;-webkit-transition-property:opacity;-webkit-transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

			that.wrapper.appendChild(bar);
			that[dir + 'ScrollbarWrapper'] = bar;

			// Create the scrollbar indicator
			bar = doc.createElement('div');
			if (!that.options.scrollbarClass) {
				bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);-webkit-background-clip:padding-box;-webkit-box-sizing:border-box;' + (dir == 'h' ? 'height:100%;-webkit-border-radius:4px 3px;' : 'width:100%;-webkit-border-radius:3px 4px;');
			}
			bar.style.cssText += 'pointer-events:none;-webkit-transition-property:-webkit-transform;-webkit-transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);-webkit-transition-duration:0;-webkit-transform:' + trnOpen + '0,0' + trnClose;

			that[dir + 'ScrollbarWrapper'].appendChild(bar);
			that[dir + 'ScrollbarIndicator'] = bar;
		}

		if (dir == 'h') {
			that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
			that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
			that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
			that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
			that.hScrollbarProp = that.hScrollbarMaxScroll / that.maxScrollX;
		} else {
			that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
			that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
			that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
			that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
			that.vScrollbarProp = that.vScrollbarMaxScroll / that.maxScrollY;
		}

		// Reset position
		that._indicatorPos(dir, true);
	},

	_resize: function () {
		var that = this;

		//if (that.options.momentum) that._unbind('webkitTransitionEnd');

		setTimeout(function () {
			that.refresh();
		}, 0);
	},

	_checkSize: function () {
		var that = this,
			scrollerW,
			scrollerH;

		if (that.moved || that.zoomed || !that.contentReady) return;

		scrollerW = m.round(that.scroller.offsetWidth * that.scale),
		scrollerH = m.round((that.scroller.offsetHeight - that.offsetBottom - that.offsetTop) * that.scale);

		if (scrollerW == that.scrollerW && scrollerH == that.scrollerH) return;

		that.refresh();
	},

	_pos: function (x, y) {
		var that = this;

		that.x = that.hScroll ? x : 0;
		that.y = that.vScroll ? y : 0;

		that.scroller.style.webkitTransform = trnOpen + that.x + 'px,' + that.y + 'px' + trnClose + ' scale(' + that.scale + ')';
//		that.scroller.style.left = that.x + 'px';
//		that.scroller.style.top = that.y + 'px';

		that._indicatorPos('h');
		that._indicatorPos('v');
	},

	_indicatorPos: function (dir, hidden) {
		var that = this,
			pos = dir == 'h' ? that.x : that.y;

		if (!that[dir + 'Scrollbar']) return;

		pos = that[dir + 'ScrollbarProp'] * pos;

		if (pos < 0) {
			pos = that.options.fixedScrollbar ? 0 : pos + pos*3;
			if (that[dir + 'ScrollbarIndicatorSize'] + pos < 9) pos = -that[dir + 'ScrollbarIndicatorSize'] + 8;
		} else if (pos > that[dir + 'ScrollbarMaxScroll']) {
			pos = that.options.fixedScrollbar ? that[dir + 'ScrollbarMaxScroll'] : pos + (pos - that[dir + 'ScrollbarMaxScroll'])*3;
			if (that[dir + 'ScrollbarIndicatorSize'] + that[dir + 'ScrollbarMaxScroll'] - pos < 9) pos = that[dir + 'ScrollbarIndicatorSize'] + that[dir + 'ScrollbarMaxScroll'] - 8;
		}
		that[dir + 'ScrollbarWrapper'].style.webkitTransitionDelay = '0';
		that[dir + 'ScrollbarWrapper'].style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
		that[dir + 'ScrollbarIndicator'].style.webkitTransform = trnOpen + (dir == 'h' ? pos + 'px,0' : '0,' + pos + 'px') + trnClose;
	},

	_transitionTime: function (time) {
		var that = this;

		time += 'ms';
		that.scroller.style.webkitTransitionDuration = time;

		if (that.hScrollbar) that.hScrollbarIndicator.style.webkitTransitionDuration = time;
		if (that.vScrollbar) that.vScrollbarIndicator.style.webkitTransitionDuration = time;
	},

	_start: function (e) {
		var that = this,
			point = hasTouch ? e.changedTouches[0] : e,
			matrix;

		that.moved = false;

		e.preventDefault();

		if (hasTouch && e.touches.length == 2 && that.options.zoom && hasGesture && !that.zoomed) {
			that.originX = m.abs(e.touches[0].pageX + e.touches[1].pageX - that.wrapperOffsetLeft*2) / 2 - that.x;
			that.originY = m.abs(e.touches[0].pageY + e.touches[1].pageY - that.wrapperOffsetTop*2) / 2 - that.y;
		}

		that.moved = false;
		that.distX = 0;
		that.distY = 0;
		that.absDistX = 0;
		that.absDistY = 0;
		that.dirX = 0;
		that.dirY = 0;
		that.returnTime = 0;

		that._transitionTime(0);

		if (that.options.momentum) {
			if (that.scrollInterval) {
				clearInterval(that.scrollInterval);
				that.scrollInterval = null;
			}

			if (that.options.HWCompositing) {
				matrix = new WebKitCSSMatrix(window.getComputedStyle(that.scroller, null).webkitTransform);
				if (matrix.m41 != that.x || matrix.m42 != that.y) {
					that._unbind('webkitTransitionEnd');
					that._pos(matrix.m41, matrix.m42);
				}
			} else {
				matrix = window.getComputedStyle(that.scroller, null);
				if (that.x + 'px' != matrix.left || that.y + 'px' != matrix.top) {
					that._unbind('webkitTransitionEnd');
					that._pos(matrix.left.replace(/[^0-9]/g)*1, matrix.top.replace(/[^0-9]/g)*1);
				}
			}

		}

		that.scroller.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.66,1)';
		if (that.hScrollbar) that.hScrollbarIndicator.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.66,1)';
		if (that.vScrollbar) that.vScrollbarIndicator.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.66,1)';
		that.startX = that.x;
		that.startY = that.y;
		that.pointX = point.pageX;
		that.pointY = point.pageY;

		that.startTime = e.timeStamp;

		if (that.options.onScrollStart) that.options.onScrollStart.call(that);

		// Registering/unregistering of events is done to preserve resources on Android
//		setTimeout(function () {
//			that._unbind(START_EV);
			that._bind(MOVE_EV);
			that._bind(END_EV);
			that._bind(CANCEL_EV);
//		}, 0);
	},

	_move: function (e) {
		if (hasTouch && e.touches.length > 1) return;

		var that = this,
			point = hasTouch ? e.changedTouches[0] : e,
			deltaX = point.pageX - that.pointX,
			deltaY = point.pageY - that.pointY,
			newX = that.x + deltaX,
			newY = that.y + deltaY;

		e.preventDefault();

		that.pointX = point.pageX;
		that.pointY = point.pageY;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? that.x + (deltaX / 2.4) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
		}
		if (newY > 0 || newY < that.maxScrollY) {
			newY = that.options.bounce ? that.y + (deltaY / 2.4) : newY >= 0 || that.maxScrollY >= 0 ? 0 : that.maxScrollY;

			// Pull down to refresh
			if (that.options.pullToRefresh && that.contentReady) {
				if (that.pullDownToRefresh && newY > that.offsetBottom) {
					that.pullDownEl.className = 'iScrollPullDown flip';
					that.pullDownLabel.innerText = that.options.pullDownLabel[1];
				} else if (that.pullDownToRefresh && that.pullDownEl.className.match('flip')) {
					that.pullDownEl.className = 'iScrollPullDown';
					that.pullDownLabel.innerText = that.options.pullDownLabel[0];
				}

				if (that.pullUpToRefresh && newY < that.maxScrollY - that.offsetTop) {
					that.pullUpEl.className = 'iScrollPullUp flip';
					that.pullUpLabel.innerText = that.options.pullUpLabel[1];
				} else if (that.pullUpToRefresh && that.pullUpEl.className.match('flip')) {
					that.pullUpEl.className = 'iScrollPullUp';
					that.pullUpLabel.innerText = that.options.pullUpLabel[0];
				}
			}
		}

		if (that.absDistX < 4 && that.absDistY < 4) {
			that.distX += deltaX;
			that.distY += deltaY;
			that.absDistX = m.abs(that.distX);
			that.absDistY = m.abs(that.distY);
			return;
		}

		// Lock direction
		if (that.options.lockDirection) {
			if (that.absDistX > that.absDistY+3) {
				newY = that.y;
				deltaY = 0;
			} else if (that.absDistY > that.absDistX+3) {
				newX = that.x;
				deltaX = 0;
			}
		}

		that.moved = true;
		that._pos(newX, newY);
		that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if (e.timeStamp - that.startTime > 300) {
			that.startTime = e.timeStamp;
			that.startX = that.x;
			that.startY = that.y;
		}
	},

	_end: function (e) {
		if (hasTouch && e.touches.length != 0) return;

		var that = this,
			point = hasTouch ? e.changedTouches[0] : e,
			target, ev,
			momentumX = { dist:0, time:0 },
			momentumY = { dist:0, time:0 },
			duration = e.timeStamp - that.startTime,
			newPosX = that.x, newPosY = that.y,
			newDuration,
			snap;

//		that._bind(START_EV);
		that._unbind(MOVE_EV);
		that._unbind(END_EV);
		that._unbind(CANCEL_EV);

		if (that.zoomed) return;

		if (!that.moved) {
			if (hasTouch) {
				if (that.doubleTapTimer && that.options.zoom) {
					// Double tapped
					clearTimeout(that.doubleTapTimer);
					that.doubleTapTimer = null;
					that.zoom(that.pointX, that.pointY, that.scale == 1 ? 2 : 1);
				} else {
					that.doubleTapTimer = setTimeout(function () {
						that.doubleTapTimer = null;

						// Find the last touched element
						target = point.target;
						while (target.nodeType != 1) {
							target = target.parentNode;
						}

						ev = document.createEvent('MouseEvents');
						ev.initMouseEvent('click', true, true, e.view, 1,
							point.screenX, point.screenY, point.clientX, point.clientY,
							e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
							0, null);
						ev._fake = true;
						target.dispatchEvent(ev);
					}, that.options.zoom ? 250 : 0);
				}
			}

			that._resetPos();
			return;
		}

		if (that.pullDownToRefresh && that.contentReady && that.pullDownEl.className.match('flip')) {
			that.pullDownEl.className = 'iScrollPullDown loading';
			that.pullDownLabel.innerText = that.options.pullDownLabel[2];
			that.scroller.style.marginTop = '0';
			that.offsetBottom = 0;
			that.refresh();
			that.contentReady = false;
			that.options.onPullDown();
		}

		if (that.pullUpToRefresh && that.contentReady && that.pullUpEl.className.match('flip')) {
			that.pullUpEl.className = 'iScrollPullUp loading';
			that.pullUpLabel.innerText = that.options.pullUpLabel[2];
			that.scroller.style.marginBottom = '0';
			that.offsetTop = 0;
			that.refresh();
			that.contentReady = false;
			that.options.onPullUp();
		}

		if (duration < 300 && that.options.momentum) {
			momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
			momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

			newPosX = that.x + momentumX.dist;
			newPosY = that.y + momentumY.dist;

 			if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
 			if ((that.y > 0 && newPosY > 0) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
		}

		if (momentumX.dist || momentumY.dist) {
			newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

			// Do we need to snap?
			if (that.options.snap) {
				snap = that._snap(newPosX, newPosY);
				newPosX = snap.x;
				newPosY = snap.y;
				newDuration = m.max(snap.time, newDuration);
			}

/*			if (newPosX > 0 || newPosX < that.maxScrollX || newPosY > 0 || newPosY < that.maxScrollY) {
				// Subtle change of scroller motion
				that.scroller.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.5,1)';
				if (that.hScrollbar) that.hScrollbarIndicator.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.5,1)';
				if (that.vScrollbar) that.vScrollbarIndicator.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.66,0.5,1)';
			}*/

			that.scrollTo(newPosX, newPosY, newDuration);
			return;
		}

		// Do we need to snap?
		if (that.options.snap) {
			snap = that._snap(that.x, that.y);
			if (snap.x != that.x || snap.y != that.y) {
				that.scrollTo(snap.x, snap.y, snap.time);
			}
			return;
		}

		that._resetPos();
	},

	_resetPos: function (time) {
		var that = this,
			resetX = that.x,
			resetY = that.y;

		if (that.x >= 0) resetX = 0;
		else if (that.x < that.maxScrollX) resetX = that.maxScrollX;

		if (that.y >= 0 || that.maxScrollY > 0) resetY = 0;
		else if (that.y < that.maxScrollY) resetY = that.maxScrollY;

		if (resetX == that.x && resetY == that.y) {
			if (that.moved) {
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
				that.moved = false;
			}

			if (that.zoomed) {
				if (that.options.onZoomEnd) that.options.onZoomEnd.call(that);			// Execute custom code on scroll end
				that.zoomed = false;
			}

			if (that.hScrollbar && that.options.hideScrollbar) {
				that.hScrollbarWrapper.style.webkitTransitionDelay = '300ms';
				that.hScrollbarWrapper.style.opacity = '0';
			}
			if (that.vScrollbar && that.options.hideScrollbar) {
				that.vScrollbarWrapper.style.webkitTransitionDelay = '300ms';
				that.vScrollbarWrapper.style.opacity = '0';
			}

			return;
		}

		if (time === undefined) time = 200;

		// Invert ease
		if (time) {
			that.scroller.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.0,0.33,1)';
			if (that.hScrollbar) that.hScrollbarIndicator.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.0,0.33,1)';
			if (that.vScrollbar) that.vScrollbarIndicator.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33,0.0,0.33,1)';
		}

		that.scrollTo(resetX, resetY, time);
	},

	_timedScroll: function (destX, destY, runtime) {
		var that = this,
			startX = that.x, startY = that.y,
			startTime = (new Date).getTime(),
			easeOut;

		that._transitionTime(0);

		if (that.scrollInterval) {
			clearInterval(that.scrollInterval);
			that.scrollInterval = null;
		}

		that.scrollInterval = setInterval(function () {
			var now = (new Date).getTime(),
				newX, newY;

			if (now >= startTime + runtime) {
				clearInterval(that.scrollInterval);
				that.scrollInterval = null;

				that._pos(destX, destY);
				that._transitionEnd();
				return;
			}

			now = (now - startTime) / runtime - 1;
			easeOut = m.sqrt(1 - now * now);
			newX = (destX - startX) * easeOut + startX;
			newY = (destY - startY) * easeOut + startY;
			that._pos(newX, newY);
		}, 20);
	},

	_transitionEnd: function (e) {
		var that = this;

		if (e) e.stopPropagation();

		that._unbind('webkitTransitionEnd');

		that._resetPos(that.returnTime);
		that.returnTime = 0;
	},


	/**
	 *
	 * Gestures
	 *
	 */
	_gestStart: function (e) {
		var that = this;

		that._transitionTime(0);
		that.lastScale = 1;

		if (that.options.onZoomStart) that.options.onZoomStart.call(that);

		that._unbind('gesturestart');
		that._bind('gesturechange');
		that._bind('gestureend');
		that._bind('gesturecancel');
	},

	_gestChange: function (e) {
		var that = this,
			scale = that.scale * e.scale,
			x, y, relScale;

		that.zoomed = true;

		if (scale < that.options.zoomMin) scale = that.options.zoomMin;
		else if (scale > that.options.zoomMax) scale = that.options.zoomMax;

		relScale = scale / that.scale;
		x = that.originX - that.originX * relScale + that.x;
		y = that.originY - that.originY * relScale + that.y;
		that.scroller.style.webkitTransform = trnOpen + x + 'px,' + y + 'px' + trnClose + ' scale(' + scale + ')';
		that.lastScale = relScale;
	},

	_gestEnd: function (e) {
		var that = this,
			scale = that.scale,
			lastScale = that.lastScale;

		that.scale = scale * lastScale;
		if (that.scale < that.options.zoomMin + 0.05) that.scale = that.options.zoomMin;
		else if (that.scale > that.options.zoomMax - 0.05) that.scale = that.options.zoomMax;
		lastScale = that.scale / scale;
		that.x = that.originX - that.originX * lastScale + that.x;
		that.y = that.originY - that.originY * lastScale + that.y;

		that.scroller.style.webkitTransform = trnOpen + that.x + 'px,' + that.y + 'px' + trnClose + ' scale(' + that.scale + ')';

		setTimeout(function () {
			that.refresh();
		}, 0);

		that._bind('gesturestart');
		that._unbind('gesturechange');
		that._unbind('gestureend');
		that._unbind('gesturecancel');
	},

	_wheel: function (e) {
		var that = this,
			deltaX = that.x + e.wheelDeltaX / 12,
			deltaY = that.y + e.wheelDeltaY / 12;

		if (deltaX > 0) deltaX = 0;
		else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

		if (deltaY > 0) deltaY = 0;
		else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;

		that.scrollTo(deltaX, deltaY, 0);
	},


	/**
	 *
	 * Utilities
	 *
	 */
	_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
		var that = this,
			deceleration = 0.0006,
			speed = m.abs(dist) / time,
			newDist = (speed * speed) / (2 * deceleration),
			newTime = 0, outsideDist = 0;

		// Proportinally reduce speed if we are outside of the boundaries
		if (dist > 0 && newDist > maxDistUpper) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistUpper = maxDistUpper + outsideDist;
			that.returnTime = 800 / size * outsideDist + 100;
			speed = speed * maxDistUpper / newDist;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistLower = maxDistLower + outsideDist;
			that.returnTime = 800 / size * outsideDist + 100;
			speed = speed * maxDistLower / newDist;
			newDist = maxDistLower;
		}

		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: newDist, time: m.round(newTime) };
	},

	_offset: function (el, tree) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		if (!tree) return { x: left, y: top };

		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}

		return { x: left, y: top };
	},

	_snap: function (x, y) {
		var that = this,
			i, l,
			page, time,
			sizeX, sizeY;

		// Check page X
		page = that.pagesX.length-1;
		for (i=0, l=that.pagesX.length; i<l; i++) {
			if (x >= that.pagesX[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageX && page > 0 && that.dirX < 0) page--;
		x = that.pagesX[page];
		sizeX = m.abs(x - that.pagesX[that.currPageX]);
		sizeX = sizeX ? m.abs(that.x - x) / sizeX * 500 : 0;
		that.currPageX = page;

		// Check page Y
		page = that.pagesY.length-1;
		for (i=0; i<page; i++) {
			if (y >= that.pagesY[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageY && page > 0 && that.dirY < 0) page--;
		y = that.pagesY[page];
		sizeY = m.abs(y - that.pagesY[that.currPageY]);
		sizeY = sizeY ? m.abs(that.y - y) / sizeY * 500 : 0;
		that.currPageY = page;

		// Snap with constant speed (proportional duration)
		time = m.round(m.max(sizeX, sizeY)) || 200;

		return { x: x, y: y, time: time };
	},

	_bind: function (type, el) {
		(el || this.scroller).addEventListener(type, this, false);
	},

	_unbind: function (type, el) {
		(el || this.scroller).removeEventListener(type, this, false);
	},


	/**
	 *
	 * Public methods
	 *
	 */
	destroy: function () {
		var that = this;

		if (that.options.checkDOMChange) clearTimeout(that.DOMChangeInterval);

		// Remove pull to refresh
		if (that.pullDownToRefresh) {
			that.pullDownEl.parentNode.removeChild(that.pullDownEl);
		}
		if (that.pullUpToRefresh) {
			that.pullUpEl.parentNode.removeChild(that.pullUpEl);
		}

		// Remove the scrollbars
		that.hScrollbar = false;
		that.vScrollbar = false;
		that._scrollbar('h');
		that._scrollbar('v');

		// Free some mem
		that.scroller.style.webkitTransform = '';

		// Remove the event listeners
		that._unbind('webkitTransitionEnd');
		that._unbind(RESIZE_EV);
		that._unbind(START_EV);
		that._unbind(MOVE_EV);
		that._unbind(END_EV);
		that._unbind(CANCEL_EV);

		if (that.options.zoom) {
			that._unbind('gesturestart');
			that._unbind('gesturechange');
			that._unbind('gestureend');
			that._unbind('gesturecancel');
		}
	},

	refresh: function () {
		var that = this,
			pos = 0, page = 0,
			i, l, els,
			oldHeight, offsets,
			loading;

		if (that.pullDownToRefresh) {
			loading = that.pullDownEl.className.match('loading');
			if (loading && !that.contentReady) {
				oldHeight = that.scrollerH;
				that.contentReady = true;
				that.pullDownEl.className = 'iScrollPullDown';
				that.pullDownLabel.innerText = that.options.pullDownLabel[0];
				that.offsetBottom = that.pullDownEl.offsetHeight;
				that.scroller.style.marginTop = -that.offsetBottom + 'px';
			} else if (!loading) {
				that.offsetBottom = that.pullDownEl.offsetHeight;
				that.scroller.style.marginTop = -that.offsetBottom + 'px';
			}
		}

		if (that.pullUpToRefresh) {
			loading = that.pullUpEl.className.match('loading');
			if (loading && !that.contentReady) {
				oldHeight = that.scrollerH;
				that.contentReady = true;
				that.pullUpEl.className = 'iScrollPullUp';
				that.pullUpLabel.innerText = that.options.pullUpLabel[0];
				that.offsetTop = that.pullUpEl.offsetHeight;
				that.scroller.style.marginBottom = -that.offsetTop + 'px';
			} else if (!loading) {
				that.offsetTop = that.pullUpEl.offsetHeight;
				that.scroller.style.marginBottom = -that.offsetTop + 'px';
			}
		}

		that.wrapperW = that.wrapper.clientWidth;
		that.wrapperH = that.wrapper.clientHeight;

    if (!that.wrapperW || !that.wrapperH) {
      // Bail out - the wrapper has no size and that will screw up
      // calculations. Best way to handle this?
      return false;
    }

		that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
		that.scrollerH = m.round((that.scroller.offsetHeight - that.offsetBottom - that.offsetTop) * that.scale);
		that.maxScrollX = that.wrapperW - that.scrollerW;
		that.maxScrollY = that.wrapperH - that.scrollerH;
		that.dirX = 0;
		that.dirY = 0;

		that._transitionTime(0);

		that.hScroll = that.options.hScroll && that.maxScrollX < 0;
		that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);
		that.hScrollbar = that.hScroll && that.options.hScrollbar;
		that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

		// Prepare the scrollbars
		that._scrollbar('h');
		that._scrollbar('v');

		// Snap
		if (typeof that.options.snap == 'string') {
			that.pagesX = [];
			that.pagesY = [];
			els = that.scroller.querySelectorAll(that.options.snap);
			for (i=0, l=els.length; i<l; i++) {
				pos = that._offset(els[i]);
				that.pagesX[i] = pos.x < that.maxScrollX ? that.maxScrollX : pos.x * that.scale;
				that.pagesY[i] = pos.y < that.maxScrollY ? that.maxScrollY : pos.y * that.scale;
			}
		} else if (that.options.snap) {
			that.pagesX = [];
			while (pos >= that.maxScrollX) {
				that.pagesX[page] = pos;
				pos = pos - that.wrapperW;
				page++;
			}
			if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

			pos = 0;
			page = 0;
			that.pagesY = [];
			while (pos >= that.maxScrollY) {
				that.pagesY[page] = pos;
				pos = pos - that.wrapperH;
				page++;
			}
			if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
		}

		// Recalculate wrapper offsets
		if (that.options.zoom) {
			offsets = that._offset(that.wrapper, true);
			that.wrapperOffsetLeft = -offsets.x;
			that.wrapperOffsetTop = -offsets.y;
		}

		if (oldHeight && that.y == 0) {
			oldHeight = oldHeight - that.scrollerH + that.y;
			that.scrollTo(0, oldHeight, 0);
		}

		that._resetPos();
	},

	scrollTo: function (x, y, time, relative) {
		var that = this;

		if (relative) {
			x = that.x - x;
			y = that.y - y;
		}

		time = !time || (m.round(that.x) == m.round(x) && m.round(that.y) == m.round(y)) ? 0 : time;

		that.moved = true;

		if (!that.options.HWTransition) {
			that._timedScroll(x, y, time);
			return;
		}

		if (time) that._bind('webkitTransitionEnd');
		that._transitionTime(time);
		that._pos(x, y);
		if (!time) setTimeout(function () { that._transitionEnd(); }, 0);
	},

	scrollToElement: function (el, time) {
		var that = this, pos;
		el = el.nodeType ? el : that.scroller.querySelector(el);
		if (!el) return;

		pos = that._offset(el);
		pos.x = pos.x > 0 ? 0 : pos.x < that.maxScrollX ? that.maxScrollX : pos.x;
		pos.y = pos.y > 0 ? 0 : pos.y < that.maxScrollY ? that.maxScrollY : pos.y;
		time = time === undefined ? m.max(m.abs(pos.x)*2, m.abs(pos.y)*2) : time;

		that.scrollTo(pos.x, pos.y, time);
	},

	scrollToPage: function (pageX, pageY, time) {
		var that = this, x, y;

		if (that.options.snap) {
			pageX = pageX == 'next' ? that.currPageX+1 : pageX == 'prev' ? that.currPageX-1 : pageX;
			pageY = pageY == 'next' ? that.currPageY+1 : pageY == 'prev' ? that.currPageY-1 : pageY;

			pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
			pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

			that.currPageX = pageX;
			that.currPageY = pageY;
			x = that.pagesX[pageX];
			y = that.pagesY[pageY];
		} else {
			x = -that.wrapperW * pageX;
			y = -that.wrapperH * pageY;
			if (x < that.maxScrollX) x = that.maxScrollX;
			if (y < that.maxScrollY) y = that.maxScrollY;
		}

		that.scrollTo(x, y, time || 400);
	},

	zoom: function (x, y, scale, transitionTime) {
		var that = this,
			relScale = scale / that.scale;

		x = x - that.wrapperOffsetLeft - that.x;
		y = y - that.wrapperOffsetTop - that.y;
		that.x = x - x * relScale + that.x;
		that.y = y - y * relScale + that.y;

		that.scale = scale;

		if (that.options.onZoomStart) that.options.onZoomStart.call(that);

		that.refresh();

		that._bind('webkitTransitionEnd');
		that._transitionTime(transitionTime !== null ? transitionTime : 200);

		setTimeout(function () {
			that.zoomed = true;
			that.scroller.style.webkitTransform = trnOpen + that.x + 'px,' + that.y + 'px' + trnClose + ' scale(' + scale + ')';
		}, 0);
	}
};


var has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
	hasTouch = 'ontouchstart' in window,
	hasGesture = 'ongesturestart' in window,
//	hasHashChange = 'onhashchange' in window,
//	hasTransitionEnd = 'onwebkittransitionend' in window,
	hasCompositing = 'WebKitTransitionEvent' in window,
	isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
	isAndroid = (/android/gi).test(navigator.appVersion),
	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	START_EV = hasTouch ? 'touchstart' : 'mousedown',
	MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
	END_EV = hasTouch ? 'touchend' : 'mouseup',
	CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
	trnOpen = 'translate' + (has3d ? '3d(' : '('),
	trnClose = has3d ? ',0)' : ')',
	m = Math;

if (typeof exports !== 'undefined') exports.iScroll = iScroll;
else window.iScroll = iScroll;

})();

}

if(!dojo._hasResource['mulberry.ui.Scrollable']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.ui.Scrollable'] = true;
dojo.provide('mulberry.ui.Scrollable');




dojo.declare('mulberry.ui.Scrollable', dijit._Widget, {
  postCreate : function() {
    this.inherited(arguments);

    this.subscribe('/page/transition/end', '_makeScroller');
    this.subscribe('/window/resize', 'refreshScroller');
    this.subscribe('/fontsize', 'refreshScroller');
    this.subscribe('/content/update', function() {
      this.refreshScroller();
      if (this.scroller) {
        this.scroller.scrollTo(0, 0);
      }
    });

    dojo.addClass(this.domNode, 'scrollable');
  },

  _makeScroller : function() {
    if (this.domNode.children.length > 1) {
      console.error('mulberry.ui.Scrollable::_makeScroller: More than one child element. Only the first one will be scrollable. Probably not what you want!');
    }

    this.scroller = new iScroll(this.domNode, {
      vScrollbar: false,
      onScrollStart : dojo.hitch(this, 'onScrollStart'),
      onScrollEnd : dojo.hitch(this, 'onScrollEnd')
    });

    this.scroller.refresh();
  },

  makeScroller : function() {
    if (!this.scroller) {
      this._makeScroller();
    }
  },

  destroy : function() {
    if (this.scroller) {
      this.scroller.destroy();
    }
    this.inherited(arguments);
  },

  refreshScroller : function() {
    if (this.scroller) {
      this.scroller.refresh();
    }
  },

  onScrollStart : function() {

  },

  onScrollEnd : function() {

  }
});


}

if(!dojo._hasResource['mulberry.ui.Clickable']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.ui.Clickable'] = true;
dojo.provide('mulberry.ui.Clickable');

/**
 * This is intended for internal use only by mulberry._View
 */
dojo.declare('mulberry.ui.Clickable', null, {
  constructor : function(el, handler) {
    this.connections = [];
    this.secondaryConnections = [];
    this.subscriptions = [];
    this.handler = handler;
    this.el = el;
    this.moved = false;

    dojo.addClass(this.el, 'not-moving');

    if (mulberry.app.UI.hasTouch) {
      this.connections.push(dojo.connect(el, 'touchstart', this, '_onTouchStart'));
      this.connections.push(dojo.connect(el, 'click', function(e) {
        e.preventDefault();
      }));
    } else {
      this.connections.push(dojo.connect(el, 'click', this, '_handle'));
    }
  },

  _onTouchStart : function() {
    this.touchStartTime = new Date().getTime();

    this.secondaryConnections = [
      dojo.connect(this.el, 'touchmove', this, '_onTouchMove'),
      dojo.connect(this.el, 'touchend', this, '_handle')
    ];
  },

  _onTouchMove : function() {
    dojo.removeClass(this.el, 'not-moving');
    this.moved = true;
  },

  _handle: function(e) {
    this.touchEndTime = new Date().getTime();

    dojo.addClass(this.el, 'not-moving');

    dojo.forEach(this.secondaryConnections || [], dojo.disconnect);
    this.secondaryConnections = [];

    if (mulberry.animating) {
      e.preventDefault();
      console.log('click ignored during animation');
      return;
    }

    var trueTarget = e.target,
        href = dojo.attr(trueTarget, 'href');

    if (this.touchStartTime && (this.touchEndTime - this.touchStartTime > mulberry.app.UI.touchMoveDebounce) && this.moved) {
      this.moved = false;
      return;
    }

    while (!href && trueTarget !== this.el) {
      href = dojo.attr(trueTarget, 'href');
      if (!href) { trueTarget = trueTarget.parentNode; }
    }

    if (!href) { return; }

    // run the handler function
    if (this.handler && dojo.isFunction(this.handler) && this.handler(trueTarget, e) === false) {
      return;
    }

    // we only get to here if the handler function did not return false;
    // this is the default behavior we're going to want most of the time
    if (!/#/.test(href)) {
      return;
    }

    href = href.split('#')[1];

    if (href) {
      e.preventDefault();
      e.stopPropagation();
      mulberry.app.Router.go(href);
    }
  },

  destroy : function() {
    dojo.forEach(this.connections || [], dojo.disconnect);
    dojo.forEach(this.secondaryConnections || [], dojo.disconnect);
    dojo.forEach(this.subscriptions || [], dojo.unsubscribe);
  }
});

}

if(!dojo._hasResource['vendor.mustache']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['vendor.mustache'] = true;
dojo.provide('vendor.mustache');

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */
var Mustache = (typeof module !== "undefined" && module.exports) || {};

(function (exports) {

  exports.name = "mustache.js";
  exports.version = "0.5.0-dev";
  exports.tags = ["{{", "}}"];
  exports.parse = parse;
  exports.compile = compile;
  exports.render = render;
  exports.clearCache = clearCache;

  exports.to_html = render; // keep backwards compatibility

  var _toString = Object.prototype.toString;
  var _isArray = Array.isArray;
  var _forEach = Array.prototype.forEach;
  var _trim = String.prototype.trim;

  var isArray;
  if (_isArray) {
    isArray = _isArray;
  } else {
    isArray = function (obj) {
      return _toString.call(obj) === "[object Array]";
    };
  }

  var forEach;
  if (_forEach) {
    forEach = function (obj, callback, scope) {
      return _forEach.call(obj, callback, scope);
    };
  } else {
    forEach = function (obj, callback, scope) {
      for (var i = 0, len = obj.length; i < len; ++i) {
        callback.call(scope, obj[i], i, obj);
      }
    };
  }

  var spaceRe = /^\s*$/;

  function isWhitespace(string) {
    return spaceRe.test(string);
  }

  var trim;
  if (_trim) {
    trim = function (string) {
      return string == null ? "" : _trim.call(string);
    };
  } else {
    var trimLeft, trimRight;

    if (isWhitespace("\xA0")) {
      trimLeft = /^\s+/;
      trimRight = /\s+$/;
    } else {
      // IE doesn't match non-breaking spaces with \s, thanks jQuery.
      trimLeft = /^[\s\xA0]+/;
      trimRight = /[\s\xA0]+$/;
    }

    trim = function (string) {
      return string == null ? "" :
        String(string).replace(trimLeft, "").replace(trimRight, "");
    };
  }

  var escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;'
  };

  function escapeHTML(string) {
    return String(string).replace(/&(?!\w+;)|[<>"']/g, function (s) {
      return escapeMap[s] || s;
    });
  }

  /**
   * Adds the `template`, `line`, and `file` properties to the given error
   * object and alters the message to provide more useful debugging information.
   */
  function debug(e, template, line, file) {
    file = file || "<template>";

    var lines = template.split("\n"),
        start = Math.max(line - 3, 0),
        end = Math.min(lines.length, line + 3),
        context = lines.slice(start, end);

    var c;
    for (var i = 0, len = context.length; i < len; ++i) {
      c = i + start + 1;
      context[i] = (c === line ? " >> " : "    ") + context[i];
    }

    e.template = template;
    e.line = line;
    e.file = file;
    e.message = [file + ":" + line, context.join("\n"), "", e.message].join("\n");

    return e;
  }

  /**
   * Looks up the value of the given `name` in the given context `stack`.
   */
  function findName(name, stack, returnNull) {
    if (name === ".") {
      return stack[stack.length - 1];
    }

    var names = name.split(".");
    var lastIndex = names.length - 1;
    var target = names[lastIndex];

    var value, context, i = stack.length, j, localStack;
    while (i) {
      localStack = stack.slice(0);
      context = stack[--i];

      j = 0;
      while (j < lastIndex) {
        context = context[names[j++]];

        if (context == null) {
          break;
        }

        localStack.push(context);
      }

      if (context && target in context) {
        value = context[target];
        break;
      }
    }

    // If the value is a function, call it in the current context.
    if (typeof value === "function") {
      value = value.call(localStack[localStack.length - 1]);
    }

    if (value == null && !returnNull)  {
      return "";
    }

    return value;
  }

  function sendSection(send, name, callback, stack, inverted) {
    var value =  findName(name, stack, true);

    if (inverted) {
      // From the spec: inverted sections may render text once based on the
      // inverse value of the key. That is, they will be rendered if the key
      // doesn't exist, is false, or is an empty list.
      if (value == null || value === false || (isArray(value) && value.length === 0)) {
        send(callback());
      }
    } else if (isArray(value)) {
      forEach(value, function (value) {
        stack.push(value);
        send(callback());
        stack.pop();
      });
    } else if (typeof value === "object") {
      stack.push(value);
      send(callback());
      stack.pop();
    } else if (typeof value === "function") {
      var scope = stack[stack.length - 1];
      var scopedRender = function (template) {
        return render(template, scope);
      };
      send(value.call(scope, callback(), scopedRender) || "");
    } else if (value) {
      send(callback());
    }
  }

  /**
   * Parses the given `template` and returns the source of a function that,
   * with the proper arguments, will render the template. Recognized options
   * include the following:
   *
   *   - file     The name of the file the template comes from (displayed in
   *              error messages)
   *   - tags     An array of open and close tags the `template` uses. Defaults
   *              to the value of Mustache.tags
   *   - debug    Set `true` to log the body of the generated function to the
   *              console
   *   - space    Set `true` to preserve whitespace from lines that otherwise
   *              contain only a {{tag}}. Defaults to `false`
   */
  function parse(template, options) {
    options = options || {};

    var tags = options.tags || exports.tags,
        openTag = tags[0],
        closeTag = tags[tags.length - 1];

    var code = [
      "var line = 1;", // keep track of source line number
      "\ntry {",
      '\nsend("'
    ];

    var spaces = [],      // indices of whitespace in code on the current line
        hasTag = false,   // is there a {{tag}} on the current line?
        nonSpace = false; // is there a non-space char on the current line?

    // Strips all space characters from the code array for the current line
    // if there was a {{tag}} on it and otherwise only spaces.
    var stripSpace = function () {
      if (hasTag && !nonSpace && !options.space) {
        while (spaces.length) {
          code.splice(spaces.pop(), 1);
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    };

    var sectionStack = [], updateLine, nextOpenTag, nextCloseTag;

    var setTags = function (source) {
      tags = trim(source).split(/\s+/);
      nextOpenTag = tags[0];
      nextCloseTag = tags[tags.length - 1];
    };

    var includePartial = function (source) {
      code.push(
        '");',
        updateLine,
        '\nvar partial = partials["' + trim(source) + '"];',
        '\nif (partial) {',
        '\n  send(render(partial, stack[stack.length - 1], partials));',
        '\n}',
        '\nsend("'
      );
    };

    var openSection = function (source, inverted) {
      var name = trim(source);

      if (name === "") {
        throw debug(new Error("Section name may not be empty"), template, line, options.file);
      }

      sectionStack.push({name: name, inverted: inverted});

      code.push(
        '");',
        updateLine,
        '\nvar name = "' + name + '";',
        '\nvar callback = (function () {',
        '\n  var buffer, send = function (chunk) { buffer.push(chunk); };',
        '\n  return function () {',
        '\n    buffer = [];',
        '\nsend("'
      );
    };

    var openInvertedSection = function (source) {
      openSection(source, true);
    };

    var closeSection = function (source) {
      var name = trim(source);
      var openName = sectionStack.length != 0 && sectionStack[sectionStack.length - 1].name;

      if (!openName || name != openName) {
        throw debug(new Error('Section named "' + name + '" was never opened'), template, line, file);
      }

      var section = sectionStack.pop();

      code.push(
        '");',
        '\n    return buffer.join("");',
        '\n  };',
        '\n})();'
      );

      if (section.inverted) {
        code.push("\nsendSection(send,name,callback,stack,true);");
      } else {
        code.push("\nsendSection(send,name,callback,stack);");
      }

      code.push('\nsend("');
    };

    var sendPlain = function (source) {
      code.push(
        '");',
        updateLine,
        '\nsend(findName("' + trim(source) + '", stack));',
        '\nsend("'
      );
    };

    var sendEscaped = function (source) {
      code.push(
        '");',
        updateLine,
        '\nsend(escapeHTML(findName("' + trim(source) + '", stack)));',
        '\nsend("'
      );
    };

    var line = 1, c, callback;
    for (var i = 0, len = template.length; i < len; ++i) {
      if (template.slice(i, i + openTag.length) === openTag) {
        i += openTag.length;
        c = template.substr(i, 1);
        updateLine = '\nline = ' + line + ';';
        nextOpenTag = openTag;
        nextCloseTag = closeTag;
        hasTag = true;

        switch (c) {
        case "!": // comment
          i++;
          callback = null;
          break;
        case "=": // change open/close tags, e.g. {{=<% %>=}}
          i++;
          closeTag = "=" + closeTag;
          callback = setTags;
          break;
        case ">": // include partial
          i++;
          callback = includePartial;
          break;
        case "#": // start section
          i++;
          callback = openSection;
          break;
        case "^": // start inverted section
          i++;
          callback = openInvertedSection;
          break;
        case "/": // end section
          i++;
          callback = closeSection;
          break;
        case "{": // plain variable
          closeTag = "}" + closeTag;
          // fall through
        case "&": // plain variable
          i++;
          nonSpace = true;
          callback = sendPlain;
          break;
        default: // escaped variable
          nonSpace = true;
          callback = sendEscaped;
        }

        var end = template.indexOf(closeTag, i);

        if (end === -1) {
          throw debug(new Error('Tag "' + openTag + '" was not closed properly'), template, line, options.file);
        }

        var source = template.substring(i, end);

        if (callback) {
          callback(source);
        }

        // Maintain line count for \n in source.
        var n = 0;
        while (~(n = source.indexOf("\n", n))) {
          line++;
          n++;
        }

        i = end + closeTag.length - 1;
        openTag = nextOpenTag;
        closeTag = nextCloseTag;
      } else {
        c = template.substr(i, 1);

        switch (c) {
        case '"':
        case "\\":
          nonSpace = true;
          code.push("\\" + c);
          break;
        case "\n":
          spaces.push(code.length);
          code.push("\\n");
          stripSpace(); // Check for whitespace on the current line.
          line++;
          break;
        default:
          if (isWhitespace(c)) {
            spaces.push(code.length);
          } else {
            nonSpace = true;
          }

          code.push(c);
        }
      }
    }

    if (sectionStack.length != 0) {
      throw debug(new Error('Section "' + sectionStack[sectionStack.length - 1].name + '" was not closed properly'), template, line, options.file);
    }

    // Clean up any whitespace from a closing {{tag}} that was at the end
    // of the template without a trailing \n.
    stripSpace();

    code.push(
      '");',
      "\nsend(null);", // Send null as the last operation.
      "\n} catch (e) { throw {error: e, line: line}; }"
    );

    // Ignore empty send("") statements.
    var body = code.join("").replace(/send\(""\);\n/g, "");

    if (options.debug) {
      if (typeof console != "undefined" && console.log) {
        console.log(body);
      } else if (typeof print === "function") {
        print(body);
      }
    }

    return body;
  }

  /**
   * Used by `compile` to generate a reusable function for the given `template`.
   */
  function _compile(template, options) {
    var args = "view,partials,send,stack,findName,escapeHTML,sendSection,render";
    var body = parse(template, options);
    var fn = new Function(args, body);

    // This anonymous function wraps the generated function so we can do
    // argument coercion, setup some variables, and handle any errors
    // encountered while executing it.
    return function (view, partials, callback) {
      if (typeof partials === "function") {
        callback = partials;
        partials = {};
      }

      partials = partials || {};

      var buffer = []; // output buffer

      var send = callback || function (chunk) {
        buffer.push(chunk);
      };

      var stack = [view]; // context stack

      try {
        fn(view, partials, send, stack, findName, escapeHTML, sendSection, render);
      } catch (e) {
        throw debug(e.error, template, e.line, options.file);
      }

      return buffer.join("");
    };
  }

  // Cache of pre-compiled templates.
  var _cache = {};

  /**
   * Clear the cache of compiled templates.
   */
  function clearCache() {
    _cache = {};
  }

  /**
   * Compiles the given `template` into a reusable function using the given
   * `options`. In addition to the options accepted by Mustache.parse,
   * recognized options include the following:
   *
   *   - cache    Set `false` to bypass any pre-compiled version of the given
   *              template. Otherwise, a given `template` string will be cached
   *              the first time it is parsed
   */
  function compile(template, options) {
    options = options || {};

    // Use a pre-compiled version from the cache if we have one.
    if (options.cache !== false) {
      if (!_cache[template]) {
        _cache[template] = _compile(template, options);
      }

      return _cache[template];
    }

    return _compile(template, options);
  }

  /**
   * High-level function that renders the given `template` using the given
   * `view`, `partials`, and `callback`. The `callback` is used to return the
   * output piece by piece, as it is rendered. When finished, the callback will
   * receive `null` as its argument, after which it will not be called any more.
   * If no callback is given, the complete rendered template will be used as the
   * return value for the function.
   *
   * Note: If no partials are needed, the third argument may be the callback.
   * If you need to use any of the template options (see `compile` above), you
   * must compile in a separate step, and then call that compiled function.
   */
  function render(template, view, partials, callback) {
    return compile(template)(view, partials, callback);
  }

})(Mustache);

}

if(!dojo._hasResource['mulberry._View']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry._View'] = true;
/*jslint evil:true */
dojo.provide('mulberry._View');

/*
 * The base view class, to be inherited by all views.
 */











(function() {

var _tmplCache = {},
    templateStringTests = {
      'haml' : {
        firstChars : [ '.', '%' ],
        tmplFn : Haml
      },

      'mustache' : {
        firstChars : [ '{', '<' ],
        tmplFn : function(tmpl) {
          return dojo.partial(Mustache.render, tmpl);
        }
      }
    };

dojo.declare('mulberry._View', [ dijit._Widget, dijit._Templated, mulberry._Nls ], {
  templateString : '%div',
  isHidden : false,
  isDisabled : false,

  postMixInProperties : function() {
    // make sure the device info is available
    this.inherited(arguments);

    if (!this.device) {
      this.device = mulberry.Device;
    }

    this.phone = this.device.type === 'phone';
    this.tablet = this.device.type === 'tablet';
  },

  _skipNodeCache : true,

  _stringRepl : function(tmpl) {
    var t = _tmplCache[tmpl];

    if (!t) {
      dojo.forIn(templateStringTests, function(lang, settings) {
        if (t) { return; }
        if (dojo.indexOf(settings.firstChars, tmpl[0]) > -1) {
          t = _tmplCache[tmpl] = settings.tmplFn(tmpl);
        }
      });
    }

    return t(this);
  },

  postCreate : function() {
    this.inherited(arguments);
  },

  /**
   * Reference for the following methods is at http://higginsforpresident.net/2010/01/widgets-within-widgets/
   */
  adopt: function(/* Function */cls, /* Object? */props, /* DomNode */node){
      // summary: Instantiate some new item from a passed Class, with props with an optional srcNode (node)
      //  reference. Also tracks this widget as if it were a child to be destroyed when this parent widget
      //  is removed.
      //
      // cls: Function
      //      The class to instantiate. Cannot be a string. Use dojo.getObject to get a full class object if you
      //      must.
      //
      // props: Object?
      //      An optional object mixed into the constructor of said cls.
      //
      // node: DomNode?
      //      An optional srcNodeRef to use with dijit._Widget. This thinger will be instantiated using
      //      this passed node as the target if passed. Otherwise a new node is created and you must placeAt() your
      //      instance somewhere in the dom for it to be useful.
      //
      // example:
      //  |    this.adopt(my.ui.Button, { onClick: function(){} }).placeAt(this.domNode);
      //
      // example:
      //  |   var x = this.adopt(my.ui.Button).placeAt(this.domNode);
      //  |   x.connect(this.domNode, "onclick", "fooBar");
      //
      //  example:
      //  If you *must* new up a thinger and only want to adopt it once, use _addItem instead:
      //  |   var t;
      //  |   if(4 > 5){ t = new my.ui.Button(); }else{ t = new my.ui.OtherButton() }
      //  |   this._addItem(t);

      var x = new cls(props, node);
      this._addItem(x);
      return x; // my.Widget
  },

  _addItem: function(/* dijit._Widget... */){
      // summary: Add any number of programatically created children to this instance for later cleanup.
      // private, use `adopt` directly.
      this._addedItems = this._addedItems || [];
      this._addedItems.push.apply(this._addedItems, arguments);
  },

  orphan: function(/* dijit._Widget */widget, /* Boolean? */destroy){
      // summary: remove a single item from this instance when we destroy it. It is the parent widget's job
      // to properly destroy an orphaned child.
      //
      // widget:
      //      A widget reference to remove from this parent.
      //
      // destroy:
      //      An optional boolean used to force immediate destruction of the child. Pass any truthy value here
      //      and the child will be orphaned and killed.
      //
      // example:
      //  Clear out all the children in an array, but do not destroy them.
      //  |   dojo.forEach(this._thumbs, this.orphan, this);
      //
      // example:
      //  Create and destroy a button cleanly:
      //  |   var x = this.adopt(my.ui.Button, {});
      //  |   this.orphan(x, true);
      //
      this._addedItems = this._addedItems || [];
      var i = dojo.indexOf(this._addedItems, widget);

      if (i >= 0) {
        this._addedItems.splice(i, 1);
      }

      if (destroy) {
        this._kill(widget);
      }
  },

  _kill: function(w){
      // summary: Private helper function to properly destroy a widget instance.
      if (w && w.destroyRecursive) {
          w.destroyRecursive();
      } else if (w && w.destroy) {
          w.destroy();
      }
  },

  query : function(sel) {
    var nl, result;

    if (!sel) {
      return new dojo.NodeList(this.domNode);
    } else {
      result = this.domNode.querySelectorAll(sel);
      nl = new dojo.NodeList();

      dojo.forEach(result, function(n) {
        nl.push(n);
      });
    }

    return nl;
  },


  preventClickDelay : function(el, handler) {
    this.clickables = this.clickables || [];

    this.clickables.push(
      new mulberry.ui.Clickable(el, dojo.hitch(this, handler))
    );
  },

  destroy: function(){
    // override the default destroy function to account
    // for programatically added children.
    dojo.forEach(this._addedItems, this._kill);

    // destroy scrollers

    // this would no longer be needed
    dojo.forEach(this.scrollerHandles || [], function(handle) {
      handle.destroy();
    });

    // destroy clickables
    dojo.forEach(this.clickables || [], function(c) {
      c.destroy();
    });

    this.inherited(arguments);
  },

  addClass : function(className) {
    dojo.addClass(this.domNode, className);
  },

  removeClass : function(className) {
    dojo.removeClass(this.domNode, className);
  },

  /**
   * @public
   * Shows the view if it's hidden.   It removes the `hidden` class from the
   * `_View`'s root element. By default `hidden` has a style of `display:
   * none`. If you need some other style (opacity, transitions, transfors)
   * override `hidden` for your `_View`.
   *
   * If passed a dom element as an argument, it shows that element instead.
   *
   * @param {DomElement} [domNode] The domNode you want to show (optional)
   **/
  show : function(domNode) {
    if (domNode && domNode.nodeName) {
      dojo.removeClass(domNode, 'hidden');
      return;
    }

    this.removeClass('hidden');
    this.isHidden = false;
  },

  /**
   * @public
   * Hides the view if it's currrently visible. By default, it adds the
   * `hidden` class from the `_View`'s root element. For explanation of how to
   * customize this @see `mulberry._View#show`.
   *
   * If passed a dom element as an argument, it hides that element instead.
   *
   * @param {DomElement} [domNode] The domNode you want to hide (optional)
   **/
  hide : function(domNode) {
    if (domNode && domNode.nodeName) {
      dojo.addClass(domNode, 'hidden');
      return;
    }

    this.addClass('hidden');
    this.isHidden = true;
  },

  /**
   * @public
   * Toggles the hidden state of the `_View`.
   * TODO: should be rerenamed toggleVisibility, or something that indicates
   * *what* it's toggling.
   **/
  toggle : function(domNode) {
    if (domNode) {
      dojo.toggleClass(domNode, 'hidden');
      return;
    }

    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  },

  enable : function() {
    this.removeClass('disabled');
    this.isDisabled = false;
  },

  disable : function() {
    this.addClass('disabled');
    this.isDisabled = true;
  }

});

}());

}

if(!dojo._hasResource['mulberry.containers.Viewport']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.containers.Viewport'] = true;
dojo.provide('mulberry.containers.Viewport');




dojo.declare('mulberry.containers.Viewport', mulberry._View, {
  templateString : dojo.cache("mulberry.containers", "Viewport/Viewport.haml", "%ol.viewport\n"),

  direction : 'next',

  postCreate : function() {
    this.connect(this.domNode, 'webkitAnimationEnd', '_onAnimationEnd');
  },

  _setNavDirectionAttr : function(dir) {
    this.direction = dir === 'back' ? 'prev' : 'next';
  },

  _setContentAttr : function(newPage) {
    if (mulberry.animating) { return; }

    var n = this.domNode,
        next = this.direction === 'next';

    this.direction = 'next'; // reset
    this.currentPage = newPage;

    if (n.children.length) {
      mulberry.animating = true;
      this.addClass('pre-slide');
      newPage.placeAt(n, next ? 'last' : 'first');
      this.addClass(next ? 'slide-left' : 'slide-right');
    } else {
      newPage.placeAt(n, 'last');
      this._onAnimationEnd();
    }

    setTimeout(function() {
      // sometimes webkitAnimationEnd doesn't fire :/
      if (this.animating) {
        this._onAnimationEnd();
      }
    }, 600);
  },

  _cleanupOldPage : function() {
    var pages = document.querySelectorAll('ol.viewport > li');

    dojo.forEach(pages, function(page) {
      if (this.currentPage.domNode !== page) {
        dojo.destroy(page);

        var widget = dijit.byNode(page);

        if (widget) { widget.destroy(); }
      }
    }, this);

    this.removeClass(['slide-left', 'slide-right', 'pre-slide']);
  },

  _onAnimationEnd : function() {
    this._cleanupOldPage();
    mulberry.animating = false;
    dojo.publish('/page/transition/end');
  }
});

}

if(!dojo._hasResource['mulberry.containers.Persistent']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.containers.Persistent'] = true;
dojo.provide('mulberry.containers.Persistent');



dojo.declare('mulberry.containers.Persistent', mulberry._View, {
  templateString : dojo.cache("mulberry.containers", "Persistent/Persistent.haml", ".container.persistent\n")
});

}

if(!dojo._hasResource['mulberry.app.UI']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.UI'] = true;
dojo.provide('mulberry.app.UI');











dojo.declare('mulberry.app.UI', dojo.Stateful, {
  containers : {},
  currentPage : null,

  constructor : function(device) {
    this.device = device;
    this.body = dojo.body();
    this.hasTouch = 'ontouchstart' in window;
    this.touchMoveDebounce = device.os === 'android' ? 200 : 0;

    this._containersSetup();

    this._watchers();
    this._updateViewport();

    this._uiSetup();
    this._eventSetup();
  },

  addPersistentComponent : function(klass, opts) {
    var pc = this.containers.persistent;
    return pc.adopt(klass, opts || {}).placeAt(pc.domNode, 'last');
  },

  _watchers : function() {
    var watchers = {
      fontSize : function(k, oldSize, newSize) {
        var b = this.body;
        if (oldSize) { dojo.removeClass(b, oldSize); }
        dojo.addClass(b, newSize);
        mulberry.app.DeviceStorage.set('fontSize', newSize);
        dojo.publish('/fontsize');
      },

      navDirection : function(k, old, dir) {
        this.containers.viewport.set('navDirection', dir);
      }
    };

    dojo.forIn(watchers, this.watch, this);
  },

  _updateViewport : function() {
    this.viewport = {
      width : this.body.offsetWidth,
      height : this.body.offsetHeight
    };
  },

  _uiSetup : function() {
    var b = this.body,
        device = this.device,
        feature;

    dojo.addClass(b, device.type);
    dojo.addClass(b, device.os);
    dojo.addClass(b, 'version-' + mulberry.app.PhoneGap.device.version);

    this.set('fontSize', mulberry.app.DeviceStorage.get('fontSize'));

    if (mulberry.isMAP) {
      dojo.addClass(b, 'layout-MAP');
    }
  },

  _containersSetup : function() {
    this.containers.viewport = new mulberry.containers.Viewport().placeAt(this.body, 'first');
    this.containers.persistent = new mulberry.containers.Persistent().placeAt(this.body, 'last');
  },

  _eventSetup : function() {
    dojo.connect(document, 'touchmove', function(e) {
      e.preventDefault();
    });

    dojo.connect(window, 'resize', this, function() {
      this._updateViewport();
      dojo.publish('/window/resize');
    });

    dojo.connect(document, 'menubutton', this, function(e) {
      e.preventDefault();
      dojo.publish('/button/menu');
    });

    dojo.connect(document, 'backbutton', this, function(e) {
      e.preventDefault();
      mulberry.app.Router.back();
    });

    dojo.connect(document, 'searchbutton', this, function(e) {
      mulberry.app.Router.go('/search');
      e.preventDefault();
    });

    if (this.siblingNav) {
      dojo.connect(this.siblingNav, 'show', this, function() {
        dojo.addClass(this.body, 'sibling-nav-visible');
        dojo.publish('/window/resize');
      });

      dojo.connect(this.siblingNav, 'hide', this, function() {
        dojo.removeClass(this.body, 'sibling-nav-visible');
        dojo.publish('/window/resize');
      });
    }
  },

  showPage : function(page, node) {
    if (!page) {
      throw new Error('mulberry.app.UI::showPage called without a page to show');
    }

    if (page.startup) {
      var s = dojo.subscribe('/page/transition/end', function() {
        page.startup();
        dojo.unsubscribe(s);
      });
    }

    this.containers.viewport.set('content', page);
    this.currentPage = page;
  },

  hideSplash : function() {
    var splash = dojo.byId('splash');
    if (splash) { dojo.destroy(splash); }
  }
});

dojo.subscribe('/app/ready', function() {
  mulberry.app.UI = new mulberry.app.UI(mulberry.Device);
  dojo.publish('/ui/ready');
  mulberry.showPage = dojo.hitch(mulberry.app.UI, 'showPage');
});

}

if(!dojo._hasResource["dojo.hash"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.hash"] = true;
dojo.provide("dojo.hash");


//TODOC: where does this go?
// summary:
//		Methods for monitoring and updating the hash in the browser URL.
//
// example:
//		dojo.subscribe("/dojo/hashchange", context, callback);
//
//		function callback (hashValue){
//			// do something based on the hash value.
// 		}

(function(){
	dojo.hash = function(/* String? */ hash, /* Boolean? */ replace){
		//	summary:
		//		Gets or sets the hash string.
		//	description:
		//		Handles getting and setting of location.hash.
		//		 - If no arguments are passed, acts as a getter.
		//		 - If a string is passed, acts as a setter.
		//	hash:
		//		the hash is set - #string.
		//	replace:
		//		If true, updates the hash value in the current history
		//		state instead of creating a new history state.
		//	returns:
		//		when used as a getter, returns the current hash string.
		//		when used as a setter, returns the new hash string.
		
		// getter
		if(!arguments.length){
			return _getHash();
		}
		// setter
		if(hash.charAt(0) == "#"){
			hash = hash.substring(1);
		}
		if(replace){
			_replace(hash);
		}else{
			location.href = "#" + hash;
		}
		return hash; // String
	};

	// Global vars
	var _recentHash, _ieUriMonitor, _connect,
		_pollFrequency = dojo.config.hashPollFrequency || 100;

	//Internal functions
	function _getSegment(str, delimiter){
		var i = str.indexOf(delimiter);
		return (i >= 0) ? str.substring(i+1) : "";
	}
	
	function _getHash(){
		return _getSegment(location.href, "#");
	}

	function _dispatchEvent(){
		dojo.publish("/dojo/hashchange", [_getHash()]);
	}

	function _pollLocation(){
		if(_getHash() === _recentHash){
			return;
		}
		_recentHash = _getHash();
		_dispatchEvent();
	}
	
	function _replace(hash){
		if(_ieUriMonitor){
			if(_ieUriMonitor.isTransitioning()){
				setTimeout(dojo.hitch(null,_replace,hash), _pollFrequency);
				return;
			}
			var href = _ieUriMonitor.iframe.location.href;
			var index = href.indexOf('?');
			// main frame will detect and update itself
			_ieUriMonitor.iframe.location.replace(href.substring(0, index) + "?" + hash);
			return;
		}
		location.replace("#"+hash);
		!_connect && _pollLocation();
	}

	function IEUriMonitor(){
		// summary:
		//		Determine if the browser's URI has changed or if the user has pressed the
		//		back or forward button. If so, call _dispatchEvent.
		//
		//	description:
		//		IE doesn't add changes to the URI's hash into the history unless the hash
		//		value corresponds to an actual named anchor in the document. To get around
		//      this IE difference, we use a background IFrame to maintain a back-forward
		//		history, by updating the IFrame's query string to correspond to the
		//		value of the main browser location's hash value.
		//
		//		E.g. if the value of the browser window's location changes to
		//
		//		#action=someAction
		//
		//		... then we'd update the IFrame's source to:
		//
		//		?action=someAction
		//
		//		This design leads to a somewhat complex state machine, which is
		//		described below:
		//
		//		s1: Stable state - neither the window's location has changed nor
		//			has the IFrame's location. Note that this is the 99.9% case, so
		//			we optimize for it.
		//			Transitions: s1, s2, s3
		//		s2: Window's location changed - when a user clicks a hyperlink or
		//			code programmatically changes the window's URI.
		//			Transitions: s4
		//		s3: Iframe's location changed as a result of user pressing back or
		//			forward - when the user presses back or forward, the location of
		//			the background's iframe changes to the previous or next value in
		//			its history.
		//			Transitions: s1
		//		s4: IEUriMonitor has programmatically changed the location of the
		//			background iframe, but it's location hasn't yet changed. In this
		//			case we do nothing because we need to wait for the iframe's
		//			location to reflect its actual state.
		//			Transitions: s4, s5
		//		s5:	IEUriMonitor has programmatically changed the location of the
		//			background iframe, and the iframe's location has caught up with
		//			reality. In this case we need to transition to s1.
		//			Transitions: s1
		//
		//		The hashchange event is always dispatched on the transition back to s1.
		//

		// create and append iframe
		var ifr = document.createElement("iframe"),
			IFRAME_ID = "dojo-hash-iframe",
			ifrSrc = dojo.config.dojoBlankHtmlUrl || dojo.moduleUrl("dojo", "resources/blank.html");

		if(dojo.config.useXDomain && !dojo.config.dojoBlankHtmlUrl){
			console.warn("dojo.hash: When using cross-domain Dojo builds,"
				+ " please save dojo/resources/blank.html to your domain and set djConfig.dojoBlankHtmlUrl"
				+ " to the path on your domain to blank.html");
		}

		ifr.id = IFRAME_ID;
		ifr.src = ifrSrc + "?" + _getHash();
		ifr.style.display = "none";
		document.body.appendChild(ifr);

		this.iframe = dojo.global[IFRAME_ID];
		var recentIframeQuery, transitioning, expectedIFrameQuery, docTitle, ifrOffline,
			iframeLoc = this.iframe.location;

		function resetState(){
			_recentHash = _getHash();
			recentIframeQuery = ifrOffline ? _recentHash : _getSegment(iframeLoc.href, "?");
			transitioning = false;
			expectedIFrameQuery = null;
		}

		this.isTransitioning = function(){
			return transitioning;
		};
		
		this.pollLocation = function(){
			if(!ifrOffline) {
				try{
					//see if we can access the iframe's location without a permission denied error
					var iframeSearch = _getSegment(iframeLoc.href, "?");
					//good, the iframe is same origin (no thrown exception)
					if(document.title != docTitle){ //sync title of main window with title of iframe.
						docTitle = this.iframe.document.title = document.title;
					}
				}catch(e){
					//permission denied - server cannot be reached.
					ifrOffline = true;
					console.error("dojo.hash: Error adding history entry. Server unreachable.");
				}
			}
			var hash = _getHash();
			if(transitioning && _recentHash === hash){
				// we're in an iframe transition (s4 or s5)
				if(ifrOffline || iframeSearch === expectedIFrameQuery){
					// s5 (iframe caught up to main window or iframe offline), transition back to s1
					resetState();
					_dispatchEvent();
				}else{
					// s4 (waiting for iframe to catch up to main window)
					setTimeout(dojo.hitch(this,this.pollLocation),0);
					return;
				}
			}else if(_recentHash === hash && (ifrOffline || recentIframeQuery === iframeSearch)){
				// we're in stable state (s1, iframe query == main window hash), do nothing
			}else{
				// the user has initiated a URL change somehow.
				// sync iframe query <-> main window hash
				if(_recentHash !== hash){
					// s2 (main window location changed), set iframe url and transition to s4
					_recentHash = hash;
					transitioning = true;
					expectedIFrameQuery = hash;
					ifr.src = ifrSrc + "?" + expectedIFrameQuery;
					ifrOffline = false;	//we're updating the iframe src - set offline to false so we can check again on next poll.
					setTimeout(dojo.hitch(this,this.pollLocation),0); //yielded transition to s4 while iframe reloads.
					return;
				}else if(!ifrOffline){
					// s3 (iframe location changed via back/forward button), set main window url and transition to s1.
					location.href = "#" + iframeLoc.search.substring(1);
					resetState();
					_dispatchEvent();
				}
			}
			setTimeout(dojo.hitch(this,this.pollLocation), _pollFrequency);
		};
		resetState(); // initialize state (transition to s1)
		setTimeout(dojo.hitch(this,this.pollLocation), _pollFrequency);
	}
	dojo.addOnLoad(function(){
		if("onhashchange" in dojo.global && (!dojo.isIE || (dojo.isIE >= 8 && document.compatMode != "BackCompat"))){	//need this IE browser test because "onhashchange" exists in IE8 in IE7 mode
			_connect = dojo.connect(dojo.global,"onhashchange",_dispatchEvent);
		}else{
			if(document.addEventListener){ // Non-IE
				_recentHash = _getHash();
				setInterval(_pollLocation, _pollFrequency); //Poll the window location for changes
			}else if(document.attachEvent){ // IE7-
				//Use hidden iframe in versions of IE that don't have onhashchange event
				_ieUriMonitor = new IEUriMonitor();
			}
			// else non-supported browser, do nothing.
		}
	});
})();

}

if(!dojo._hasResource['mulberry.app.Router']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.Router'] = true;
dojo.provide('mulberry.app.Router');




/**
 * mulberry.Router provides an API for specifying hash-based URLs
 * ("routes") and the functionality associated with each. It allows
 * the routes to include both path and query string parameters which
 * are then available inside the handling function:
 *
 *    /things/:id     ->    #/things/3
 *    /things         ->    #/things?id=3&color=red
 *
 * Defining a route involves providing a string route matcher, and
 * a function to run for the route. The function receives two arguments:
 * an object containing the parameters associated with the route, if any;
 * and a route object with information about the route itself.
 *
 * The concept for this class is based largely on the wonderful
 * Sammy.js, a jQuery-based framework for accomplishing all of this and
 * more. See http://code.quirkey.com/sammy/ for details.
 *
 * @author rmurphey
 */

(function(d) {
  d.declare('mulberry.app.Router', null, {
    QUERY_STRING_MATCHER : /\?([^#]*)$/,
    PATH_REPLACER : "([^\/]+)",
    PATH_NAME_MATCHER : /:([\w\d]+)/g,

    _routes : [],

    _cache : {},
    _currentHash : null,

    // yay feature detection!
    _hasHistoryState : !!(history.pushState && history.replaceState),

    /**
     * Initializes the router and routes the current URL.
     * This should be run after all routes have been defined.
     */
    init : function() {
      if (!this.defaultRoute) {
        console.error("No default route provided to router.");
        throw new Error("No default route provided to router.");
      }

      var hash = window.location.hash.toString(),
          loc = hash.replace('#','') || this.defaultRoute.origRoute;

      this.go(loc);

      d.subscribe('/dojo/hashchange', this, '_handleHash');

      if (this._hasHistoryState) {
        d.connect(window, 'onpopstate', this, function() {
          var hash = window.location.hash.replace('#','');
          this._handleHash(hash);
        });
      }
    },

    /**
     * Redirects the application to a new hash.
     * @param {String} loc The location to redirect to.
     */
    go : function(loc, replace, state) {
      var hash = loc.replace('#', ''),
          urlHash;

      if (this._hasHistoryState) {
        history[ replace ? 'replaceState' : 'pushState' ](state, null, '#' + hash);
        // history[replace ? 'replaceState' : 'pushState'](null, null, '#' + hash);
        this._handleHash(hash);
      } else {
        window.location.hash = hash;
        this._handleHash(hash);
      }
    },

    /**
     * @public
     * Sets the navigation state to back and navigates to the previous state in
     * the browser history.
     */
    back : function() {
      mulberry.app.UI.set('navDirection', 'back');
      history.back();
    },

    /**
     * @public
     * Sets the navigation state to back and navigates to the home page.
     */
    home : function() {
      mulberry.app.UI.set('navDirection', 'back');
      this.go('/home');
    },

    /**
     * Identifies and runs the route that matches the current hash
     * @private
     * @param {String} hash The current hash, as provided by the /dojo/hashchange topic
     */
    _handleHash : function(hash) {
      if (hash === this._currentHash) {
        console.log('>>> hash is a dupe, ignoring: ' + hash);
        return;
      }

      this._currentHash = hash;

      mulberry.logSection('Handling ' + hash);

      var route = this.currentRoute = this._lookupRoute(hash),
          params,
          proceed = true;

      hash = hash.replace('#','');

      if (!route) {
        console.log('No route found for hash ' + hash);
        this.go(this.defaultRoute.origRoute);
        return;
      }

      params = this._parseParamsFromHash(hash);
      params.pageState = window.history.state;
      route = d.mixin(route, { hash : hash });

      route.callback(params, route);

      d.publish('/router/handleHash/after');
      mulberry.endLogSection('Handling ' + hash);
    },

    /**
     * Creates a params object based on a hash
     * @private
     * @param {String} hash The hash to parse
     * @returns Params object containing all params from hash
     * @type Object
     */
    _parseParamsFromHash : function(hash) {
      var parts = hash.split('?'),
          path = parts[0],
          query = parts[1],
          params,
          pathParams,
          _decode = decodeURIComponent,
          route = this.currentRoute;

      params = query ? d.mixin({}, d.queryToObject(query)) : {};

      if ((pathParams = route.path.exec(this._routeablePath(path))) !== null) {
        // first match is the full path
        pathParams.shift();

        // for each of the matches
        d.forEach(pathParams, function(param, i) {
          // if theres a matching param name
          if (route.paramNames[i]) {
            // set the name to the match
            params[route.paramNames[i]] = _decode(param);
          } else {
            // initialize 'splat'
            if (!params.splat) { params.splat = []; }
            params.splat.push(_decode(param));
          }
        });
      }

      return params;
    },

    /**
     * Finds a route that matches the provided hash
     * @private
     * @param {String} hash The hash to find a route for
     * @returns A route object for the hash, or the default route object if no match is found
     * @type Object
     */
    _lookupRoute : function(hash) {
      if (!this._cache[hash]) {
        d.forEach(this._routes, function(route) {
          if (this._routeablePath(hash).match(route.path)) {
            this._cache[hash] = route;
          }
        }, this);
      }

      return this._cache[hash];
    },

    /**
     * Converts a hash into a string suitable for matching against a route definition
     * @private
     * @param {String} hash The hash to convert
     * @returns A string with query params removed
     * @type String
     */
    _routeablePath : function(hash) {
      return hash.replace(this.QUERY_STRING_MATCHER, '');
    },

    /**
     * @private
     * Registers a route definition with the router
     * @param {String|RegEx} route The route definition string. This can include
     * parameter names, prefixed by a colon. It must NOT include the # symbol
     * at the beginning; this is assumed. For example, a route definition string
     * can look like '/foo' or '/foo/:id' or even '/foo/:id/bar/:thing'
     * @param {Function} fn The function to run for the route. This function
     * receives one argument: an object containing the params parsed from the hash.
     * @param {Boolean} defaultRoute Whether the route should be used
     * as the default route.
     */
    registerRoute : function(route, fn, defaultRoute) {
      var pathMatch,
          paramNames = [],
          origRoute = route,
          r;

      this.PATH_NAME_MATCHER.lastIndex = 0;

      while ((pathMatch = this.PATH_NAME_MATCHER.exec(route)) !== null) {
        paramNames.push(pathMatch[1]);
      }

      // replace with the path replacement
      route = d.isString(route) ?
        new RegExp("^" + route.replace(this.PATH_NAME_MATCHER, this.PATH_REPLACER) + "$") :
        route;

      r = {
        origRoute : origRoute,
        path : route,
        callback : fn,
        paramNames : paramNames
      };

      this._routes.push(r);

      if (defaultRoute) {
        // last default route wins
        this.defaultRoute = r;
      }

      this._cache = {};
    }
  });

  mulberry.app.Router = new mulberry.app.Router();

  mulberry.route = function(route, handler, isDefaultRoute) {
    mulberry.app.Router.registerRoute(route, handler, isDefaultRoute);
  };

  mulberry.routes = function(routesArray) {
    dojo.forEach(routesArray, function(r) {
      mulberry.app.Router.registerRoute(r.route, r.handler, r.isDefault);
    });
  };
}(dojo));

}

if(!dojo._hasResource['mulberry.ui.BackgroundImage']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.ui.BackgroundImage'] = true;
dojo.provide('mulberry.ui.BackgroundImage');



dojo.declare('mulberry.ui.BackgroundImage', dijit._Widget, {
  // These attributes must be present on the dom element
  imageUrl : '',

  isLoaded : false,
  loadOnInit : false,

  postCreate : function() {
    this.inherited(arguments);

    if (this.loadOnInit) {
      this.loadImage();
    }
  },

  loadImage : function() {
    if (this.isLoaded) { return; }

    dojo.style(this.domNode, {
      'backgroundImage': 'url(' + this.imageUrl + ')',
      'backgroundRepeat': 'no-repeat'
    });

    this.isLoaded = true;
  },

  unloadImage : function() {
    dojo.style(this.domNode, 'backgroundImage', null);
    this.isLoaded = false;
  },

  _setBackgroundImageAttr : function(imageProps) {
    if (!imageProps) { return; }

   this.imageUrl = imageProps.url;
  }

});


}

if(!dojo._hasResource['mulberry.containers._LayoutBox']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.containers._LayoutBox'] = true;
dojo.provide('mulberry.containers._LayoutBox');




dojo.declare('mulberry.containers._LayoutBox', [ mulberry._View, mulberry.ui.BackgroundImage ], {
  templateString : '<div class=layout-box></div>',

  defaultConfig : {
    scrollable : false
  },

  postMixInProperties : function() {
    // use the default config, but override with any settings that get passed in
    this.config = dojo.mixin(dojo.mixin({}, this.defaultConfig), this.config);
  },

  postCreate : function() {
    this.inherited(arguments);

    if (this.config.className) {
      this.addClass(this.config.className);
    }

    if (this.config.backgroundImage && this.backgroundImage) {
      this.loadImage();
    }
  }

});


}

if(!dojo._hasResource['mulberry.containers.Region']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.containers.Region'] = true;
dojo.provide('mulberry.containers.Region');




(function() {

mulberry.components = mulberry.components || {};

var componentNamespaces = [ mulberry.components ];

dojo.declare('mulberry.containers.Region', mulberry.containers._LayoutBox, {
  templateString : dojo.cache("mulberry.containers", "Region/Region.haml", ".region\n  .pane{ dojoAttachPoint : 'pane' }\n    .inner{ dojoAttachPoint : 'inner' }\n"),
  config : {},
  _scroller : null,

  postCreate : function() {
    this.inherited(arguments);

    this._placeComponents();
    this._placeRegions();
    this._setupScroller();

    this.connect(this.screen, 'startup', 'startup');
  },

  _setupScroller : function() {
    if (this.config.scrollable) {
      this._scroller = new mulberry.ui.Scrollable({}, this.pane);
      this.connect(this._scroller, 'onScrollStart', 'onScrollStart');
      this.connect(this._scroller, 'onScrollEnd', 'onScrollEnd');
    }
  },

  /*
   * If the region has scrollable=true, place the component into the .inner div
   * because iScroll needs that extra wrapper div
   */
  _placeComponents : function() {
    var placement = this.config.scrollable ? [this.inner, 'last'] : [this.pane, 'replace'] ;

    if (
      this.config.components &&
      this.config.components.length > 1 &&
      placement[0] === this.pane
    ) {
      console.error("WARNING: you're trying to place more than one component into a non-scrollable region. this will end badly.");
    }

    if (this.config.components && this.config.components.length) {
      dojo.forEach(this.config.components, function(componentName) {
        var klass;

        if (componentName.match(/^custom\./)) {
          klass = client.components[componentName.replace(/^custom\./, '')];
        } else {
          dojo.forEach(componentNamespaces, function(ns) {
            klass = ns[componentName];
          });
        }

        if (!klass) {
          console.error('No matching class found for', componentName);
        }

        var c = this.adopt(klass, {
          baseObj : this.baseObj,
          page : this.page,
          node : this.baseObj,
          device : this.device,
          screen : this.screen,
          region : this
        });

        c.placeAt(placement[0], placement[1]);
      }, this);
    }
  },

  _placeRegions : function() {
    var placement = this.config.scrollable ? [this.inner, 'last'] : [this.domNode];

    if (this.config.regions && this.config.regions.length) {
      if(!this.config.scrollable) {
        // not scrolling, don't need the pane
        // this replicates the old functionality exactly
        dojo.destroy(this.pane);
      }

      dojo.forEach(this.config.regions, function(region) {
        this.adopt(mulberry.containers.Region, {
          config : region,
          baseObj : this.baseObj,
          device : this.device,
          screen : this.screen,
          backgroundImage : this.backgroundImage
        }).placeAt(placement[0], placement[1]);
      }, this);
    }
  },

  refreshScroller : function() {
    if (this._scroller) {
      this._scroller.refreshScroller();
    }
  },

  onScrollStart : function() {

  },

  onScrollEnd : function() {

  }
});

mulberry.registerComponentNamespace = function(ns) {
  componentNamespaces.push(ns);
};

}());

}

if(!dojo._hasResource['mulberry.containers.Screen']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.containers.Screen'] = true;
dojo.provide('mulberry.containers.Screen');




dojo.declare('mulberry.containers.Screen', mulberry.containers._LayoutBox, {
  templateString : dojo.cache("mulberry.containers", "Screen/Screen.haml", ".screen\n"),
  components : {},

  postCreate : function() {
    this.inherited(arguments);

    this.addClass(this.config.name);

    if (this.config.regions) {
      this.regions = dojo.map(this.config.regions, function(region) {
        return this.adopt(mulberry.containers.Region, {
          page : this.page,
          config : region,
          baseObj : this.baseObj,
          device : this.device,
          screen : this,
          backgroundImage : this.backgroundImage
        }).placeAt(this.domNode);
      }, this);
    }
  },

  registerComponent : function(c) {
    var componentParts = c.declaredClass.split('.'),
        componentName = componentParts[componentParts.length - 1];

    this.components[componentName] = c;
  },

  getComponent : function(n) {
    n = n.replace('custom.', '');
    return this.components[n];
  }
});

}

if(!dojo._hasResource['mulberry.containers.Page']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.containers.Page'] = true;
dojo.provide('mulberry.containers.Page');





(function() {

mulberry.capabilities = mulberry.capabilities || {};

var capabilitiesNamespaces = [ mulberry.capabilities ];

dojo.declare('mulberry.containers.Page', [ mulberry._View, mulberry.ui.BackgroundImage ], {
  pageDef : {},
  templateString : dojo.cache("mulberry.containers", "Page/Page.haml", "%li.page.node.configurable\n"),

  postMixInProperties : function() {
    this.inherited(arguments);
    this.baseObj.shareable = this.baseObj.type === 'node';
  },

  postCreate : function() {
    this.screens = {};

    if (!this.baseObj) {
      throw "mulberry.Page requires a base object";
    }

    if (!this.pageDef.screens || !this.pageDef.screens.length) {
      throw "The config for mulberry.Page must have at least one screen defined";
    }

    var bgImg = this.baseObj.pageBackground;

    dojo.forEach(this.pageDef.screens, function(screen) {
      var scr = this.adopt(mulberry.containers.Screen, {
        page : this,
        config : screen,
        baseObj : this.baseObj,
        device : this.device,
        backgroundImage : bgImg
      }).placeAt(this.domNode);

      this.screens[screen.name] = scr;
    }, this);

    this.capabilities = dojo.map(this.pageDef.capabilities || [], function(config) {
      var C = dojo.isObject(config) ? config.name : config,
          components = config.components,
          capability;

      dojo.forEach(capabilitiesNamespaces, function(ns) {
        capability = ns[C] || capability;
      });

      if (!capability) {
        console.warn('No capability', C, 'defined in these namespaces:');

        dojo.forEach(capabilitiesNamespaces, function(ns) {
          console.log('-- namespace', ns);
        }, this);

        return null;
      }

      return new capability({
        page : this,
        baseObj : this.baseObj,
        components : components
      });
    }, this);

    if (this.screens.detail) {
      this.screens.detail.hide();
    }

    this.addClass('page-' + this.baseObj.id);
    this.addClass(this.pageDefName);
  },

  showScreen : function (screenName) {
    dojo.forIn(this.screens, function(name, screen) {
      if (name !== screenName) {
        screen.hide();
      }
    });
    this.screens[screenName].show();
  },

  getScreen : function(screenName) {
    return this.screens[screenName];
  },

  getComponent : function(componentName) {
    var c = false;

    this._components = this._components || {};

    if (!this._components[componentName]) {
      dojo.forIn(this.screens, function(screenName, screen) {
        var tmp = screen.getComponent(componentName);
        if (tmp) { c = tmp; }
      });

      this._components[componentName] = c;
    }

    return this._components[componentName];
  },

  startup : function() {
    this.inherited(arguments);

    dojo.forIn(this.screens, function(name, screen) {
      screen.startup();
    });
  },

  init : function() {
    // for capability connections
  }
});

mulberry.registerCapabilityNamespace = function(ns) {
  capabilitiesNamespaces.push(ns);
};

}());

}

if(!dojo._hasResource['mulberry.app.PageFactory']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.PageFactory'] = true;
dojo.provide('mulberry.app.PageFactory');




dojo.declare('mulberry.app.PageFactory', null, {
  constructor: function(device) {
    this.device = device;
  },

  createPage: function(obj) {
    /*
     * createPage receives an object that it will use to create a page. It
     * looks at the object for a pageDef property, and uses that property to
     * determine how to set up the page.
     *
     * Once we have determined the proper page definition to use, we create an
     * instance of a Page using that definition, passing the Page instance the
     * data it will need. We return the Page instance, and createPage is
     * complete.
     */

    if (!obj) {
      throw new Error('mulberry.app.PageFactory::createPage requires an object');
    }

    var pageDefName = obj.pageDef || 'default',
        pageDef = mulberry.pageDefs[pageDefName];

    if (!pageDef) {
      throw ('mulberry.app.PageFactory: The page definition "' + pageDefName + '" does not exist.');
    }

    mulberry.log('Creating ' + pageDefName);

    return new mulberry.containers.Page({
      baseObj: obj,
      device: this.device,
      pageDef: pageDef,
      pageDefName: pageDefName
    });
  }
});

dojo.subscribe('/app/ready', function() {
  mulberry.app.PageFactory = new mulberry.app.PageFactory(mulberry.Device);
  mulberry.createPage = dojo.hitch(mulberry.app.PageFactory, 'createPage');
});


}

if(!dojo._hasResource['mulberry.app.Notifications']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.Notifications'] = true;
dojo.provide('mulberry.app.Notifications');

(function() {

var notificationCallback;

mulberry.app.Notifications = {
  areAvailable: function() {
    return !!mulberry.app.PhoneGap.present;
  },

  init: function() {
    if (!mulberry.app.PhoneGap.present) { return; }

    window.plugins.pushNotification.startNotify();
    this._apnRegister();
  },

  setNotificationCallback: function(callback) {
    if (!mulberry.app.PhoneGap.present) { return; }

    notificationCallback = window.plugins.pushNotification.notificationCallback = callback;
  },

  notify: function(notification) {
    notificationCallback(notification);
  },

  // register with APN
  _apnRegister: function() {
    window.plugins.pushNotification.register(
      function(e) { mulberry.app.Notifications._apnOnRegisterSuccess(e); },
      function(e) { mulberry.app.Notifications._apnOnRegisterError(e); },
      [{ alert:true, badge:true, sound:true }]);
    console.log('APN push notification registered.');
  },

  _apnOnRegisterSuccess: function(e) {
    this._urbanAirshipRegister(e.deviceToken, e.host, e.appKey, e.appSecret);
  },

  _apnOnRegisterError: function(e) {
    console.log('error registering with APN: ' + e.toString());
  },

  // register urban airship push service after APN is registered successfully
  _urbanAirshipRegister: function(deviceToken, host, appKey, appSecret) {
    // TODO: use dojo.xhrPut?
    var request = new XMLHttpRequest();

    // open the client and encode our URL
    request.open('PUT', host + 'api/device_tokens/' + deviceToken, true, appKey, appSecret);

    // callback when request finished
    request.onload = function() {
      if(this.status === 200 || this.status === 201) {
        // register UA push success
        console.log('Successfully registered with Urban Airship.');
      } else {
        // error
        console.log('Error when registring with Urban Airship: '+this.statusText);
      }
    };

    request.send();
  }
};

var Notifications = mulberry.app.Notifications;

dojo.subscribe('/app/ready', function() {
  var alertCallback = function(){},
      alertTitle = "Notification from " + mulberry.app.Config.get('app').name;

  Notifications.init();

  Notifications.setNotificationCallback(
    function(notification) {
      window.navigator.notification.alert(notification.alert, alertCallback, alertTitle);
    }
  );
});

}());

}

if(!dojo._hasResource['mulberry.app.Has']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app.Has'] = true;
dojo.provide('mulberry.app.Has');



mulberry.app.Has = function() {
  var device = mulberry.Device;

  return {
    html5Player : function() {
      return device.os !== 'android';
    },

    iScrollZoom : function() {
      return device.os !== 'android';
    }
  };
};

(function(){

var s = dojo.subscribe('/app/deviceready', function() {
  dojo.unsubscribe(s);
  if (dojo.isFunction(mulberry.app.Has)) {
    mulberry.app.Has = mulberry.app.Has();
  }
});

}());

}

if(!dojo._hasResource["dojo.regexp"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.regexp"] = true;
dojo.provide("dojo.regexp");

dojo.getObject("regexp", true, dojo);

/*=====
dojo.regexp = {
	// summary: Regular expressions and Builder resources
};
=====*/

dojo.regexp.escapeString = function(/*String*/str, /*String?*/except){
	//	summary:
	//		Adds escape sequences for special characters in regular expressions
	// except:
	//		a String with special characters to be left unescaped

	return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function(ch){
		if(except && except.indexOf(ch) != -1){
			return ch;
		}
		return "\\" + ch;
	}); // String
};

dojo.regexp.buildGroupRE = function(/*Object|Array*/arr, /*Function*/re, /*Boolean?*/nonCapture){
	//	summary:
	//		Builds a regular expression that groups subexpressions
	//	description:
	//		A utility function used by some of the RE generators. The
	//		subexpressions are constructed by the function, re, in the second
	//		parameter.  re builds one subexpression for each elem in the array
	//		a, in the first parameter. Returns a string for a regular
	//		expression that groups all the subexpressions.
	// arr:
	//		A single value or an array of values.
	// re:
	//		A function. Takes one parameter and converts it to a regular
	//		expression.
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression. Defaults to false

	// case 1: a is a single value.
	if(!(arr instanceof Array)){
		return re(arr); // String
	}

	// case 2: a is an array
	var b = [];
	for(var i = 0; i < arr.length; i++){
		// convert each elem to a RE
		b.push(re(arr[i]));
	}

	 // join the REs as alternatives in a RE group.
	return dojo.regexp.group(b.join("|"), nonCapture); // String
};

dojo.regexp.group = function(/*String*/expression, /*Boolean?*/nonCapture){
	// summary:
	//		adds group match to expression
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression.
	return "(" + (nonCapture ? "?:":"") + expression + ")"; // String
};

}

if(!dojo._hasResource["dojo.cookie"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.cookie"] = true;
dojo.provide("dojo.cookie");



/*=====
dojo.__cookieProps = function(){
	//	expires: Date|String|Number?
	//		If a number, the number of days from today at which the cookie
	//		will expire. If a date, the date past which the cookie will expire.
	//		If expires is in the past, the cookie will be deleted.
	//		If expires is omitted or is 0, the cookie will expire when the browser closes. << FIXME: 0 seems to disappear right away? FF3.
	//	path: String?
	//		The path to use for the cookie.
	//	domain: String?
	//		The domain to use for the cookie.
	//	secure: Boolean?
	//		Whether to only send the cookie on secure connections
	this.expires = expires;
	this.path = path;
	this.domain = domain;
	this.secure = secure;
}
=====*/


dojo.cookie = function(/*String*/name, /*String?*/value, /*dojo.__cookieProps?*/props){
	//	summary:
	//		Get or set a cookie.
	//	description:
	// 		If one argument is passed, returns the value of the cookie
	// 		For two or more arguments, acts as a setter.
	//	name:
	//		Name of the cookie
	//	value:
	//		Value for the cookie
	//	props:
	//		Properties for the cookie
	//	example:
	//		set a cookie with the JSON-serialized contents of an object which
	//		will expire 5 days from now:
	//	|	dojo.cookie("configObj", dojo.toJson(config), { expires: 5 });
	//
	//	example:
	//		de-serialize a cookie back into a JavaScript object:
	//	|	var config = dojo.fromJson(dojo.cookie("configObj"));
	//
	//	example:
	//		delete a cookie:
	//	|	dojo.cookie("configObj", null, {expires: -1});
	var c = document.cookie;
	if(arguments.length == 1){
		var matches = c.match(new RegExp("(?:^|; )" + dojo.regexp.escapeString(name) + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined; // String or undefined
	}else{
		props = props || {};
// FIXME: expires=0 seems to disappear right away, not on close? (FF3)  Change docs?
		var exp = props.expires;
		if(typeof exp == "number"){
			var d = new Date();
			d.setTime(d.getTime() + exp*24*60*60*1000);
			exp = props.expires = d;
		}
		if(exp && exp.toUTCString){ props.expires = exp.toUTCString(); }

		value = encodeURIComponent(value);
		var updatedCookie = name + "=" + value, propName;
		for(propName in props){
			updatedCookie += "; " + propName;
			var propValue = props[propName];
			if(propValue !== true){ updatedCookie += "=" + propValue; }
		}
		document.cookie = updatedCookie;
	}
};

dojo.cookie.isSupported = function(){
	//	summary:
	//		Use to determine if the current browser supports cookies or not.
	//
	//		Returns true if user allows cookies.
	//		Returns false if user doesn't allow cookies.

	if(!("cookieEnabled" in navigator)){
		this("__djCookieTest__", "CookiesAllowed");
		navigator.cookieEnabled = this("__djCookieTest__") == "CookiesAllowed";
		if(navigator.cookieEnabled){
			this("__djCookieTest__", "", {expires: -1});
		}
	}
	return navigator.cookieEnabled;
};

}

if(!dojo._hasResource['mulberry._Component']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry._Component'] = true;
dojo.provide('mulberry._Component');




dojo.declare('mulberry._Component', mulberry._View, {
  handleClicks : false,

  /**
   * This is a stub for implementation by components that inherit from
   * _Component.
   *
   * This will run prior to the template being rendered; if there's any data
   * you need to massage before rendering the template, this is the place to do
   * it.
   */
  prepareData : function() { },

  /**
   * This is a stub for implementation by components that inherit from
   * _Component.
   *
   * This will run after the DOM for the component has been created, but before
   * it is visible in the page. This is where you should do any connections
   * required by the component.
   */
  setupConnections : function() { },

  /**
   * This is a stub for implementation by components that inherit from
   * _Component.
   *
   * This will run after the DOM for the component has been created, but before
   * it is visible in the page. This is where you should do any subscriptions
   * that are required by the component.
   */
  setupSubscriptions : function() { },

  /**
   * This is a stub for implementation by components that inherit from
   * _Component.
   *
   * This will run after the DOM for the component has been created, but before
   * it is visible in the page. If there are components that you want to place
   * or remove conditionally, this is the place to do it.
   */
  setupChildComponents : function() { },

  /**
   * This is a stub for implementation by components that inherit from
   * _Component.
   *
   * This will run after the DOM for the component has been created, but before
   * it is visible on the page. If you want to conditionally change markup,
   * such as adding a class, this is the place to do it.
   */
  adjustMarkup : function() { },

  /**
   * This is a stub for implementation by components that inherit from
   * _Component.
   *
   * This will run after the DOM for the component has been created and placed
   * in the page, and the component is visible in the page.
   */
  resizeElements : function() { },

  /**
   * This is a stub for implementation by components that inherit from
   * _Component.
   *
   * This will run right before the component is destroyed. Use this method to
   * clean up any items that may continue to occupy memory after the component
   * is destroyed. Note that you do not need to clean up after connections and
   * subscriptions that were created with this.connect or this.subscribe.
   */
  teardown : function() { },

  /**
   * @param templateFn A template function that will receive a data item and return
   * a string
   * @param data An array of data items to be processed by the template
   * function
   */
  populate : function(templateFn, data) {
    this.populateElement(this.domNode, templateFn, data);
  },

  /**
   * @param element A node to be populated with HTML based on the provided data
   * @param templateFn A template function that will receive a data item and return
   * a string
   * @param data An array of data items, or single data item, to be processed by the template
   * function
   */
  populateElement : function(element, templateFn, data) {
    if (dojo.isString(element)) {
      element = this[element];
    }

    if (!element) { return; }

    element.innerHTML = dojo.isArray(data) ? dojo.map(data, templateFn).join('') : templateFn(data);

    if (this.region) {
      this.region.refreshScroller();
    }
  },

  postMixInProperties : function() {
    this.inherited(arguments);

    if (this.screen) {
      this.screen.registerComponent(this);
      this.connect(this.screen, 'startup', 'startup');
    }

    this.prepareData();
    this._loadHelpers();

    this.inherited(arguments);
  },

  postCreate : function() {
    this.inherited(arguments);

    if (this.isHidden) {
      this.hide();
    }

    if (this.handleClicks) {
      this.preventClickDelay(
        this.clickableNode || this.domNode,
        this._clickHandler && dojo.hitch(this, '_clickHandler')
      );
    }

    this.subscribe('/window/resize', function() {
      this.dimensions = null;
    });

    this.setupChildComponents();
    this.adjustMarkup();
    this.setupConnections();
    this.setupSubscriptions();
  },

  startup : function() {
    this.inherited(arguments);
    this.resizeElements();

    if (this.when) {
      dojo.forIn(this.when, function(k, v) {
        var node = this.node || this.baseObj;
        node[k].then(dojo.hitch(this, v));
      }, this);
    }
  },

  destroy : function() {
    this.teardown();
    this.inherited(arguments);
  },

  _loadHelpers : function() {
    if (this.helpers && dojo.isObject(this.helpers)) {
      dojo.forIn(this.helpers, function(prop, tpl) {
        if (tpl) {
          this.helpers[prop] = Haml(tpl)();
        }
      }, this);
    }
  },

  _setupTouch : function(ele, handler) {
    var touch = mulberry.app.UI.hasTouch,
        evt = touch ? 'touchstart' : 'click';

    this.connect(ele, evt, handler);
    if (touch) { this.connect(ele, 'click', function(e) { e.preventDefault(); }); }
  },

  getDimensions : function() {
    var domNode = this[this.sizeNode];

    this.dimensions = this.dimensions || {
      width : dojo.style(this.domNode, 'width'),
      height : dojo.style(this.domNode, 'height')
    };

    return this.dimensions;
  }

});

mulberry.component = function(name, proto) {
  var p = dojo.mixin(proto, {
    templateString : proto.componentTemplate || '%div',

    prepareData : function() {
      this.inherited(arguments);

      if (proto.prep) {
        proto.prep.call(this);
      }
    },

    postCreate : function() {
      this.inherited(arguments);
      if (window.jQuery) { this.$domNode = jQuery(this.domNode); }
    },

    startup : function() {
      this.inherited(arguments);
      if (proto.init) {
        proto.init.call(this);
      }
    }
  });

  dojo.declare('client.components.' + name, mulberry._Component, p);
};

}

if(!dojo._hasResource['mulberry.app._Debug']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app._Debug'] = true;
dojo.provide('mulberry.app._Debug');





(function(){

var weinreServer = 'http://api.toura.com/weinre/',

    sub = dojo.subscribe('/debug/user', function(query) {
      if (!confirm('Click OK if you want to enter debug mode.')) { return; }

      mulberry.app.Router.go('/debug/' + query);
    });

var createHash = function() {
  var nonce = [],
      length = 2; // arbitrary - looks like a good length

  while (length--) {
    nonce.push((((1+Math.random())*0x10000)).toString(16).substring(0,3));
  }

  return '#m-' + nonce.join("");
};


mulberry.app._Debug = function() {
  var tools = new mulberry.app._Debug.Tools().placeAt(dojo.body(), 'first'),
      msg = new mulberry.app._Debug.Message().placeAt(dojo.body(), 'first'),
      tpl = 'Debug &#64; {url} code: {hash}';

  dojo.connect(tools, 'onWeinre', function(hash) {
    msg.set(
      'content',
      tpl.split('{url}').join(weinreServer).split('{hash}').join(hash.slice(1))
    );
  });
};

mulberry.app._Debug.weinre = {
  init : function() {
    var cookie = dojo.cookie('debug-hash'),
        hash = cookie || createHash(),
        s = document.createElement('script'),
        url = s.src = this.script + hash;

    if (this.enabled) { return hash; }

    window.WeinreServerURL = weinreServer;

    document.body.appendChild(s);
    dojo.cookie('debug-hash', hash);
    this.enabled = true;

    return hash;
  },

  script : weinreServer + 'target/target-script-min.js',
  client : function(hash) {
    return weinreServer + 'client/{hash}'.replace('{hash}', hash);
  }
};

dojo.declare('mulberry.app._Debug.Tools', mulberry._Component, {
  templateString : '<div class="component debug-tools"><div class="buttons"></div></div>',

  actions : [
    {
      name : 'Reset DB',
      method : '_resetDB'
    },
    {
      name : 'weinre',
      method : '_weinre'
    }
  ],

  postCreate : function() {
    this.inherited(arguments);
    this._makeActions();
  },

  _makeActions : function() {
    dojo.forEach(this.actions, function(action) {
      var n = dojo.create('div', {
        className : 'button',
        innerHTML : action.name
      });

      dojo.place(n, this.domNode.firstChild);

      this.connect(n, 'click', action.method);
    }, this);
  },

  _resetDB : function() {
    mulberry.app.DeviceStorage.drop();
    window.location.reload();
  },

  _weinre : function() {
    if (this.hasWeinre) { return; }

    var hash = mulberry.app._Debug.weinre.init();
    this.hasWeinre = true;
    this.onWeinre(hash);
  },

  onWeinre : function(hash) { }
});

dojo.declare('mulberry.app._Debug.Message', mulberry._Component, {
  templateString : '<div class="component debug-message"></div>',

  postCreate : function() {
    this.inherited(arguments);
    var n = dojo.create('div', {
      className : 'close',
      innerHTML : 'close'
    });

    dojo.place(n, this.domNode);
    this.connect(n, 'click', function() { this.hide(); });

    this.msgNode = dojo.create('div');
    dojo.place(this.msgNode, this.domNode);

    this.hide();
  },

  _setContentAttr : function(msg) {
    this.show();
    this.msgNode.innerHTML = msg;
  }
});

}());

}

if(!dojo._hasResource['mulberry.components.Debug']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.components.Debug'] = true;
dojo.provide('mulberry.components.Debug');



(function() {

var featureObj = {};

dojo.declare('mulberry.components.Debug', mulberry._Component, {
  templateString : dojo.cache("mulberry.components", "Debug/Debug.haml", ".component.debug\n  .status{ dojoAttachPoint : 'status' }\n\n  %table{ dojoAttachPoint : 'deviceInfo' }\n\n  %ul.actions\n    %li{ dojoAttachEvent : 'click:_weinre' } weinre\n    %li{ dojoAttachEvent : 'click:_resetDB' } reset\n\n"),

  prepareData : function() {
    var html = [],
        tpl = function(k, v) {
          return '<tr><th>{k}</th><td>{v}</td></tr>'.replace('{k}', k).replace('{v}', v);
        },
        header = function(t) {
          return '<tr><th colspan=2>' + t + '</th></tr>';
        },
        k;

    html.push(header('Device'));

    if (window.device) {
      dojo.forIn(window.device, function(k, v) {
        html.push(tpl(k, v));
      });
    }

    html.push(tpl('UA', window.navigator.userAgent));
    html.push(tpl('Device Type', this.device.type));
    html.push(tpl('Device OS', this.device.os));

    var app = mulberry.app.Config.get('app');

    html.push(header('App'));
    html.push(tpl('Build Date', mulberry.app.Config.get('buildDate')));
    html.push(tpl('Data Version', mulberry.app.Tour._getLocalVersion()));

    dojo.forIn(app, function(k, v) {
      html.push(tpl(k, v));
    });

    html.push(header('Features'));

    dojo.forIn(featureObj, function(k, v) {
      html.push(tpl(k, v ? 'true' : 'false'));
    });

    this.info = html.join('');
    this.inherited(arguments);
  },

  postCreate : function() {
    this.inherited(arguments);
    this.deviceInfo.innerHTML = this.info;
  },

  _weinre : function() {
    this.status.innerHTML = 'debugging at ' + mulberry.app._Debug.weinre.init();
    dojo.publish('/content/update');
  },

  _resetDB : function() {
    mulberry.app.DeviceStorage.drop();
    window.location.reload();
  }
});

mulberry.components.Debug.registerFeaturesObject = function(obj) {
  dojo.mixin(featureObj, obj);
};

}());

}

if(!dojo._hasResource['mulberry.app._base']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.app._base'] = true;
dojo.provide('mulberry.app._base');












}

if(!dojo._hasResource['mulberry.base']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['mulberry.base'] = true;
dojo.provide('mulberry.base');

$m = mulberry;
mulberry.version = '0.3';

















var readyFn = function() {
  // open up the database connection so we can work with it
  mulberry.app.DeviceStorage.init(mulberry.app.Config.get("id") || 'mulberry');

  // bootstrapping process should start in response to /app/deviceready
  dojo.publish('/app/deviceready');

  // bootstrapping process must publish this topic
  dojo.subscribe('/app/ready', function() {
    mulberry.app.Router.init();
    mulberry.app.UI.hideSplash();
  });

    if (mulberry.features && mulberry.features.debugToolbar) { mulberry.app._Debug(); }
  };

document.addEventListener("deviceready", function() {
  dojo.ready(readyFn);
}, false);

}


dojo.i18n._preloadLocalizations("mulberry.nls.base", ["ROOT","en","en-us","xx"]);
