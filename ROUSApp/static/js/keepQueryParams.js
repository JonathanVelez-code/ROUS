(function () {
    // Get the current query parameters from the URL
    const currentUrl = window.location.href;
    const urlParts = currentUrl.split('?');

    // Only proceed if there are query parameters present
    if (urlParts.length > 1) {
        const queryParams = '?' + urlParts[1]; // Extract the query parameters

        // Get all anchor (<a>) elements on the page
        const anchorTags = document.querySelectorAll('a');

        anchorTags.forEach(function (anchor) {
            let href = anchor.getAttribute('href');

            // Make sure the href is not empty, not a hash, and not an external link
            if (href && !href.startsWith('#') && !href.startsWith('http') && !href.includes('mailto:')) {
                // Handle URLs that already contain query parameters
                if (href.includes('?')) {
                    anchor.href = href + '&' + urlParts[1]; // Append current query parameters
                } else {
                    anchor.href = href + queryParams; // Add query parameters if none exist
                }
            }
        });
    }
})();