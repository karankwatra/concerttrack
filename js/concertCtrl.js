angular.module('concertTrack')
	.controller("concertCtrl", function($scope, $state, concertService) {

		var map;
		setTimeout(function() {
			map = new window.google.maps.Map(document.getElementById('map'), {
				center: {
					lat: 35,
					lng: -35
				},
				zoom: 3
			})

		}, 100)
		var markers = [];
		var infoWindows = [];

		var mapConcerts = function() {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];
			infoWindows = [];
			$scope.concerts.forEach(function(concert) {
				if (concert && concert.venue && concert.venue.latitude) {
					var marker = new window.google.maps.Marker({
						title: concert.lineup[0],
						position: {
							lat: parseFloat(concert.venue.latitude),
							lng: parseFloat(concert.venue.longitude)
						},
						map: map,
						animation: google.maps.Animation.DROP
					})
					markers.push(marker);
					// console.log(markers);
					var date = moment(concert.datetime).format('MMMM Do YYYY, h:mm a');
					var region = "";
					if (concert.venue.region) {
						if (concert.venue.country === "United States" || concert.venue.country === "Canada") {
							region = concert.venue.region + ", "
						}
						if (concert.venue.region === concert.venue.country) {
							region = concert.venue.country;
						} else {
							region += concert.venue.country;
						}
					} else {
						region = concert.venue.country;
					}
					var infoWindow = new window.google.maps.InfoWindow({

						content: "<div style='text-align:center; margin-left:25px; font-family: Ubuntu; font-size:15px'><br>" +
							concert.lineup[0] + '<br>' +
							date + '<br>' +
							concert.venue.name + '<br>' +
							concert.venue.city + ', ' +
							region + '<br><br>' +
							"<button class='red lighten-1 waves-effect waves-light btn'> <a style='color:white' target=_blank href=" + concert.url + ">Buy Tickets</a></button>" + " " +
							"<button id='artistInfobtn' ng-click=goToArtist(" + concert.lineup[0] + ") class=' red lighten-1 waves-effect waves-light btn'>View Artist Info</button></div><br>"
					});
					infoWindows.push(infoWindow)
					google.maps.event.addListener(infoWindow, 'domready', function() {
						document.getElementById("artistInfobtn").addEventListener("click", function(e) {
							$state.go("artistInfo", {
								artistName: concert.lineup[0]
							})
						});
					});
					marker.addListener('click', function() {
						// console.log(markers);
						for (var i = 0; i < markers.length; i++) {
							console.log(map);
							infoWindows[i].close(map, markers[i])
						}
						infoWindow.open(map, marker);

					});
					map.addListener('click', function() {
						infoWindow.close(map, marker);
					})
				}
			})
		}

		concertService.getLocations().then(function(results) {
			$scope.concerts = results;
			mapConcerts();
		})

		$scope.searchFunc = function(searchItem) {
			concertService.getArtistDates(searchItem).then(function(results) {
				$scope.concerts = results;
				mapConcerts();
			})

		}



	})
