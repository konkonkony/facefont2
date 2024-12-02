const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const detectionsDiv = document.getElementById('detections');
const sentenceElement = document.getElementById('Sentence');

// CDN経由でモデルをロード
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
  faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model')
]).then(startVideo);

// カメラを起動
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
    .then(function(stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function(err) {
      console.error('カメラの起動に失敗しました: ', err);
    });
}

let isProcessing = false;

video.addEventListener('loadedmetadata', () => {
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  
  // Canvasのサイズをビデオに合わせる
  const resizedDetections = faceapi.resizeResults(detections, {
    width: video.videoWidth,
    height: video.videoHeight
  });
    faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    if (!isProcessing) {
      isProcessing = true;
      
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);


     const context = canvas.getContext('2d');
     context.clearRect(0, 0, canvas.width, canvas.height);

      // 顔のボックスと感情を描画
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

      resizedDetections.forEach(detection => {
        const emotions = detection.expressions;
        const maxEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
        
        // 表情のスコアと年齢・性別を表示
        detectionsDiv.innerHTML = `表情: ${maxEmotion}, 年齢: ${Math.round(detection.age)}, 性別: ${detection.gender}`;
        
        // "sad"な表情があればフォントサイズを増加
        if (maxEmotion === 'sad' ) {
          increaseFontSize();
        }
        else if(maxEmotion == 'surprised'){
          StopFontSize();
        }
      });

      isProcessing = false;
    }
  }, 1000); // 1秒毎に処理
});

// フォントサイズを増加させる関数
function increaseFontSize() {
  const currentFontSize = parseFloat(window.getComputedStyle(sentenceElement).fontSize);
  const newFontSize = currentFontSize + 0.24;
  sentenceElement.style.fontSize = newFontSize + 'px';
}

function StopFontSize(){
 
 
 
 }


