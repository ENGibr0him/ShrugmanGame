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

const startGamePrompt = () => {
  clearConsole();
  displayTitle();
  displayDescription();
  return inquirer.prompt([
    {
      type: "confirm",
      name: "start",
      message: "Press Enter to start the game or Ctrl+C to exit.",
      default: true,
    },
  ]).then(answers => answers.start);
};

const selectCategory = () => {
  const categoryNames = Object.keys(categories);
  return inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "Select a category:",
      choices: [...categoryNames, "Exit"],
    },
  ]).then(answers => answers.category);
};

const playGame = (category) => {
  const phrases = categories[category];
  const secretPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  const game = new ShrugmanGame(secretPhrase);

  const gameLoop = () => {
    if (game.isGameOver()) {
      clearConsole();
      displayTitle();
      if (game.didWin()) {
        console.log(
          chalk.green(`Congratulations! You guessed the phrase: ${secretPhrase}`)
        );
        return Promise.resolve({ result: "win", phrase: secretPhrase });
      } else {
        console.log(
          chalk.red(`Sorry! You ran out of attempts. The phrase was: ${secretPhrase}`)
        );
        return Promise.resolve({ result: "loss", phrase: secretPhrase });
      }
    }

    clearConsole();
    displayTitle();
    console.log(chalk.yellow(game.getCurrentState()));

    return inquirer.prompt([
      {
        type: "input",
        name: "guess",
        message:
          'Guess a letter, type "Back" to return to category selection, or "Exit" to quit:',
      },
    ]).then(answers => {
      const guess = answers.guess;

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

      return inquirer.prompt([
        {
          type: "input",
          name: "continue",
          message: "Press Enter to continue...",
        },
      ]).then(gameLoop);
    });
  };

  return gameLoop();
};

const main = () => {
  clearConsole();
  startGamePrompt().then(() => {
    let playAgain = true;
    const gameHistory = []; // Array to keep track of game results

    const gameFlow = () => {
      if (!playAgain) {
        console.log("Thank you for playing!");
        return;
      }

      selectCategory().then(category => {
        if (category === "Exit") {
          console.log(chalk.blue("Thank you for playing!"));
          return;
        }

        playGame(category).then(({ result, phrase }) => {
          if (result === "back") {
            gameFlow();
          } else if (result === "exit") {
            console.log(chalk.blue("Thank you for playing!"));
          } else {
            gameHistory.push({ phrase, result }); // Record game result

            // Print game history
            if (gameHistory.length > 0) {
              console.log("\nGame history:");
              gameHistory.forEach((game, index) => {
                console.log(`${index + 1}. ${game.phrase} - ${game.result}`);
              });
            }

            inquirer.prompt([
              {
                type: "confirm",
                name: "playAgain",
                message: "Do you want to play another round?",
              },
            ]).then(answers => {
              playAgain = answers.playAgain;
              gameFlow();
            });
          }
        });
      });
    };

    gameFlow();
  });
};

main();
