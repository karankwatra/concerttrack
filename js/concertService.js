angular.module('concertTrack')
	.service('concertService', function($http) {

		// this.getTop50 = function(){
		// 	return $http.get("http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=9d0565b1e2dc46c94b7169022918d7f7&format=json");
		// }
		this.getLocations = function() {
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

		this.getArtistDates = function(artistName) {
			return $http.get("https://rest.bandsintown.com/artists/" + artistName + "/events/?app_id=adf")
				.then(function(response) {
					return response.data;
				})
		}

		this.getArtistInfo = function(artistName){
			return $http.get("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName + "&api_key=9d0565b1e2dc46c94b7169022918d7f7&format=json")
				.then(function(response){
					// console.log(response.data.artist);
					return response.data.artist;
				})
		}

	})
