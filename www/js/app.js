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

        console.log("document ready");
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
        
       
        
        // 初期処理 学校のJSON取得
        $scope.initSchool(function(){
            
            
            
            // 初期処理
            $scope.initApp();
            
        });
        
        // pageがpushされてアニメーションが終了してから発火
        indexNavigator.on('postpop', function(event) {
           if (event.enterPage.name == "photoDetail.html") {
                $scope.photoCarouselShowFlag = false;    
           };
        });
        
         // pageがpushされてアニメーションが終了してから発火
        indexNavigator.on('postpush', function(event) {

            // メインページへ遷移したあとの処理
            if (event.enterPage.name == "photoCarousel.html") {
                // カルーセルのindexを設定
                carousel.setActiveCarouselItemIndex($scope.photoCarouselIdx);
                $scope.photoCarouselShowFlag = true;
                $scope.$apply();
            }
            
            // メインページへ遷移したあとの処理
            if (event.enterPage.name == "main.html") {

                // ニュースリストを取得
                $scope.initNews();
                
                // フォトリストを取得
                $scope.initPhoto();
                   
                // アクティブなタブが変わる前
                tabbar.on('prechange', function(event) {
                    
                    // フォトリストへ変更したとき
                    if (event.index == 1) {
                        // フォトリストを取得
                        $scope.initPhoto();
                    } else if (event.index == 2) {
                        
                    }
                
                });
                                
                // pageがpushされる直前に発火されます。
                indexNavigator.on('prepop', function(event) {
                    // 現在のページオブジェクトを取得する
                    var page = event.currentPage.page; 
                    
                     
                    // メイン画面からの戻るは
                    if(page == "main.html") {
                        event.cancel();
                        // アプリ終了
                        //indexNavigator.app.exitApp();
                    }
                });
              
            }
        });
        
    });
    $scope.topshow = false;
    $scope.schoolYearList = [
        {
            sID  :"1",
            sName:"呉宮原高校2002年卒",
            sURL:"http://miya-ko.local-c.com/",
            sPass:"kitao"
        }
    ];
    $scope.schoolYear =  {
            sID  :"1",
            sName:"呉宮原高校2002年卒",
            sURL:"http://miya-ko.local-c.com/",
            sPass:"kitao"
    };
    $scope.watchword = "KITAO";
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
        created    : "",
        sID        : "",
        sName      : ""
    };
    $scope.conf = {
        "database_name"         : "database",   // DB名
        "database_version"      : "1.0",        // バージョン
        "database_displayname"  : "classmate",   // 表示名
        "database_size"         :  1000000    // サイズ
    };
    $scope.query = {
        checkUserTable    : 'SELECT COUNT(*) cnt FROM sqlite_master WHERE type="table" AND name="User"',
        dropTabelUser     : 'DROP TABLE IF EXISTS User',
        createTabelUser   : 'CREATE TABLE IF NOT EXISTS User (userID text, name text, password text, avatarURL text, token text, created text, sID text)',
        insertTabelUser   : 'INSERT INTO User (userID, name, password, avatarURL, token, created, sID) VALUES ("","","","","","","")',
        selectTabelUser   : 'SELECT userID, name, password, avatarURL, token, created, sID FROM User',
        updateTabelUser   : 'UPDATE User SET ',
        deleteTabelUser   : 'DELETE FROM User',
    };
    $scope.page = {
        
    };
    $scope.initApp = function() {
        
        // DBをオープン
        var db = window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
        
        // テーブル存在チェック
        db.transaction((function (tx) {
            // テーブルチェック
            tx.executeSql($scope.query.checkUserTable, [], (function(tx, results) {
                
                    // Userテーブル存在して
                    if (results.rows.item(0).cnt > 0) {
                    //if(false){
                        
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
                                        $scope.user.sID       = user.sID;



                                        if (!angular.isUndefined($scope.user.sID) && $scope.user.sID != "" ) {
                                            $scope.schoolYear = $scope.schoolYearList[$scope.user.sID];
                                        }

                                        // 合言葉が正しかったら
                                        if($scope.user.password != "" && $scope.user.password != $scope.schoolYearList[$scope.user.sID]){
                                            
                                            if (!angular.isUndefined($scope.schoolYearList[$scope.user.sID]) && $scope.schoolYearList[$scope.user.sID].sName != "") {
                                                $scope.user.sName = $scope.schoolYearList[$scope.user.sID].sName;    
                                            }
                                            
                                            
                                            // プロフィールが登録済みか名前でチャック
                                            if (!angular.isUndefined($scope.user.userID) && $scope.user.userID != "") {
                                                // メインページへ遷移                                                
                                                indexNavigator.pushPage("main.html");
                                            } else {
                                                $scope.topshow = true;
                                                // 認証させる
                                                indexNavigator.pushPage("top.html");
                                                $scope.topshow = true;
                                                $scope.$apply();
                                            }
                                            
                                        } else {
                                            
                                            if (!angular.isUndefined($scope.schoolYearList[$scope.user.sID]) && $scope.schoolYearList[$scope.user.sID].sName != "") {
                                                $scope.user.sName = $scope.schoolYearList[$scope.user.sID].sName;    
                                            }
                                            
                                            // トップページでボタンを表示
                                            $scope.topshow = true;
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
                            $scope.topshow = true;
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
        
        //console.log("DB open update");
        
        // スコアを更新
        db.transaction($scope.exeUserUpdate, $scope.errorDB);
        
    };
    // ピープルテーブルの更新
    $scope.exeUserUpdate = function (tx) {
         // console.log($scope.query.updateTabelUser
         //    + ' userID = "'    + $scope.user.userID       + '"'  
         //    + ',name     = "'  + $scope.user.name         + '"'
         //    + ',password = "'  + $scope.user.password     + '"'
         //    + ',avatarURL = "' + $scope.user.avatarURL    + '"' 
         //    + ',token    = "'  + $scope.user.token        + '"'
         //    + ',created  = "'  + $scope.user.created      + '"');
        
        
        tx.executeSql(
            $scope.query.updateTabelUser
            + ' userID = "'    + $scope.user.userID       + '"'  
            + ',name     = "'  + $scope.user.name         + '"'
            + ',password = "'  + $scope.user.password     + '"'
            + ',avatarURL = "' + $scope.user.avatarURL    + '"' 
            + ',token    = "'  + $scope.user.token        + '"'
            + ',created  = "'  + $scope.user.created      + '"'
            + ',sID  = "'      + $scope.user.sID          + '"'
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
		$scope.topshow = true;
		$scope.$apply(); 
    };
     // ピープルテーブルの削除
    $scope.deleteUser = function(){
        // データベースオブジェクト取得
        var db = window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
        // ピープルテーブルを削除
        db.transaction($scope.exeUserDelete, $scope.errorDB);    
    };
    // ユーザーテーブルの削除
    $scope.exeUserDelete = function (tx) {
        tx.executeSql(
            $scope.query.updateTabelUser
            + ' password = ""'
        );
    };
    /******************************************************************    
     *  サインイン[signin.html]
     *******************************************************************/
    
    $scope.newClassmate = function(callback) {
      
      var mail_address = 'info@local-c.com';
      var mail_content = "新規同窓会登録";
    
      if (monaca.isAndroid === true) {
        window.plugins.webintent.startActivity({
          action: window.plugins.webintent.ACTION_VIEW,
          url: 'mailto:' + mail_address + '?body=' + mail_content
          },
          function() {},
          function() {}
        );
      } else if ( monaca.isIOS === true ) {
        var mailto = 'mailto:' + mail_address;
        mailto = mailto + 
          "?subject=新規同窓会登録&body=同窓会タイトル：□□□、認証キワード：□□□¥nを記載してメールを頂けますでしょうか。コンテツの登録について登録方法をご連絡いたします。";
    
        location.href= mailto;
      }
      
        
    };
    $scope.initSchool = function(callback) {

        var param = {};
        $scope.getList($scope.api.school, param, $scope.limit, $scope.offset, function(data) {        

            if (!angular.isUndefined(data)) {
                
                 $scope.schoolYearList = data.data;
                 
                 callback();
            }
            
        });
    };
     
    $scope.signin = function(modalFlag){

        // なまえ
        if (angular.isUndefined($scope.user.name) || $scope.user.name == ""){
           
			ons.notification.alert({
          		title  : 'エラー',
          		message: 'なまえを入力しください',
          		modifier: 'material'
        	});
            return false;
        }
        // パスワード
        if (angular.isUndefined($scope.user.password) || $scope.user.password == ""){
           
    		ons.notification.alert({
          		title  : 'エラー',
          		message: '認証キーワードを入力してください',
          		modifier: 'material'
        	});
            return false;
            
        }
        // ユーザーIDがなかったら
        if(angular.isUndefined($scope.user.userID) || $scope.user.userID == "") {
            // デバイスIDを設定する
            $scope.user.userID = $scope.device.id;
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
            
            // 大文字に変換
            $scope.user.password = $scope.user.password.toUpperCase();
            
            console.log($scope.schoolYear);
            
            
			if($scope.user.password == $scope.schoolYear.sPass){
                
				// DBへ認証OKを保存
				$scope.updateUser();
                
                
                // メインタブへ遷移
                indexNavigator.pushPage("main.html");
			} else {
				ons.notification.alert({
					title  : '認証に失敗',
					message: '認証キーワードが正しくありません。',
					modifier: 'material'
        		});
				
			}
		}, 3000);
        
    };
    
   
    $scope.dialogs = {};
    $scope.show = function(dlg) {
        if (!$scope.dialogs[dlg]) {
          ons.createDialog(dlg).then(function(dialog) {
            $scope.dialogs[dlg] = dialog;
            dialog.show();
          });
        } else {
          $scope.dialogs[dlg].show();
        }
    };
    // 生年月日を設定
    $scope.setSchoolYear = function(item){

        $scope.schoolYear = item;
        $scope.user.sName = item.sName;
        $scope.user.sID = item.sID;
        $scope.api.news = item.sURL + "/api/get_posts/";
        $scope.api.photo = item.sURL + "/api/get_page_index/";
        // ダイアログ非表示
        $scope.dialog.hide();
       
        
    };
    /******************************************************************
     *  API URL
     *******************************************************************/
    $scope.api = {
        school: "http://classmate.local-c.com/classmate.json",
        news  : "http://miya-ko.local-c.com/api/get_posts/",
        photo : "http://miya-ko.local-c.com/api/get_page_index/"
    };
    $scope.limit = 100;
    $scope.offset = 0;
    
    /******************************************************************
     *  ニュース一覧[news.html] sboard
     *******************************************************************/
     
    $scope.newsList = [];
    $scope.news =  {};
    $scope.initNews = function() {
        var param = {};

        $scope.getList($scope.api.news, param, $scope.limit, $scope.offset, function(data) {        
            
            if (!angular.isUndefined(data) && data.status == "ok") {
                $scope.newsList = data.posts;
            }
            
        });
    };
    $scope.loadNews = function($done) {
        
        $timeout(function() {        
             var param = {};

             $scope.getList($scope.api.news, param, $scope.limit, $scope.offset, function(data) {        
            
                if (!angular.isUndefined(data) && data.status == "ok") {
                    $scope.newsList = data.posts;
                }
                 // コールバックしてDONE
                $done();
            
             });
        }, 1000);
    };
    $scope.newsDetail = function(idx) {
        $scope.news = $scope.newsList[idx];
        indexNavigator.pushPage("newsDetail.html");
    };
    /******************************************************************
     *  フォト一覧[photo.html] sboard
     *******************************************************************/
    $scope.photoList = [];
    $scope.photo     = {};
    $scope.photoRow  = {};
    $scope.photoRowList = [];
    $scope.photoIdx  = 0;
    $scope.photoCarouselList = [];
    $scope.photoCarouselIdx = 0;
    $scope.photoCarouselShowFlag = false;
    $scope.initPhoto = function() {
        var param = {};

        $scope.getList($scope.api.photo, param, $scope.limit, $scope.offset, function(data) {        
            
            if (!angular.isUndefined(data) && data.status == "ok") {
                $scope.photoList = data.pages;
            }
            
        });
        
    };
    $scope.loadPhoto = function($done) {
        var param = {};

        $scope.getList($scope.api.photo, param, $scope.limit, $scope.offset, function(data) {        
            
            if (!angular.isUndefined(data) && data.status == "ok") {
                $scope.photoList = data.pages;
            }
        });
      
    };
    $scope.photoDetail = function(idx) {

        // フォト詳細のリストを初期化
        $scope.photoRowList = [];
        $scope.photoIdx = idx;
        var p = $scope.photoList[$scope.photoIdx];
        $scope.photo.title = p.title;
        var photoSize = p.attachments.length;
        var j = 0;
        var photoRow = [];
        for (var i=0 ; i<photoSize ; i++){
            
            var photoCol = {};
            photoCol.idx = i;
            photoCol.url = p.attachments[i].images.thumbnail.url;
            photoRow[j] = photoCol;
            
            if (j == 2) {
                $scope.photoRowList.push(photoRow);
            }

            ++j;
            
            if (j > 2) {
                j = 0;
                photoRow = [];
            }
        }
        //console.log($scope.photoRowList.length);
        indexNavigator.pushPage("photoDetail.html");
    };
    $scope.photoCarousel = function(pIdx, idx) {
        
        $scope.photoCarouselList = [];
        $scope.photoCarouselIdx = idx;
        var p = $scope.photoList[pIdx];
        var photoSize = p.attachments.length;
        
        for (var i=0 ; i<photoSize ; i++){
            var photo = {};
            photo.idx = i;
            photo.url = p.attachments[i].images.medium.url;
            $scope.photoCarouselList.push(photo);
        }
        
        indexNavigator.pushPage("photoCarousel.html");
        
    };
    /******************************************************************
     *  API接続GET
     *******************************************************************/
    $scope.getList = function (url, param, limit, offset, callback){

        $http({
            method: 'GET',
            url : url + "?limit=" + limit + "&offset=" + offset + $scope.getSearchParam(param),
            headers: { 'Content-Type': 'application/json' },
        }).success(function(data, status, headers, config) {

            // ボードの処理が終わったらコールバック
            callback(data);

        }).error(function(data, status, headers, config) {
            ons.notification.alert({
    				title  : 'エラー',
					message: 'データの取得に失敗しました',
					modifier: 'material'
        	});
           
        }).finally(function() {
            // モーダル非表示
            modal.hide();
            
        });

    };
     // 検索パラメーター文字列を生成
    $scope.getSearchParam = function(param) {
        
        var paramText = ""
        
        if (!angular.isUndefined(param) || param != "") {
            var amp   = "&";
            for (var key in param) {
                if (human.hasOwnProperty(key)) {
                    var value = param[key];
                    paramText += amp + key, "=" + value;
                }
            }
        } 
        return paramText;
    };
    
     /******************************************************************
     *  設定[setting.html] ssetting
     *******************************************************************/
    $scope.pushProfileEdit = function() {
        
        // プロフィールへ遷移
        indexNavigator.pushPage("profile.html");
        
    };
    // 利用規約
    $scope.agreement = function() {
       window.open('http://street.local-c.com/classmate_rule.html', '_blank', 'location=yes');
    };
    // プライバシーポリシー
    $scope.privacy = function() {
       window.open('http://street.local-c.com/classmate_privacy.html', '_blank', 'location=yes');
    };
    $scope.signout = function() {
        // ピープル情報を削除
        $scope.deleteUser();
		// 初期起動
		$scope.initApp();
        
        indexNavigator.pushPage("top.html");

    };
    $scope.mailer = function (){
      var mail_address = 'yamao1983@i.softbank.jp';
      var mail_content = "お問い合わせ内容を入力してメールしてください。";
    
      if (monaca.isAndroid === true) {
        window.plugins.webintent.startActivity({
          action: window.plugins.webintent.ACTION_VIEW,
          url: 'mailto:' + mail_address + '?body=' + mail_content
          },
          function() {},
          function() {}
        );
      } else if ( monaca.isIOS === true ) {
        var mailto = 'mailto:yamao1983@i.softbank.jp';
        mailto = mailto + 
          "?subject=同窓会アプリ問い合わせ&body=お問い合わせ内容を入力してメールしてください。";
    
        location.href= mailto;
      }
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
/**
 * 日付カスタム
 * フォーマット
 */
module.filter('dateReplace', function() {
    return function(input) {
        
        if (!angular.isUndefined(input) && input != ""){
            return input.substring(10,-1);
        } else {
            return input;
        }
        
    }
});

/**
 * HTMLタグの削除
 * フォーマット
 */
module.filter('removeHTML', function() {
    return function(input) {
        
        if (!angular.isUndefined(input) && input != ""){
            var txt = input.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
            txt = txt.replace(/&nbsp;/g,'');
            return txt
        } else {
            return input;
        }
        
    }
});

module.filter('substr', function() {
    return function(input, from, to) {
        // do some bounds checking here to ensure it has that index
        //return input.substring(from, to);
        var inputtext = String(input);
        return inputtext.substring(from, to);
        
    }
});

/**
 * 改行コードをBR　変換
 * フォーマット 2/21 13:48
 */
module.filter('nl2br', function($sce) {
    return function (input, exp) {
       var replacedHtml = input.replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
       return $sce.trustAsHtml(replacedHtml.replace(/\n|\r/g, '<br>'));
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