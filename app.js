(function () {
  "use strict";

  var body = document.body;
  var lang = body.dataset.lang === "en" ? "en" : "ja";
  var base = body.dataset.base || ".";
  var labels = {
    ja: {
      empty: "現在公開できるライブ予定はありません。最新情報は公式SNSで案内します。",
      venue: "会場",
      address: "住所",
      time: "時間",
      price: "料金",
      formed: "結成",
      archiveEmpty: "公開中の過去ライブ情報はありません。",
      open: "OPEN",
      start: "START"
    },
    en: {
      empty: "No upcoming shows are currently announced. Follow our official accounts for updates.",
      venue: "Venue",
      address: "Address",
      time: "Time",
      price: "Price",
      formed: "Formed",
      archiveEmpty: "No past shows are currently listed.",
      open: "OPEN",
      start: "START"
    }
  }[lang];

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function fetchJSON(path) {
    return fetch(base + "/content/" + path).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function localDate(dateString) {
    var date = new Date(dateString + "T00:00:00");
    if (lang === "ja") {
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short"
      });
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function isPast(dateString) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString + "T00:00:00") < today;
  }

  function renderSocials(site) {
    var container = document.getElementById("social-list");
    if (!container) return;
    container.innerHTML = (site.sns || []).map(function (item) {
      var handle = item.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
      return '<a class="social-link" href="' + escapeHtml(item.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        '<span class="social-name">' + escapeHtml(item.platform) + '</span>' +
        '<span class="social-handle">' + escapeHtml(handle) + ' ↗</span></a>';
    }).join("");
  }

  function renderMembers(site) {
    var container = document.getElementById("members-list");
    if (!container) return;
    container.innerHTML = (site.members || []).map(function (member) {
      return '<div class="member-row">' +
        '<span class="member-name">' + escapeHtml(member.name) + '</span>' +
        '<span class="member-alias">/ ' + escapeHtml(member.alias) + '</span>' +
        '<span class="member-part">' + escapeHtml(lang === "en" ? (member.instrument || member.part) : member.part) + '</span>' +
        '</div>';
    }).join("");
    var formed = document.getElementById("formed");
    if (formed && site.formed) formed.textContent = labels.formed + " " + site.formed;
  }

  function liveDetail(live) {
    var html = "";
    if (live.venue) html += '<p><span class="label">' + labels.venue + ': </span>' + escapeHtml(live.venue) + '</p>';
    if (live.address) html += '<p><span class="label">' + labels.address + ': </span>' + escapeHtml(live.address) + '</p>';
    if (live.open || live.start) {
      var time = [];
      if (live.open) time.push(labels.open + " " + escapeHtml(live.open));
      if (live.start) time.push(labels.start + " " + escapeHtml(live.start));
      html += '<p><span class="label">' + labels.time + ': </span>' + time.join(" / ") + '</p>';
    }
    if (live.price) html += '<p><span class="label">' + labels.price + ': </span>' + escapeHtml(live.price) + '</p>';
    if (live.description) html += '<p>' + escapeHtml(live.description) + '</p>';
    if (live.detail) {
      var rows = live.detail.split("/").map(function (entry) {
        var match = entry.trim().match(/^(\S+)\s+(.+)$/);
        if (!match) return '<tr><td colspan="2">' + escapeHtml(entry.trim()) + '</td></tr>';
        return '<tr><td>' + escapeHtml(match[1]) + '</td><td>' + escapeHtml(match[2]) + '</td></tr>';
      }).join("");
      html += '<table class="timetable"><tbody>' + rows + '</tbody></table>';
    }
    (live.links || []).forEach(function (link) {
      html += '<p><a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(link.label || link.url) + ' ↗</a></p>';
    });
    return html;
  }

  function liveRow(live) {
    var secondary = [live.venue, live.description].filter(Boolean).join(" / ");
    return '<article class="live-row">' +
      '<button class="live-summary" type="button" aria-expanded="false">' +
      '<span class="live-date">' + escapeHtml(localDate(live.date)) + '</span>' +
      '<span><span class="live-title">' + escapeHtml(live.title) + '</span>' +
      (secondary ? '<span class="live-sub">' + escapeHtml(secondary) + '</span>' : '') +
      '</span><span class="live-toggle" aria-hidden="true">[+]</span></button>' +
      '<div class="live-detail">' + liveDetail(live) + '</div></article>';
  }

  function enableLiveToggles(container) {
    container.querySelectorAll(".live-summary").forEach(function (button) {
      button.addEventListener("click", function () {
        var row = button.closest(".live-row");
        var open = !row.classList.contains("is-open");
        row.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
        button.querySelector(".live-toggle").textContent = open ? "[-]" : "[+]";
      });
    });
  }

  function renderLiveContainer(container, lives, emptyText) {
    if (!container) return;
    if (!lives.length) {
      container.innerHTML = '<div class="empty-state"><p>' + escapeHtml(emptyText) + '</p></div>';
      return;
    }
    container.classList.add("live-list");
    container.innerHTML = lives.map(liveRow).join("");
    enableLiveToggles(container);
  }

  function renderLives(data) {
    var lives = (data.lives || []).filter(function (live) {
      return live.visible !== false;
    }).sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });
    var upcoming = lives.filter(function (live) { return !isPast(live.date); });
    var past = lives.filter(function (live) { return isPast(live.date); }).reverse();
    renderLiveContainer(document.getElementById("next-live"), upcoming.slice(0, 1), labels.empty);
    renderLiveContainer(document.getElementById("upcoming-lives"), upcoming, labels.empty);
    renderLiveContainer(document.getElementById("past-lives"), past, labels.archiveEmpty);
  }

  function showError(error) {
    console.error(error);
    document.querySelectorAll(".loading").forEach(function (item) {
      item.className = "error-message";
      item.textContent = lang === "ja"
        ? "コンテンツを読み込めませんでした。"
        : "Content could not be loaded.";
    });
  }

  document.querySelectorAll("[data-current-year]").forEach(function (item) {
    item.textContent = new Date().getFullYear();
  });

  Promise.all([fetchJSON("site.json"), fetchJSON("lives.json")])
    .then(function (results) {
      renderSocials(results[0]);
      renderMembers(results[0]);
      renderLives(results[1]);
    })
    .catch(showError);
})();
