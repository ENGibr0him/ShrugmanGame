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
  console.log("\n\n"); // Add break between the logo and content
};

const displayDescription = (language) => {
  const description =
    language === "عربي"
      ? `
مرحبا بكم في لعبة شرجمان! شرجمان هي لعبة تفاعلية ممتعة يتم فيها محاولة تخمين عبارة مخفية حرفاً حرفاً. مستوحاة من اللعبة الكلاسيكية Hangman، تقدم شرجمان لمسة حديثة مع مخرجات ملونة وواجهة مستخدم محسنة.
    `
      : `
Welcome to the Shrugman Game! Shrugman is a fun and interactive command-line game where players attempt to guess a hidden phrase one letter at a time. Inspired by the classic game of Hangman, Shrugman offers a modern twist with colorful outputs and an enhanced user interface.
    `;
  console.log(chalk.magenta(description));
};

const startGamePrompt = (language) => {
  clearConsole();
  displayTitle();
  displayDescription(language);
  const message =
    language === "عربي"
      ? "اضغط على Enter لبدء اللعبة أو Ctrl+C للخروج."
      : "Press Enter to start the game or Ctrl+C to exit.";
  return inquirer
    .prompt([
      {
        type: "confirm",
        name: "start",
        message,
        default: true,
      },
    ])
    .then((answers) => answers.start);
};

const selectLanguage = () => {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "language",
        message: "Select a language / اختر لغة:",
        choices: ["English", "عربي"],
      },
    ])
    .then((answers) => answers.language);
};

const selectCategory = (language) => {
  const categoryNames = Object.keys(categories);
  const message = language === "عربي" ? "اختر فئة:" : "Select a category:";
  const exitOption = language === "عربي" ? "خروج" : "Exit";
  return inquirer
    .prompt([
      {
        type: "list",
        name: "category",
        message,
        choices: [...categoryNames, exitOption],
      },
    ])
    .then((answers) => answers.category);
};

const playGame = (category, language) => {
  const phrases = categories[category];
  const secretPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  const game = new ShrugmanGame(secretPhrase);

  const gameLoop = () => {
    if (game.isGameOver()) {
      clearConsole();
      displayTitle();
      if (game.didWin()) {
        const winMessage =
          language === "عربي"
            ? `تهانينا! لقد خمنت العبارة: ${secretPhrase}`
            : `Congratulations! You guessed the phrase: ${secretPhrase}`;
        console.log(chalk.green(winMessage));
        return Promise.resolve({ result: "win", phrase: secretPhrase });
      } else {
        const lossMessage =
          language === "عربي"
            ? `عذراً! لقد نفدت المحاولات. كانت العبارة: ${secretPhrase}`
            : `Sorry! You ran out of attempts. The phrase was: ${secretPhrase}`;
        console.log(chalk.red(lossMessage));
        return Promise.resolve({ result: "loss", phrase: secretPhrase });
      }
    }

    clearConsole();
    displayTitle();
    console.log(chalk.yellow(game.getCurrentState()));

    const guessMessage =
      language === "عربي"
        ? 'خمن حرفاً، اكتب "عودة" للعودة إلى اختيار الفئة، أو "خروج" للخروج:'
        : 'Guess a letter, type "Back" to return to category selection, or "Exit" to quit:';
    return inquirer
      .prompt([
        {
          type: "input",
          name: "guess",
          message: guessMessage,
        },
      ])
      .then((answers) => {
        const guess = answers.guess;

        if (guess.toLowerCase() === "back" || guess === "عودة") {
          return { result: "back" };
        }
        if (guess.toLowerCase() === "exit" || guess === "خروج") {
          return { result: "exit" };
        }

        const result = game.makeGuess(guess);

        if (!result.success) {
          console.log(chalk.red(result.message));
        } else {
          console.log(chalk.green(result.message));
        }

        const continueMessage =
          language === "عربي"
            ? "اضغط على Enter للاستمرار..."
            : "Press Enter to continue...";
        return inquirer
          .prompt([
            {
              type: "input",
              name: "continue",
              message: continueMessage,
            },
          ])
          .then(gameLoop);
      });
  };

  return gameLoop();
};

const main = () => {
  clearConsole();
  displayTitle(); // Display the logo first
  selectLanguage().then((language) => {
    startGamePrompt(language).then(() => {
      let playAgain = true;
      const gameHistory = []; // Array to keep track of game results

      const gameFlow = () => {
        if (!playAgain) {
          const thankYouMessage =
            language === "عربي" ? "شكراً للعب!" : "Thank you for playing!";
          console.log(thankYouMessage);
          return;
        }

        selectCategory(language).then((category) => {
          if (category === "Exit" || category === "خروج") {
            const exitMessage =
              language === "عربي" ? "شكراً للعب!" : "Thank you for playing!";
            console.log(chalk.blue(exitMessage));
            return;
          }

          playGame(category, language).then(({ result, phrase }) => {
            if (result === "back") {
              gameFlow();
            } else if (result === "exit") {
              const exitMessage =
                language === "عربي" ? "شكراً للعب!" : "Thank you for playing!";
              console.log(chalk.blue(exitMessage));
            } else {
              gameHistory.push({ phrase, result }); // Record game result

              // Print game history
              if (gameHistory.length > 0) {
                const historyMessage =
                  language === "عربي" ? "\nتاريخ اللعبة:" : "\nGame history:";
                console.log(historyMessage);
                gameHistory.forEach((game, index) => {
                  console.log(`${index + 1}. ${game.phrase} - ${game.result}`);
                });
              }

              const playAgainMessage =
                language === "عربي"
                  ? "هل تريد لعب جولة أخرى؟"
                  : "Do you want to play another round?";
              inquirer
                .prompt([
                  {
                    type: "confirm",
                    name: "playAgain",
                    message: playAgainMessage,
                  },
                ])
                .then((answers) => {
                  playAgain = answers.playAgain;
                  gameFlow();
                });
            }
          });
        });
      };

      gameFlow();
    });
  });
};

main();
