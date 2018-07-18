var socket = io();
socket.emit('load data');

socket.on('return data', function(data){
  processData(data)
});

function Hosts(){
  this.hostList = []

  this.add = function(host){
    this.hostList.push(host)
  }
}
function Host(location){
  this.location = location
  this.pingEvents = []

  this.addPing = function(pingEvent){
    this.pingEvents.push(pingEvent)
  }
}
function PingEvent(location, time, date, success) {
  this.location = location,
  this.data = {
    time: time,
    date: date,
    success: success
  }
}

var color = {
  success: 'green',
  danger: 'red'
}

function processData(data){
  var recordedHosts = []

  var pingList = data._ping_list
  var hosts = new Hosts() // instantiate new hosts class

  for(var i = 0; i < pingList.length; i++){
    var p = pingList[i]
    var date = p._curr_date
    var time = p._curr_time
    var location = p._ping_location
    var success = p._success

    // check if already in recorededHosts
    if(!recordedHosts.includes(location)){
      var host = new Host(location)

      hosts.add(host)
      recordedHosts.push(location)
    }

    for(var j = 0; j < hosts.hostList.length; j++){
      if(hosts.hostList[j].location == location){

        var ping = new PingEvent(location, time, date, success)
        hosts.hostList[j].addPing(ping) // add ping event to host
      }
    }
  }
  renderData(hosts)
}
function renderData(hosts){
  // For every unique host in the hosts list
  for(var i = 0; i < hosts.hostList.length; i++){
    console.log(hosts.hostList[i])

    var newStat = $("#template_stat").clone()

    var upCount = 0 // in milliseconds
    var downCount = 0 // in milliseconds

    var lowestDate = hosts.hostList[i].pingEvents[0].data.date.split('/')
    var lowestDateTime = hosts.hostList[i].pingEvents[0].data.time.split(':')
    lowestDate = new Date(lowestDate[2], lowestDate[1]-1, lowestDate[0], lowestDateTime[0], lowestDateTime[1])

    var highestDate = new Date()

    var cumulativeDuration = (highestDate.getTime() - lowestDate.getTime()) // subtract milliseconds

    // For every ping event in the hosts ping events list
    for(var j = 0; j < hosts.hostList[i].pingEvents.length; j++){
      var pingList = hosts.hostList[i].pingEvents

      var diff = 0
      if(j == hosts.hostList[i].pingEvents.length-1 && j > 0){
        // last element is a special case since it could have been going on for a long time
        var lowDate = hosts.hostList[i].pingEvents[j-1].data.date.split('/')
        var lowTime = hosts.hostList[i].pingEvents[j-1].data.time.split(':')
        lowDate = new Date(lowDate[2], lowDate[1]-1, lowDate[0], lowTime[0], lowTime[1])
        var highDate = new Date() // right now, since last event hasnt ended

        diff = highDate.getTime() - lowDate.getTime()
      } else if(j > 0){
        var lowDate = hosts.hostList[i].pingEvents[j-1].data.date.split('/')
        var lowTime = hosts.hostList[i].pingEvents[j-1].data.time.split(':')
        lowDate = new Date(lowDate[2], lowDate[1]-1, lowDate[0], lowTime[0], lowTime[1])
        var highDate = hosts.hostList[i].pingEvents[j].data.date.split('/')
        var highTime = hosts.hostList[i].pingEvents[j].data.time.split(':')
        highDate = new Date(highDate[2], highDate[1]-1, highDate[0], highTime[0], highTime[1])

        diff = highDate.getTime() - lowDate.getTime()
      } else if(j == 0 && hosts.hostList[i].pingEvents.length === 1){
        // special case if array is exactly 1 element
        var lowDate = hosts.hostList[i].pingEvents[j].data.date.split('/')
        var lowTime = hosts.hostList[i].pingEvents[j].data.time.split(':')
        lowDate = new Date(lowDate[2], lowDate[1]-1, lowDate[0], lowTime[0], lowTime[1])
        var highDate = new Date()

        diff = highDate.getTime() - lowDate.getTime()
      }

      if(diff != 0 && j != hosts.hostList[i].pingEvents.length-1){
        if(pingList[j].data.success == true){
          // This is true, so last event was false !!
          // down for diff time
          downCount += diff
        } else {
          upCount += diff
        }
      } else if(j == hosts.hostList[i].pingEvents.length-1){
        // last element is a special case
        if(pingList[j].data.success == true){
          // This is true, so last event was false !!
          // down for diff time
          upCount += diff
        } else {
          downCount += diff
        }
      }
    }

    var upTime = upCount/cumulativeDuration*100
    var downTime = downCount/cumulativeDuration*100

    newStat.find('.bg-success').css('width', String(upTime+.01)+"%").attr('aria-valuenow', String(upTime)).text(String(Math.round((upTime+0.00001)*100)/100)+"%")
    newStat.find('.bg-danger').css('width', String(downTime+.01)+"%").attr('aria-valuenow', String(downTime)).text(String(Math.round((downTime+0.00001)*100)/100)+"%")

    var upFor = millisecondsToTime(upCount).split(':')
    var downFor = millisecondsToTime(downCount).split(':')
    newStat.find('.stat-timeup').text(upFor[0] + ' Days, ' + upFor[1] + ' Hours, ' + upFor[2] + ' Minutes, ' + upFor[3] + ' Seconds.')
    newStat.find('.stat-timedown').text(downFor[0] + ' Days, ' + downFor[1] + ' Hours, ' + downFor[2] + ' Minutes, ' + downFor[3] + ' Seconds.')

    newStat.find('.stat-location').text(hosts.hostList[i].location)

    var lastEle = hosts.hostList[i].pingEvents[hosts.hostList[i].pingEvents.length-1]
    if(lastEle.data.success == true){
      newStat.find('.stat-currently').text('Currently Online').css('color', color.success)
      newStat.find('.stat-lastchecked').text('Online Since: ' + fixTimeFormat(lastEle.data.time) + ", " + lastEle.data.date)
    } else {
      newStat.find('.stat-currently').text('Currently Offline').css('color', color.danger)
      newStat.find('.stat-lastchecked').text('Offline Since: ' + fixTimeFormat(lastEle.data.time) + ", " + lastEle.data.date)
    }


    newStat.removeClass('hide')
    $("#stats").append(newStat)
  }

}

function millisecondsToTime(time){
  var seconds = parseInt(Math.floor(time/1000))
  var minutes = parseInt(Math.floor(seconds/60))
  var hours = parseInt(Math.floor(minutes/60))
  var days = parseInt(Math.floor(hours/24))

  seconds = parseInt(seconds%60)
  minutes = parseInt(minutes%60)
  hours = parseInt(hours%24)

  var newTime = days + ":" + hours + ":" + minutes + ":" + seconds
  newTime = fixTimeFormat(newTime)

  return newTime
}

function fixTimeFormat(time){
  var times = time.split(':')
  var newTime = ""
  for(var i = 0; i < times.length; i++){
    // If time is under 10, add a 0 before digit.
    // So, '5:3' would become '05:03'
    var digit = times[i] < 10 ? "0" + times[i] : times[i]
    newTime += String(digit)+":"
  }
  newTime = newTime.substring(0, newTime.length-1) // delete last colon
  return newTime
}
