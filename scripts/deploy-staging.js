// @ts-check
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mime = require('mime');
const aws = require('aws-sdk');
const minimatch = require('minimatch');
const { createHash } = require('crypto');
const s3 = new aws.S3({ region: 'us-west-1' });
const cloudFront = new aws.CloudFront();
const bucketName = 'blog.andrewbran.ch';
const stagingDistributionId = 'EBVHVDJ055S6S';
const cacheControlMap = {
  '**/**.html': 'public, max-age=0, must-revalidate',
  'static/**': 'public, max-age=31536000, immutable',
  '**/**/!(sw).js': 'public, max-age=31536000, immutable',
  '**/**.css': 'public, max-age=31536000, immutable',
  'sw.js': 'public, max-age=0, must-revalidate',
};

if (!process.env.GITHUB_SHA) {
  throw new Error(`Environment variable GITHUB_SHA not set. Aborting.`);
}

(async () => {
  try {
    console.log('Reading deployment manifest...');
    const { $response } = await s3.getObject({
      Bucket: bucketName,
      Key: 'deployments.json',
    }).promise();

    if ($response.error || !($response.data && $response.data.Body)) {
      throw $response.error || new Error('Could not read deployment manifest. Aborting.');
    }

    const deployments = JSON.parse($response.data.Body.toString());
    const deployment = {
      [process.env.GITHUB_SHA]: {
        uploadedAt: new Date().toUTCString(),
      },
    };

    console.log(`Uploading revision ${process.env.GITHUB_SHA}`);
    const publicDir = path.resolve(__dirname, '../public');
    const files = glob.sync('**', { cwd: publicDir, nodir: true, ignore: '*.map' });
    for (const file of files) {
      const fullPath = path.join(publicDir, file);
      const cacheGroup = Object.keys(cacheControlMap).find(pattern => minimatch(file, pattern));
      console.log(`Uploading ${file}...`);
      await withRetries(() => s3.upload({
        Bucket: bucketName,
        Key: path.join(`${process.env.GITHUB_SHA}`, file),
        Body: fs.createReadStream(fullPath),
        ContentType: mime.getType(file),
        ContentMD5: createHash('md5').update(fs.readFileSync(fullPath)).digest('base64'),
        ACL: 'public-read',
        ...(cacheGroup ? { CacheControl: cacheControlMap[cacheGroup] } : null),
      }).promise());
    }

    console.log('\nUpdating staging CloudFront path...');
    const { Distribution, ETag } = await cloudFront.getDistribution({ Id: stagingDistributionId }).promise();
    const result = await cloudFront.updateDistribution({
      Id: stagingDistributionId,
      IfMatch: ETag,
      DistributionConfig: {
        ...Distribution.DistributionConfig,
        Origins: {
          ...Distribution.DistributionConfig.Origins,
          Items: [{
            ...Distribution.DistributionConfig.Origins.Items[0],
            OriginPath: `/${process.env.GITHUB_SHA}`,
          }],
        },
      },
    }).promise();
    console.log(`Updated origin path to ${result.Distribution.DistributionConfig.Origins.Items[0].OriginPath}`);

    console.log('\nUpdating deployment manifest...');
    await s3.upload({
      Bucket: bucketName,
      Key: 'deployments.json',
      Body: Buffer.from(JSON.stringify({
        stagingRevision: process.env.GITHUB_SHA,
        ...deployments,
        revisions: {
          ...deployments.revisions,
          ...deployment,
        }
      }, null, 2)),
    }).promise();

    console.log('Done!');
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
})();

/**
 * @param {(...args: any[]) => Promise<any>} fn 
 * @param {number} retries 
 */
async function withRetries(fn, retries = 2) {
  try {
    const result = await fn();
    return result;
  } catch (err) {
    console.error(err.message);
    if (!retries) {
      throw err;
    }

    console.log('Retrying...');
    return withRetries(fn, retries - 1);
  }
}