(function(angular, undefined) {
  angular.module("xMember.constants", [])

.constant("appConfig", {
	"userRoles": [
		"guest",
		"user",
		"admin"
	],
	"socketUrl": "https://xfans.biz",
	"version": "2.0.0",
	"buildNumber": "11",
	"enableRTMP": false,
	"showBuild": false,
	"cdn": {
		"video": "",
		"file": ""
	},
	"siteName": "siteName",
	"twitterName": "@siteName"
})

;
})(angular);