/* =========================================================
   WORLD TV 3D
   TV + RADIO PLAYER
   ========================================================= */


/* =========================================================
   DATA SOURCES
   ========================================================= */

const TV_PLAYLIST =
    "https://iptv-org.github.io/iptv/index.country.m3u";


const RADIO_API =
    "https://de1.api.radio-browser.info";


/* =========================================================
   ELEMENTS
   ========================================================= */

const countryList =
    document.getElementById(
        "countryList"
    );


const channelList =
    document.getElementById(
        "channelList"
    );


const countrySearch =
    document.getElementById(
        "countrySearch"
    );


const channelSearch =
    document.getElementById(
        "channelSearch"
    );


const countryCount =
    document.getElementById(
        "countryCount"
    );


const channelCount =
    document.getElementById(
        "channelCount"
    );


const countryTitle =
    document.getElementById(
        "countryTitle"
    );


const title =
    document.getElementById(
        "title"
    );


const infoTitle =
    document.getElementById(
        "infoTitle"
    );


const infoCountry =
    document.getElementById(
        "infoCountry"
    );


const video =
    document.getElementById(
        "video"
    );


const empty =
    document.getElementById(
        "empty"
    );


const message =
    document.getElementById(
        "message"
    );


const tvTab =
    document.getElementById(
        "tvTab"
    );


const radioTab =
    document.getElementById(
        "radioTab"
    );


/* =========================================================
   STATE
   ========================================================= */

let allTVChannels = [];

let allRadioChannels = [];

let countries = [];

let selectedCountry = "";

let selectedType = "tv";

let hls = null;


/* =========================================================
   COUNTRY FLAGS
   ========================================================= */

const flagMap = {

    India: "🇮🇳",

    "United States": "🇺🇸",

    "United Kingdom": "🇬🇧",

    Japan: "🇯🇵",

    Germany: "🇩🇪",

    France: "🇫🇷",

    Canada: "🇨🇦",

    Australia: "🇦🇺",

    Brazil: "🇧🇷",

    Pakistan: "🇵🇰",

    Bangladesh: "🇧🇩",

    China: "🇨🇳",

    "South Korea": "🇰🇷",

    Italy: "🇮🇹",

    Spain: "🇪🇸",

    Russia: "🇷🇺",

    Turkey: "🇹🇷",

    "United Arab Emirates": "🇦🇪",

    Singapore: "🇸🇬",

    Malaysia: "🇲🇾",

    Indonesia: "🇮🇩",

    Nepal: "🇳🇵",

    "Sri Lanka": "🇱🇰",

    Thailand: "🇹🇭",

    Philippines: "🇵🇭",

    "South Africa": "🇿🇦",

    Mexico: "🇲🇽",

    Argentina: "🇦🇷",

    Netherlands: "🇳🇱",

    Belgium: "🇧🇪",

    Portugal: "🇵🇹",

    Sweden: "🇸🇪",

    Norway: "🇳🇴",

    Denmark: "🇩🇰",

    Finland: "🇫🇮",

    Poland: "🇵🇱",

    Ukraine: "🇺🇦",

    Ireland: "🇮🇪",

    Greece: "🇬🇷",

    Israel: "🇮🇱",

    SaudiArabia: "🇸🇦",

    Qatar: "🇶🇦",

    Egypt: "🇪🇬"

};


function flag(name) {

    return (
        flagMap[name] ||
        "🌐"
    );

}


/* =========================================================
   LOAD TV PLAYLIST
   ========================================================= */

