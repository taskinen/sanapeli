document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const imageOptionsContainer = document.getElementById('image-options');
    const imageElements = imageOptionsContainer.querySelectorAll('.quiz-image');
    const feedbackDisplay = document.getElementById('feedback');
    const nextButton = document.getElementById('next-button');
    const scoreDisplay = document.getElementById('score-display'); // Get score display element

    // --- Configuration ---
    const imageDirectory = 'images/'; // IMPORTANT: Create an 'images' folder next to index.html
    // Add your image filenames here (including extension). These are also used for word matching (without extension).
    // Example: If you have 'cat.jpg', 'dog.png', 'bird.gif', add 'cat.jpg', 'dog.png', 'bird.gif'.
    const words = [
        // Add image filenames (including extension) here
        // e.g., 'apple.jpg', 'banana.png', 'car.gif'
        'eyebrow.jpg', // Assuming jpg, adjust if needed
        'eye.jpg',
        'nose.jpg',
        'cheek.jpg',
        'mouth.jpg',
        'lips.jpg',
        'ears.jpg',
        'neck.jpg',
        'shoulders.jpg',
    ];
    // --- End Configuration ---

    let currentWord = ''; // Will store the word part (without extension)
    let currentFilename = ''; // Will store the full filename
    let availableWords = [...words]; // Now stores filenames
    let score = 0; // Initialize score
    let totalQuestions = 0; // Initialize total questions asked

    // Function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Function to start a new round
    async function startNewRound() {
        if (availableWords.length === 0) {
            wordDisplay.textContent = 'Good job!'; // Change game over message
            imageOptionsContainer.style.display = 'none';
            feedbackDisplay.textContent = `Final Score: ${score} / ${totalQuestions}`; // Show final score
            nextButton.style.display = 'none';
            scoreDisplay.style.display = 'none'; // Hide round score display
            return;
        }

        feedbackDisplay.textContent = '';
        nextButton.style.display = 'none';
        imageElements.forEach(img => {
            img.classList.remove('correct', 'incorrect');
            img.style.opacity = 1;
            img.onclick = handleImageClick; // Re-enable clicking
        });

        // Select a random word (filename)
        const wordIndex = Math.floor(Math.random() * availableWords.length);
        currentFilename = availableWords[wordIndex];
        currentWord = currentFilename.substring(0, currentFilename.lastIndexOf('.')); // Extract word part
        availableWords.splice(wordIndex, 1); // Remove filename from available list
        totalQuestions++; // Increment total questions asked

        wordDisplay.textContent = currentWord; // Display the word part
        scoreDisplay.textContent = `Score: ${score}`; // Update score display

        // Construct the correct image path directly
        const correctImagePath = `${imageDirectory}${currentFilename}`;

        // Get two other random words (filenames) for incorrect options
        const incorrectImagePaths = [];
        const potentialIncorrectFilenames = words.filter(w => w !== currentFilename);
        shuffleArray(potentialIncorrectFilenames);
        while (incorrectImagePaths.length < 2 && potentialIncorrectFilenames.length > 0) {
            const potentialFilename = potentialIncorrectFilenames.pop();
            incorrectImagePaths.push(`${imageDirectory}${potentialFilename}`);
        }

        // Check if we have enough incorrect options
        if (incorrectImagePaths.length < 2) {
            if (availableWords.length > 0) {
                startNewRound();
                return;
            } else {
                wordDisplay.textContent = 'Game Over! (Not enough images)';
                imageOptionsContainer.style.display = 'none';
                feedbackDisplay.textContent = '';
                nextButton.style.display = 'none';
                return;
            }
        }

        // Combine and shuffle options (paths)
        const options = [correctImagePath, ...incorrectImagePaths];
        shuffleArray(options);

        // Display images
        imageElements.forEach((img, index) => {
            if (options[index]) {
                img.src = options[index];
                // Extract word from filename for the data attribute
                const filename = options[index].substring(imageDirectory.length);
                img.dataset.word = filename.substring(0, filename.lastIndexOf('.'));
                img.style.display = 'inline-block';
            } else {
                img.style.display = 'none'; // Hide unused img elements if fewer than 3 options
            }
        });
    }

    // Handle image click
    function handleImageClick(event) {
        const selectedImage = event.target;
        const selectedWord = selectedImage.dataset.word;

        // Disable further clicks on images for this round
        imageElements.forEach(img => img.onclick = null);

        if (selectedWord === currentWord) {
            feedbackDisplay.textContent = 'Correct!';
            feedbackDisplay.style.color = 'green';
            selectedImage.classList.add('correct');
            score++; // Increment score
            // Optionally fade out incorrect images
            imageElements.forEach(img => {
                if (img !== selectedImage) {
                    img.style.opacity = 0.5;
                }
            });
        } else {
            feedbackDisplay.textContent = `Incorrect.`;
            feedbackDisplay.style.color = 'red';
            selectedImage.classList.add('incorrect');
            // Highlight the correct image
            imageElements.forEach(img => {
                if (img.dataset.word === currentWord) {
                    img.classList.add('correct');
                }
            });
        }

        scoreDisplay.textContent = `Score: ${score}`; // Update score display after answer
        nextButton.style.display = 'inline-block';
    }

    // Initial setup
    async function initializeGame() {
        if (words.length < 3) {
            wordDisplay.textContent = 'Error';
            feedbackDisplay.textContent = 'Please add at least 3 words/images to the `words` array in script.js.';
            imageOptionsContainer.style.display = 'none';
            console.error('Need at least 3 words/images defined in the script.');
            return;
        }

        scoreDisplay.textContent = `Score: ${score}`; // Initial score display
        nextButton.addEventListener('click', startNewRound);
        startNewRound();
    }

    initializeGame();
});
