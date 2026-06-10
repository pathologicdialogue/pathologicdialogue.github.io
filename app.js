const loading =
    document.getElementById(
        "loading"
    );

const input =
    document.getElementById(
        "searchInput"
    );

const results =
    document.getElementById(
        "results"
    );

const topSearches =
    document.getElementById(
        "topSearches"
    );

const button =
    document.getElementById(
        "searchButton"
    );

const wholeWord =
    document.getElementById(
        "wholeWord"
    );

const normalizeSearch =
    document.getElementById(
        "normalizeSearch"
    );

const ignorePunctuation =
    document.getElementById(
        "ignorePunct"
    );

const languageMode =
    document.getElementById(
        "languageMode"
    );

const languageList =
    document.getElementById(
        "languageList"
    );

const gameMode =
    document.getElementById(
        "gameMode"
    );

const gameList =
    document.getElementById(
        "gameList"
    );

const CLIENT_TAG =
    "git";

var searchInProgress = false;

var plagueMessages = [

    "You ask for everything at once. That is not a search. That is an epidemic.",

    "This Town has endured enough suffering without returning you the entire database.",

    "Not even the Inquisitor demands everything at once.",

    "The Steppe is vast enough already. Narrow your request.",

    "A search made entirely of wildcards is merely a polite way of asking for the whole archive.",

    "Your query matches everything. So does the plague.",

    "The Polyhedron may defy reason. This server may not.",

    "There is already enough death in this Town. You don't need to kill the server too.",

	"A search made entirely of wildcards is merely a polite way of asking for the whole archive.",

	"You requested everything. Precision is a virtue; indiscriminate hunger is not.",

	"Do what you think is apt. I only ask one thing of you: spare those queries that can be spared.",

	"Take good care of yourself. Drink. Eat. Sleep. Avoid asking for literally everything.",

	"Menkhu know the lines of the body. They cut only where they have the right.",

	"The Haruspex knows what to cut away and what to spare. Your query does not.",

	"Menkhu know how to separate parts of the body so the Earth will accept them. Your query lacks such delicacy.",

	"The ones who know the lines of the body have the right to make cuts. Your query has not earned that right."

];


// ---------- EVENTS ----------
button.addEventListener("click", search);

input.addEventListener(
    "keydown",
    function(e) {

        if (
            e.key === "Enter" &&
            !searchInProgress
        ) {

            search();

        }

    }
);

setInterval(loadTopSearches, 20000);

// ---------- FILTER UI ----------
setupToggle(
    languageMode,
    languageList
);

setupToggle(
    gameMode,
    gameList
);

loadTopSearches();

// ---------- SEARCH ----------
async function search() {

    if (searchInProgress) {
        return;
    }

    const q =
        input.value.trim();

    console.log("SEARCH", q);

    if (!q) {
        results.innerHTML = "";
        return;
    }

    // ---------- PURE WILDCARD BLOCK ----------

    if (isPureWildcard(q)) {

        results.innerHTML =
            "<p>"
            +
            plagueMessages[
                Math.floor(
                    Math.random() *
                    plagueMessages.length
                )
            ]
            +
            "</p>";

        return;
    }

    // ---------- EMPTY QUERY ----------

    if (
        isEmptyAfterPreparation(q)
    ) {

        results.innerHTML =
            "<p>" +
            plagueMessages[
                Math.floor(
                    Math.random() *
                    plagueMessages.length
                )
            ] +
            "</p>";

        return;

    }

    // ---------- BROAD SEARCH WARNING ----------

    if (isBroadSearch(q)) {

        var proceed =
            confirm(
                "Menkhu know the lines of the body.\n\n" +
                "This search ignores most of them and may take some time.\n\n" +
                "Continue?"
            );

        if (!proceed) {
            return;
        }
    }

    let url =
        "https://aglaya.pro/pathosearch/api/search?q=" +
        encodeURIComponent(q) +
        "&client=" +
        encodeURIComponent(CLIENT_TAG);

    // ---------- LANGUAGE FILTER ----------

    appendFilter(
        {
            mode: languageMode,
            container: "#languageList",
            param: "languages"
        }
    );

    // ---------- GAME FILTER ----------

    appendFilter(
        {
            mode: gameMode,
            container: "#gameList",
            param: "games"
        }
    );

    // ---------- WHOLE WORD ----------

    if (wholeWord.checked) {
        url += "&whole=1";
    }

    // ---------- NORMALIZATION ----------

    if (!normalizeSearch.checked) {
        url += "&normalize=0";
    }

    // ---------- IGNORE PUNCTUATION ----------

    if (ignorePunctuation.checked) {
        url += "&punct=0";
    }

    console.log("REQUEST", url);

    // ---------- predict backend mode ----------

    var normalizedQ =
        searchNormalize(q);

    var queryTokens =
        normalizedQ
            .split(
                /[^A-Za-z0-9\u0400-\u052F]+/
            )
            .filter(Boolean);

    var useIndex =
        normalizeSearch.checked &&
        q.indexOf("%") === -1 &&
        q.indexOf("_") === -1 &&
        queryTokens.length &&
        queryTokens.every(
            function(token) {
                return token.length >= 2;
            }
        );

    // ---------- loading text ----------

    loading.style.display =
        "inline";

    loading.textContent =
        useIndex
            ?
            "Searching"
            :
            "Searching without index — this may take a while";

    searchInProgress = true;
    button.disabled = true;

    try {

        const res =
            await fetch(url);

        const data =
            await res.json();

        renderResults(data);

        loadTopSearches();

    }
    catch(err) {

        console.error(err);

        results.innerHTML =
            "<p>Search error.</p>";

    }
    finally {

        loading.style.display =
            "none";

        button.disabled =
            false;

        searchInProgress =
            false;

    }

    function appendFilter(config) {

        if (config.mode.value !== "custom") {
            return;
        }

        let selected =
            getSelectedValues(
                config.container
            );

        // nothing selected -> select all

        if (!selected.length) {

            selectAll(
                config.container
            );

            selected =
                getSelectedValues(
                    config.container
                );

        }

        url +=
            "&" +
            config.param +
            "=" +
            encodeURIComponent(
                selected.join(",")
            );
    }
}


