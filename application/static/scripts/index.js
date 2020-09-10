$.ready(() => {
  let logPre = $('#log-text')
  let players = []

  function addLine(line) {
    let span = document.createElement('p')

    let text = line.thread ? `[${line.time}] [${line.thread}/${line.level}]: ${line.message}` : line.message
    span.textContent = text
    span.className = line.level.toLowerCase()

    if (line.message.match(/^<.*> .+/)) {
      span.className = 'chat'
    }

    let autoScroll = logPre.scrollHeight - logPre.scrollTop - logPre.clientHeight < 1
    logPre.appendChild(span)

    if (autoScroll) {
      $(':last-child', logPre).scrollIntoView()
    }
  }

  $.ajax({
    method: 'GET',
    url: '/full-log'
  }, (err, status, data) => {
    data.forEach(line => {
      addLine(line)
    })

    $(':last-child', logPre).scrollIntoView()
  })

  $.ajax({
    method: 'GET',
    url: '/players'
  }, (err, status, data) => {
    players = data
    $('#player-list').textContent = players.join(', ')
  })

  function wsListener(data) {
    data = JSON.parse(data.data)

    if (data.type === 'log-newline') {
      addLine(data.line)
    }

    if (data.type === 'log-reset') {
      logPre.innerHTML = ''
      players = []
      $('#player-list').textContent = ''
    }

    if (data.type === 'player-joined') {
      players.push(data.player)
      $('#player-list').textContent = players.join(', ')
    }

    if (data.type === 'player-left') {
      players.splice(players.indexOf(data.player), 1)
      $('#player-list').textContent = players.join(', ')
    }
  }

  let websocketPath = location.protocol.replace('http', 'ws') + '//' + location.host
  let websocket

  function recreate(timeout=5000) {
    websocket = null
    setTimeout(() => {
      websocket = new WebSocket(websocketPath)

      websocket.onclose = () => {recreate()}
      websocket.addEventListener('message', wsListener)
    }, timeout)
  }

  recreate(1)

  $('#rcon-command').on('keydown', e => {
    if(e.keyCode == 13) {
      let password = $('#rcon-password').value
      let command = $('#rcon-command').value
      $.ajax({
        method: 'POST',
        url: '/rcon',
        data: {
          password, command
        }
      })
     }
  })
})
