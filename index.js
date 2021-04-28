const shell = require('shell');
const { compress } = require('compress-images/promise');
const Assembler = require('apng-assembler');
const fs = require('fs-extra');

const INPUT_DIR = 'input';
const INPUT_PATH = `${INPUT_DIR}/**/*.png`;
const OUTPUT_PATH = 'output/';
const OUTPUT_ANIMETION_PATH = `${OUTPUT_PATH}/apng/`;
let fileList = [];

main = async () => {
  fs.removeSync(OUTPUT_PATH);

  await fs.readdir(INPUT_DIR, (err, files) => {
    if (err) throw err;
    fileList = files.filter((file) => {
        return fs.statSync(`${INPUT_DIR}/${file}`).isFile() && /.*\.png$/.test(file);
    })
    console.log(fileList);
  });

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
  
  if (!fs.existsSync(OUTPUT_ANIMETION_PATH )) {
    fs.mkdirSync(OUTPUT_ANIMETION_PATH );
  }
  try {
    Assembler.assembleSync(
        `${OUTPUT_PATH}*.png`,
        `${OUTPUT_ANIMETION_PATH }${fileList[0].replace(/(.*?)_[0-9](\.png)/, '$1$2')}`,
        {
            loopCount: 0,
            frameDelay: 100,
            compression: Assembler.COMPRESS_7ZIP
        }
    );
  } catch (e) {
    console.error(`Failed to assemble: ${e.message}`);
    console.error(`stdout: ${e.stdout}`);
    console.error(`stderr: ${e.stderr}`);
  }
}

main();
