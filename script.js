document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const imageOptionsContainer = document.getElementById('image-options');
    const imageElements = imageOptionsContainer.querySelectorAll('.quiz-image');
    const feedbackDisplay = document.getElementById('feedback');
    const nextButton = document.getElementById('next-button');
    const scoreDisplay = document.getElementById('score-display');
    const newGameButton = document.getElementById('new-game-button');

    // New DOM elements for category selection
    const categorySelectionContainer = document.getElementById('category-selection');
    const gameContainer = document.getElementById('game-container');
    const categoryBodypartsButton = document.getElementById('category-bodyparts');
    const categoryColorsButton = document.getElementById('category-colors');

    // --- Configuration ---
    const imageDirectory = 'images/';
    const bodyPartsWords = [
        'eyebrow.jpg',
        'eye.jpg',
        'nose.jpg',
        'cheek.jpg',
        'mouth.jpg',
        'lips.jpg',
        'ears.jpg',
        'neck.jpg',
        'shoulders.jpg',
    ];
    const colorWords = [
        'Green', 'Grey', 'Brown', 'Red', 'Pink', 'White', 'Black', 'Blue', 'Yellow', 'Orange', 'Purple'
    ];
    // --- End Configuration ---

    let words = []; // This will be set based on category selection
    let currentCategory = ''; // To store the selected category

    let currentWord = '';
    let currentFilename = ''; // Used for body parts, can be same as currentWord for colors
    let availableWords = [];
    let score = 0;
    let totalQuestions = 0;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function resetGame() {
        score = 0;
        totalQuestions = 0;
        words = [];
        availableWords = [];
        currentCategory = '';

        feedbackDisplay.textContent = '';
        nextButton.style.display = 'none';
        newGameButton.style.display = 'none';

        categorySelectionContainer.style.display = 'flex';
        gameContainer.style.display = 'none';

        imageElements.forEach(img => {
            img.style.backgroundColor = '';
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            img.alt = 'Option';
            img.style.display = 'inline-block';
            img.classList.remove('correct', 'incorrect');
            img.style.opacity = 1;
        });
        imageOptionsContainer.style.display = 'flex';
        scoreDisplay.style.display = 'block';
    }

    function startGame(category) {
        currentCategory = category;
        if (category === 'bodyparts') {
            words = [...bodyPartsWords];
        } else if (category === 'colors') {
            words = [...colorWords];
        }

        if (words.length < 3) {
            const existingError = document.getElementById('category-error');
            if (existingError) existingError.remove();
            const errorMsgElement = document.createElement('p');
            errorMsgElement.id = 'category-error';
            errorMsgElement.style.color = 'red';
            errorMsgElement.style.textAlign = 'center';
            errorMsgElement.textContent = `Error: Not enough items for the '${category}' category. At least 3 are needed.`;
            categorySelectionContainer.appendChild(errorMsgElement);
            setTimeout(() => {
                const errorMsg = document.getElementById('category-error');
                if (errorMsg) errorMsg.remove();
            }, 5000);
            return;
        }

        categorySelectionContainer.style.display = 'none';
        gameContainer.style.display = 'block';

        score = 0;
        totalQuestions = 0;
        availableWords = [...words];
        shuffleArray(availableWords);

        scoreDisplay.textContent = `Score: ${score}`;
        newGameButton.style.display = 'none';
        startNewRound();
    }

    async function startNewRound() {
        if (availableWords.length === 0) {
            let endMessage = '';
            const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
            if (percentage < 40) {
                endMessage = 'Keep practicing!';
            } else if (percentage < 70) {
                endMessage = 'You will learn these!';
            } else if (percentage < 99) {
                endMessage = 'Almost perfect, keep practicing!';
            } else {
                endMessage = 'Perfect!';
            }
            wordDisplay.textContent = endMessage;

            imageOptionsContainer.style.display = 'none';
            feedbackDisplay.textContent = `Final Score: ${score} / ${totalQuestions}`;
            nextButton.style.display = 'none';
            scoreDisplay.style.display = 'none';
            newGameButton.style.display = 'inline-block';
            return;
        }

        feedbackDisplay.textContent = '';
        nextButton.style.display = 'none';

        imageElements.forEach(img => {
            img.classList.remove('correct', 'incorrect');
            img.style.opacity = 1;
            img.onclick = handleImageClick;
            img.style.backgroundColor = '';
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            img.alt = 'Option';
            img.style.display = 'inline-block';
        });

        const selectedItem = availableWords.pop();
        totalQuestions++;

        let incorrectOptionsSource = [];
        if (currentCategory === 'bodyparts') {
            currentFilename = selectedItem;
            currentWord = currentFilename.substring(0, currentFilename.lastIndexOf('.'));
            incorrectOptionsSource = bodyPartsWords.filter(w => w !== currentFilename);
        } else { // colors
            currentWord = selectedItem;
            currentFilename = selectedItem;
            incorrectOptionsSource = colorWords.filter(c => c !== currentWord);
        }

        wordDisplay.textContent = currentWord;
        scoreDisplay.textContent = `Score: ${score}`;

        shuffleArray(incorrectOptionsSource);
        const incorrectChoices = incorrectOptionsSource.slice(0, 2);

        if (incorrectChoices.length < 2) {
            if (words.length >= 3 && (availableWords.length + incorrectChoices.length + 1) >= 3) {
                availableWords.push(selectedItem);
                shuffleArray(availableWords);
                totalQuestions--; // Decrement as this round didn't fully start
                startNewRound();
                return;
            }
            wordDisplay.textContent = 'Game Over! (Not enough unique options to continue)';
            imageOptionsContainer.style.display = 'none';
            feedbackDisplay.textContent = `Final Score: ${score} / ${totalQuestions - 1}`;
            nextButton.style.display = 'none';
            newGameButton.style.display = 'inline-block';
            return;
        }

        const options = [selectedItem, ...incorrectChoices];
        shuffleArray(options);

        imageElements.forEach((img, index) => {
            if (options[index]) {
                const optionValue = options[index];
                if (currentCategory === 'bodyparts') {
                    img.src = `${imageDirectory}${optionValue}`;
                    const filenameForData = optionValue.includes('/') ? optionValue.substring(optionValue.lastIndexOf('/') + 1) : optionValue;
                    img.dataset.word = filenameForData.substring(0, filenameForData.lastIndexOf('.'));
                    img.alt = img.dataset.word;
                } else { // colors
                    let colorToDisplay = optionValue.toLowerCase();
                    if (optionValue.toLowerCase() === 'brown') {
                        colorToDisplay = '#8B4513'; // A common shade of brown (SaddleBrown)
                    }
                    img.style.backgroundColor = colorToDisplay;
                    img.dataset.word = optionValue;
                    img.alt = optionValue;
                }
                img.style.display = 'inline-block';
            } else {
                img.style.display = 'none';
            }
        });
    }

    function handleImageClick(event) {
        const selectedImage = event.target;
        const selectedWordValue = selectedImage.dataset.word;

        imageElements.forEach(img => img.onclick = null);

        if (selectedWordValue.toLowerCase() === currentWord.toLowerCase()) {
            feedbackDisplay.textContent = 'Correct!';
            feedbackDisplay.style.color = 'green';
            selectedImage.classList.add('correct');
            score++;
            imageElements.forEach(img => {
                if (img !== selectedImage) {
                    img.style.opacity = 0.5;
                }
            });
        } else {
            feedbackDisplay.textContent = `Incorrect.`;
            feedbackDisplay.style.color = 'red';
            selectedImage.classList.add('incorrect');
            imageElements.forEach(img => {
                if (img.dataset.word.toLowerCase() === currentWord.toLowerCase()) {
                    img.classList.add('correct');
                }
            });
        }

        scoreDisplay.textContent = `Score: ${score}`;
        nextButton.style.display = 'inline-block';
    }

    function initializeGame() {
        categoryBodypartsButton.addEventListener('click', () => startGame('bodyparts'));
        categoryColorsButton.addEventListener('click', () => startGame('colors'));

        nextButton.addEventListener('click', startNewRound);
        newGameButton.addEventListener('click', resetGame);

        resetGame();
    }

    initializeGame();
});
