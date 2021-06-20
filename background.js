const URL = "https://teachablemachine.withgoogle.com/models/FO_OP-TA1/";
let model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

function muteAudio(probability) {
    if (probability >= 1) {
        const audioButton = document.querySelectorAll(".VfPpkd-Bz112c-LgbsSe")[0];
        if (audioButton.classList.contains("HNeRed")) {
            audioButton.click();
        }
    }
}

function turnVideoOff(probability) {
    if (probability >= 1) {
        const videoButton = document.querySelectorAll(".VfPpkd-Bz112c-LgbsSe")[1];
        if (videoButton.classList.contains("HNeRed")) {
            videoButton.click();
        }
    }
}

async function predict() {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);
    var predictionsArray = prediction.map(function (o, i) {
        return { probability: o.probability.toFixed(2), event: o.className }
    })

    var i;
    var min = predictionsArray[0].probability
    var max = predictionsArray[0].probability
    var event = predictionsArray[0].className;
    var value;
    for (i = 1; i < predictionsArray.length; i++) {
        value = predictionsArray[i].probability
        if (value < min) min = value;
        if (value > max) max = value;
    }
    const index = predictionsArray.findIndex((list) => {
        return list.probability == max;
    })
    event = predictionsArray[index].event;

    console.log(event, max);
    if (event === "Mute") {
        muteAudio(max);
    } else if (event === "Video") {
        turnVideoOff(max);
    }
}


const webcamContainer = document.createElement("div");
webcamContainer.id = "webcam-container";
// webcamContainer.style.display = "none"; // Don't display the webcam on the site
document.body.appendChild(webcamContainer);

init();