import * as fs from "fs";
import path from "path";
import {ProgressBarStream} from "./src/streams/ProgressBarStream";
import {inferSchema, initParser, Parser} from "udsv";
import {pipeline} from "stream";
import {SimpleUDSVTransform} from "./src/streams/SimpleUDSVTransform";
import {Writable} from "node:stream";

const filePath = path.join(__dirname, "/downloads/sample.csv")

const streamedCSV = async () => {
  const fileSize = await fs.promises.stat(filePath).then((stats) => stats.size)
  const stream = fs.createReadStream(filePath).pipe(new ProgressBarStream(fileSize))

  let parser: Parser;
  for await (const buffer of stream) {
    const strChunk = buffer.toString();
    parser ??= initParser(inferSchema(strChunk));
    parser.chunk<string[]>(strChunk, parser.typedArrs, (batch) => {
      const x = batch // reaches here fine
    });
  }
  parser!.end();
}

const transform = async () => {
  const fileSize = await fs.promises.stat(filePath).then((stats) => stats.size)
  return new Promise<void>((resolve, reject) => {
    pipeline(
      fs.createReadStream(filePath),
      new ProgressBarStream(fileSize),
      new SimpleUDSVTransform(),
      new Writable({
        write(chunk, encoding, callback) {
          const x = chunk // never reaches here
          callback()
        }
      }),
      (err) => {
        if (err) {
          reject(err) // never reaches here
        } else {
          resolve() // never reaches here
        }
      }
    )
  })
}
(async () => {
  await streamedCSV()
  await transform()
})()

