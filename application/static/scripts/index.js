$.ready(() => {
  let logPre = $('#log-text')

  function addLine(line) {
    let span = document.createElement('p')

    let text = line.thread ? `[${line.time}] [${line.thread}/${line.level}]: ${line.message}` : line.message
    span.textContent = text
    span.className = line.level.toLowerCase()

    let autoScroll = logPre.scrollTop == logPre.scrollTopMax
    logPre.appendChild(span)

    if (autoScroll) {
      logPre.scrollTop = logPre.scrollTopMax
    }
  }

  $.ajax({
    method: 'GET',
    url: '/full-log'
  }, (err, status, data) => {
    data.forEach(line => {
      addLine(line)
    })

    logPre.scrollTop = logPre.scrollTopMax
  })

  function wsListener(data) {
    data = JSON.parse(data.data)

    if (data.type === 'log-newline') {
      addLine(data.line)
    }

    if (data.type === 'log-truncated') {
      logPre.innerHTML = ''
    }
  }

  let websocketPath = location.protocol.replace('http', 'ws') + '//' + location.host
  let websocket

  function recreate() {
    websocket = null
    setTimeout(() => {
      try {
        websocket = new WebSocket(websocketPath)

        websocket.onclose = recreate
        websocket.addEventListener('message', wsListener)
      } catch (e) {
        recreate()
      }
    }, 5000)
  }

  recreate()
})
