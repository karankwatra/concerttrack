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
			console.log($scope.concerts);
			$scope.concerts.forEach(function(concert) {
				if (concert && concert.venue && concert.venue.latitude) {
					var marker = new window.google.maps.Marker({
						title: concert.lineup[0],
						position: {
							lat: parseFloat(concert.venue.latitude),
							lng: parseFloat(concert.venue.longitude)
						},
						map: map,
						animation: google.maps.Animation.DROP,
						icon: 'marker.png'
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
							"<button id='buy-tickets' class='#26a69a lighten-1 waves-effect waves-light btn'> <a style='color:white' target=_blank href=" + concert.url + ">Buy Tickets</a></button>" + " " +
							"<button id='artistInfobtn' ng-click=goToArtist(" + concert.lineup[0] + ") class=' #26a69a lighten-1 waves-effect waves-light btn'>View Artist Info</button></div><br>"
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
						for (var i = 0; i < markers.length; i++) {
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
				if (results.length === 0) {
					Materialize.toast(searchItem + " has no upcoming dates.", 3000)
				} else {
					mapConcerts();
				}

			})
		}

		angular.element(document).ready(function() {
			$('.tooltipped').tooltip({
				delay: 50
			});
		});

		$scope.filterSearch = function() {
			var top50 = concertService.getTop50();
			var top50Dates;
			var top50Info;
			var genresChosen = $scope.genresChosen;
			var concerts = [];
			if ($scope.searchItem) {
				if ($scope.fromDate && $scope.toDate) {
					if (moment($scope.fromDate, 'MM/DD/YYYY').isBefore(moment($scope.toDate, 'MM/DD/YYYY'))) {
						concertService.getArtistDates($scope.searchItem).then(function(response) {
							for (var concert of response) {
								if (moment(concert.datetime).isBetween(moment($scope.fromDate, 'MM/DD/YYYY'), moment($scope.toDate, 'MM/DD/YYYY'))) {
									if ($scope.location) {
										if (concert.venue.city === $scope.location || concert.venue.region === $scope.location) {
											concerts.push(concert);
										}
									} else {
										concerts.push(concert);
									}
								}
							}
							if (concerts.length === 0) {
								Materialize.toast("Could not find concerts for your request.", 3000)
							} else {
								$scope.concerts = concerts;
								mapConcerts();
							}

						})
					} else {
						Materialize.toast("Please enter your dates correctly!", 3000)
					}
				} else if ($scope.location) {
					concertService.getArtistDates($scope.searchItem).then(function(response) {
						for (var concert of response) {
							if (concert.venue.city === $scope.location || concert.venue.region === $scope.location) {
								concerts.push(concert);
							}
						}
						if (concerts.length === 0) {
							Materialize.toast("Could not find concerts for your request.", 3000)
						} else {
							$scope.concerts = concerts;
							mapConcerts();
						}
					})
				}

			} else {
				concertService.getLocations().then(function(response) {
					top50Dates = response;
					concertService.calcTop50Info().then(function(response) {
						top50Info = response;
						if(genresChosen){
							for (var i = 0; i < top50Info.length; i++) {
								for (var j = 0; j < top50Info[i].artist.tags.tag.length; j++) {
									if (genresChosen.includes(top50Info[i].artist.tags.tag[j].name)) {
										concerts.push(top50Dates[i]);
									}
								}
							}
						}
						else{
							concerts = top50Dates;
						}
						if($scope.fromDate && $scope.toDate){
							var new_concerts = [];
							for(var concert of concerts){
								console.log(concert);
								if(concert){
									if(moment(concert.datetime).isBetween(moment($scope.fromDate, 'MM/DD/YYYY'), moment($scope.toDate, 'MM/DD/YYYY'))){
										new_concerts.push(concert)
									}
								}

							}
							concerts = new_concerts;
						}
						if($scope.location){
							var new_concerts = [];
							for(var concert of concerts){
								if(concert){
									if (concert.venue.city === $scope.location || concert.venue.region === $scope.location) {
										new_concerts.push(concert);
									}
								}
							}
							concerts = new_concerts;
						}

						$scope.concerts = concerts;
						mapConcerts();
					});
				});

			}

		}


	})
