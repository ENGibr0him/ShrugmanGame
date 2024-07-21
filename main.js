import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import ShrugmanGame from "./game.js";
import categories from "./categories.js";

// Function to clear the console
const clearConsole = () => {
  console.log("\x1Bc");
};

const displayTitle = () => {
  console.log(
    chalk.blue(figlet.textSync("Shrugman", { horizontalLayout: "full" }))
  );
};

const displayDescription = () => {
  console.log(
    chalk.magenta(`
Welcome to the Shrugman Game! Shrugman is a fun and interactive command-line game where players attempt to guess a hidden phrase one letter at a time. Inspired by the classic game of Hangman, Shrugman offers a modern twist with colorful outputs and an enhanced user interface.
    `)
  );
};

const startGamePrompt = async () => {
  clearConsole();
  displayTitle();
  displayDescription();
  const { start } = await inquirer.prompt([
    {
      type: "confirm",
      name: "start",
      message: "Press Enter to start the game or Ctrl+C to exit.",
      default: true,
    },
  ]);
  return start;
};

const selectCategory = async () => {
  const categoryNames = Object.keys(categories);
  const { category } = await inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "Select a category:",
      choices: [...categoryNames, "Exit"],
    },
  ]);
  return category;
};

const playGame = async (category) => {
  const phrases = categories[category];
  const secretPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  const game = new ShrugmanGame(secretPhrase);

  while (!game.isGameOver()) {
    clearConsole();
    displayTitle();
    console.log(chalk.yellow(game.getCurrentState()));

    const { guess } = await inquirer.prompt([
      {
        type: "input",
        name: "guess",
        message:
          'Guess a letter, type "Back" to return to category selection, or "Exit" to quit:',
      },
    ]);

    if (guess.toLowerCase() === "back") {
      return { result: "back" };
    }
    if (guess.toLowerCase() === "exit") {
      return { result: "exit" };
    }

    const result = game.makeGuess(guess);

    if (!result.success) {
      console.log(chalk.red(result.message));
    } else {
      console.log(chalk.green(result.message));
    }

    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: "Press Enter to continue...",
      },
    ]);
  }

  clearConsole();
  displayTitle();
  if (game.didWin()) {
    console.log(
      chalk.green(`Congratulations! You guessed the phrase: ${secretPhrase}`)
    );
    return { result: "win", phrase: secretPhrase };
  } else {
    console.log(
      chalk.red(
        `Sorry! You ran out of attempts. The phrase was: ${secretPhrase}`
      )
    );
    return { result: "loss", phrase: secretPhrase };
  }
};

const main = async () => {
  clearConsole();
  await startGamePrompt(); // Show start prompt

  let playAgain = true;
  const gameHistory = []; // Array to keep track of game results

  while (playAgain) {
    while (true) {
      const category = await selectCategory();

      if (category === "Exit") {
        console.log(chalk.blue("Thank you for playing!"));
        break; // Exit the program
      }

      const { result, phrase } = await playGame(category);

      if (result === "back") {
        break; // Go back to category selection
      }
      if (result === "exit") {
        console.log(chalk.blue("Thank you for playing!"));
        playAgain = false;
        break; // Exit the program
      }

      gameHistory.push({ phrase, result }); // Record game result
    }

    // Print game history
    if (gameHistory.length > 0) {
      console.log("\nGame history:");
      gameHistory.forEach((game, index) => {
        console.log(`${index + 1}. ${game.phrase} - ${game.result}`);
      });
    }

    if (playAgain) {
      const { playAgain: playAgainResponse } = await inquirer.prompt([
        {
          type: "confirm",
          name: "playAgain",
          message: "Do you want to play another round?",
        },
      ]);
      playAgain = playAgainResponse;
    }
  }

  console.log("Thank you for playing!");
};

main();
