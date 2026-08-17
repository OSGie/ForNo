(function (window, document) {
  "use strict";
  var storage = window.localStorage;
  var now = function () { return new Date().getTime(); };
  var makeId = function (prefix) { return prefix + "_" + now().toString(36) + "_" + Math.random().toString(36).slice(2, 10); };
  var read = function (key) { try { return storage.getItem(key); } catch (e) { return null; } };
  var write = function (key, value) { try { storage.setItem(key, value); } catch (e) {} };
  var getParam = function (name) { var match = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search); return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : ""; };
  var visitorId = read("mof_visitor_id") || makeId("v");
  var sessionId = read("mof_session_id") || makeId("s");
  write("mof_visitor_id", visitorId); write("mof_session_id", sessionId);
  document.cookie = "mof_visitor_id=" + visitorId + "; path=/; max-age=31536000; SameSite=Lax";
  var touch = { utm_source: getParam("utm_source"), utm_medium: getParam("utm_medium"), utm_campaign: getParam("utm_campaign"), utm_content: getParam("utm_content"), utm_term: getParam("utm_term"), fbclid: getParam("fbclid"), gclid: getParam("gclid") };
  var hasTouch = false, key; for (key in touch) { if (touch[key]) { hasTouch = true; } }
  var firstTouch = read("mof_first_touch"); firstTouch = firstTouch ? JSON.parse(firstTouch) : (hasTouch ? touch : {}); if (!read("mof_first_touch")) { write("mof_first_touch", JSON.stringify(firstTouch)); }
  var lastTouch = hasTouch ? touch : (read("mof_last_touch") ? JSON.parse(read("mof_last_touch")) : firstTouch); if (hasTouch) { write("mof_last_touch", JSON.stringify(lastTouch)); }
  window.dataLayer = window.dataLayer || [];
  window.MofTrack = { context: function () { return { visitorId: visitorId, sessionId: sessionId, firstTouch: firstTouch, lastTouch: lastTouch }; }, event: function (eventName, data) { var payload = data || {}; payload.event = eventName; payload.event_id = makeId("evt"); payload.event_time = new Date().toISOString(); payload.visitor_id = visitorId; payload.session_id = sessionId; payload.page_path = window.location.pathname; payload.first_touch = firstTouch; payload.last_touch = lastTouch; window.dataLayer.push(payload); return payload; } };
}(window, document));
