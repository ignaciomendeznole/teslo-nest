import { v4 as uuid } from 'uuid';

/* eslint-disable @typescript-eslint/ban-types */

/**
 *
 * @param req Express request
 * @param file File provided
 * @param callback Function that gets executed after validating the file. Second argument is the new name of the file.
 * @returns `callback execution`
 */
export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];

  const fileName = `${uuid()}.${fileExtension}`;

  return callback(null, fileName);
};
