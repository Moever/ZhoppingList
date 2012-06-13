self = this;
var storage = window.localStorage;
var useLocalStorage = true;


var ShoppingList = function(Id, Description, shoppingListItems, participants) {    
    this.Id = ko.observable(Id);
    this.Description = ko.observable(Description);
        
    this.Participants = ko.observableArray(ko.utils.arrayMap(participants, function (item) {
        return new ListParticipant(item.provider, item.Token, item.Name, item.Role);
    }));
    
    this.ShoppingListItems = ko.observableArray(ko.utils.arrayMap(shoppingListItems, function (item) {
        return new ShoppingListItem(item.Description, item.Amount, false);
    }));   
}

function ShoppingListItem( desc, amount, done ) {
	var self = this;
    self.Description = ko.observable(desc);
    self.Amount = ko.observable(amount);
    self.Done = ko.observable(done);
}

function ListParticipant( provider, token, name, role ) {
	
	this.Provider = ko.observable(provider);
	this.Token = ko.observable(token);
	this.Name = ko.observable(name);
	this.Role = ko.observable(role);
}

function ReceiveListData(msg) {
    self.ShoppingListCollection.removeAll();

    for (var i = 0; i < msg.d.length; i++) {
        var listData = msg.d[i];       
        var sList = new ShoppingList(listData.Id, listData.Description, listData.Items, listData.Participants);
        self.ShoppingListCollection.push(sList);      
    } 
    $.mobile.hidePageLoadingMsg();
    $.mobile.changePage( "#home" );    
    
    $("#myListSelection").listview('refresh');
    
    
	
}

function genericConfirmSucces(msg){

	
}
function genericConfirmFail(msg){ 
	
}


function ConfirmShareAction(msg) {
	
}


function TaskListViewModel() {

	var innerUserToken = -1;	

    // Init.
    var baseUrl = "http://zhoppinglist.ziso.net/services/shoppinglistservice.asmx";
    //var baseUrl = "http://192.168.178.14/ZisoMediaNL/Services/shoppinglistservice.asmx";
    // Properties. 
    self.newTaskText = ko.observable();
    self.newAmount = ko.observable(1);
    self.ShoppingListCollection = ko.observableArray();

    
    var dummyList = new ShoppingList(-1,'', null);
    dummyList.ShoppingListItems.push(new ShoppingListItem('', 1,false));
    self.selectedShoppingList = ko.observable(dummyList);  
    /* ~FIX THIS*/
    
    
    
    // Methods
    self.toggleDone = function (shoppingListItem) {     
        shoppingListItem.Done(!shoppingListItem.Done());      
    }   
   
    
    
    
    self.itemCurrentlyPicked = ko.observable();
    self.confirmRemove = function( ShoppingListItem) {    
    	itemCurrentlyPicked(ShoppingListItem);
    	 navigator.notification.confirm(
        'Choose an action',  // message
        performTaskOnItem,              // callback to invoke with index of button pressed
        'Specify task',            // title
        'Delete,Cancel'          // buttonLabels
   		);
    }
    
    self.performTaskOnItem = function (action) {
    	if (action == 2){
    		// canceled out of our action.    		
    		return;
    	}
    	else 
    	{
    		
    		var _item = itemCurrentlyPicked();   	
    		    	
	    	selectedShoppingList().ShoppingListItems.remove(_item);
			innerUserToken = storage.getItem("ZListCredentials_Id");
	        var data = {
	            userToken: innerUserToken,
	            listId: selectedShoppingList().Id(),
	            itemDescription: "\"" + _item.Description() + "\""
	        }	    	
	        $.ajax(
	            {
	                url: baseUrl + "/DeleteItemFromList?format=json",
	                type: "GET",
	                timeout: (5 * 1000),
	                contentType: "application/json; charset=utf-8",
	                dataType: "jsonp",
	                data: data,	                
	                success: genericConfirmSucces,
	                error: genericConfirmFail	                   
	            }
	        );        
	        
        }
    };
    self.addTask = function () {
        if (self.newTaskText().length == 0){
        	alert('Cannot add a new item without text');
            return;
        }        
       
        var newItem = new ShoppingListItem(self.newTaskText(), self.newAmount(), false)
        selectedShoppingList().ShoppingListItems.push(newItem); 
		innerUserToken = storage.getItem("ZListCredentials_Id");
		
        var data = {
            userToken: innerUserToken,
            listId: selectedShoppingList().Id(),
            description: "\"" + self.newTaskText() + "\"",
            amount: self.newAmount()
        }
        
    
        $.ajax(
            {
                url: baseUrl + "/AddItemToList?format=json",
                type: "GET",
                timeout: (5 * 1000),
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                data: data,
                success: genericConfirmSucces,
	            error: genericConfirmFail	         
            }
        );
                
        $("#shoppinglist").listview('refresh');
        //Reset to the default values.
        self.newTaskText("");
        self.newAmount(1);
    };
    
    self.refreshLists = function() {
    	$.mobile.showPageLoadingMsg();
    	self.requestsLists();
    }
    
    self.requestsLists = function () {
    	innerUserToken = storage.getItem("ZListCredentials_Id");
        var data = {
            userToken: innerUserToken    
        }        
        $.ajax(
            {
                url: baseUrl + "/GetLists?format=json",
                type: "GET",
                timeout: (5 * 1000),
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                data: data,
                cache: false,
                success: ReceiveListData,                
	            error: genericConfirmFail	         
            }
        );
    }   
    
    self.selectList = function (list) {        	
		//selectedShoppingList(list);		
		//goto("listManager");
		$.mobile.changePage( "#listManager" );		
    }
    
    self.shareWithFriend = function (friend) { 
		var shoppingList = selectedShoppingList();
		
		if (friend.isShared() ) {
			friend.isShared(false);						
		}
		else { 
			friend.isShared(true);						
		}		
		
		innerUserToken = storage.getItem("ZListCredentials_Id");
		var provider ="FB";
        var data = {
            userToken: innerUserToken,
            listId: selectedShoppingList().Id(),
            friendProvider: "\"" + provider + "\"",
            friendToken: "\"" + friend.id() + "\"",
            friendName: "\"" + friend.name() + "\"",
            state: friend.isShared()
        }        
		
        $.ajax(
            {
                url: baseUrl + "/AP?format=json",
                type: "GET",
                timeout: (5 * 1000),
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                data: data,
                success: ConfirmShareAction               
            }
        );
		
    } 
     
}
ko.applyBindings(new TaskListViewModel());