// Create knockout model to bind to the search element
function yelpBusinessViewModel() {
	// Set this to the self variable
 	var self = this;

	// Set the bind-data to the search field to "Coffee" observe for change
	// http://knockoutjs.com/documentation/observables.html
	self.searchTerm = ko.observable('Coffee');

	// Function to update the view model
	self.updateYelpResults = function(){

		// Feturn the updated data from the search field
		// then run the ajax function to create the yelp list
		// http://knockoutjs.com/documentation/computedObservables.html
		ko.computed(function(){
			getYelpData('92260', self.searchTerm());
		}, self);
	};
}

// Start knockout dependency tracking
ko.applyBindings(new yelpBusinessViewModel());