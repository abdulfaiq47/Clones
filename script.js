
let songs;
let currfolder;


let currentsong = new Audio()

console.log("now its time to this ")

function secondstominutesSecond(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60)
    const remainingseconds = Math.floor(seconds % 60)

    const formatedminutes = String(minutes).padStart(2, '0')
    const formatedseconds = String(remainingseconds).padStart(2, '0')

    return `${formatedminutes}:${formatedseconds}`



}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currfolder}/`)
    let responce = await a.text()

    let div = document.createElement("div")
    div.innerHTML = responce;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
        }

    }

    // play all the song is the playlist 

    let songul = document.querySelector(".song-list").getElementsByTagName("ul")[0]

    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> <div class="music-box">
                                    <div class="music-img"><img class="invert" src="image/song.svg" alt=""></div>
                                    <div class="music-info">
                                        <div class="music-name">${song.replaceAll("%20", " ").replaceAll(`http://127.0.0.1:5500/${currfolder}/`, "")}</div><br>

                                        <div class="music-artist"></div>
                                    </div>
                                    <div class="music-play"><img class="invert" src="image/play.svg" alt=""></div>
                                </div>
        
        
        
         </li>`;
        const searchInput = document.getElementById('searchInput');


        searchInput.oninput = () => {
            const query = searchInput.value.trim().toLowerCase();
            const listItems = document.querySelectorAll(".song-list li");

            listItems.forEach(li => {
                const name = li.querySelector(".music-name")?.textContent.toLowerCase() || '';
                li.style.display = name.includes(query) ? "" : "none";
            });
        };



    }

    // ✅ Add this inside getsongs, at the end
    const songItems = document.querySelectorAll(".song-list li");
    songItems.forEach((li, i) => {
        li.addEventListener("click", () => {
            playmusic(songs[i]);
            document.getElementById("playbarplaybtn").querySelector("img").src = "image/pause.svg";
            document.getElementById("playbarstopbtn").style.display = "inline-block";
        });
    });


}

const playmusic = (track, pause = false) => {
    const songUrl = track.startsWith("http") ? track : `${currfolder}/${track}`;
    currentTrackUrl = songUrl; // store it globally

    currentsong.src = songUrl;

    if (!pause) {
        currentsong.play().catch(err => console.error("Error playing:", err));
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track.split("/").pop());
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

};

async function displayalbum() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let responce = await a.text()
    let div = document.createElement("div")
    div.innerHTML = responce;

    let alla = div.getElementsByTagName("a");

    let array = Array.from(alla)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (
            e.href.includes("/songs/") &&
            !e.textContent.includes("Parent") &&
            !e.href.endsWith(".mp3") &&
            !e.href.endsWith(".json")
        ) {

            let cardcontainer = document.querySelector(".cardcontainer")
            let albumfolder = decodeURIComponent(e.href.split("/").filter(Boolean).pop());




            //    get metdata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${albumfolder}/info.json`)
            let responce = await a.json()

            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${albumfolder}" class="card ">
                            <img src="/songs/${albumfolder}/cover.jpg" alt="">

                            <div class="playbtn">
                                <svg width="64" height="34" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                                    <!-- Green background circle -->
                                    <circle cx="32" cy="32" r="32" fill="#4CAF50" />

                                    <!-- Black play triangle -->
                                    <path d="M24 18L44 32L24 46Z" fill="#000000" />
                                </svg>
                            </div>

                            <h3>${responce.tittle}</h3>
                            <p>${responce.description}</p>

                        </div>`


        }

    };
    // add a event thats play song depends on artist means only artist songs 
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async e => {
            const folder = e.currentTarget.dataset.folder;

            await getsongs(`songs/${folder}`);

            if (songs.length > 0) {
                playmusic(songs[0]);
                document.getElementById("playbarplaybtn").querySelector("img").src = "image/pause.svg";
                document.getElementById("playbarstopbtn").style.display = "inline-block";
            }

            // Add click events to each new list item
            const songItems = document.querySelectorAll(".song-list li");
            songItems.forEach((li, i) => {
                li.addEventListener("click", () => {
                    playmusic(songs[i]);
                    document.getElementById("playbarplaybtn").querySelector("img").src = "image/pause.svg";
                    document.getElementById("playbarstopbtn").style.display = "inline-block";
                });
            });
        });
    });

}
displayalbum();

async function main() {

    await getsongs("songs/cs")

    playmusic(songs[0], true)


    // display all the album on the right of the apge 

    //play song through list in left library
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((li, i) => {
        li.addEventListener("click", (event) => {
            playmusic(songs[i]); // use full URL
            playImg.src = "image/pause.svg";
            stop.style.display = "inline-block";
        });
    });

    // if play stop if not play 
    const play = document.getElementById("playbarplaybtn");
    const stop = document.getElementById("playbarstopbtn");
    const playImg = play.querySelector("img");



    play.addEventListener("click", () => {
        if (!currentsong.src && currentTrackUrl) {
            // src was cleared (after stop), reload it
            currentsong.src = currentTrackUrl;
        }

        if (currentTrackUrl === "") {
            console.warn("No song selected to play.");
            return;
        }

        if (currentsong.paused) {
            currentsong.play().then(() => {
                playImg.src = "image/pause.svg";
                stop.style.display = "inline-block";
            }).catch((err) => {

            });
        } else {
            currentsong.pause();
            playImg.src = "image/play.svg";
            stop.style.display = "none";
        }
    });



    // Listen for time updates 
    currentsong.addEventListener("timeupdate", e => {

        document.querySelector(".songtime").innerHTML = `${secondstominutesSecond(currentsong.currentTime)} / ${secondstominutesSecond(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })
    // Add an eventlistener to seek bar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    // Add hamburger clicable 
    document.querySelector("#hamburger").addEventListener("click", e => {

        document.querySelector(".left").style.left = "0"
        document.getElementById("hamburger").style.display = "none"
        document.getElementById("hamburgerclose").style.display = "block"


    })
    document.querySelector("#hamburgerclose").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-100%"
        document.getElementById("hamburger").style.display = "block"
        document.getElementById("hamburgerclose").style.display = "none"

    })
    // add a event Listener to play  previous btn 
    previousbtn.addEventListener("click", e => {

        let filename = decodeURI(currentsong.src.split("/").pop()); // decoded file name
        let index = songs.findIndex(song => decodeURI(song.split("/").pop()) === filename);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])

        }

    })
    // add a event Listener to play  next btn 
    nextbtn.addEventListener("click", e => {


        let filename = decodeURI(currentsong.src.split("/").pop()); // decoded file name
        let index = songs.findIndex(song => decodeURI(song.split("/").pop()) === filename);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])

        }

    })
    // When user changes slider, update volume
    document.querySelector(".range input").addEventListener("input", e => {
        const volumeValue = parseInt(e.target.value);
        currentsong.volume = volumeValue / 100;

        // Unmute if previously muted
        if (currentsong.muted && volumeValue > 0) {
            currentsong.muted = false;
            document.querySelector(".volume img").src = "image/volume.svg";
        }
    });

    // When user clicks icon, toggle mute
    document.querySelector(".volume img").addEventListener("click", e => {
        const volumeSlider = document.querySelector(".range input");
        const volumeIcon = e.target;

        if (currentsong.muted) {
            // Unmute and restore slider
            currentsong.muted = false;
            volumeSlider.value = currentsong.volume * 100;
            volumeIcon.src = "image/volume.svg";
        } else {
            // Mute and set slider to 0
            currentsong.muted = true;
            volumeSlider.value = 0;
            volumeIcon.src = "image/mute.svg";
        }
    });
    // add hamburger for mobiole 

    let hamform = document.getElementById("hamburgeroh")
    let hamf = hamform.querySelector("img")
    let overlay = document.querySelector(".overlay")
    let otherhead = document.querySelector(".other-head")
    let closeBtn =document.querySelector("#closeBtn")



    hamform.addEventListener("click", e => {
        if (overlay.style.display === "block") {
            overlay.style.display = "none"
            hamf.scr = "image/hamburger.svg"
            
            console.log('hy')
        }
        else {
            overlay.style.display = "block";
            otherhead.style.display = "none"


        }

    })
    closeBtn.addEventListener("click", e=>{
        overlay.style.display = "none";
        otherhead.style.display = "flex"

    })

    








}



// PLAYLIST TOGGLE
document.getElementById("toggleplaylist").addEventListener("click", () => {
    const list = document.querySelector(".song-list");
    const arrowup = document.getElementById("arrow-up");
    const arrowdown = document.getElementById("arrow-down");

    if (list.style.display === "none" || list.style.display === "") {
        list.style.display = "block";
        arrowdown.style.display = "block";
        arrowup.style.display = "none";
    } else {
        list.style.display = "none";
        arrowdown.style.display = "none";
        arrowup.style.display = "block";
    }






});



main();
