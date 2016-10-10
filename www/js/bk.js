//var module = ons.bootstrap('my-app', ['onsen']);
var module = angular.module('chat-app', ['onsen']);
//var module = ons.bootstrap('chat-app', ['onsen']);
document.addEventListener ("deviceready", onDeviceReady, false);


function onDeviceReady () {
    //navigator.splashscreen.hide();
}

//document.addEventListener("offline", function(){console.log('nettest');}, false);
var host = "localhost:3000";
var host = "spika.local-c.com:3000";

// コントローラー
module.controller('mainCtrl', function($scope, $http, $sce, $q, $anchorScroll, $location, $timeout, $element, socket) {

    
  	// document ready
    angular.element(document).ready(function () {
		
		if ( monaca.isIOS ) {
			$scope.device.os = 'ios';
        	navigator.splashscreen.hide();
			
    	} else if ( monaca.isAndroid ) {
            $scope.device.os = 'android';
    	} else {
			$scope.device.os = 'etc';
		}
		
        
        // オンラインになったとき、このイベントが発火
        document.addEventListener("online", function(){
                modal.hide();
                
                
        }, false);
        //アプリがオフラインになったときに、このイベントが発火
        document.addEventListener("offline", function(){
                
			var page = indexNavigator.getCurrentPage().page;
			// メイン画面からの戻るは
			if(page == $scope.page.talk || page == $scope.page.profileEdit) {
				indexNavigator.popPage();
				modal.show();
			}
			
				
			modal.show();
                
        }, false);

        
        
        
        // document.addEventListener("backbutton", function(){
        //     
        //     console.log('バックボタン');
        //     //console.log(indexNavigator.getCurrentPage());
        //     var p = indexNavigator.getCurrentPage();
        //     ons.notification.alert({
        //       title  : 'バックボタン',
        //       message: p
        //     });
        //     
        // }, false);
        
        
        
        // デバイスIDを取得し、ものまねリストを取得する
        monaca.getDeviceId(function(id){
            // デバイスIDを取得する
            if (id != undefined){
                $scope.device.id = id;
            }
        });

        // アプリ起動時の処理
        $scope.initApp();

        // pageがpushされてアニメーションが終了してから発火
        indexNavigator.on('postpop', function(event) {
            
            // メインページへ遷移したあとの処理
            if (event.enterPage.name == $scope.page.main) {
                $scope.initRoom();
            }
            
            // トークページへ遷移したらアラートを表示しない
            if (event.enterPage.name == $scope.page.talk) {
                $scope.newMsgAlert = false;
            } else {
                $scope.newMsgAlert = true;
            }
            
            // console.log('========');
            // console.log($scope.newMsgAlert);
            // console.log(event.enterPage.name);
            // console.log('========');
        
        });
        // pageがpushされてアニメーションが終了してから発火
        indexNavigator.on('postpush', function(event) {

            // トークページへ遷移したらアラートを表示しない
            if (event.enterPage.name == $scope.page.talk) {
                $scope.newMsgAlert = false;
            } else {
                $scope.newMsgAlert = true;
            }
            
            // メインページへ遷移したあとの処理
            if (event.enterPage.name == $scope.page.main) {

                // ボードリストを取得
                $scope.initBoard();
                
                $scope.initRoom();
                /**
                 * タブのイベントを設定
                 */                
                // アクティブなタブが変わる前
                tabbar.on('prechange', function(event) {
                    
                    // ルームリストへ変更したとき
                    if (event.index == 1) {
                       
                        // 部屋リストを取得
                        $scope.initRoom();
                    } else if (event.index == 2) {
                        // 気になるリストを取得
                        $scope.initPick();
                    }
                    //console.log('tab prechange:タブが変わった前');
                    
                });
                                
                // pageがpushされる直前に発火されます。
                indexNavigator.on('prepop', function(event) {
                    // 現在のページオブジェクトを取得する
                    var page = event.currentPage.page; 
                    
                    // メイン画面からの戻るは
                    if(page == $scope.page.main) {
                         event.cancel();
                    }
                });
                
                // アクティブなタブが変わった後
                // tabbar.on('postchange', function(event) {
                //     // ボードリストを取得
                //     //$scope.initBoard();
                //     // 部屋リストを取得
                //     //$scope.initRoom();
                //     console.log('tab postchange:タブが変わった後');
                //     
                // });
                
                
            }
        });
        
        
    });
    $scope.newMsgAlert = true;
    $scope.webAPI = {
        URL    : "http://" + host + "/spika/v1",
        people  : "/people",
        profile : "/profile",
        signin  : "/signin",
        board   : "/board",
        pick    : "/pick",
        room    : "/room",
        report  : "/report",
        msg     : "/msg",
        list    : "/list",
        count   : "/count",
        delete  : "/delete",
        change  : "/change",
        read    : "/read"
    };
    
    $scope.imgBaseURL = "http://spika.local-c.com:3000/spika/v1/file/download/";
    // ボードのデフォルト検索検索LIMIT
    $scope.boardListLimit = 200;
    // オートログインの期間
    $scope.autoLoginTime = Math.floor( new Date().getTime() / 1000 ) - 5184000; // 2ヶ月前
    $scope.networkState = false;
    
    // ネットワークオンラインチェック    
    $scope.isOnline = function() {
		if ($scope.device.os != "etc") {
			if (navigator.connection.type != "none") {
				$scope.networkState = true;
				return true;
        	} else {
				$scope.networkState = false;
				return false;
        	}
		} else {
			
			$scope.networkState = navigator.onLine;
			return $scope.networkState;
		}
        
    };
    $scope.device = {
        id : null,
		os : ''
    };
    $scope.options = {
          animation: 'slide', // アニメーションの種類
          onTransitionEnd: function() {} // アニメーションが完了した際によばれるコールバック
    };
    $scope.page = {
        setting     : 'setting.html',       // 設定
        boardMsg    : 'boardMsg.html',    	// メッセージ
        boardSearch : 'boardSearch.html',  	// ボード検索条件
        profile     : 'profile.html',		// プロフィール
		profileEdit : "profileEdit.html",   // プロフィール編集
        main        : 'main.html',			// メイン
        talkroom    : 'talkroom.html',		// 部屋一覧
        talk        : 'talk.html',		    // トーク
        signup      : 'signup.html',		// 新規登録
        login       : 'login.html',			// ログイン
        signin      : 'signin.html',    	// サイイン
        auth        : 'auth.html',			// 認証ページ
        top         : 'top.html',    		// トップページ
        password    : 'password.html'    	// パスワード初期化
    };
    // 画面遷移イベント
    $scope.movePage = function(page, options) {
        
        // オプションの指定がなければ、デフォルトオプション
        if (angular.isUndefined(options)){
            indexNavigator.pushPage(page, $scope.options);
        } else {
            // 指定がなければ、引数のオプション
            indexNavigator.pushPage(page, options);
        }
    };
    // 内部ブラウザを起動
    $scope.openWindow = function(url) {
        //console.log(url);
        window.open(url, '_blank', 'location=yes');
    };
    // 画面遷移
    $scope.movePopPage = function(options) {
        
        // オプションの指定がなければ、デフォルトオプション
        if (angular.isUndefined(options)){
            indexNavigator.popPage($scope.options);
        } else {
            // 指定がなければ、引数のオプション
            indexNavigator.popPage(options);
        }
        
    };
    $scope.people = {
        peopleID    : "",
        mail        : "",
        password    : "",
        nicname     : "",
        imageURL    : "http://file.local-c.com/uploads/mimicry/noimage.png",
        imageFile   : "",
        sex         : "女性",
        birthDay    : "",
        pref        : "",
        city        : "",
        appeal      : "",
        phrase      : "",
        auth        : "0",
        token       : "",
        loging      : "0",
        updated     : "0",
        created     : "0"
    };
    $scope.birth = {
        year  : "",
        month : "",
        day   : ""
    }
    // type　1:birthDayへセット、2:birthへセット
    $scope.convertBirthDay = function(type) {
        if (type == 1) {
            // 生年月日を年月日に設定
            $scope.people.birthDay = $scope.birth.year + $scope.birth.month + $scope.birth.day;    
        } else {
            if ($scope.people.birthDay != "") {
                $scope.birth.year  = $scope.people.birthDay.substr(0,4);
                $scope.birth.month = $scope.people.birthDay.substr(4,2);
                $scope.birth.day   = $scope.people.birthDay.substr(6,2);    
            }
        }
    };   
    // アラートダイアログ
    $scope.alert = function(msg, material) {
        ons.notification.alert({
          title  : '',
          message: msg,
          modifier: material ? 'material' : undefined
        });
    };
    
    $scope.db     = null;
    $scope.istable = false;
    $scope.conf = {
        "database_name"         : "database",   // DB名
        "database_version"      : "1.0",        // バージョン
        "database_displayname"  : "chatdb",   // 表示名
        "database_size"         : 2000000    // サイズ
    };
    // プロフィールの入力フォームダイアログ
    $scope.yearList  = ["2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","2003","2002","2001","2000","1999","1998","1997","1996","1995","1994","1993","1992","1991","1990","1989","1988","1987","1986","1985","1984","1983","1982","1981","1980","1979","1978","1977","1976","1975","1974","1973","1972","1971","1970","1969","1968","1967","1966","1965","1964","1963","1962","1961","1960","1959","1958","1957","1956","1955","1954","1953","1952","1951","1950","1949","1948","1947","1946","1945","1944","1943","1942","1941","1940","1939","1938","1937","1936","1935","1934","1933","1932","1931","1930","1929","1928","1927","1926","1925","1924","1923","1922","1921","1920"];
    $scope.monthList = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    $scope.dayList   = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"];
    $scope.prefList   = ["北海道","青森","岩手","宮城","秋田","山形","福島","茨城","栃木","群馬","埼玉","千葉","東京","神奈川","新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知","三重","滋賀","京都","大阪","兵庫","奈良","和歌山","鳥取","島根","岡山","広島","山口","徳島","香川","愛媛","高知","福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄"];
    
    // クエリー
    $scope.query = {
        checkPeopleTable    : 'SELECT COUNT(*) cnt FROM sqlite_master WHERE type="table" AND name="People"',
        dropTabelPeople     : 'DROP TABLE IF EXISTS People',
        createTabelPeople   : 'CREATE TABLE IF NOT EXISTS People (_id text, peopleID text, mail text, password text, nicname text, imageURL text, auth text, token text, sex text, birthDay text, pref text, city text, appeal text, phrase text, loging text, updated text, created text)',
        insertTabelPeople   : 'INSERT INTO People (_id, peopleID, mail, password, nicname, imageURL, auth, token, sex, birthDay, pref, city, appeal, phrase, loging, updated, created) VALUES ("","","","","","","","","","","","","","","","","")',
        selectTabelPeople   : 'SELECT _id, peopleID, mail, password, nicname, imageURL, auth, token, sex, birthDay, pref, city, appeal, phrase, loging, updated, created FROM People',
        updateTabelPeople   : 'UPDATE People SET ',
        deleteTabelPeople   : 'DELETE FROM People',
        
    };
    
    /*******************************************************************
     * アプリ起動時、トップ画面 [top.html]
     *******************************************************************/
    $scope.signinStatus = false;
    $scope.initApp = function() {        /**
         * DBからメール、パスワード、ログイン期間を取得
         */         
        // データベースオブジェクト取得
        //$scope.db = $scope.getDB();
        var db = window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
        
        // テーブル存在チェック
        db.transaction((function (tx) {
            // テーブルチェック
            tx.executeSql($scope.query.checkPeopleTable, [], 
                (function(tx, results) {
                    // Peopleテーブル存在して
                    if (results.rows.item(0).cnt > 0) {
                    //if (false) {
                        //modal.show();
                        // 認証処理
                        // ピープルデータ取得
                        db.transaction(
                            (function (tx) {
                                tx.executeSql(
                                    $scope.query.selectTabelPeople, 
                                    [], 
                                    // ピープルデータの取得に成功
                                    (function(tx, results) {
                                        var nU = Math.floor( new Date().getTime() / 1000 ) ;
                                        var p = results.rows.item(0);
                                        $scope.people._id        = p._id;
                                        $scope.people.peopleID   = p.peopleID;
                                        $scope.people.mail       = p.mail;
                                        $scope.people.password   = p.password;
                                        $scope.people.nicname    = p.nicname;
                                        $scope.people.imageURL   = p.imageURL == "" ? "http://file.local-c.com/uploads/mimicry/noimage.png" : p.imageURL;
                                        $scope.people.sex        = p.sex;
                                        $scope.people.birthDay   = p.birthDay;
                                        $scope.people.pref       = p.pref;
                                        $scope.people.city       = p.city;
                                        $scope.people.appeal     = p.appeal;
                                        $scope.people.phrase     = p.phrase;
                                        $scope.people.auth       = p.auth;
                                        $scope.people.token      = p.token;
                                        $scope.people.loging     = p.loging;
                                        $scope.people.updated    = p.updated;
                                        $scope.people.created    = p.created;
                                        
                                        if ($scope.people.peopleID != "" && $scope.isOnline()) {
                                            
                                            /**
                                             * サインイン
                                             */
                                            $scope.signin(false);
                                        } else {

                                            // トップページでボタンを表示
                                            $scope.signinStatus = true;
                                            $scope.$apply();   

                                        }
                                        
                                        //console.log("mail:" + $scope.people.mail + " password:" + $scope.people.password + " auth:" + $scope.people.auth + " loging:" + $scope.people.loging + " UnixTimeStamp:" + $scope.autoLoginTime);
                                        // メール、パスワードあり、認証あり、最終ログインが２ヶ月以内
                                        /*
                                        if ($scope.people.mail != "" && $scope.people.password != "" && $scope.people.auth > 0 && $scope.people.loging > $scope.autoLoginTime) {
                                        //if ($scope.people.mail != "" && $scope.people.password != "" && $scope.people.loging > $scope.autoLoginTime) {
                                            // メインへ遷移
                                            $scope.options.people = $scope.people;
                                            // ★★★★★メインページへ遷移★★★★★
                                            if ($scope.people.sex == "")  {
                                                $scope.movePage($scope.page.profileEdit, $scope.people);    
                                            } else {
                                                $scope.movePage($scope.page.main, $scope.people);
                                            }
                                            //$scope.movePage('talk.html', $scope.people);
                                        } else if ($scope.people.mail != "" && $scope.people.password != "" && $scope.people.auth == 0) {
                                            // ログインページへ
                                            $scope.movePage($scope.page.auth);
                                            //★テスト
                                            //$scope.movePage($scope.page.signup);
                                        } else {
                                            $scope.signinStatus = true;
                                            $scope.$apply();   
                                            //$scope.movePage($scope.page.top);
                                            // その他はトップページなので何もしない
                                        }
                                        //modal.hide();
                                        */
                                    }), $scope.errorDB);
                            }), 
                            $scope.errorDB
                        );
                        //　テーブルデータの取得処理
                        //$scope.getPeopleData($scope.db);
                        //$scope.createDB($scope.db);  
                        return true;
                    // Peopleテーブルなし
                    } else {
                        // データベース・テーブル作成処理
                            db.transaction((function (tx) { // テーブル作成
                                tx.executeSql($scope.query.dropTabelPeople);
                                tx.executeSql($scope.query.createTabelPeople);
                                tx.executeSql($scope.query.insertTabelPeople);
                            }),
                            // 
                            $scope.errorDB,             // テーブル作成失敗
                            (function(tx, results) {    // テーブル作成、空レコード作成成功
                                // トップページのままでOK
                                // Todo初期処理で他になにかあれば記載
                                
                                // トップページでボタンを表示
                                $scope.signinStatus = true;
                                $scope.$apply(); 
                            }));
                            
                            
                        return false;
                    }
                }), $scope.errorDB);
        }), $scope.errorDB);
    };
    // データベースオブジェクト取得
    $scope.getDB = function(){
        return window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
    };
    // データベースのエラー時の処理（アラート）
    $scope.errorDB = function (err) {
        //console.log("SQL 実行中にエラーが発生しました: " + err.code);
        $scope.alert('データベースエラー', true);
		// トップページでボタンを表示
		$scope.signinStatus = true;
		$scope.$apply(); 
    };
    // ピープルテーブルの更新
    $scope.updatePeople = function(){
        // データベースオブジェクト取得
        var db = window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
        // スコアを更新
        db.transaction($scope.exePeopleUpdate, $scope.errorDB);
    };
    // ピープルテーブルの削除
    $scope.deletePeople = function(){
        // データベースオブジェクト取得
        var db = window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
        // ピープルテーブルを削除
        db.transaction($scope.exePeopleDelete, $scope.errorDB);    
    };
    // ピープルテーブルの更新
    $scope.exePeopleUpdate = function (tx) {
        tx.executeSql(
            $scope.query.updateTabelPeople
            + '_id = "'          + $scope.people._id             + '"'
            + ',peopleID = "'    + $scope.people.peopleID        + '"'  
            + ',mail     = "'    + $scope.people.mail            + '"'
            + ',password = "'    + $scope.people.password        + '"'
            + ',nicname  = "'    + $scope.people.nicname         + '"' 
            + ',imageURL = "'    + $scope.people.imageURL        + '"' 
            + ',sex      = "'    + $scope.people.sex             + '"'
            + ',birthDay = "'    + $scope.people.birthDay        + '"'
            + ',pref     = "'    + $scope.people.pref            + '"'
            + ',city     = "'    + $scope.people.city            + '"'
            + ',appeal   = "'    + $scope.people.appeal          + '"'
            + ',phrase   = "'    + $scope.people.phrase          + '"'
            + ',auth     = "'    + $scope.people.auth            + '"'
            + ',token    = "'    + $scope.people.token           + '"'
            + ',loging   = "'    + $scope.people.loging          + '"'
            + ',updated  = "'    + $scope.people.updated         + '"'
            + ',created  = "'    + $scope.people.created         + '"'
        );
    };
    // ピープルテーブルの削除
    $scope.exePeopleDelete = function (tx) {
        tx.executeSql($scope.query.dropTabelPeople);
        tx.executeSql($scope.query.createTabelPeople);
        tx.executeSql($scope.query.insertTabelPeople);
    };
    $scope.dialogs = {};
    $scope.msgDialog = function(dlg) {
        if (!$scope.dialogs[dlg]) {
            ons.createDialog(dlg).then(function(dialog) {
                $scope.dialogs[dlg] = dialog;
                dialog.show();
            });
        } else {
          $scope.dialogs[dlg].show();
        }
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
				$scope.people.imageFile = imageURI;
				document.getElementById('picture').src = imageURI;
			}
			// 画像取得に失敗
			function onFail (message) {
				$scope.alert("画像が選択されませんでした。", true);
			}
		} else {
			// webからの処理いつか実装
			
			
			
		}
    };
    // チャット用の写真を設定するとき処理
    $scope.snapChatPicture = function(type) {
        // カメラ撮影 or ライブラリ選択
        navigator.camera.getPicture (onSuccess, onFail, 
                { 
                    quality: 100, 
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: type,
                    allowEdit: false,
                    targetWidth: 500,
                    targetHeight: 500,
                    correctOrientation: true, // 撮影時と同じ向きに写真を回転
                    saveToPhotoAlbum: false, // 撮影後、端末のアルバムに画像を保存
                }
            );
        // 画像取得に成功してモデルにセットし、HTMLにも設定
        function onSuccess (imageURI) {
            //ファイルをアップロード
            var ft       = new FileTransfer();
            var options  = new FileUploadOptions();
            var params = {};
            // console.log(imageURI);
            options.fileKey  = "file";
            options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
            options.mimeType ="image/jpeg";
            options.params = params;

            var upSuccess = function(result) {
                // メッセージを送信
                var res = JSON.parse(result.response);
                if (res.code == 1) {

                    $scope.talk.file  = res.data.file;
                    $scope.talk.thumb = res.data.thumb;
                    $scope.sendImgMsg();
                } else {
                    //console.log(2222222222);
                }
                
            };
            var upError = function(error) {
                
                ons.notification.alert({
                    title: "",
                    message: '画像アップロードに失敗しました。'
                });
            };

            // ファイルアップロード
            ft.upload(imageURI,
                encodeURI("http://spika.local-c.com:3000/spika/v1/file/upload"),
                upSuccess,
                upError,
                options);

            
            
        }
        // 画像取得に失敗
        function onFail (message) {
            $scope.alert("画像が選択されませんでした。", true);
        }
    };
    
    // ピープルデータをDBから取得
    $scope.getPeople = function(){
        // データベースオブジェクト取得
        var db = window.openDatabase($scope.conf.database_name, $scope.conf.database_version, $scope.conf.database_displayname, $scope.conf.database_size);
        // ピープルデータの取得に成功
        db.transaction(
            (function (tx) {
                tx.executeSql(
                    $scope.query.selectTabelPeople, [], 
                        (function(tx, results) {
                            $scope.people = results.rows.item(0);
                            //return $scope.people;
                        }), $scope.errorDB);
                }), 
            $scope.errorDB
        );
    };
    
    /******************************************************************    
     *  サインイン[signin.html]
     *******************************************************************/
    $scope.signin = function(modalFlag){

        // メールチェック
        if (angular.isUndefined($scope.people.mail)){
           $scope.alert("メールアドレスを確認しください", true);
           return false;
        }

        // パスワード
        if (angular.isUndefined($scope.people.password)){
            $scope.alert("パスワードを確認しください", true);
            return false;
        }
        
        if (modalFlag) {
            // モーダル表示
            modal.show();
        }
        
        
        setTimeout(function() {
            $http({
                method: 'POST',
                url : $scope.webAPI.URL + $scope.webAPI.people + $scope.webAPI.signin,
                headers: { 'Content-Type': 'application/json' },
                data: $scope.people,
            }).success(function(data, status, headers, config) {
                   
                    // サインインが完了
                    $scope.people.peopleID     = data.data.peopleID;
                    $scope.people._id          = data.data._id;
                    $scope.people.mail         = data.data.mail;
                    $scope.people.password     = data.data.password;
                    $scope.people.nicname      = data.data.nicname;
                    $scope.people.imageURL     = angular.isUndefined(data.data.imageURL) ? 'http://file.local-c.com/uploads/mimicry/noimage.png' : data.data.imageURL;
                    $scope.people.nicname      = data.data.nicname;
                    $scope.people.sex          = data.data.sex;
                    $scope.people.birthDay     = angular.isUndefined(data.data.birthDay) ? '' : data.data.birthDay;
                    $scope.people.pref         = angular.isUndefined(data.data.pref) ? '' : data.data.pref;
                    $scope.people.appeal       = angular.isUndefined(data.data.appeal) ? '' : data.data.appeal;
                    $scope.people.phrase       = angular.isUndefined(data.data.phrase) ? '' : data.data.phrase;
                    $scope.people.auth         = data.data.auth;
                    $scope.people.token        = data.data.token;
                    $scope.people.loging       = data.data.loging;
                    $scope.people.updated      = data.data.updated;
                    $scope.people.created      = data.data.created;
                    $scope.people.boards       = angular.isUndefined(data.data.boards) ? [] : data.data.boards;
                    // ピープルテーブルへ保存
                    $scope.updatePeople();
                    
                    
                    if (modalFlag) {
                        // モーダル非表示
                        modal.hide();
                    }

                    
                    // メインページへ遷移
                    //$scope.movePage($scope.page.main);
                
                    // メール、パスワードあり、認証あり、最終ログインが２ヶ月以内
                    if ($scope.people.mail != "" && $scope.people.password != "" && $scope.people.auth > 0) {
                        // メインへ遷移
                        $scope.options.people = $scope.people;
                        // ★★★★★メインページへ遷移★★★★★
                        if ($scope.people.sex == "" || angular.isUndefined($scope.people.sex))  {
                        $scope.movePage($scope.page.profileEdit, $scope.people);    
                        } else {
                            $scope.movePage($scope.page.main, $scope.people);
                        }
                    } else if ($scope.people.mail != "" && $scope.people.password != "" && $scope.people.auth == 0) {
                        // 認証確認
                        $scope.movePage($scope.page.auth);
                    } else {
                        // トップページでボタンを表示
                        $scope.signinStatus = true;
                        $scope.$apply();   
                    }

            }).error(function(data, status, headers, config) {
                
                // モーダル非表示
                modal.hide();
                
                
                if (!$scope.signoutFlag) {
                    $scope.alert('サインインに失敗しました。',true);
                } 
                //     
                
                // トップページでボタンを表示
                $scope.signinStatus = true;
                //$scope.$apply();
            });
       }, 3000);
        
    };
    /******************************************************************    
     *  パスワード初期化[password.html]
     *******************************************************************/
     $scope.initPassword = function(){
         
         // モーダル表示
        modal.show();
         
         // トークリストを取得 
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.people +  $scope.webAPI.change + '/?mail=' + $scope.people.mail + '&type=1',
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {

            // モーダル非表示
            modal.hide();
            ons.notification.alert({
                title: '',
                message: 'パスワードを初期化しました。メールを確認してください。'
            });
            
            
            $scope.movePage($scope.page.signin);
            
        }).error(function(data, status, headers, config) {
            
            // モーダル非表示
            modal.hide();
            ons.notification.alert({
                title: '',
                message: 'パスワードの初期化に失敗しました。'
            });
        });
         
         
     };
     
    /******************************************************************    
     *  新規登録[signup.html]
     *******************************************************************/
    $scope.singup = function(){
        
        // debug
//        if ($scope.debug) {
//            $scope.people.mail = $scope.autoLoginTime + $scope.people.mail
//        }
        // メールチェック
        if (angular.isUndefined($scope.people.mail) || $scope.people.mail == ""){
           $scope.alert("メールアドレスを確認しください", true);
           return false;
        }

        // パスワード
        if (angular.isUndefined($scope.people.password) || $scope.people.password == ""){
            $scope.alert("パスワードを確認しください", true);
            return false;
        }
        
        // ニックネーム
        if (angular.isUndefined($scope.people.nicname) || $scope.people.nicname == ""){
            $scope.alert("ニックネームを確認しください", true);
            return false;
        }
        
        // モーダル表示
        modal.show();
        
        setTimeout(function() {
            $http({
                method: 'POST',
                url : $scope.webAPI.URL + $scope.webAPI.people,
                headers: { 'Content-Type': 'application/json' },
                data: $scope.people,
            }).success(function(data, status, headers, config) {
                if (data.code == "203") {
                    $scope.alert('メールアドレスが登録済みです。', true);
                    // モーダル非表示
                    modal.hide();
                    return false;
                } else {
                   
                    // 新規登録が完了
                    $scope.people.peopleID     = data.data.peopleID;
                    $scope.people._id          = data.data._id;
                    $scope.people.mail         = data.data.mail;
                    $scope.people.password     = data.data.password;
                    $scope.people.nicname      = data.data.nicname;
                    $scope.people.auth         = data.data.auth;
                    $scope.people.token        = data.data.token;
                    $scope.people.loging       = data.data.loging;
                    $scope.people.updated      = data.data.updated;
                    $scope.people.created      = data.data.created;
                    $scope.people.boards       = data.data.boards;

                    // ピープルテーブルへ保存
                    $scope.updatePeople();
                    
                    // モーダル非表示
                    modal.hide();

                    $scope.movePage($scope.page.auth, $scope.options);

                }
            }).error(function(data, status, headers, config) {
                //console.log(data);
                // モーダル非表示
                modal.hide();
                //     
                $scope.alert('新規登録に失敗しました。',true);
            });
       }, 3000);
        
    };
    // 認証状態を確認
    $scope.authConfirm = function() {
        
        // トークリストを取得 
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.people + "/" + $scope.people.peopleID,
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {

            if (data.data.auth == 1) {
                // 新規登録が完了
                $scope.people.auth         = data.data.auth;
                // ピープルテーブルへ保存
                $scope.updatePeople();
                ons.notification.alert({
                    title: "本人確認",
                    message: '完了しました。'
                });
                $scope.movePage($scope.page.profileEdit, $scope.people);
            } else {
                ons.notification.alert({
                    title: "本人確認",
                    messageHTML: "本人確認ができませんでした。<br>本人確認を完了させてください。"
                });    
            }
            

        }).error(function(data, status, headers, config) {
            ons.notification.alert({
                title: "本人確認",
                messageHTML: "本人確認ができませんでした。<br>本人確認を完了させてください。"
            });
        });
    };

    // 認証メールの再送
    $scope.authMailResend = function() {
        // トークリストを取得 
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.people +  $scope.webAPI.change + '/?mail=' + $scope.people.mail + '&type=3',
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {

            ons.notification.alert({
                title: '',
                message: '認証メールを再送しました。'
            });

        }).error(function(data, status, headers, config) {
            ons.notification.alert({
                title: '',
                message: '認証メールを再送に失敗しました。'
            });
        });
    };
    
    /******************************************************************
     *  プロフィール登録編集[profileEdit.html]
     *******************************************************************/
    // プロフィールを保存
    $scope.saveProfile = function() {

        // 生年月日を年チェック
        if ($scope.people.sex == ""){
            ons.notification.alert({
                title: "",
                messageHTML: "性別を選択してください。"
            });
           return false;
        }
        
        // 生年月日を年チェック
        if ($scope.birth.year == ""){
            ons.notification.alert({
                title: "",
                messageHTML: "生年月日の年を入力してください"
            });
           return false;
        }
        // 生年月日を月チェック
        if ($scope.birth.month == ""){
            ons.notification.alert({
                title: "",
                messageHTML: "生年月日の月を入力してください"
            });
            return false;
        }
        // 生年月日を日チェック
        if ($scope.birth.day == ""){
           ons.notification.alert({
                title: "",
                messageHTML: "生年月日の日を入力してください"
            });
           return false;
        }
        // 都道府県チェック
        if ($scope.people.pref  == ""){
            ons.notification.alert({
                title: "",
                messageHTML: "都道府県を入力してください"
            });
           return false;
        }
        // 生年月日を年月日に設定
        $scope.people.birthDay = $scope.birth.year + $scope.birth.month + $scope.birth.day;
        
        // キュー配列        
        var promise_arr = [];
        // プロミス
        var promise = null;
        if (!angular.isUndefined($scope.people.imageFile) && $scope.people.imageFile != ""){
            var fileName = $scope.people.peopleID + "-" + Math.floor( new Date().getTime() / 1000 );
            promise = $scope.uploadFile($scope.people.imageFile, 1, fileName, "");
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
    $scope.finallyProfile = function() {
        //console.log("ファイナリー");
    };    
    $scope.setProfile = function() {
        $http({
            method: 'POST',
            url : $scope.webAPI.URL + $scope.webAPI.people + $scope.webAPI.profile,
            headers: { 'Content-Type': 'application/json' },
            data: $scope.people,
        }).success(function(data, status, headers, config) {
            
            // プロフィールのビープル更新後の値を取得
            $scope.people.peopleID     = data.data.peopleID;
            $scope.people._id          = data.data._id;
            $scope.people.mail         = data.data.mail;
            $scope.people.password     = data.data.password;
            $scope.people.nicname      = data.data.nicname;
            $scope.people.imageURL     = data.data.imageURL;
            $scope.people.nicname      = data.data.nicname;
            $scope.people.sex          = data.data.sex;
            $scope.people.birthDay     = data.data.birthDay;
            $scope.people.pref         = data.data.pref;
            $scope.people.appeal       = data.data.appeal;
            $scope.people.phrase       = data.data.phrase;
            $scope.people.auth         = data.data.auth;
            $scope.people.token        = data.data.token;
            $scope.people.loging       = data.data.loging;
            $scope.people.updated      = data.data.updated;
            $scope.people.created      = data.data.created;
            $scope.people.boards       = data.data.boards;

            //console.log($scope.people);

            // ピープルテーブルへ保存
            $scope.updatePeople();
 
            // モーダル非表示
            modal.hide();
            // メインへ遷移
            $scope.options.people = $scope.people;
            // プロフィールへ遷移
            $scope.movePage($scope.page.main, $scope.people);

           
        }).error(function(data, status, headers, config) {
            // 登録済みのエラー
            $scope.alert("プロフィール登録エラー", true);
            // モーダル非表示
            modal.hide();
        });
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
        params.dir = 'lcchat';
        options.params = params;
    
        //deferred.notify({});// 処理の通知を示す 
        var upSuccess = function(result) {
            var data = JSON.parse(result.response);
            // console.log(result.response);
            // console.log(data.code);
            // console.log(JSON.stringify(data));
            if (data.code == 200) {
                if (data.type == 2) {
                    // 音声ファイル
                } else {
                    // 画像ファイル
                    $scope.people.imageURL = data.fileurl;
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
    $scope.errorProfile = function() {
        $scope.alert("プロフィール登録エラー", true);
    };    
    $scope.notifyProfile = function() {
        //console.log("プロフィール登録開始・・・");
    };    
    $scope.dialogs = {};
    $scope.show = function(dlg) {
        ons.createDialog(dlg, {parentScope: $scope}).then(function(dialog) {
            $scope.dialog = dialog;
            $scope.dialog.show();
            //dialog.on('setDate',  function(hoge){console.log(9)});
        });
        //$scope.dialogs[dlg].on('dtest', $scope.setDate(222));
    };
    // 生年月日を設定
    $scope.setDate = function(ymd, value){
        
        switch (ymd) {
            case 'y' :
                $scope.birth.year = value;
                break;
            case 'm' : 
                $scope.birth.month = value;
                break;
            case 'd' : 
                $scope.birth.day = value;
                break;
        }
        // ダイアログ非表示
        $scope.dialog.hide();
        // 年月日がそろったらピールへセット
        if($scope.birth.year != "" && $scope.birth.month != "" && $scope.birth.day != ""){
            $scope.people.birthDay = $scope.birth.year + "" + $scope.birth.month + "" + $scope.birth.day;
        }
        
    };
    // 生年月日を設定
    $scope.setPref = function(value){
        $scope.people.pref = value;
        // ダイアログ非表示
        $scope.dialog.hide();
    };
    $scope.openPicture = function(type){
        // ダイアログ非表示
        $scope.dialog.hide();
        $scope.snapPicture(type)
    };
    $scope.openChatPicture = function(type){
        // ダイアログ非表示
        $scope.dialog.hide();
        $scope.snapChatPicture(type)
    };
    // ダイアログを閉じる
    $scope.closeDialog = function(){
        // ダイアログ非表示
        $scope.dialog.hide();
    }
    /******************************************************************   
     * 部屋一覧画面[talkroom.html]
     *******************************************************************/
    $scope.rooms  = [];
    $scope.talk   = {
        roomID : "",
        msg    : "",
        file   : null,
        thumb  : null
    }
    $scope.roomID = "";
    $scope.status = {
        signin : false
    };
    $scope.initRoom = function () {

        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.room + $scope.webAPI.list + "/?peopleID=" + $scope.people.peopleID,
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {
            // DB登録
            $scope.rooms = [];
            // すでにROOMがあるかチェック
            angular.forEach(data.data, function(room, key) {
                // 配列にルームを追加        
                $scope.rooms.push(room);
                
                // ルームにサインイン
                $scope.roomSignIn(room.roomID)
              
            });
        }).error(function(data, status, headers, config) {
            // 登録済みのエラー
            $scope.alert("トーク一覧取得エラー", true);
            // モーダル非表示
            modal.hide();
        });
    };
    $scope.talkMsg = {
        imageURL : "",
        msg      : "",
        self     : 0    
    };
    $scope.talkList = [];
    $scope.signRoom = function(item){

        var roomID = "";
        // すでにROOMがあるかチェック
        angular.forEach($scope.rooms, function(room, key) {
            
            // 部屋の相手が一人
            if(room.peoples.length == 2 && (room.peoples[0].peopleID == item.peopleID || room.peoples[1].peopleID == item.peopleID)) {
                roomID =  room.roomID;
            }
            
        });
        
        var roomParam =  {
            roomID   : roomID,
            peopleID : $scope.people.peopleID,
            peoples  : [{peopleID : item.peopleID}],
            title    : ""
        };
        
       //console.log("roomID:" + roomID);
        
        if (roomID != "") {

            // ルームIDを保持
            $scope.talk.roomID = roomID;
            // サインイン
            $scope.startTalk(roomID);
           
        } else {
            
           
            
            // ルームIDを発行    
            $http({
                method: 'POST',
                url : $scope.webAPI.URL + $scope.webAPI.room + $scope.webAPI.signin,
                headers: { 'Content-Type': 'application/json' },
                data: roomParam,
            }).success(function(data, status, headers, config) {
                

                // トークスタート（ルームIDを引き渡す）
                $scope.startTalk(data.data.roomID);
                
                
            }).error(function(data, status, headers, config) {

                // モーダル非表示
                modal.hide();
                //     
                $scope.alert('ルームの作成に失敗しました。',true);
            });

        }
    };
    /**
     * 部屋サインインだけする全部に接続する
     */
    $scope.roomSignIn = function(roomID){
        
        // Roomへサインイン
        socket.emit('signin',{
            roomID : roomID,
            peopleID: $scope.people.peopleID 
        });
        
    };
    $scope.startTalk = function(roomID){
        // Roomへサインイン
        socket.emit('signin',{
            roomID : roomID,
            peopleID: $scope.people.peopleID 
        });
        
        // トークへ遷移前にトーク一覧をクリア
        $scope.talkList = [];
        // ルームIDを保持
        $scope.talk.roomID = roomID;
        //console.log($scope.talk.roomID);
        $scope.getMsgList($scope.talk.roomID, 0);
    };
    $scope.removeRoom = function(roomID){
        
         //var mod = material ? 'material' : undefined;
        var mod = {
            
        };
        
        ons.notification.confirm({
          title: '確認',
          message: 'チャットルームを削除しますか?',
          modifier: mod,
          callback: function(idx) {
            switch (idx) {
              case 0:
                break;
              case 1:

                $http({
                    method: 'GET',
                    url : $scope.webAPI.URL + $scope.webAPI.room + $scope.webAPI.delete + "/" + roomID,
                    headers: { 'Content-Type': 'application/json' }
                }).success(function(data, status, headers, config) {
                    
                    angular.forEach($scope.rooms, function(room, key) {
                    
                         if (roomID == room.roomID) {
                             $scope.rooms.splice(key,1);
                            //$scope.$apply();         
                         }
                     
                    });
                    $scope.alert("チャットルームを削除しました", true);
                    
                }).error(function(data, status, headers, config) {
                    // 登録済みのエラー
                    $scope.alert("チャットルームの削除に失敗しました。", true);
                }).finally(function() {
                    
                });
                break;
            }
          }
        });
        
        
        
    };
    $scope.getMsgList = function(roomID, lastMsgID){
        
        //console.log($scope.webAPI.URL + $scope.webAPI.msg + $scope.webAPI.list + '/' + roomID + '/' + lastMsgID)
        // APIから取得？
        // トークリストを取得 
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.msg + $scope.webAPI.list + '/' + roomID + '/' + lastMsgID,
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {

            // 配列の入れ替え作業保存
            angular.forEach(data.data, function (msg, key) {
                if (msg.msg != "join") {
                    $scope.talkList.unshift(msg);    
                }
            });
            
            // 最下部へスクロール
            $scope.scrollMsg(400);
            
            // トーク画面へ遷移
            $scope.movePage($scope.page.talk, $scope.options);
            
    
            var element = document.getElementsByClassName("timeline-li");
            for (var i=0;i<element.length;i++) {
                //console.log(element[i].style.borderBottom);
              element[i].style.borderBottom = "none"
            }
            
            
            // 既読にする
            $scope.readMsg(roomID);
            

        }).error(function(data, status, headers, config) {

            $scope.alert('トークの取得に失敗しました。',true);
        });
        
        
    };    
    // メッセージ送信
    $scope.sendMsg = function () {
        if ($scope.talk.msg == "") {
            return false;
        }
        socket.emit('sendMsg',{
            msg      : $scope.talk.msg,
            roomID   : $scope.talk.roomID,
            peopleID : $scope.people.peopleID,
            type     : 1,
            localID  : ""
        });
      
        $scope.talk.msg = "";
        
       
    };
    // メッセージ送信
    $scope.sendImgMsg = function () {
        
        socket.emit('sendMsg',{
            msg      : "",
            roomID   : $scope.talk.roomID,
            peopleID : $scope.people.peopleID,
            file     : {
                file     : $scope.talk.file,
                thumb    : $scope.talk.thumb
            },            
            type     : 2,
            localID  : ""
        });
      
       
    };
    //               
    socket.on('newPeople',function(text){
        // ログインしたら部屋へ移動
        
        //console.log(text);
    });
    socket.on('newMsg',function(data){

        // console.log('#############');
        // console.log(data.msg);
        // console.log($scope.newMsgAlert);
        // console.log('###');
        // console.log(data);
        // 
        // console.log(data.roomID);
        // console.log(data.msg);
        // console.log(!angular.isUndefined(data.file));
        // console.log('#############');
        
        if (!$scope.newMsgAlert && $scope.talk.roomID == data.roomID && (data.msg != "" || (!angular.isUndefined(data.file) && data.file.thumb.id != '')) && data.msg != "join") {
            $scope.talkList.push(data);    
            $scope.scrollMsg(300);
            //console.log("hogssse");
        } else if ($scope.newMsgAlert){

            //console.log("hoge" + data.msg);
            
            ons.notification.alert({
              title: data.people.nicname + 'さんから新着メッセージ',
              message: data.msg
            });
        }
        
         
    });
    $scope.readMsg  = function (roomID) {

        // トークリストを取得 
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.msg + $scope.webAPI.list + $scope.webAPI.read + '/' + roomID + '/' + $scope.people.peopleID,
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {

        }).error(function(data, status, headers, config) {

        });
        
    };
    $scope.convertLink  = function (input) {
        input.replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        //input = input.replace(/\n|\r/g, '<br>')
        var regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
        var regexp_makeLink = function(all, url, h, href) {
            return '<div ng-click="openWindow(\'h' + href + '\');">' + url + '</div>';
            //return '<a href="#" ng-click="alert(1)">' + url + '</a>';
            //return '<a href="h' + href + '" target="_blank">' + url + '</a>';
        }
        return $sce.trustAsHtml(input.replace(regexp_url, regexp_makeLink));
    }
    // トークの最下部へスクロール
    $scope.scrollMsg = function (sec) {
        setTimeout(function() {
            var timelineElement = document.getElementsByClassName('timeline')[0];
            timelineHight = timelineElement.scrollHeight;
            //console.log(timelineHight);
            timelineElement.scrollTop = timelineHight;
        }, sec);
        
    };
    $scope.isPeople = function(peopleID){
        return peopleID == $scope.people.peopleID;
    };
    $scope.talkRowClass = function(peopleID){
        return {
            'row-me'  : !$scope.isPeople(peopleID),
            'row-etc' : $scope.isPeople(peopleID)
        }
    };
    $scope.talkDateClass = function(peopleID){
        return {
            'timeline-date1' : $scope.isPeople(peopleID),
            'timeline-date2' : !$scope.isPeople(peopleID)
        }
    };
    $scope.talkFrameClass = function(peopleID){
        return {
            'msgFrame1' : !$scope.isPeople(peopleID),
            'msgFrame2' : $scope.isPeople(peopleID)
        }
    };
    
    /******************************************************************
     *  ボード一覧[board.html] sboard
     *******************************************************************/
    $scope.initBoard = function() {
        $scope.getBoards($scope.boardListLimit, 0, true);
        
    };
    $scope.loadBoard = function($done) {
        
        $timeout(function() {        
            $scope.getBoards(100, 0, true, function(){
                // コールバックしてDONE
                $done();
            });
        }, 1000);
    };
    $scope.boardMsg = {
        peopleID    : "",
        nicname     : "",
        imageURLTo  : "",
        boardIDTo   : "",
        peopleIDTo  : "",
        nicnameTo   : '',
        inline      : "",
        desc        : ""
    };    
    $scope.saveBoardMsg = function() {
       
        //console.log($scope.boardMsg.desc);
        if ($scope.boardMsg.desc == "") {
            $scope.alert('メッセージが入力されていません。');
            return;
        }
        
        $http({
            method: 'POST',
            url : $scope.webAPI.URL + $scope.webAPI.board,
            headers: { 'Content-Type': 'application/json' },
            data: $scope.boardMsg,
        }).success(function(data, status, headers, config) {
//            // メインへ遷移
//            $scope.options.people = $scope.people;
                

            $scope.initBoard();
            $scope.movePopPage();
            
        }).error(function(data, status, headers, config) {
            // 登録済みのエラー
            $scope.alert("コメント送信エラー", true);
            // モーダル非表示
            modal.hide();
        });
        
    };
    // 新規投稿画面へ遷移
    $scope.newBoardMsg = function(item) {

        $scope.boardMsg.peopleID = $scope.people.peopleID;
        
        //console.log(item);
        if (!angular.isUndefined(item)) {
            $scope.boardMsg.peopleIDTo = item.peopleID;
            $scope.boardMsg.boardIDTo  = item.boardID;
            $scope.boardMsg.desc       = '>' + item.desc.replace(/\n|\r/g, '\n>');
            $scope.boardMsg.nicnameTo  = item.people.nicname;
        } else {
            $scope.boardMsg.peopleIDTo = "";
            $scope.boardMsg.boardIDTo  = "";
            $scope.boardMsg.desc = "";
            $scope.boardMsg.nicnameTo  = "";
        }
        
        $scope.movePage($scope.page.boardMsg, $scope.options);
    };
    $scope.boardCount = 100;
    $scope.boardItemHeight = 150;
    $scope.boards = [];
    $scope.getBoards = function (limit, offset, refresh, callback){
               
        //console.log($scope.seachParam);
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.board + $scope.webAPI.list + "/?limit=" + limit + "&offset=" + offset + $scope.getSearchParam(),
            headers: { 'Content-Type': 'application/json' },
        }).success(function(data, status, headers, config) {
            
            if(refresh) {
                $scope.boards = data.data;
            } else {
                // 配列の入れ替え作業保存
                angular.forEach(data.data, function (board, key) {
                    $scope.boards.push(board);
                });
            }
            // データをセット
            
            $scope.isLoading = false;
            
        }).error(function(data, status, headers, config) {
            // 登録済みのエラー
            $scope.alert("トーク一覧取得エラー", true);
            // モーダル非表示
            modal.hide();
        }).finally(function() {
            // ボードの処理が終わったらコールバック
            callback();
        });

    };
    // 検索条件ようにパラメーター文字列を生成
    $scope.getSearchParam = function() {
        var param = "";
        var amp   = "&";
        if ($scope.seachParam.sex != "") {
            param += amp + "sex=" + $scope.seachParam.sex;
        }
        if ($scope.seachParam.pref != "") {
            param += amp + "pref=" + $scope.seachParam.pref;
        }
        if ($scope.seachParam.age != "") {
            $scope.ageList
            param += amp + "age=" + $scope.ageList.indexOf($scope.seachParam.age);
        }
        return param;
    };
    $scope.seachParam = {
        sex  : "",
        pref : "",
        age  : ""
        
    };
    $scope.ageList = ["0歳 - 12歳", "13歳 - 15歳", "16歳 - 18歳","19歳 - 22歳","23歳 - 30歳","31歳 - 40歳","41歳 - 50歳","51歳 - 60歳","61歳 - 70歳","71歳 - 80歳","81歳 - 90歳"];
    $scope.seachBoard = function (){
        $scope.movePage($scope.page.boardSearch, $scope.options);
    };
    // 生年月日を設定
    $scope.setAge = function(value){
        // ダイアログ非表示
        $scope.dialog.hide();
        $scope.seachParam.age = value;
    };
     // 生年月日を設定
    $scope.setSeachPref = function(value){
        // ダイアログ非表示
        $scope.dialog.hide();
        $scope.seachParam.pref = value;
    };
    
    $scope.isBoardSearch = function(){
        if($scope.seachParam.sex == "" && $scope.seachParam.pref == "" && $scope.seachParam.age == "") {
            return false;
        } else {
            return true;
        }
    };
    $scope.boardSearchClass = function(){
        return {
            'search-active'  :$scope.isBoardSearch(),
            'search-none'    :!$scope.isBoardSearch()
        }
    };
    // 検索条件を設定して検索をする
    $scope.searchBoard = function(){
        
        $scope.getBoards($scope.boardListLimit, 0, true, function(){
            $scope.movePopPage();
        });
        
        
    };
    // 検索条件をクリアする
    $scope.searchClear = function(){
        
        $scope.seachParam.sex = "";
        $scope.seachParam.pref = "";
        $scope.seachParam.age = "";
    };
    // 通報、報告
    $scope.addReport = function(item) {
        //var mod = material ? 'material' : undefined;
        var mod = {
            
        };
    
        ons.notification.confirm({
            title: '確認',
            message: 'この投稿を通報しますか?',
            modifier: mod,
            callback: function(idx) {
            switch (idx) {
              case 0:
                break;
              case 1:
                
                var reportParam = {
                    desc       : item.desc,
                    boardID    : item.boardID,
                    peopleID   : $scope.people.peopleID,
                    type       : "",
                }
               
                $http({
                    method: 'POST',
                    url : $scope.webAPI.URL + $scope.webAPI.report,
                    headers: { 'Content-Type': 'application/json' },
                    data: reportParam,
                }).success(function(data, status, headers, config) {
                    $scope.alert("通報しました", true);
                }).error(function(data, status, headers, config) {
                    // 登録済みのエラー
                    $scope.alert("通報に失敗しました。", true);
                }).finally(function() {
                });
                break;
            }
          }
        });
    };    
    // ボードを削除する
    $scope.removeBoard = function(item) {
        //var mod = material ? 'material' : undefined;
        var mod = {
            
        };
        ons.notification.confirm({
          title: '確認',
          message: 'この投稿を削除しますか?',
          modifier: mod,
          callback: function(idx) {
            switch (idx) {
              case 0:
                break;
              case 1:

                    
                $http({
                    method: 'GET',
                    url : $scope.webAPI.URL + $scope.webAPI.board + $scope.webAPI.delete + "/" + item.boardID,
                    headers: { 'Content-Type': 'application/json' }
                }).success(function(data, status, headers, config) {
                    
                    angular.forEach($scope.boards, function(board, key) {
                    
                         if (item.boardID == board.boardID) {
                             $scope.boards.splice(key,1);
                            //$scope.$apply();         
                         }
                     
                    });
                    $scope.alert("投稿を削除しました", true);
                    
                }).error(function(data, status, headers, config) {
                    // 登録済みのエラー
                    $scope.alert("投稿の削除に失敗しました。", true);
                }).finally(function() {
                    
                });
                break;
            }
          }
        });
    }
    
    /******************************************************************
     *  気になる[pick.html] pick　
     *******************************************************************/
    $scope.initPick = function() {
        $scope.getPicks(100, 0, true);
    };
    $scope.pickquery = "";
    $scope.picks = [];
    $scope.getPicks = function (limit, offset, refresh, callback){
               
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.pick + $scope.webAPI.list + "/?peopleID=" + $scope.people.peopleID,
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {
            
            $scope.picks = data.data;
            
        }).error(function(data, status, headers, config) {
            // 登録済みのエラー
            $scope.alert("気になる一覧取得エラー", true);
        }).finally(function() {
            // ボードの処理が終わったらコールバック
            callback();
        });

    };
    // お気に入りに追加する
    $scope.addPick = function (item){
        
        var pickdata = {
            "peopleID"    : $scope.people.peopleID, 
            "peoplePickID": item.peopleID,
        };
        
        //console.log($scope.webAPI.URL + $scope.webAPI.pick);
        $http({
            method: 'POST',
            url : $scope.webAPI.URL + $scope.webAPI.pick,
            headers: { 'Content-Type': 'application/json' },
            data: pickdata,
        }).success(function(data, status, headers, config) {
            
            ons.notification.alert({
                title: '気になる',
                message: '登録しました。'
            });
            
        }).error(function(data, status, headers, config) {
            // 登録済みのエラー
            ons.notification.alert({
                title: '気になる',
                message: '登録に失敗しました。'
            });
        }).finally(function() {
            
        });
    };
    /******************************************************************
     *  プロフィール表示[profile.html] 
     *******************************************************************/
    
    $scope.profile = {
        people     : null,
        boards     : [],
        boardCount : 0,
        pickCount  : 0,
        pickerCount: 0
    };
    $scope.pushProfile = function(people) {
        $scope.profile.people = people;
        
        // プロフィールのボード情報を取得
        $scope.getProfileBoards(people, "", function(){

            // ピープルのカウント情報取得
            $scope.getProfileCount(people, function(){
                
                // プロフィールへ遷移
                $scope.movePage($scope.page.profile, $scope.options);
            });
        });
        
        // プロフィールへ遷移
        //$scope.movePage($scope.page.profile, $scope.options);
        //$scope.$apply();
    };
    // ピープルのボードを取得
    $scope.getProfileBoards = function(people, boardID, callback) {
        var bid = ""
        if (!angular.isUndefined(boardID) && boardID != "") {
            bid = "&boardID=" + boardID;
        }
        
        //http://localhost:3000/spika/v1/board/list/?boardID=7&peopleID=1
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.board + $scope.webAPI.list + "/?peopleID=" + people.peopleID + bid,
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {
            
            if (!angular.isUndefined(boardID) && boardID != "") {
                $scope.profile.boards.push(data.data);
            } else {
                $scope.profile.boards = data.data;
            }
             
            
        }).error(function(data, status, headers, config) {
            // 登録済みのエラー
            $scope.alert("プロフィールボードの取得エラー", true);

        }).finally(function() {
            // ボードの処理が終わったらコールバック
            callback();
        });
        
    };
    // ピープルの各カウントを取得
    $scope.getProfileCount = function(people, callback) {
        
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.people + $scope.webAPI.count + "/" + people.peopleID,
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {
            
            
            if (data.code == 200) {
                $scope.profile.boardCount  = data.data.boardCount;
                $scope.profile.pickCount   = data.data.pickCount;
                $scope.profile.pickerCount = data.data.pickerCount;
            }
        }).error(function(data, status, headers, config) {
            // 登録済みのエラー
            $scope.alert("プロフィールのカウント取得エラー", true);

        }).finally(function() {
            // ボードの処理が終わったらコールバック
            callback();
        });
        
        
        
    };
    
    /******************************************************************
     *  設定[setting.html] ssetting
     *******************************************************************/
    
    $scope.pushProfileEdit = function() {
        
        // 生年月日の変換
        $scope.convertBirthDay(2);
        // プロフィールへ遷移
        $scope.movePage($scope.page.profileEdit, $scope.options);
    };
    $scope.signoutFlag = false;
    $scope.signout = function() {
        // ピープル情報を削除
        $scope.deletePeople();
		$scope.signoutFlag = true;
		// 初期起動
		$scope.initApp();
		
        // トップページへ遷移
        $scope.movePage($scope.page.top, $scope.options);
    };
    // 利用規約
    $scope.agreement = function() {
       window.open('http://street.local-c.com/rule.html', '_blank', 'location=yes');
    };
    // プライバシーポリシー
    $scope.privacy = function() {
       window.open('http://street.local-c.com/privacy.html', '_blank', 'location=yes');
    };    
	// FAQ
    $scope.faq = function() {
        //console.log(123);
        window.open('http://street.local-c.com/faq.html', '_blank', 'location=yes');
    };    
    // 退会 People削除
    $scope.removePeople = function() {

        // トークリストを取得 
        $http({
            method: 'GET',
            url : $scope.webAPI.URL + $scope.webAPI.people +  $scope.webAPI.delete + '/' + $scope.people.peopleID,
            headers: { 'Content-Type': 'application/json' },
            data: null,
        }).success(function(data, status, headers, config) {
            // サインアウト
            $scope.signout();
            ons.notification.alert({
                title: '',
                message: '退会しました。'
            });

        }).error(function(data, status, headers, config) {
            ons.notification.alert({
                title: '',
                message: '退会処理に失敗しました。'
            });
        });
    };
    
                        
});  

