const copySimpleFilesToDist = require('./copySimpleFilesToDist');
const restorePlugins = require('./restorePlugins');
const webpackCompile = require('./webpackCompile');
const clean = require('./clean');

async function build() {
    console.log(`*** start - release build ***`);
    console.log('start - clean');
    await clean();
    console.log('complete - clean');

    console.log('start - restore plugins');
    await restorePlugins('debug');
    console.log('complete - restore plugins');

    console.log('start - copy simple files');
    await copySimpleFilesToDist();
    console.log('complete - copy simple files');

    console.log('start - webpack compile');
    await webpackCompile();
    console.log('complete - webpack compile');
    console.log(`*** complete - release build ***`);
}

build();