// ---------- RESULTS ----------
function renderResults(data) {
    results.innerHTML =
        "";

    if (!data.length) {
        results.innerHTML = "<p>No results.</p>";
        return;
    }

    for (const row of data) {
        const div = document.createElement("div");
        div.className = "result";
        div.innerHTML = `
          <div class="quote">
            <p class="speaker">
              <strong>
                ${escapeHtml(row.speaker || "Unknown")}
              </strong>
            </p>
            <p class="text">
                ${highlightMatch(
    row.text_content,
    row.matchRanges || []
)}
            </p>
            <p class="meta">
                ${escapeHtml(row.language || "unknown")}
                |
                ${escapeHtml(row.game ||"unknown")}
                |
                <a class="source" href="${row.url}" target="_blank">
                    ${row.url}
                </a>
            </p>
          </div>
        `;

        results.appendChild(div);
    }
}


// ---------- HELPERS ----------
function setupToggle(mode, list){
    mode.addEventListener(
        "change",
        function() {
            list.style.display =
                mode.value === "custom"
                ?
                "block"
                :
                "none";
        }
    );
}


function getSelectedValues(selector) {
    return Array.from(document.querySelectorAll(selector + " input:checked"))
      .map(el => el.value);
}

function selectAll(selector){
    document.querySelectorAll(selector + " input")
        .forEach(
            function(el) {
                el.checked = true;
            }
        );
}


function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}


function displayNormalize(text) {
    return String(text).replace(/һ/g, "Һ");
}

function highlightMatch(
    text,
    matchRanges
) {

    if (!text) {
        return "";
    }

    if (
        !matchRanges ||
        !matchRanges.length
    ) {

        return escapeHtml(
            displayNormalize(text)
        );
    }

    // ---------- coverage map ----------

    var coverage =
        new Array(
            text.length
        ).fill(0);

    for (
        var r = 0;
        r < matchRanges.length;
        r++
    ) {

        var start =
            matchRanges[r][0];

        var end =
            matchRanges[r][1];

        for (
            var i = start;
            i < end &&
            i < text.length;
            i++
        ) {

            coverage[i]++;

        }

    }

    // ---------- render ----------

    var result = "";
    var current = 0;

    for (
        var i = 0;
        i < text.length;
        i++
    ) {

        var level =
            coverage[i];

        if (
            level !== current
        ) {

            if (
                current > 0
            ) {

                result +=
                    "</mark>";

            }

            if (
                level > 0
            ) {

                var hue;

                // yellow → orange → red

                if (
                    level <= 4
                ) {

                    hue =
                        60 -
                        (
                            level - 1
                        ) * 15;

                }

                // continue spectrum

                else {

                    hue =
                        (
                            220 -
                            level * 20
                        ) % 360;

                    if (
                        hue < 0
                    ) {
                        hue += 360;
                    }

                }

                result +=
                    '<mark style="background:hsl('
                    +
                    hue
                    +
                    ',95%,65%)">';
            }

            current =
                level;
        }

        result +=
            escapeHtml(
                displayNormalize(
                    text[i]
                )
            );

    }

    if (
        current > 0
    ) {

        result +=
            "</mark>";

    }

    return result;
}

// ---------- TOP SEARCHES ----------
function restoreCheckboxes(selector, values) {
    document
        .querySelectorAll(selector + " input")
        .forEach(function(el) {
            el.checked = values.includes(el.value);
        });
}


