const debug = require('debug')('extract-zip')
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const { createWriteStream, promises: fs } = require('fs')
const getStream = require('get-stream')
const path = require('path')
const { promisify } = require('util')
const stream = require('stream')
const yauzl = require('yauzl')
const chardet = require('chardet')
var Iconv = require('iconv').Iconv

const openZip = promisify(yauzl.open)
const pipeline = promisify(stream.pipeline)

function decodeBuffer (buffer, start, end, entryUtf8Flag) {
  const analyzedBufferEncoding = chardet.analyse(buffer)
  const possibleUtf8Encoding = analyzedBufferEncoding.findIndex((guess) => guess.name === 'UTF-8')
  // If the entry might be an utf8 with more than 70% of confidence, we assume it is utf8
  // Without this condition, chardet often returns 'windows-1252' for utf8 files
  if (entryUtf8Flag || (possibleUtf8Encoding > -1 && analyzedBufferEncoding[possibleUtf8Encoding].confidence > 70)) {
    debug('decoding buffer as utf8')
    return buffer.toString('utf8', start, end)
    // If the entry is not utf8, we try to convert it to utf8 with the detected encoding
  } else if (analyzedBufferEncoding.length > 0 && analyzedBufferEncoding[0].confidence > 70) {
    debug(`analyzed encoding via chardet is ${analyzedBufferEncoding[0].name} confidence ${analyzedBufferEncoding[0].confidence} :: ${JSON.stringify(analyzedBufferEncoding)}`)
    // On MACOSX created archives doesn't contain the utf-8 encoding flag, making the classical yauzl encoding detection fail.
    // That's why we use chardet to detect the encoding and if it's not utf-8 we fallback to the yauzl default encoding.
    debug('chardet detected encoding with big confidence, convert to utf8: ', analyzedBufferEncoding[0].name)
    const converter = new Iconv(analyzedBufferEncoding[0].name, 'UTF-8//TRANSLIT//IGNORE')
    buffer = converter.convert(buffer)
    debug('converted buffer: ', buffer.toString('utf8'))
    return buffer.toString('utf8')
  } else {
    debug('decoding buffer as cp437')
    const converter = new Iconv('CP437', 'UTF-8//TRANSLIT//IGNORE')
    buffer = converter.convert(buffer)
    return buffer.toString('utf8')
  }
}

class Extractor {
  constructor (zipPath, opts) {
    this.zipPath = zipPath
    this.opts = opts
  }

  async extract () {
    debug('opening', this.zipPath, 'with opts', this.opts)

    this.zipfile = await openZip(this.zipPath, { lazyEntries: true, decodeStrings: false })
    this.canceled = false

    return new Promise((resolve, reject) => {
      this.zipfile.on('error', err => {
        this.canceled = true
        reject(err)
      })
      this.zipfile.readEntry()

      this.zipfile.on('close', () => {
        if (!this.canceled) {
          debug('zip extraction complete')
          resolve()
        }
      })

      this.zipfile.on('entry', async entry => {
        /* istanbul ignore if */
        if (this.canceled) {
          debug('skipping entry', entry.fileName, { cancelled: this.canceled })
          return
        }

        // We need to manually decode the entry name, because yauzl fail to properly decode it when passing OSX archives with
        // specials characters in it.
        const entryUtf8Flag = (entry.generalPurposeBitFlag & 0x800) !== 0
        entry.fileName = decodeBuffer(entry.fileName, 0, entry.fileNameLength, entryUtf8Flag)
        entry.comment = decodeBuffer(entry.comment, 0, entry.fileCommentLength, entryUtf8Flag)
        debug('zipfile entry', entry.fileName)

        if (entry.fileName.startsWith('__MACOSX/')) {
          this.zipfile.readEntry()
          return
        }

        const destDir = path.dirname(path.join(this.opts.dir, entry.fileName))

        try {
          await fs.mkdir(destDir, { recursive: true })

          const canonicalDestDir = await fs.realpath(destDir)
          const relativeDestDir = path.relative(this.opts.dir, canonicalDestDir)

          if (relativeDestDir.split(path.sep).includes('..')) {
            throw new Error(`Out of bound path "${canonicalDestDir}" found while processing file ${entry.fileName}`)
          }

          await this.extractEntry(entry)
          debug('finished processing', entry.fileName)
          this.zipfile.readEntry()
        } catch (err) {
          this.canceled = true
          this.zipfile.close()
          reject(err)
        }
      })
    })
  }

  async extractEntry (entry) {
    /* istanbul ignore if */
    if (this.canceled) {
      debug('skipping entry extraction', entry.fileName, { cancelled: this.canceled })
      return
    }

    if (this.opts.onEntry) {
      this.opts.onEntry(entry, this.zipfile)
    }

    const dest = path.join(this.opts.dir, entry.fileName)

    // convert external file attr int into a fs stat mode int
    const mode = (entry.externalFileAttributes >> 16) & 0xFFFF
    // check if it's a symlink or dir (using stat mode constants)
    const IFMT = 61440
    const IFDIR = 16384
    const IFLNK = 40960
    const symlink = (mode & IFMT) === IFLNK
    let isDir = (mode & IFMT) === IFDIR

    // Failsafe, borrowed from jsZip
    if (!isDir && entry.fileName.endsWith('/')) {
      isDir = true
    }

    // check for windows weird way of specifying a directory
    // https://github.com/maxogden/extract-zip/issues/13#issuecomment-154494566
    const madeBy = entry.versionMadeBy >> 8
    if (!isDir) isDir = (madeBy === 0 && entry.externalFileAttributes === 16)

    debug('extracting entry', { filename: entry.fileName, isDir: isDir, isSymlink: symlink })

    const procMode = this.getExtractedMode(mode, isDir) & 0o777

    // always ensure folders are created
    const destDir = isDir ? dest : path.dirname(dest)

    const mkdirOptions = { recursive: true }
    if (isDir) {
      mkdirOptions.mode = procMode
    }
    debug('mkdir', { dir: destDir, ...mkdirOptions })
    await fs.mkdir(destDir, mkdirOptions)
    if (isDir) return

    debug('opening read stream', dest)
    const readStream = await promisify(this.zipfile.openReadStream.bind(this.zipfile))(entry)

    if (symlink) {
      const link = await getStream(readStream)
      debug('creating symlink', link, dest)
      await fs.symlink(link, dest)
    } else {
      await pipeline(readStream, createWriteStream(dest, { mode: procMode }))
    }
  }

  getExtractedMode (entryMode, isDir) {
    let mode = entryMode
    // Set defaults, if necessary
    if (mode === 0) {
      if (isDir) {
        if (this.opts.defaultDirMode) {
          mode = parseInt(this.opts.defaultDirMode, 10)
        }

        if (!mode) {
          mode = 0o755
        }
      } else {
        if (this.opts.defaultFileMode) {
          mode = parseInt(this.opts.defaultFileMode, 10)
        }

        if (!mode) {
          mode = 0o644
        }
      }
    }

    return mode
  }
}

module.exports = async function (zipPath, opts) {
  debug('creating target directory', opts.dir)

  if (!path.isAbsolute(opts.dir)) {
    throw new Error('Target directory is expected to be absolute')
  }

  await fs.mkdir(opts.dir, { recursive: true })
  opts.dir = await fs.realpath(opts.dir)
  return new Extractor(zipPath, opts).extract()
}
