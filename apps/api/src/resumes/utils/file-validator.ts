import { BadRequestException } from '@nestjs/common';
import { fileTypeFromFile } from 'file-type';
import yauzl from 'yauzl';

function openZipFile(filePath: string): Promise<yauzl.ZipFile> {
  return new Promise((resolve, reject) => {
    yauzl.open(
      filePath,
      {
        lazyEntries: true,
        autoClose: true,
      },
      (error, zipFile) => {
        if (error || !zipFile) {
          reject(error ?? new Error('Unable to open DOCX file'));
          return;
        }

        resolve(zipFile);
      },
    );
  });
}

async function validateDocx(filePath: string) {
  const zip = await openZipFile(filePath);

  const requiredFiles = new Set(['[Content_Types].xml', 'word/document.xml']);

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;

      settled = true;

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };

    zip.on('entry', (entry) => {
      requiredFiles.delete(entry.fileName);

      if (requiredFiles.size === 0) {
        finish();
        zip.close();
        return;
      }

      zip.readEntry();
    });

    zip.on('end', () => {
      if (requiredFiles.size > 0) {
        finish(new BadRequestException('Invalid DOCX file!'));
      } else {
        finish();
      }
    });

    zip.on('error', () => {
      finish(new BadRequestException('Invalid DOCX file!'));
    });

    zip.readEntry();
  });
}

export async function validateResumeFile(filePath: string) {
  const fileType = await fileTypeFromFile(filePath);

  if (fileType?.mime === 'application/pdf') {
    return 'application/pdf';
  }

  if (
    fileType?.mime === 'application/zip' ||
    fileType?.mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    await validateDocx(filePath);
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  throw new BadRequestException('Invalid file content!');
}