function applyTopSearch(row) {

    input.value =
        row.query_text;

    // ---------- WHOLE WORD ----------

    wholeWord.checked =
        !!row.whole_word;

    // ---------- NORMALIZATION ----------

    normalizeSearch.checked =
        row.normalize_search
            ? true
            : false;

    // ---------- IGNORE PUNCTUATION ----------

    ignorePunctuation.checked =
        row.ignore_punctuation
            ? true
            : false;

    // ---------- LANGUAGES ----------

    if (row.languages) {

        languageMode.value =
            "custom";

        languageList.style.display =
            "block";

        restoreCheckboxes(
            "#languageList",
            row.languages.split(",")
        );

    }
    else {

        languageMode.value =
            "all";

        languageList.style.display =
            "none";

    }

    // ---------- GAMES ----------

    if (row.games) {

        gameMode.value =
            "custom";

        gameList.style.display =
            "block";

        restoreCheckboxes(
            "#gameList",
            row.games.split(",")
        );

    }
    else {

        gameMode.value =
            "all";

        gameList.style.display =
            "none";

    }

    search();

}

async function loadTopSearches() {
    try {
        const res = await fetch("https://aglaya.pro/pathosearch/api/topsearches");
        const data = await res.json();
        renderTopSearches(data);
    }
    catch(err) {
        console.error(err);
    }
}


function renderTopSearches(data) {
    topSearches.innerHTML ="<h3>Popular searches</h3>";
    if (!data.length) {
        return;
    }

    for (const row of data) {
        const item = document.createElement("button");
        item.className = "top-search";
        var meta = "";
        if (row.languages) {
            meta +=
                '<span class="tag">'
                +
                escapeHtml(row.languages)
                +
                '</span>';
        }

        if (row.games) {
            meta +=
                '<span class="tag">'
                +
                escapeHtml(row.games)
                +
                '</span>';
        }

        if (row.whole_word) {
            meta += '<span class="tag">w</span>';
        }

        item.innerHTML =
    '<div class="top-row">'
        +
        '<span class="top-query">'
            +
            escapeHtml(displayNormalize(row.query_text))
        +
        '</span>'
        +
        '<span class="top-meta">'
            +
            meta
        +
        '</span>'
        +
        '<span class="top-count">('
            +
            row.count
            +
            ')</span>'
    +
    '</div>';
        item.addEventListener("click", function() {
                applyTopSearch(row);
            }
        );
        topSearches.appendChild(item);
    }
}

/*function pollReindexStatus() {
  fetch("api/log?limit=10")
  .then(function(r){
    return r.json();
  })
  .then(function(rows){
    var status = document.getElementById("reindexStatus");
    if (!status) {
      return;
    }

    for (var i = 0; i < rows.length; i++) {
      var msg = rows[i].message || "";

      // ---------- FINISHED ----------
      if ( msg.indexOf("INDEXER COMPLETE") !== -1) {
        document.querySelectorAll(".techbreak")
          .forEach(function(el){
            el.remove();
          });

        status.outerHTML =
          "<h1>Pathologic Dialogue Search</h1>";

        clearInterval(
          reindexTimer
        );
        return;
      }

      // ---------- ACTIVE REINDEX ----------
      var pos =
        msg.indexOf(
          "REINDEX "
        );
      if (
        pos !== -1
      ) {

        status.textContent =
          msg.slice(pos);
        return;
      }
    }
  })
  .catch(function(){});
}

pollReindexStatus();

var reindexTimer = setInterval(pollReindexStatus, 5000);
*/

function isBroadSearch(q) {

    var normalized =
        searchNormalize(q);

    var stripped =
        normalized.replace(
            /[%_]/g,
            ""
        );

    // only wildcards
    if (
        /^[%_]+$/.test(
            normalized
        )
    ) {
        return true;
    }

    // 0–1 real symbols
    if (
        stripped.length <= 1
    ) {
        return true;
    }

    return false;
}

function isPureWildcard(q) {

    var normalized =
        searchNormalize(q)
            .replace(/\s+/g, "");

    return /^[%_]+$/.test(
        normalized
    );
}

function isEmptyAfterPreparation(q) {

    var prepared =
        q;

    if (
        normalizeSearch &&
        normalizeSearch.checked
    ) {
        prepared =
            searchNormalize(
                prepared
            );
    }

    if (
        ignorePunctuation &&
        ignorePunctuation.checked
    ) {
        prepared =
            prepared.replace(
                /[^A-Za-z0-9\u00C0-\u024F\u0400-\u052F\s%_]/gu,
                " "
            );
    }

    prepared =
        prepared
            .replace(/\s+/g, "")
            .replace(/[%_]/g, "");

    return prepared.length === 0;

}

function searchNormalize(text) {
  if (!text)
    return "";

  return String(text)
    .toLowerCase()
        // h / x family
        .replace(/[һhхx]/g, "х")
        // o family
        .replace(/[oоөѳ]/g, "о")
        // u family
        .replace(/[уyү]/g, "у")
        // elipsis
        .replace(/[…]/g, "...")
        // е family
        .replace(/[ёeе]/g, "e")
}