async function loadTVPlaylist() {

    try {

        const response =
            await fetch(
                TV_PLAYLIST,
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "TV playlist request failed"
            );

        }


        const text =
            await response.text();


        allTVChannels =
            parseM3U(text);


        countries =
            [
                ...new Set(

                    allTVChannels

                        .map(
                            channel =>
                                channel.country
                        )

                        .filter(Boolean)

                )
            ]

            .sort(
                (a,b) =>
                    a.localeCompare(b)
            );


        countryCount.textContent =
            countries.length;


        renderCountries(
            countries
        );


        if (countries.length) {

            const defaultCountry =

                countries.includes(
                    "India"
                )

                    ? "India"

                    : countries[0];


            selectCountry(
                defaultCountry
            );

        } else {

            countryList.innerHTML =

                `
                <div class="message">

                    No countries found.

                </div>
                `;

        }


    } catch (error) {

        console.error(
            "TV playlist error:",
            error
        );


        countryList.innerHTML =

            `
            <div class="message">

                Could not load TV playlist.

                <br><br>

                Run this project using
                VS Code Live Server.

            </div>
            `;


        channelList.innerHTML =

            `
            <div class="message">

                TV channels could not
                be loaded.

            </div>
            `;

    }

}


/* =========================================================
   M3U PARSER
   ========================================================= */

function parseM3U(text) {

    const lines =
        text.split(/\r?\n/);


    const result = [];

    let item = null;


    for (
        const raw of lines
    ) {

        const line =
            raw.trim();


        if (
            line.startsWith(
                "#EXTINF"
            )
        ) {


            const nameMatch =
                line.match(
                    /,(.*)$/
                );


            const logoMatch =
                line.match(
                    /tvg-logo="([^"]*)"/i
                );


            const groupMatch =
                line.match(
                    /group-title="([^"]*)"/i
                );


            item = {

                name:

                    nameMatch

                        ? nameMatch[1].trim()

                        : "Unknown",


                logo:

                    logoMatch

                        ? logoMatch[1]

                        : "",


                country:

                    groupMatch

                        ? groupMatch[1].trim()

                        : "",


                stream:
                    ""

            };


        } else if (

            item &&

            line &&

            !line.startsWith("#")

        ) {


            item.stream =
                line;


            if (
                /^https?:\/\//i
                    .test(
                        item.stream
                    )
            ) {

                result.push(
                    item
                );

            }


            item = null;

        }

    }


    return result;

}


/* =========================================================
   COUNTRY LIST
   ========================================================= */

