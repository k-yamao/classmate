var module = angular.module('classmate-app', ['onsen']);
document.addEventListener ("deviceready", onDeviceReady, false);
function onDeviceReady () {
  
}

var host = "localhost:3000";
var host = "spika.local-c.com:3000";
// 合言葉

// コントローラー
module.controller('mainCtrl', function($scope, $http, $sce, $q, $anchorScroll, $location, $timeout, $element, socket) {
    // document ready
    angular.element(document).ready(function () {
        
        
        if ( monaca.isIOS ) {
			$scope.device.os = 'ios';
    	} else if ( monaca.isAndroid ) {
            $scope.device.os = 'android';
    	} else {
			$scope.device.os = 'etc';
		}
        
        
        // デバイスIDを取得し、ものまねリストを取得する
        monaca.getDeviceId(function(id){
            // デバイスIDを取得する
            if (id != undefined){
                $scope.device.id = id;
            }
        });
        
        $scope.initApp();
        
    });
    $scope.watchword = "a";
    $scope.device = {
        id : null,
    	os : ''
    };
    $scope.user = {
        userID     : "",
        name       : "",
        password   : "",
        avatarURL  : "http://file.local-c.com/uploads/mimicry/noimage.png",
        avatarFile : "",
        token      : "",
        created    : ""
    };
    $scope.conf = {
        "database_name"         : "database",   // DB名
        "database_version"      : "1.0",        // バージョン
        "database_displayname"  : "chatdb",   // 表示名
        "database_size"         : 2000000    // サイズ
    };
    $scope.query = {
        checkUserTable    : 'SELECT COUNT(*) cnt FROM sqlite_master WHERE type="table" AND name="User"',
        dropTabelUser     : 'DROP TABLE IF EXISTS User',
        createTabelUser   : 'CREATE TABLE IF NOT EXISTS User (userID text, name text, password text, avatarURL text, token text, created text)',
        insertTabelUser   : 'INSERT INTO User (userID, name, password, avatarURL, token, created) VALUES ("","","","","","")',
        selectTabelUser   : 'SELECT userID, name, password, avatarURL, token,created FROM User',
        updateTabelUser   : 'UPDATE User SET ',
        deleteTabelUser   : 'DELETE FROM User',
    };
    
    $scope.initApp = function() {
        var db = window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
         // テーブル存在チェック
        db.transaction((function (tx) {
            // テーブルチェック
            tx.executeSql($scope.query.checkUserTable, [], 
                (function(tx, results) {
                     
                    
                    // Peopleテーブル存在して
                    if (results.rows.item(0).cnt > 0) {
                        
                       
                        // 認証処理
                        // ピープルデータ取得
                        db.transaction(
                            (function (tx) {
                                tx.executeSql(
                                    $scope.query.selectTabelUser, 
                                    [], 
                                    // ピープルデータの取得に成功
                                    (function(tx, results) {
                                        var user = results.rows.item(0);
                                        $scope.user.userID    = user.userID;
                                        $scope.user.name      = user.name;
                                        $scope.user.password  = user.password;
                                        $scope.user.avatarURL = user.avatarURL == "" ? "http://file.local-c.com/uploads/mimicry/noimage.png" : user.avatarURL;
                                        $scope.user.token     = user.token;
                                        $scope.user.created   = user.created;
                                        
                                        // 合言葉が正しかったら
                                        if($scope.user.password == $scope.watchword){
                                            
                                            // プロフィールが登録済みか名前でチャック
                                            if (!angular.isUndefined($scope.user.userID) && $scope.user.userID != "") {
                                                
                                                indexNavigator.pushPage("main.html");
                                                
                                                
                                            } else {
                                                
                                                
                                                indexNavigator.pushPage("profile.html");
                                                
                                                
                                            }
                                            
                                            //
                                            
                                            
                                        } else {
                                            // トップページでボタンを表示
                                            $scope.signinStatus = true;
                                            $scope.$apply();   
                                        }
                                        
                                        
                                    }), $scope.errorDB);
                            }), 
                            $scope.errorDB
                        );
                        
                        return true;
                    // Peopleテーブルなし
                    } else {
                        
                       
                        // データベース・テーブル作成処理
                        db.transaction((function (tx) { 
                            // テーブル作成
                            tx.executeSql($scope.query.dropTabelUser);
                            tx.executeSql($scope.query.createTabelUser);
                            tx.executeSql($scope.query.insertTabelUser);
                        }),
                            // 
                        $scope.errorDB,             // テーブル作成失敗
                        (function(tx, results) {    // テーブル作成、空レコード作成成功

                            // トップページでボタンを表示
                            $scope.signinStatus = true;
                            $scope.$apply(); 
                        }));
                            
                            
                        return false;
                    }
                }), $scope.errorDB);
        }), $scope.errorDB);
    
    };
    // ピープルテーブルの更新
    $scope.updateUser = function(){
        
        // データベースオブジェクト取得
        var db = window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
        // スコアを更新
        db.transaction($scope.exeUserUpdate, $scope.errorDB);
       
    };
    // ピープルテーブルの更新
    $scope.exeUserUpdate = function (tx) {
        tx.executeSql(
            $scope.query.updateTabelUser
            + ' userID = "'    + $scope.user.userID        + '"'  
            + ',name     = "'  + $scope.user.name            + '"'
            + ',password = "'  + $scope.user.password        + '"'
            + ',avatarURL = "' + $scope.user.avatarURL        + '"' 
            + ',token    = "'  + $scope.user.token           + '"'
            + ',created  = "'  + $scope.user.created         + '"'
        );
    };
    // データベースのエラー時の処理（アラート）
    $scope.errorDB = function (err) {
        console.log("SQL 実行中にエラーが発生しました: " + err.code);
        
         ons.notification.alert({
                    title: "",
                    message: 'データベースエラー'
                });
        
        
    	// トップページでボタンを表示
		$scope.signinStatus = true;
		$scope.$apply(); 
    };
    /******************************************************************    
     *  サインイン[signin.html]
     *******************************************************************/
    $scope.signin = function(modalFlag){

        // パスワード
        if (angular.isUndefined($scope.user.password) || $scope.user.password == ""){
           
			ons.notification.alert({
          		title  : '',
          		message: '合言葉を確認しください',
          		modifier: 'material'
        	});
            return false;
        }
        
        if (modalFlag) {
            // モーダル表示
            modal.show();
        }
        
        setTimeout(function() {
			
            
			// モーダル非表示
			if (modalFlag) {
				modal.hide();
			}
            console.log($scope.user.password);
             console.log($scope.watchword);
			if($scope.user.password == $scope.watchword){
                
				// DBへ認証OKを保存
				$scope.updateUser();
               
                
                // プロフィール
				indexNavigator.pushPage("profile.html");
				
			} else {
				ons.notification.alert({
					title  : '',
					message: '合言葉が違います、同級生のだれかに聞いてください。',
					modifier: 'material'
        		});
				
			}
			
			
		}, 3000);
        
    };
     /******************************************************************
     *  プロフィール登録編集[profile.html]
     *******************************************************************/
    // プロフィールを保存
    $scope.saveProfile = function() {

 
        
        // 名前の入力チェック
        if (!angular.isUndefined($scope.user.name) && $scope.user.name  == ""){
            ons.notification.alert({title: "入力エラー",messageHTML: "なまえを入力してください"});          
            return false;
        }
        
        // キュー配列        
        var promise_arr = [];
        // プロミス
        var promise = null;
        
        
        if (!angular.isUndefined($scope.user.avatarFile) && $scope.user.avatarFile != ""){
            var fileName =  $scope.device.id  + "-" + Math.floor( new Date().getTime() / 1000 );
            promise = $scope.uploadFile($scope.user.avatarFile, 1, fileName, "");
            console.log(5);
        } else {
            promise = function() {
                var deferred = $q.defer();
                setTimeout(function() {
                    var resolveObj;
                    deferred.resolve(resolveObj);
                }, 1000);
                return deferred.promise;
            };
           
        }
        
        // キュー配列        
        promise_arr.push(promise);
            
        // モーダル表示
        //modal.show();
        //var p  = promise;
        //p.then($scope.setProfile, $scope.errorProfile, $scope.notifyProfile).finally($scope.finallyProfile);
        
        // 音声ファイル、画像ファイルのアップロード 成功したらランキング登録
        //$q.all(promise_arr).then(successCallback, errorCallback, notifyCallback).finally(finallyCallback);
        $q.all(promise_arr).then($scope.setProfile, $scope.errorProfile, $scope.notifyProfile).finally($scope.finallyProfile);
        
        
    };
    $scope.setProfile = function() {
        // ユーザーを更新
        $scope.updateUser();
        // メインタブへ遷移
        indexNavigator.pushPage("main.html");
    };
    $scope.errorProfile = function() {
        
    };    
    $scope.notifyProfile = function() {
        
    };    
     // type : 1:画像ファイル、2:音声ファイル
    $scope.uploadFile = function(mediaFile, type, device_id, ex) {
        //console.log(mediaFile);
        var deferred = $q.defer();
        var ft       = new FileTransfer();
        var path     = mediaFile;
        var options  = new FileUploadOptions();
        var params = {};
        
        options.fileKey = "file";
        options.fileName = mediaFile.substr(mediaFile.lastIndexOf('/') + 1);
        //console.log(options.fileName);
        params.type = type;
        params.filename = device_id;
        params.ex = ex;
        params.dir = 'classmate';
        options.params = params;
    
        //deferred.notify({});// 処理の通知を示す 
        var upSuccess = function(result) {
            var data = JSON.parse(result.response);
           
            if (data.code == 200) {
                if (data.type == 2) {
                    // 音声ファイル
                } else {
                    // 画像ファイル
                    $scope.user.avatarURL = data.fileurl;
                }
            }
            // 処理の成功を示す
            deferred.resolve(data);
        };
        var upError = function(error) {
            var data = error.body;
            $scope.alert("画像登録エラー", true);
            // 処理の失敗を示す
            deferred.reject(data);
        };

        // ファイルアップロード
        ft.upload(path,
            encodeURI("http://file.local-c.com/upload.php"),
            upSuccess,
            upError,
            options);
            

        return deferred.promise; 
    };
     // プロフィール写真を設定するとき処理
    $scope.snapPicture = function(type) {
    	if ($scope.device.os != "etc") {
			// カメラ撮影 or ライブラリ選択
			navigator.camera.getPicture (onSuccess, onFail, 
					{ 
						quality: 100, 
						destinationType: Camera.DestinationType.FILE_URI,
						sourceType: type,
						allowEdit: true,
						targetWidth: 500,
						targetHeight: 500,
						correctOrientation: true, // 撮影時と同じ向きに写真を回転
						saveToPhotoAlbum: false, // 撮影後、端末のアルバムに画像を保存
					}
				);
			// 画像取得に成功してモデルにセットし、HTMLにも設定
			function onSuccess (imageURI) {
				$scope.user.avatarFile = imageURI;
				document.getElementById('picture').src = imageURI;
			}
			// 画像取得に失敗
			function onFail (message) {
				ons.notification.alert({
    				title  : '',
					message: '画像が選択されませんでした。',
					modifier: 'material'
        		});
			}
		} else {
			// webからの処理いつか実装
			
			
			
		}
    };
});


module.factory('socket', function ($rootScope) {
  var socket = io.connect("ws://" + host + "/spika");
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});