module.filter('substr', function() {
    return function(input, from, to) {
        // do some bounds checking here to ensure it has that index
        //return input.substring(from, to);
        var inputtext = String(input);
        return inputtext.substring(from, to);
        
    }
});

module.filter('customReadMore', function() {
    return function(input, from, to, text) {
       
        var readmoreText = '';
        
        var inputtext = String(input);
        if (inputtext.length > to && !angular.isUndefined(text)) {
            readmoreText = text;
        }        
        return inputtext.substring(from, to) + readmoreText;
        
    }
});


module.filter('autoLink', function($sce) {
    return function(input) {
        input.replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        input = input.replace(/\n|\r/g, '<br>')
        var regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
        var regexp_makeLink = function(all, url, h, href) {
            //return '<div ng-click="openWindow(\'h' + href + '\');">' + url + '</div>';
            return '<a href="#" ng-click="alert(1)">' + url + '</a>';
            //return '<a href="h' + href + '" target="_blank">' + url + '</a>';
        }
        return $sce.trustAsHtml(input.replace(regexp_url, regexp_makeLink));
    }
});

module.directive('a', function() {
  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
        //console.log(attrs);
      if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
        elem.on('click', function(e){
          e.preventDefault();
        });
      }
    }
  };
});

/**
 * 日付カスタムフィルター1
 * フォーマット2016/2/21 13:48:10
 */