function renderCountries(
    list
) {

    countryList.innerHTML =
        "";


    if (!list.length) {

        countryList.innerHTML =

            `
            <div class="message">

                No countries found.

            </div>
            `;

        return;
    }


    list.forEach(
        name => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =

                "country" +

                (
                    name ===
                    selectedCountry

                        ? " active"

                        : ""
                );


            button.innerHTML =

                `
                <span class="flag">
                    ${flag(name)}
                </span>

                <span class="country-name">
                    ${escapeHTML(name)}
                </span>
                `;


            button.onclick =
                () =>
                    selectCountry(
                        name
                    );


            countryList.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   SELECT COUNTRY
   ========================================================= */

async function selectCountry(
    name
) {

    selectedCountry =
        name;


    countryTitle.textContent =
        name;


    channelSearch.value =
        "";


    renderCountries(

        countries.filter(
            country =>

                country
                    .toLowerCase()
                    .includes(

                        countrySearch
                            .value
                            .toLowerCase()
                            .trim()

                    )
        )

    );


    if (
        selectedType ===
        "tv"
    ) {

        renderTVChannels();

    } else {

        await loadRadioForCountry(
            name
        );

    }

}


/* =========================================================
   TV CHANNELS
   ========================================================= */

function renderTVChannels() {

    const query =

        channelSearch.value
            .toLowerCase()
            .trim();


    const list =

        allTVChannels.filter(

            channel =>

                channel.country ===
                selectedCountry &&

                channel.name
                    .toLowerCase()
                    .includes(
                        query
                    )

        );


    channelCount.textContent =
        list.length;


    renderChannels(
        list,
        "tv"
    );

}


/* =========================================================
   RADIO API
   ========================================================= */

async function loadRadioForCountry(
    country
) {

    channelList.innerHTML =

        `
        <div class="message">

            <div class="spinner"></div>

            Loading radio stations...

        </div>
        `;


    channelCount.textContent =
        "…";


    try {

        const url =

            RADIO_API +

            "/json/stations/bycountry/" +

            encodeURIComponent(
                country
            ) +

            "?hidebroken=true" +

            "&order=votes" +

            "&reverse=true" +

            "&limit=500";


        const response =
            await fetch(
                url,
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Radio API request failed"
            );

        }


        const stations =
            await response.json();


        allRadioChannels =

            stations

                .filter(
                    station =>

                        station.url_resolved ||
                        station.url
                )

                .map(
                    station => ({

                        name:

                            station.name ||
                            "Unknown Radio",


                        logo:

                            station.favicon ||
                            "",


                        country:

                            station.country ||
                            country,


                        stream:

                            station.url_resolved ||
                            station.url,


                        type:
                            "radio"

                    })
                );


        renderRadioChannels();


    } catch (error) {

        console.error(
            "Radio error:",
            error
        );


        allRadioChannels =
            [];


        channelCount.textContent =
            "0";


        channelList.innerHTML =

            `
            <div class="message">

                Could not load radio stations.

                <br><br>

                Try another country.

            </div>
            `;

    }

}


/* =========================================================
   RADIO CHANNELS
   ========================================================= */

function renderRadioChannels() {

    const query =

        channelSearch.value
            .toLowerCase()
            .trim();


    const list =

        allRadioChannels.filter(
            radio =>

                radio.name
                    .toLowerCase()
                    .includes(
                        query
                    )
        );


    channelCount.textContent =
        list.length;


    renderChannels(
        list,
        "radio"
    );

}


/* =========================================================
   RENDER CHANNELS
   ========================================================= */

function renderChannels(
    list,
    type
) {

    channelList.innerHTML =
        "";


    if (!list.length) {

        channelList.innerHTML =

            `
            <div class="message">

                No ${
                    type === "radio"
                        ? "radio stations"
                        : "TV channels"
                } available.

            </div>
            `;

        return;
    }


    list.forEach(
        (channel,index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "channel";


            const icon =

                type === "radio"

                    ? "📻"

                    : "TV";


            button.innerHTML =

                `
                <div class="channel-logo">

                    ${
                        channel.logo

                            ?

                            `
                            <img
                                src="${escapeAttr(
                                    channel.logo
                                )}"
                                onerror="
                                this.style.display='none'
                                "
                            >
                            `

                            :

                            icon
                    }

                </div>


                <div class="channel-info">

                    <strong>
                        ${escapeHTML(
                            channel.name
                        )}
                    </strong>


                    <small>

                        ${
                            type === "radio"

                                ? "📻 Radio"

                                : escapeHTML(
                                    channel.country
                                )

                        }

                    </small>

                </div>


                <span class="arrow">
                    ›
                </span>
                `;


            button.onclick =
                () =>
                    play(
                        channel,
                        button,
                        type
                    );


            channelList.appendChild(
                button
            );


            /*
             * Automatically play
             * first channel.
             */

            if (
                index === 0
            ) {

                play(
                    channel,
                    button,
                    type
                );

            }

        }
    );

}


/* =========================================================
   PLAY
   ========================================================= */

