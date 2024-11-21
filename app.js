document.addEventListener('DOMContentLoaded', function () {
  const imageInput = document.getElementById('imageUpload');
  const sampleCountSpan = document.getElementById('sampleCount');
  const modulusInput = document.getElementById('modulusInput');
  const progressBar = document.getElementById('progressBar');
  const hexOutputDiv = document.querySelector('.HexCont');
  const pictureContainer = document.querySelector('.PictureCont');
  const copiedHexSpan = document.getElementById('copiedHex');
  const ejectButton = document.getElementById('ejectButton');
  const downloadJsonButton = document.getElementById('downloadJsonButton');
  const toggleViewCheckbox = document.getElementById('toggleView');

  let imageDataArray = [];
  let loadedImage = null;
  let lastSelectedDiv = null;
  let uniqueColors = [];
  let isGridView = false;

  const loadImageData = (img) => {
    // Reset outputs
    progressBar.value = 0;
    hexOutputDiv.innerHTML = '';
    imageDataArray = [];
    sampleCountSpan.textContent = '0';
    copiedHexSpan.textContent = 'None';
    if (lastSelectedDiv) {
      lastSelectedDiv.style.border = 'none';
      lastSelectedDiv = null;
    }

    let modulusValue = parseInt(modulusInput.value, 10);
    const modulus = Math.max(1, modulusValue);
    console.log(`Processing image with modulus: ${modulus}`);

    // Create a canvas to get image data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0);

    const width = canvas.width;
    const height = canvas.height;

    // Safety check for modulus
    const maxPixels = 500000; // Set a maximum number of pixels to process
    const imageArea = width * height;
    const estimatedSamples = imageArea / (modulus * modulus);

    if (estimatedSamples > maxPixels) {
      alert('Modulus value too low for this image size. Adjusting to prevent performance issues.');
      const adjustedModulus = Math.ceil(Math.sqrt(imageArea / maxPixels));
      modulusInput.value = adjustedModulus;
      modulusValue = adjustedModulus;
    }

    const totalPixels = Math.floor(width / modulus) * Math.floor(height / modulus);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let y = 0;
    let processedPixels = 0;
    let lastProcessedPercentage = 0;

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
    uniqueColors = [...new Set(imageDataArray)];

    if (isGridView) {
      document.body.classList.add('grid-view');
    } else {
      document.body.classList.remove('grid-view');
    }

    uniqueColors.forEach(hex => {
      const colorDiv = document.createElement('div');
      colorDiv.textContent = hex;
      colorDiv.style.backgroundColor = hex;
      colorDiv.style.color = '#fff';
      colorDiv.style.padding = '5px';
      colorDiv.style.marginBottom = '2px';
      colorDiv.style.cursor = 'pointer';
      colorDiv.style.textAlign = 'center';

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

  function highlightSelection(div) {
    if (lastSelectedDiv) {
      lastSelectedDiv.style.border = 'none';
    }
    div.style.border = '3px solid #443E35';
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

          // Clear any existing image
          pictureContainer.innerHTML = '';

          // Display the image
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          pictureContainer.appendChild(img);

          // Store loaded image
          loadedImage = img;

          loadImageData(img);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });

  // Redraw when modulus changes
  modulusInput.addEventListener('change', function () {
    if (loadedImage) {
      loadImageData(loadedImage);
    }
  });

  // Eject button functionality
  ejectButton.addEventListener('click', function () {
    // Reset variables
    loadedImage = null;
    imageDataArray = [];

    // Clear outputs
    pictureContainer.innerHTML = '';
    hexOutputDiv.innerHTML = 'Hex Output';
    sampleCountSpan.textContent = '0';
    copiedHexSpan.textContent = 'None';
    progressBar.value = 0;

    if (lastSelectedDiv) {
      lastSelectedDiv.style.border = 'none';
      lastSelectedDiv = null;
    }

    // Reset file input
    imageInput.value = '';
  });

  // Download JSON functionality
  downloadJsonButton.addEventListener('click', function () {
    if (uniqueColors.length === 0) {
      alert('No color data to download. Please load an image first.');
      return;
    }

    if (confirm('Do you want to download the color data as a JSON file?')) {
      // Prepare JSON data
      const data = {
        colors: uniqueColors
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a link and click it to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'colors.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });

  // Toggle view functionality
  toggleViewCheckbox.addEventListener('change', function () {
    isGridView = toggleViewCheckbox.checked;
    if (uniqueColors.length > 0) {
      displayHexColors();
    }
  });
});