module.filter('customDate1', function() {
    return function(input) {
        var objDate = new Date(input);
        var nowDate = new Date();
        //現在時間との差
        myHour = Math.floor((nowDate.getTime()-objDate.getTime()) / (1000*60*60)) + 1;

        var year = objDate.getFullYear();
        var month = objDate.getMonth() + 1;
        var date = objDate.getDate();
        var hours = objDate.getHours();
        var minutes = objDate.getMinutes();
        var seconds = objDate.getSeconds();
        if ( hours < 10 ) { hours = "0" + hours; }
        if ( minutes < 10 ) { minutes = "0" + minutes; }
        if ( seconds < 10 ) { seconds = "0" + seconds; }
        str = year + '/' + month + '/' + date + ' ' + hours + ':' + minutes + ':' + seconds;
        var rtnValue = str;

        return rtnValue;
        
    }
});
/**
 * 日付カスタムフィルター2　何時間前か
 * フォーマット　1秒前,1分前,1時間前
 */
module.filter('customDate2', function() {
    return function(input) {
        var rtnValue = 'Now';
        
        var objDate = new Date(input);
        var nowDate = new Date();
        //現在時間との差 時間
        var myHour = Math.floor((nowDate.getTime()-objDate.getTime()) / (1000*60*60));
        //現在時間との差 分
        var myMin  = Math.floor((nowDate.getTime()-objDate.getTime()) / (1000*60));
        //現在時間との差 秒
        var mySec  = Math.floor((nowDate.getTime()-objDate.getTime()) / (1000));

        
        if (myHour > 0) {
            rtnValue = myHour + '時間前'
        } else if (myMin > 0){
            rtnValue = myMin + '分前'
        } else {
            rtnValue = mySec + '秒前'
        }
        

        return rtnValue;
        
    }
});
/**
 * 日付カスタム　年齢
 * フォーマット　
 */
