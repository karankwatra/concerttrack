angular.module('concertTrack')
.controller("artistCtrl", function($scope, $stateParams, concertService, $sce){
	var artistToGet = $stateParams.artistName;
	concertService.getArtistInfo(artistToGet).then(function(results){
		//console.log(results);
		$scope.artistInfo = results;
		console.log($scope.artistInfo.image[3]["#text"]);
		$scope.trustedContent = $sce.trustAsHtml(results.bio.summary);
		console.log($scope.trustedContent);
	});
})
