(function () {
  "use strict";

  // --- Utility ---

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    var dow = weekdays[d.getDay()];
    return year + "/" + month + "/" + day + " (" + dow + ")";
  }

  function fetchJSON(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("Failed to fetch " + url);
      return res.json();
    });
  }

  // --- Render: Lives ---

  function renderLives(data) {
    var container = document.getElementById("lives-container");
    var lives = (data.lives || []).filter(function (l) {
      return l.visible !== false;
    });

    // Sort by date ascending (nearest first)
    lives.sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });

    if (lives.length === 0) {
      container.innerHTML =
        '<p class="empty-message">現在予定されているライブはありません。</p>';
      return;
    }

    container.innerHTML = lives
      .map(function (live) {
        var html = '<div class="card">';
        html +=
          '<div class="card-date">' + escapeHtml(formatDate(live.date)) + "</div>";
        html +=
          '<div class="card-title">' + escapeHtml(live.title) + "</div>";
        html += '<div class="card-body">';

        if (live.venue) {
          html +=
            "<p><span class=\"label\">会場: </span>" +
            escapeHtml(live.venue) +
            "</p>";
        }
        if (live.address) {
          html +=
            "<p><span class=\"label\">住所: </span>" +
            escapeHtml(live.address) +
            "</p>";
        }
        if (live.open || live.start) {
          var time = "";
          if (live.open) time += "OPEN " + escapeHtml(live.open);
          if (live.open && live.start) time += " / ";
          if (live.start) time += "START " + escapeHtml(live.start);
          html += "<p><span class=\"label\">時間: </span>" + time + "</p>";
        }
        if (live.price) {
          html +=
            "<p><span class=\"label\">料金: </span>" +
            escapeHtml(live.price) +
            "</p>";
        }
        if (live.acts && live.acts.length > 0) {
          html +=
            "<p><span class=\"label\">出演: </span>" +
            live.acts.map(function (a) {
              return a === "Digital Meat"
                ? "<strong style=\"color:var(--green)\">" + escapeHtml(a) + "</strong>"
                : escapeHtml(a);
            }).join(" / ") +
            "</p>";
        }
        if (live.description) {
          html += "<p>" + escapeHtml(live.description) + "</p>";
        }
        if (live.detail) {
          html +=
            "<p class=\"label\" style=\"margin-top:8px;\">タイムテーブル:</p>" +
            "<p>" + escapeHtml(live.detail) + "</p>";
        }
        if (live.links && live.links.length > 0) {
          html += "<p>";
          live.links.forEach(function (link) {
            html +=
              '<a href="' +
              escapeHtml(link.url) +
              '" target="_blank" rel="noopener" style="color:var(--green);">' +
              escapeHtml(link.label || link.url) +
              "</a> ";
          });
          html += "</p>";
        }
        if (live.flyer) {
          html +=
            '<img class="flyer-img" src="' +
            escapeHtml(live.flyer) +
            '" alt="' +
            escapeHtml(live.title) +
            ' フライヤー" loading="lazy">';
        }

        html += "</div></div>";
        return html;
      })
      .join("");
  }

  // --- Render: News ---

  function renderNews(data) {
    var container = document.getElementById("news-container");
    var news = (data.news || []).filter(function (n) {
      return n.visible !== false;
    });

    // Sort by date descending (newest first)
    news.sort(function (a, b) {
      return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
    });

    if (news.length === 0) {
      container.innerHTML =
        '<p class="empty-message">ニュースはありません。</p>';
      return;
    }

    container.innerHTML = news
      .map(function (item) {
        var html = '<div class="card">';
        html +=
          '<div class="card-date">' +
          escapeHtml(formatDate(item.date)) +
          "</div>";
        html +=
          '<div class="card-title">' + escapeHtml(item.title) + "</div>";
        html +=
          '<div class="card-body"><p>' + escapeHtml(item.body) + "</p></div>";
        html += "</div>";
        return html;
      })
      .join("");
  }

  // --- Render: Site (members, SNS, tagline) ---

  function renderSite(data) {
    // Tagline
    var taglineEl = document.getElementById("tagline");
    if (data.tagline) {
      taglineEl.textContent = data.tagline;
    }

    // Members
    var membersContainer = document.getElementById("members-container");
    if (data.members && data.members.length > 0) {
      membersContainer.innerHTML = data.members
        .map(function (m) {
          return (
            '<div class="card member-card">' +
            '<span class="member-name">' +
            escapeHtml(m.name) +
            "</span>" +
            '<span class="member-alias">/ ' +
            escapeHtml(m.alias) +
            "</span>" +
            '<span class="member-part">' +
            escapeHtml(m.part) +
            "</span>" +
            "</div>"
          );
        })
        .join("");
    }

    // Formed
    var formedEl = document.getElementById("formed");
    if (data.formed) {
      formedEl.textContent = "結成 " + data.formed;
    }

    // SNS Links
    var linksContainer = document.getElementById("links-container");
    if (data.sns && data.sns.length > 0) {
      linksContainer.innerHTML = data.sns
        .map(function (s) {
          var note = s.note
            ? ' <span class="link-note">' + escapeHtml(s.note) + "</span>"
            : "";
          return (
            '<div class="card link-card">' +
            '<span class="link-platform">[' +
            escapeHtml(s.platform) +
            "]</span>" +
            '<a href="' +
            escapeHtml(s.url) +
            '" target="_blank" rel="noopener">' +
            escapeHtml(s.label || s.url) +
            "</a>" +
            note +
            "</div>"
          );
        })
        .join("");
    }

    // Footer year
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  // --- Init ---

  Promise.all([
    fetchJSON("content/site.json"),
    fetchJSON("content/lives.json"),
    fetchJSON("content/news.json"),
  ])
    .then(function (results) {
      renderSite(results[0]);
      renderLives(results[1]);
      renderNews(results[2]);
    })
    .catch(function (err) {
      console.error("Failed to load content:", err);
    });
})();
