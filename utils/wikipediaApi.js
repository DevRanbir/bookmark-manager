export async function searchWikipedia(searchTerm) {
    try {
      // Using Wikipedia API to search for the title
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.query.search.length > 0) {
        const pageId = searchData.query.search[0].pageid;
        
        // Get detailed information about the page
        const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=300&pageids=${pageId}&format=json&origin=*`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        const page = detailsData.query.pages[pageId];
        
        return {
          title: page.title,
          extract: page.extract || '', 
          thumbnail: page.thumbnail ? page.thumbnail.source : null,
          url: `https://en.wikipedia.org/?curid=${pageId}`
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching data from Wikipedia:', error);
      return null;
    }
  }