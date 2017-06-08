angular.module('concertTrack', ['ngMaterial', 'ui.router'])

	.config(function($urlRouterProvider, $stateProvider) {

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state("home", {
				url: "/",
				template: '<div id="map">Hi</div>',
				controller: function($scope, locations) {
					console.log(locations);
					$scope.concerts = locations;
					var map = new window.google.maps.Map(document.getElementById('map'), {
						center: {
							lat: 32.7764163,
							lng: -96.79760240000002
						},
						zoom: 5
					})

					$scope.concerts.forEach(function(concert) {
						if (concert && concert.venue && concert.venue.latitude) {
							var marker = new window.google.maps.Marker({
								title: concert.lineup[0],
								position: {
									lat: parseInt(concert.venue.latitude),
									lng: parseInt(concert.venue.longitude)
								},
								map: map
							})
							var infoWindow = new window.google.maps.InfoWindow({
								content: "<strong>Headline Act:</strong> " + concert.lineup[0] + '<br>' +
											"<strong>Date:</strong> " + concert.datetime + '<br>' +
											"<strong>Venue:</strong> " + concert.venue.name  + ' ' +
											concert.venue.city + ', ' + concert.venue.region + "<br>" +
											"<a target=_blank href=" + concert.url + ">Buy Tickets</a>"
							});
							marker.addListener('click', function() {
								infoWindow.open(map, marker);
							});
						}
					})

				},
				resolve: {
					locations: function($http) {
						return $http.get("http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=9d0565b1e2dc46c94b7169022918d7f7&format=json")
							.then(function(response) {
								return Promise.all(response.data.artists.artist.map(function(artist) {
									return $http.get("https://rest.bandsintown.com/artists/" + artist.name + "/events/?app_id=adf")
										.then(function(response) {
											return response.data[0]
										})
								}))
							})
					}
				}
			})

	})
