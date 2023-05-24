    /* exported gapiLoaded */
    /* exported gisLoaded */
    /* exported handleAuthClick */
    /* exported handleSignoutClick */
    
    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
    
    // TODO(developer): Set to client ID and API key from the Developer Console
    const CLIENT_ID = '1027688762450-r0m066b7e42l6kqg0rlklk1qa3ttd1ij.apps.googleusercontent.com';
    const API_KEY = 'AIzaSyDARPEDd0WtdfvXJ6H7vTM2G_oG6dUraAw';
    
    // TODO(developer): Replace with your own project number from console.developers.google.com.
    const APP_ID = '1027688762450'; // 프로젝트번호
    
    let tokenClient;
    let accessToken = null;
    let pickerInited = false;
    let gisInited = false;
    
    /**
     * Callback after api.js is loaded.
     */
    function gapiLoaded() {
      gapi.load('client:picker', initializePicker);
    }
    
    /**
     * Callback after the API client is loaded. Loads the
     * discovery doc to initialize the API.
     */
    async function initializePicker() {
      await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
      pickerInited = true;
    }
    
    /**
     * Callback after Google Identity Services are loaded.
     */
    function gisLoaded() {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
      });
      gisInited = true;
    }
    
    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick() {
      tokenClient.callback = async (response) => {
        if (response.error !== undefined) {
          throw (response);
        }
        accessToken = response.access_token;
        await createPicker();
      };
    
      if (accessToken === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({prompt: 'consent'});
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({prompt: ''});
      }
    }
    
    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick() {
      if (accessToken) {
        accessToken = null;
        google.accounts.oauth2.revoke(accessToken);
      }
    }
    
    /**
     *  Create and render a Picker object for searching images.
     */
    function createPicker() {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      //view.setMimeTypes('image/png,image/jpeg,image/jpg');
      const picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
          .setDeveloperKey(API_KEY)
          .setAppId(APP_ID)
          .setOAuthToken(accessToken)
          .addView(view)
          .addView(new google.picker.DocsUploadView())
          .setCallback(pickerCallback)
          .build();
      picker.setVisible(true);
    }
    
    /**
     * Displays the file details of the user's selection.
     * @param {object} data - Containers the user selection from the picker
     */
    async function pickerCallback__(data) {
      if (data.action === google.picker.Action.PICKED) {
        var files = data[google.picker.Response.DOCUMENTS];
        var aData = new Array();
        var bData = new Array();
        for (var i=0; i<files.length; i++){
          var id = files[i][google.picker.Document.ID],
              name = files[i][google.picker.Document.NAME],
              size = files[i][google.picker.Document.fileSize],
              url = files[i][google.picker.Document.URL];
          console.log(id);
          console.log(name);
          console.log(size);
          console.log(url);  
    
          const res = await gapi.client.drive.files.get({
            'fileId': id,
            'fields': '*',
          });
          //aData[i] = url;
          //bData[i] = size; //size
        }
        //opener.PutScanDataSimple(aData, bData);
    
      }
    }
    async function pickerCallback(data) {
      if (data.action === google.picker.Action.PICKED) {
        var retData = new Array();
        for (var i=0; i<data.docs.length; i++){
          var tmp = new Object();
            tmp.gubun = "google.drive";
            tmp.name = data.docs[i].name;
            tmp.size = data.docs[i].sizeBytes;
            tmp.id = data.docs[i].id;
            tmp.url = data.docs[i].url;
            retData.push(tmp);
        }
        PutScanDataSimple(retData); //includes/js/scan.js안에있는함수
      }
    }
    