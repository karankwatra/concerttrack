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
				mapConcerts();
			})
		}

		$(document).ready(function() {
  			$('select').material_select();
			$('.tooltipped').tooltip({delay: 50});
		});

		$scope.filterSearch = function(){
			var top50 = concertService.getTop50();
			var top50Dates = concertService.getTop50Dates();
			var genresChosen = $scope.genresChosen;
			var top50Info = concertService.getTop50Info();
			var concerts = [];
			//length shows as 0 but array is definitely not empty
			console.log(top50Info.length);
			for(var i = 0; i < top50Info.length; i++){
				console.log(top50Info[i]);
				for(j = 0; j < top50Info[i].tags.tag.length; j++){
					if(genresChosen.includes(top50Info.tags.tag[j])){
						concerts.push(top50Dates[i]);
						break;
					}
				}
			}
			console.log(concerts);
		}

		setInterval(function(){
			if($scope.searchItem){
				$('#genre-dropdown').prop('disabled', true);
				$('select').material_select();
			}
			else if($('#genre-dropdown').prop('disabled') && !$scope.searchItem){
				$('#genre-dropdown').prop('disabled', false);
				$('select').material_select();
			}
		}, 10);
	})
