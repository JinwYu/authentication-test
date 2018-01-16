// "myApp" refers to an HTML element in which the application will run.
var myApp = angular.module('myApp', ['app', 'angularUtils.directives.dirPagination']);


// Remove the default header, needed to allow cross-domain operations.
myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
}]);


// Factory, needed to allow cross-domain operations.
myApp.factory('getReq', function($http){
  return{
    doCrossDomainGet: function() {
                return $http({
                    url:'http://localhost:8000/gamelist',
                    method: 'GET'
                })
    }   
  }
});

/*
myApp.factory('putReq', function($http){
  return{
    doCrossDomainPut: function() {
                return $http({
                    url:'http://localhost:8000/gamelist',
                    method: 'PUT'
                })
    }   
  }
});
*/



// Using $scope and $http for this controller.
myApp.controller('AppCtrl', ['$scope', '$http', 'getReq', function($scope, $http, getReq) {
	
	var n_items = 0;

	$scope.newField = {};

  // GET-request to fetch the data from the backend.
  getReq.doCrossDomainGet().
    then(function(response) {
      console.log("The controller has received the data it requested from the server.");
      // Make the gamelist available in the index.html file.
      $scope.gamelist =  response.data;
      console.log("The client has received the data list from the database.")

      //console.log(response.data);
      
      //n_items = response.data.length;
      //console.log("The nr of items " + n_items);
    });


    // Function to sum the prices of the games.
    $scope.getTotal = function(columnKey) {
	    var total = 0;
	    angular.forEach($scope.gamelist, function(item) {

	    	var priceString = item[columnKey];

	    	// Check if it's a number and parse it.
	    	var price = isNaN(priceString) ? 0:parseInt(priceString);

	        total += price;
	    });
	    return total;
	};

    // Function to sort the data in the table.
    $scope.sort = function(key){
        $scope.sortKey = key;
        // If true make it false and vice versa.
        $scope.reverse = !$scope.reverse; 
    }

    // Function to check if a string is empty.
    function isEmpty(str) {
    	return (!str || 0 === str.length);
	}

    // Function to add a game to the database with data from the text fields.
    $scope.addItem = function(){

    	if($scope.game == null){
			alert("Please enter the title of the game.");
		}else{
			// Always guarantee that a new _id is created for a new entry.
			if ($scope.game._id !== null) {$scope.game._id = null;}

			// Allow items with empty fields to be inserted.
			for (var key in $scope.game){				
				if(isEmpty(key)) { $scope.game[key] = ""; }								
			}	

			// Send newly created game object to the server.
			$http({
				method: 'POST',
				url: 'http://localhost:8000/gamelist',
				data: $scope.game
			})
			.then(function(response) {
				console.log("The client has received the recently inserted item from the database.");

				// Let Angular update the gamelist to show 
				// the newly added game on the page.
				var responseObject = response.data;
				$scope.gamelist.push(responseObject);﻿

				// Clear the input fields.
				$scope.game = {};
			}); 	
		} 
    };

    $scope.hideInputFields = function(){

    };


    // Function to remove a game from the database.
    $scope.deleteItem = function(id){
    	//console.log(id);

    	// Send the id of the object to remove from the database to the server.
    	$http.delete('http://localhost:8000/gamelist/' + id)
    	.then(function(response) {
			// Update the entries on the table by removing the removed object.
			for (var idx = 0; idx < $scope.gamelist.length; idx++) {
				if($scope.gamelist[idx]._id == id){
					$scope.gamelist.splice(idx, 1);
					break;
				}
			}; 
    	});  	
    };

    // Copy the row to use if an edit is cancelled.
    $scope.editItem = function (item) {
        $scope.newField = angular.copy(item);
    };

    // Dismisses changes made from an edit. 
    // Called when an cancel of an edit has happened.   
    $scope.resetToPrevRow = function (item) {
    	// Put the unchanged item to the table.
		for (var idx = 0; idx < $scope.gamelist.length; idx++) {
			if($scope.gamelist[idx]._id == item._id){
				$scope.gamelist[idx] = $scope.newField;
				break;
			}
		}; 
    };

	// Function to update and edit an object.
    $scope.updateItem = function(item) {
      console.log(item);

    	// Send the url to the updated item as the first argument,
    	// the second argument is the game object that will be sent to the server.
    	$http.put('http://localhost:8000/gamelist/' + item._id, item)
    	.then(function(response){

    		console.log("The client has received the updated item.")

    		var id = response.data._id;

    		// Update the items on the table by removing the removed object.
			for (var idx = 0; idx < $scope.gamelist.length; idx++) {
				if($scope.gamelist[idx]._id == id){

					// Change the edited item at the same place in the table.
					$scope.gamelist[idx] = response.data;

					break;
				}
			}; 
    	});
    };


}]);