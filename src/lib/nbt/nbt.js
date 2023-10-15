import { parse } from 'prismarine-nbt';
import { Buffer } from 'buffer';
console.log(parse);
// console.log(Buffer);

export default async function parseSchematic(readerResult) {
	const parsed = await parse(Buffer.from(readerResult));
	console.log(parsed);
}
