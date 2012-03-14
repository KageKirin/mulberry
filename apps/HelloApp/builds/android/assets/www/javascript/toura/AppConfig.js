mulberry = window.mulberry || {};
toura = window.toura || {};

mulberry._Config = {
  "id": "HelloApp",
  "locale": "en-us",
  "buildDate": "1331739324",
  "appVersion": "4.1.0",
  "updateUrl": null,
  "versionUrl": null,
  "device": {
    "type": "phone",
    "os": "android"
  }
};

// force all images to come from S3. this
// is mainly used by MAP for the preview window.
toura.forceLocal = false;
toura.forceStreaming = false;

// skips checking for newer remote version.
// useful for speeding up non-data dev.
toura.skipVersionCheck = false;

toura.features = {
  siblingNav : false,
  ads : false,
  sharing : true,
  favorites : true,
  fontSize : true,
  multiLineChildNodes : false,
  debugPage : true
};

mulberry.features = {
  debugToolbar : true
};


