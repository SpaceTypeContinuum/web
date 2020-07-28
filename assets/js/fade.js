function fadeOutEffect(link) {
  var fadeTarget = document.getElementsByTagName("body")[0]
  var fadeEffect = setInterval(function() {
    if (!fadeTarget.style.opacity) {
      fadeTarget.style.opacity = 1
    }
    if (fadeTarget.style.opacity > 0) {
      fadeTarget.style.opacity -= 0.1
    } else {
      clearInterval(fadeEffect)
      window.location = link
    }
  }, 50)
}

document.addEventListener("DOMContentLoaded", function(event) {
  let elem = document.querySelector(".link")
  elem.addEventListener(
    "click",
    function(e) {
      e.preventDefault()
      link = elem.href
      fadeOutEffect(link)
    },
    true
  )
})
