

let peerConnection = new RTCPeerConnection()
let localStream;
let remoteStream;

var socket = io('http://localhost:3001');
socket.on('connect', () => {
  console.log(socket.id);
//   socket.emit('my other event', { my: 'data' });


});

socket.on('room-connection', (offer) => {
    console.log(offer)
    createAnswer(offer)
})

socket.on('room-connection-answer', (answer) => {
    // console.log('answer', JSON.stringify(answer))
    document.getElementById('answer-sdp').value = JSON.stringify(answer)
    addAnswer(answer)
})

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
        });
    };

    createOffer()

}

let createOffer = async () => {


    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if(event.candidate){
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription)
            socket.emit('room-connection', peerConnection.localDescription)
            
        }
    };
    
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
}

let createAnswer = async (offer) => {

    // let offer = JSON.parse(document.getElementById('offer-sdp').value)

    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if(event.candidate){
            console.log('Adding answer candidate...:', event.candidate)
            document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription)
            socket.emit('room-connection-answer', peerConnection.localDescription)
            
        }
    };

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer); 
    // console.log("answer")
}

let addAnswer = async (answer) => {
    // console.log('Add answer triggerd', JSON.stringify(answer))
    // let answer = JSON.parse(document.getElementById('answer-sdp').value)
    // answer = JSON.parse(answer)
    console.log('answer:', answer)
    if (!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer);
    }
}

init()

document.getElementById('create-offer').addEventListener('click', createOffer)
document.getElementById('create-answer').addEventListener('click', createAnswer)
document.getElementById('add-answer').addEventListener('click', addAnswer)


