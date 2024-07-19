// main.js
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import ShrugmanGame from "./game.js";
import categories from "./categories.js";

// Simple function to clear the console
const clearConsole = () => {
  console.log("\x1Bc");
};

const gameHistory = [];

const displayTitle = () => {
  console.log(
    chalk.blue(figlet.textSync("Shrugman", { horizontalLayout: "full" }))
  );
};

const selectCategory = async () => {
  const categoryNames = Object.keys(categories);
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "Select a category:",
      choices: [...categoryNames, "Exit"],
    },
  ]);
  return answers.category;
};

const playGame = async (category) => {
  const phrases = categories[category];
  const secretPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  const game = new ShrugmanGame(secretPhrase);

  while (!game.isGameOver()) {
    clearConsole();
    displayTitle();
    console.log(chalk.yellow(game.getCurrentState()));

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "guess",
        message:
          'Guess a letter, type "Back" to return to category selection, or "Exit" to quit:',
      },
    ]);
    const guess = answers.guess;

    if (guess.toLowerCase() === "back") {
      return "back";
    }
    if (guess.toLowerCase() === "exit") {
      return "exit";
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
  } else {
    console.log(
      chalk.red(
        `Sorry! You ran out of attempts. The phrase was: ${secretPhrase}`
      )
    );
  }

  gameHistory.push(`${secretPhrase} - ${game.didWin() ? "win" : "loss"}`);
};

const main = async () => {
  clearConsole();
  displayTitle();
  let playAgain = true;
  while (playAgain) {
    const category = await selectCategory();

    if (category === "Exit") {
      console.log(chalk.blue("Thank you for playing!"));
      break;
    }

    while (true) {
      const result = await playGame(category);
      if (result === "back") {
        break;
      }
      if (result === "exit") {
        playAgain = false;
        break;
      }
    }

    if (!playAgain) break;

    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "playAgain",
        message: "Do you want to play another round?",
      },
    ]);
    playAgain = answers.playAgain;
  }

  console.log("Game history:");
  gameHistory.forEach((record) => console.log(record));
};

main();
