window.transitionToPage = function(href) {
    document.querySelector('body').style.opacity = 0
    setTimeout(function() { 
        window.location.href = href
    }, 500)
}

document.addEventListener('DOMContentLoaded', function(event) {
    document.querySelector('body').style.opacity = 1
})

/* Link buttons: <a class="link-button" href="...">...</a>
   They keep a "clicked" colour after being followed, and the state is
   remembered in localStorage so it survives a page reload.
   (the leading semicolon guards against the missing semicolon above) */
;(function () {
    var STORAGE_KEY = 'clickedLinkButtons'

    function readClicked() {
        try {
            var stored = window.localStorage.getItem(STORAGE_KEY)
            var list = stored ? JSON.parse(stored) : []
            return Array.isArray(list) ? list : []
        } catch (error) {
            return []
        }
    }

    function saveClicked(list) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
        } catch (error) {
            /* storage unavailable (private mode / file://) - colour still applies */
        }
    }

    function markClicked(linkButton) {
        linkButton.classList.add('is-clicked')

        var href = linkButton.getAttribute('href')
        if (!href) {
            return
        }

        var clicked = readClicked()
        if (clicked.indexOf(href) === -1) {
            clicked.push(href)
            saveClicked(clicked)
        }
    }

    function restoreClicked() {
        var clicked = readClicked()
        var linkButtons = document.querySelectorAll('a.link-button')

        Array.prototype.forEach.call(linkButtons, function (linkButton) {
            if (clicked.indexOf(linkButton.getAttribute('href')) !== -1) {
                linkButton.classList.add('is-clicked')
            }
        })
    }

    document.addEventListener('DOMContentLoaded', restoreClicked)

    document.addEventListener('click', function (event) {
        var target = event.target
        if (!target || typeof target.closest !== 'function') {
            return
        }

        var linkButton = target.closest('a.link-button')
        if (linkButton) {
            markClicked(linkButton)
        }
    })
})()