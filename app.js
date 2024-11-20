document.addEventListener('DOMContentLoaded', function () {
  const imageInput = document.getElementById('imageUpload');
  const sampleCountSpan = document.getElementById('sampleCount');
  const modulusInput = document.getElementById('modulusInput');
  const progressBar = document.getElementById('progressBar');
  
  // To hold the image's pixel data as an array
  let imageDataArray = [];

  // Function to load the image and process the pixels
  const loadImageData = (img) => {
    const modulus = Math.max(1, parseInt(modulusInput.value, 10)); // Ensure modulus is at least 1
    console.log(`Processing image with modulus: ${modulus}`);

    const width = img.width;
    const height = img.height;
    const totalPixels = width * height;
    let processedPixels = 0;
    let lastProcessedPercentage = 0;

    // Loop over pixels with modulus applied
    for (let y = 0; y < height; y += modulus) {
      for (let x = 0; x < width; x += modulus) {
        const pixel = img.getContext('2d').getImageData(x, y, 1, 1).data;
        imageDataArray.push(pixel);

        processedPixels++;
        const progress = Math.floor((processedPixels / totalPixels) * 100);
        
        // Update progress bar every 3% change
        if (progress - lastProcessedPercentage >= 3) {
          lastProcessedPercentage = progress;
          console.log(`Progress: ${progress}%`);
          progressBar.value = progress;
        }
      }
    }

    // Update the sample count
    const sampleCount = imageDataArray.length;
    sampleCountSpan.textContent = sampleCount.toLocaleString();
    console.log(`Total samples processed: ${sampleCount}`);
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
          console.log('Image loaded successfully.');

          // Create an invisible canvas to get the pixel data
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the image on the canvas to extract pixel data
          ctx.drawImage(img, 0, 0);

          // Process image data (without displaying the image)
          loadImageData(ctx);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });
});
