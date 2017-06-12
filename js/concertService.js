angular.module('concertTrack')
	.service('concertService', function($http, $q) {

		var top50 = [];
		var top50Dates = [];
		var top50Info = [];

		this.getArtistInfo = function(artistName) {
			return $http.get("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName + "&api_key=9d0565b1e2dc46c94b7169022918d7f7&format=json")
				.then(function(response) {
					return response.data.artist;
				})
		}

		this.getLocations = function() {
			return $http.get("http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=9d0565b1e2dc46c94b7169022918d7f7&format=json")
				.then(function(response) {
					return Promise.all(response.data.artists.artist.map(function(artist) {
						top50.push(artist.name);
						return $http.get("https://rest.bandsintown.com/artists/" + artist.name + "/events/?app_id=adf")
							.then(function(response) {
								top50Dates.push(response.data[0]);
								return response.data[0]
							})
					}))
				})
		}

		this.calcTop50Info = function() {
			return $http.get("http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=9d0565b1e2dc46c94b7169022918d7f7&format=json")
				.then(function(response) {
					return Promise.all(response.data.artists.artist.map(function(artist) {
						return $http.get("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artist.name + "&api_key=9d0565b1e2dc46c94b7169022918d7f7&format=json")
							.then(function(response) {
								return response.data;
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

		this.getTop50 = function() {
			return top50;
		}

		this.getTop50Dates = function() {
			return top50Dates;
		}

		this.getTop50Info = function() {
			return top50Info;
		}

	})
