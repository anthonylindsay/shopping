
Array.prototype.has = function(value) {
  var i;
  for (var i = 0, loopCnt = this.length; i < loopCnt; i++) {
    if (this[i] == value) {
      return true;
    }
   }
  return false;
};

function dedupArray(array) {
  array.sort();
  var cnt = array.length - 1;
  var i=0;
  var keepers = new Array();
  while(i <= cnt){
    if(jQuery.inArray(array[i], array, i+1) == -1){
      keepers.push(array[i]);
      i++;
    }
    else{
      array.shift();
    }
    cnt = array.length - 1;
  }
  return keepers;
}

Object.keys = Object.keys || (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
        DontEnums = [
            'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
            'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
        ],
        DontEnumsLength = DontEnums.length;

    return function (o) {
        if (typeof o != "object" && typeof o != "function" || o === null)
            throw new TypeError("Object.keys called on a non-object");

        var result = [];
        for (var name in o) {
            if (hasOwnProperty.call(o, name))
                result.push(name);
        }

        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; i++) {
                if (hasOwnProperty.call(o, DontEnums[i]))
                    result.push(DontEnums[i]);
            }
        }

        return result;
    };
})();

$(document).ready(function(){
  var s = new Array();
  data = {
    // set up storage & caching arrays
    storage : [],
    category_cache : [],
  lookup_cache : {},
    item_cache : [],
    cache_seed : ['Groceries','Home','Electronics','Stationary','Clothes','Hardware','Garden','DIY','Entertainment','Education','Fruit &amp; Veg','Meat','Dairy','Baking','Toiletries','Sundries','Butcher','Greengrocer','Tinned Goods','Beverages'],
    //add a product object to storage & set its properties.
    add :
      function(productName,cat) {
        var newItem = {
          name : productName,
          category : cat,
          status : 0
        }
        data.storage.push(newItem);
        data.cache_category(cat);
        data.cache_item(productName);
        data.cache_lookup(productName, cat);
        data.set_message(productName+' added to your shopping list.');
        data.save('current');
        $('#list .content').html(data.list());
      },

    // check for an empty slot in storage.
    check_data :
     function(n) {
       if((data.storage[n] == undefined) || (data.storage[n] == null)) return n;
       else {
         n++;
         this.check_data(n);
         }
     },

    // remove an item at index i
    remove :
      function(i) {
        data.storage.splice(i, 1);
        data.save('current');
      },

    // remove an item by name
    removeItem :
      function(item) {
        var index = data.storage.indexOf(item);
        data.remove(index);
        data.set_message(item +' removed from your shopping list.');
        $('#list .content').html(data.list());
      },
  // util method for clearing off items
    hunt_and_kill :
    function() {
      var $list = $('#list li');
        $list.each(function(index, element){
          try {
            if (data.storage[index].status == 1) {
              data.remove(index);
              data.hunt_and_kill();
            }
          }
          catch(e) {} // do nothing;
        });
    },
    // remove crossed out items from storage
    clear_crossed_items :
      function() {
        data.hunt_and_kill();
        data.set_message('Crossed off items removed from your shopping list.');
        $('#list .content').html(data.list());
      },

    // Edit an item at index i
    edit :
      function(i, productName, cat){
        data.storage[i].name = productName;
        data.storage[i].category = cat;
        data.set_message('Changes saved.');
        $('#list .content').html(data.list());
      },
    // show all stored items on screen
    list :
      function() {
        var cats;
    try {
      cats = data.categories();
    }
    catch(err) {
      alert('categories access failed. ' + err)
    }
    try {
      cats = dedupArray(cats);
    }
    catch(err) {
      alert('categories deduplication failed. ' + err)
    }
    var output = '<ul>';
        for (var j = 0; j <  cats.length; j++) {
          var this_cat = cats[j]
          output += "<h3>" + this_cat + "</h3>";
          output += data.list_category(this_cat);

        }
        output += '</ul>';
        return output;
      },

    // show all items in a category
    list_category :
      function(cat) {
        var output = '<ul>';
        for (var j = 0; j <  Object.keys(data.storage).length; j++) {
          if (data.storage[j]) {
            if (data.storage[j].category == cat) {
              if (data.storage[j].status == 1) output += '<li class = "cross-out">' + data.storage[j].name + ' <input type = "checkbox" name = "check-' + j + '" class = "checker" checked = "checked" /></li>';
              else output += '<li>' + data.storage[j].name + ' <input type = "checkbox" name = "check-' + j + '" class = "checker" /></li>';
              }
            }
        }
        output += '</ul>';
        return output;
      },

    // list the categories
    categories :
      function() {
        var output = new Array();
        for (var j = 0; j <  Object.keys(data.storage).length; j++) {
          if (data.storage[j]) output.push(data.storage[j].category);
        }
        return output;
      },

    // store data to persistent storage
    save :
      function(key) {
      try {
      localStorage.setItem(key, JSON.stringify(data.storage));
    }
    catch(err) {
      alert('Save failed. ' + err);
    }
      },

    // load data from persistent storage
    load :
      function(key, op) {
        if ((typeof localStorage.getItem(key) != undefined) && (localStorage.getItem(key) != null) && (localStorage.getItem(key) != "null") && (localStorage.getItem(key) != "")) {
      var d;
      console.log(key, localStorage.getItem(key));
      try {
        d = JSON.parse(localStorage.getItem(key));
      }
      catch (err) {
        alert('Storage access failed for key ' + key + '. ' + err);
      }
      if (op == 'storage') {
        for (var j = 0; j < d.length; j++) {
          if (d[j])
            data.storage[j] = d[j];
        }
      }
      else
        if (op == 'item_cache') {
          for (var j = 0; j < d.length; j++) {
            if (d[j])
              data.item_cache[j] = d[j];
          }
        }
        else
          if (op == 'category_cache') {
            for (var j = 0; j < d.length; j++) {
              if (d[j])
                data.category_cache[j] = d[j];
            }
            if (d.length == 0)
              data.category_cache = data.cache_seed;
          }
          else
            if (op == 'lookup_cache') {
              data.lookup_cache = d;
            }
    }
    else {
      try {
        localStorage.setItem(key, '');
      }
      catch (err) {
        alert('Storage setup failed. ' + err);
      }
    }
      },
    // todo
    update_list :
      function() {
        // delete crossed off items, save etc.
      },

    // delete all data from memory
    clear_all :
      function() {
        var message = "Are you sure you want to clear all items from your list?";
        if (confirm(message)) {
          data.storage = [];
          data.set_message('Your list has been cleared.');
          localStorage.setItem('current', null);
        }
      },
    // store the last category - item pair
    cache_lookup :
      function(i, c) {
        try {
      data.lookup_cache[i] = c;
    }
    catch(e) {
      // do nothing
    }
        localStorage.setItem('lookup_cache', JSON.stringify(data.lookup_cache));
      },

  // find the last used category
  get_lookup :
    function(i) {
      return data.lookup_cache[i];
    },

    // cache previously used categories for autocomplete
    cache_category :
      function(c) {
        if (!data.category_cache.has(c)) data.category_cache.push(c);
        localStorage.setItem('category_cache', JSON.stringify(data.category_cache));
      },

    //  cache previously used items for autocomplete
    cache_item :
      function(i) {
        if (!data.item_cache.has(i)) data.item_cache.push(i);
        localStorage.setItem('item_cache', JSON.stringify(data.item_cache));
      },

    // clear all cached data
    clear_cache :
      function() {
        this.category_cache = this.cache_seed;
        this.item_cache = [];
    this.lookup_cache = {};
        localStorage.setItem('item_cache', null);
    localStorage.setItem('lookup_cache', null);
        localStorage.setItem(JSON.stringify(data.category_cache) ,'category_cache');
        data.set_message('Caches cleared');
      },

    // system messages
    set_message :
      function(message) {
        var $system = $('#system');
        $system.html(message);
        $system.hide();
        $system.slideToggle('fast','linear', function(){
          setTimeout("$('#system').slideToggle('fast','linear')", 4000);
        });

      }

  }

  // initial setup
  var init_message = '';
  try {
    data.load('current', 'storage');
    init_message += 'Data loaded from storage.<br />';
  }
  catch(err){
    init_message += 'Data failed to load from storage.<br />';
  }
  try {
    data.load('item_cache', 'item_cache');
  init_message += 'Item cache loaded from storage.<br />';
  }
  catch(err){
    init_message += 'Item cache failed to load from storage.<br />';
  }
  try {
    data.load('category_cache', 'category_cache');
  init_message += 'Category cache loaded from storage.<br />';
  }
  catch(err){
    init_message += 'Category cache failed to load from storage.<br />';
  }
  try {
    data.load('lookup_cache', 'lookup_cache');
  init_message += 'Lookup cache loaded from storage.<br />';
  }
  catch(err){
    init_message += 'Lookup cache failed to load from storage.<br />';
  }

  try {
    $('#list').show();
    $('#more').toggle();
    $('#help-content').hide();
  $('#input').toggle();
    $('#system').toggle();
  init_message += 'Initial screen setup successful.<br />';
  }
  catch(err){
    init_message += 'Initial screen setup failed.<br />';
  }
  try {
    $('#list .content').html(data.list());
  init_message += 'List population successful.<br />';
  }
  catch(err){
    init_message += 'List population failed.';
  }

  data.set_message(init_message);
  // autocomplete
  var $iac;
  var $cac= $('#input-cat');

  // click handling and UI

 $('#add').click(function(e){
    $('#input').toggle();
    $('#input-item').val('');
    $('#input-cat').val('');
     var iac_options;
    var cac_options;
    jQuery(function(){
      iac_options = { lookup: data.item_cache};
      cac_options = { lookup: data.category_cache };
      $iac = $('#input-item').autocomplete(iac_options);
      $cac = $('#input-cat').autocomplete(cac_options);
      $cac.enable();
      $iac.enable();
    });
 });

$('#input-cat').click(function(){
  console.log($(this).val());
  if (($(this).val() == '') || ($(this).val() == null)) $(this).val(data.get_lookup($('#input-item').val()));
  else $('#input-cat').val('');
});

$('#input-save').click(function(e){
    e.preventDefault();
    var item = $('#input-item').val();
    var cat = $('#input-cat').val();
    data.add(item, cat);
    $('#input').toggle();

  });

  $('#help').click(function(e){
    $('#help-content').toggle();
  $('#list').toggle();
  });

  $('#view').click(function(e){
    $('#list').show();
  $('#list .content').fadeOut('fast');
    $('#list .content').html(data.list());
  $('#list .content').fadeIn('fast');
  });

  $('#list').on("click", ".checker", function(event){
  $(this).parent().toggleClass('cross-out');
  var index = $(this).attr('name');
  if (index.indexOf('check-') == 0) index = index.substr(6);
  if (data.storage[index].status == 0) data.storage[index].status = 1;
  else data.storage[index].status = 0;
  data.save('current','storage');
  });

  $('#clear-crossed-items').click(function(e){
    data.clear_crossed_items();
  });
  $('#clear-all-items').click(function(e){
    data.clear_all();
  });
  $('#settings').click(function(e){
    $('#settings').toggleClass('pushed');
    $('#controls div').toggleClass('show');
  $('#help-content').hide();
  if($('#settings').hasClass('pushed')) $('#settings span img').attr('src','css/img/cogwheel_pressed.png');
  else $('#settings span img').attr('src','css/img/cogwheel.png');
  });

  $('#clear-cache').click(function(e){
    data.clear_cache();
  });


});

