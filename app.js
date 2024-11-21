document.addEventListener('DOMContentLoaded', function () {
  const imageInput = document.getElementById('imageUpload');
  const sampleCountSpan = document.getElementById('sampleCount');
  const modulusInput = document.getElementById('modulusInput');
  const progressBar = document.getElementById('progressBar');
  const hexOutputDiv = document.querySelector('.HexCont');
  const pictureContainer = document.querySelector('.PictureCont');
  const copiedHexSpan = document.getElementById('copiedHex');

  let imageDataArray = [];

  const loadImageData = (canvas) => {
    const modulus = Math.max(1, parseInt(modulusInput.value, 10));
    console.log(`Processing image with modulus: ${modulus}`);

    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const totalPixels = Math.floor(width / modulus) * Math.floor(height / modulus);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let y = 0;
    let processedPixels = 0;
    let lastProcessedPercentage = 0;

    imageDataArray = [];

    function processChunk() {
      const chunkSize = 100;
      let endY = Math.min(y + chunkSize * modulus, height);

      for (; y < endY; y += modulus) {
        for (let x = 0; x < width; x += modulus) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];

          const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
          imageDataArray.push(hex);

          processedPixels++;
        }
      }

      const progress = Math.floor((processedPixels / totalPixels) * 100);
      if (progress - lastProcessedPercentage >= 1) {
        lastProcessedPercentage = progress;
        progressBar.value = progress;
      }

      if (y < height) {
        setTimeout(processChunk, 0);
      } else {
        const sampleCount = imageDataArray.length;
        sampleCountSpan.textContent = sampleCount.toLocaleString();
        console.log(`Total samples processed: ${sampleCount}`);

        displayHexColors();
      }
    }

    processChunk();
  };

  function displayHexColors() {
    hexOutputDiv.innerHTML = '';

    // Remove duplicates to get unique colors
    const uniqueColors = [...new Set(imageDataArray)];

    uniqueColors.forEach(hex => {
      const colorDiv = document.createElement('div');
      colorDiv.textContent = hex;
      colorDiv.style.backgroundColor = hex;
      colorDiv.style.color = '#fff';
      colorDiv.style.padding = '5px';
      colorDiv.style.marginBottom = '2px';
      colorDiv.style.cursor = 'pointer';

      // Add click event to copy hex code
      colorDiv.addEventListener('click', function () {
        copyToClipboard(hex);
        highlightSelection(colorDiv);
      });

      hexOutputDiv.appendChild(colorDiv);
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
      console.log(`Copied ${text} to clipboard.`);
      copiedHexSpan.textContent = text;
    }, function (err) {
      console.error('Could not copy text: ', err);
    });
  }

  let lastSelectedDiv = null;
  function highlightSelection(div) {
    if (lastSelectedDiv) {
      lastSelectedDiv.style.border = 'none';
    }
    div.style.border = '2px solid gray';
    lastSelectedDiv = div;
  }

  imageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
          console.log('Image loaded successfully.');

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          // Display the image in the PictureCont div
          pictureContainer.innerHTML = '';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          pictureContainer.appendChild(img);

          loadImageData(canvas);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });
});
