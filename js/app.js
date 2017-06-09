angular.module('concertTrack', ['ui.router'])

	.config(function($urlRouterProvider, $stateProvider) {

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state("home", {
				url: "/",
				templateUrl: "map.html",
				controller: function($scope, locations, $state) {
					console.log(locations);
					$scope.concerts = locations;
					var map = new window.google.maps.Map(document.getElementById('map'), {
						center: {
							lat: 35,
							lng: -35
						},
						zoom: 3
					})

					$scope.concerts.forEach(function(concert) {
						if (concert && concert.venue && concert.venue.latitude) {
							var marker = new window.google.maps.Marker({
								title: concert.lineup[0],
								position: {
									lat: parseInt(concert.venue.latitude),
									lng: parseInt(concert.venue.longitude)
								},
								map: map,
								animation: google.maps.Animation.DROP
							})
							var date = moment(concert.datetime).format('MMMM Do YYYY, h:mm a');
							var infoWindow = new window.google.maps.InfoWindow({
								content:
									"<div style='text-align:center; margin-left:20px; font-family: Ubuntu;'><br><strong>Headline Act:</strong> " + concert.lineup[0] + '<br>' +
									"<strong>Date:</strong> " + date + '<br>' +
									"<strong>Venue:</strong> " + concert.venue.name + ' ' +
									concert.venue.city + ', ' + concert.venue.region + "<br><br>" +
									"<button class='waves-effect waves-light btn'> <a style='color:white' target=_blank href=" + concert.url + ">Buy Tickets</a></button>" + " " +
									"<button id='artistInfobtn' ng-click=goToArtist(" + concert.lineup[0] + ") class='waves-effect waves-light btn'>View Artist Info</button></div><br>"
							});
							google.maps.event.addListener(infoWindow, 'domready', function() {
							    document.getElementById("artistInfobtn").addEventListener("click", function(e) {
							        $state.go("artistInfo", {artistName:concert.lineup[0]})
							    });
							});
							marker.addListener('click', function() {
								infoWindow.open(map, marker);
							});
							map.addListener('click', function() {
								infoWindow.close(map, marker);
							})
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
			.state("artistInfo", {
				url: "/artist/:artistName" ,
				templateUrl: "artist.html",
				controller: "artistCtrl"
			})

	})
