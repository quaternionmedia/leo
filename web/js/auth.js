var auth;

function initLogin() {

        gapi.load('auth2', function() {
            auth = gapi.auth2.init({
                client_id: "773135597766-ofk2e5lehiv3tabtmppq7prutqaifgbj.apps.googleusercontent.com",
                scope: "profile email" // this isn't required
            });

                console.log( "signed in: " + auth.isSignedIn.get() );
                auth.isSignedIn.listen(onSignIn);
                var button = document.getElementById('signInButton');
                button.addEventListener('click', function() {
                  auth.signIn();
                });
                var out = document.getElementById('signOutButton');
                out.addEventListener('click', function() {
                  auth.signOut().then(function() {
                    console.log("user signed out");
});
                });
            });
       // });


}
        function onSignIn(googleUser) {
            console.log( "signedin");
            console.log(googleUser);
            // Useful data for your client-side scripts:
            var profile = auth.currentUser.get().getBasicProfile();
console.log("Name: " + profile.getName());
        };