(function () {
  "use strict";

  var lang = document.body.dataset.lang === "en" ? "en" : "ja";
  var contentBase = document.body.dataset.contentBase || "content/";

  // --- Utility ---

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var weekdays = lang === "en"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["日", "月", "火", "水", "木", "金", "土"];
    var dow = weekdays[d.getDay()];
    return month + "/" + day + " (" + dow + ")";
  }

  function isPast(dateStr) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var d = new Date(dateStr + "T00:00:00");
    return d < today;
  }

  function fetchJSON(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("Failed to fetch " + url);
      return res.text().then(function (text) {
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(url + " の JSON が壊れています: " + e.message);
        }
      });
    });
  }

  function liveField(live, key) {
    var translated = live[key + "_en"];
    return lang === "en" && translated ? translated : live[key];
  }

  function showError(message) {
    var el = document.createElement("div");
    el.style.cssText =
      "background:#1a0000;border:1px solid #ff4444;color:#ff6666;" +
      "font-family:monospace;font-size:13px;padding:12px 16px;" +
      "margin:16px auto;max-width:700px;white-space:pre-wrap;";
    el.textContent = "⚠ " + message;
    var main = document.querySelector("main");
    if (main) main.prepend(el);
  }

  // --- SNS Icon SVGs ---

  var SNS_ICONS = {
    Instagram:
      '<svg viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>',
    YouTube:
      '<svg viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>',
    Twitter:
      '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    X: '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  };

  // Fallback: generic link icon
  var FALLBACK_ICON =
    '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>';

  // --- Render: Lives ---

  function renderLives(data) {
    var container = document.getElementById("lives-container");
    if (!container) return;
    var lives = (data.lives || []).filter(function (l) {
      return l.visible !== false && !isPast(l.date);
    });

    // Sort by date ascending (nearest first)
    lives.sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });

    if (lives.length === 0) {
      container.innerHTML =
        '<p class="empty-message">' +
        (lang === "en" ? "No upcoming shows are currently announced." : "現在予定されているライブはありません。") +
        "</p>";
      return;
    }

    container.innerHTML = lives
      .map(function (live) {
        var html = '<div class="live-row">';

        // Summary (always visible)
        html += '<div class="live-summary">';
        html += '<span class="live-toggle">[+]</span>';
        html += '<div class="live-summary-text">';
        html +=
          '<div class="live-summary-line1">' +
          '<span class="live-date">' + escapeHtml(formatDate(live.date)) + "</span>" +
          '<span class="live-title">' + escapeHtml(liveField(live, "title")) + "</span>" +
          "</div>";
        var sub = [];
        if (live.venue) sub.push(escapeHtml(liveField(live, "venue")));
        if (live.description) sub.push(escapeHtml(liveField(live, "description")));
        if (sub.length > 0) {
          html +=
            '<div class="live-summary-line2">' + sub.join(" / ") + "</div>";
        }
        html += "</div></div>";

        // Detail (collapsed)
        html += '<div class="live-detail"><div class="live-detail-inner">';

        if (live.venue) {
          html +=
            "<p><span class=\"label\">" + (lang === "en" ? "Venue" : "会場") + ": </span>" +
            escapeHtml(liveField(live, "venue")) +
            "</p>";
        }
        if (live.address) {
          html +=
            "<p><span class=\"label\">" + (lang === "en" ? "Address" : "住所") + ": </span>" +
            escapeHtml(liveField(live, "address")) +
            "</p>";
        }
        if (live.open || live.start) {
          var time = "";
          if (live.open) time += "OPEN " + escapeHtml(live.open);
          if (live.open && live.start) time += " / ";
          if (live.start) time += "START " + escapeHtml(live.start);
          html += "<p><span class=\"label\">" + (lang === "en" ? "Time" : "時間") + ": </span>" + time + "</p>";
        }
        if (live.price) {
          html +=
            "<p><span class=\"label\">" + (lang === "en" ? "Price" : "料金") + ": </span>" +
            escapeHtml(liveField(live, "price")) +
            "</p>";
        }
        if (live.description) {
          html += "<p>" + escapeHtml(liveField(live, "description")) + "</p>";
        }
        if (live.detail) {
          var rows = liveField(live, "detail").split("/").map(function (entry) {
            entry = entry.trim();
            var m = entry.match(/^(\S+)\s+(.+)$/);
            if (m) {
              var act = m[2].trim();
              var actHtml =
                act === "Digital Meat"
                  ? '<strong style="color:var(--green)">' + escapeHtml(act) + "</strong>"
                  : escapeHtml(act);
              return (
                "<tr><td>" + escapeHtml(m[1]) + "</td><td>" + actHtml + "</td></tr>"
              );
            }
            return "<tr><td colspan=\"2\">" + escapeHtml(entry) + "</td></tr>";
          });
          html +=
            '<table class="timetable">' +
            "<tr><th>" + (lang === "en" ? "Time" : "時間") + "</th><th>" + (lang === "en" ? "Act" : "出演") + "</th></tr>" +
            rows.join("") +
            "</table>";
        }
        if (live.links && live.links.length > 0) {
          html += "<p>";
          live.links.forEach(function (link) {
            html +=
              '<a href="' +
              escapeHtml(link.url) +
              '" target="_blank" rel="noopener">' +
              escapeHtml(lang === "en" ? (link.label_en || link.label || link.url) : (link.label || link.url)) +
              "</a> ";
          });
          html += "</p>";
        }

        html += "</div></div></div>";
        return html;
      })
      .join("");

    // Toggle click handlers
    container.querySelectorAll(".live-row").forEach(function (row) {
      row.querySelector(".live-summary").addEventListener("click", function () {
        row.classList.toggle("open");
        var toggle = row.querySelector(".live-toggle");
        toggle.textContent = row.classList.contains("open") ? "[-]" : "[+]";
      });
    });
  }

  function renderArchive(data) {
    var container = document.getElementById("archive-container");
    if (!container) return;

    var lives = (data.lives || []).filter(function (live) {
      return live.visible !== false && isPast(live.date);
    }).sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });

    if (lives.length === 0) {
      container.innerHTML = '<p class="empty-message">過去の公演情報はまだありません。</p>';
      return;
    }

    container.innerHTML = lives.map(function (live) {
      var link = live.links && live.links.length ? live.links[0].url : "";
      var tag = link ? "a" : "div";
      var attrs = link
        ? ' href="' + escapeHtml(link) + '" target="_blank" rel="noopener noreferrer"'
        : "";
      return "<" + tag + ' class="archive-row"' + attrs + ">" +
        '<span class="archive-date">' + escapeHtml(live.date.replace(/-/g, ".")) + "</span>" +
        '<span class="archive-title">' + escapeHtml(live.title) + "</span>" +
        '<span class="archive-venue">' + escapeHtml(live.venue || "") + (link ? " ↗" : "") + "</span>" +
        "</" + tag + ">";
    }).join("");
  }

  // --- Render: Site (members, SNS, tagline) ---

  function renderSite(data) {
    // Tagline
    var taglineEl = document.getElementById("tagline");
    if (taglineEl && data.tagline) {
      taglineEl.textContent = "We are Japanene Rock’n’Roll Band";
    }

    // SNS Icons
    var iconsContainer = document.getElementById("sns-icons");
    if (iconsContainer && data.sns && data.sns.length > 0) {
      iconsContainer.innerHTML = data.sns
        .map(function (s) {
          var icon = SNS_ICONS[s.platform] || FALLBACK_ICON;
          return (
            '<a class="sns-icon" href="' +
            escapeHtml(s.url) +
            '" target="_blank" rel="noopener" title="' +
            escapeHtml(s.platform) +
            '">' +
            icon +
            "</a>"
          );
        })
        .join("");
    }

    // Members
    var membersContainer = document.getElementById("members-container");
    if (membersContainer && data.members && data.members.length > 0) {
      membersContainer.innerHTML =
        '<div class="members-list">' +
        data.members
          .map(function (m) {
            return (
              '<div class="member-row">' +
              '<span class="member-name">' +
              escapeHtml(m.name) +
              "</span>" +
              '<span class="member-alias">/ ' +
              escapeHtml(m.alias) +
              "</span>" +
              '<span class="member-part">' +
              escapeHtml(lang === "en" ? (m.instrument || m.part) : m.part) +
              "</span>" +
              "</div>"
            );
          })
          .join("") +
        "</div>";
    }

    // Formed
    var formedEl = document.getElementById("formed");
    if (formedEl && data.formed) {
      formedEl.textContent = (lang === "en" ? "Formed " : "結成 ") + data.formed;
    }

    // Footer year
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // --- Init ---

  Promise.all([
    fetchJSON(contentBase + "site.json"),
    fetchJSON(contentBase + "lives.json"),
  ])
    .then(function (results) {
      renderSite(results[0]);
      renderLives(results[1]);
      renderArchive(results[1]);
    })
    .catch(function (err) {
      console.error("Failed to load content:", err);
      showError(
        "コンテンツの読み込みに失敗しました。\n" +
          err.message +
          "\n\n" +
          "JSON の書き方を確認してください（カンマの過不足、閉じカッコの漏れなど）。"
      );
    });
})();
