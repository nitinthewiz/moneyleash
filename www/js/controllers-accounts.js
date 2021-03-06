
// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountsController', function ($scope, $rootScope, $state, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseObject) {

    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.UserEmail = '';

    // SORT
    $scope.SortingIsEnabled = false;
    $scope.reorderBtnText = '';
    $scope.enableSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
        $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
    };
    $scope.moveItem = function (account, fromIndex, toIndex) {
        $scope.data.accounts.splice(fromIndex, 1);
        $scope.data.accounts.splice(toIndex, 0, account);
    };

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeOptions = function ($event, account, id) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            $state.go('app.account', { userId: $scope.UserEmail, accountId: id, accountName: account.AccountName });
        }
    };

    // OPEN ACCOUNT SAVE MODAL 
    $ionicModal.fromTemplateUrl('templates/accountsave.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal
    })

    // SHOW MODAL
    $scope.openEntryForm = function (title) {
        $scope.myTitle = title + " Account";
        $scope.currentItem = {
            AccountName: "",
            StartBalance: "",
            OpenDate: "",
            AccountType: ""
        };
        $scope.modal.show();
    }

    // HIDE-CLOSE MODAL
    $scope.closeEntryForm = function (title) {
        $scope.modal.hide();
    }

    // LIST
    $scope.list = function () {
        $rootScope.show('');
        fbAuth = fb.getAuth();
        if (fbAuth) {
            $scope.UserEmail = escapeEmailAddress(fbAuth.password.email);
            var syncObject = $firebaseObject(fb.child("members/" + escapeEmailAddress(fbAuth.password.email)));
            syncObject.$bindTo($scope, "data");
        }
        $rootScope.hide();
    }

    // EDIT
    $scope.editItem = function (index) {
        $ionicListDelegate.closeOptionButtons();
        $scope.inEditMode = true;
        $scope.editIndex = index;
        var accountname = $scope.data.accounts[index].AccountName;
        var startbalance = $scope.data.accounts[index].StartBalance;
        var opendate = new Date($scope.data.accounts[index].OpenDate);
        var accounttype = $scope.data.accounts[index].AccountType;

        //evaluate for valid dates
        if (isNaN(opendate)) {
            opendate = "";
        }
        
        $scope.currentItem = {
            'AccountName': accountname,
            'StartBalance': startbalance,
            'OpenDate': opendate,
            'AccountType': accounttype
        }
        
        $scope.myTitle = "Edit " + $scope.currentItem.AccountName;
        $scope.modal.show();
    };

    // SAVE
    $scope.SaveItem = function (account) {
        if ($scope.inEditMode) {
            // edit item
            var dtDate = new Date($scope.currentItem.OpenDate);
            dtDate = +dtDate;
            $scope.currentItem.OpenDate = dtDate;
            $scope.data.accounts[$scope.editIndex] = $scope.currentItem;
            $scope.inEditMode = false;
        } else {
            // new item
            if ($scope.data.hasOwnProperty("accounts") !== true) {
                $scope.data.accounts = [];
            }
            $scope.data.accounts.push({
                'AccountName': $scope.currentItem.AccountName,
                'StartBalance': $scope.currentItem.StartBalance,
                'OpenDate': $scope.currentItem.OpenDate.getTime(),
                'AccountType': $scope.currentItem.AccountType
            });
        }
        $scope.currentItem = {};
        $scope.modal.hide();
    }

    // DELETE
    $scope.deleteItem = function (account, index) {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + account.AccountName + '? This will permanently delete the account from the app.',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                //Called when one of the non-destructive buttons is clicked,
                //with the index of the button that was clicked and the button object.
                //Return true to close the action sheet, or false to keep it opened.
                return true;
            },
            destructiveButtonClicked: function () {
                //Called when the destructive button is clicked.
                //Return true to close the action sheet, or false to keep it opened.
                $scope.data.accounts.splice(index, 1);
                return true;
            }
        });
    };
})
