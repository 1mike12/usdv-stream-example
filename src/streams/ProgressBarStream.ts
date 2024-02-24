import {Transform, TransformCallback, TransformOptions} from "stream";
import {ProgressBar} from "../helper/ProgressBar";

/**
 * draws a progress bar in the console
 * will sum up the total bytes passed through and use that to calculate the progress
 * does nothing to the data and just passes it on
 */
export class ProgressBarStream extends Transform {
  private current = 0;
  private progressBar: ProgressBar;

  constructor(totalBytes: number, options?: TransformOptions) {
    super(options);
    this.progressBar = new ProgressBar(30, totalBytes)
  }

  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback) {
    this.current += chunk.length;
    this.progressBar.update(this.current);
    this.push(chunk);
    callback();
  }

  _flush(callback: TransformCallback) {
    this.progressBar.finish();
    callback()
  }
}
