import {Transform, TransformCallback} from "stream";
import {inferSchema, initParser, Parser} from "udsv";

/**
 * Fixed transform stream that uses the uDSV parser
 * Addresses the callback timing issue in the original implementation
 */
export class SimpleUDSVTransform extends Transform {
  private parser?: Parser

  constructor() {
    super({objectMode: true}); // Enable object mode to handle arrays
  }

  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback) {
    const strChunk = chunk.toString();
    if (this.parser === undefined) {
      this.parser = initParser(inferSchema(strChunk));
    }

    // Set up the parser callback to push data, but don't wait for it
    this.parser.chunk<string[]>(strChunk, this.parser.stringArrs, (parsedData) => {
      this.push(parsedData);
    });

    // Immediately signal that we're ready for the next chunk
    callback();
  }

  _flush(callback: TransformCallback) {
    // Process the final chunk before ending
    this.parser?.end();
    callback();
  }
}