function play(
    channel,
    button,
    type
) {


    /*
     * Active channel
     */

    document
        .querySelectorAll(
            ".channel"
        )

        .forEach(
            element =>

                element.classList.remove(
                    "active"
                )
        );


    button.classList.add(
        "active"
    );


    /*
     * Player information
     */

    title.textContent =
        channel.name;


    infoTitle.textContent =
        channel.name;


    infoCountry.textContent =

        type === "radio"

            ? "📻 Radio • " +
              (
                  channel.country ||
                  selectedCountry
              )

            : channel.country;


    empty.classList.add(
        "hide"
    );


    /*
     * Destroy old HLS
     */

    if (hls) {

        hls.destroy();

        hls = null;

    }


    /*
     * Stop old stream
     */

    video.pause();

    video.removeAttribute(
        "src"
    );

    video.load();


    /* =====================================================
       RADIO
       ===================================================== */

    if (
        type === "radio"
    ) {

        video.src =
            channel.stream;


        video.load();


        video.play()
            .catch(
                error => {

                    console.log(
                        "Autoplay blocked:",
                        error
                    );

                }
            );


        return;

    }


    /* =====================================================
       TV / HLS
       ===================================================== */

    if (
        Hls.isSupported()
    ) {


        hls =
            new Hls({

                enableWorker:
                    true,

                lowLatencyMode:
                    true

            });


        hls.loadSource(
            channel.stream
        );


        hls.attachMedia(
            video
        );


        hls.on(
            Hls.Events.MANIFEST_PARSED,
            () => {

                video.play()
                    .catch(
                        () => {}
                    );

            }
        );


        hls.on(
            Hls.Events.ERROR,
            (
                event,
                data
            ) => {

                if (
                    data.fatal
                ) {

                    console.error(
                        "HLS error:",
                        data
                    );


                    showError(
                        "This channel is currently unavailable."
                    );

                }

            }
        );


    } else if (

        video.canPlayType(
            "application/vnd.apple.mpegurl"
        )

    ) {


        video.src =
            channel.stream;


        video.play()
            .catch(
                () => {}
            );


    } else {

        showError(
            "Your browser does not support this stream."
        );

    }

}


/* =========================================================
   TV TAB
   ========================================================= */

tvTab.addEventListener(
    "click",
    () => {


        if (
            selectedType ===
            "tv"
        ) {

            return;

        }


        selectedType =
            "tv";


        tvTab.classList.add(
            "active"
        );


        radioTab.classList.remove(
            "active"
        );


        channelSearch.value =
            "";


        renderTVChannels();

    }
);


/* =========================================================
   RADIO TAB
   ========================================================= */

radioTab.addEventListener(
    "click",
    async () => {


        if (
            selectedType ===
            "radio"
        ) {

            return;

        }


        selectedType =
            "radio";


        radioTab.classList.add(
            "active"
        );


        tvTab.classList.remove(
            "active"
        );


        channelSearch.value =
            "";


        if (
            selectedCountry
        ) {

            await loadRadioForCountry(
                selectedCountry
            );

        }

    }
);


/* =========================================================
   COUNTRY SEARCH
   ========================================================= */

countrySearch.addEventListener(
    "input",
    () => {

        const query =

            countrySearch.value
                .toLowerCase()
                .trim();


        renderCountries(

            countries.filter(
                country =>

                    country
                        .toLowerCase()
                        .includes(
                            query
                        )
            )

        );

    }
);


/* =========================================================
   CHANNEL SEARCH
   ========================================================= */

channelSearch.addEventListener(
    "input",
    () => {


        if (
            selectedType ===
            "tv"
        ) {

            renderTVChannels();

        } else {

            renderRadioChannels();

        }

    }
);


/* =========================================================
   FULLSCREEN
   ========================================================= */

document
    .getElementById(
        "fullscreen"
    )

    .onclick = () => {


        const box =
            document.getElementById(
                "videoWrap"
            );


        if (
            document.fullscreenElement
        ) {

            document.exitFullscreen();

        } else if (
            box.requestFullscreen
        ) {

            box.requestFullscreen();

        }

    };


/* =========================================================
   ERROR
   ========================================================= */

function showError(
    text
) {

    empty.classList.remove(
        "hide"
    );


    message.textContent =
        text;

}


/* =========================================================
   SECURITY
   ========================================================= */

function escapeHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value || "";


    return element.innerHTML;

}


function escapeAttr(
    value
) {

    return String(
        value || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );

}


/* =========================================================
   START
   ========================================================= */

loadTVPlaylist();