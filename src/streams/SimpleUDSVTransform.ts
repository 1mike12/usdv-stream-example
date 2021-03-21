import {Transform, TransformCallback} from "stream";
import {inferSchema, initParser, Parser} from "udsv";

/**
 *  simple transform stream that uses the uDSV parser
 *  and relies on the built in inferSchema function
 *  to infer schema from the first chunk
 */
export class SimpleUDSVTransform extends Transform {
  private parser?: Parser

  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback) {
    const strChunk = chunk.toString();
    if (this.parser === undefined) {
      this.parser = initParser(inferSchema(strChunk));
    }
    this.parser.chunk<string[]>(strChunk, this.parser.stringArrs, (parsedData) => {
      this.push(parsedData);
      callback()
    });
  }
}