module.filter('customDate3', function() {
    return function(input) {
        if (angular.isUndefined(input)) {
            return "";
        }
        var age     = 0;
        var nowDate = new Date();
        var year = parseInt(input.substr(0,4));
        var month = parseInt(input.substr(4,2));
        var date = parseInt(input.substr(6,2));
        var yearNow = nowDate.getFullYear();
        var monthNow = nowDate.getMonth() + 1;
        var dateNow = nowDate.getDate();
        age     =  yearNow-year;
        var m   =  monthNow-month;
        var d   =  dateNow-date
        if (0 <= m) {
            if (0 == m && 0 > d) {
                age -= 1;
            }
        } else {
           age -= 1;
        }
        return age;
        
    }
});
/**
 * 日付カスタム　トーク用
 * フォーマット 2/21 13:48
 */
module.filter('customDate4', function() {
    return function(input) {
        var objDate = new Date(input);
        var nowDate = new Date();
        //現在時間との差
        myHour = Math.floor((nowDate.getTime()-objDate.getTime()) / (1000*60*60)) + 1;

        var year = objDate.getFullYear();
        var month = objDate.getMonth() + 1;
        var date = objDate.getDate();
        var hours = objDate.getHours();
        var minutes = objDate.getMinutes();
        var seconds = objDate.getSeconds();
        if ( hours < 10 ) { hours = "0" + hours; }
        if ( minutes < 10 ) { minutes = "0" + minutes; }
        if ( seconds < 10 ) { seconds = "0" + seconds; }
        
        var rtnValue = "";
        if (myHour < 24) {
            rtnValue = hours + ':' + minutes;
        } else {
            rtnValue = month + '/' + date + ' ' + hours + ':' + minutes;    
        }
        return rtnValue;
    }
});

/**
 * 改行コードをBR　変換
 * フォーマット 2/21 13:48
 */
module.filter('nl2br', function($sce) {
    return function (input, exp) {
        // console.log(input);
        // if (!angular.isUndefined(input)) {
        //     console.log("sss");
        // }
            var replacedHtml = input.replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return $sce.trustAsHtml(replacedHtml.replace(/\n|\r/g, '<br>'));
    };
});

module.filter('inlinenl2br', function($sce) {
    return function (input, exp) {
            var replacedHtml = input.replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return $sce.trustAsHtml('＞' + replacedHtml.replace(/\n|\r/g, '<br>＞') + '<br>');
    };
});


//http://localhost:3000
//ws://spika.local-c.com:3000/spika
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


/**
 * リクエストのときパラメータを変換
 **/ 
module.config(function ($httpProvider) {
//    console.log('config');
//    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
//    $httpProvider.defaults.transformRequest = function(data){
//        if (data === undefined) {
//            return data;
//        }
//        console.log($.param(data));
//        return $.param(data);
//    }
    
    
});