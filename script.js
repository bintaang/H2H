// List of GIFs and affirmations
const gifList = [
  {
    src: "GIFS/Breathe Mtv GIF by INTO ACTION.gif",
    text: "Take a moment, take a breath. You’re doing okay 💖",
  },
  {
    src: "GIFS/Good Morning Thank You GIF by Hello All.gif",
    text: "Good morning, beautiful. Thank you for being you 🌞",
  },
  {
    src: "GIFS/I Love You Hearts GIF by Running Organgs.gif",
    text: "I love you with all of me 💘",
  },
  {
    src: "GIFS/Love Yourself GIF by Chippy the Dog.gif",
    text: "Don’t forget to love yourself today 🪞",
  },
  {
    src: "GIFS/Mtv Love GIF by INTO ACTION.gif",
    text: "Sending you a silent hug 🤍",
  },
  {
    src: "GIFS/sassy dance GIF.gif",
    text: "Look at you go! You’re amazing 💃",
  },
  {
    src: "GIFS/Stay Strong I Love You GIF by Pudgy Penguins.gif",
    text: "Stay strong, you’ve got this 🫂",
  },
  {
    src: "GIFS/You Are Not Alone Love GIF by Chippy the Dog.gif",
    text: "Even when I’m quiet, I’m always with you 💭",
  },
];

// DOM elements
const gifImage = document.getElementById("gif-image");
const affirmationText = document.getElementById("affirmation-text");
const button = document.getElementById("new-gif-button");

// Event: Randomize on click
button.addEventListener("click", () => {
  const random = gifList[Math.floor(Math.random() * gifList.length)];
  gifImage.src = random.src;
  affirmationText.textContent = random.text;
});
