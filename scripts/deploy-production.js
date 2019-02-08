// @ts-check
const aws = require('aws-sdk');
const distributionId = process.env.DISTRIBUTION_ID;
const cloudFront = new aws.CloudFront();

if (!process.env.GITHUB_SHA || ! distributionId) {
  throw new Error(`Environment variable GITHUB_SHA not set. Aborting.`);
}

(async () => {
  try {
    console.log('\nUpdating staging CloudFront path...');
    const { Distribution, ETag } = await cloudFront.getDistribution({ Id: distributionId }).promise();
    const result = await cloudFront.updateDistribution({
      Id: distributionId,
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
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
})();
