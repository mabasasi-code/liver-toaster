import readline from 'readline'

// ref: https://note.kiriukun.com/entry/20200313-interactive-cli-example-with-nodejs
export default class Terminal {
  public static async prompt(msg: string) {
    console.log(msg)
    const answer = await this.question('> ')
    return answer.trim()
  }

  public static async question(question: string): Promise<string> {
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    return new Promise((resolve) => {
      readlineInterface.question(question, (answer) => {
        resolve(answer);
        readlineInterface.close();
      })
    })
  }
}
