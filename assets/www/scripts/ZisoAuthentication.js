var self = this;
var storage = window.localStorage;
var useLocalStorage = true;

function writeAuthenticationInfo(authData) {	
	   	
	storage.setItem("ZListCredentials_Id",authData);    		
    
}

function FBLoadFriends() {
     

      FB.api('/me/friends', { fields: 'id, name,picture' },  function(response) {
                       if (response.error) {
                       alert(JSON.stringify(response.error));
                       } else {
                   			
								
	                   			
	                   			var shoppingList = selectedShoppingList();
	                   			
		                       
						        var friends = response.data;															
						        for (var i = 0; i < friends.length; i++) {				            
						            var fbFriend = friends[i];		
						           
									var isMatch = ko.utils.arrayFirst(shoppingList.Participants(), function(item) {
	    								return item.Token() == fbFriend.id;
									});       
						           	self.people.push(new Friend(fbFriend.id, fbFriend.name, fbFriend.picture, isMatch));					            
						       }
						       
						       self.people.sort(function(right, left) { return left.isShared() == right.isShared() ? 0 : (left.isShared() < right.isShared() ? -1 : 1) })
		                       self.people.reverse();
	                       
	                       
	                       
    						$.mobile.changePage( "#shareList", {
									transition: "none"
									}  );
    						}
    					     
    					
                       });
}


function FBlogin() 
{
	FB.login(
    function(response) {
    	
    	if (response.status == 'connected') {    	
    	
    		var userName = "tmp";
    		FB.api('/me', function(meResponse) {    			
  				userName = meResponse.name;
  				self.execSSOLogin('FB', response.authResponse.userId, userName);
			});
		} else {
			alert('not logged in');
        }
	},
    { scope: "email" }
   	);
}

function FBlogout() {
 	FB.logout(function(response) {
		$.mobile.changePage( "#nocredentials" );
    });
}


function AuthenticatedAndRedirect(msg) {	
    writeAuthenticationInfo( msg.d.UserId );    
     $.mobile.changePage( "#listManager" );    
    self.requestsLists();
}

function AuthenticationFailed(msg) {	
    alert('Authentication failed' + msg.d);
}

function RegistrationFailed(msg) {
    alert(msg.d.Message);
}

function RegisteredLoggedInAndRedirect(msg) {  
    writeAuthenticationInfo( msg.d.UserId );        
    //$("#noSessionDiv").hide('fold');
    //$("#shoppingListEditor").show();
    

    self.requestsLists();
}


var Friend = function(id, name,image, isShared) {
   this.isShared = ko.observable(isShared); 
   this.id = ko.observable(id); 
   this.name = ko.observable(name);
   this.image = ko.observable(image);
};

function ZisoAuthModel() {
	var baseUrl = "http://zhoppinglist.ziso.net/services/shoppinglistservice.asmx";
	//var baseUrl = "http://192.168.178.14/ZisoMediaNL/Services/shoppinglistservice.asmx";
	self.people = ko.observableArray();
 	
    self.newUserName = ko.observable();
    self.newPwd = ko.observable();
    self.newEmail = ko.observable();

    self.exiUserName = ko.observable('');
    self.exiPwd = ko.observable('');

	
    self.logout = function () {
        $.cookie("ZListCredentials_Id", null);

        // Web.
        $("#noSessionDiv").show();
        $("#shoppingListEditor").hide();
    }
		
    self.execRegistration = function () {    
    	var data = {
            username: "\"" + self.newUserName() + "\"",
            pwd: "\"" + self.newPwd() + "\"",
            email: "\"" + self.newEmail() + "\""
        }      

        // Do ajax call.
        $.ajax({
            url: baseUrl + "/Register?format=json",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            data: data,
            cache: false,
            success: RegisteredLoggedInAndRedirect,
            error: RegistrationFailed
        });
    }
    
    /* Login with Facebook. */
    self.execSSOLogin = function(provider, token, userName) {    	
    	var data = {
            provider: "\"" + provider + "\"",
            providerToken: "\"" + token + "\"",
            name: "\"" + userName + "\""
        }   
       
       
         // Do ajax call.
        $.ajax({
            url: baseUrl + "/SSOLogin?format=json",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            data: data,
            cache: false,
            success: AuthenticatedAndRedirect,
            error: AuthenticationFailed
        });
    }
    
    

    self.execLogin = function () {       
        var data = {
            username: "\"" + self.exiUserName() + "\"",
            pwd: "\"" + self.exiPwd() + "\""
        }
       	

        // Do ajax call.
        $.ajax({
            url: baseUrl + "/Login?format=json",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            data: data,
            cache: false,
            success: AuthenticatedAndRedirect,
            error: AuthenticationFailed
        });
    }
}
