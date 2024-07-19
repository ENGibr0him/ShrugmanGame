// game.js
class ShrugmanGame {
  constructor(secretPhrase) {
    this.secretPhrase = secretPhrase.toLowerCase();
    this.guesses = new Set();
    this.maxAttempts = 10;
    this.shrugman = "¯_(:/)_/¯";
    this.attempts = 0;
    this.currentMaskedPhrase = this.maskPhrase();
  }

  maskPhrase() {
    return this.secretPhrase.replace(/[^ ]/g, "_");
  }

  makeGuess(letter) {
    letter = letter.toLowerCase();
    if (this.guesses.has(letter)) {
      return {
        success: false,
        message: "You already guessed that letter. Try again.",
      };
    }

    this.guesses.add(letter);

    if (this.secretPhrase.includes(letter)) {
      let newMaskedPhrase = "";
      for (let i = 0; i < this.secretPhrase.length; i++) {
        newMaskedPhrase +=
          this.secretPhrase[i] === letter
            ? letter
            : this.currentMaskedPhrase[i];
      }
      this.currentMaskedPhrase = newMaskedPhrase;
      return { success: true, message: "Correct guess!" };
    } else {
      this.attempts++;
      return { success: false, message: "Wrong guess!" };
    }
  }

  isGameOver() {
    return (
      this.attempts >= this.maxAttempts ||
      !this.currentMaskedPhrase.includes("_")
    );
  }

  didWin() {
    return !this.currentMaskedPhrase.includes("_");
  }

  getCurrentState() {
    const shrugmanProgress = this.shrugman.substring(0, this.attempts);
    return `${this.currentMaskedPhrase}\n${shrugmanProgress}`;
  }
}

export default ShrugmanGame;
