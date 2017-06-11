angular.module('concertTrack')
	.controller("artistCtrl", function($scope, $stateParams, concertService, $sce, $state) {
		var artistToGet = $stateParams.artistName;
		concertService.getArtistInfo(artistToGet).then(function(results) {
			$scope.artistInfo = results;
			$scope.trustedContent = $sce.trustAsHtml(results.bio.summary);
			$scope.genres = results.tags.tag;
			$scope.similarArtists = results.similar.artist;
		});
		concertService.getArtistDates(artistToGet).then(function(results) {
			$scope.nextDate = results[0];
			$scope.date = moment($scope.nextDate.datetime).format('MMMM Do YYYY, h:mm a');
			$scope.region = "";
			if ($scope.nextDate.venue.region) {
				if ($scope.nextDate.venue.country === "United States" || $scope.nextDate.venue.country === "Canada") {
					$scope.region = $scope.nextDate.venue.region + ", "
				}
				if ($scope.nextDate.venue.region === $scope.nextDate.venue.country) {
					$scope.region = $scope.nextDate.venue.country;
				} else {
					$scope.region += $scope.nextDate.venue.country;
				}
			} else {
				$scope.region = $scope.nextDate.venue.country;
			}
		})

		$scope.searchArtist = function(searchItem) {
			console.log(searchItem);
			$state.go("artistInfo", {
				artistName: searchItem
			})
		}




	})
