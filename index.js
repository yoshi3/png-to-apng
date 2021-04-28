const readlineSync = require('readline-sync');
const { compress } = require('compress-images/promise');
const Assembler = require('apng-assembler');
const fs = require('fs-extra');

const INPUT_DIR = 'input';
const INPUT_PATH = `${INPUT_DIR}/**/*.png`;
const OUTPUT_PATH = 'output/';
const OUTPUT_ANIMETION_PATH = `${OUTPUT_PATH}/apng/`;

comparess = async () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH);
  }
  await compress({
  source: INPUT_PATH,
  destination: OUTPUT_PATH,
  enginesSetup: {
      png: { engine: 'pngquant', command: ['--quality=20-50', '-o']},
  }
  });
};

generateApng = async (fileList, loopCount, fps) => {
  if (!fs.existsSync(OUTPUT_ANIMETION_PATH )) {
  fs.mkdirSync(OUTPUT_ANIMETION_PATH );
  }
  try {
  Assembler.assembleSync(
      `${OUTPUT_PATH}*.png`,
      `${OUTPUT_ANIMETION_PATH }${fileList[0].replace(/(.*?)_[0-9](\.png)/, '$1$2')}`,
      {
          loopCount,
          frameDelay: 1000/fps,
          compression: Assembler.COMPRESS_7ZIP
      }
  );
  } catch (e) {
    console.error(`Failed to assemble: ${e.message}`);
    console.error(`stdout: ${e.stdout}`);
    console.error(`stderr: ${e.stderr}`);
  }
};

main = async () => {
  let areCorrectFileNames = false;
  let fileList = [];
  let isDoAll = false;
  let loopCount = 0;
  let fps = 10;

  fs.removeSync(OUTPUT_PATH);

  fs.readdir(INPUT_DIR, async (err, files) => {
    if (err) throw err;
    fileList = files.filter((file) => {
        return fs.statSync(`${INPUT_DIR}/${file}`).isFile() && /.*\.png$/.test(file);
    })
    console.log(fileList);
    areCorrectFileNames = /y/i.test(readlineSync.question('ファイルは name_0から始まる連番.png となっていますか？ (e,g: hoge_0.png, hoge_2.png)  Y/N: '));
    if (!areCorrectFileNames) {
      console.log('処理を終了します。');
      return;
    }

    loopCount = readlineSync.question('loop数を入力してください (default: 0): ') || loopCount;
    fps = readlineSync.question('FPS値を入力してください (default: 10): ') || fps;

    isDoAll = /y/i.test(readlineSync.question(`処理を実行しますか? (loop数: ${loopCount}, fps: ${fps})  Y/N: `));

    if(isDoAll) {
      await comparess();
      await generateApng(fileList, loopCount, fps);
    } else {
      console.log('処理を終了します。');
    }
  });
}

main();
