'use strict';


// Declare app level module which depends on filters, and services
var smgContainer = angular.module('smgContainer', ['ngResource', 'ngRoute', 'ngCookies', 'ngSanitize','ui.bootstrap', 'pascalprecht.translate']);

smgContainer.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
				when('/selectGame', {
					templateUrl: 'templates/selectGame.html',
					controller: 'SelectGameController'
				}).
				when('/:gameId/match/:matchId', {
					templateUrl: 'templates/match.html',
					controller: 'MatchController'
				}).
				when('/lobby/:gameId', {
					templateUrl: 'templates/lobby.html',
					controller: 'LobbyController'
				}).
				when('/logout', {
					templateUrl: 'templates/logout.html',
					controller: 'LogoutController'
				}).
				when('/:gameId/standalone:mode?:timeOfEachTurn?', {
					templateUrl: 'templates/standalone.html',
					controller: 'StandaloneController'
				}).
				when('/gameResult/:gameId', {
					templateUrl: 'templates/gameResult.html',
					controller: 'GameResultController'
				}).
				otherwise({
					redirectTo: '/'
				});
}]);

smgContainer.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

smgContainer.config(function($translateProvider) {
	$translateProvider.translations('en', {
		LANGUAGE: 'Language',
		ENGLISH: 'English',
		CHINESE: 'Chinese',
		BRAND: 'AngularJS Container',
		GAMES: 'Games',
		AUTOMATCH: 'Auto Match',
		PASSANDPLAY: 'Pass & Play',
		PLAYWITHAI: 'Play with AI',
		TIMELIMIT: 'Time limit',
		NOTIMELIMIT: 'No time limit',
		CURRENTTURN: 'Current turn',
		LEFTTIME: 'Left time',
		YOURINFO: 'Your infomation',
		OPPONENTINFO: 'Opponent Information',
		FIRSTNAME: 'First name',
		LASTNAME: 'Last name',
		NICKNAME: 'Nick name',
		LOGIN: 'Login',
		LOGOUT: 'Logout',
		REGISTER: 'Register',
		EMPTY: 'empty...',
		PLAYER: 'Player',
		GAME: 'Game',
		REFRESH: 'Refresh',
		QUIT: 'quit',
		PASSWORD: 'Password',
		CLOSE: 'Close',
		REGISTERSUCCESS: 'Welcome! Your player ID is ',
		WINNER: 'Winner',
		WINNERMSG: 'Congratulation, You won!',
		LOSERMSG: 'Maybe next time...',
		BACKTOLOBBY: 'Back to the lobby',
		AUTOMATCHSUCCESS: 'You\'ve joined the queue, try to refresh the side panel to check for new matches...',
		AUTOMATCHFAIL: 'Sorry, you can only have at most one match per game for now.\n (Otherwise something goes wrong on the server side...)',
		MATCH: 'match'
	});
	$translateProvider.translations('cn', {
		LANGUAGE: '语言',
		ENGLISH: '英文',
		CHINESE: '中文',
		BRAND: 'AngularJS Container',
		GAMES: '游戏',
		AUTOMATCH: '自动配对',
		PASSANDPLAY: '传和玩...',
		PLAYWITHAI: '对战电脑',
		TIMELIMIT: '时间限制',
		NOTIMELIMIT: '无',
		CURRENTTURN: '当前回合',
		LEFTTIME: '剩余时间',
		YOURINFO: '玩家信息',
		OPPONENTINFO: '对手信息',
		FIRSTNAME: '名',
		LASTNAME: '姓',
		NICKNAME: '昵称',
		LOGIN: '登陆',
		LOGOUT: '登出',
		REGISTER: '注册',
		EMPTY: "无...",
		PLAYER: '玩家',
		GAME: '游戏',
		REFRESH: '刷新',
		QUIT: '退出',
		PASSWORD: '密码',
		CLOSE: '关闭',
		REGISTERSUCCESS: '欢迎! 你的用户ID是 ',
		WINNER: '赢家',
		WINNERMSG: '恭喜! 你赢啦!!!',
		LOSERMSG: '→_→ 再接再厉呗...',
		BACKTOLOBBY: '返回游戏大厅',
		AUTOMATCHSUCCESS: '你已成功进入自动配对队列, 请点击侧边栏刷新按钮查看已配对比赛',
		AUTOMATCHFAIL: '抱歉, 目前你最多每个游戏只能进行一场比赛... (如果不是的话就是服务器那边出问题了.)',
		MATCH: '局'
	});
	$translateProvider.preferredLanguage('en');
});