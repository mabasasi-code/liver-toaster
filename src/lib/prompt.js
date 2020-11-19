import readline from 'readline'

// ref: https://note.kiriukun.com/entry/20200313-interactive-cli-example-with-nodejs

/**
 * ユーザーに値を入力させる
 */
const prompt = async (msg) => {
  console.log(msg)
  const answer = await question('> ')
  return answer.trim()
}

/**
 * 標準入力を取得する
 */
const question = (question) => {
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

export default prompt
