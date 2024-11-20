document.addEventListener('DOMContentLoaded', function () {
  const imageInput = document.getElementById('imageUpload');
  const pictureContainer = document.querySelector('.PictureCont');
  const sampleCountSpan = document.getElementById('sampleCount');
  const modulusInput = document.getElementById('modulusInput');

  imageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      // Load the file and display it as an image
      reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
          // Display the image in the PictureCont
          pictureContainer.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%; max-height: 100%; display: block;">`;

          // Calculate and display the total samples with modulus
          const updateSampleCount = () => {
            const modulus = Math.max(1, parseInt(modulusInput.value, 10)); // Ensure modulus is at least 1
            const reducedWidth = Math.ceil(img.width / modulus);
            const reducedHeight = Math.ceil(img.height / modulus);
            const totalSamples = reducedWidth * reducedHeight;
            sampleCountSpan.textContent = totalSamples.toLocaleString(); // Add comma formatting
          };

          // Update sample count when modulus changes
          modulusInput.addEventListener('input', updateSampleCount);

          // Initial calculation
          updateSampleCount();
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });
});
