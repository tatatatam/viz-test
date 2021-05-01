const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { get } = require('lodash/fp');
const getBuildableComponents = () => {
  const components = [];
  const lastComponentIdx = Object.keys(process.env)
      .filter((key) => key.startsWith('npm_package_dsccViz_components_'))
      .map((s) => s.replace('npm_package_dsccViz_components_', ''))
      .map((a) => parseInt(a, 10))
      .reduce((a, b) => (a > b ? a : b), 0);
  // Check for vizpack configuration
  for (let idx = 0; idx <= lastComponentIdx; idx++) {
    const jsonFile = "index.json"//process.env[`npm_package_dsccViz_components_${idx}_jsonFile`];
    /*if (!jsonFile) {
        throw util_1.invalidVizConfig(`components[${idx}].jsonFile`);
    }*/
    const cssFile = "index.css"//process.env[`npm_package_dsccViz_components_${idx}_cssFile`];
    // Require either jsFile or tsFile
    const jsFile = "index.js"//process.env[`npm_package_dsccViz_components_${idx}_jsFile`];
    const tsFile = process.env[`npm_package_dsccViz_components_${idx}_tsFile`];
    if (jsFile === undefined && tsFile === undefined) {
        throw util_1.invalidVizConfig(`components[${idx}].jsFile`);
    }
    components.push({
        jsonFile,
        cssFile,
        jsFile,
        tsFile,
    });
}
  return components;
};

const components = getBuildableComponents();
const componentIndexToBuild = Number(process.env.WORKING_COMPONENT_INDEX) || 0;
const component = components[componentIndexToBuild];
console.log(null)
console.log(`Building ${ JSON.stringify(component)} ...`);

const cssFilePath = path.resolve(__dirname, 'src', component.cssFile || '');
const jsFilePath = path.resolve(__dirname, 'src', component.jsFile || '');

const plugins = [
  // Add DSCC_IS_LOCAL definition
  new webpack.DefinePlugin({
    DSCC_IS_LOCAL: 'true',
  }),
];

let body = '<script src="main.js"></script>';
if (fs.existsSync(cssFilePath)) {
  body = body + '\n<link rel="stylesheet" href="index.css">';
  plugins.push(new CopyWebpackPlugin([{from: cssFilePath, to: '.'}]));
}
const iframeHTML = `
<!doctype html>
<html><body>
${body}
</body></html>
`;

fs.writeFileSync(path.resolve(__dirname, 'dist', 'vizframe.html'), iframeHTML);

module.exports = [
  {
    mode: 'development',
    entry: jsFilePath,
    devServer: {
      contentBase: './dist',
    },
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: plugins,
  },
];
