document.addEventListener('DOMContentLoaded', function () {
  const imageInput = document.getElementById('imageUpload');
  const pictureContainer = document.querySelector('.PictureCont');
  const sampleCountSpan = document.getElementById('sampleCount');
  const modulusInput = document.getElementById('modulusInput');

  // Function to create a canvas and return the context
  const createCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext('2d', { willReadFrequently: true });
  };

  // Function to downsample and update the sample count
  const downsampleImage = (img, modulus, ctx) => {
    const reducedWidth = Math.ceil(img.width / modulus);
    const reducedHeight = Math.ceil(img.height / modulus);

    // Create downsampled canvas
    const downsampledCanvas = document.createElement('canvas');
    const downsampledCtx = downsampledCanvas.getContext('2d', { willReadFrequently: true });

    downsampledCanvas.width = reducedWidth;
    downsampledCanvas.height = reducedHeight;

    // Sample the image using the modulus
    for (let y = 0; y < reducedHeight; y++) {
      for (let x = 0; x < reducedWidth; x++) {
        const pixelX = x * modulus;
        const pixelY = y * modulus;
        const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;

        // Set the pixel on the downsampled canvas
        downsampledCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
        downsampledCtx.fillRect(x, y, 1, 1);
      }
    }

    // Get downsampled image data URL
    return downsampledCanvas.toDataURL();
  };

  // Function to update the sample count
  const updateSampleCount = (img, ctx) => {
    const modulus = Math.max(1, parseInt(modulusInput.value, 10)); // Ensure modulus is at least 1
    const downsampledImage = downsampleImage(img, modulus, ctx);

    // Update the image display
    pictureContainer.innerHTML = `<img src="${downsampledImage}" alt="Downsampled Image" style="max-width: 100%; max-height: 100%; display: block;">`;

    // Update the sample count
    const totalSamples = Math.ceil(img.width / modulus) * Math.ceil(img.height / modulus);
    sampleCountSpan.textContent = totalSamples.toLocaleString(); // Add comma formatting
  };

  // Handle image file input change
  imageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      // Load the file and display it as an image
      reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
          // Create canvas to draw the image and get its context
          const ctx = createCanvas(img.width, img.height);

          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);

          // Update sample count when modulus changes
          modulusInput.addEventListener('input', function() {
            updateSampleCount(img, ctx);
          });

          // Initial calculation
          updateSampleCount(img, ctx);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });
});
