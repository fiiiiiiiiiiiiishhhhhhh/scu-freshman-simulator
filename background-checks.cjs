const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const story=require('./dist/story-data.js'),backgrounds=require('./dist/scene-backgrounds.js');
assert.equal(Object.keys(backgrounds).length,story.nodes.length);
const hashes=new Set();
for(const node of story.nodes){
 const scene=backgrounds[node.id];assert(scene,`Scene ${node.id} missing artwork`);
 const p=path.resolve('dist',scene.file);assert(p.startsWith(path.resolve('dist/assets/scenes')+path.sep));
 const png=fs.readFileSync(p);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert(width>height&&width>=1000);
 assert.deepEqual(scene.size,[width,height]);
 const hash=crypto.createHash('sha256').update(png).digest('hex');assert(!hashes.has(hash),`Duplicate scene ${node.id}`);hashes.add(hash);
}
console.log(`PASS: ${hashes.size} unique PNG scene backgrounds; every story scene mapped; valid sizes and asset paths.`);
