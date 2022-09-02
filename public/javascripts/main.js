let peerConnections = []
let peerConnection = new RTCPeerConnection();
peerConnections.push(peerConnection)

let localStream;
let remoteStream;

var socket = io("https://prodaxcameraclient.herokuapp.com/");

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let room = params.room;

socket.on("connect", () => {
    console.log(socket.id);

    console.log(room);
    socket.emit("join-room", room);
});


socket.on("room-connection", (data) => {
    
    // if (peerConnections[peerConnections.length - 1].currentRemoteDescription != null){
    //     console.log(peerConnections[peerConnections.length - 1].currentRemoteDescription,"ssssssssssssss")
    //     let newPeer = new RTCPeerConnection();
    //     peerConnections[peerConnections.length] = newPeer;

    //     peerConnections[peerConnections.length -1].ontrack = (event) => {
    //         event.streams[0].getTracks().forEach((track) => {
    //             const newDiv = document.createElement("video");
    //             newDiv.setAttribute("autoplay", "true");
    //             newDiv.setAttribute("playsinline", "true");
    //             newDiv.setAttribute("id", `user-${screenCount}`);
    
    //             const vids = document.getElementById("videos");
    //             vids.appendChild(newDiv);
    
    //             let rs = new MediaStream();
    
    //             newDiv.srcObject = rs;
    
    //             screenCount++;
    
    //             rs.addTrack(track);
    //         });
    //     };

    // }

    createAnswer(data);

});

socket.on("room-connection-answer", (answer) => {
    // console.log('answer', JSON.stringify(answer))
    document.getElementById("answer-sdp").value = JSON.stringify(answer);
    addAnswer(answer);
});

let screenCount = 2;

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });
    document.getElementById("user-1").srcObject = localStream;
    // document.getElementById('user-2').srcObject = remoteStream
    // const newDiv = "<video class='video-player' id='user-2' autoplay playsinline></video>"
    // newDiv.id = 'user-2'

    localStream.getTracks().forEach((track) => {
        peerConnections[peerConnections.length -1].addTrack(track, localStream);
    });

    peerConnections[0].ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            const newDiv = document.createElement("video");
            newDiv.setAttribute("autoplay", "true");
            newDiv.setAttribute("playsinline", "true");
            newDiv.setAttribute("id", `user-${screenCount}`);

            const vids = document.getElementById("videos");
            vids.appendChild(newDiv);

            let rs = new MediaStream();

            newDiv.srcObject = rs;

            screenCount++;

            rs.addTrack(track);
        });
    };

    createOffer();
};

let createOffer = async () => {
    peerConnections[peerConnections.length -1].onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if (event.candidate) {
            document.getElementById("offer-sdp").value = JSON.stringify(
                peerConnections[peerConnections.length -1].localDescription
            );
            socket.emit("room-connection", {
                offer: peerConnections[peerConnections.length -1].localDescription,
                room,
                who: socket.id
            });
        }
    };

    const offer = await peerConnections[peerConnections.length -1].createOffer();
    await peerConnections[peerConnections.length -1].setLocalDescription(offer);
};

let createAnswer = async (data) => {
    // let offer = JSON.parse(document.getElementById('offer-sdp').value)

    peerConnections[peerConnections.length -1].onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if (event.candidate) {
            // console.log('Adding answer candidate...:', event.candidate)
            document.getElementById("answer-sdp").value = JSON.stringify(
                peerConnections[peerConnections.length -1].localDescription
            );
            socket.emit("room-connection-answer", {
                answer: peerConnections[peerConnections.length -1].localDescription,
                room,
                who: data.who
            });
        }
    };

    await peerConnections[peerConnections.length -1].setRemoteDescription(data.offer);

    let answer = await peerConnections[peerConnections.length -1].createAnswer(data.offer);
    await peerConnections[peerConnections.length -1].setLocalDescription(answer);
    // console.log("answer")
};

let addAnswer = async (answer) => {
    // console.log('Add answer triggerd', JSON.stringify(answer))
    // let answer = JSON.parse(document.getElementById('answer-sdp').value)
    // answer = JSON.parse(answer)
    // console.log('answer:', answer)
    if (!peerConnections[peerConnections.length -1].currentRemoteDescription) {
        peerConnections[peerConnections.length -1].setRemoteDescription(answer);
    }
};

init();

document.getElementById("create-offer").addEventListener("click", createOffer);
document
    .getElementById("create-answer")
    .addEventListener("click", createAnswer);
document.getElementById("add-answer").addEventListener("click", addAnswer);
