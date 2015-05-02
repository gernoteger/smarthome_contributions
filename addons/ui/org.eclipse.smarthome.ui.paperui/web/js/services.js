angular.module('SmartHomeManagerApp.services', []).config(function($httpProvider){
    var language = localStorage.getItem('language');
    if(language) {
        $httpProvider.defaults.headers.common['Accept-Language'] = language;
    }
	$httpProvider.interceptors.push(function($q, $injector) {
		return {
			'responseError': function(rejection) {
				$injector.get('toastService').showErrorToast('ERROR: ' + rejection.status + ' - ' + rejection.statusText);
				return $q.reject(rejection);
			}
		};
	});
}).factory('eventService', function($resource) {
	var eventSrc = new EventSource('/rest/events');    
	return new function() {
		this.onEvent = function(topic, callback) {
			var topicRegex = topic.replace('/', '\/').replace('*', '.*');
			eventSrc.addEventListener('message', function (event) {
		        var data = JSON.parse(event.data);
		        console.log('Event received: ' + data.topic + ' - ' + data.object)
		        if(data.topic.match(topicRegex)) {
		        	callback(data.topic, data.object);
		        }
		    });
		}
	};
}).factory('toastService', function($mdToast, $rootScope) {
	var eventSrc = new EventSource('/rest/events');    
	return new function() {
	    var self = this;
		this.showToast = function(id, text, actionText, actionUrl) {
	    	var toast = $mdToast.simple().content(text);
	        if(actionText) {
	        	toast.action(actionText);
	        	toast.hideDelay(6000);
	        } else {
	        	toast.hideDelay(3000);
	        }
	        toast.position('bottom right');
	        $mdToast.show(toast).then(function() {
				$rootScope.navigateFromRoot(actionUrl);
			});
	    }
	    this.showDefaultToast = function(text, actionText, actionUrl) {
	    	self.showToast('default', text, actionText, actionUrl);
	    }
	    this.showErrorToast = function(text, actionText, actionUrl) {
	    	self.showToast('error', text, actionText, actionUrl);
	    }
	    this.showSuccessToast = function(text, actionText, actionUrl){
	    	self.showToast('success', text, actionText, actionUrl);
	    }
	};
});