import {cp, fs} from './utils';
import {DoctorCheck} from './doctor';
import {ok, nok} from './utils';
import {system} from 'appium-support';
import path from 'path';
import EOL from 'os';
 let checks = [];

// Check PATH binaries

class BinaryIsInPathCheck extends DoctorCheck {
  constructor (binary) {
    super();
    this.binary = binary;
  }

  async diagnose () {
    let nok = nok.bind(null, `${this.binary} is MISSING in path!`);
    let resolvedPath;
    try {
      let cmd = system.isWindows ? "where " + this.binaryName : "which " + this.binaryName;
      let [stdout] =  await cp.exec(cmd, { maxBuffer: 524288 });
      resolvedPath = system.isWindows ? stdout.split(EOL)[0] : stdout.replace(EOL, "");
    } catch (err) {
      return nok();
    }
    return await fs.existsSync(resolvedPath) ? ok(`${this.binary} was found at ${resolvedPath}`) :
      nok();
  }
}

checks.push(new BinaryIsInPathCheck(system.isWindows ? "mvn.bat" : "mvn"));
checks.push(new BinaryIsInPathCheck(system.isWindows ? "ant.bat" : "ant"));
checks.push(new BinaryIsInPathCheck(system.isWindows ? "adb.exe" : "adb"));

// Check Android SDKs

class AndroidSdkExists extends DoctorCheck {
  constructor (sdk) {
    super();
    this.sdk = sdk;
  }

  async diagnose () {
    if (typeof process.env.ANDROID_HOME === 'undefined') {
      return nok(`${this.sdk} could not be found because ANDROID_HOME is not set.`);
    }
    let sdkPath = path.resolve(process.env.ANDROID_HOME, path.join("platforms", this.sdk));
    return await fs.exists(sdkPath) ? ok(`${this.sdk} could exists at ${sdkPath}`) :
      nok(`${this.sdk} could NOT be found at ${sdkPath}`);
  }
}

checks.push(new AndroidSdkExists('android-16'));
checks.push(new AndroidSdkExists('android-19'));

export default checks;