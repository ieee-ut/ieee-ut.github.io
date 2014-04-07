/* Copyright (c) 2007 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * MODIFIED BY Ross McNulty
 *
 */

/* Loads the Google data JavaScript client library */
google.load("gdata", "2.x", {packages: ["calendar"]});

function init() {
  // init the Google data JS client library with an error handler
  google.gdata.client.init(handleGDError);
  loadIEEECalendar();
}

function loadIEEECalendar() {
  loadCalendar('https://www.google.com/calendar/feeds/ieee.ece.utexas.edu_e1lj5bjmrlhe6dc59h6umr8qok@group.calendar.google.com/public/full');
}

/**
 * Adds a leading zero to a single-digit number.  Used for displaying dates.
 * 
 * @param {int} num is the number to add a leading zero, if less than 10
 */
function padNumber(num) {
  if (num <= 9) {
    return "0" + num;
  }
  return num;
}

/**
 * Uses Google data JS client library to retrieve a calendar feed from the specified
 * URL.  The feed is controlled by several query parameters and a callback 
 * function is called to process the feed results.
 *
 * @param {string} calendarUrl is the URL for a public calendar feed
 */  
function loadCalendar(calendarUrl) {
  var service = new 
      google.gdata.calendar.CalendarService();
  var query = new google.gdata.calendar.CalendarEventQuery(calendarUrl);
  query.setOrderBy('starttime');
  query.setSortOrder('ascending');
  query.setFutureEvents(true);
  query.setSingleEvents(true);
  query.setMaxResults(5);

  service.getEventsFeed(query, listEvents, handleGDError);
}

/**
 * Callback function for the Google data JS client library to call when an error
 * occurs during the retrieval of the feed.  Details available depend partly
 * on the web browser, but this shows a few basic examples. In the case of
 * a privileged environment using ClientLogin authentication, there may also
 * be an e.type attribute in some cases.
 *
 * @param {Error} e is an instance of an Error 
 */
function handleGDError(e) {
  document.getElementById('jsSourceFinal').setAttribute('style', 
      'display:none');
  if (e instanceof Error) {
    /* alert with the error line number, file and message */
    alert('Error at line ' + e.lineNumber +
          ' in ' + e.fileName + '\n' +
          'Message: ' + e.message);
    /* if available, output HTTP error code and status text */
    if (e.cause) {
      var status = e.cause.status;
      var statusText = e.cause.statusText;
      alert('Root cause: HTTP error ' + status + ' with status text of: ' + 
            statusText);
    }
  } else {
    alert(e.toString());
  }
}

function fadeOutIn(element1,element2) {
    var op = 1;  // initial opacity
    var op2 = 0.1;
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element1.style.display = 'none';
            element2.style.opacity = op2;
            element2.style.display = "block";
            var timer2 = setInterval(function () {
              if (op2 >= 1){
                clearInterval(timer2);
              }
              element2.style.opacity = op2;
              element2.style.filter = 'alpha(opacity=' + op2 * 100 + ")";
              op2 += op2 * 0.1;
            }, 15);
        }
        element1.style.opacity = op;
        element1.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 15);
}

/**
 * Callback function for the Google data JS client library to call with a feed 
 * of events retrieved.
 *
 * Creates an unordered list of events in a human-readable form.  This list of
 * events is added into a div called 'events'.  The title for the calendar is
 * placed in a div called 'calendarTitle'
 *
 * @param {json} feedRoot is the root of the feed, containing all entries 
 */ 
function listEvents(feedRoot) {
  var entries = feedRoot.feed.getEntries();
  var eventDiv = document.getElementById('events');
  var loaderDiv = document.getElementById('calendar-loader');
  if (eventDiv.childNodes.length > 0) {
    eventDiv.removeChild(eventDiv.childNodes[0]);
  }	  
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  /* create a new unordered list */
  var ul = document.createElement('ul');
  /* loop through each event in the feed */
  var len = entries.length;
  for (var i = 0; i < len; i++) {
    var entry = entries[i];
    var title = entry.getTitle().getText();
    var startDateTime = null;
    var startJSDate = null;
    var times = entry.getTimes();
    if (times.length > 0) {
      startDateTime = times[0].getStartTime();
      startJSDate = startDateTime.getDate();
    }
    var entryLinkHref = null;
    if (entry.getHtmlLink() != null) {
      entryLinkHref = entry.getHtmlLink().getHref();
    }
    var dateString = days[startJSDate.getDay()] + ", " + months[startJSDate.getMonth()] + " " + startJSDate.getDate();
    var timeString = null;
    if (!startDateTime.isDateOnly()) {
      if(startJSDate.getHours() < 12) {
        timeString = " " + startJSDate.getHours() + ":" + padNumber(startJSDate.getMinutes()) + "am";
      } else {
        timeString = " " + startJSDate.getHours() - 12 + ":" + padNumber(startJSDate.getMinutes()) + "pm";
      }
    }
    var li = document.createElement('li');

    /* if we have a link to the event, create an 'a' element */
    if (entryLinkHref != null) {
      var dateDiv = document.createElement('div');
      var timeSpan = document.createElement('span');
      var summaryDiv = document.createElement('div');
      dateDiv.setAttribute('class', "event-date");
      summaryDiv.setAttribute('class', "event-summary");
      entryLink = document.createElement('a');
      entryLink.setAttribute('href', entryLinkHref);
      entryLink.appendChild(document.createTextNode(title));
      dateDiv.appendChild(document.createTextNode(dateString));
      if(timeString != null) {
        timeSpan.appendChild(document.createTextNode(timeString + ' - '));
        summaryDiv.appendChild(timeSpan);
      }
      summaryDiv.appendChild(entryLink);
      li.appendChild(dateDiv);
      li.appendChild(summaryDiv);
    } else {
      li.appendChild(document.createTextNode(title + ' - ' + dateString));
    }	    

    /* append the list item onto the unordered list */
    ul.appendChild(li);
  }
  ul.style.display="none";
  eventDiv.appendChild(ul);
  fadeOutIn(loaderDiv,ul);
}

google.setOnLoadCallback(init);