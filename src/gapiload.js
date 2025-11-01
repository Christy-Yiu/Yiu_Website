function authenticate() {
  gapi.load('client:auth2', () => {
    gapi.auth2.init({
      client_id: '603923696793-l4bh51cpl7q4rprhgrke4cjqmf36o57g.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
    }).then(() => {
      gapi.auth2.getAuthInstance().signIn().then(loadClient);
    });
  });
}

// function loadClient() {
//   gapi.client.setApiKey('API_KEY_HERE');
//   gapi.client.load('https://analyticsdata.googleapis.com/$discovery/rest?version=v1').then(() => {
//     console.log('GAPI client loaded for API');
//     fetchAnalyticsData();
//   });
// }
