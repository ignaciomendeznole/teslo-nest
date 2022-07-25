/* eslint-disable @typescript-eslint/ban-types */

/**
 *
 * @param req Express request
 * @param file File provided
 * @param callback Function that gets executed after validating the file. If second argument is `true`, passes, else it rejects
 * @returns `callback execution`
 */
export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const validExtensions = ['jpg', 'png', 'jpeg', 'gif'];

  const fileExtension = file.mimetype.split('/')[1];

  if (validExtensions.includes(fileExtension)) return callback(null, true);

  return callback(null, false);
};
