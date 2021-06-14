import logo from "./logo.png";
import "./App.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import download from "downloadjs";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from "react-router-dom";
const api = axios.create({
  baseURL: "https://youtube-downloader-be.herokuapp.com",
});
let DetailsPane = function ({ info }) {
  let DescriptionPart = function ({ desc }) {
    return <div className="description">{desc}</div>;
  };
  let FormatDiv = function ({ format }) {
    return (
      <div className="col-12 row format">
        <div className="col-1">
          {format.hasVideo && format.hasAudio ? (
            <input
              type="checkbox"
              name="audio+video"
              value={format.itag}
            ></input>
          ) : format.hasVideo ? (
            <input type="checkbox" name="video" value={format.itag}></input>
          ) : (
            <input type="checkbox" name="audio" value={format.itag}></input>
          )}
        </div>
        <div className="col-3">
          {format.hasVideo && format.hasAudio
            ? "Audio+Video"
            : format.hasVideo
            ? "Video"
            : "Audio"}
        </div>
        <div className="col-4">{format.container}</div>
        <div className="col-4">
          {format.qualityLabel ? format.qualityLabel : format.audioQuality}
        </div>
      </div>
    );
  };
  let description = info.videoDetails.description
    ? info.videoDetails.description.split(/(?:\r\n|\r|\n)/g)
    : [""];
  return (
    <div>
      <div className="row bg-dark">
        <div className="col-12">
          <h2 className="title">
            <u>{info.videoDetails.title}</u>
          </h2>
        </div>

        <div className="col-2">
          <div className="col-12">
            <p className="paneHeaders">Duration</p>
            {info.videoDetails.lengthSeconds} seconds
          </div>
          <div className="col-12 mt-2">
            <p className="paneHeaders">Upload Date</p>
            {info.videoDetails.uploadDate}
          </div>
          <div className="col-12 mt-2">
            <p className="paneHeaders">Author</p>
            {info.videoDetails.author.name}
          </div>
        </div>
        <div className="col-3">
          <div className="col-12">
            <p className="paneHeaders">Channel Name</p>
            {info.videoDetails.ownerChannelName}
          </div>
          <div className="col-12 mt-2">
            <p className="paneHeaders">Description</p>
            {description.map((desc) => (
              <DescriptionPart desc={desc} />
            ))}
          </div>
        </div>
        <div className="col-1">
          <br />
          <div className="col-12">&#128525; - {info.videoDetails.likes}</div>
          <div className="col-12 mt-2">
            &#128520; - {info.videoDetails.dislikes}
          </div>
          <div className="col-12 mt-2">
            <p className="paneHeaders">Subsriber Count</p>
            {info.videoDetails.author.subscriber_count}
          </div>
        </div>
        <div className="col-6">
          <div className="row">
            <div className="col-12 row">
              <div className="col-4">
                <p className="paneHeaders">Format Type</p>
              </div>
              <div className="col-4">
                <p className="paneHeaders">File Extension</p>
              </div>
              <div className="col-4">
                <p className="paneHeaders">Quality</p>
              </div>
            </div>
            {info.formats.map((format) => (
              <FormatDiv format={format} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
let ThankYou = function () {
  return (
    <div>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Donwload your favourite youtube videos in the quality you feel suitable
        for you! If you have been redirected out of a session, the download
        should start soon...
      </p>
      <Link to="/download">Download Now</Link>
    </div>
  );
};
let Home = function () {
  return (
    <div>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Donwload your favourite youtube videos in the quality you feel suitable
        for you!
      </p>
      <Link to="/download">Download Now</Link>
    </div>
  );
};
let Download = function () {
  let history = useHistory();
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [isInfoReady, setIsInfoReady] = useState(false);
  const [url, setURL] = useState("");
  const [info, setInfo] = useState({});
  const [fetching, setFetching] = useState(false);
  let btnDownloadClick = function (e) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator

    if (!!pattern.test(url)) {
      e.target.disabled = true;
      setFetchingDetails(true);
      api
        .post("/getInfo", { url: url })
        .then((res) => {
          if (res.data.message) {
            alert("Enter valid URL" + res.data.message);
            return;
          }
          // alert(JSON.stringify(res.data));
          setInfo(res.data);
          setIsInfoReady(true);
        })
        .catch((err) => {
          alert(err);
          e.target.disabled = false;
          setFetchingDetails(false);
        });
    } else {
      alert("Enter valid url, pattern mismatch");
    }
  };
  let downloadFile = function (e) {
    let audiovideo = document.getElementsByName("audio+video")[0];

    let video = document.getElementsByName("video");
    let audio = document.getElementsByName("audio");

    let videoCheckedCount = 0,
      audioCheckedCount = 0;
    video.forEach((x) => {
      if (x.checked) videoCheckedCount++;
    });
    audio.forEach((x) => {
      if (x.checked) audioCheckedCount++;
    });
    if (
      audiovideo.checked &&
      (videoCheckedCount > 0 || audioCheckedCount > 0)
    ) {
      alert(
        "Please select only the Audio+Video format or select 1 video and 1 audio format only"
      );
      return;
    } else if (
      !audiovideo.checked &&
      (videoCheckedCount > 1 || audioCheckedCount > 1)
    ) {
      alert(
        "Please select only 1 video and 1 audio format to merge and download"
      );
      return;
    } else if (
      (videoCheckedCount == 0 || audioCheckedCount == 0) &&
      !audiovideo.checked
    ) {
      alert(
        "Please select at least 1 video and 1 audio format or select the audio+video format to continue..."
      );
      return;
    }
    e.target.disabled = true;
    if (audiovideo.checked) {
      setFetching(true);
      let tags = {
        itags: {
          commontag: audiovideo.value,
        },
        key: info.key,
      };

      api
        .post("/downloadWithInfo", tags)
        .then((res) => {
          // alert(JSON.stringify(res.data));
          if (res.data.url) {
            var handle;
            let flag = true;
            handle = setInterval(async () => {
              if (flag) {
                let resp = await api.get("/downloadWithURL/" + res.data.url, {
                  responseType: "blob",
                });

                if (!(resp.status == 500)) {
                  clearInterval(handle);
                  let split = res.data.url.split(".");
                  let extension = split[split.length - 1];
                  let xhr = download(
                    resp.data,
                    info.videoDetails.title + "." + extension
                  );
                  if (xhr === true) {
                    flag = false;
                    history.push("/thankyou");
                    return;
                  }
                  // xhr.onreadystatechange(() => {
                  //   if (xhr.readyState === XMLHttpRequest.DONE) {
                  //     flag = false;
                  //     history.push("/thankyou");
                  //   }
                  // });
                } else alert(resp.status);
              }
            }, 5000);
          }
        })
        .catch((err) => alert(err));
    } else {
      let videoTag, audioTag;
      for (let i = 0; i < video.length; i++)
        if (video[i].checked) {
          videoTag = video[i].value;
          break;
        }
      for (let i = 0; i < audio.length; i++)
        if (audio[i].checked) {
          audioTag = audio[i].value;
          break;
        }
      if (!videoTag || !audioTag) {
        alert("Please select at least 1 video format and 1 audio format");
        return;
      }
      setFetching(true);
      let tags = {
        itags: {
          movieitag: videoTag,
          audioitag: audioTag,
        },
        key: info.key,
      };
      alert(JSON.stringify(tags));
      api
        .post("/downloadWithInfo", tags)
        .then((res) => {
          // alert(JSON.stringify(res.data));
          if (res.data.url) {
            var handle;
            let flag = true;
            handle = setInterval(async () => {
              if (flag) {
                let resp = await api.get("/downloadWithURL/" + res.data.url, {
                  responseType: "blob",
                });

                if (!(resp.status == 500)) {
                  clearInterval(handle);
                  let split = res.data.url.split(".");
                  let extension = split[split.length - 1];

                  let xhr = await download(
                    resp.data,
                    info.videoDetails.title + "." + extension
                  );
                  if (xhr === true) {
                    flag = false;
                    history.push("/thankyou");
                    return;
                  }
                  // xhr.onreadystatechange(() => {
                  //   if (xhr.readyState === XMLHttpRequest.DONE) {
                  //     flag = false;
                  //     history.push("/thankyou");
                  //   }
                  // });
                } else alert(resp.status);
              }
            }, 5000);
          }
        })
        .catch((err) => alert(err));
    }
  };
  return (
    <div>
      {fetchingDetails ? (
        <h2>Please wait while details for your video are being fetched...</h2>
      ) : (
        ""
      )}
      <h4>Enter url to get video info:</h4>

      <input
        type="url"
        className="inputURL"
        placeholder="Your url goes here..."
        onChange={(e) => setURL(e.target.value)}
      ></input>
      <button onClick={btnDownloadClick} className="btnDownload">
        Get Video Info
      </button>
      {isInfoReady && info ? (
        <button onClick={downloadFile} className="btnConfirmDownload">
          Download File
        </button>
      ) : (
        ""
      )}
      <br />
      {fetching ? (
        <h2 className="Fetching">
          Please wait for a a moment, your video is being fetched...Actual wait
          time also depends on the size of the video. This can take anywhere
          from half a minute to 5 minutes :)
        </h2>
      ) : (
        ""
      )}
      <br />
      {isInfoReady && info ? <DetailsPane info={info} /> : ""}
    </div>
  );
};
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Route path="/download">
            <Download />
          </Route>
          <Route path="/thankyou">
            <ThankYou />
          </Route>
          <Route exact path="/">
            <Home />
          </Route>
        </Router>
      </header>
    </div>
  );
}

export default App;
