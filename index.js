const path = require('path');
const fs = require('fs-extra');
const readlineSync = require('readline-sync');
const { compress } = require('compress-images/promise');
const Assembler = require('apng-assembler');

const INPUT_DIR = 'input';
const OUTPUT_ROOT_PATH = 'output/';

comparess = async (inputDir, outputPath) => {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
  await compress({
  source: `${inputDir}/*.png`,
  destination: `${outputPath}/`,
  enginesSetup: {
      png: { engine: 'pngquant', command: ['--quality=20-50', '-o']},
  }
  });
};

generateApng = async (outputPath, fileList, loopCount, fps) => {
  const outputPathAnimationPath = `${outputPath}/apng/`;
  if (!fs.existsSync(outputPathAnimationPath)) {
  fs.mkdirSync(outputPathAnimationPath);
  }
  try {
    Assembler.assembleSync(
        `${outputPath}/*.png`,
        `${outputPathAnimationPath}${fileList[0].replace(/(.*?)_[0-9].+?(\.png)/, '$1$2')}`,
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
  let inputDir = INPUT_DIR;
  let outputName = '';
  let outputPath = OUTPUT_ROOT_PATH;
  let fileList = [];
  let isDoAll = false;
  let loopCount = 1;
  let fps = 24;

  inputDir = readlineSync.question(`入力元のディレクトリパスを入力してください (default: ${INPUT_DIR}): `) || INPUT_DIR;
  if (!fs.existsSync(inputDir)) {
    console.log('ディレクトリが存在しません');
    console.log('処理を終了します。');
    return;
  }
  outputName = inputDir.replace(/.+(\/.+$)/, '$1');
  outputPath = path.resolve(outputPath + outputName);

  fs.readdir(inputDir, async (err, files) => {
    if (err) throw err;
    fileList = files.filter((file) => {
        return fs.statSync(`${inputDir}/${file}`).isFile() && /.*\.png$/.test(file);
    });
    console.log(fileList);
    console.log(`出力先; ${outputPath}`);
    console.log('ファイルは末尾が小さい順でアニメーション化されます (e,g: hoge000.png -> hoge002.png -> hoge012)');
    loopCount = readlineSync.question(`loop数を入力してください (default: ${loopCount}): `) || loopCount;
    fps = readlineSync.question(`FPS値を入力してください (default: ${fps}): `) || fps;

    isDoAll = /y/i.test(readlineSync.question(`処理を実行しますか? (loop数: ${loopCount}, fps: ${fps})  Y/N: `));

    if(isDoAll) {
      if (!fs.existsSync(OUTPUT_ROOT_PATH)) {
        fs.mkdirSync(OUTPUT_ROOT_PATH);
      }

      await comparess(inputDir, outputPath);
      await generateApng(outputPath, fileList, loopCount, fps);
      console.log('処理が完了しました。');
    } else {
      console.log('処理を終了します。');
    }
  });
}

main();
