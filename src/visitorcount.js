(function() {
  const domain = encodeURIComponent(window.location.hostname);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const page_path = window.location.pathname;
  const page_title = document.title;
  const referrer = document.referrer;
  
  // Extract search query if coming from a search engine
  let search_query = '';
  if (referrer) {
    try {
      const url = new URL(referrer);
      if (url.hostname.includes('google.com')) {
        search_query = url.searchParams.get('q') || '';
      } else if (url.hostname.includes('bing.com')) {
        search_query = url.searchParams.get('q') || '';
      } else if (url.hostname.includes('yahoo.com')) {
        search_query = url.searchParams.get('p') || '';
      } else if (url.hostname.includes('duckduckgo.com')) {
        search_query = url.searchParams.get('q') || '';
      }
    } catch (e) {
      // Invalid URL, ignore
    }
  }

  fetch('https://visitor.6developer.com/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      domain, 
      timezone,
      page_path,
      page_title,
      referrer,
      search_query
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Visitor count:', data);
    // You can display the count on your page
    if (document.getElementById('visitor-count')) {
      document.getElementById('visitor-count').textContent = data.totalCount;
    }
  })
  .catch(error => console.error('Error:', error));
})();
