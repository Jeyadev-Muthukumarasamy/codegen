const { NetlifyAPI } = require('@netlify/open-api');
const netlify = new NetlifyAPI(process.env.NETLIFY_AUTH_TOKEN);

const deployToNetlify = async (req, res) => {
  try {
    const { code, userId, projectName } = req.body;

    if (!userId || !projectName) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId and projectName are required' 
      });
    }

    // Create a unique site name for each user project
    const siteName = `${userId}-${projectName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // First, check if a site already exists for this user project
    let site;
    try {
      const sites = await netlify.listSites();
      site = sites.find(s => s.name === siteName);
    } catch (error) {
      console.error('Error checking existing sites:', error);
    }

    // If no site exists, create one
    if (!site) {
      site = await netlify.createSite({
        name: siteName,
        custom_domain: `${siteName}.netlify.app`
      });
    }

    // Create the deployment
    const deployment = await netlify.createDeployment({
      site_id: site.id,
      files: {
        'index.html': Buffer.from(code).toString('base64'),
      },
      // You might want to make this configurable
      draft: false,
    });

    // Store deployment info in your database (implement this based on your DB choice)
    await saveDeploymentInfo({
      userId,
      projectName,
      siteId: site.id,
      deploymentId: deployment.id,
      deployUrl: deployment.deploy_ssl_url,
      timestamp: new Date(),
    });

    res.status(200).json({
      message: 'Deployment successful',
      deployUrl: deployment.deploy_ssl_url,
      siteName: site.name,
      siteUrl: site.ssl_url || site.url,
    });

  } catch (error) {
    console.error('Error in deployment:', error);
    res.status(500).json({ 
      error: 'Deployment failed',
      details: error.message 
    });
  }
};

// Database storage function - implement this based on your database choice
async function saveDeploymentInfo(deploymentData) {
  // Example implementation (replace with your actual database code):
  // await DeploymentModel.create(deploymentData);
  console.log('Saving deployment info:', deploymentData);
}

module.exports = { deployToNetlify };